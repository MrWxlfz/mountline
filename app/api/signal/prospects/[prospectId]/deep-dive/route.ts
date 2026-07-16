import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { isSignalProspectSuppressed, maybeCreateSignalAlert } from "@/lib/signal/alerts"
import {
  SIGNAL_SALES_PROMPT_VERSION,
  SIGNAL_SALES_STRATEGY_VERSION,
  runDeepAiAnalysis,
  runSignalLeadDealDiagnosisAi,
  runSignalLeadSalesStrategyAi,
  runSignalLeadScriptsAi,
} from "@/lib/signal/ai"
import {
  buildPublicCustomerPositioning,
  summarizeSignalBrandVoice,
  suggestSignalConversationStyle,
} from "@/lib/signal/conversation"
import { suggestCommunicationProfile } from "@/lib/signal/communication-profile"
import {
  classifySignalLocality,
  classifySignalOutreachHistory,
  classifySignalRelationship,
  deterministicRelevantDemo,
  deterministicSignalPlaybook,
  getRecommendedNextAction,
  suggestedCalibratedChannel,
  suggestedCalibratedOutreachMode,
} from "@/lib/signal/calibration"
import { completeDeepAnalysisDrafts } from "@/lib/signal/outreach"
import {
  buildDeterministicInitialAnalysis,
  buildFallbackDeepAnalysis,
  calibrateInitialAnalysisOutput,
  getSignalOpportunityCalibration,
} from "@/lib/signal/scoring"
import { applySignalGeneratedSalesPack, buildSignalScriptStudio } from "@/lib/signal/scripts"
import { evaluateSignalSalesPackQuality, validateSignalSalesPackGrounding } from "@/lib/signal/sales-grounding"
import { scanSignalWebsite } from "@/lib/signal/website"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalAnalysis,
  SignalConcept,
  SignalEvidenceLedgerItem,
  SignalOutreachDraft,
  SignalOutreachEvent,
  SignalProspect,
  SignalVerifiedObservation,
  SignalVisualEvidence,
} from "@/lib/supabase/types"
import type { SignalInitialAnalysisOutput } from "@/lib/signal/validation"
import {
  visualEvidenceForAnalysis,
  visualValueReasons,
} from "@/lib/signal/visual-evidence"

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

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function salesContextLabel({
  concept,
  events,
  prospect,
}: {
  concept: SignalConcept | null
  events: SignalOutreachEvent[]
  prospect: SignalProspect
}) {
  const summaries = events.map((event) => event.summary || "").join(" ")
  if (prospect.outreach_status === "do_not_contact" || prospect.pipeline_stage === "lost") return "explicit decline — respectful exit only"
  if (/employee|reception|owner (?:is|was) (?:out|unavailable)/i.test(summaries)) return "employee answered instead of owner"
  if (/busy|bad time|call back/i.test(summaries)) return "owner is busy"
  if (prospect.pipeline_stage === "proposal" || prospect.outreach_status === "proposal_sent") return "proposal follow-up"
  if (prospect.pipeline_stage === "interested") return "owner showed interest"
  if (prospect.outreach_status === "demo_sent") return "follow-up after showing concept"
  if (prospect.outreach_status === "no_response" || prospect.outreach_history === "follow_up_due") return "follow-up after no response"
  if (prospect.outreach_status === "permission_to_send_demo") return "owner asked to receive the link"
  if (concept?.status === "ready" || prospect.concept_status === "ready") return "cold conversation with concept"
  if (prospect.pipeline_stage === "contacted") return "prior contact recorded"
  return prospect.public_phone ? "cold phone or walk-in with no concept" : "initial email or social message"
}

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
  if (!["draft_outreach", "fully_personalized"].includes(prospect.sales_pack_state || "not_ready")) {
    return NextResponse.json({ error: "This lead is limited to a research briefing until identity, opportunity, and contact sufficiency improve." }, { status: 409 })
  }
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
  const [
    { data: outreachRows },
    { data: conceptRows },
    { data: ledgerRows },
    { data: priorDraftRows },
  ] = await Promise.all([
    supabase
      .from("signal_outreach_events")
      .select("*")
      .eq("prospect_id", prospect.id)
      .eq("is_current", true)
      .is("stale_at", null)
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("signal_concepts")
      .select("*")
      .eq("prospect_id", prospect.id)
      .eq("is_current", true)
      .is("stale_at", null)
      .order("created_at", { ascending: false })
      .limit(4),
    supabase
      .from("signal_evidence_ledger")
      .select("*")
      .eq("prospect_id", prospect.id)
      .in("verification_status", ["verified", "corroborated"])
      .order("confidence", { ascending: false, nullsFirst: false })
      .limit(16),
    supabase
      .from("signal_outreach_drafts")
      .select("*")
      .eq("prospect_id", prospect.id)
      .order("created_at", { ascending: false })
      .limit(4),
  ])
  const outreachEvents = (outreachRows || []) as SignalOutreachEvent[]
  const priorConcepts = (conceptRows || []) as SignalConcept[]
  const evidenceLedger = (ledgerRows || []) as SignalEvidenceLedgerItem[]
  const priorDrafts = (priorDraftRows || []) as SignalOutreachDraft[]
  const verifiedObservationText = verifiedObservations
    .map((item) => `${item.category.replace(/_/g, " ")}: ${item.note}`)
    .join("\n")
  const analysisProspect = {
    ...prospect,
    human_notes: [prospect.human_notes, verifiedObservationText].filter(Boolean).join("\n\n") || null,
  } as SignalProspect
  const scan = await scanSignalWebsite(prospect.website_url)
  const fallbackInitial = calibrateInitialAnalysisOutput(
    analysisProspect,
    scan,
    buildDeterministicInitialAnalysis(analysisProspect, scan, visualEvidence),
    visualEvidence,
  )
  const opportunityCalibration = getSignalOpportunityCalibration(analysisProspect, scan, visualEvidence)

  const { data: latestAnalysis } = await supabase
    .from("signal_analyses")
    .select("*")
    .eq("prospect_id", prospect.id)
    .eq("is_current", true)
    .is("stale_at", null)
    .not("overall_opportunity_score", "is", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const initial = calibrateInitialAnalysisOutput(
    analysisProspect,
    scan,
    initialFromAnalysis((latestAnalysis as SignalAnalysis | null) || null, fallbackInitial),
    visualEvidence,
  )
  const fallbackDeep = buildFallbackDeepAnalysis(analysisProspect, scan, initial, visualEvidence)
  const aiResult = await runDeepAiAnalysis(analysisProspect, scan, initial)
  const deep = completeDeepAnalysisDrafts(
    analysisProspect,
    aiResult?.output || fallbackDeep,
    initial,
    scan,
  )
  deep.recommended_primary_offer = fallbackInitial.recommended_primary_offer
  deep.recommended_secondary_offer = fallbackInitial.recommended_secondary_offer
  deep.suggested_channel = suggestedCalibratedChannel(analysisProspect, scan)
  deep.suggested_outreach_mode = suggestedCalibratedOutreachMode(analysisProspect)
  deep.project_value_band = fallbackInitial.potential_project_value_band
  deep.project_value_reason = fallbackInitial.potential_project_value_reason
  const conversation = suggestSignalConversationStyle(analysisProspect, scan)
  const communicationProfile = suggestCommunicationProfile(analysisProspect, scan)
  const customerPositioning = buildPublicCustomerPositioning(analysisProspect, scan)
  const brandVoice = summarizeSignalBrandVoice(analysisProspect, scan)

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
        visual_screenshot_evidence: visualEvidenceForAnalysis(visualEvidence),
        verified_observations: verifiedObservations,
        evidence_based_opportunities: deep.evidence_based_opportunities,
        what_looks_good: deep.what_looks_good,
        visible_problem: deep.visible_problem,
      },
      evidence: {
        website: scan.evidence,
        visual_screenshot_evidence: visualEvidenceForAnalysis(visualEvidence),
        verified_observations: verifiedObservations,
        opportunities: deep.evidence_based_opportunities,
        weighting: opportunityCalibration.evidence_weighting,
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
      website_opportunity_score: opportunityCalibration.website_opportunity_score,
      systems_opportunity_score: opportunityCalibration.systems_opportunity_score,
      recommended_lane: opportunityCalibration.recommended_lane,
      scan_coverage_confidence: opportunityCalibration.scan_coverage_confidence,
      scan_coverage_note: opportunityCalibration.scan_coverage_note,
      evidence_weighting: opportunityCalibration.evidence_weighting,
      recommended_next_action: getRecommendedNextAction(prospect),
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
      communication_profile: communicationProfile.profile,
      communication_profile_reason: communicationProfile.reason,
      evidence_supporting_value_band: [
        ...visualValueReasons(visualEvidence),
        ...initial.reasons_to_contact,
      ].slice(0, 8),
      discovery_confirmation_needed: initial.red_flags,
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
  const deterministicStudio = buildSignalScriptStudio({
    analysis,
    communicationProfile: communicationProfile.profile,
    conversationStyle: conversation.style,
    prospect: analysisProspect,
    scan,
  })
  const verifiedLedgerFacts = evidenceLedger
    .filter((item) => item.evidence_category === "verified_public_fact")
    .map((item) => item.claim_text)
  const publicFacts = Array.from(new Set([
    `Canonical business name: ${prospect.business_name}`,
    prospect.industry ? `Verified business category: ${prospect.industry}` : null,
    prospect.city ? `Verified location: ${[prospect.city, prospect.state].filter(Boolean).join(", ")}` : null,
    ...verifiedLedgerFacts,
    ...scan.evidence.map((item) => item.snippet),
  ].filter((item): item is string => Boolean(item)))).slice(0, 16)
  const explicitlyDeclined = prospect.outreach_status === "do_not_contact"
    || prospect.pipeline_stage === "lost"
    || outreachEvents.some((event) => ["declined", "do_not_contact"].includes(event.event_type))
  const priceDiscussed = outreachEvents.some((event) => /\b(?:price|pricing|cost|quote|budget)\b/i.test(event.summary || ""))
  const contactHistory = outreachEvents.map((event) =>
    `${event.event_type.replace(/_/g, " ")} via ${event.channel}${event.summary ? `: ${event.summary}` : ""}`,
  ).slice(0, 12)
  const sentAssets = outreachEvents
    .filter((event) => ["demo_sent", "follow_up_sent", "delivered"].includes(event.event_type))
    .map((event) => `${event.event_type.replace(/_/g, " ")} via ${event.channel}`)
  const currentContext = salesContextLabel({ prospect, events: outreachEvents, concept: priorConcepts[0] || null })
  const salesContext = {
    businessName: prospect.business_name,
    city: [prospect.city, prospect.state].filter(Boolean).join(", ") || null,
    industry: prospect.industry,
    websiteStatus: prospect.website_url
      ? scan.broken_response || scan.error ? "website unreachable or incomplete" : "official website scanned"
      : "no verified website URL",
    publicFacts,
    evidence: evidenceLedger.map((item) => ({
      label: item.source_title || item.claim_type.replace(/_/g, " "),
      excerpt: item.claim_text,
      url: item.source_url,
    })),
    scoreSummary: `Opportunity ${analysis.overall_opportunity_score ?? "unknown"}; confidence ${analysis.confidence || "unknown"}; lane ${analysis.recommended_lane || "unknown"}.`,
    verifiedContact: [
      prospect.public_phone ? `Public phone: ${prospect.public_phone}` : null,
      prospect.public_email ? `Public email: ${prospect.public_email}` : null,
      prospect.public_address ? `Public address: ${prospect.public_address}` : null,
    ].filter((item): item is string => Boolean(item)),
    websiteFindings: [
      ...scan.evidence.map((item) => `${item.signal}: ${item.snippet}`),
      analysis.scan_coverage_note,
    ].filter((item): item is string => Boolean(item)).slice(0, 12),
    communicationProfile: [communicationProfile.profile.replace(/_/g, " "), conversation.reason],
    strongestOpportunity: prospect.primary_opportunity || analysis.recommended_primary_offer || deep.recommended_primary_offer,
    uncertainties: Array.from(new Set([
      ...stringList(prospect.must_verify),
      ...stringList(analysis.discovery_confirmation_needed),
    ])).slice(0, 8),
    forbiddenClaims: Array.from(new Set([
      ...stringList(prospect.do_not_pitch),
      "Do not promise revenue, traffic, conversion, or customer outcomes.",
      "Do not present private observations as public facts.",
    ])).slice(0, 10),
    recommendedChannel: analysis.suggested_channel || "research_more",
    pipelineStage: prospect.pipeline_stage || "found",
    contactHistory,
    observations: verifiedObservations.map((item) => `${item.category.replace(/_/g, " ")}: ${item.note}`),
    sentAssets,
    conceptStatus: priorConcepts[0]?.status || prospect.concept_status || "not_started",
    priceDiscussed,
    explicitlyDeclined,
    promisedNextStep: prospect.next_action,
    currentContext,
  }

  const diagnosisResult = await runSignalLeadDealDiagnosisAi(salesContext)
  const strategyResult = diagnosisResult
    ? await runSignalLeadSalesStrategyAi({ ...salesContext, diagnosis: diagnosisResult.output })
    : null
  let scriptsResult = diagnosisResult && strategyResult
    ? await runSignalLeadScriptsAi({ ...salesContext, diagnosis: diagnosisResult.output, strategy: strategyResult.output })
    : null
  const qualityInput = {
    businessName: prospect.business_name,
    verifiedFacts: publicFacts,
    pipelineStage: salesContext.pipelineStage,
    contactHistory,
    explicitlyDeclined,
    promisedNextStep: prospect.next_action,
  }
  const qualityPack = () => scriptsResult ? {
    ...scriptsResult.output,
    lovable_prompt: priorConcepts[0]?.generation_prompt || `Concept prompts for ${prospect.business_name} are generated separately from verified evidence.`,
  } : null
  let grounding = scriptsResult ? validateSignalSalesPackGrounding({ ...qualityInput, pack: qualityPack() }) : null
  let retryCount = 0
  if (scriptsResult && grounding && !grounding.valid && diagnosisResult && strategyResult) {
    const retry = await runSignalLeadScriptsAi({
      ...salesContext,
      diagnosis: diagnosisResult.output,
      strategy: strategyResult.output,
      qualityCritique: grounding.issues.slice(0, 8).join(" "),
    })
    if (retry) {
      scriptsResult = retry
      retryCount = 1
      grounding = validateSignalSalesPackGrounding({ ...qualityInput, pack: qualityPack() })
    }
  }
  const acceptedAi = Boolean(diagnosisResult && strategyResult && scriptsResult && grounding?.valid)
  const scriptStudio = acceptedAi && diagnosisResult && strategyResult && scriptsResult
    ? applySignalGeneratedSalesPack({
      studio: deterministicStudio,
      diagnosis: diagnosisResult.output,
      strategy: strategyResult.output,
      scripts: scriptsResult.output,
    })
    : deterministicStudio
  const persistedQualityPack = acceptedAi && scriptsResult
    ? qualityPack()
    : {
      one_minute_briefing: `${prospect.business_name}: ${analysis.executive_summary || deterministicStudio.strongest_angle}`,
      best_angle: deterministicStudio.strongest_angle,
      walk_in_opener: deterministicStudio.walk_in_opener,
      busy_response: deterministicStudio.busy_response,
      concept_transition: deterministicStudio.concept_transition,
      discovery_questions: deterministicStudio.discovery_call_questions,
      price_transition: deterministicStudio.how_much_response,
      call_script: deterministicStudio.first_call_opener,
      follow_up_text: deterministicStudio.follow_up_draft,
      objections: Object.entries(deterministicStudio.objection_responses).slice(0, 4).map(([objection, response]) => ({ objection, response })),
      do_not_say: stringList(prospect.do_not_pitch).length ? stringList(prospect.do_not_pitch) : ["Do not promise outcomes.", "Do not invent urgency.", "Do not criticize the business."],
      next_steps: [deterministicStudio.recommended_close, deterministicStudio.fallback_close, deterministicStudio.graceful_exit],
      lovable_prompt: priorConcepts[0]?.generation_prompt || `Concept prompts for ${prospect.business_name} are generated separately.`,
      objective: deterministicStudio.objective,
      value_bridge: deterministicStudio.value_bridge,
      concept_reveal: deterministicStudio.concept_reveal,
      recommended_close: deterministicStudio.recommended_close,
      fallback_close: deterministicStudio.fallback_close,
      graceful_exit: deterministicStudio.graceful_exit,
      delivery_notes: deterministicStudio.delivery_notes,
      variants: deterministicStudio.variants,
    }
  const quality = evaluateSignalSalesPackQuality({ ...qualityInput, pack: persistedQualityPack })
  const fallbackStatus = acceptedAi
    ? "not_used"
    : publicFacts.length < 2
      ? "insufficient_evidence"
      : scriptsResult
        ? "quality_rejected"
        : "provider_unavailable"
  const { data: draft, error: draftError } = await supabase
    .from("signal_outreach_drafts")
    .insert({
      prospect_id: prospect.id,
      analysis_id: analysis.id,
      outreach_mode: deep.suggested_outreach_mode,
      conversation_style: scriptStudio.conversation_style,
      conversation_style_reason: scriptStudio.conversation_style_reason,
      communication_profile: scriptStudio.communication_profile,
      communication_profile_reason: scriptStudio.communication_profile_reason,
      first_contact_subject: deep.first_contact_subject,
      first_contact_email: scriptStudio.first_email_draft || deep.first_contact_email,
      permission_based_dm: scriptStudio.permission_based_dm,
      owner_call_opener: scriptStudio.first_call_opener || deep.owner_call_opener,
      gatekeeper_script: scriptStudio.receptionist_script || deep.gatekeeper_script,
      voicemail_script: scriptStudio.voicemail_script || deep.voicemail_script,
      demo_send_followup: scriptStudio.sure_send_it_response || deep.demo_send_followup,
      discovery_call_questions: scriptStudio.discovery_call_questions,
      proposal_angle: scriptStudio.proposal_angle || deep.proposal_angle,
      script_studio: scriptStudio,
      follow_up_email: scriptStudio.follow_up_draft,
      objection_responses: scriptStudio.objection_responses,
      deal_diagnosis: diagnosisResult?.output || scriptStudio.deal_diagnosis,
      conversation_strategy: strategyResult?.output || scriptStudio.conversation_strategy,
      prompt_version: SIGNAL_SALES_PROMPT_VERSION,
      strategy_version: SIGNAL_SALES_STRATEGY_VERSION,
      quality_score: quality.score,
      retry_count: retryCount,
      fallback_status: fallbackStatus,
      generation_metadata: {
        generated_by: acceptedAi ? "ai" : "deterministic_fallback",
        ai_provider: scriptsResult ? `${scriptsResult.provider}:${scriptsResult.model}` : null,
        quality_dimensions: quality.dimensions,
        quality_issues: acceptedAi ? [] : grounding?.issues?.slice(0, 8) || ["AI sales generation unavailable."],
        diagnosis_attempts: diagnosisResult?.attempt || 0,
        strategy_attempts: strategyResult?.attempt || 0,
        script_attempts: scriptsResult?.attempt || 0,
        context: currentContext,
        prior_draft_count: priorDrafts.length,
      },
    })
    .select()
    .single()

  if (draftError) {
    return NextResponse.json({ error: draftError.message }, { status: 500 })
  }

  await supabase
    .from("signal_analyses")
    .update({
      external_readiness: scriptStudio.external_readiness,
      recommended_next_action: scriptStudio.recommended_next_action,
    })
    .eq("id", analysis.id)

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
  updates.industry_playbook = deterministicSignalPlaybook(analysisProspect)
  updates.relevant_demo = deterministicRelevantDemo(analysisProspect)
  updates.locality_scope = classifySignalLocality(prospect)
  updates.relationship_type = classifySignalRelationship(prospect)
  updates.outreach_history = classifySignalOutreachHistory(prospect)
  updates.conversation_style = scriptStudio.conversation_style
  updates.conversation_style_reason = scriptStudio.conversation_style_reason
  updates.suggested_communication_profile = scriptStudio.communication_profile
  updates.communication_profile_reason = scriptStudio.communication_profile_reason
  updates.public_brand_tone = communicationProfile.publicBrandTone
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
