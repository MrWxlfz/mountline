import "server-only"

import type {
  SignalAnalysis,
  SignalProspect,
  SignalVerifiedObservation,
  SignalVisualEvidence,
} from "@/lib/supabase/types"
import { createAdminClient } from "@/lib/supabase/admin"
import { maybeCreateSignalAlert } from "./alerts"
import { runInitialAiAnalysis } from "./ai"
import {
  classifySignalLocality,
  classifySignalOutreachHistory,
  classifySignalRelationship,
  suggestedCalibratedOutreachMode,
} from "./calibration"
import {
  buildSignalClassificationFields,
  resolveSignalClassification,
  syncSignalProspectAliases,
} from "./classification"
import {
  buildPublicCustomerPositioning,
  summarizeSignalBrandVoice,
  suggestSignalConversationStyle,
} from "./conversation"
import {
  suggestCommunicationProfile,
} from "./communication-profile"
import { getContactReadiness } from "./outreach-history"
import { getSignalPlaybook } from "./playbooks"
import {
  buildDeterministicInitialAnalysis,
  calibrateInitialAnalysisOutput,
  getSignalOpportunityCalibration,
} from "./scoring"
import { scanSignalWebsite, type SignalWebsiteScan } from "./website"
import {
  visualEvidenceForAnalysis,
  visualValueReasons,
} from "./visual-evidence"

export type SignalResearchAnalysisContext = {
  research_provider?: string | null
  research_query?: string | null
  confirmed_official_url?: string | null
  official_source_confidence?: "low" | "medium" | "high" | null
  candidate_urls?: string[]
}

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

export async function runAndStoreInitialSignalAnalysis({
  prospect,
  researchContext,
  scan,
}: {
  prospect: SignalProspect
  researchContext?: SignalResearchAnalysisContext
  scan?: SignalWebsiteScan | null
}) {
  const supabase = createAdminClient()
  const websiteScan = scan ?? (await scanSignalWebsite(prospect.website_url))
  const { data: visualRows } = await supabase
    .from("signal_visual_evidence")
    .select("*")
    .eq("prospect_id", prospect.id)
    .order("created_at", { ascending: false })
  const visualEvidence = (visualRows || []) as SignalVisualEvidence[]
  const { data: observationRows } = await supabase
    .from("signal_verified_observations")
    .select("*")
    .eq("prospect_id", prospect.id)
    .order("created_at", { ascending: false })
  const verifiedObservations = (observationRows || []) as SignalVerifiedObservation[]
  const verifiedObservationText = verifiedObservations
    .map((item) => `${item.category.replace(/_/g, " ")}: ${item.note}`)
    .join("\n")
  const analysisProspect = {
    ...prospect,
    human_notes: [prospect.human_notes, verifiedObservationText].filter(Boolean).join("\n\n") || null,
  } as SignalProspect
  const fallback = buildDeterministicInitialAnalysis(analysisProspect, websiteScan, visualEvidence)
  const aiResult = await runInitialAiAnalysis(analysisProspect, websiteScan)
  const output = calibrateInitialAnalysisOutput(
    analysisProspect,
    websiteScan,
    aiResult?.output || fallback,
    visualEvidence,
  )
  const classification = await resolveSignalClassification({
    businessName: prospect.business_name,
    city: prospect.city,
    state: prospect.state,
    industryHint: prospect.industry,
    websiteUrl: researchContext?.confirmed_official_url || prospect.website_url,
    selectedPlaybook: prospect.industry_playbook,
    manualOverride: prospect.classification_manual_override,
    scan: websiteScan,
  })
  const styleSuggestion = suggestSignalConversationStyle(analysisProspect, websiteScan)
  const profileSuggestion = suggestCommunicationProfile(analysisProspect, websiteScan)
  const contactReadiness = getContactReadiness(prospect)
  const publicCustomerPositioning = buildPublicCustomerPositioning(prospect, websiteScan)
  const brandVoiceSummary = summarizeSignalBrandVoice(prospect, websiteScan)
  const calibration = getSignalOpportunityCalibration(analysisProspect, websiteScan, visualEvidence)
  const evidence = {
    website: websiteScan.evidence,
    visual_screenshot_evidence: visualEvidenceForAnalysis(visualEvidence),
    verified_observations: verifiedObservations,
    evidence_weighting: calibration.evidence_weighting,
    research: {
      provider: researchContext?.research_provider || null,
      query: researchContext?.research_query || null,
      candidate_urls: researchContext?.candidate_urls || [],
      confirmed_official_url: researchContext?.confirmed_official_url || prospect.website_url,
      official_source_confidence:
        researchContext?.official_source_confidence || output.confidence,
    },
    contacts: {
      visible_emails: websiteScan.visible_emails,
      visible_phones: websiteScan.visible_phones,
      booking_links: websiteScan.booking_links,
    },
    generated_claim_guardrail:
      "Recommendations must be read against source URLs and public evidence; unsupported business assumptions are not verified facts.",
  }

  const generatedAt = new Date().toISOString()
  await supabase
    .from("signal_analyses")
    .update({ is_current: false, stale_at: generatedAt, stale_reason: "Replaced by a newer analysis." })
    .eq("prospect_id", prospect.id)
    .eq("is_current", true)

  const { data: analysisData, error: analysisError } = await supabase
    .from("signal_analyses")
    .insert({
      prospect_id: prospect.id,
      analysis_type: "initial",
      model_provider: aiResult?.provider || "rule_based",
      model_name: aiResult?.model || "deterministic-fallback",
      scanned_urls: websiteScan.scanned_urls,
      website_signals: websiteScan,
      evidence,
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
      suggested_conversation_style: styleSuggestion.style,
      conversation_style_reason: styleSuggestion.reason,
      communication_profile: profileSuggestion.profile,
      communication_profile_reason: profileSuggestion.reason,
      contact_readiness: contactReadiness.state,
      evidence_supporting_value_band: [
        ...visualValueReasons(visualEvidence),
        ...output.reasons_to_contact,
      ].slice(0, 8),
      discovery_confirmation_needed: output.red_flags,
      website_opportunity_score: calibration.website_opportunity_score,
      systems_opportunity_score: calibration.systems_opportunity_score,
      recommended_lane: calibration.recommended_lane,
      scan_coverage_confidence: calibration.scan_coverage_confidence,
      scan_coverage_note: calibration.scan_coverage_note,
      evidence_weighting: calibration.evidence_weighting,
      recommended_next_action: calibration.recommended_next_action,
      public_customer_positioning: publicCustomerPositioning,
      brand_voice_summary: brandVoiceSummary,
      research_provider: researchContext?.research_provider || null,
      research_query: researchContext?.research_query || null,
      confirmed_official_url: researchContext?.confirmed_official_url || null,
      official_source_confidence:
        researchContext?.official_source_confidence || output.confidence,
      reasons_to_contact: output.reasons_to_contact,
      red_flags: output.red_flags,
      compliance_warning: output.compliance_warning,
      executive_summary: output.executive_summary,
      identity_version: prospect.identity_version || 1,
      evidence_version: prospect.evidence_version || 1,
      website_version: prospect.website_version || 1,
      category_version: prospect.category_version || 1,
      prompt_version: "signal-analysis-v4",
      input_snapshot: {
        canonical_name: prospect.canonical_name || prospect.business_name,
        public_address: prospect.public_address,
        public_phone: prospect.public_phone,
        industry: prospect.industry,
        website_url: prospect.website_url,
        instagram_url: prospect.instagram_url,
        facebook_url: prospect.facebook_url,
        provider_place_id: prospect.provider_place_id,
        chain_status: prospect.chain_status,
      },
      is_current: true,
      stale_at: null,
      stale_reason: null,
    })
    .select()
    .single()

  if (analysisError) throw new Error(analysisError.message)

  const analysis = analysisData as SignalAnalysis
  const prospectUpdate: Record<string, unknown> = {
    ...buildSignalClassificationFields(classification),
    outreach_mode: suggestedCalibratedOutreachMode(analysisProspect),
    locality_scope: classifySignalLocality(analysisProspect),
    relationship_type: classifySignalRelationship(analysisProspect),
    outreach_history: classifySignalOutreachHistory(analysisProspect),
    conversation_style: styleSuggestion.style,
    conversation_style_reason: styleSuggestion.reason,
    suggested_communication_profile: profileSuggestion.profile,
    communication_profile_reason: profileSuggestion.reason,
    public_brand_tone: profileSuggestion.publicBrandTone,
    contact_readiness: contactReadiness.state,
    contact_readiness_reason: contactReadiness.reason,
  }

  if (researchContext?.confirmed_official_url && !prospect.website_url) {
    prospectUpdate.website_url = researchContext.confirmed_official_url
  }
  if (websiteScan.detected_website_platform && !prospect.existing_website_platform) {
    prospectUpdate.existing_website_platform = websiteScan.detected_website_platform
  }
  if (websiteScan.detected_booking_platform && !prospect.existing_booking_platform) {
    prospectUpdate.existing_booking_platform = websiteScan.detected_booking_platform
  }
  if (websiteScan.visible_emails[0] && !prospect.public_email) {
    prospectUpdate.public_email = websiteScan.visible_emails[0].toLowerCase()
  }
  if (websiteScan.visible_phones[0] && !prospect.public_phone) {
    prospectUpdate.public_phone = websiteScan.visible_phones[0]
  }
  if (
    prospect.outreach_status === "researched" &&
    output.priority !== "skip" &&
    !CONTACTED_OR_FINAL_STATUSES.has(prospect.outreach_status)
  ) {
    prospectUpdate.outreach_status = "needs_review"
  }
  if (researchContext?.research_provider) {
    prospectUpdate.last_researched_at = new Date().toISOString()
  }

  let updatedProspect = prospect
  if (Object.keys(prospectUpdate).length > 0) {
    const { data } = await supabase
      .from("signal_prospects")
      .update(prospectUpdate)
      .eq("id", prospect.id)
      .select()
      .maybeSingle()
    updatedProspect = (data as SignalProspect | null) || ({ ...prospect, ...prospectUpdate } as SignalProspect)
  }

  await syncSignalProspectAliases(
    {
      id: updatedProspect.id,
      business_name: updatedProspect.business_name,
      website_url: updatedProspect.website_url,
      public_phone: updatedProspect.public_phone,
      public_email: updatedProspect.public_email,
    },
    "analysis_refresh",
  )

  const alert = await maybeCreateSignalAlert(updatedProspect, analysis)

  return {
    analysis,
    alert,
    scan: websiteScan,
    ai_unavailable: !aiResult,
    prospect: updatedProspect,
    output,
  }
}
