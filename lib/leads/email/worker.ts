import { canSendEmail, type InquiryEmailSettings } from "./config.ts"
import { checkinDueAt, decide, type FollowupRules, type LeadState } from "./eligibility.ts"
import { idempotencyKeyFor, type EmailSender } from "./provider.ts"
import { buildEmail, EmailTemplateError, type EmailKind, type LeadForEmail } from "./templates.ts"

/**
 * The outbox worker. Safe to run from the form, the dashboard, and the scheduled job at the same
 * time: jobs are leased in the database, sends carry a per-job idempotency key, and results are
 * written only while the lease is still held.
 */

export type JobStatus =
  | "queued" | "sending" | "retry" | "awaiting_approval" | "accepted" | "delayed" | "delivered"
  | "bounced" | "complained" | "failed" | "skipped" | "cancelled"

export type ClaimedJob = {
  id: string
  lead_id: string
  kind: EmailKind
  attempts: number
  max_attempts: number
  lease_token: string
  approved_at: string | null
}

export type LeadRecord = LeadForEmail & LeadState

export type JobPatch = {
  status: JobStatus
  send_after?: string
  attempts?: number
  provider_message_id?: string | null
  provider_accepted_at?: string
  last_error?: string | null
  skip_reason?: string | null
}

export interface EmailStore {
  claim(options: { limit: number; leaseSeconds: number; leadId?: string }): Promise<ClaimedJob[]>
  loadLead(leadId: string): Promise<LeadRecord | null>
  checkinAwaitingApproval(leadId: string): Promise<boolean>
  /** Applies the patch and releases the lease, only if `leaseToken` still holds it. */
  finish(jobId: string, leaseToken: string, patch: JobPatch): Promise<boolean>
  /** Creates the job unless one of that kind already exists for the inquiry. */
  ensureJob(leadId: string, kind: EmailKind, sendAfter: Date): Promise<void>
  leadsAwaitingCheckinJob(limit: number): Promise<Array<{ id: string; contacted_at: string }>>
}

export type QueueSummary = {
  configured: boolean
  missing: string[]
  claimed: number
  accepted: number
  retrying: number
  failed: number
  skipped: number
  awaitingApproval: number
  rescheduled: number
  leaseLost: number
}

const BASE_RETRY_MINUTES = 5
const MAX_RETRY_MINUTES = 6 * 60

export function retryDelayMs(attempts: number, retryAfterSeconds?: number) {
  const minutes = Math.min(MAX_RETRY_MINUTES, BASE_RETRY_MINUTES * 2 ** Math.max(0, attempts - 1))
  return Math.max(minutes * 60_000, (retryAfterSeconds || 0) * 1000)
}

export function rulesFrom(settings: InquiryEmailSettings): FollowupRules {
  return {
    customerFollowup: settings.customerFollowup,
    checkinBusinessDays: settings.checkinBusinessDays,
    ownerReminderBusinessDays: settings.ownerReminderBusinessDays,
    timeZone: settings.timeZone,
  }
}

/** Queue a customer check-in for every inquiry that is waiting on the customer and has none yet. */
export async function scheduleCheckins(store: EmailStore, settings: InquiryEmailSettings) {
  if (settings.customerFollowup === "off") return 0
  const rules = rulesFrom(settings)
  const leads = await store.leadsAwaitingCheckinJob(100)
  for (const lead of leads) {
    const due = checkinDueAt(lead, rules)
    if (due) await store.ensureJob(lead.id, "customer_checkin", due)
  }
  return leads.length
}

export async function processEmailQueue(options: {
  store: EmailStore
  send: EmailSender | null
  settings: InquiryEmailSettings
  now?: () => Date
  leadId?: string
  limit?: number
}): Promise<QueueSummary> {
  const { store, send, settings } = options
  const now = options.now || (() => new Date())
  const summary: QueueSummary = {
    configured: canSendEmail(settings) && Boolean(send),
    missing: settings.missing,
    claimed: 0,
    accepted: 0,
    retrying: 0,
    failed: 0,
    skipped: 0,
    awaitingApproval: 0,
    rescheduled: 0,
    leaseLost: 0,
  }
  // Without settings nothing is claimed, so no attempts are used up and the queue waits intact.
  if (!summary.configured || !send) return summary

  const rules = rulesFrom(settings)
  const from = settings.from!

  // A second pass picks up anything the first pass created, such as a check-in prompt.
  for (let pass = 0; pass < 3; pass++) {
    const jobs = await store.claim({ limit: options.limit ?? 10, leaseSeconds: 120, leadId: options.leadId })
    if (!jobs.length) break
    summary.claimed += jobs.length

    for (const job of jobs) {
      const finish = async (patch: JobPatch) => {
        const held = await store.finish(job.id, job.lease_token, patch)
        if (!held) summary.leaseLost++
        return held
      }
      // Decisions that do not send give the attempt back.
      const unspent = job.attempts - 1

      const lead = await store.loadLead(job.lead_id)
      if (!lead) {
        await finish({ status: "cancelled", attempts: unspent, skip_reason: "inquiry_deleted" })
        summary.skipped++
        continue
      }

      const decision = decide(job, lead, rules, now(), {
        checkinAwaitingApproval: job.kind === "owner_checkin_prompt" ? await store.checkinAwaitingApproval(lead.id) : undefined,
      })

      if (decision.action === "skip") {
        await finish({ status: "skipped", attempts: unspent, skip_reason: decision.reason })
        summary.skipped++
        continue
      }
      if (decision.action === "hold") {
        await finish({ status: "queued", attempts: unspent, send_after: new Date(now().getTime() + 12 * 3_600_000).toISOString() })
        summary.rescheduled++
        continue
      }
      if (decision.action === "reschedule") {
        await finish({ status: "queued", attempts: unspent, send_after: decision.at.toISOString() })
        summary.rescheduled++
        continue
      }
      if (decision.action === "await_approval") {
        if (await finish({ status: "awaiting_approval", attempts: unspent, last_error: null })) {
          await store.ensureJob(lead.id, "owner_checkin_prompt", now())
        }
        summary.awaitingApproval++
        continue
      }

      let email
      try {
        email = buildEmail(job.kind, lead, job.id, settings)
      } catch (error) {
        const message = error instanceof EmailTemplateError ? error.message : "The email could not be prepared."
        await finish({ status: "failed", last_error: message })
        summary.failed++
        continue
      }

      const result = await send(email, { idempotencyKey: idempotencyKeyFor(job.id), from })
      if (result.outcome === "accepted") {
        await finish({
          status: "accepted",
          provider_message_id: result.providerMessageId,
          provider_accepted_at: now().toISOString(),
          last_error: result.note || null,
        })
        summary.accepted++
      } else if (result.outcome === "retry" && job.attempts < job.max_attempts) {
        await finish({
          status: "retry",
          send_after: new Date(now().getTime() + retryDelayMs(job.attempts, result.retryAfterSeconds)).toISOString(),
          last_error: result.error,
        })
        summary.retrying++
      } else {
        await finish({ status: "failed", last_error: result.error })
        summary.failed++
      }
    }
  }

  return summary
}
