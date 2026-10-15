"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react"
import { Wordmark } from "@/components/brand/wordmark"
import { Account } from "@/components/receptionist-portal/account"
import { DemoQr } from "@/components/receptionist-portal/demo-qr"
import { hangUp, placeDemoCall, publishToAgent, readCall, recentCalls, pointDemoLineAtLatest } from "@/app/(marketing)/receptionist/actions"
import { receptionistDemo } from "@/lib/receptionist/demo"
import type { Agent, CallDetail, CallSummary, Llm } from "@/lib/receptionist/retell"
import dynamic from "next/dynamic"

// Client-only: it restores the last business draft from this browser's storage on first render.
const TunePanel = dynamic(() => import("@/components/receptionist-portal/tune").then((mod) => mod.TunePanel), {
  ssr: false,
  loading: () => <section className="pt-card"><div className="pt-card-h"><h2>Tune it</h2></div><p className="pt-muted">Loading…</p></section>,
})

export type PortalState =
  | { status: "not-configured"; phoneNumber: string }
  | { status: "error"; phoneNumber: string; error: string }
  | {
      status: "ready"
      phoneNumber: string
      phonePretty: string
      agent: Agent
      llm: Llm | null
      lineVersion: number | string | null
      recent: CallSummary[]
    }

/** Early-access price shown to prospects during a demo. TODO(luke): change here if it moves. */
const EARLY_ACCESS = "Early access · $74.99/mo, setup included"

export type PortalView = "line" | "studio" | "staff"

/**
 * The portal shell. "line" is the live demo line; "studio" builds demo receptionists and "staff" is the
 * simulated staff app (both passed in as children).
 */
export function ReceptionistPortal({ view, initial, children }: { view: PortalView; initial?: PortalState; children?: React.ReactNode }) {
  return (
    <div className="mk-portal">
      <header className="pt-top">
        <div className="pt-top-in">
          <Link href="/" className="logo hit" aria-label="Mountline home"><Wordmark /></Link>
          <span className="pt-title">Receptionist demo</span>
          <nav className="pt-views" aria-label="Portal sections">
            <Link href="/receptionist" className="pt-view" aria-current={view === "line" ? "page" : undefined}>Demo line</Link>
            <Link href="/receptionist?view=studio" className="pt-view" aria-current={view === "studio" ? "page" : undefined}>Studio</Link>
            <Link href="/receptionist/staff" className="pt-view" aria-current={view === "staff" ? "page" : undefined}>Staff app</Link>
          </nav>
          <div className="pt-top-right">
            <span className="pt-pill">{EARLY_ACCESS}</span>
            <Link href="/dashboard" className="pt-link hit">Dashboard</Link>
            <Account />
          </div>
        </div>
      </header>
      {view !== "line" ? children : initial?.status === "ready" ? <ReadyPortal state={initial} /> : initial ? <NotReady state={initial} /> : null}
    </div>
  )
}

function NotReady({ state }: { state: Exclude<PortalState, { status: "ready" }> }) {
  return (
    <main className="pt-main pt-narrow">
      <section className="pt-card">
        <h1>{state.status === "not-configured" ? "Connect Retell to start demoing" : "Retell isn't answering"}</h1>
        {state.status === "error" ? <p className="pt-error">{state.error}</p> : null}
        <p className="pt-muted">The portal needs these environment variables on Vercel (and in .env.local to try it locally):</p>
        <ul className="pt-env">
          <li><code>RETELL_API_KEY</code> your Retell API key</li>
          <li><code>RETELL_DEMO_PHONE_NUMBER</code> the demo line in E.164, if it isn&apos;t {receptionistDemo.displayPhone}</li>
        </ul>
        <p className="pt-muted">The receptionist is whichever agent answers {state.phoneNumber} in Retell.</p>
      </section>
    </main>
  )
}

function ReadyPortal({ state }: { state: Extract<PortalState, { status: "ready" }> }) {
  const [selected, setSelected] = useState<string | null>(state.recent[0]?.status === "ongoing" ? state.recent[0].id : null)
  const [recent, setRecent] = useState(state.recent)

  const refreshRecent = useCallback(async () => {
    const result = await recentCalls()
    if (result.ok) setRecent(result.data)
  }, [])

  useEffect(() => {
    const timer = window.setInterval(refreshRecent, 10_000)
    return () => window.clearInterval(timer)
  }, [refreshRecent])

  return (
    <main className="pt-main">
      <div className="pt-grid">
        <div className="pt-col">
          <StartPanel
            phoneNumber={state.phoneNumber}
            phonePretty={state.phonePretty}
            onPlaced={(id) => {
              setSelected(id)
              refreshRecent()
            }}
          />
          <TunePanel agent={state.agent} llm={state.llm} lineVersion={state.lineVersion} onUseLatest={pointDemoLineAtLatest} publish={publishToAgent} />
          <CollectsPanel agent={state.agent} />
          <InTheWorks />
        </div>
        <div className="pt-col">
          <LiveCall key={selected ?? "none"} callId={selected} onEnded={refreshRecent} />
          <RecentCalls calls={recent} selected={selected} onSelect={setSelected} />
        </div>
      </div>
    </main>
  )
}

/* Start a demo ------------------------------------------------------------- */

function StartPanel({ phoneNumber, phonePretty, onPlaced }: { phoneNumber: string; phonePretty: string; onPlaced: (id: string) => void }) {
  const [number, setNumber] = useState("")
  const [state, setState] = useState<{ busy: boolean; error: string | null; note: string | null }>({ busy: false, error: null, note: null })
  const showQr = phoneNumber === receptionistDemo.phoneHref.replace("tel:", "")

  async function call(event: FormEvent) {
    event.preventDefault()
    if (state.busy) return
    setState({ busy: true, error: null, note: null })
    const result = await placeDemoCall(number)
    if (!result.ok) return setState({ busy: false, error: result.error, note: null })
    setState({ busy: false, error: null, note: `Calling ${formatPhone(number)}…` })
    onPlaced(result.data.id)
  }

  return (
    <section className="pt-card">
      <div className="pt-card-h"><h2>Start a demo</h2></div>
      <div className="pt-start">
        <div className="pt-callin">
          <span className="pt-label">They call the demo line</span>
          <a className="pt-number" href={`tel:${phoneNumber}`}>{formatPhone(phonePretty)}</a>
          {showQr ? <div className="pt-qr"><DemoQr /><span>Scan to call</span></div> : null}
        </div>
        <form className="pt-callout" onSubmit={call} noValidate>
          <label className="pt-label" htmlFor="pt-phone">Or I call their phone</label>
          <div className="pt-row">
            <input
              id="pt-phone"
              className={state.error ? "pt-input bad" : "pt-input"}
              type="tel"
              inputMode="tel"
              autoComplete="off"
              placeholder="(817) 555-0123"
              value={number}
              onChange={(event) => setNumber(event.target.value)}
              aria-invalid={state.error ? true : undefined}
              aria-describedby="pt-phone-help"
            />
            <button className="pt-btn" type="submit" disabled={state.busy}>
              {state.busy ? <><span className="pt-spin" aria-hidden="true" />Calling</> : "Call their phone"}
            </button>
          </div>
          <p id="pt-phone-help" className={state.error ? "pt-error" : "pt-muted"} role={state.error ? "alert" : undefined}>
            {state.error ?? state.note ?? "US numbers only. The call comes from the demo line, with the receptionist on it."}
          </p>
        </form>
      </div>
    </section>
  )
}

/* Live call ---------------------------------------------------------------- */

const LIVE = new Set(["registered", "ongoing"])
const ANALYSIS_WAIT_MS = 4 * 60_000

function LiveCall({ callId, onEnded }: { callId: string | null; onEnded: () => void }) {
  const [call, setCall] = useState<CallDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const [ending, setEnding] = useState(false)
  const endedFired = useRef(false)

  // Remounted per call (key={callId} below), so state starts fresh for each one.
  useEffect(() => {
    if (!callId) return
    let stopped = false
    let timer = 0
    const tick = async () => {
      const result = await readCall(callId)
      if (stopped) return
      if (!result.ok) {
        setError(result.error)
        timer = window.setTimeout(tick, 5000)
        return
      }
      setError(null)
      setCall(result.data)
      const live = LIVE.has(result.data.status)
      if (!live && !endedFired.current) {
        endedFired.current = true
        onEnded()
      }
      const waitingForAnalysis = !live && !result.data.analyzed && Date.now() - (result.data.endedAt ?? Date.now()) < ANALYSIS_WAIT_MS
      if (live || waitingForAnalysis) timer = window.setTimeout(tick, live ? 2000 : 4000)
    }
    tick()
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [callId, onEnded])

  useEffect(() => {
    if (!call || call.status !== "ongoing") return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [call])

  async function end() {
    if (!callId) return
    setEnding(true)
    const result = await hangUp(callId)
    if (!result.ok) setError(result.error)
    setEnding(false)
  }

  return <CallView callId={callId} call={call} error={error} now={now} ending={ending} onEnd={end} />
}

/** The live-call panel itself, from a call's current state. No data fetching. */
export function CallView({
  callId,
  call,
  error,
  now,
  ending,
  onEnd,
}: {
  callId: string | null
  call: CallDetail | null
  error: string | null
  now: number
  ending: boolean
  onEnd: () => void
}) {
  if (!callId) {
    return (
      <section className="pt-card pt-live pt-empty">
        <h2>Live call</h2>
        <p className="pt-muted">Start a call, or have them dial the demo line and pick it from Recent calls. The transcript, recording, and everything it collected show up here.</p>
      </section>
    )
  }

  const live = call ? LIVE.has(call.status) : true
  const elapsed = call?.status === "ongoing" && call.startedAt ? now - call.startedAt : call?.durationMs ?? null

  return (
    <section className="pt-card pt-live">
      <div className="pt-card-h">
        <h2>Live call</h2>
        {call ? <StatusPill status={call.status} /> : <span className="pt-pill">Connecting…</span>}
      </div>
      {call ? (
        <div className="pt-meta">
          <span>{call.direction === "outbound" ? "Called" : "From"} <b>{formatPhone(call.number) || "—"}</b></span>
          {elapsed !== null ? <span className="pt-mono">{formatDuration(elapsed)}</span> : null}
          {live ? (
            <button className="pt-btn danger small" type="button" onClick={onEnd} disabled={ending}>{ending ? "Ending…" : "End call"}</button>
          ) : null}
        </div>
      ) : null}
      {error ? <p className="pt-error" role="alert">{error}</p> : null}

      <div className="pt-transcript" aria-live="polite">
        {call && call.turns.length ? (
          call.turns.map((turn, index) => (
            <p key={index} className={turn.role === "agent" ? "pt-turn agent" : turn.role === "user" ? "pt-turn user" : "pt-turn other"}>
              <span className="sr-only">{turn.role === "agent" ? "Receptionist" : "Caller"}: </span>
              {turn.text}
            </p>
          ))
        ) : (
          <p className="pt-muted">{live ? "The full transcript appears here as soon as the call ends." : "No transcript for this call."}</p>
        )}
      </div>

      {call && !live ? (
        <div className="pt-results">
          {call.recordingUrl ? (
            <div className="pt-block">
              <h3>Recording</h3>
              <audio controls preload="none" src={call.recordingUrl} />
            </div>
          ) : null}
          <div className="pt-block">
            <h3>What it collected</h3>
            {call.analyzed ? (
              <>
                {call.collected.length ? (
                  <dl className="pt-dl">
                    {call.collected.map((field) => (
                      <div key={field.key}><dt>{labelize(field.key)}</dt><dd>{field.value || "—"}</dd></div>
                    ))}
                  </dl>
                ) : (
                  <p className="pt-muted">No custom fields came back for this call.</p>
                )}
                <div className="pt-chips">
                  {call.sentiment ? <span className="pt-chip">Sentiment: {call.sentiment}</span> : null}
                  {call.successful !== null ? <span className={call.successful ? "pt-chip good" : "pt-chip"}>{call.successful ? "Got what it needed" : "Didn't finish intake"}</span> : null}
                  {call.disconnection ? <span className="pt-chip">{labelize(call.disconnection)}</span> : null}
                  {call.costCents !== null ? <span className="pt-chip">Cost ${(call.costCents / 100).toFixed(2)}</span> : null}
                </div>
              </>
            ) : (
              <p className="pt-muted"><span className="pt-spin dark" aria-hidden="true" /> Waiting for Retell&apos;s analysis…</p>
            )}
          </div>
          {call.summary ? (
            <div className="pt-block">
              <h3>Summary</h3>
              <p>{call.summary}</p>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  )
}

function StatusPill({ status }: { status: string }) {
  const label: Record<string, string> = { registered: "Ringing", ongoing: "Live", ended: "Ended", not_connected: "Not connected", error: "Error" }
  return <span className={`pt-pill status-${status}`}>{status === "ongoing" ? <i aria-hidden="true" /> : null}{label[status] ?? status}</span>
}

/* Recent calls ------------------------------------------------------------- */

function RecentCalls({ calls, selected, onSelect }: { calls: CallSummary[]; selected: string | null; onSelect: (id: string) => void }) {
  return (
    <section className="pt-card">
      <div className="pt-card-h"><h2>Recent calls</h2><span className="pt-muted small">Refreshes every 10 seconds</span></div>
      {calls.length ? (
        <ul className="pt-calls">
          {calls.map((call) => (
            <li key={call.id}>
              <button type="button" className={call.id === selected ? "pt-call on" : "pt-call"} onClick={() => onSelect(call.id)}>
                <span className="pt-call-dir">{call.direction === "outbound" ? "Out" : call.direction === "inbound" ? "In" : "Web"}</span>
                <span className="pt-call-num">{formatPhone(call.number) || "Browser call"}</span>
                <span className="pt-muted">{call.startedAt ? formatWhen(call.startedAt) : "—"}</span>
                <span className="pt-mono">{call.durationMs ? formatDuration(call.durationMs) : ""}</span>
                <StatusPill status={call.status} />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="pt-muted">No calls yet. They&apos;ll appear here as soon as one starts.</p>
      )}
    </section>
  )
}

/* What it collects, and what's coming ---------------------------------------- */

function CollectsPanel({ agent }: { agent: Agent }) {
  return (
    <section className="pt-card">
      <div className="pt-card-h"><h2>What it collects</h2><span className="pt-muted small">After every call</span></div>
      {agent.collects.length ? (
        <ul className="pt-collects">
          {agent.collects.map((field) => (
            <li key={field.name}>
              <b>{labelize(field.name)}</b>
              {field.description ? <span>{field.description}</span> : null}
            </li>
          ))}
        </ul>
      ) : (
        <p className="pt-muted">No post-call fields are set on this agent yet. Add them in Retell under Post-Call Analysis.</p>
      )}
    </section>
  )
}

function InTheWorks() {
  return (
    <section className="pt-card pt-soon">
      <div className="pt-card-h"><h2>In the works</h2></div>
      <ul>
        <li>Text confirmations to the caller and the business</li>
        <li>Live transfer for urgent calls</li>
        <li>Booking straight onto a calendar</li>
      </ul>
    </section>
  )
}

/* Formatting --------------------------------------------------------------- */

export function formatPhone(value: string) {
  const digits = value.replace(/\D/g, "")
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits
  return national.length === 10 ? `(${national.slice(0, 3)}) ${national.slice(3, 6)}-${national.slice(6)}` : value
}

function formatDuration(ms: number) {
  const seconds = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

function formatWhen(ms: number) {
  const date = new Date(ms)
  const today = new Date()
  const time = date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
  return date.toDateString() === today.toDateString() ? `Today ${time}` : `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${time}`
}

function labelize(key: string) {
  const text = key.replace(/[_-]+/g, " ").trim()
  return text.charAt(0).toUpperCase() + text.slice(1)
}
