import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/admin"
import { addressOf, readInquiryEmailSettings, type InquiryEmailSettings } from "./config.ts"
import { checkinDueAt } from "./eligibility.ts"
import { createResendSender } from "./provider.ts"
import { customerFacingKinds, type EmailKind } from "./kinds.ts"
import { shouldApplyDelivery, type WebhookEffect } from "./webhook.ts"
import { processEmailQueue, rulesFrom, scheduleCheckins, type ClaimedJob, type EmailStore, type JobPatch, type LeadRecord, type QueueSummary } from "./worker.ts"

const LEAD_COLUMNS =
  "id,created_at,name,business_name,email,phone,current_website,interests,message,optout_token,status,contacted_at,customer_replied_at,followup_paused_at,followup_opted_out_at,email_suppressed_at"

const PENDING = ["queued", "retry", "awaiting_approval"]

/** Case-insensitive exact match: "_" and "%" are common in addresses and are LIKE wildcards. */
function exactPattern(value: string) {
  return value.replace(/[\\%_]/g, (character) => `\\${character}`)
}

function logFailure(label: string, error: { code?: string; message?: string } | null) {
  // Codes only: messages can include row values.
  console.error(`[mountline] ${label}`, { code: error?.code || "unknown" })
}

export function createEmailStore(supabase: SupabaseClient): EmailStore {
  return {
    async claim({ limit, leaseSeconds, leadId }) {
      const { data, error } = await supabase.rpc("claim_inquiry_email_jobs", { p_limit: limit, p_lease_seconds: leaseSeconds, p_lead_id: leadId ?? null })
      if (error) {
        logFailure("Inquiry email claim failed", error)
        throw new Error("Email jobs could not be claimed.")
      }
      return (data || []) as ClaimedJob[]
    },
    async loadLead(leadId) {
      const { data, error } = await supabase.from("leads").select(LEAD_COLUMNS).eq("id", leadId).maybeSingle()
      if (error) {
        logFailure("Inquiry lookup for email failed", error)
        throw new Error("The inquiry could not be loaded.")
      }
      return data as LeadRecord | null
    },
    async checkinAwaitingApproval(leadId) {
      const { data } = await supabase.from("inquiry_email_jobs").select("id").eq("lead_id", leadId).eq("kind", "customer_checkin").eq("status", "awaiting_approval").limit(1)
      return Boolean(data?.length)
    },
    async finish(jobId, leaseToken, patch: JobPatch) {
      const { data, error } = await supabase
        .from("inquiry_email_jobs")
        .update({ ...patch, lease_token: null, locked_until: null })
        .eq("id", jobId)
        .eq("lease_token", leaseToken)
        .eq("status", "sending")
        .select("id")
      if (error) {
        logFailure("Inquiry email result was not saved", error)
        return false
      }
      return Boolean(data?.length)
    },
    async ensureJob(leadId, kind, sendAfter) {
      const { error } = await supabase
        .from("inquiry_email_jobs")
        .upsert({ lead_id: leadId, kind, send_after: sendAfter.toISOString() }, { onConflict: "lead_id,kind", ignoreDuplicates: true })
      if (error) logFailure(`Inquiry email job (${kind}) was not queued`, error)
    },
    async leadsAwaitingCheckinJob(limit) {
      const { data: leads, error } = await supabase
        .from("leads")
        .select("id,contacted_at")
        .eq("status", "contacted")
        .not("contacted_at", "is", null)
        .is("followup_opted_out_at", null)
        .is("email_suppressed_at", null)
        .order("contacted_at", { ascending: false })
        .limit(limit)
      if (error || !leads?.length) return []
      const { data: jobs } = await supabase.from("inquiry_email_jobs").select("lead_id").eq("kind", "customer_checkin").in("lead_id", leads.map((lead) => lead.id))
      const covered = new Set((jobs || []).map((job) => job.lead_id))
      return leads.filter((lead) => !covered.has(lead.id)) as Array<{ id: string; contacted_at: string }>
    },
  }
}

export function emailRuntime(settings: InquiryEmailSettings = readInquiryEmailSettings()) {
  const supabase = createAdminClient()
  return {
    supabase,
    settings,
    store: createEmailStore(supabase),
    send: settings.apiKey ? createResendSender(settings.apiKey) : null,
  }
}

/** Send whatever is due. With a lead ID, only that inquiry's emails are touched. */
export async function runInquiryEmails(options: { leadId?: string; scheduleFollowups?: boolean } = {}): Promise<QueueSummary> {
  const { store, send, settings } = emailRuntime()
  if (options.scheduleFollowups) await scheduleCheckins(store, settings)
  return processEmailQueue({ store, send, settings, leadId: options.leadId })
}

/** Called after a person marks an inquiry Contacted, so the check-in shows up right away. */
export async function queueCheckinFor(leadId: string) {
  const { supabase, settings, store } = emailRuntime()
  if (settings.customerFollowup === "off") return
  const { data } = await supabase.from("leads").select("id,contacted_at,status").eq("id", leadId).maybeSingle()
  if (data?.status !== "contacted" || !data.contacted_at) return
  const due = checkinDueAt(data, rulesFrom(settings))
  if (due) await store.ensureJob(leadId, "customer_checkin", due)
}

async function cancelPending(supabase: SupabaseClient, leadIds: string[], kinds: readonly EmailKind[], reason: string) {
  if (!leadIds.length) return
  await supabase
    .from("inquiry_email_jobs")
    .update({ status: "cancelled", skip_reason: reason })
    .in("lead_id", leadIds)
    .in("kind", kinds as EmailKind[])
    .in("status", PENDING)
}

/* Team actions ------------------------------------------------------------------------ */

export type FollowupAction = "pause" | "resume" | "mark_replied"

export async function updateFollowup(leadId: string, action: FollowupAction) {
  const supabase = createAdminClient()
  const now = new Date().toISOString()
  const patch =
    action === "pause" ? { followup_paused_at: now } : action === "resume" ? { followup_paused_at: null } : { customer_replied_at: now }
  const { data, error } = await supabase.from("leads").update(patch).eq("id", leadId).select("id,followup_paused_at,customer_replied_at").maybeSingle()
  if (error) {
    logFailure("Follow-up setting was not saved", error)
    throw new Error("The follow-up setting could not be saved.")
  }
  if (!data) return null
  if (action === "mark_replied") await cancelPending(supabase, [leadId], ["customer_checkin", "owner_checkin_prompt"], "customer_replied")
  return data
}

export type JobAction = "approve" | "skip" | "retry"

export async function actOnEmailJob(leadId: string, jobId: string, action: JobAction, actor: string) {
  const supabase = createAdminClient()
  const now = new Date().toISOString()
  let query
  if (action === "approve") {
    query = supabase
      .from("inquiry_email_jobs")
      .update({ status: "queued", approved_at: now, approved_by: actor, send_after: now, last_error: null })
      .eq("kind", "customer_checkin")
      .eq("status", "awaiting_approval")
  } else if (action === "skip") {
    query = supabase
      .from("inquiry_email_jobs")
      .update({ status: "cancelled", skip_reason: "skipped_by_team" })
      .in("status", ["awaiting_approval", "queued", "retry", "failed"])
  } else {
    query = supabase
      .from("inquiry_email_jobs")
      .update({ status: "queued", attempts: 0, send_after: now, last_error: null })
      .in("status", ["failed", "retry"])
  }
  const { data, error } = await query.eq("id", jobId).eq("lead_id", leadId).select("id,status").maybeSingle()
  if (error) {
    logFailure(`Email job ${action} failed`, error)
    throw new Error("The email could not be updated.")
  }
  if (!data) return null
  if (action !== "skip") await runInquiryEmails({ leadId })
  const { data: after } = await supabase.from("inquiry_email_jobs").select("id,status,last_error,skip_reason").eq("id", jobId).maybeSingle()
  return after
}

/* Opt-out ------------------------------------------------------------------------------ */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

export async function optOutByToken(token: string) {
  if (!UUID.test(token)) return false
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("leads").select("id,followup_opted_out_at").eq("optout_token", token).maybeSingle()
  if (error) {
    logFailure("Opt-out lookup failed", error)
    throw new Error("Opt-out could not be saved.")
  }
  if (!data) return false
  if (!data.followup_opted_out_at) {
    const { error: updateError } = await supabase.from("leads").update({ followup_opted_out_at: new Date().toISOString() }).eq("id", data.id)
    if (updateError) {
      logFailure("Opt-out was not saved", updateError)
      throw new Error("Opt-out could not be saved.")
    }
  }
  await cancelPending(supabase, [data.id], ["customer_checkin"], "opted_out")
  return true
}

/* Webhooks ----------------------------------------------------------------------------- */

export async function applyWebhook(eventId: string, effect: WebhookEffect, settings: InquiryEmailSettings) {
  const supabase = createAdminClient()
  const { data: seen } = await supabase.from("inquiry_email_events").select("id").eq("id", eventId).maybeSingle()
  if (seen) return "duplicate" as const

  let jobId: string | null = null
  let leadId: string | null = null
  let detail: string | null = null

  if (effect.kind === "delivery") {
    const lookup = supabase.from("inquiry_email_jobs").select("id,lead_id,kind,status")
    const { data: job } = effect.jobId
      ? await lookup.eq("id", effect.jobId).maybeSingle()
      : await lookup.eq("provider_message_id", effect.providerMessageId).maybeSingle()
    if (!job) {
      detail = "No matching inquiry email."
    } else {
      jobId = job.id
      leadId = job.lead_id
      detail = effect.detail
      if (shouldApplyDelivery(job.status, effect.status)) {
        const patch: Record<string, unknown> = { status: effect.status }
        if (effect.status === "delivered") patch.delivered_at = effect.occurredAt || new Date().toISOString()
        if (effect.detail && effect.status !== "delivered") patch.last_error = effect.detail
        const { error } = await supabase.from("inquiry_email_jobs").update(patch).eq("id", job.id)
        if (error) throw new Error("Delivery status was not saved.")
      }
      // Only a customer's own address is retired; a bounce on the owner notification is shown, not suppressed.
      if (effect.suppress && customerFacingKinds.includes(job.kind as EmailKind)) {
        const { data: lead } = await supabase.from("leads").select("email").eq("id", job.lead_id).maybeSingle()
        const address = addressOf(lead?.email)
        if (address) {
          const suppression: Record<string, unknown> = { email_suppressed_at: new Date().toISOString(), email_suppressed_reason: effect.suppress }
          if (effect.suppress === "complained") suppression.followup_opted_out_at = new Date().toISOString()
          await supabase.from("leads").update(suppression).ilike("email", exactPattern(address)).is("email_suppressed_at", null)
          const { data: sameAddress } = await supabase.from("leads").select("id").ilike("email", exactPattern(address))
          await cancelPending(supabase, (sameAddress || []).map((row) => row.id), customerFacingKinds, "suppressed")
        }
      }
    }
  } else if (effect.kind === "reply") {
    const ours = [settings.replyTo, settings.from, settings.ownerTo].map(addressOf)
    if (ours.includes(effect.from)) {
      detail = "Ignored: sent from a Mountline address."
    } else {
      const { data: leads } = await supabase
        .from("leads")
        .select("id")
        .ilike("email", exactPattern(effect.from))
        .neq("status", "closed")
        .order("created_at", { ascending: false })
        .limit(5)
      const ids = (leads || []).map((lead) => lead.id)
      if (ids.length) {
        await supabase.from("leads").update({ customer_replied_at: effect.occurredAt || new Date().toISOString() }).in("id", ids)
        await cancelPending(supabase, ids, ["customer_checkin", "owner_checkin_prompt"], "customer_replied")
        leadId = ids[0]
        detail = "Reply matched to an inquiry."
      } else {
        detail = "Reply did not match an open inquiry."
      }
    }
  }

  const { error } = await supabase.from("inquiry_email_events").insert({
    id: eventId,
    event_type: effect.eventType,
    provider_message_id: effect.kind === "ignore" ? null : effect.providerMessageId,
    job_id: jobId,
    lead_id: leadId,
    occurred_at: effect.kind === "ignore" ? null : effect.occurredAt,
    detail,
  })
  // A concurrent redelivery may have recorded it first; the effects above are idempotent.
  if (error && error.code !== "23505") logFailure("Webhook event was not recorded", error)
  return "applied" as const
}
