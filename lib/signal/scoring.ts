import "server-only"

import type { SignalProspect } from "@/lib/supabase/types"
import {
  classifySignalLocality,
  classifySignalOutreachHistory,
  deterministicRelevantDemo,
  deterministicSignalPlaybook,
  getRecommendedLane,
  getRecommendedNextAction,
  suggestedCalibratedChannel,
  suggestedCalibratedOutreachMode,
} from "./calibration"
import { getSignalPlaybook, MEDICAL_COMPLIANCE_WARNING } from "./playbooks"
import type { SignalWebsiteScan } from "./website"
import type { SignalVisualEvidence } from "@/lib/supabase/types"
import {
  isVisualIndustry,
  visualEvidenceForAnalysis,
  visualSignalsForScoring,
  visualValueReasons,
} from "./visual-evidence"
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
  const relationship = prospect.relationship_type || "none"
  return relationship !== "none"
}

function humanResearchText(prospect: SignalProspect) {
  return [
    prospect.locality_relationship,
    prospect.human_notes,
    prospect.what_looks_good,
    prospect.visible_problem,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

function humanResearchScore(prospect: SignalProspect) {
  const pool = humanResearchText(prospect)
  let score = 0
  if (includesAny(pool, ["strong reputation", "strong public reputation", "great reviews", "customer feedback", "high rating"])) score += 14
  if (includesAny(pool, ["active social", "active business", "customer engagement", "posts", "engagement"])) score += 12
  if (includesAny(pool, ["weak website", "site is weak", "website presentation", "doesn't present", "does not present"])) score += 14
  if (includesAny(pool, ["keller", "local", "dfw", "nearby"])) score += 8
  if (includesAny(pool, ["already emailed", "emailed", "awaiting reply"])) score += 2
  if (prospect.what_looks_good) score += 7
  if (prospect.visible_problem) score += 10
  return clampScore(score)
}

function getScanCoverage(scan: SignalWebsiteScan | null) {
  if (!scan || scan.broken_response || scan.scanned_urls.length === 0) {
    return {
      confidence: "low" as const,
      note: "No reliable official website scan is available.",
      homepage: false,
      contactOnly: false,
    }
  }

  const paths = scan.scanned_urls.map((rawUrl) => {
    try {
      return new URL(rawUrl).pathname.toLowerCase()
    } catch {
      return ""
    }
  })
  const homepage = paths.some((path) => path === "/" || path === "")
  const serviceLike = paths.some((path) => /service|package|pricing|gallery|portfolio|work|about/.test(path))
  const contactLike = paths.some((path) => /contact|book|appointment|schedule|quote|estimate/.test(path))
  const contactOnly = contactLike && !homepage && !serviceLike

  if (contactOnly) {
    return {
      confidence: "low" as const,
      note: "Insufficient scan coverage for visual/site-quality judgment; only contact or booking pages were scanned.",
      homepage,
      contactOnly,
    }
  }

  if (homepage && serviceLike) {
    return {
      confidence: "high" as const,
      note: "Homepage plus service/gallery/about context were scanned.",
      homepage,
      contactOnly: false,
    }
  }

  if (homepage) {
    return {
      confidence: "medium" as const,
      note: "Homepage was scanned; deeper service/gallery context is limited.",
      homepage,
      contactOnly: false,
    }
  }

  return {
    confidence: "low" as const,
    note: "Homepage was not clearly scanned, so visual/site-quality judgment is limited.",
    homepage,
    contactOnly: false,
  }
}

function getWebsiteQualityScore(scan: SignalWebsiteScan | null) {
  if (!scan) return 35
  if (scan.broken_response) return 22
  const coverage = getScanCoverage(scan)

  let score = 38
  if (scan.page_title) score += 9
  if (scan.meta_description) score += 8
  if (scan.headings.length > 0) score += 8
  if (scan.service_language.length > 0) score += 8
  if (scan.cta_words.length >= 2 && coverage.homepage) score += 4
  if (scan.pricing_language.length > 0) score += 5
  if (scan.hours_location_language.length > 0) score += 5
  if (scan.image_count >= 4) score += 6
  if (!scan.meta_description) score -= 5
  if (scan.headings.length === 0) score -= 8
  if (coverage.confidence === "low") score = Math.min(score, 58)
  if (coverage.contactOnly) score = Math.min(score, 45)

  return clampScore(score)
}

function getBusinessViabilityScore(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  let score = 46
  if (prospect.city || prospect.state) score += 10
  if (prospect.website_url && scan && !scan.broken_response) score += 12
  if (prospect.public_email || prospect.public_phone || prospect.public_contact_form_url) {
    score += 12
  }
  if (prospect.human_notes) score += 10
  if (prospect.what_looks_good) score += 6
  if (getSignalPlaybook(deterministicSignalPlaybook(prospect)).key !== "general_local_business") {
    score += 8
  }
  score += Math.round(humanResearchScore(prospect) * 0.35)
  return clampScore(score)
}

function getOperationalOpportunityScore(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  let score = 36
  const playbook = getSignalPlaybook(deterministicSignalPlaybook(prospect))

  if (prospect.visible_problem) score += 20
  if (prospect.human_notes) score += 10
  if (scan?.booking_links.length) score += 8
  if (scan?.cta_words.some((word) => ["quote", "estimate", "appointment", "book", "schedule"].includes(word))) {
    score += 12
  }
  if (["hvac", "roofing_contractors_home_services"].includes(playbook.key)) score += 12
  if (["auto_detailing", "barber_salon"].includes(playbook.key)) score += 8
  if (playbook.key === "medical_dental") score -= 8
  if (!prospect.website_url || scan?.broken_response) score += 8
  score += Math.round(humanResearchScore(prospect) * 0.25)

  return clampScore(score)
}

function getWebsiteServiceFitScore(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  let score = 48
  const playbook = getSignalPlaybook(deterministicSignalPlaybook(prospect))
  const websiteQuality = getWebsiteQualityScore(scan)

  if (playbook.relevantDemo !== "none") score += 22
  if (websiteQuality < 55) score += 18
  else if (websiteQuality < 75) score += 10
  else score -= 4
  if (prospect.visible_problem) score += 16
  if (!prospect.website_url || scan?.broken_response) score += 16
  if (scan?.service_language.length) score += 5
  if (scan?.image_count && scan.image_count > 3) score += 4
  score += Math.round(humanResearchScore(prospect) * 0.35)

  return clampScore(score)
}

function getAiWorkflowFitScore(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  const playbook = getSignalPlaybook(deterministicSignalPlaybook(prospect))
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
  if (hasRelationship(prospect)) score += 12
  if (classifySignalLocality(prospect) === "keller_local") score += 8
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
  const playbook = getSignalPlaybook(deterministicSignalPlaybook(prospect))
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
  const playbook = getSignalPlaybook(deterministicSignalPlaybook(prospect))
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
  const playbook = getSignalPlaybook(deterministicSignalPlaybook(prospect))
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
  return suggestedCalibratedChannel(prospect, scan)
}

function suggestedOutreachMode(prospect: SignalProspect) {
  return suggestedCalibratedOutreachMode(prospect)
}

function buildReasons(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
  visualEvidence: SignalVisualEvidence[] = [],
) {
  const reasons: string[] = []
  const playbook = getSignalPlaybook(deterministicSignalPlaybook(prospect))
  const visual = visualSignalsForScoring(visualEvidence)

  if (playbook.key !== "general_local_business") {
    reasons.push(`${playbook.name} playbook matches the entered industry.`)
  }
  if (playbook.relevantDemo !== "none") {
    reasons.push(`Mountline already has a relevant ${playbook.name.toLowerCase()} demo.`)
  }
  if (prospect.visible_problem) reasons.push(prospect.visible_problem)
  if (prospect.human_notes) reasons.push(`Human-entered observation: ${prospect.human_notes.slice(0, 180)}`)
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
  if (visual.assessed) {
    reasons.push(`Visual screenshot evidence: ${visual.summary}`)
  } else if (isVisualIndustry(playbook.key)) {
    reasons.push("Upload screenshot for stronger website scoring in this visual industry.")
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
  visualEvidence: SignalVisualEvidence[] = [],
): SignalInitialAnalysisOutput {
  const visual = visualSignalsForScoring(visualEvidence)
  const websiteQuality = visual.assessed && typeof visual.score === "number"
    ? visual.score
    : getWebsiteQualityScore(scan)
  const businessViability = getBusinessViabilityScore(prospect, scan)
  const operationalOpportunity = getOperationalOpportunityScore(prospect, scan)
  const websiteServiceFit = getWebsiteServiceFitScore(prospect, scan)
  const aiWorkflowFit = getAiWorkflowFitScore(prospect, scan)
  const reachability = getReachabilityScore(prospect, scan)
  const complianceRisk = getComplianceRiskScore(prospect)
  const compliancePenalty = complianceRisk >= 80 ? 10 : 0
  const websiteOpportunityScore = clampScore(
    websiteServiceFit * 0.42 +
      (100 - websiteQuality) * 0.24 +
      businessViability * 0.16 +
      humanResearchScore(prospect) * 0.12 +
      reachability * 0.06 +
      visual.opportunityBoost -
      compliancePenalty,
  )
  const systemsOpportunityScore = clampScore(
    operationalOpportunity * 0.28 +
      aiWorkflowFit * 0.38 +
      reachability * 0.18 +
      businessViability * 0.16 -
      (complianceRisk >= 80 ? 18 : 0),
  )
  const lane = getRecommendedLane({
    complianceTier: prospect.compliance_tier,
    systemsScore: systemsOpportunityScore,
    websiteScore: websiteOpportunityScore,
  })
  const overall = lane === "systems_discovery"
    ? Math.max(systemsOpportunityScore, Math.round(websiteOpportunityScore * 0.85))
    : websiteOpportunityScore
  const reasons = buildReasons(prospect, scan, visualEvidence)
  const redFlags = buildRedFlags(prospect, scan)
  const priority =
    prospect.outreach_status === "do_not_contact" ? "skip" : coercePriority(overall)
  const confidence = coerceConfidence(
    reasons.length + (scan?.evidence.length || 0) + (visual.assessed ? 4 : 0),
    Boolean(scan && !scan.broken_response) || visual.assessed,
  )
  const valueBand = getValueBand(overall, prospect)
  const playbook = getSignalPlaybook(deterministicSignalPlaybook(prospect))
  const recommendedDemo = deterministicRelevantDemo(prospect)

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
    recommended_demo: recommendedDemo,
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

export function getSignalOpportunityCalibration(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
  visualEvidence: SignalVisualEvidence[] = [],
) {
  const visual = visualSignalsForScoring(visualEvidence)
  const websiteQuality = visual.assessed && typeof visual.score === "number"
    ? visual.score
    : getWebsiteQualityScore(scan)
  const businessViability = getBusinessViabilityScore(prospect, scan)
  const operationalOpportunity = getOperationalOpportunityScore(prospect, scan)
  const websiteServiceFit = getWebsiteServiceFitScore(prospect, scan)
  const aiWorkflowFit = getAiWorkflowFitScore(prospect, scan)
  const reachability = getReachabilityScore(prospect, scan)
  const complianceRisk = getComplianceRiskScore(prospect)
  const scanCoverage = getScanCoverage(scan)
  const humanScore = humanResearchScore(prospect)
  const websiteOpportunityScore = clampScore(
    websiteServiceFit * 0.42 +
      (100 - websiteQuality) * 0.24 +
      businessViability * 0.16 +
      humanScore * 0.12 +
      reachability * 0.06 +
      visual.opportunityBoost -
      (complianceRisk >= 80 ? 10 : 0),
  )
  const systemsOpportunityScore = clampScore(
    operationalOpportunity * 0.28 +
      aiWorkflowFit * 0.38 +
      reachability * 0.18 +
      businessViability * 0.16 -
      (complianceRisk >= 80 ? 18 : 0),
  )
  const recommendedLane = getRecommendedLane({
    complianceTier: prospect.compliance_tier,
    systemsScore: systemsOpportunityScore,
    websiteScore: websiteOpportunityScore,
  })
  return {
    website_opportunity_score: websiteOpportunityScore,
    systems_opportunity_score: systemsOpportunityScore,
    recommended_lane: recommendedLane,
    scan_coverage_confidence: scanCoverage.confidence,
    scan_coverage_note: scanCoverage.note,
    evidence_weighting: {
      official_website_evidence: scan?.evidence || [],
      visual_screenshot_evidence: visualEvidenceForAnalysis(visualEvidence),
      user_research_observations: [
        prospect.human_notes && `Human-entered observation: ${prospect.human_notes}`,
        prospect.what_looks_good && `Human-entered observation: ${prospect.what_looks_good}`,
        prospect.visible_problem && `Human-entered observation: ${prospect.visible_problem}`,
        prospect.locality_relationship && `Human-entered context: ${prospect.locality_relationship}`,
      ].filter(Boolean),
      system_derived_classification: {
        playbook: deterministicSignalPlaybook(prospect),
        relevant_demo: deterministicRelevantDemo(prospect),
        locality: classifySignalLocality(prospect),
        outreach_history: classifySignalOutreachHistory(prospect),
      },
      ai_interpretation:
        "AI may interpret evidence, but deterministic known-category classification and demo matching take precedence.",
    },
    recommended_next_action: getRecommendedNextAction(prospect),
  }
}

export function calibrateInitialAnalysisOutput(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
  output: SignalInitialAnalysisOutput,
  visualEvidence: SignalVisualEvidence[] = [],
): SignalInitialAnalysisOutput {
  const calibration = getSignalOpportunityCalibration(prospect, scan, visualEvidence)
  const visual = visualSignalsForScoring(visualEvidence)
  const websiteQuality = visual.assessed && typeof visual.score === "number"
    ? visual.score
    : getWebsiteQualityScore(scan)
  const overall = calibration.recommended_lane === "systems_discovery"
    ? Math.max(calibration.systems_opportunity_score, Math.round(calibration.website_opportunity_score * 0.85))
    : calibration.website_opportunity_score
  const priority = prospect.outreach_status === "do_not_contact" ? "skip" : coercePriority(overall)
  const scanCoverageLow = calibration.scan_coverage_confidence === "low"
  const missingVisualForVisualIndustry =
    isVisualIndustry(deterministicSignalPlaybook(prospect)) && !visual.assessed
  const confidence =
    (scanCoverageLow || missingVisualForVisualIndustry) && output.confidence === "high"
      ? "medium"
      : visual.assessed && output.confidence === "low"
        ? "medium"
        : output.confidence

  return {
    ...output,
    website_quality_score: websiteQuality,
    business_viability_score: getBusinessViabilityScore(prospect, scan),
    operational_opportunity_score: getOperationalOpportunityScore(prospect, scan),
    website_service_fit_score: getWebsiteServiceFitScore(prospect, scan),
    ai_workflow_fit_score: getAiWorkflowFitScore(prospect, scan),
    reachability_score: getReachabilityScore(prospect, scan),
    compliance_risk_score: getComplianceRiskScore(prospect),
    overall_opportunity_score: overall,
    priority,
    commercial_fit: coerceCommercialFit(overall),
    recommended_demo: deterministicRelevantDemo(prospect),
    suggested_channel: suggestedCalibratedChannel(prospect, scan),
    suggested_outreach_mode: suggestedCalibratedOutreachMode(prospect),
    recommended_primary_offer: recommendedPrimaryOffer(prospect, scan),
    recommended_secondary_offer: recommendedSecondaryOffer(prospect),
    confidence,
    executive_summary:
      `${prospect.business_name} is calibrated as ${priority} with ${calibration.recommended_lane.replace(/_/g, " ")} as the recommended lane. ${visual.assessed ? "Visual screenshot evidence is included." : calibration.scan_coverage_note}`,
  }
}

export function buildEvidenceMap(scan: SignalWebsiteScan | null) {
  return scan?.evidence.map((item) => `${item.signal}: ${item.snippet}`) || []
}

export function buildFallbackDeepAnalysis(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
  initial: SignalInitialAnalysisOutput,
  visualEvidence: SignalVisualEvidence[] = [],
): SignalDeepAnalysisOutput {
  const playbook = getSignalPlaybook(deterministicSignalPlaybook(prospect))
  const evidence = buildEvidenceMap(scan)
  const topEvidence = evidence.length > 0 ? evidence.slice(0, 4) : initial.reasons_to_contact.slice(0, 4)
  const complianceGated = prospect.compliance_tier === "compliance_gated"
  const opportunityType = complianceGated
    ? "compliance_review_required"
    : initial.recommended_primary_offer.toLowerCase().includes("booking") ||
        initial.recommended_primary_offer.toLowerCase().includes("quote") ||
        initial.recommended_primary_offer.toLowerCase().includes("request")
      ? "booking_or_quote_flow"
      : scan?.booking_links.length
        ? "preserve_existing_booking_integration"
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
      evidence: [
        ...visualValueReasons(visualEvidence),
        ...(topEvidence.length > 0 ? topEvidence : ["Human-entered prospect information only."]),
      ].slice(0, 6),
        why_it_matters: complianceGated
          ? "This sector needs compliance review before any operational or AI workflow is discussed beyond public-site improvements."
          : "The public evidence points to a practical website or workflow conversation. Any missed-call, admin, or follow-up workflow should be framed as worth asking about on a discovery call.",
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
