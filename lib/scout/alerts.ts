import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { ScoutProspect } from "@/lib/supabase/types"
import type { ScoutScore } from "./types"

const ALERT_THRESHOLD = 85

function getAlertTo() {
  return process.env.SCOUT_ALERT_TO || process.env.MOUNTLINE_TEAM_ALERT_EMAIL || null
}

function getAlertFrom() {
  return process.env.SCOUT_ALERT_FROM || process.env.RESEND_FROM_EMAIL || null
}

function buildEmailHtml(prospect: ScoutProspect, score: ScoutScore) {
  const reasons = score.reasons.map((reason) => `<li>${escapeHtml(reason)}</li>`).join("")

  return `
    <div style="font-family: Inter, Arial, sans-serif; color: #111;">
      <h1 style="font-size: 20px;">Mountline Scout found a strong lead</h1>
      <p><strong>${escapeHtml(prospect.business_name)}</strong> scored ${score.opportunity_score}/100.</p>
      <p><strong>Website:</strong> ${prospect.website ? escapeHtml(prospect.website) : "No website entered"}</p>
      <p><strong>Fit:</strong> ${escapeHtml(score.estimated_project_fit)}</p>
      <p><strong>Suggested angle:</strong> ${escapeHtml(score.outreach_angle)}</p>
      <p><strong>Reasons:</strong></p>
      <ul>${reasons}</ul>
    </div>
  `
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
}

async function sendTeamEmail(prospect: ScoutProspect, score: ScoutScore) {
  const resendKey = process.env.RESEND_API_KEY
  const to = getAlertTo()
  const from = getAlertFrom()

  if (!resendKey || !to || !from) {
    return {
      channel: "internal",
      status: "created",
      deliveredAt: null,
      error: null,
    }
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to,
      subject: `Scout lead: ${prospect.business_name} scored ${score.opportunity_score}`,
      html: buildEmailHtml(prospect, score),
    }),
    signal: AbortSignal.timeout(10_000),
  })

  if (!response.ok) {
    return {
      channel: "email",
      status: "email_failed",
      deliveredAt: null,
      error: await response.text(),
    }
  }

  return {
    channel: "email",
    status: "delivered",
    deliveredAt: new Date().toISOString(),
    error: null,
  }
}

export async function maybeCreateScoutAlert(
  prospect: ScoutProspect,
  score: ScoutScore,
) {
  if (score.opportunity_score < ALERT_THRESHOLD) return null

  const supabase = createAdminClient()
  const { data: existingAlert } = await supabase
    .from("scout_alerts")
    .select("id")
    .eq("prospect_id", prospect.id)
    .eq("alert_type", "high_opportunity")
    .limit(1)
    .maybeSingle()

  if (existingAlert) return existingAlert

  const delivery = await sendTeamEmail(prospect, score)
  const { data, error } = await supabase
    .from("scout_alerts")
    .insert({
      prospect_id: prospect.id,
      alert_type: "high_opportunity",
      score: score.opportunity_score,
      payload: {
        business_name: prospect.business_name,
        website: prospect.website,
        reasons: score.reasons,
        outreach_angle: score.outreach_angle,
      },
      delivery_channel: delivery.channel,
      status: delivery.status,
      delivered_at: delivery.deliveredAt,
      delivery_error: delivery.error,
    })
    .select()
    .single()

  if (error) {
    console.error("[scout] Alert creation failed:", error.message)
    return null
  }

  return data
}
