"use server"

import { headers } from "next/headers"
import { after } from "next/server"
import type { InquiryInput } from "@/lib/leads/inquiry-schema"
import { submitProjectInquiry } from "@/lib/leads/submit-inquiry"
import { readInquiryEmailSettings } from "@/lib/leads/email/config"
import { ownerReminderDueAt } from "@/lib/leads/email/eligibility"
import { rulesFrom } from "@/lib/leads/email/worker"
import { runInquiryEmails } from "@/lib/leads/email/server"
import { createAdminClient } from "@/lib/supabase/admin"

// Per connection and per address, within the window. Generous for people, tight for scripts.
const LIMITS = { perSubmitter: 5, perEmail: 3, windowMinutes: 60 }

export async function submitInquiry(input: InquiryInput) {
  const settings = readInquiryEmailSettings()
  const requestHeaders = await headers()
  const ip = requestHeaders.get("x-real-ip") || requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || null

  return submitProjectInquiry(input, {
    now: () => new Date(),
    submitterIp: ip,
    hashSecret: settings.hashSecret,
    ownerReminderAt: (createdAt) => ownerReminderDueAt(createdAt, rulesFrom(settings)),
    async save(record, ownerReminderAt) {
      const supabase = createAdminClient()
      const { data, error } = await supabase.rpc("submit_mountline_inquiry", {
        p_submission_key: record.submission_key,
        p_content_fingerprint: record.content_fingerprint,
        p_submitter_hash: record.submitter_hash,
        p_name: record.name,
        p_business_name: record.business_name,
        p_email: record.email,
        p_phone: record.phone,
        p_current_website: record.current_website,
        p_interests: record.interests,
        p_service_needed: record.service_needed,
        p_message: record.message,
        p_owner_reminder_at: ownerReminderAt?.toISOString() ?? null,
        p_max_per_submitter: LIMITS.perSubmitter,
        p_max_per_email: LIMITS.perEmail,
        p_window_minutes: LIMITS.windowMinutes,
      })
      const row = Array.isArray(data) ? data[0] : null
      if (error || !row?.outcome) {
        console.error("[mountline] Inquiry was not saved", { code: error?.code || "missing_result" })
        throw new Error("Inquiry was not confirmed saved.")
      }
      return { inquiryId: row.inquiry_id ?? null, outcome: row.outcome }
    },
    dispatch(inquiryId) {
      // After the visitor has their answer: send this inquiry's two emails. Anything that fails
      // stays queued for the scheduled worker and shows in the dashboard.
      after(async () => {
        try {
          await runInquiryEmails({ leadId: inquiryId })
        } catch {
          console.error("[mountline] Inquiry emails were left queued for the worker")
        }
      })
    },
  })
}
