"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import {
  DEMO_CALL_ENDPOINT,
  DEMO_CALL_MESSAGES,
  type DemoCallErrorCode,
  type DemoCallErrorResponse,
  type DemoCallRecord,
  type DemoCallStartResponse,
} from "@/lib/receptionist/web-demo/contract"

/**
 * One browser call to the demo receptionist, using Retell's web SDK (retell-client-js-sdk 3.x).
 *
 * States come only from real signals:
 *   permission  our own getUserMedia request, before anything is created or billed
 *   connecting  after the server has been asked for a call, until the SDK reports status "live"
 *   active      SDK status "live"; muted is our own mic toggle
 *   ending      the visitor pressed End; the SDK's "end" event finishes it
 *   ended       SDK "end" after the call was live; the record is then fetched from our server
 *   error       anything that stopped a call from starting
 * "Speaking" is shown only if the SDK sends agent_start_talking / agent_stop_talking, which it does
 * on some transports and not others. The activity level is the receptionist's real audio.
 *
 * The SDK is loaded only when someone presses Talk. Its create-web-call request is routed to our own
 * endpoint, which fixes the agent, applies limits, and keeps the API key on the server.
 */

export type LivePhase = "idle" | "permission" | "connecting" | "active" | "ending" | "ended" | "error"
export type LiveErrorCode = DemoCallErrorCode | "unsupported" | "mic_denied" | "no_mic" | "mic_error" | "network" | "connect_failed" | "timeout"

// "stale": the call record arrived, but we stopped waiting for a summary that never came.
export type LiveRecord = { state: "idle" | "loading" | "ready" | "stale" | "failed"; data: DemoCallRecord | null }

export type LiveState = {
  phase: LivePhase
  muted: boolean
  liveAt: number | null
  endedAt: number | null
  agentTalking: boolean | null
  slow: boolean
  maxSeconds: number
  error: { code: LiveErrorCode; message: string; retry: boolean } | null
  record: LiveRecord
}

const initial: LiveState = {
  phase: "idle",
  muted: false,
  liveAt: null,
  endedAt: null,
  agentTalking: null,
  slow: false,
  maxSeconds: 180,
  error: null,
  record: { state: "idle", data: null },
}

const messages: Record<Exclude<LiveErrorCode, DemoCallErrorCode>, string> = {
  unsupported: "This browser can’t make calls from a web page. You can still call the demo line.",
  mic_denied: "Your browser blocked the microphone, so no call was started. Allow it from the address bar and try again, or call the demo line.",
  no_mic: "We couldn’t find a microphone on this device. You can call the demo line instead.",
  mic_error: "The microphone didn’t start, so no call was made. Try again, or call the demo line.",
  network: "We couldn’t reach the demo just now. Check your connection and try again.",
  connect_failed: "The call didn’t connect. Try again in a moment, or call the demo line.",
  timeout: "The call was taking too long to connect, so we stopped it. Try again, or call the demo line.",
}
const fallback = DEMO_CALL_MESSAGES
const retryable = new Set<LiveErrorCode>(["mic_denied", "mic_error", "network", "connect_failed", "timeout", "busy", "provider_error", "storage_error", "bad_request"])

const CONNECT_SLOW_MS = 8000
const CONNECT_GIVE_UP_MS = 30000
// About four minutes in all, matching how long the server keeps calling a missing summary "pending".
const RECORD_POLL_MS = [1500, 3000, 3000, 4000, 5000, 6000, 8000, 10000, 15000, 15000, 20000, 20000, 30000, 30000, 30000, 40000]

type Session = { end: () => Promise<void>; mute: () => void; unmute: () => void }

export function useLiveDemo({ onLevel }: { onLevel?: (level: number) => void } = {}) {
  const [state, setState] = useState<LiveState>(initial)
  const phase = useRef<LivePhase>("idle")
  const busy = useRef(false)
  const session = useRef<Session | null>(null)
  const started = useRef<DemoCallStartResponse | null>(null)
  const serverError = useRef<DemoCallErrorResponse | null>(null)
  const timers = useRef<number[]>([])
  const poll = useRef<number | null>(null)
  const levelRef = useRef(onLevel)
  const generation = useRef(0)
  const muted = useRef(false)
  const cancelled = useRef(false)
  useEffect(() => {
    levelRef.current = onLevel
  }, [onLevel])

  const set = useCallback((patch: Partial<LiveState> | ((current: LiveState) => Partial<LiveState>)) => {
    setState((current) => {
      const next = { ...current, ...(typeof patch === "function" ? patch(current) : patch) }
      phase.current = next.phase
      return next
    })
  }, [])

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id))
    timers.current = []
  }, [])

  const tellServerToEnd = useCallback((beacon = false) => {
    const info = started.current
    if (!info) return
    const url = `${DEMO_CALL_ENDPOINT}/${encodeURIComponent(info.call.call_id)}/end`
    const body = JSON.stringify({ token: info.viewToken })
    if (beacon && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(url, new Blob([body], { type: "text/plain" }))
      return
    }
    fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body, keepalive: true }).catch(() => {})
  }, [])

  const fail = useCallback((code: LiveErrorCode, message?: string) => {
    clearTimers()
    busy.current = false
    levelRef.current?.(0)
    const text = message || (code in messages ? messages[code as keyof typeof messages] : fallback[code as DemoCallErrorCode]) || messages.connect_failed
    set({ phase: "error", error: { code, message: text, retry: retryable.has(code) }, agentTalking: null })
  }, [clearTimers, set])

  const loadRecord = useCallback(() => {
    const info = started.current
    if (!info) return
    const run = generation.current
    const url = `${DEMO_CALL_ENDPOINT}/${encodeURIComponent(info.call.call_id)}?token=${encodeURIComponent(info.viewToken)}`
    set({ record: { state: "loading", data: null } })
    const attempt = (count: number) => {
      fetch(url, { cache: "no-store" })
        .then(async (response) => {
          const data = (await response.json().catch(() => null)) as DemoCallRecord | DemoCallErrorResponse | null
          if (run !== generation.current) return
          if (!response.ok || !data || !data.ok) throw new Error("record unavailable")
          set({ record: { state: "ready", data } })
          // The transcript arrives first; the provider's summary can take a little longer.
          const waiting = data.analysis.state === "pending" || (data.status !== "ended" && data.status !== "error")
          if (!waiting) return
          if (count < RECORD_POLL_MS.length) poll.current = window.setTimeout(() => attempt(count + 1), RECORD_POLL_MS[count])
          else set({ record: { state: "stale", data } })
        })
        .catch(() => {
          if (run !== generation.current) return
          if (count < 3) {
            poll.current = window.setTimeout(() => attempt(count + 1), RECORD_POLL_MS[count])
            return
          }
          set((current) => ({ record: { state: current.record.data ? "ready" : "failed", data: current.record.data } }))
        })
    }
    attempt(0)
  }, [set])

  const start = useCallback(async () => {
    if (busy.current) return
    busy.current = true
    generation.current += 1
    const run = generation.current
    if (poll.current) window.clearTimeout(poll.current)
    started.current = null
    serverError.current = null
    session.current = null
    muted.current = false
    cancelled.current = false
    set({ ...initial, phase: "permission" })

    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia || typeof window.RTCPeerConnection === "undefined") {
      fail("unsupported")
      return
    }

    // Ask for the microphone first, so a refusal never creates a call.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      stream.getTracks().forEach((track) => track.stop())
    } catch (error) {
      const name = (error as DOMException | null)?.name
      fail(name === "NotAllowedError" || name === "SecurityError" ? "mic_denied" : name === "NotFoundError" || name === "OverconstrainedError" ? "no_mic" : "mic_error")
      return
    }
    if (run !== generation.current) return

    set({ phase: "connecting" })
    timers.current.push(window.setTimeout(() => set((current) => (current.phase === "connecting" ? { slow: true } : {})), CONNECT_SLOW_MS))
    timers.current.push(
      window.setTimeout(() => {
        if (phase.current !== "connecting") return
        session.current?.end().catch(() => {})
        tellServerToEnd()
        fail("timeout")
      }, CONNECT_GIVE_UP_MS),
    )

    let sdk: typeof import("retell-client-js-sdk")
    try {
      sdk = await import("retell-client-js-sdk")
    } catch {
      fail("network")
      return
    }
    if (run !== generation.current) return

    // The SDK's own requests, redirected: creating the call goes through our server.
    const proxied: typeof fetch = async (input, init) => {
      const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url
      if (url.endsWith("/v3/create-web-call")) {
        let response: Response
        try {
          response = await fetch(DEMO_CALL_ENDPOINT, { method: "POST", headers: { "content-type": "application/json" }, body: "{}", credentials: "same-origin" })
        } catch {
          serverError.current = { ok: false, code: "provider_error", message: messages.network }
          throw new Error("network")
        }
        const data = (await response.json().catch(() => null)) as DemoCallStartResponse | DemoCallErrorResponse | null
        if (!response.ok || !data || !data.ok) {
          serverError.current = data && !data.ok ? data : { ok: false, code: "provider_error", message: fallback.provider_error }
          return new Response(JSON.stringify({ error_message: serverError.current.message }), { status: response.status || 502, headers: { "content-type": "application/json" } })
        }
        started.current = data
        set({ maxSeconds: data.maxSeconds })
        return new Response(JSON.stringify(data.call), { status: 201, headers: { "content-type": "application/json" } })
      }
      if (url.includes("/v2/stop-call/")) {
        tellServerToEnd()
        return new Response(null, { status: 204 })
      }
      void init
      return new Response(JSON.stringify({ error_message: "Not available in the demo." }), { status: 403, headers: { "content-type": "application/json" } })
    }

    const client = new sdk.RetellClient({ key: "mountline-server-minted", fetch: proxied })
    const call = client.createWebCall({
      // The server replaces this with the configured demo agent.
      agent_id: "mountline-demo",
      audio: { emitRawAudioSamples: true },
      hooks: {
        onStatus: (status) => {
          if (run !== generation.current || status !== "live") return
          clearTimers()
          const maxSeconds = started.current?.maxSeconds ?? initial.maxSeconds
          set({ phase: "active", liveAt: Date.now(), slow: false })
          // The server limits the call too; this ends it cleanly on our side at the same moment.
          timers.current.push(window.setTimeout(() => void session.current?.end(), maxSeconds * 1000))
        },
        onAgentStartTalking: () => run === generation.current && set({ agentTalking: true }),
        onAgentStopTalking: () => run === generation.current && set({ agentTalking: false }),
        onAudio: (samples) => {
          let sum = 0
          for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i]
          levelRef.current?.(Math.sqrt(sum / samples.length))
        },
        onError: (error) => {
          // Not terminal by itself; "end" follows when the session actually stops.
          console.warn("[mountline] demo call:", error.message)
        },
        onEnd: () => {
          if (run !== generation.current) return
          clearTimers()
          levelRef.current?.(0)
          session.current = null
          busy.current = false
          muted.current = false
          if (cancelled.current) {
            // The visitor cancelled while it was connecting: back to the start, not an error.
            set(initial)
            return
          }
          if (phase.current === "connecting" || phase.current === "permission") {
            const known = serverError.current
            fail(known ? known.code : "connect_failed", known?.message)
            return
          }
          if (phase.current === "error") return
          set({ phase: "ended", endedAt: Date.now(), agentTalking: null, muted: false })
          tellServerToEnd()
          loadRecord()
        },
      },
    })
    session.current = { end: () => call.end(), mute: () => call.mute(), unmute: () => call.unmute() }
  }, [clearTimers, fail, loadRecord, set, tellServerToEnd])

  const end = useCallback(async () => {
    const current = session.current
    if (!current) return
    if (phase.current === "connecting") cancelled.current = true
    else set({ phase: "ending" })
    await current.end().catch(() => {})
  }, [set])

  const toggleMute = useCallback(() => {
    const current = session.current
    if (!current || phase.current !== "active") return
    muted.current = !muted.current
    if (muted.current) current.mute()
    else current.unmute()
    set({ muted: muted.current })
  }, [set])

  const reset = useCallback(() => {
    if (session.current) return
    generation.current += 1
    if (poll.current) window.clearTimeout(poll.current)
    clearTimers()
    busy.current = false
    started.current = null
    set(initial)
  }, [clearTimers, set])

  // Leaving the page ends the call and releases the microphone.
  useEffect(() => {
    const onHide = () => {
      if (!session.current) return
      session.current.end().catch(() => {})
      tellServerToEnd(true)
    }
    window.addEventListener("pagehide", onHide)
    return () => {
      window.removeEventListener("pagehide", onHide)
      onHide()
      clearTimers()
      if (poll.current) window.clearTimeout(poll.current)
    }
  }, [clearTimers, tellServerToEnd])

  return { state, start, end, toggleMute, reset }
}
