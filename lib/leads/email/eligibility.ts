import type { FollowupMode } from "./config.ts"
import { addBusinessDays } from "./schedule.ts"
import type { EmailKind } from "./kinds.ts"

/**
 * Whether a queued email should go out right now. Checked when the worker is about to send,
 * not when the email was queued, so a pause, reply, bounce, or status change always wins.
 */

export type LeadState = {
  status: string | null
  created_at: string
  contacted_at: string | null
  customer_replied_at: string | null
  followup_paused_at: string | null
  followup_opted_out_at: string | null
  email_suppressed_at: string | null
}

export type JobState = {
  kind: EmailKind
  approved_at: string | null
}

export type FollowupRules = {
  customerFollowup: FollowupMode
  checkinBusinessDays: number
  ownerReminderBusinessDays: number
  timeZone: string
}

export type SkipReason =
  | "suppressed"
  | "opted_out"
  | "customer_replied"
  | "inquiry_handled"
  | "not_awaiting_customer"
  | "followups_off"
  | "checkin_not_pending"

export type Decision =
  | { action: "send" }
  | { action: "skip"; reason: SkipReason }
  | { action: "hold" }
  | { action: "await_approval" }
  | { action: "reschedule"; at: Date }

const UNHANDLED = new Set(["new", "reviewed"])

export function checkinDueAt(lead: Pick<LeadState, "contacted_at">, rules: FollowupRules) {
  return lead.contacted_at ? addBusinessDays(new Date(lead.contacted_at), rules.checkinBusinessDays, rules.timeZone) : null
}

export function ownerReminderDueAt(createdAt: Date, rules: FollowupRules) {
  return addBusinessDays(createdAt, rules.ownerReminderBusinessDays, rules.timeZone)
}

function repliedSinceContact(lead: LeadState) {
  if (!lead.customer_replied_at) return false
  if (!lead.contacted_at) return true
  return new Date(lead.customer_replied_at).getTime() >= new Date(lead.contacted_at).getTime()
}

export function decide(job: JobState, lead: LeadState, rules: FollowupRules, now: Date, context: { checkinAwaitingApproval?: boolean } = {}): Decision {
  switch (job.kind) {
    case "owner_notification":
      return { action: "send" }

    case "customer_acknowledgment":
      return lead.email_suppressed_at ? { action: "skip", reason: "suppressed" } : { action: "send" }

    case "owner_reminder":
      // Only for an inquiry nobody has answered yet.
      if (!UNHANDLED.has(lead.status || "")) return { action: "skip", reason: "inquiry_handled" }
      if (lead.followup_paused_at) return { action: "hold" }
      return { action: "send" }

    case "owner_checkin_prompt":
      if (lead.followup_paused_at) return { action: "hold" }
      if (lead.status !== "contacted") return { action: "skip", reason: "not_awaiting_customer" }
      if (repliedSinceContact(lead)) return { action: "skip", reason: "customer_replied" }
      if (!context.checkinAwaitingApproval) return { action: "skip", reason: "checkin_not_pending" }
      return { action: "send" }

    case "customer_checkin": {
      if (rules.customerFollowup === "off") return { action: "skip", reason: "followups_off" }
      if (lead.status !== "contacted" || !lead.contacted_at) return { action: "skip", reason: "not_awaiting_customer" }
      if (lead.followup_opted_out_at) return { action: "skip", reason: "opted_out" }
      if (lead.email_suppressed_at) return { action: "skip", reason: "suppressed" }
      if (repliedSinceContact(lead)) return { action: "skip", reason: "customer_replied" }
      if (lead.followup_paused_at) return { action: "hold" }
      const due = checkinDueAt(lead, rules)!
      if (now.getTime() < due.getTime()) return { action: "reschedule", at: due }
      if (rules.customerFollowup === "approval" && !job.approved_at) return { action: "await_approval" }
      return { action: "send" }
    }
  }
}
