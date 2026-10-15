"use client"

import { useRouter } from "next/navigation"
import { useCallback, useEffect, useRef, useState } from "react"
import type { RetellWebClient } from "retell-client-js-sdk"
import { startStudioTestCall, stopStudioTestCall } from "@/app/(marketing)/receptionist/studio-actions"

type Phase = "idle" | "mic" | "connecting" | "live" | "ended" | "error"
type Turn = { role: string; content: string }

/** The staff app (the business's side of a call): Studio opens it the moment a test call ends. */
export const staffHref = (agentId: string, callId?: string | null) =>
  `/receptionist/staff?agent=${encodeURIComponent(agentId)}${callId ? `&call=${encodeURIComponent(callId)}` : ""}`

/**
 * A real Retell web call in the browser. The server mints a short-lived access token for a Studio
 * agent (the API key never leaves the server); the Retell browser SDK joins with the microphone.
 * Ending, unmounting, or switching receptionists always stops the call and releases the mic. When a
 * connected call ends, it goes straight to the staff app, where the call's details arrive.
 */
export function TestCall({ agentId, blockedReason }: { agentId: string; blockedReason: string | null }) {
  const router = useRouter()
  const [phase, setPhase] = useState<Phase>("idle")
  const [error, setError] = useState<string | null>(null)
  const [muted, setMuted] = useState(false)
  const [talking, setTalking] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [callId, setCallId] = useState<string | null>(null)
  const client = useRef<RetellWebClient | null>(null)
  // The call to stop on Retell's side if this component goes away mid-call.
  const openCall = useRef<string | null>(null)
  // Bumped by every start and every hang-up, so a cancelled start stops at its next await.
  const attempt = useRef(0)
  const transcript = useRef<HTMLDivElement>(null)

  const hangUp = useCallback(() => {
    attempt.current += 1
    const current = client.current
    client.current = null
    if (current) {
      current.removeAllListeners()
      current.stopCall()
    }
  }, [])

  /** Hangs up in the browser and tells Retell to end the call, so its analysis can start. */
  const finish = useCallback(() => {
    hangUp()
    const id = openCall.current
    openCall.current = null
    if (id) void stopStudioTestCall(id)
  }, [hangUp])

  // Unmount (or a different agent) always ends the call and frees the microphone.
  useEffect(() => finish, [finish, agentId])

  useEffect(() => {
    if (phase !== "live") return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [phase])

  useEffect(() => {
    transcript.current?.scrollTo({ top: transcript.current.scrollHeight, behavior: "smooth" })
  }, [turns])

  // The call is over: show it the way the business's staff would see it.
  useEffect(() => {
    // startedAt is only set once the call connected; calls that never connected stay here.
    if (phase === "ended" && callId && startedAt) router.push(staffHref(agentId, callId))
  }, [phase, callId, startedAt, agentId, router])

  async function start() {
    hangUp()
    setError(null)
    setTurns([])
    setStartedAt(null)
    setMuted(false)
    setTalking(false)
    setCallId(null)
    setPhase("mic")
    const mine = attempt.current
    const cancelled = () => attempt.current !== mine
    try {
      const probe = await navigator.mediaDevices.getUserMedia({ audio: true })
      probe.getTracks().forEach((track) => track.stop())
    } catch {
      if (cancelled()) return
      setPhase("error")
      setError("The browser blocked the microphone. Allow mic access for this site (the icon in the address bar), then try again.")
      return
    }

    if (cancelled()) return
    setPhase("connecting")
    const ticket = await startStudioTestCall(agentId)
    if (cancelled()) return
    if (!ticket.ok) {
      setPhase("error")
      setError(ticket.error)
      return
    }

    try {
      const { RetellWebClient } = await import("retell-client-js-sdk")
      if (cancelled()) return
      const web = new RetellWebClient()
      client.current = web
      openCall.current = ticket.data.callId
      setCallId(ticket.data.callId)
      web.on("call_started", () => {
        setPhase("live")
        setStartedAt(Date.now())
        setNow(Date.now())
      })
      web.on("call_ended", () => {
        if (client.current === web) client.current = null
        openCall.current = null
        setTalking(false)
        setPhase("ended")
      })
      web.on("agent_start_talking", () => setTalking(true))
      web.on("agent_stop_talking", () => setTalking(false))
      web.on("update", (update: { transcript?: Turn[] }) => {
        if (Array.isArray(update?.transcript)) setTurns(update.transcript.filter((turn) => turn?.content).slice(-14))
      })
      web.on("error", (message: unknown) => {
        setError(typeof message === "string" ? `The call dropped: ${message}` : "The call dropped. Try again.")
        hangUp()
        setPhase("error")
      })
      await web.startCall({
        accessToken: ticket.data.accessToken,
        callId: ticket.data.callId,
        ...(ticket.data.transport ? { transport: ticket.data.transport } : {}),
        ...(ticket.data.iceServers.length ? { iceServers: ticket.data.iceServers as RTCIceServer[] } : {}),
      })
    } catch {
      if (cancelled()) return
      hangUp()
      setPhase("error")
      setError("Couldn't connect the call. Check the connection and try again.")
    }
  }

  function end() {
    finish()
    setTalking(false)
    setPhase("ended")
  }

  function toggleMute() {
    if (!client.current) return
    if (muted) client.current.unmute()
    else client.current.mute()
    setMuted(!muted)
  }

  const busy = phase === "mic" || phase === "connecting"
  const live = phase === "live"
  const elapsed = live && startedAt ? now - startedAt : null

  return (
    <div className="st-call">
      <div className="st-call-row">
        <div className={live ? (talking ? "st-orb talk" : "st-orb live") : busy ? "st-orb wait" : "st-orb"} aria-hidden="true">
          <i /><i /><i /><i />
        </div>
        <div className="st-call-status" aria-live="polite">
          <b>{label(phase, talking)}</b>
          <span className="pt-muted small">
            {live ? `${formatClock(elapsed ?? 0)}${muted ? " · You're muted" : ""}` : phase === "idle" ? "Uses your computer's mic and speakers" : phase === "ended" ? "Call ended" : busy ? "Allow the microphone if the browser asks" : ""}
          </span>
        </div>
        <div className="st-call-actions">
          {live ? (
            <>
              <button type="button" className="pt-btn light small" onClick={toggleMute} aria-pressed={muted}>{muted ? "Unmute" : "Mute"}</button>
              <button type="button" className="pt-btn danger small" onClick={end}>End call</button>
            </>
          ) : busy ? (
            <button type="button" className="pt-btn light small" onClick={end}>Cancel</button>
          ) : (
            <button type="button" className="pt-btn" onClick={start} disabled={Boolean(blockedReason)}>
              {phase === "ended" || phase === "error" ? "Call again" : "Test call"}
            </button>
          )}
        </div>
      </div>
      {blockedReason && !live && !busy ? <p className="pt-muted small st-gap">{blockedReason}</p> : null}
      {error ? <p className="pt-error" role="alert">{error}</p> : null}

      {turns.length || live ? (
        <div className="pt-transcript st-transcript" ref={transcript} aria-live="polite">
          {turns.length ? (
            turns.map((turn, index) => (
              <p key={index} className={turn.role === "agent" ? "pt-turn agent" : "pt-turn user"}>
                <span className="sr-only">{turn.role === "agent" ? "Receptionist" : "You"}: </span>
                {turn.content}
              </p>
            ))
          ) : (
            <p className="pt-muted small">Say hi. The live transcript shows up here.</p>
          )}
        </div>
      ) : null}

      {phase === "ended" && callId && startedAt ? (
        <p className="pt-muted small st-gap"><span className="pt-spin dark" aria-hidden="true" />Opening the staff app…</p>
      ) : null}
    </div>
  )
}

function label(phase: Phase, talking: boolean) {
  switch (phase) {
    case "mic":
      return "Checking the microphone…"
    case "connecting":
      return "Connecting…"
    case "live":
      return talking ? "Receptionist speaking" : "Live: go ahead and talk"
    case "ended":
      return "Call ended"
    case "error":
      return "Call didn't connect"
    default:
      return "Ready to test"
  }
}

function formatClock(ms: number) {
  const seconds = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}
