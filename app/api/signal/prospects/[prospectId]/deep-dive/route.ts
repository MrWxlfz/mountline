import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { isSignalProspectSuppressed, maybeCreateSignalAlert } from "@/lib/signal/alerts"
import { runDeepAiAnalysis } from "@/lib/signal/ai"
import {
  buildPublicCustomerPositioning,
  summarizeSignalBrandVoice,
  suggestSignalConversationStyle,
} from "@/lib/signal/conversation"
import { completeDeepAnalysisDrafts } from "@/lib/signal/outreach"
import {
  buildDeterministicInitialAnalysis,
  buildFallbackDeepAnalysis,
} from "@/lib/signal/scoring"
import { buildSignalScriptStudio } from "@/lib/signal/scripts"
import { scanSignalWebsite } from "@/lib/signal/website"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalAnalysis, SignalProspect } from "@/lib/supabase/types"
import type { SignalInitialAnalysisOutput } from "@/lib/signal/validation"

const CONTACTED_OR_FINAL_STATUSES = new Set([
  "contacted",
  "awaiting_reply",
  "permission_to_send_demo",
  "demo_sent",
  "interested",
  "discovery_call",
  "proposal_sent",
  "won",
  "lost",
  "no_response",
  "do_not_contact",
])

function initialFromAnalysis(
  analysis: SignalAnalysis | null,
  fallback: SignalInitialAnalysisOutput,
): SignalInitialAnalysisOutput {
  if (!analysis?.overall_opportunity_score) return fallback

  return {
    website_quality_score: analysis.website_quality_score ?? fallback.website_quality_score,
    business_viability_score:
      analysis.business_viability_score ?? fallback.business_viability_score,
    operational_opportunity_score:
      analysis.operational_opportunity_score ?? fallback.operational_opportunity_score,
    website_service_fit_score:
      analysis.website_service_fit_score ?? fallback.website_service_fit_score,
    ai_workflow_fit_score: analysis.ai_workflow_fit_score ?? fallback.ai_workflow_fit_score,
    reachability_score: analysis.reachability_score ?? fallback.reachability_score,
    compliance_risk_score: analysis.compliance_risk_score ?? fallback.compliance_risk_score,
    overall_opportunity_score:
      analysis.overall_opportunity_score ?? fallback.overall_opportunity_score,
    priority: analysis.priority ?? fallback.priority,
    commercial_fit: analysis.commercial_fit ?? fallback.commercial_fit,
    potential_project_value_band:
      (analysis.potential_project_value_band as SignalInitialAnalysisOutput["potential_project_value_band"]) ??
      fallback.potential_project_value_band,
    potential_project_value_reason:
      analysis.potential_project_value_reason ?? fallback.potential_project_value_reason,
    recommended_primary_offer:
      analysis.recommended_primary_offer ?? fallback.recommended_primary_offer,
    recommended_secondary_offer:
      analysis.recommended_secondary_offer ?? fallback.recommended_secondary_offer,
    recommended_demo: analysis.recommended_demo ?? fallback.recommended_demo,
    suggested_channel: analysis.suggested_channel ?? fallback.suggested_channel,
    suggested_outreach_mode:
      analysis.suggested_outreach_mode ?? fallback.suggested_outreach_mode,
    executive_summary: analysis.executive_summary ?? fallback.executive_summary,
    reasons_to_contact: Array.isArray(analysis.reasons_to_contact)
      ? (analysis.reasons_to_contact as string[])
      : fallback.reasons_to_contact,
    red_flags: Array.isArray(analysis.red_flags)
      ? (analysis.red_flags as string[])
      : fallback.red_flags,
    compliance_warning: analysis.compliance_warning ?? fallback.compliance_warning,
    confidence: analysis.confidence ?? fallback.confidence,
  }
}

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
  const fallbackInitial = buildDeterministicInitialAnalysis(prospect, scan)

  const { data: latestAnalysis } = await supabase
    .from("signal_analyses")
    .select("*")
    .eq("prospect_id", prospect.id)
    .not("overall_opportunity_score", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const initial = initialFromAnalysis(
    (latestAnalysis as SignalAnalysis | null) || null,
    fallbackInitial,
  )
  const fallbackDeep = buildFallbackDeepAnalysis(prospect, scan, initial)
  const aiResult = await runDeepAiAnalysis(prospect, scan, initial)
  const deep = completeDeepAnalysisDrafts(
    prospect,
    aiResult?.output || fallbackDeep,
    initial,
    scan,
  )
  const conversation = suggestSignalConversationStyle(prospect, scan)
  const customerPositioning = buildPublicCustomerPositioning(prospect, scan)
  const brandVoice = summarizeSignalBrandVoice(prospect, scan)

  const { data: analysisData, error: analysisError } = await supabase
    .from("signal_analyses")
    .insert({
      prospect_id: prospect.id,
      analysis_type: "deep_dive",
      model_provider: aiResult?.provider || "rule_based",
      model_name: aiResult?.model || "deterministic-fallback",
      scanned_urls: scan.scanned_urls,
      website_signals: {
        scan,
        evidence_based_opportunities: deep.evidence_based_opportunities,
        what_looks_good: deep.what_looks_good,
        visible_problem: deep.visible_problem,
      },
      evidence: {
        website: scan.evidence,
        opportunities: deep.evidence_based_opportunities,
      },
      confidence: deep.confidence,
      website_quality_score: initial.website_quality_score,
      business_viability_score: initial.business_viability_score,
      operational_opportunity_score: initial.operational_opportunity_score,
      website_service_fit_score: initial.website_service_fit_score,
      ai_workflow_fit_score: initial.ai_workflow_fit_score,
      reachability_score: initial.reachability_score,
      compliance_risk_score: initial.compliance_risk_score,
      overall_opportunity_score: initial.overall_opportunity_score,
      priority: initial.priority,
      commercial_fit: initial.commercial_fit,
      potential_project_value_band: deep.project_value_band,
      potential_project_value_reason: deep.project_value_reason,
      recommended_primary_offer: deep.recommended_primary_offer,
      recommended_secondary_offer: deep.recommended_secondary_offer,
      recommended_demo: initial.recommended_demo,
      suggested_channel: deep.suggested_channel,
      suggested_outreach_mode: deep.suggested_outreach_mode,
      suggested_conversation_style: conversation.style,
      conversation_style_reason: conversation.reason,
      public_customer_positioning: customerPositioning,
      brand_voice_summary: brandVoice,
      reasons_to_contact: deep.evidence_based_opportunities.map(
        (opportunity) => opportunity.honest_offer_language,
      ),
      red_flags: deep.red_flags,
      compliance_warning: deep.compliance_warning,
      executive_summary: `${prospect.business_name}: ${deep.recommended_primary_offer}. ${deep.project_value_reason}`,
    })
    .select()
    .single()

  if (analysisError) {
    return NextResponse.json({ error: analysisError.message }, { status: 500 })
  }

  const analysis = analysisData as SignalAnalysis
  const scriptStudio = buildSignalScriptStudio({
    analysis,
    conversationStyle: conversation.style,
    prospect,
    scan,
  })
  const { data: draft, error: draftError } = await supabase
    .from("signal_outreach_drafts")
    .insert({
      prospect_id: prospect.id,
      analysis_id: analysis.id,
      outreach_mode: deep.suggested_outreach_mode,
      conversation_style: scriptStudio.conversation_style,
      conversation_style_reason: scriptStudio.conversation_style_reason,
      first_contact_subject: deep.first_contact_subject,
      first_contact_email: scriptStudio.first_email_draft || deep.first_contact_email,
      permission_based_dm: deep.permission_based_dm,
      owner_call_opener: scriptStudio.first_call_opener || deep.owner_call_opener,
      gatekeeper_script: scriptStudio.receptionist_script || deep.gatekeeper_script,
      voicemail_script: scriptStudio.voicemail_script || deep.voicemail_script,
      demo_send_followup: scriptStudio.sure_send_it_response || deep.demo_send_followup,
      discovery_call_questions: scriptStudio.discovery_call_questions,
      proposal_angle: scriptStudio.proposal_angle || deep.proposal_angle,
      script_studio: scriptStudio,
      follow_up_email: scriptStudio.follow_up_draft,
      objection_responses: scriptStudio.objection_responses,
    })
    .select()
    .single()

  if (draftError) {
    return NextResponse.json({ error: draftError.message }, { status: 500 })
  }

  const updates: Record<string, unknown> = {}
  if (!prospect.what_looks_good && deep.what_looks_good) {
    updates.what_looks_good = deep.what_looks_good
  }
  if (!prospect.visible_problem && deep.visible_problem) {
    updates.visible_problem = deep.visible_problem
  }
  if (prospect.outreach_mode !== deep.suggested_outreach_mode) {
    updates.outreach_mode = deep.suggested_outreach_mode
  }
  updates.conversation_style = scriptStudio.conversation_style
  updates.conversation_style_reason = scriptStudio.conversation_style_reason
  if (
    prospect.outreach_status !== "do_not_contact" &&
    !CONTACTED_OR_FINAL_STATUSES.has(prospect.outreach_status) &&
    !(await isSignalProspectSuppressed(prospect))
  ) {
    updates.outreach_status = "ready_to_contact"
  }

  if (Object.keys(updates).length > 0) {
    await supabase.from("signal_prospects").update(updates).eq("id", prospect.id)
  }

  const alert = await maybeCreateSignalAlert(
    { ...prospect, ...updates } as SignalProspect,
    analysis,
  )

  return NextResponse.json({
    analysis,
    draft,
    deep,
    alert,
    ai_unavailable: !aiResult,
  })
}
