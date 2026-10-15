"use client"

import { useCallback, useEffect, useRef, useState } from "react"
import type { RetellWebClient } from "retell-client-js-sdk"
import { readStudioCall, startStudioTestCall, stopStudioTestCall } from "@/app/(marketing)/receptionist/studio-actions"
import type { CallDetail } from "@/lib/receptionist/retell"

type Phase = "idle" | "mic" | "connecting" | "live" | "ended" | "error"
type Turn = { role: string; content: string }

const ANALYSIS_WAIT_MS = 4 * 60_000
const OPEN = new Set(["registered", "ongoing"])

/** What the post-call wait looks like: still polling, gave up, and the last thing Retell said. */
export type AnalysisWait = { state: "waiting" | "timeout"; status: string | null; error: string | null }

/**
 * A real Retell web call in the browser. The server mints a short-lived access token for a Studio
 * agent (the API key never leaves the server); the Retell browser SDK joins with the microphone.
 * Ending, unmounting, or switching receptionists always stops the call and releases the mic.
 */
export function TestCall({ agentId, demo, blockedReason }: { agentId: string; demo: boolean; blockedReason: string | null }) {
  const [phase, setPhase] = useState<Phase>("idle")
  const [error, setError] = useState<string | null>(null)
  const [muted, setMuted] = useState(false)
  const [talking, setTalking] = useState(false)
  const [turns, setTurns] = useState<Turn[]>([])
  const [startedAt, setStartedAt] = useState<number | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [callId, setCallId] = useState<string | null>(null)
  const [result, setResult] = useState<CallDetail | null>(null)
  const [wait, setWait] = useState<AnalysisWait>({ state: "waiting", status: null, error: null })
  const [pollRound, setPollRound] = useState(0)
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

  // After the call, wait for Retell's post-call analysis (the booking details). Shows what Retell
  // reports while waiting, and ends the call server-side if Retell still has it open.
  useEffect(() => {
    if (phase !== "ended" || !callId) return
    let stopped = false
    let timer = 0
    let nudged = false
    const began = Date.now()
    const tick = async () => {
      const read = await readStudioCall(callId)
      if (stopped) return
      if (read.ok) {
        setResult(read.data)
        setWait((current) => ({ ...current, status: read.data.status, error: null }))
        if (read.data.analyzed) return
        if (OPEN.has(read.data.status) && !nudged) {
          nudged = true
          const stop = await stopStudioTestCall(callId)
          if (!stopped && !stop.ok) setWait((current) => ({ ...current, error: stop.error }))
        }
      } else {
        setWait((current) => ({ ...current, error: read.error }))
      }
      if (Date.now() - began < ANALYSIS_WAIT_MS) timer = window.setTimeout(tick, 3000)
      else setWait((current) => ({ ...current, state: "timeout" }))
    }
    timer = window.setTimeout(tick, 1500)
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [phase, callId, pollRound])

  async function start() {
    hangUp()
    setError(null)
    setTurns([])
    setResult(null)
    setWait({ state: "waiting", status: null, error: null })
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

      {phase === "ended" && callId ? <CallOutcome result={result} demo={demo} wait={wait} onRetry={() => {
            setWait((current) => ({ ...current, state: "waiting", error: null }))
            setPollRound((round) => round + 1)
          }} /> : null}
    </div>
  )
}

const OUTCOMES: Record<string, string> = {
  booked: "Booked",
  rescheduled: "Rescheduled",
  cancelled: "Cancelled",
  request_taken: "Request taken",
  quote_requested: "Quote requested",
  callback_requested: "Callback requested",
  question_answered: "Questions answered",
  urgent_referred: "Urgent: referred",
  no_outcome: "No outcome",
}

const FIELD_LABELS: Array<[string, string]> = [
  ["booked_for", "When"],
  ["service", "Service"],
  ["staff_preference", "With"],
  ["caller_name", "Name"],
  ["callback_number", "Number"],
  ["details", "Details"],
  ["reason", "Reason"],
]

/** What the call produced, from Retell's post-call analysis. A booking here is always simulated. */
export function CallOutcome({ result, demo, wait, onRetry }: { result: CallDetail | null; demo: boolean; wait: AnalysisWait; onRetry: () => void }) {
  if (!result?.analyzed) {
    const open = wait.status ? OPEN.has(wait.status) : false
    const message =
      wait.state === "timeout"
        ? open
          ? "Retell still has this call open, so it hasn't analyzed it. It closes on its own at the 15-minute limit."
          : "Retell hasn't sent the analysis yet. It sometimes takes a few minutes."
        : open
          ? "Ending the call on Retell's side…"
          : wait.status === "ended"
            ? "Call closed. Waiting for Retell's analysis (usually under a minute)…"
            : wait.status === "error" || wait.status === "not_connected"
              ? `Retell marked this call "${wait.status.replace("_", " ")}", so there's nothing to analyze.`
              : "Checking the call with Retell…"
    const done = wait.state === "timeout" || wait.status === "error" || wait.status === "not_connected"
    return (
      <div className="st-outcome">
        <p className="pt-muted small">{done ? null : <span className="pt-spin dark" aria-hidden="true" />}{message}</p>
        {wait.error ? <p className="pt-error">{wait.error}</p> : null}
        {wait.state === "timeout" ? (
          <div className="pt-actions">
            <button type="button" className="pt-btn light small" onClick={onRetry}>Check again</button>
            {result?.id ? <span className="pt-chip pt-mono">{result.id}</span> : null}
          </div>
        ) : null}
      </div>
    )
  }
  const data = new Map(result.collected.map((field) => [field.key, field.value]))
  const outcome = data.get("outcome") ?? ""
  const booked = outcome === "booked" || outcome === "rescheduled"
  const rows = FIELD_LABELS.filter(([key]) => data.get(key) && data.get(key) !== "null")
  return (
    <div className={booked ? "st-outcome booked" : "st-outcome"}>
      <div className="st-outcome-h">
        <h3>{booked && demo ? "Demo booking" : "What it captured"}</h3>
        {outcome ? <span className={booked ? "pt-chip good" : "pt-chip"}>{OUTCOMES[outcome] ?? outcome}</span> : null}
        {booked && demo ? <span className="pt-chip">Simulated · not on any calendar</span> : null}
      </div>
      {rows.length ? (
        <dl className="pt-dl">
          {rows.map(([key, labelText]) => (
            <div key={key}><dt>{labelText}</dt><dd>{data.get(key)}</dd></div>
          ))}
        </dl>
      ) : null}
      {result.summary ? <p className="st-summary">{result.summary}</p> : null}
      {result.recordingUrl ? <audio controls preload="none" src={result.recordingUrl} className="st-audio" /> : null}
      <div className="pt-chips">
        {result.durationMs ? <span className="pt-chip">{formatClock(result.durationMs)}</span> : null}
        {result.costCents !== null ? <span className="pt-chip">Cost ${(result.costCents / 100).toFixed(2)}</span> : null}
        <span className="pt-chip pt-mono">{result.id}</span>
      </div>
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
