"use client"

import { useState } from "react"
import { formatPhone } from "@/components/receptionist-portal/studio/numbers"
import type { CallDetail, CallSummary } from "@/lib/receptionist/retell"
import type { Industry } from "@/lib/receptionist/studio/industries"
import type { Integration } from "@/lib/receptionist/studio/integrations"
import { ownerEvent, ownerFieldLibrary, readField, type OwnerEvent } from "@/lib/receptionist/studio/owner"
import { ChevronRight, MailIcon, PhoneIcon, PinIcon, SendIcon } from "./icons"
import { Alert, Group, Row } from "./ios"
import { FAILED, OPEN, dataOf } from "./use-call-feed"

/* A call in the list, and the full call screen. */

export function EventDot({ kind }: { kind: OwnerEvent["kind"] | "live" }) {
  return <i className={`ip-dot ${kind}`} aria-hidden="true" />
}

export function CallCell({ call, detail, industry, on, onOpen }: { call: CallSummary; detail: CallDetail | undefined; industry: Industry; on: boolean; onOpen: () => void }) {
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

export function CallScreen({
  summary,
  detail,
  error,
  industry,
  watching,
  demo,
  linked,
}: {
  summary: CallSummary | null
  detail: CallDetail | undefined
  error: string | null
  industry: Industry
  watching: boolean
  demo: boolean
  /** Apps linked in Settings (demo), which change what a booked call shows. */
  linked: Integration[]
}) {
  const [transcriptOpen, setTranscriptOpen] = useState(false)
  const [alert, setAlert] = useState<{ title: string; message: string } | null>(null)
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
  const square = linked.find((integration) => integration.id === "square")
  const destination = square ?? linked.find((integration) => integration.category === "Calendar")

  return (
    <div className="ip-scroll">
      <header className="ip-hero-head">
        <span className="ip-avatar" aria-hidden="true">{initials(name ?? "?")}</span>
        <h2>{name ?? (phone ? formatPhone(phone) : "Unknown caller")}</h2>
        <p>{[detail.startedAt ? formatWhen(detail.startedAt) : null, detail.durationMs ? formatDuration(detail.durationMs) : null].filter(Boolean).join(" · ")}</p>
        <div className="ip-actions">
          {phone ? <a className="ip-action" href={`tel:${phone.replace(/[^\d+]/g, "")}`}><PhoneIcon /><span>call</span></a> : null}
          {square && phone ? (
            <button type="button" className="ip-action" onClick={() => setAlert({ title: "Send booking link", message: `Demo: with Square linked, this would text ${name ?? "the caller"} a booking link. Nothing is sent from this preview.` })}>
              <SendIcon /><span>link</span>
            </button>
          ) : null}
          {address ? <a className="ip-action" href={`https://maps.apple.com/?q=${encodeURIComponent(address)}`} target="_blank" rel="noreferrer"><PinIcon /><span>directions</span></a> : null}
          {email ? <a className="ip-action" href={`mailto:${email}`}><MailIcon /><span>mail</span></a> : null}
        </div>
      </header>

      {event.kind !== "info" || get("reason") ? (
        <Group
          footer={
            booked && destination
              ? `${destination.effect} once it's really connected. This is a demo, so it isn't.`
              : demo && booked
                ? "Demo booking. Nothing was added to a real calendar."
                : undefined
          }
        >
          <li className={`ip-event ${event.kind}`}>
            <span className="ip-event-label">{event.kind === "appointment" ? capital(visit) : event.kind === "info" ? "Called about" : event.title}</span>
            <b>{event.kind === "appointment" || event.kind === "change" ? when ?? "Time not set" : get("issue") ?? get("reason") ?? event.title}</b>
            {(event.kind === "appointment" || event.kind === "change") && service ? <span>{service}</span> : null}
            {event.kind === "urgent" && address ? <span>{address}</span> : null}
            {event.kind !== "appointment" && event.kind !== "change" && when ? <span>{booked ? `Booked: ${when}` : `Prefers ${when}`}</span> : null}
          </li>
        </Group>
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
            <button type="button" className="ip-row ip-nav-row" aria-expanded={transcriptOpen} onClick={() => setTranscriptOpen(!transcriptOpen)}>
              <span className="ip-row-main"><b>Transcript</b></span>
              <span className="ip-row-meta">{detail.turns.length} lines</span>
              <span className={transcriptOpen ? "ip-chevron open" : "ip-chevron"}><ChevronRight /></span>
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

      {alert ? <Alert title={alert.title} message={alert.message} onClose={() => setAlert(null)} /> : null}
    </div>
  )
}

/* Formatting --------------------------------------------------------------------------- */

export function initials(name: string) {
  const words = name.replace(/[^\p{L}\p{N} ]/gu, "").split(/\s+/).filter(Boolean)
  return (words.length > 1 ? words[0][0] + words[1][0] : (words[0] ?? "?").slice(0, 2)).toUpperCase()
}

const capital = (text: string) => text.charAt(0).toUpperCase() + text.slice(1)
const pretty = (value: string) => capital(value.replace(/_/g, " "))

export function formatDuration(ms: number) {
  const seconds = Math.max(0, Math.round(ms / 1000))
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`
}

export function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })
}

export function formatShort(ms: number) {
  const date = new Date(ms)
  return date.toDateString() === new Date().toDateString() ? formatTime(ms) : date.toLocaleDateString("en-US", { month: "numeric", day: "numeric" })
}

export function formatWhen(ms: number) {
  const date = new Date(ms)
  return date.toDateString() === new Date().toDateString() ? `Today at ${formatTime(ms)}` : `${date.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })} at ${formatTime(ms)}`
}
