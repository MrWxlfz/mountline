import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { isSignalProspectSuppressed } from "@/lib/signal/alerts"
import { buildSignalCopilotInputFromProspect } from "@/lib/signal/artifacts"
import { buildSignalCopilotState, type SignalProviderIssue } from "@/lib/signal/copilot"
import { generateSignalSalesCopilotPack } from "@/lib/signal/sales-copilot"
import { buildSignalScriptStudio } from "@/lib/signal/scripts"
import { signalScriptStudioSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalAnalysis,
  SignalEvidenceLedgerItem,
  SignalOutreachEvent,
  SignalProspect,
  SignalVerifiedObservation,
} from "@/lib/supabase/types"
import type { SignalWebsiteScan } from "@/lib/signal/website"

function getScan(analysis: SignalAnalysis | null) {
  const signals = analysis?.website_signals
  if (!signals || typeof signals !== "object") return null
  if ("scan" in signals && signals.scan && typeof signals.scan === "object") {
    return signals.scan as SignalWebsiteScan
  }
  return signals as SignalWebsiteScan
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => ({}))
  const parsed = signalScriptStudioSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid script settings." }, { status: 400 })
  }

  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: prospectData, error: prospectError } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()

  if (prospectError) return NextResponse.json({ error: prospectError.message }, { status: 500 })
  if (!prospectData) return NextResponse.json({ error: "Prospect not found" }, { status: 404 })

  const prospect = prospectData as SignalProspect
  if (!["exact_match", "user_confirmed", "verified"].includes(prospect.identity_resolution_state || "unresolved")) {
    return NextResponse.json({ error: "Confirm the exact business before preparing a sales or verification pack." }, { status: 409 })
  }
  if (prospect.outreach_status === "do_not_contact" || (await isSignalProspectSuppressed(prospect))) {
    return NextResponse.json(
      { error: "Scripts are disabled while this prospect is marked do-not-contact." },
      { status: 409 },
    )
  }

  const [
    { data: latestAnalysis },
    { data: evidenceRows },
    { data: outreachRows },
  ] = await Promise.all([
    supabase
      .from("signal_analyses")
      .select("*")
      .eq("prospect_id", prospect.id)
      .eq("is_current", true)
      .is("stale_at", null)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase.from("signal_evidence_ledger").select("*").eq("prospect_id", prospect.id).order("created_at", { ascending: false }),
    supabase.from("signal_outreach_events").select("*").eq("prospect_id", prospect.id).order("created_at", { ascending: false }).limit(1),
  ])

  const analysis = (latestAnalysis as SignalAnalysis | null) || null
  const { data: observationRows } = await supabase
    .from("signal_verified_observations")
    .select("*")
    .eq("prospect_id", prospect.id)
    .order("created_at", { ascending: false })
  const verifiedObservations = (observationRows || []) as SignalVerifiedObservation[]
  const verifiedObservationText = verifiedObservations
    .map((item) => `${item.category.replace(/_/g, " ")}: ${item.note}`)
    .join("\n")
  const scriptProspect = {
    ...prospect,
    human_notes: [prospect.human_notes, verifiedObservationText].filter(Boolean).join("\n\n") || null,
  } as SignalProspect
  const baseStudio = buildSignalScriptStudio({
    analysis,
    communicationProfile: parsed.data.communication_profile || null,
    conversationStyle: parsed.data.conversation_style || analysis?.suggested_conversation_style,
    guidance: parsed.data.guidance || null,
    prospect: scriptProspect,
    scan: getScan(analysis),
  })
  const latestOutreach = ((outreachRows || [])[0] as SignalOutreachEvent | undefined) || null
  const providerIssues = Array.isArray(prospect.provider_limitations)
    ? prospect.provider_limitations as unknown as SignalProviderIssue[]
    : []
  const copilotInput = {
    ...buildSignalCopilotInputFromProspect({
      prospect,
      evidence: (evidenceRows || []) as SignalEvidenceLedgerItem[],
      providerIssues,
      opportunityScore: analysis?.overall_opportunity_score,
      strongExistingSite: (analysis?.website_quality_score || 0) >= 76,
    }),
    lastOutreachSummary: latestOutreach?.summary || null,
  }
  const copilotState = buildSignalCopilotState(copilotInput)
  const salesPack = generateSignalSalesCopilotPack(copilotInput, copilotState)
  const objectionResponses = Object.fromEntries(salesPack.objections.map((item) => [item.objection, item.response]))
  const scriptStudio = {
    ...baseStudio,
    first_call_opener: salesPack.opening,
    receptionist_script: salesPack.employee_answer,
    permission_based_dm: salesPack.follow_up_text,
    sure_send_it_response: salesPack.branches.send_it,
    discovery_call_questions: salesPack.discovery_questions,
    first_email_draft: salesPack.follow_up_email,
    follow_up_draft: salesPack.follow_up_email,
    proposal_angle: salesPack.recommended_offer.initial_scope,
    objection_responses: objectionResponses,
    recommended_next_action: copilotState.next_action.exact_instruction,
    deal_diagnosis: salesPack.diagnosis,
    conversation_strategy: salesPack.strategy,
    objective: salesPack.objective,
    strongest_angle: copilotState.recommendation.best_angle,
    walk_in_opener: copilotState.assistance_mode === "verification_outreach"
      ? `Hi, Luke with Mountline Studio${prospect.city ? ` here in ${prospect.city}` : ""}. Mountline wanted to confirm the current customer information for ${prospect.business_name}. Who usually handles the website or service details?`
      : baseStudio.walk_in_opener,
    busy_response: salesPack.owner_busy,
    concept_transition: "Mountline kept this to one focused preview using verified facts. Would a quick look be useful?",
    value_bridge: salesPack.value_bridge,
    concept_reveal: salesPack.concept_reveal,
    recommended_close: salesPack.next_commitment,
    fallback_close: salesPack.owner_busy,
    graceful_exit: salesPack.graceful_exit,
    delivery_notes: salesPack.thinks_ahead.during_contact,
    variants: {
      ...baseStudio.variants,
      phone: salesPack.opening,
      walk_in: baseStudio.walk_in_opener,
      text: salesPack.follow_up_text,
      email: salesPack.follow_up_email,
      already_has_website: salesPack.branches.already_has_website,
      facebook_primary: salesPack.branches.facebook_primary,
      already_busy: salesPack.branches.already_busy,
      send_it: salesPack.branches.send_it,
    },
    external_readiness: {
      passed: salesPack.review.passed,
      blocked_terms: salesPack.review.issues,
      warning: salesPack.review.passed ? null : "The red-team review found issues. Use the deterministic verification-first fallback and review before contact.",
    },
  }

  const generatedAt = new Date().toISOString()
  await supabase
    .from("signal_outreach_drafts")
    .update({ is_current: false, stale_at: generatedAt, stale_reason: "Replaced by a newer sales pack." })
    .eq("prospect_id", prospect.id)
    .eq("is_current", true)

  const { data: draft, error: draftError } = await supabase
    .from("signal_outreach_drafts")
    .insert({
      prospect_id: prospect.id,
      analysis_id: analysis?.id || null,
      outreach_mode: analysis?.suggested_outreach_mode || prospect.outreach_mode,
      conversation_style: scriptStudio.conversation_style,
      conversation_style_reason: scriptStudio.conversation_style_reason,
      communication_profile: scriptStudio.communication_profile,
      communication_profile_reason: scriptStudio.communication_profile_reason,
      first_contact_subject: copilotState.assistance_mode === "verification_outreach" ? `${prospect.business_name} information question` : `${prospect.business_name} focused idea`,
      first_contact_email: scriptStudio.first_email_draft,
      permission_based_dm: scriptStudio.permission_based_dm,
      owner_call_opener: scriptStudio.first_call_opener,
      gatekeeper_script: scriptStudio.receptionist_script,
      voicemail_script: scriptStudio.voicemail_script,
      demo_send_followup: scriptStudio.sure_send_it_response,
      discovery_call_questions: scriptStudio.discovery_call_questions,
      proposal_angle: scriptStudio.proposal_angle,
      script_studio: scriptStudio,
      follow_up_email: scriptStudio.follow_up_draft,
      objection_responses: scriptStudio.objection_responses,
      deal_diagnosis: salesPack.diagnosis,
      conversation_strategy: salesPack.strategy,
      prompt_version: "signal-sales-four-pass-v4",
      strategy_version: "signal-copilot-v4",
      quality_score: salesPack.review.quality_score,
      retry_count: salesPack.review.attempts - 1,
      fallback_status: salesPack.review.fallback_used ? "quality_rejected" : "not_used",
      generation_metadata: { review: salesPack.review, thinks_ahead: salesPack.thinks_ahead, recommended_offer: salesPack.recommended_offer },
      identity_version: prospect.identity_version || 1,
      evidence_version: prospect.evidence_version || 1,
      website_version: prospect.website_version || 1,
      category_version: prospect.category_version || 1,
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
      assistance_mode: copilotState.assistance_mode,
      is_current: true,
    })
    .select()
    .single()

  if (draftError) return NextResponse.json({ error: draftError.message }, { status: 500 })

  if (analysis?.id) {
    await supabase
      .from("signal_analyses")
      .update({
      external_readiness: scriptStudio.external_readiness,
      recommended_next_action: scriptStudio.recommended_next_action,
      communication_profile: scriptStudio.communication_profile,
      communication_profile_reason: scriptStudio.communication_profile_reason,
    })
      .eq("id", analysis.id)
  }

  await supabase
    .from("signal_prospects")
    .update({
      conversation_style: scriptStudio.conversation_style,
      conversation_style_reason: scriptStudio.conversation_style_reason,
      suggested_communication_profile: scriptStudio.communication_profile,
      communication_profile_reason: scriptStudio.communication_profile_reason,
      script_guidance: parsed.data.guidance || prospect.script_guidance,
      assistance_mode: copilotState.assistance_mode,
      next_action: copilotState.next_action.exact_instruction,
      next_action_plan: copilotState.next_action,
      action_availability: copilotState.action_availability,
    })
    .eq("id", prospect.id)

  return NextResponse.json({
    draft,
    script_studio: scriptStudio,
    sales_pack: salesPack,
    assistance_mode: copilotState.assistance_mode,
    needs_manual_review: !scriptStudio.external_readiness.passed,
  })
}
