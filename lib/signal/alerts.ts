import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalAnalysis,
  SignalCandidateSuppressionType,
  SignalProspect,
} from "@/lib/supabase/types"
import {
  normalizeSignalCity,
} from "./classification"
import {
  normalizeSignalBusinessName,
  normalizeSignalHostname,
  normalizeSignalPhone,
} from "./research"

function normalize(value: string | null | undefined) {
  return value?.trim().toLowerCase() || null
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

export async function isSignalProspectSuppressed(prospect: SignalProspect) {
  const email = normalize(prospect.public_email)
  const businessName = prospect.business_name.trim()
  const phone = prospect.public_phone?.trim() || null
  const normalizedBusinessName = normalizeSignalBusinessName(prospect.business_name)
  const normalizedHostname = normalizeSignalHostname(prospect.website_url)
  const normalizedPhone = normalizeSignalPhone(prospect.public_phone)
  const cityNormalized = normalizeSignalCity(prospect.city)

  if (
    !email &&
    !businessName &&
    !phone &&
    !normalizedBusinessName &&
    !normalizedHostname &&
    !normalizedPhone
  ) {
    return false
  }

  const supabase = createAdminClient()
  const checks = []

  if (email) {
    checks.push(
      supabase
        .from("signal_suppression_list")
        .select("id")
        .eq("email", email)
        .limit(1)
        .maybeSingle(),
    )
  }

  if (phone) {
    checks.push(
      supabase
        .from("signal_suppression_list")
        .select("id")
        .eq("phone", phone)
        .limit(1)
        .maybeSingle(),
    )
  }

  if (businessName) {
    checks.push(
      supabase
        .from("signal_suppression_list")
        .select("id")
        .ilike("business_name", businessName)
        .limit(1)
        .maybeSingle(),
    )
  }

  if (normalizedHostname) {
    checks.push(
      supabase
        .from("signal_candidate_suppressions")
        .select("id")
        .eq("normalized_hostname", normalizedHostname)
        .is("restored_at", null)
        .limit(1)
        .maybeSingle(),
    )
  }

  if (normalizedPhone) {
    checks.push(
      supabase
        .from("signal_candidate_suppressions")
        .select("id")
        .eq("phone_normalized", normalizedPhone)
        .is("restored_at", null)
        .limit(1)
        .maybeSingle(),
    )
  }

  if (email) {
    checks.push(
      supabase
        .from("signal_candidate_suppressions")
        .select("id")
        .eq("public_email_normalized", email)
        .is("restored_at", null)
        .limit(1)
        .maybeSingle(),
    )
  }

  if (normalizedBusinessName) {
    let query = supabase
      .from("signal_candidate_suppressions")
      .select("id")
      .eq("normalized_business_name", normalizedBusinessName)
      .is("restored_at", null)
      .limit(1)
    if (cityNormalized) query = query.eq("city_normalized", cityNormalized)
    checks.push(query.maybeSingle())
  }

  const results = await Promise.all(checks)
  results.forEach((result) => {
    if (result.error) {
      console.error("[signal] Suppression lookup failed:", result.error.message)
    }
  })

  return results.some((result) => Boolean(result.data))
}

export async function addSignalProspectToSuppression(
  prospect: SignalProspect,
  reason: string | null,
) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_suppression_list")
    .insert({
      email: normalize(prospect.public_email),
      phone: prospect.public_phone || null,
      business_name: prospect.business_name,
      reason,
      source: "manual",
    })
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function addSignalCandidateSuppression({
  businessName,
  city,
  email,
  hostname,
  phone,
  reason,
  sourceCampaignId,
  sourceMarketId,
  suppressionType,
}: {
  businessName?: string | null
  city?: string | null
  email?: string | null
  hostname?: string | null
  phone?: string | null
  reason?: string | null
  sourceCampaignId?: string | null
  sourceMarketId?: string | null
  suppressionType: SignalCandidateSuppressionType
}) {
  const supabase = createAdminClient()
  const payload = {
    normalized_business_name: normalizeSignalBusinessName(businessName) || null,
    normalized_hostname: normalizeSignalHostname(hostname) || null,
    phone_normalized: normalizeSignalPhone(phone) || null,
    public_email_normalized: normalize(email),
    city_normalized: normalizeSignalCity(city) || null,
    suppression_type: suppressionType,
    reason: reason || null,
    source_campaign_id: sourceCampaignId || null,
    source_market_id: sourceMarketId || null,
  }

  const { data, error } = await supabase
    .from("signal_candidate_suppressions")
    .insert(payload)
    .select()
    .single()

  if (error) throw new Error(error.message)
  return data
}

export async function findSignalCandidateSuppression({
  businessName,
  city,
  email,
  hostname,
  phone,
}: {
  businessName?: string | null
  city?: string | null
  email?: string | null
  hostname?: string | null
  phone?: string | null
}) {
  const supabase = createAdminClient()
  const checks = []
  const normalizedBusinessName = normalizeSignalBusinessName(businessName)
  const normalizedHostname = normalizeSignalHostname(hostname)
  const normalizedPhone = normalizeSignalPhone(phone)
  const normalizedEmail = normalize(email)
  const cityNormalized = normalizeSignalCity(city)

  if (normalizedHostname) {
    checks.push(
      supabase
        .from("signal_candidate_suppressions")
        .select("*")
        .eq("normalized_hostname", normalizedHostname)
        .is("restored_at", null)
        .limit(1)
        .maybeSingle(),
    )
  }
  if (normalizedPhone) {
    checks.push(
      supabase
        .from("signal_candidate_suppressions")
        .select("*")
        .eq("phone_normalized", normalizedPhone)
        .is("restored_at", null)
        .limit(1)
        .maybeSingle(),
    )
  }
  if (normalizedEmail) {
    checks.push(
      supabase
        .from("signal_candidate_suppressions")
        .select("*")
        .eq("public_email_normalized", normalizedEmail)
        .is("restored_at", null)
        .limit(1)
        .maybeSingle(),
    )
  }
  if (normalizedBusinessName) {
    let query = supabase
      .from("signal_candidate_suppressions")
      .select("*")
      .eq("normalized_business_name", normalizedBusinessName)
      .is("restored_at", null)
      .limit(1)
    if (cityNormalized) query = query.eq("city_normalized", cityNormalized)
    checks.push(query.maybeSingle())
  }

  if (checks.length === 0) return null

  const results = await Promise.all(checks)
  const match = results.find((result) => Boolean(result.data))
  return match?.data || null
}

function buildAlertEmail(prospect: SignalProspect, analysis: SignalAnalysis) {
  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #111;">
      <h1 style="font-size: 20px;">Mountline Signal found a high-fit prospect</h1>
      <p><strong>${escapeHtml(prospect.business_name)}</strong> scored ${analysis.overall_opportunity_score ?? "unknown"}/100.</p>
      <p><strong>Priority:</strong> ${escapeHtml(analysis.priority || "unknown")}</p>
      <p><strong>Recommended offer:</strong> ${escapeHtml(analysis.recommended_primary_offer || "Review in Signal")}</p>
      <p><strong>Value band:</strong> ${escapeHtml(analysis.potential_project_value_band || "unknown")}</p>
      <p><strong>Summary:</strong> ${escapeHtml(analysis.executive_summary || "Open Signal for details.")}</p>
    </div>
  `
}

async function sendInternalAlertEmail(
  prospect: SignalProspect,
  analysis: SignalAnalysis,
) {
  const resendKey = process.env.RESEND_API_KEY
  const to = process.env.SIGNAL_ALERT_EMAIL
  const from = process.env.RESEND_FROM_EMAIL

  if (!resendKey || !to || !from) return null

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Signal A lead: ${prospect.business_name}`,
      html: buildAlertEmail(prospect, analysis),
    }),
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) {
    console.error("[signal] Internal alert email failed:", await response.text())
    return null
  }

  return new Date().toISOString()
}

export async function maybeCreateSignalAlert(
  prospect: SignalProspect,
  analysis: SignalAnalysis,
) {
  const score = analysis.overall_opportunity_score || 0
  if (
    score < 88 ||
    analysis.priority !== "A" ||
    !["medium", "high"].includes(analysis.confidence || "")
  ) {
    return null
  }

  if (await isSignalProspectSuppressed(prospect)) return null

  const supabase = createAdminClient()
  const { data: existingAlert } = await supabase
    .from("signal_alerts")
    .select("*")
    .eq("prospect_id", prospect.id)
    .eq("alert_type", "high_fit")
    .limit(1)
    .maybeSingle()

  if (existingAlert) return existingAlert

  const emailSentAt = await sendInternalAlertEmail(prospect, analysis)

  const { data, error } = await supabase
    .from("signal_alerts")
    .insert({
      prospect_id: prospect.id,
      analysis_id: analysis.id,
      alert_type: "high_fit",
      title: `High-fit prospect: ${prospect.business_name}`,
      message:
        analysis.executive_summary ||
        `${prospect.business_name} scored ${score}/100 in Mountline Signal.`,
      email_alert_sent_at: emailSentAt,
    })
    .select()
    .single()

  if (error) {
    console.error("[signal] Alert creation failed:", error.message)
    return null
  }

  return data
}
