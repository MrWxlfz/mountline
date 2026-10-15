"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState, useSyncExternalStore } from "react"
import { formatPhone } from "@/components/receptionist-portal/studio/numbers"
import { staffHref } from "@/components/receptionist-portal/studio/test-call"
import type { CallDetail, CallSummary } from "@/lib/receptionist/retell"
import { getIndustry, type Industry } from "@/lib/receptionist/studio/industries"
import { ownerEvent, ownerFieldLibrary, readField, type OwnerEvent } from "@/lib/receptionist/studio/owner"
import { FAILED, OPEN, dataOf, useCallFeed, type Notice } from "./use-call-feed"

/*
 * A web simulation of the staff app, for demos. The real app will be native SwiftUI on iPad and
 * iPhone; this one copies its shape (split view on iPad, a navigation stack on iPhone, grouped
 * sections, system notification banners) so an owner can see what their front desk would use.
 * Everything in it is real call data from Retell; only the device around it is pretend.
 */

export type StaffInitial =
  | { ok: false; error: string }
  | {
      ok: true
      agentId: string
      receptionists: Array<{ id: string; name: string }>
      business: string
      industry: string
      demo: boolean
      calls: CallSummary[]
      /** The test call that just ended; it's watched until analyzed and gets a notification. */
      focusCallId: string | null
      loadedAt: number
    }

type Device = "ipad" | "iphone"
type Ready = Extract<StaffInitial, { ok: true }>

export function StaffApp({ initial }: { initial: StaffInitial }) {
  if (!initial.ok) {
    return (
      <main className="pt-main pt-narrow">
        <section className="pt-card">
          <h1>The staff app has nothing to show yet</h1>
          <p className="pt-error">{initial.error}</p>
          <p className="pt-muted"><Link href="/receptionist?view=studio" className="pt-linkbtn">Go to Studio</Link></p>
        </section>
      </main>
    )
  }
  return <Stage key={initial.agentId} initial={initial} />
}

/* The stage around the device ------------------------------------------------------------ */

const narrowQuery = "(max-width: 900px)"
const subscribeNarrow = (onChange: () => void) => {
  const media = window.matchMedia(narrowQuery)
  media.addEventListener("change", onChange)
  return () => media.removeEventListener("change", onChange)
}

function Stage({ initial }: { initial: Ready }) {
  const router = useRouter()
  const narrow = useSyncExternalStore(subscribeNarrow, () => window.matchMedia(narrowQuery).matches, () => false)
  const [picked, setPicked] = useState<Device | null>(null)
  // On a small screen there's only room for the phone.
  const device: Device = narrow ? "iphone" : picked ?? "ipad"

  return (
    <main className="ip-stage">
      <div className="ip-controls">
        <label className="ip-pick">
          <span className="pt-muted small">Receptionist</span>
          <select className="pt-input st-small-input" value={initial.agentId} onChange={(event) => router.push(staffHref(event.target.value))}>
            {initial.receptionists.map((entry) => <option key={entry.id} value={entry.id}>{entry.name}</option>)}
          </select>
        </label>
        {narrow ? null : (
          <div className="pt-views ip-device-pick" role="radiogroup" aria-label="Device">
            {(["ipad", "iphone"] as const).map((kind) => (
              <button key={kind} type="button" role="radio" aria-checked={device === kind} className="pt-view" aria-current={device === kind ? "page" : undefined} onClick={() => setPicked(kind)}>
                {kind === "ipad" ? "iPad" : "iPhone"}
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={`ip-device ${device}`}>
        <div className="ip-screen">
          <StaffScreen initial={initial} device={device} />
        </div>
      </div>

      <p className="ip-caption">
        A web preview of the {initial.business} staff app. The real one is a native iPad and iPhone app.
        {initial.demo ? " Bookings on this receptionist are simulated, so nothing is on a real calendar." : ""}
      </p>
    </main>
  )
}

/* The app ------------------------------------------------------------------------------- */

function StaffScreen({ initial, device }: { initial: Ready; device: Device }) {
  const industry = getIndustry(initial.industry)
  const feed = useCallFeed({ agentId: initial.agentId, industry, calls: initial.calls, focusCallId: initial.focusCallId, loadedAt: initial.loadedAt })
  const [selected, setSelected] = useState<string | null>(initial.focusCallId ?? initial.calls[0]?.id ?? null)
  // iPhone shows one screen at a time: the list, or a call pushed on top of it.
  const [pushed, setPushed] = useState(Boolean(initial.focusCallId))
  const [filter, setFilter] = useState<"all" | "priority">("all")
  const [inboxOpen, setInboxOpen] = useState(false)
  const { ensure } = feed

  useEffect(() => {
    if (selected) ensure(selected)
  }, [selected, ensure])

  function open(callId: string) {
    setSelected(callId)
    setPushed(true)
    setInboxOpen(false)
  }

  const priorityIds = new Set(
    feed.calls.filter((call) => {
      const detail = feed.details[call.id]
      return detail?.analyzed && ownerEvent(industry, dataOf(detail)).priority
    }).map((call) => call.id),
  )
  const visible = filter === "all" ? feed.calls : feed.calls.filter((call) => priorityIds.has(call.id))
  const detail = selected ? feed.details[selected] : undefined
  const summary = feed.calls.find((call) => call.id === selected) ?? null
  const showList = device === "ipad" || !pushed
  const showDetail = device === "ipad" || pushed

  return (
    <div className={`ip-app ${device}`}>
      <StatusBar />

      <div className="ip-split">
        {showList ? (
          <section className="ip-sidebar" aria-label="Calls">
            <div className="ip-navbar">
              <span className="ip-nav-spacer" />
              <button type="button" className="ip-toolbar-btn" aria-label={feed.unread ? `Notifications, ${feed.unread} new` : "Notifications"} onClick={() => { setInboxOpen(true); feed.markRead() }}>
                <BellIcon />
                {feed.unread ? <i className="ip-badge">{feed.unread}</i> : null}
              </button>
            </div>
            <h1 className="ip-large-title">Calls</h1>
            <p className="ip-subtitle">{initial.business}</p>
            <div className="ip-segmented" role="tablist" aria-label="Filter calls">
              <button type="button" role="tab" aria-selected={filter === "all"} onClick={() => setFilter("all")}>All</button>
              <button type="button" role="tab" aria-selected={filter === "priority"} onClick={() => setFilter("priority")}>Priority</button>
            </div>
            {visible.length ? (
              <ul className="ip-list">
                {visible.map((call) => (
                  <li key={call.id}>
                    <CallCell call={call} detail={feed.details[call.id]} industry={industry} on={device === "ipad" && call.id === selected} onOpen={() => open(call.id)} />
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ip-empty">{filter === "priority" ? "No appointments, urgent calls, or leads yet." : "No calls yet. Call the receptionist and it shows up here."}</p>
            )}
          </section>
        ) : null}

        {showDetail ? (
          <section className="ip-detail" aria-live="polite">
            {device === "iphone" ? (
              <div className="ip-navbar">
                <button type="button" className="ip-back" onClick={() => setPushed(false)}><Chevron />Calls</button>
              </div>
            ) : null}
            {selected ? (
              <CallScreen key={selected} summary={summary} detail={detail} error={feed.errors[selected] ?? null} industry={industry} watching={feed.watched.includes(selected)} demo={initial.demo} />
            ) : (
              <div className="ip-placeholder">
                <PhoneIcon />
                <p>Select a call</p>
              </div>
            )}
          </section>
        ) : null}
      </div>

      <div className="ip-banners" aria-live="assertive">
        {feed.banners.map((notice) => (
          <button key={notice.id} type="button" className="ip-banner" onClick={() => { feed.dismissBanner(notice.id); open(notice.callId) }}>
            <AppIcon name={initial.business} />
            <span className="ip-banner-body">
              <span className="ip-banner-top"><b>{notice.event.title}</b><time>now</time></span>
              <span className="ip-banner-text">{bannerText(notice)}</span>
            </span>
          </button>
        ))}
      </div>

      {inboxOpen ? (
        <div className="ip-sheet-wrap" onClick={() => setInboxOpen(false)}>
          <div className="ip-sheet" role="dialog" aria-label="Notifications" onClick={(event) => event.stopPropagation()}>
            <div className="ip-sheet-grabber" aria-hidden="true" />
            <div className="ip-sheet-h">
              <b>Notifications</b>
              <button type="button" className="ip-link" onClick={() => setInboxOpen(false)}>Done</button>
            </div>
            <p className="ip-footnote">Only appointments, urgent calls, and leads notify you.</p>
            {feed.inbox.length ? (
              <ul className="ip-group">
                {feed.inbox.map((notice) => (
                  <li key={notice.id}>
                    <button type="button" className="ip-row ip-row-btn" onClick={() => open(notice.callId)}>
                      <EventDot kind={notice.event.kind} />
                      <span className="ip-row-main"><b>{notice.event.title}</b><small>{bannerText(notice)}</small></span>
                      <time className="ip-row-meta">{formatTime(notice.at)}</time>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="ip-empty">Nothing yet.</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

/* Call list cell ------------------------------------------------------------------------- */

function CallCell({ call, detail, industry, on, onOpen }: { call: CallSummary; detail: CallDetail | undefined; industry: Industry; on: boolean; onOpen: () => void }) {
  const data = dataOf(detail)
  const event = detail?.analyzed ? ownerEvent(industry, data) : null
  const name = readField(data, "caller_name")
  const live = OPEN.has(call.status)
  const title = name ?? (call.number ? formatPhone(call.number) : call.direction === "web" ? "Web call" : "Unknown caller")
  const line = live ? "On the phone now" : event ? (event.priority ? event.title : readField(data, "reason") ?? "Caller") : FAILED.has(call.status) ? "Didn't connect" : "Processing…"
  return (
    <button type="button" className={on ? "ip-cell on" : "ip-cell"} onClick={onOpen} aria-current={on || undefined}>
      <EventDot kind={live ? "live" : event?.priority ? event.kind : "info"} />
      <span className="ip-cell-main">
        <span className="ip-cell-top"><b>{title}</b><time>{call.startedAt ? formatShort(call.startedAt) : ""}</time></span>
        <span className="ip-cell-line">{line}{event?.priority && event.line ? ` · ${event.line}` : ""}</span>
      </span>
    </button>
  )
}

/* Call screen ------------------------------------------------------------------------- */

function CallScreen({ summary, detail, error, industry, watching, demo }: { summary: CallSummary | null; detail: CallDetail | undefined; error: string | null; industry: Industry; watching: boolean; demo: boolean }) {
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const status = detail?.status ?? summary?.status ?? null
  const number = detail?.number || summary?.number || ""
  const startedAt = detail?.startedAt ?? summary?.startedAt ?? null
  const durationMs = detail?.durationMs ?? summary?.durationMs ?? null

  if (!detail?.analyzed) {
    const live = status ? OPEN.has(status) : false
    const failed = status ? FAILED.has(status) : false
    const message = failed
      ? "This call didn't connect."
      : live
        ? (summary?.direction ?? detail?.direction) === "web"
          ? "Wrapping up the call…"
          : "On the phone now. Details appear when the call ends."
        : watching
          ? "Pulling out the details…"
          : "Details aren't ready yet."
    return (
      <div className="ip-scroll">
        <header className="ip-hero-head">
          <h2>{number ? formatPhone(number) : "New call"}</h2>
          <p>{[startedAt ? formatWhen(startedAt) : null, durationMs ? formatDuration(durationMs) : null].filter(Boolean).join(" · ")}</p>
        </header>
        <div className="ip-progress">
          {failed ? null : <span className="ip-spinner" aria-hidden="true" />}
          <span>{message}</span>
        </div>
        <ul className="ip-group ip-redacted" aria-hidden="true">
          <li className="ip-row"><i /><i /></li>
          <li className="ip-row"><i /><i /></li>
          <li className="ip-row"><i /><i /></li>
        </ul>
        {error ? <p className="ip-error">{error}</p> : null}
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
  const notes = get("details")
  const when = get("booked_for")
  const service = [get("service"), get("staff_preference") ? `with ${get("staff_preference")}` : null].filter(Boolean).join(" ")
  const visit = industry.visit.split(" or ")[0]
  const booked = get("outcome") === "booked" || get("outcome") === "rescheduled"

  return (
    <div className="ip-scroll">
      <header className="ip-hero-head">
        <span className="ip-avatar" aria-hidden="true">{initials(name ?? "?")}</span>
        <h2>{name ?? (phone ? formatPhone(phone) : "Unknown caller")}</h2>
        <p>{[detail.startedAt ? formatWhen(detail.startedAt) : null, detail.durationMs ? formatDuration(detail.durationMs) : null].filter(Boolean).join(" · ")}</p>
        <div className="ip-actions">
          {phone ? <a className="ip-action" href={`tel:${phone.replace(/[^\d+]/g, "")}`}><PhoneIcon /><span>call</span></a> : null}
          {address ? <a className="ip-action" href={`https://maps.apple.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer"><PinIcon /><span>directions</span></a> : null}
          {email ? <a className="ip-action" href={`mailto:${email}`}><MailIcon /><span>mail</span></a> : null}
        </div>
      </header>

      {event.kind !== "info" || get("reason") ? (
        <>
          <div className={`ip-event ${event.kind}`}>
            <span className="ip-event-label">{event.kind === "appointment" ? capital(visit) : event.kind === "info" ? "Called about" : event.title}</span>
            <b>{event.kind === "appointment" || event.kind === "change" ? when ?? "Time not set" : get("issue") ?? get("reason") ?? event.title}</b>
            {event.kind === "appointment" || event.kind === "change" ? (service ? <span>{service}</span> : null) : null}
            {event.kind === "urgent" && address ? <span>{address}</span> : null}
            {event.kind !== "appointment" && event.kind !== "change" && when ? <span>{booked ? `Booked: ${when}` : `Prefers ${when}`}</span> : null}
          </div>
          {demo && booked ? <p className="ip-footnote">Demo booking. Nothing was added to a real calendar.</p> : null}
        </>
      ) : null}

      <Group title="Contact">
        <Row label="Name" value={name} />
        <Row label="Phone" value={phone ? formatPhone(phone) : null} href={phone ? `tel:${phone.replace(/[^\d+]/g, "")}` : undefined} />
        {email ? <Row label="Email" value={email} href={`mailto:${email}`} /> : null}
        {addressKey ? <Row label={ownerFieldLibrary[addressKey].label} value={address} href={address ? `https://maps.apple.com/?q=${encodeURIComponent(address)}` : undefined} /> : null}
      </Group>

      {fields.length || notes ? (
        <Group title="Details">
          {fields.map((field) => <Row key={field.id} label={field.label} value={pretty(field.value)} tone={field.id === "urgency" ? field.value : undefined} />)}
          {notes ? <Row label="Notes" value={notes} /> : null}
        </Group>
      ) : null}

      {detail.summary ? (
        <Group title="Summary">
          <li className="ip-row ip-text">{detail.summary}</li>
        </Group>
      ) : null}

      {detail.recordingUrl ? (
        <Group title="Recording">
          <li className="ip-row ip-audio"><audio controls preload="metadata" src={detail.recordingUrl} /></li>
        </Group>
      ) : null}

      {detail.turns.length ? (
        <Group>
          <li>
            <button type="button" className="ip-row ip-row-btn" aria-expanded={transcriptOpen} onClick={() => setTranscriptOpen(!transcriptOpen)}>
              <span className="ip-row-main"><b>Transcript</b></span>
              <span className={transcriptOpen ? "ip-disclose open" : "ip-disclose"} aria-hidden="true"><Chevron /></span>
            </button>
          </li>
          {transcriptOpen ? (
            <li className="ip-row ip-bubbles">
              {detail.turns.map((turn, index) => (
                <p key={index} className={turn.role === "agent" ? "ip-bubble agent" : turn.role === "user" ? "ip-bubble caller" : "ip-bubble other"}>
                  <span className="sr-only">{turn.role === "agent" ? "Receptionist" : "Caller"}: </span>
                  {turn.text}
                </p>
              ))}
            </li>
          ) : null}
        </Group>
      ) : null}
    </div>
  )
}

function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  return (
    <section className="ip-section">
      {title ? <h3 className="ip-section-h">{title}</h3> : null}
      <ul className="ip-group">{children}</ul>
    </section>
  )
}

function Row({ label, value, href, tone }: { label: string; value: string | null; href?: string; tone?: string }) {
  return (
    <li className="ip-row">
      <span className="ip-row-label">{label}</span>
      {value && href ? (
        <a className="ip-row-value ip-link" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{value}</a>
      ) : (
        <span className={`ip-row-value${tone ? ` tone-${tone}` : ""}`}>{value ?? "—"}</span>
      )}
    </li>
  )
}

/* System chrome ----------------------------------------------------------------------- */

function StatusBar() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15_000)
    return () => window.clearInterval(timer)
  }, [])
  return (
    <div className="ip-status" aria-hidden="true">
      <time suppressHydrationWarning>{now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M$/, "")}</time>
      <span className="ip-status-icons">
        <svg viewBox="0 0 18 12" width="17" height="11"><path d="M1 9h2v2H1zM5 7h2v4H5zM9 4h2v7H9zM13 1h2v10h-2z" fill="currentColor" /></svg>
        <svg viewBox="0 0 16 12" width="15" height="11"><path d="M8 10.5a1.2 1.2 0 1 0 0-.01M4.6 7.6a4.8 4.8 0 0 1 6.8 0M2.4 5.4a7.9 7.9 0 0 1 11.2 0M.4 3.3a10.8 10.8 0 0 1 15.2 0" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
        <span className="ip-battery"><i /></span>
      </span>
    </div>
  )
}

function AppIcon({ name }: { name: string }) {
  return <span className="ip-app-icon" aria-hidden="true">{initials(name)}</span>
}

function EventDot({ kind }: { kind: OwnerEvent["kind"] | "live" }) {
  return <i className={`ip-dot ${kind}`} aria-hidden="true" />
}

function BellIcon() {
  return (
    <svg viewBox="0 0 20 20" width="21" height="21" aria-hidden="true">
      <path d="M10 2.5a5 5 0 0 0-5 5v2.7c0 .5-.2 1-.5 1.4L3.3 13.3c-.4.5 0 1.2.6 1.2h12.2c.6 0 1-.7.6-1.2l-1.2-1.7c-.3-.4-.5-.9-.5-1.4V7.5a5 5 0 0 0-5-5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M8 16.5a2 2 0 0 0 4 0" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path d="M5.2 2.5h2.1l1.2 3.4-1.6 1.2a9.6 9.6 0 0 0 6 6l1.2-1.6 3.4 1.2v2.1c0 .9-.8 1.7-1.7 1.6A14.4 14.4 0 0 1 3.6 4.2c-.1-.9.7-1.7 1.6-1.7Z" fill="currentColor" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path d="M10 1.8a6 6 0 0 0-6 6c0 4.4 6 10.4 6 10.4s6-6 6-10.4a6 6 0 0 0-6-6Zm0 8.3a2.3 2.3 0 1 1 0-4.6 2.3 2.3 0 0 1 0 4.6Z" fill="currentColor" />
    </svg>
  )
}

function MailIcon() {
  return (
    <svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true">
      <path d="M2.5 4.5h15v11h-15z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="m3 5 7 6 7-6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function Chevron() {
  return (
    <svg viewBox="0 0 12 20" width="11" height="18" aria-hidden="true">
      <path d="M10 2 2 10l8 8" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* Formatting ------------------------------------------------------------------------- */

function bannerText(notice: Notice) {
  const line = notice.event.line
  return line || (notice.caller ? `${notice.caller} called` : "Tap to see the call")
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

function formatShort(ms: number) {
  const date = new Date(ms)
  return date.toDateString() === new Date().toDateString() ? formatTime(ms) : date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })
}

function formatWhen(ms: number) {
  const date = new Date(ms)
  return date.toDateString() === new Date().toDateString() ? `Today at ${formatTime(ms)}` : `${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${formatTime(ms)}`
}
