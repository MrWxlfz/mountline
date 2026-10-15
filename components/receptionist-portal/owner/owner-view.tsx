"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { ownerRecentCalls, readStudioCall, stopStudioTestCall } from "@/app/(marketing)/receptionist/studio-actions"
import { Account } from "@/components/receptionist-portal/account"
import { formatPhone } from "@/components/receptionist-portal/studio/numbers"
import type { CallDetail, CallSummary } from "@/lib/receptionist/retell"
import { getIndustry, type Industry } from "@/lib/receptionist/studio/industries"
import { ownerEvent, ownerFieldLibrary, readField, type OwnerEvent } from "@/lib/receptionist/studio/owner"

export type OwnerInitial =
  | { ok: false; error: string }
  | {
      ok: true
      agentId: string
      business: string
      industry: string
      demo: boolean
      calls: CallSummary[]
      /** The test call that just ended; it's watched until analyzed and gets a notification. */
      focusCallId: string | null
      loadedAt: number
    }

type Toast = { id: string; callId: string; event: OwnerEvent; caller: string | null; at: number }

const OPEN = new Set(["registered", "ongoing"])
const FAILED = new Set(["error", "not_connected"])
const TICK_MS = 3000
const LIST_EVERY = 2 // refresh the list every other tick
const WATCH_FOR_MS = 6 * 60_000
const TOAST_MS = 12_000

/** Analysis values as a plain record (booleans arrive as "true"/"false"). */
const dataOf = (call: CallDetail | undefined): Record<string, string> => Object.fromEntries((call?.collected ?? []).map((field) => [field.key, field.value]))

export function OwnerView({ initial }: { initial: OwnerInitial }) {
  if (!initial.ok) {
    return (
      <div className="mk-portal">
        <main className="pt-main pt-narrow">
          <section className="pt-card">
            <h1>Owner view isn&apos;t available</h1>
            <p className="pt-error">{initial.error}</p>
            <p className="pt-muted"><Link href="/receptionist?view=studio" className="pt-linkbtn">Back to Studio</Link></p>
          </section>
        </main>
      </div>
    )
  }
  return <Dashboard initial={initial} />
}

function Dashboard({ initial }: { initial: Extract<OwnerInitial, { ok: true }> }) {
  const industry = getIndustry(initial.industry)
  const [calls, setCalls] = useState<CallSummary[]>(() => withFocus(initial.calls, initial.focusCallId))
  const [details, setDetails] = useState<Record<string, CallDetail>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [selected, setSelected] = useState<string | null>(initial.focusCallId ?? initial.calls[0]?.id ?? null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [inbox, setInbox] = useState<Toast[]>([])
  const [unread, setUnread] = useState(0)
  const [bellOpen, setBellOpen] = useState(false)

  // Calls being watched until Retell finishes analyzing them, and when each started being watched.
  const watching = useRef(new Map<string, number>(initial.focusCallId ? [[initial.focusCallId, initial.loadedAt]] : []))
  const known = useRef(new Set(initial.calls.map((call) => call.id)))
  const notified = useRef(new Set<string>())
  const nudged = useRef(new Set<string>())
  const fetched = useRef(new Set<string>())
  // A render-safe copy of which calls are still being watched.
  const [watched, setWatched] = useState<string[]>(initial.focusCallId ? [initial.focusCallId] : [])

  const notify = useCallback((callId: string, detail: CallDetail) => {
    if (notified.current.has(callId)) return
    notified.current.add(callId)
    const data = dataOf(detail)
    const event = ownerEvent(industry, data)
    if (!event.priority) return
    const toast: Toast = { id: `${callId}-${Date.now()}`, callId, event, caller: readField(data, "caller_name"), at: Date.now() }
    setToasts((current) => [toast, ...current].slice(0, 3))
    setInbox((current) => [toast, ...current].slice(0, 20))
    setUnread((count) => count + 1)
    window.setTimeout(() => setToasts((current) => current.filter((entry) => entry.id !== toast.id)), TOAST_MS)
  }, [industry])

  const load = useCallback(async (callId: string) => {
    const read = await readStudioCall(callId)
    if (!read.ok) {
      setErrors((current) => ({ ...current, [callId]: read.error }))
      return null
    }
    setErrors((current) => {
      if (!(callId in current)) return current
      const next = { ...current }
      delete next[callId]
      return next
    })
    setDetails((current) => ({ ...current, [callId]: read.data }))
    return read.data
  }, [])

  // One loop: refresh the list now and then, and re-read every watched call until it's analyzed.
  useEffect(() => {
    let stopped = false
    let timer = 0
    let tick = 0
    const run = async () => {
      tick++
      if (tick % LIST_EVERY === 1) {
        const list = await ownerRecentCalls(initial.agentId)
        if (stopped) return
        if (list.ok) {
          for (const call of list.data) {
            if (!known.current.has(call.id)) {
              known.current.add(call.id)
              // A call that started after the page opened: watch it and notify when it's analyzed.
              if ((call.startedAt ?? Date.now()) >= initial.loadedAt - 60_000) watching.current.set(call.id, Date.now())
            }
          }
          setCalls((current) => withFocus(list.data, initial.focusCallId, current))
        }
      }
      for (const [callId, since] of [...watching.current].slice(0, 4)) {
        const detail = await load(callId)
        if (stopped) return
        if (!detail) continue
        if (detail.analyzed) {
          watching.current.delete(callId)
          notify(callId, detail)
        } else if (FAILED.has(detail.status) || Date.now() - since > WATCH_FOR_MS) {
          watching.current.delete(callId)
        } else if (callId === initial.focusCallId && OPEN.has(detail.status) && detail.direction === "web" && !nudged.current.has(callId) && Date.now() - since > 4000) {
          // The browser hung up but Retell still has the test call open: end it so analysis can start.
          nudged.current.add(callId)
          void stopStudioTestCall(callId)
        }
      }
      if (stopped) return
      setWatched([...watching.current.keys()])
      timer = window.setTimeout(run, TICK_MS)
    }
    timer = window.setTimeout(run, 800)
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [initial.agentId, initial.focusCallId, initial.loadedAt, load, notify])

  // Older calls load their details when opened.
  useEffect(() => {
    if (!selected || fetched.current.has(selected) || watching.current.has(selected)) return
    fetched.current.add(selected)
    void load(selected)
  }, [selected, load])

  const current = selected ? details[selected] : undefined
  const summary = calls.find((call) => call.id === selected) ?? null

  function open(callId: string) {
    setSelected(callId)
    setBellOpen(false)
    setToasts((list) => list.filter((toast) => toast.callId !== callId))
  }

  return (
    <div className="mk-portal ow">
      <header className="ow-top">
        <div className="ow-top-in">
          <span className="ow-mark" aria-hidden="true">{initials(initial.business)}</span>
          <div className="ow-brand">
            <b>{initial.business}</b>
            <span>AI receptionist</span>
          </div>
          <div className="ow-top-right">
            <div className="ow-bell-wrap">
              <button
                type="button"
                className="ow-bell"
                aria-label={unread ? `Notifications, ${unread} new` : "Notifications"}
                aria-expanded={bellOpen}
                onClick={() => {
                  setBellOpen(!bellOpen)
                  setUnread(0)
                }}
              >
                <BellIcon />
                {unread ? <i>{unread}</i> : null}
              </button>
              {bellOpen ? (
                <div className="ow-inbox" role="dialog" aria-label="Notifications">
                  <div className="ow-inbox-h">Notifications <span className="pt-muted small">Appointments, urgent calls, and leads</span></div>
                  {inbox.length ? (
                    inbox.map((toast) => (
                      <button key={toast.id} type="button" className="ow-inbox-row" onClick={() => open(toast.callId)}>
                        <EventDot kind={toast.event.kind} />
                        <span><b>{toast.event.title}</b><small>{toast.event.line || "Open the call for details"}</small></span>
                        <time>{formatTime(toast.at)}</time>
                      </button>
                    ))
                  ) : (
                    <p className="pt-muted small ow-inbox-empty">Nothing yet. You&apos;ll get one when a call books something, needs a call back, or is urgent.</p>
                  )}
                </div>
              ) : null}
            </div>
            <Link href="/receptionist?view=studio" className="pt-link hit">Back to Studio</Link>
            <Account />
          </div>
        </div>
      </header>
      {initial.demo ? (
        <p className="ow-banner">Demo view of what {initial.business} would see after each call. Bookings here are simulated, so nothing is on a real calendar.</p>
      ) : null}

      <main className="ow-main">
        <aside className="ow-list" aria-label="Calls">
          <div className="ow-list-h"><h2>Calls</h2><span className="pt-muted small">{calls.length ? "Newest first" : ""}</span></div>
          {calls.length ? (
            <ul>
              {calls.map((call) => (
                <li key={call.id}>
                  <CallRow call={call} detail={details[call.id]} industry={industry} on={call.id === selected} onOpen={() => open(call.id)} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="pt-muted small ow-empty-list">No calls yet. Call the receptionist and it shows up here.</p>
          )}
        </aside>

        <section className="ow-detail" aria-live="polite">
          {selected ? (
            <CallPanel key={selected} summary={summary} detail={current} error={errors[selected] ?? null} industry={industry} watching={watched.includes(selected)} />
          ) : (
            <div className="pt-card pt-empty"><h2>No call selected</h2><p className="pt-muted">Pick a call on the left.</p></div>
          )}
        </section>
      </main>

      <div className="ow-toasts" aria-live="assertive">
        {toasts.map((toast) => (
          <button key={toast.id} type="button" className={`ow-toast ${toast.event.kind}`} onClick={() => open(toast.callId)}>
            <span className="ow-toast-eyebrow"><EventDot kind={toast.event.kind} />New caller{toast.caller ? ` · ${toast.caller}` : ""}<time>now</time></span>
            <b>{toast.event.title}</b>
            {toast.event.line ? <span className="ow-toast-line">{toast.event.line}</span> : null}
          </button>
        ))}
      </div>
    </div>
  )
}

/* Call list -------------------------------------------------------------------------- */

function CallRow({ call, detail, industry, on, onOpen }: { call: CallSummary; detail: CallDetail | undefined; industry: Industry; on: boolean; onOpen: () => void }) {
  const data = dataOf(detail)
  const event = detail?.analyzed ? ownerEvent(industry, data) : null
  const name = readField(data, "caller_name")
  const live = OPEN.has(call.status)
  return (
    <button type="button" className={on ? "ow-row on" : "ow-row"} onClick={onOpen} aria-current={on || undefined}>
      <span className="ow-row-top">
        <b>{name ?? (call.number ? formatPhone(call.number) : call.direction === "web" ? "Browser call" : "Unknown caller")}</b>
        <time>{call.startedAt ? formatWhen(call.startedAt) : ""}</time>
      </span>
      <span className="ow-row-bottom">
        {live ? <span className="ow-chip live"><i />Live</span> : event ? <span className={`ow-chip ${event.kind}`}>{event.priority ? event.title : "Caller"}</span> : <span className="ow-chip">{FAILED.has(call.status) ? "Didn't connect" : "Processing"}</span>}
        <span className="ow-row-line">{event?.line ? event.line : call.durationMs ? formatDuration(call.durationMs) : ""}</span>
      </span>
    </button>
  )
}

/* Call detail -------------------------------------------------------------------------- */

function CallPanel({ summary, detail, error, industry, watching }: { summary: CallSummary | null; detail: CallDetail | undefined; error: string | null; industry: Industry; watching: boolean }) {
  const status = detail?.status ?? summary?.status ?? null
  const number = detail?.number || summary?.number || ""
  const startedAt = detail?.startedAt ?? summary?.startedAt ?? null
  const durationMs = detail?.durationMs ?? summary?.durationMs ?? null

  if (!detail?.analyzed) {
    const live = status ? OPEN.has(status) : false
    const failed = status ? FAILED.has(status) : false
    const message = failed
      ? "This call didn't connect, so there's nothing to show."
      : live
        ? summary?.direction === "web" || detail?.direction === "web"
          ? "Wrapping up the call…"
          : "Call in progress. Details appear here when it ends."
        : watching
          ? "Pulling out the details: who called, what they need, and what was booked…"
          : "The details for this call aren't ready yet."
    return (
      <div className="pt-card ow-panel">
        <div className="ow-head">
          <div>
            <h1>{number ? formatPhone(number) : summary?.direction === "web" ? "Browser call" : "New call"}</h1>
            <p className="pt-muted small">{[startedAt ? formatWhen(startedAt) : null, durationMs ? formatDuration(durationMs) : null].filter(Boolean).join(" · ")}</p>
          </div>
          {live ? <span className="ow-chip live"><i />Live</span> : null}
        </div>
        <div className="ow-processing">
          {failed ? null : <span className="pt-spin dark" aria-hidden="true" />}
          <span>{message}</span>
        </div>
        <div className="ow-skeleton" aria-hidden="true"><i /><i /><i /></div>
        {error ? <p className="pt-error">{error}</p> : null}
      </div>
    )
  }

  const data = dataOf(detail)
  const get = (key: string) => readField(data, key)
  const event = ownerEvent(industry, data)
  const name = get("caller_name")
  const phone = get("callback_number") ?? (detail.number || null)
  const email = industry.owner.includes("email") ? get("email") : null
  const addressKey = industry.owner.find((id) => (ownerFieldLibrary[id] as { kind?: string }).kind === "address")
  const address = addressKey ? get(addressKey) : null
  const fields = industry.owner
    .filter((id) => id !== "email" && id !== addressKey)
    .flatMap((id) => {
      const value = get(id)
      return value ? [{ id, label: ownerFieldLibrary[id].label as string, value }] : []
    })
  const extra = get("details")
  const when = get("booked_for")
  const service = [get("service"), get("staff_preference") ? `with ${get("staff_preference")}` : null].filter(Boolean).join(" ")
  const visit = industry.visit.split(" or ")[0]

  return (
    <div className="pt-card ow-panel">
      <div className="ow-head">
        <div>
          <h1>{name ?? (phone ? formatPhone(phone) : "Unknown caller")}</h1>
          <p className="pt-muted small">{[name && phone ? formatPhone(phone) : null, detail.startedAt ? formatWhen(detail.startedAt) : null, detail.durationMs ? formatDuration(detail.durationMs) : null].filter(Boolean).join(" · ")}</p>
        </div>
        <span className={`ow-chip ${event.kind}`}>{event.priority ? event.title : "Caller"}</span>
      </div>

      {event.kind === "appointment" || event.kind === "change" ? (
        <div className={`ow-hero ${event.kind}`}>
          <span className="ow-hero-label">{event.kind === "change" ? event.title : capital(visit)}</span>
          <b>{when ?? "Time not set"}</b>
          {service ? <span>{service}</span> : null}
        </div>
      ) : event.kind === "urgent" ? (
        <div className="ow-hero urgent">
          <span className="ow-hero-label">Urgent</span>
          <b>{get("issue") ?? get("reason") ?? "Caller described an urgent situation"}</b>
          {address ? <span>{address}</span> : null}
          {when ? <span>{get("outcome") === "booked" ? `Booked: ${when}` : `Prefers ${when}`}</span> : null}
        </div>
      ) : event.kind === "lead" ? (
        <div className="ow-hero lead">
          <span className="ow-hero-label">{event.title}</span>
          <b>{get("issue") ?? get("reason") ?? "Wants to hear back"}</b>
          {when ? <span>Prefers {when}</span> : null}
        </div>
      ) : get("reason") ? (
        <div className="ow-hero">
          <span className="ow-hero-label">Called about</span>
          <b>{get("reason")}</b>
        </div>
      ) : null}

      <div className="ow-actions">
        {phone ? <a className="pt-btn small" href={`tel:${phone.replace(/[^\d+]/g, "")}`}>Call back</a> : null}
        {email ? <a className="pt-btn light small" href={`mailto:${email}`}>Email</a> : null}
        {address ? <a className="pt-btn light small" href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer">Open in Maps</a> : null}
      </div>

      <div className="ow-cols">
        <div className="ow-block">
          <h3>Contact</h3>
          <dl className="pt-dl">
            <div><dt>Name</dt><dd>{name ?? "—"}</dd></div>
            <div><dt>Phone</dt><dd>{phone ? formatPhone(phone) : "—"}</dd></div>
            {email ? <div><dt>Email</dt><dd>{email}</dd></div> : null}
            {addressKey ? <div><dt>{ownerFieldLibrary[addressKey].label}</dt><dd>{address ?? "—"}</dd></div> : null}
          </dl>
        </div>
        {fields.length || extra ? (
          <div className="ow-block">
            <h3>Details</h3>
            <dl className="pt-dl">
              {fields.map((field) => (
                <div key={field.id}><dt>{field.label}</dt><dd className={field.id === "urgency" ? `ow-urgency ${field.value}` : undefined}>{pretty(field.value)}</dd></div>
              ))}
              {extra ? <div><dt>Notes</dt><dd>{extra}</dd></div> : null}
            </dl>
          </div>
        ) : null}
      </div>

      {detail.summary ? (
        <div className="ow-block">
          <h3>Summary</h3>
          <p className="ow-summary">{detail.summary}</p>
        </div>
      ) : null}

      {detail.recordingUrl ? (
        <div className="ow-block">
          <h3>Recording</h3>
          <audio controls preload="metadata" src={detail.recordingUrl} className="ow-audio" />
        </div>
      ) : null}

      {detail.turns.length ? (
        <details className="ow-transcript">
          <summary>Transcript</summary>
          <div className="pt-transcript">
            {detail.turns.map((turn, index) => (
              <p key={index} className={turn.role === "agent" ? "pt-turn agent" : turn.role === "user" ? "pt-turn user" : "pt-turn other"}>
                <span className="sr-only">{turn.role === "agent" ? "Receptionist" : "Caller"}: </span>
                {turn.text}
              </p>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  )
}

/* Bits ----------------------------------------------------------------------------- */

function EventDot({ kind }: { kind: OwnerEvent["kind"] }) {
  return <i className={`ow-dot ${kind}`} aria-hidden="true" />
}

function BellIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path d="M10 2.5a5 5 0 0 0-5 5v2.7c0 .5-.2 1-.5 1.4L3.3 13.3c-.4.5 0 1.2.6 1.2h12.2c.6 0 1-.7.6-1.2l-1.2-1.7c-.3-.4-.5-.9-.5-1.4V7.5a5 5 0 0 0-5-5Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 16.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/** Keeps the just-ended test call in the list even before Retell's list includes it. */
function withFocus(list: CallSummary[], focus: string | null, previous: CallSummary[] = []) {
  if (!focus || list.some((call) => call.id === focus)) return list
  const kept = previous.find((call) => call.id === focus) ?? { id: focus, status: "ended", direction: "web", number: "", startedAt: Date.now(), durationMs: null }
  return [kept, ...list]
}

function initials(name: string) {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, "").split(/\s+/).filter(Boolean)
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 2)).toUpperCase()
}

const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
const pretty = (value: string) => capital(value.replace(/_/g, " "))

function formatDuration(ms: number) {
  const seconds = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

function formatWhen(ms: number) {
  const date = new Date(ms)
  return date.toDateString() === new Date().toDateString() ? `Today ${formatTime(ms)}` : `${date.toLocaleDateString("en-US", { month: "short", day: "numeric" })} ${formatTime(ms)}`
}
