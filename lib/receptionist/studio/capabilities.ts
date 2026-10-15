/*
 * What a Studio receptionist can be asked to do. Voice capabilities shape the generated prompt; SMS
 * capabilities are listed so the builder can show what's coming, but nothing here sends a text and the
 * voice prompt generator never reads them. A future SMS integration adds its own channel handler.
 */

export const voiceCapabilityIds = [
  "scheduling",
  "changes",
  "faq",
  "intake",
  "quotes",
  "urgent",
  "after_hours",
  "messages",
  "callback",
  "pricing",
] as const

export type VoiceCapabilityId = (typeof voiceCapabilityIds)[number]

export type CapabilityDefinition = {
  id: VoiceCapabilityId
  label: string
  hint: string
  channel: "voice"
}

export const voiceCapabilities: Record<VoiceCapabilityId, CapabilityDefinition> = {
  scheduling: { id: "scheduling", label: "Appointment scheduling", hint: "Books in demo mode; takes requests in live mode", channel: "voice" },
  changes: { id: "changes", label: "Rescheduling & cancellations", hint: "Moves or cancels an existing booking", channel: "voice" },
  faq: { id: "faq", label: "Frequently asked questions", hint: "Answers from the business context you give it", channel: "voice" },
  intake: { id: "intake", label: "Customer information collection", hint: "Name, number, and the details this industry needs", channel: "voice" },
  quotes: { id: "quotes", label: "Estimate & quote requests", hint: "Gathers what's needed for a quote", channel: "voice" },
  urgent: { id: "urgent", label: "Urgent call handling", hint: "Spots emergencies and routes them correctly", channel: "voice" },
  after_hours: { id: "after_hours", label: "After-hours assistance", hint: "Knows when you're closed and still helps", channel: "voice" },
  messages: { id: "messages", label: "Message taking", hint: "Takes a clean message for someone", channel: "voice" },
  callback: { id: "callback", label: "Human callback requests", hint: "Live transfer isn't connected; it takes a callback", channel: "voice" },
  pricing: { id: "pricing", label: "Service & pricing inquiries", hint: "Uses prices from the context, never invents them", channel: "voice" },
}

/** Planned text-message features. Not implemented: no provider, webhook, or storage exists for them. */
export const plannedSmsCapabilities = [
  { id: "sms_confirmation", label: "Appointment confirmation texts", channel: "sms", status: "planned" },
  { id: "sms_missed_call", label: "Missed-call follow-ups", channel: "sms", status: "planned" },
  { id: "sms_reminder", label: "Booking reminders", channel: "sms", status: "planned" },
  { id: "sms_lead_alert", label: "Lead notifications", channel: "sms", status: "planned" },
  { id: "sms_staff_escalation", label: "Staff escalation messages", channel: "sms", status: "planned" },
] as const

/** Keeps a capability list in the canonical order, without duplicates or unknown ids. */
export function normalizeCapabilities(ids: readonly string[]): VoiceCapabilityId[] {
  const wanted = new Set(ids)
  return voiceCapabilityIds.filter((id) => wanted.has(id))
}
