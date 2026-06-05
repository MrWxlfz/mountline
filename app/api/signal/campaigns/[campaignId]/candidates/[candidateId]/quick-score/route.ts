import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { runInitialAiAnalysis } from "@/lib/signal/ai"
import {
  buildSignalClassificationFields,
  resolveSignalClassification,
} from "@/lib/signal/classification"
import {
  buildDeterministicInitialAnalysis,
  calibrateInitialAnalysisOutput,
  getSignalOpportunityCalibration,
} from "@/lib/signal/scoring"
import { normalizeSignalUrl, scanSignalWebsite } from "@/lib/signal/website"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalCampaignCandidate, SignalProspect } from "@/lib/supabase/types"

function buildTemporaryProspect(candidate: SignalCampaignCandidate): SignalProspect {
  const now = new Date().toISOString()
  return {
    id: candidate.id,
    created_at: now,
    updated_at: now,
    business_name: candidate.business_name,
    contact_name: null,
    industry: candidate.industry_hint || "general local business",
    industry_playbook: candidate.classified_playbook || "general_local_business",
    compliance_tier: "standard",
    city: candidate.city,
    state: candidate.state,
    locality_relationship: null,
    website_url: candidate.likely_official_url || candidate.candidate_url,
    public_email: null,
    public_phone: null,
    public_contact_form_url: null,
    instagram_url: null,
    source: "public_web_research",
    existing_website_platform: null,
    existing_booking_platform: null,
    human_notes: candidate.source_snippet,
    what_looks_good: null,
    visible_problem: null,
    relevant_demo: "none",
    outreach_mode: "professional_studio",
    locality_scope: "unknown",
    relationship_type: "none",
    outreach_history: "never_contacted",
    conversation_style: "friendly_local",
    conversation_style_reason: null,
    known_communication_context: null,
    public_brand_tone: null,
    suggested_communication_profile: null,
    communication_profile_reason: null,
    communication_profile_confirmed: false,
    script_guidance: null,
    normalized_business_name: null,
    normalized_hostname: null,
    public_email_normalized: null,
    public_phone_normalized: null,
    classification_source: null,
    classification_confidence: null,
    classification_evidence: [],
    classification_manual_override: false,
    classified_at: null,
    quick_score_updated_at: null,
    contact_readiness: "contact_missing",
    contact_readiness_reason: null,
    outreach_status: "needs_review",
    contacted_at: null,
    follow_up_date: null,
    assigned_to: null,
    last_researched_at: null,
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ campaignId: string; candidateId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { campaignId, candidateId } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_campaign_candidates")
    .select("*")
    .eq("id", candidateId)
    .eq("campaign_id", campaignId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Candidate not found." }, { status: 404 })

  const candidate = data as SignalCampaignCandidate
  const officialUrl = normalizeSignalUrl(candidate.likely_official_url || candidate.candidate_url)
  if (!officialUrl) {
    return NextResponse.json(
      { error: "Candidate needs a confirmed official public website before quick score." },
      { status: 400 },
    )
  }

  const scan = await scanSignalWebsite(officialUrl.toString())
  const classification = await resolveSignalClassification({
    businessName: candidate.business_name,
    city: candidate.city,
    state: candidate.state,
    industryHint: candidate.industry_hint,
    websiteUrl: officialUrl.toString(),
    selectedPlaybook: candidate.classified_playbook,
    manualOverride: candidate.classification_source === "manual_override",
    scan,
    sourceTitle: candidate.source_title,
    sourceSnippet: candidate.source_snippet,
  })

  const prospect = {
    ...buildTemporaryProspect(candidate),
    ...buildSignalClassificationFields(classification),
    website_url: officialUrl.toString(),
    public_email: scan.visible_emails[0] || null,
    public_phone: scan.visible_phones[0] || null,
    public_contact_form_url: scan.booking_links[0] || null,
    existing_website_platform: scan.detected_website_platform,
    existing_booking_platform: scan.detected_booking_platform,
  } as SignalProspect

  const fallback = buildDeterministicInitialAnalysis(prospect, scan, [])
  const ai = await runInitialAiAnalysis(prospect, scan)
  const output = calibrateInitialAnalysisOutput(prospect, scan, ai?.output || fallback, [])
  const calibration = getSignalOpportunityCalibration(prospect, scan, [])
  const summary = {
    official_url: officialUrl.toString(),
    classification: {
      playbook: classification.playbook,
      source: classification.source,
      confidence: classification.confidence,
      evidence: classification.evidence,
    },
    quick_score: {
      overall_opportunity_score: output.overall_opportunity_score,
      website_opportunity_score: calibration.website_opportunity_score,
      systems_opportunity_score: calibration.systems_opportunity_score,
      priority: output.priority,
      recommended_lane: calibration.recommended_lane,
      recommended_demo: output.recommended_demo,
      confidence: output.confidence,
      scan_coverage_confidence: calibration.scan_coverage_confidence,
      scan_coverage_note: calibration.scan_coverage_note,
      executive_summary: output.executive_summary,
      ai_unavailable: !ai,
    },
    evidence: scan.evidence.slice(0, 6),
    updated_at: new Date().toISOString(),
  }

  const { data: updated, error: updateError } = await supabase
    .from("signal_campaign_candidates")
    .update({
      likely_official_url: officialUrl.toString(),
      classified_category: classification.playbook,
      classified_playbook: classification.playbook,
      classification_source: classification.source,
      classification_confidence: classification.confidence,
      classification_evidence: classification.evidence,
      normalized_business_name: classification.normalizedBusinessName || null,
      normalized_hostname: classification.normalizedHostname || null,
      classified_at: classification.classifiedAt,
      quick_score_summary: summary,
      quick_score_updated_at: new Date().toISOString(),
      reason:
        scan.broken_response && scan.error
          ? scan.error
          : candidate.reason,
    })
    .eq("id", candidate.id)
    .eq("campaign_id", campaignId)
    .select()
    .single()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({
    candidate: updated,
    summary,
    ai_unavailable: !ai,
    visual_unavailable_message:
      "Visual score unavailable — screenshot provider not configured. Candidate quick score used public-site text only.",
  })
}
