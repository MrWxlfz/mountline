import "server-only"

import type { SignalProspect } from "@/lib/supabase/types"
import { getSignalPlaybook, MEDICAL_COMPLIANCE_WARNING } from "./playbooks"
import type { SignalWebsiteScan } from "./website"
import {
  coerceCommercialFit,
  coerceConfidence,
  coercePriority,
  type SignalDeepAnalysisOutput,
  type SignalInitialAnalysisOutput,
} from "./validation"

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function includesAny(value: string | null | undefined, keywords: string[]) {
  const lower = value?.toLowerCase() || ""
  return keywords.some((keyword) => lower.includes(keyword))
}

function hasRelationship(prospect: SignalProspect) {
  return includesAny(prospect.locality_relationship, [
    "keller",
    "roanoke",
    "visited",
    "customer",
    "family",
    "referral",
    "local",
  ])
}

function getWebsiteQualityScore(scan: SignalWebsiteScan | null) {
  if (!scan) return 35
  if (scan.broken_response) return 22

  let score = 38
  if (scan.page_title) score += 9
  if (scan.meta_description) score += 8
  if (scan.headings.length > 0) score += 8
  if (scan.service_language.length > 0) score += 8
  if (scan.cta_words.length >= 2) score += 8
  if (scan.visible_phones.length > 0 || scan.visible_emails.length > 0) score += 7
  if (scan.booking_links.length > 0) score += 6
  if (scan.pricing_language.length > 0) score += 5
  if (scan.hours_location_language.length > 0) score += 5
  if (scan.image_count >= 4) score += 6
  if (!scan.meta_description) score -= 5
  if (scan.headings.length === 0) score -= 8

  return clampScore(score)
}

function getBusinessViabilityScore(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  let score = 42
  if (prospect.city || prospect.state) score += 10
  if (prospect.website_url && scan && !scan.broken_response) score += 12
  if (prospect.public_email || prospect.public_phone || prospect.public_contact_form_url) {
    score += 12
  }
  if (prospect.human_notes) score += 7
  if (prospect.what_looks_good) score += 6
  if (getSignalPlaybook(prospect.industry_playbook).key !== "general_local_business") {
    score += 8
  }
  return clampScore(score)
}

function getOperationalOpportunityScore(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  let score = 36
  const playbook = getSignalPlaybook(prospect.industry_playbook)

  if (prospect.visible_problem) score += 16
  if (prospect.human_notes) score += 8
  if (scan?.booking_links.length) score += 8
  if (scan?.cta_words.some((word) => ["quote", "estimate", "appointment", "book", "schedule"].includes(word))) {
    score += 12
  }
  if (["hvac", "roofing_contractors_home_services"].includes(playbook.key)) score += 12
  if (playbook.key === "medical_dental") score -= 8
  if (!prospect.website_url || scan?.broken_response) score += 8

  return clampScore(score)
}

function getWebsiteServiceFitScore(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  let score = 48
  const playbook = getSignalPlaybook(prospect.industry_playbook)
  const websiteQuality = getWebsiteQualityScore(scan)

  if (playbook.relevantDemo !== "none") score += 12
  if (websiteQuality < 55) score += 18
  else if (websiteQuality < 75) score += 10
  else score -= 4
  if (prospect.visible_problem) score += 10
  if (!prospect.website_url || scan?.broken_response) score += 16
  if (scan?.service_language.length) score += 5
  if (scan?.image_count && scan.image_count > 3) score += 4

  return clampScore(score)
}

function getAiWorkflowFitScore(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  const playbook = getSignalPlaybook(prospect.industry_playbook)
  let score = 30

  if (["hvac", "roofing_contractors_home_services"].includes(playbook.key)) score += 24
  if (["auto_detailing", "barber_salon"].includes(playbook.key)) score += 12
  if (scan?.cta_words.some((word) => ["quote", "estimate", "appointment", "schedule"].includes(word))) {
    score += 12
  }
  if (prospect.human_notes && includesAny(prospect.human_notes, ["follow", "missed", "admin", "lead", "booking", "intake"])) {
    score += 14
  }
  if (playbook.key === "medical_dental") score = Math.min(score, 45)

  return clampScore(score)
}

function getReachabilityScore(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  let score = 24
  if (prospect.public_phone || scan?.visible_phones.length) score += 22
  if (prospect.public_email || scan?.visible_emails.length) score += 18
  if (prospect.public_contact_form_url) score += 14
  if (prospect.instagram_url) score += 4
  if (hasRelationship(prospect)) score += 18
  if (!prospect.public_phone && !prospect.public_email && !prospect.public_contact_form_url) {
    score -= 8
  }
  return clampScore(score)
}

function getComplianceRiskScore(prospect: SignalProspect) {
  if (prospect.compliance_tier === "compliance_gated") return 88
  if (prospect.compliance_tier === "sensitive") return 55
  return 18
}

function getValueBand(score: number, prospect: SignalProspect) {
  const playbook = getSignalPlaybook(prospect.industry_playbook)
  if (score >= 88 || ["hvac", "roofing_contractors_home_services"].includes(playbook.key)) {
    return "$3,500-$10,000+" as const
  }
  if (score >= 68 || playbook.key === "medical_dental") {
    return "$1,250-$3,500" as const
  }
  if (score >= 45) return "$500-$1,250" as const
  return "unknown" as const
}

function recommendedPrimaryOffer(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  const playbook = getSignalPlaybook(prospect.industry_playbook)
  if (playbook.key === "medical_dental") {
    return "Compliance-safe public website and service-page review"
  }
  if (!prospect.website_url || scan?.broken_response) {
    return "Simple public website foundation and contact flow"
  }
  if (["hvac", "roofing_contractors_home_services"].includes(playbook.key)) {
    return "Trust-first website with estimate/request routing"
  }
  if (playbook.key === "auto_detailing") {
    return "Package clarity, gallery, and request-detail flow"
  }
  if (playbook.key === "barber_salon") {
    return "Modern site that preserves booking and clarifies services"
  }
  return "Website clarity and contact-flow improvement"
}

function recommendedSecondaryOffer(prospect: SignalProspect) {
  const playbook = getSignalPlaybook(prospect.industry_playbook)
  if (playbook.key === "medical_dental") {
    return "General non-patient-specific FAQ organization after compliance review"
  }
  if (playbook.key === "hvac") return "Missed-call and maintenance follow-up workflow discovery"
  if (playbook.key === "roofing_contractors_home_services") {
    return "Lead organization and project/status update workflow discovery"
  }
  if (playbook.key === "auto_detailing") return "Follow-up and rebooking workflow discovery"
  if (playbook.key === "barber_salon") return "Reminder and service/menu update workflow discovery"
  return "Basic workflow discovery around repeated customer questions"
}

function suggestedChannel(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  if (hasRelationship(prospect)) return "warm_intro" as const
  if (prospect.public_phone || scan?.visible_phones.length) return "call" as const
  if (prospect.public_email || scan?.visible_emails.length) return "email" as const
  if (prospect.public_contact_form_url) return "contact_form" as const
  if (prospect.instagram_url) return "instagram" as const
  return "research_more" as const
}

function suggestedOutreachMode(prospect: SignalProspect) {
  if (prospect.outreach_mode === "warm_connection" || hasRelationship(prospect)) {
    return "warm_connection" as const
  }
  const playbook = getSignalPlaybook(prospect.industry_playbook)
  if (
    ["auto_detailing", "barber_salon", "general_local_business"].includes(playbook.key) &&
    includesAny(prospect.locality_relationship, ["keller", "roanoke", "visited", "local"])
  ) {
    return "local_student" as const
  }
  return "professional_studio" as const
}

function buildReasons(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  const reasons: string[] = []
  const playbook = getSignalPlaybook(prospect.industry_playbook)

  if (playbook.key !== "general_local_business") {
    reasons.push(`${playbook.name} playbook matches the entered industry.`)
  }
  if (playbook.relevantDemo !== "none") {
    reasons.push(`Mountline already has a relevant ${playbook.name.toLowerCase()} demo.`)
  }
  if (prospect.visible_problem) reasons.push(prospect.visible_problem)
  if (prospect.what_looks_good) reasons.push(`Positive public signal: ${prospect.what_looks_good}`)
  if (scan?.cta_words.length) {
    reasons.push(`Website shows CTA language: ${scan.cta_words.slice(0, 5).join(", ")}.`)
  }
  if (scan?.booking_links.length) {
    reasons.push("A public booking or scheduling path is visible.")
  }
  if (prospect.public_phone || prospect.public_email || prospect.public_contact_form_url) {
    reasons.push("A public contact route is available for manual outreach.")
  }
  if (!prospect.website_url || scan?.broken_response) {
    reasons.push("Website presence needs manual review because the homepage is missing or could not be scanned.")
  }

  return reasons.slice(0, 8)
}

function buildRedFlags(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  const redFlags: string[] = []

  if (prospect.outreach_status === "do_not_contact") {
    redFlags.push("Prospect is marked do not contact.")
  }
  if (!prospect.public_phone && !prospect.public_email && !prospect.public_contact_form_url) {
    redFlags.push("No public business phone, email, or contact-form URL has been entered.")
  }
  if (scan?.broken_response) {
    redFlags.push(`Website scan issue: ${scan.error || "homepage could not be read"}.`)
  }
  if (prospect.compliance_tier === "compliance_gated") {
    redFlags.push("Compliance-gated sector. Keep the pitch limited to public website and general administrative review.")
  }

  return redFlags.slice(0, 8)
}

export function buildDeterministicInitialAnalysis(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
): SignalInitialAnalysisOutput {
  const websiteQuality = getWebsiteQualityScore(scan)
  const businessViability = getBusinessViabilityScore(prospect, scan)
  const operationalOpportunity = getOperationalOpportunityScore(prospect, scan)
  const websiteServiceFit = getWebsiteServiceFitScore(prospect, scan)
  const aiWorkflowFit = getAiWorkflowFitScore(prospect, scan)
  const reachability = getReachabilityScore(prospect, scan)
  const complianceRisk = getComplianceRiskScore(prospect)
  const compliancePenalty = complianceRisk >= 80 ? 10 : 0
  const overall = clampScore(
    businessViability * 0.18 +
      operationalOpportunity * 0.2 +
      websiteServiceFit * 0.24 +
      aiWorkflowFit * 0.12 +
      reachability * 0.16 +
      (100 - websiteQuality) * 0.1 -
      compliancePenalty,
  )
  const reasons = buildReasons(prospect, scan)
  const redFlags = buildRedFlags(prospect, scan)
  const priority =
    prospect.outreach_status === "do_not_contact" ? "skip" : coercePriority(overall)
  const confidence = coerceConfidence(
    reasons.length + (scan?.evidence.length || 0),
    Boolean(scan && !scan.broken_response),
  )
  const valueBand = getValueBand(overall, prospect)
  const playbook = getSignalPlaybook(prospect.industry_playbook)

  return {
    website_quality_score: websiteQuality,
    business_viability_score: businessViability,
    operational_opportunity_score: operationalOpportunity,
    website_service_fit_score: websiteServiceFit,
    ai_workflow_fit_score: aiWorkflowFit,
    reachability_score: reachability,
    compliance_risk_score: complianceRisk,
    overall_opportunity_score: overall,
    priority,
    commercial_fit: coerceCommercialFit(overall),
    potential_project_value_band: valueBand,
    potential_project_value_reason:
      valueBand === "unknown"
        ? "Evidence is too thin to estimate a credible project band."
        : `Based on ${playbook.name.toLowerCase()} fit, public contact availability, website/service signals, and the likely scope of website or workflow improvement.`,
    recommended_primary_offer: recommendedPrimaryOffer(prospect, scan),
    recommended_secondary_offer: recommendedSecondaryOffer(prospect),
    recommended_demo: prospect.relevant_demo || playbook.relevantDemo,
    suggested_channel: suggestedChannel(prospect, scan),
    suggested_outreach_mode: suggestedOutreachMode(prospect),
    executive_summary:
      priority === "skip"
        ? `${prospect.business_name} needs manual review before outreach. Signal is using only entered notes and public website evidence.`
        : `${prospect.business_name} looks like a ${priority} Signal prospect for ${recommendedPrimaryOffer(prospect, scan).toLowerCase()}. Evidence confidence is ${confidence}.`,
    reasons_to_contact: reasons,
    red_flags: redFlags,
    compliance_warning:
      prospect.compliance_tier === "compliance_gated" ? MEDICAL_COMPLIANCE_WARNING : null,
    confidence,
  }
}

export function buildEvidenceMap(scan: SignalWebsiteScan | null) {
  return scan?.evidence.map((item) => `${item.signal}: ${item.snippet}`) || []
}

export function buildFallbackDeepAnalysis(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
  initial: SignalInitialAnalysisOutput,
): SignalDeepAnalysisOutput {
  const playbook = getSignalPlaybook(prospect.industry_playbook)
  const evidence = buildEvidenceMap(scan)
  const topEvidence = evidence.length > 0 ? evidence.slice(0, 4) : initial.reasons_to_contact.slice(0, 4)
  const complianceGated = prospect.compliance_tier === "compliance_gated"
  const opportunityType = complianceGated
    ? "compliance_review_required"
    : initial.recommended_primary_offer.toLowerCase().includes("booking") ||
        initial.recommended_primary_offer.toLowerCase().includes("quote") ||
        initial.recommended_primary_offer.toLowerCase().includes("request")
      ? "booking_or_quote_flow"
      : "website_redesign"

  return {
    what_looks_good:
      prospect.what_looks_good ||
      scan?.page_title ||
      `${prospect.business_name} has enough public context for a careful manual review.`,
    visible_problem:
      prospect.visible_problem ||
      (scan?.broken_response
        ? `The public website could not be scanned cleanly: ${scan.error || "unknown scan issue"}.`
        : "The main opportunity should be confirmed in a short discovery conversation before pitching."),
    evidence_based_opportunities: [
      {
        opportunity_type: opportunityType,
        evidence: topEvidence.length > 0 ? topEvidence : ["Human-entered prospect information only."],
        why_it_matters: complianceGated
          ? "This sector needs compliance review before any operational or AI workflow is discussed beyond public-site improvements."
          : "The public evidence points to a practical website or workflow conversation without needing unsupported claims.",
        honest_offer_language: initial.recommended_primary_offer,
        do_not_promise: complianceGated
          ? [
              "HIPAA-compliant AI services",
              "Patient intake, diagnosis, triage, call transcription, or EHR integration",
            ]
          : [
              "Guaranteed revenue lift",
              "Automated outreach",
              "Facts not visible in public evidence or human notes",
            ],
      },
    ],
    recommended_primary_offer: initial.recommended_primary_offer,
    recommended_secondary_offer: initial.recommended_secondary_offer,
    project_value_band: initial.potential_project_value_band,
    project_value_reason: initial.potential_project_value_reason,
    suggested_channel: initial.suggested_channel,
    suggested_outreach_mode: initial.suggested_outreach_mode,
    first_contact_subject: `${prospect.business_name} website idea`,
    first_contact_email: "",
    permission_based_dm: "",
    owner_call_opener: "",
    gatekeeper_script: "",
    voicemail_script: "",
    demo_send_followup: "",
    discovery_call_questions: playbook.discoveryQuestions,
    proposal_angle: `Position Mountline around ${initial.recommended_primary_offer.toLowerCase()}, then ask discovery questions before proposing scope.`,
    red_flags: initial.red_flags,
    compliance_warning: initial.compliance_warning,
    confidence: initial.confidence,
  }
}
