import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { maybeCreateSignalAlert } from "@/lib/signal/alerts"
import { runInitialAiAnalysis } from "@/lib/signal/ai"
import { buildDeterministicInitialAnalysis } from "@/lib/signal/scoring"
import { scanSignalWebsite } from "@/lib/signal/website"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalAnalysis, SignalProspect } from "@/lib/supabase/types"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: prospectData, error: prospectError } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()

  if (prospectError) {
    return NextResponse.json({ error: prospectError.message }, { status: 500 })
  }
  if (!prospectData) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 })
  }

  const prospect = prospectData as SignalProspect
  const scan = await scanSignalWebsite(prospect.website_url)
  const fallback = buildDeterministicInitialAnalysis(prospect, scan)
  const aiResult = await runInitialAiAnalysis(prospect, scan)
  const output = aiResult?.output || fallback

  const { data: analysisData, error: analysisError } = await supabase
    .from("signal_analyses")
    .insert({
      prospect_id: prospect.id,
      analysis_type: "initial",
      model_provider: aiResult?.provider || "rule_based",
      model_name: aiResult?.model || "deterministic-fallback",
      scanned_urls: scan.scanned_urls,
      website_signals: scan,
      evidence: scan.evidence,
      confidence: output.confidence,
      website_quality_score: output.website_quality_score,
      business_viability_score: output.business_viability_score,
      operational_opportunity_score: output.operational_opportunity_score,
      website_service_fit_score: output.website_service_fit_score,
      ai_workflow_fit_score: output.ai_workflow_fit_score,
      reachability_score: output.reachability_score,
      compliance_risk_score: output.compliance_risk_score,
      overall_opportunity_score: output.overall_opportunity_score,
      priority: output.priority,
      commercial_fit: output.commercial_fit,
      potential_project_value_band: output.potential_project_value_band,
      potential_project_value_reason: output.potential_project_value_reason,
      recommended_primary_offer: output.recommended_primary_offer,
      recommended_secondary_offer: output.recommended_secondary_offer,
      recommended_demo: output.recommended_demo,
      suggested_channel: output.suggested_channel,
      suggested_outreach_mode: output.suggested_outreach_mode,
      reasons_to_contact: output.reasons_to_contact,
      red_flags: output.red_flags,
      compliance_warning: output.compliance_warning,
      executive_summary: output.executive_summary,
    })
    .select()
    .single()

  if (analysisError) {
    return NextResponse.json({ error: analysisError.message }, { status: 500 })
  }

  const analysis = analysisData as SignalAnalysis
  const prospectUpdate: Record<string, unknown> = {}
  if (scan.detected_website_platform && !prospect.existing_website_platform) {
    prospectUpdate.existing_website_platform = scan.detected_website_platform
  }
  if (scan.detected_booking_platform && !prospect.existing_booking_platform) {
    prospectUpdate.existing_booking_platform = scan.detected_booking_platform
  }
  if (output.suggested_outreach_mode && prospect.outreach_mode !== output.suggested_outreach_mode) {
    prospectUpdate.outreach_mode = output.suggested_outreach_mode
  }
  if (prospect.outreach_status === "researched" && output.priority !== "skip") {
    prospectUpdate.outreach_status = "needs_review"
  }

  if (Object.keys(prospectUpdate).length > 0) {
    await supabase
      .from("signal_prospects")
      .update(prospectUpdate)
      .eq("id", prospect.id)
  }

  const alert = await maybeCreateSignalAlert(
    { ...prospect, ...prospectUpdate } as SignalProspect,
    analysis,
  )

  return NextResponse.json({
    analysis,
    scan,
    alert,
    ai_unavailable: !aiResult,
  })
}
