import "server-only"

import type {
  SignalContactReadiness,
  SignalOutreachEvent,
  SignalOutreachEventType,
  SignalOutreachHistory,
  SignalOutreachStatus,
  SignalProspect,
} from "@/lib/supabase/types"

const NOTE_OUTREACH_PATTERNS = [
  /already\s+(sent\s+an\s+)?email/i,
  /emailed\s+(and\s+)?(waiting|awaiting)/i,
  /waiting\s+for\s+(a\s+)?response/i,
  /awaiting\s+reply/i,
  /dm\s+(sent|attempted)/i,
  /called\s+(already|before)?/i,
]

export function notesSuggestPriorOutreach(prospect: SignalProspect) {
  const text = [
    prospect.human_notes,
    prospect.locality_relationship,
    prospect.what_looks_good,
    prospect.visible_problem,
  ]
    .filter(Boolean)
    .join(" ")
  return NOTE_OUTREACH_PATTERNS.some((pattern) => pattern.test(text))
}

export function hasRecordedPriorOutreach(events: SignalOutreachEvent[]) {
  return events.some(
    (event) =>
      event.direction === "outbound" &&
      [
        "attempted",
        "delivered",
        "voicemail_left",
        "permission_to_send_demo",
        "demo_sent",
        "follow_up_sent",
      ].includes(event.event_type),
  )
}

export function hasRecordedReply(events: SignalOutreachEvent[]) {
  return events.some((event) =>
    ["replied", "permission_to_send_demo", "discovery_call_booked", "interested", "declined"].includes(
      event.event_type,
    ),
  )
}

export function getLatestOutboundEvent(events: SignalOutreachEvent[]) {
  return events.find((event) => event.direction === "outbound") || null
}

export function deriveOutreachHistoryFromEvents(events: SignalOutreachEvent[]): SignalOutreachHistory {
  const latest = getLatestOutboundEvent(events)
  if (!latest) return "never_contacted"
  if (latest.follow_up_date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(`${latest.follow_up_date}T00:00:00`)
    if (!Number.isNaN(due.getTime()) && due <= today && !hasRecordedReply(events)) {
      return "follow_up_due"
    }
  }
  if (latest.channel === "email") return hasRecordedReply(events) ? "emailed" : "awaiting_reply"
  if (latest.channel === "call" || latest.channel === "voicemail") return "called"
  if (latest.channel === "instagram") return "dm_attempted"
  return "awaiting_reply"
}

export function statusFromOutreachEvent(eventType: SignalOutreachEventType): SignalOutreachStatus {
  if (eventType === "do_not_contact") return "do_not_contact"
  if (eventType === "declined") return "lost"
  if (eventType === "interested") return "interested"
  if (eventType === "discovery_call_booked") return "discovery_call"
  if (eventType === "permission_to_send_demo") return "permission_to_send_demo"
  if (eventType === "demo_sent") return "demo_sent"
  if (eventType === "replied") return "interested"
  if (["attempted", "delivered", "voicemail_left", "follow_up_sent"].includes(eventType)) {
    return "awaiting_reply"
  }
  return "contacted"
}

export function getContactReadiness(
  prospect: SignalProspect,
  events: SignalOutreachEvent[] = [],
  suppressed = false,
): {
  state: SignalContactReadiness
  reason: string
} {
  if (suppressed || prospect.outreach_status === "do_not_contact") {
    return { state: "suppressed", reason: "Prospect is suppressed or marked do-not-contact." }
  }
  if (prospect.public_email) {
    return { state: "verified_email_available", reason: "A public email is saved for this prospect." }
  }
  if (prospect.public_phone) {
    return { state: "verified_phone_available", reason: "A public phone number is saved for this prospect." }
  }
  if (prospect.public_contact_form_url) {
    return { state: "verified_contact_form_available", reason: "A public contact form URL is saved." }
  }
  if (prospect.instagram_url) {
    return {
      state: "verified_social_contact_available",
      reason: "A public social contact route is saved, but social pages are not scraped by Signal.",
    }
  }
  if (hasRecordedPriorOutreach(events)) {
    return {
      state: "contact_history_only",
      reason: "Prior outreach is recorded, but the usable contact address/route is not saved.",
    }
  }
  return {
    state: "contact_missing",
    reason: "No public email, phone, contact form, or approved contact route is saved.",
  }
}

export function contactReadinessLabel(state: SignalContactReadiness) {
  return {
    verified_email_available: "Verified email available",
    verified_phone_available: "Verified phone available",
    verified_contact_form_available: "Verified contact form available",
    verified_social_contact_available: "Verified social contact available",
    contact_missing: "Contact missing",
    contact_history_only: "Contact history only",
    suppressed: "Suppressed",
  }[state]
}

