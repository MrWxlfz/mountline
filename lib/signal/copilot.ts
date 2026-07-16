import {
  getSignalPlaybook,
  inferSignalPlaybook,
  type SignalPlaybookKey,
} from "./playbooks.ts"

export type SignalAssistanceMode =
  | "identity_resolution"
  | "verification_outreach"
  | "opportunity_outreach"
  | "active_deal_support"

export type SignalUncertaintyClass = "blocking" | "strategy_limiting" | "non_blocking"

export type SignalRecommendationDecision =
  | "Pursue now"
  | "Verify one detail, then pursue"
  | "Research further"
  | "Hold"
  | "Skip"
  | "Wrong match"

export type SignalArtifactKind =
  | "verdict"
  | "confidence_dimensions"
  | "business_profile"
  | "opportunity"
  | "approachability"
  | "offer"
  | "concept"
  | "sales_strategy"
  | "scripts"
  | "next_action"
  | "preferred_channel"
  | "supporting_claims"
  | "evidence_summary"

export type SignalIdentityField =
  | "canonical_name"
  | "public_address"
  | "public_phone"
  | "industry"
  | "website_url"
  | "instagram_url"
  | "facebook_url"
  | "provider_place_id"
  | "chain_status"

export type SignalBusinessProfile = {
  primary_category: string
  secondary_categories: string[]
  playbook: SignalPlaybookKey
  likely_business_model: string
  location_type: "storefront" | "service_area" | "hybrid" | "unknown"
  interaction_model: string
  known_services: string[]
  likely_customer_intent: string
  dominant_contact_route: string
  public_customer_journey: string
  current_public_presence: string[]
  reputation_signals: string[]
  trust_signals: string[]
  visual_nature: "high" | "moderate" | "low" | "unknown"
  repeat_customer_behavior: string | null
  location_dependence: "high" | "moderate" | "low" | "unknown"
  public_hours: string[]
  current_conversion_action: string
  missing_customer_information: string[]
  facts_requiring_verification: string[]
  inference_notes: string[]
}

export type SignalUncertainty = {
  key: string
  question: string
  classification: SignalUncertaintyClass
  why_it_matters: string
  what_signal_checked: string[]
  automatic_action: string
  manual_action: string
  resolution_options: string[]
  dependent_artifacts: SignalArtifactKind[]
}

export type SignalResearchMission = {
  key: "official_website" | "social_presence" | "category_services" | "contact_path"
  title: string
  status: "complete" | "in_progress" | "limited" | "needs_luke"
  sources_checked: string[]
  conclusion: string
  confidence: "high" | "medium" | "low"
  failure_reason: string | null
  luke_intervention_required: boolean
  next_automatic_step: string | null
}

export type SignalProviderIssue = {
  provider: string
  operation: string
  status: "degraded" | "unavailable" | "recovered"
  error_category: "authentication" | "configuration" | "timeout" | "rate_limit" | "network" | "provider" | "database" | "unknown"
  user_explanation: string
  retryable: boolean
  effect_on_analysis: string
  last_successful_use: string | null
}

export type SignalExecutiveRecommendation = {
  decision: SignalRecommendationDecision
  why: string[]
  best_angle: string
  best_next_move: string
  prepared_asset: string
  avoid_saying: string[]
}

export type SignalOpportunityBrief = {
  current_situation: string
  friction: string
  recommended_solution: string
  customer_benefit: string
  business_benefit: string
  verification_required: string[]
  smallest_sensible_offer: string
  exclusions: string[]
}

export type SignalNextActionPlan = {
  action_type: "confirm_identity" | "research" | "call" | "walk_in" | "email" | "follow_up" | "prepare_proposal" | "hold" | "close"
  exact_instruction: string
  reason: string
  due_at: string | null
  required_preparation: string[]
  completion_criteria: string
  fallback_action: string
}

export type SignalActionAvailability = Record<
  "confirm_identity" | "verification_call" | "neutral_walk_in" | "research" | "concept" | "sales_pack" | "focus" | "practice" | "teleprompter" | "call" | "text" | "email" | "log_outreach" | "follow_up" | "proposal" | "create_client_project",
  { enabled: boolean; reason: string | null }
>

export type SignalAnalysisQuality = {
  score: number
  threshold: number
  passed: boolean
  dimensions: Record<
    "identity_correctness" | "source_agreement" | "business_understanding" | "opportunity_specificity" | "actionability" | "sales_usefulness" | "stale_data_safety" | "claim_safety" | "category_relevance" | "natural_language",
    number
  >
  weaknesses: string[]
}

export type SignalCopilotInput = {
  businessName: string
  address?: string | null
  phone?: string | null
  email?: string | null
  contactFormUrl?: string | null
  city?: string | null
  state?: string | null
  category?: string | null
  identityState?: string | null
  locationType?: SignalBusinessProfile["location_type"] | null
  websiteStatus?: string | null
  websiteUrl?: string | null
  socialUrls?: string[]
  providerPlaceId?: string | null
  chainStatus?: string | null
  openingHours?: string[]
  verifiedFacts?: string[]
  verifiedServices?: string[]
  rejectedSources?: string[]
  sourceClassifications?: string[]
  providerIssues?: SignalProviderIssue[]
  opportunityScore?: number | null
  opportunityEvidenceCount?: number
  strongExistingSite?: boolean
  pipelineStage?: string | null
  outreachStatus?: string | null
  lastOutreachSummary?: string | null
  nextActionDueAt?: string | null
  explicitDecline?: boolean
  doNotContact?: boolean
  artifactSafetyPassed?: boolean
}

export type SignalCopilotState = {
  business_profile: SignalBusinessProfile
  research_missions: SignalResearchMission[]
  uncertainty_budget: SignalUncertainty[]
  assistance_mode: SignalAssistanceMode
  recommendation: SignalExecutiveRecommendation
  opportunity: SignalOpportunityBrief
  next_action: SignalNextActionPlan
  action_availability: SignalActionAvailability
  analysis_quality: SignalAnalysisQuality
  provider_limitations: SignalProviderIssue[]
}

const READY_IDENTITIES = new Set(["exact_match", "user_confirmed", "verified"])
const ACTIVE_DEAL_STAGES = new Set(["contacted", "interested", "proposal", "won", "lost"])

const ARTIFACT_DEPENDENCIES: Record<SignalArtifactKind, SignalIdentityField[]> = {
  verdict: ["canonical_name", "public_address", "industry", "website_url", "chain_status"],
  confidence_dimensions: ["canonical_name", "public_address", "public_phone", "website_url", "provider_place_id"],
  business_profile: ["canonical_name", "public_address", "public_phone", "industry", "website_url", "instagram_url", "facebook_url", "provider_place_id", "chain_status"],
  opportunity: ["canonical_name", "industry", "website_url", "public_phone", "chain_status"],
  approachability: ["canonical_name", "public_address", "public_phone", "industry"],
  offer: ["canonical_name", "industry", "website_url"],
  concept: ["canonical_name", "public_address", "public_phone", "industry", "website_url", "instagram_url", "facebook_url"],
  sales_strategy: ["canonical_name", "public_address", "public_phone", "industry", "website_url", "instagram_url", "facebook_url", "chain_status"],
  scripts: ["canonical_name", "public_address", "public_phone", "industry", "website_url", "instagram_url", "facebook_url"],
  next_action: ["canonical_name", "public_phone", "industry", "website_url"],
  preferred_channel: ["public_phone", "website_url", "instagram_url", "facebook_url"],
  supporting_claims: ["canonical_name", "public_address", "public_phone", "industry", "website_url", "provider_place_id"],
  evidence_summary: ["canonical_name", "public_address", "public_phone", "industry", "website_url", "provider_place_id"],
}

const SIGNAL_IDENTITY_FIELDS: SignalIdentityField[] = [
  "canonical_name",
  "public_address",
  "public_phone",
  "industry",
  "website_url",
  "instagram_url",
  "facebook_url",
  "provider_place_id",
  "chain_status",
]

function unique(values: Array<string | null | undefined>, limit = 20) {
  return Array.from(new Set(values.map((value) => value?.replace(/\s+/g, " ").trim()).filter((value): value is string => Boolean(value)))).slice(0, limit)
}

function hasFact(facts: string[], pattern: RegExp) {
  return facts.some((fact) => pattern.test(fact))
}

function isIdentityReady(input: SignalCopilotInput) {
  return READY_IDENTITIES.has(input.identityState || "unresolved")
}

function playbookFor(input: SignalCopilotInput) {
  const key = inferSignalPlaybook(input.category) as SignalPlaybookKey
  return { key, playbook: getSignalPlaybook(key) }
}

function websiteIsConfirmed(input: SignalCopilotInput) {
  return Boolean(input.websiteUrl && /verified_official|website_(weak|adequate|strong)|official/i.test(input.websiteStatus || ""))
}

function websiteIsUnresolved(input: SignalCopilotInput) {
  return !websiteIsConfirmed(input) && !input.strongExistingSite
}

function customerJourneyFallback(playbookKey: SignalPlaybookKey) {
  if (playbookKey === "roofing_contractors_home_services" || playbookKey === "hvac") {
    return { model: "Quote and service-request driven", primaryIntent: "Confirm fit, service area, trust, and response path", dominantContactRoute: "Phone or quote request", likelyConversionAction: "Request service or an estimate" }
  }
  if (playbookKey === "restaurant_food") {
    return { model: "Walk-in, reservation, or order driven", primaryIntent: "Check menu, hours, location, and ordering", dominantContactRoute: "Directions, order link, or phone", likelyConversionAction: "Visit, reserve, or order" }
  }
  return { model: "Local service or storefront", primaryIntent: "Confirm services, trust, location, and contact information", dominantContactRoute: "Phone, directions, contact form, or booking", likelyConversionAction: "Call, visit, book, or request a quote" }
}

export function buildSignalBusinessProfile(input: SignalCopilotInput): SignalBusinessProfile {
  const facts = unique(input.verifiedFacts || [])
  const { key, playbook } = playbookFor(input)
  const journey = playbook.customerJourney || customerJourneyFallback(key)
  const presence = unique([
    websiteIsConfirmed(input) ? `Official website: ${input.websiteUrl}` : null,
    input.socialUrls?.length ? `${input.socialUrls.length} social profile${input.socialUrls.length === 1 ? "" : "s"} accepted as relevant` : null,
    input.providerPlaceId ? "Structured map listing" : null,
    input.sourceClassifications?.includes("review_platform") ? "Public review profile" : null,
    input.sourceClassifications?.includes("directory") ? "Third-party directory listings" : null,
  ])
  const reputation = unique(facts.filter((fact) => /review|rating|recommend|reputation/i.test(fact)))
  const trust = unique([
    input.address ? `Public location: ${input.address}` : null,
    input.phone ? `Public phone: ${input.phone}` : null,
    ...facts.filter((fact) => /address|phone|hours|established|licensed|insured|credential/i.test(fact)),
  ], 8)
  const verifiedServices = unique(input.verifiedServices || [])
  const serviceQuestions = (playbook.offerModules || [])
    .filter((module) => !verifiedServices.some((service) => service.toLowerCase().includes(module.label.toLowerCase().split(" ")[0])))
    .map((module) => module.verificationQuestion)
  const missing = unique([
    websiteIsUnresolved(input) ? "Official website or primary customer-information page" : null,
    ...serviceQuestions.slice(0, 4),
  ])
  const storefront = input.locationType === "storefront"
  const repeatBehavior = ["dry_cleaner_laundry", "pet_grooming", "barber_salon", "spa_wellness"].includes(key)
    ? "Repeat visits are plausible for this category, but frequency is not verified."
    : null
  const visualNature: SignalBusinessProfile["visual_nature"] = ["auto_detailing", "pet_grooming", "bakery_donut", "spa_wellness", "beauty_wellness", "barber_salon"].includes(key)
    ? "high"
    : "moderate"

  return {
    primary_category: input.category || playbook.name,
    secondary_categories: [],
    playbook: key,
    likely_business_model: journey.model,
    location_type: input.locationType || "unknown",
    interaction_model: journey.model,
    known_services: verifiedServices,
    likely_customer_intent: journey.primaryIntent,
    dominant_contact_route: journey.dominantContactRoute,
    public_customer_journey: `A customer is likely trying to ${journey.primaryIntent.toLowerCase()}, then ${journey.likelyConversionAction.toLowerCase()}. This is a category-based hypothesis until the business confirms it.`,
    current_public_presence: presence,
    reputation_signals: reputation,
    trust_signals: trust,
    visual_nature: visualNature,
    repeat_customer_behavior: repeatBehavior,
    location_dependence: storefront ? "high" : input.locationType === "service_area" ? "moderate" : "unknown",
    public_hours: unique(input.openingHours || []),
    current_conversion_action: journey.likelyConversionAction,
    missing_customer_information: missing,
    facts_requiring_verification: serviceQuestions,
    inference_notes: [
      "Customer intent and interaction model are category-based hypotheses, not claims about this owner.",
      ...(repeatBehavior ? [repeatBehavior] : []),
    ],
  }
}

export function buildSignalResearchMissions(input: SignalCopilotInput, profile = buildSignalBusinessProfile(input)): SignalResearchMission[] {
  const providerLimited = (input.providerIssues || []).some((issue) => issue.status !== "recovered")
  const officialSite = websiteIsConfirmed(input)
  const sources = unique(input.sourceClassifications || [])
  return [
    {
      key: "official_website",
      title: "Confirm the official website",
      status: officialSite ? "complete" : providerLimited ? "limited" : "in_progress",
      sources_checked: sources,
      conclusion: officialSite ? `${input.websiteUrl} is accepted as the official website.` : "No official website has been verified. Third-party profiles are not treated as the official site.",
      confidence: officialSite ? "high" : "medium",
      failure_reason: providerLimited ? "One or more discovery providers were unavailable; available listing and public-source evidence was still evaluated." : null,
      luke_intervention_required: false,
      next_automatic_step: officialSite ? null : "Search the exact name with address and phone, then compare candidate domains and reciprocal links.",
    },
    {
      key: "social_presence",
      title: "Confirm official social profiles",
      status: input.socialUrls?.length ? "complete" : "in_progress",
      sources_checked: sources.filter((source) => /social|directory|search|official/i.test(source)),
      conclusion: input.socialUrls?.length ? `${input.socialUrls.length} profile${input.socialUrls.length === 1 ? "" : "s"} matched the active business identity.` : "No social profile has enough matching identity signals to use as official.",
      confidence: input.socialUrls?.length ? "medium" : "low",
      failure_reason: input.rejectedSources?.length ? `${input.rejectedSources.length} unrelated or intermediary source${input.rejectedSources.length === 1 ? " was" : "s were"} rejected.` : null,
      luke_intervention_required: false,
      next_automatic_step: input.socialUrls?.length ? null : "Compare name, phone, address, location, and branding before accepting a profile.",
    },
    {
      key: "category_services",
      title: "Understand category and services",
      status: input.category && profile.known_services.length ? "complete" : "in_progress",
      sources_checked: sources,
      conclusion: input.category ? `The primary category is ${input.category}. ${profile.known_services.length ? `Verified services: ${profile.known_services.join(", ")}.` : "Specific services remain unverified."}` : "The business category is not yet supported strongly enough.",
      confidence: input.category ? "medium" : "low",
      failure_reason: null,
      luke_intervention_required: false,
      next_automatic_step: profile.facts_requiring_verification[0] || null,
    },
    {
      key: "contact_path",
      title: "Confirm the best contact path",
      status: input.phone || input.websiteUrl || input.socialUrls?.length ? "complete" : "needs_luke",
      sources_checked: sources,
      conclusion: input.phone ? `The public phone ${input.phone} supports a verification-first call.` : input.websiteUrl ? "The accepted website provides the current public contact route." : "No reliable public contact route is available.",
      confidence: input.phone ? "high" : input.websiteUrl ? "medium" : "low",
      failure_reason: input.phone || input.websiteUrl ? null : "No verified phone, website contact form, email, or official social route was found.",
      luke_intervention_required: !input.phone && !input.websiteUrl && !input.socialUrls?.length,
      next_automatic_step: input.phone || input.websiteUrl ? null : "Recheck structured listings and official public sources for a contact route.",
    },
  ]
}

export function buildSignalUncertaintyBudget(input: SignalCopilotInput, profile = buildSignalBusinessProfile(input)): SignalUncertainty[] {
  const checked = unique(input.sourceClassifications || [])
  if (!isIdentityReady(input)) {
    return [{
      key: "business_identity",
      question: `Which exact ${input.businessName} did the submitted input mean?`,
      classification: "blocking",
      why_it_matters: "Sales claims, concepts, and contact actions cannot safely target a mixed or wrong business.",
      what_signal_checked: checked,
      automatic_action: "Compare candidate name, address, phone, place ID, domain, and social signals.",
      manual_action: "Choose the correct candidate or add an exact Maps URL, phone, or official website.",
      resolution_options: ["Confirmed candidate", "None of these", "Add stronger identifier"],
      dependent_artifacts: Object.keys(ARTIFACT_DEPENDENCIES) as SignalArtifactKind[],
    }]
  }

  const uncertainties: SignalUncertainty[] = []
  if (websiteIsUnresolved(input)) {
    uncertainties.push({
      key: "official_website",
      question: "Which website or page should customers currently use for services and hours?",
      classification: "strategy_limiting",
      why_it_matters: "Signal can prepare verification outreach, but it should not claim the business has no website or recommend replacing an unknown current site.",
      what_signal_checked: checked,
      automatic_action: "Search the exact name, full address, and phone; compare candidate domains and reciprocal links.",
      manual_action: "Ask the business during the verification call.",
      resolution_options: ["Verified official website", "Likely official website", "No official website found", "Unknown", "Candidate unrelated"],
      dependent_artifacts: ["opportunity", "offer", "concept", "sales_strategy", "scripts", "next_action"],
    })
  }
  profile.facts_requiring_verification.slice(0, 3).forEach((question, index) => {
    uncertainties.push({
      key: `service_${index + 1}`,
      question,
      classification: "strategy_limiting",
      why_it_matters: "The initial offer and concept must not include a service the business has not confirmed.",
      what_signal_checked: checked,
      automatic_action: "Inspect accepted official content and trusted structured category data.",
      manual_action: "Ask this exact question during verification or discovery.",
      resolution_options: ["Verified offered", "Verified not offered", "Still unknown"],
      dependent_artifacts: ["business_profile", "opportunity", "offer", "concept", "scripts"],
    })
  })
  uncertainties.push({
    key: "owner_name",
    question: "Who makes website or customer-information decisions?",
    classification: "non_blocking",
    why_it_matters: "A name can improve routing, but it is not needed for a neutral first contact.",
    what_signal_checked: checked,
    automatic_action: "Check accepted first-party team or contact information only.",
    manual_action: "Ask who handles the website or customer inquiries.",
    resolution_options: ["Decision-maker known", "Employee can route", "Unknown"],
    dependent_artifacts: ["preferred_channel", "scripts"],
  })
  return uncertainties
}

export function resolveSignalAssistanceMode(input: SignalCopilotInput, uncertainties = buildSignalUncertaintyBudget(input)): SignalAssistanceMode {
  if (!isIdentityReady(input) || uncertainties.some((item) => item.classification === "blocking")) return "identity_resolution"
  if (ACTIVE_DEAL_STAGES.has(input.pipelineStage || "") || ["contacted", "awaiting_reply", "interested", "proposal_sent"].includes(input.outreachStatus || "")) return "active_deal_support"
  if (input.strongExistingSite) return "opportunity_outreach"
  if (websiteIsUnresolved(input) || (input.opportunityEvidenceCount || 0) < 2 || (input.opportunityScore ?? 0) < 55) return "verification_outreach"
  return "opportunity_outreach"
}

function smallestOffer(input: SignalCopilotInput, profile: SignalBusinessProfile) {
  switch (profile.playbook) {
    case "dry_cleaner_laundry":
      return "A one-page mobile website with verified services, hours, directions, phone contact, and information about alterations or pickup/delivery only if the business confirms those services."
    case "pet_grooming":
      return "A focused mobile site with verified grooming services, new-client information, the existing booking or contact route, and approved before-and-after photos."
    case "bakery_donut":
      return "A mobile hours-and-location site with verified menu highlights, directions, current photos, and a custom-order route only if the business confirms it."
    case "spa_wellness":
    case "beauty_wellness":
      return "A focused service-and-booking site using verified treatments, practitioner information, policies, and the existing booking route."
    case "auto_detailing":
      return "A focused quote site with verified packages, service area, a clear request form, and approved work photos."
    case "roofing_contractors_home_services":
    case "hvac":
      return "A trust-first service-area site with verified specialties, project proof, and a quote or service-request form that collects only the information the team needs."
    default:
      return "A one-page mobile website with verified services, location or service area, hours when relevant, and one clear contact action."
  }
}

export function buildSignalOpportunityBrief(input: SignalCopilotInput, profile = buildSignalBusinessProfile(input), uncertainties = buildSignalUncertaintyBudget(input)): SignalOpportunityBrief {
  const facts = unique([
    input.address ? `${input.businessName} has a confirmed public location at ${input.address}` : `${input.businessName} has a confirmed business identity`,
    input.phone ? `a matching public phone (${input.phone})` : null,
    profile.reputation_signals[0],
    websiteIsConfirmed(input) ? `an accepted official website (${input.websiteUrl})` : "no official website verified by Signal",
  ])
  const verification = uncertainties.filter((item) => item.classification !== "non_blocking").map((item) => item.question)
  const solution = smallestOffer(input, profile)
  const currentSituation = `${facts.join(", ")}.`
  const friction = input.strongExistingSite
    ? "The current website appears strong. Signal has not found a clear replacement opportunity, so outreach should not lead with a redesign."
    : websiteIsUnresolved(input)
      ? "Customers may need to rely on third-party listings or phone calls for services, hours, and directions. This is a hypothesis until the current customer-information source is confirmed."
      : "The accepted public presence has a specific clarity or conversion gap supported by the latest analysis."
  return {
    current_situation: currentSituation,
    friction,
    recommended_solution: input.strongExistingSite ? "Do not manufacture a website project. Hold unless discovery reveals a separate, supported workflow problem." : solution,
    customer_benefit: input.strongExistingSite ? "No unsupported benefit is claimed." : "Customers get one reliable place to confirm the information they need and take the next step.",
    business_benefit: input.strongExistingSite ? "No business benefit has been established." : "Inference: clearer public information may reduce repeated basic questions and make the current contact path easier to use.",
    verification_required: verification,
    smallest_sensible_offer: input.strongExistingSite ? "No offer until a specific unmet need is verified." : solution,
    exclusions: ["Unverified services, prices, reviews, hours, owner story, policies, credentials, booking, payment methods, awards, and outcome promises"],
  }
}

function bestAction(input: SignalCopilotInput, mode: SignalAssistanceMode, profile: SignalBusinessProfile): SignalNextActionPlan {
  const phone = input.phone || "the verified public number"
  const lastOutreachSummary = input.lastOutreachSummary?.trim().replace(/[.!?]+$/, "")
  if (input.explicitDecline || input.doNotContact || input.pipelineStage === "lost") {
    return { action_type: "close", exact_instruction: `Close ${input.businessName} and remove active follow-ups.`, reason: "The business declined or the lead is closed.", due_at: null, required_preparation: ["Record the decline or loss reason"], completion_criteria: "No active outreach or follow-up remains.", fallback_action: "Reopen only if the business initiates a new conversation." }
  }
  if (mode === "identity_resolution") {
    return { action_type: "confirm_identity", exact_instruction: `Compare the candidate records for ${input.businessName}; confirm the one whose name, address, phone, and place ID agree.`, reason: "The active workspace cannot safely target more than one real business.", due_at: input.nextActionDueAt || null, required_preparation: ["Submitted input", "Candidate addresses", "Candidate phones", "Candidate source classifications"], completion_criteria: "One candidate is confirmed or every candidate is rejected.", fallback_action: "Add an exact Maps URL, official phone, or official website." }
  }
  if (input.strongExistingSite && mode !== "active_deal_support") {
    return { action_type: "hold", exact_instruction: `Hold ${input.businessName}. Do not prepare outreach unless research or a real conversation reveals a specific unmet customer-information or workflow need.`, reason: "The current website appears strong and Signal has no honest replacement angle.", due_at: null, required_preparation: ["Keep the accepted website evidence", "Record any future owner-stated need"], completion_criteria: "The lead remains outside active outreach until a separate supported need appears.", fallback_action: "If new evidence appears, research only that need and regenerate the recommendation before contact." }
  }
  if (mode === "verification_outreach") {
    const secondQuestion = profile.facts_requiring_verification[0] || "Which information do customers most often call about?"
    return { action_type: "call", exact_instruction: `Call ${input.businessName} at ${phone} and ask which website or page customers currently use for services and hours. Then ask: ${secondQuestion}`, reason: "Identity and contact are ready; one material fact limits the offer, but it does not block a useful verification call.", due_at: input.nextActionDueAt || null, required_preparation: ["Open the verification call", "Have the business profile and unresolved questions visible", "Be ready to record the exact answer"], completion_criteria: "Record the current customer-information source and the answer to one category-specific question.", fallback_action: "If the owner is unavailable, ask the employee who manages website or customer information and when to call back." }
  }
  if (mode === "opportunity_outreach") {
    return { action_type: input.phone ? "call" : "walk_in", exact_instruction: input.phone ? `Call ${input.businessName} at ${phone}, lead with the verified opportunity, and ask permission to show the focused concept.` : `Walk in with the concept open and ask who handles the website or customer information.`, reason: "Signal has enough identity, opportunity, and contact evidence for a business-specific first move.", due_at: input.nextActionDueAt || null, required_preparation: ["Open the concept", "Review the three discovery questions", "Know the smallest sensible offer and exclusions"], completion_criteria: "Earn permission to show or send the concept and agree on one next commitment.", fallback_action: "Leave a concise contact method and ask for a specific follow-up time." }
  }
  if (input.pipelineStage === "proposal") {
    return { action_type: "prepare_proposal", exact_instruction: `Review the last conversation with ${input.businessName}, confirm the remaining decision point, and send the scoped proposal only if the assumptions are current.`, reason: "The lead is already at proposal stage.", due_at: input.nextActionDueAt || null, required_preparation: ["Latest notes", "Confirmed scope", "Price and exclusions", "Decision-maker and due date"], completion_criteria: "The proposal is sent with a scheduled decision follow-up.", fallback_action: "Ask which issue—value, price, timing, scope, or another decision-maker—still needs resolution." }
  }
  return { action_type: "follow_up", exact_instruction: `Follow up with ${input.businessName} using the recorded outcome${lastOutreachSummary ? `: ${lastOutreachSummary}` : ""}. Ask for the next commitment already discussed; do not restart the cold pitch.`, reason: "The lead has prior contact, so the next move should continue the real conversation.", due_at: input.nextActionDueAt || null, required_preparation: ["Latest outreach outcome", "Promised follow-up", "Concept or scope if requested"], completion_criteria: "Record a reply, a scheduled next step, or a clear close.", fallback_action: "Send one concise close-the-loop message, then stop if there is no response." }
}

function preparedAsset(mode: SignalAssistanceMode, input: SignalCopilotInput) {
  if (mode === "identity_resolution") return "Identity comparison ready"
  if (input.strongExistingSite && mode !== "active_deal_support") return "Hold note ready"
  if (mode === "verification_outreach") return "Verification call ready"
  if (mode === "opportunity_outreach") return input.phone ? "Concept and call plan ready" : "Walk-in plan ready"
  if (input.pipelineStage === "proposal") return "Proposal follow-up ready"
  return "Follow-up ready"
}

export function buildSignalExecutiveRecommendation(input: SignalCopilotInput, mode: SignalAssistanceMode, opportunity: SignalOpportunityBrief, action: SignalNextActionPlan): SignalExecutiveRecommendation {
  let decision: SignalRecommendationDecision
  if (input.explicitDecline || input.doNotContact || input.pipelineStage === "lost") decision = "Skip"
  else if (!isIdentityReady(input)) decision = input.identityState === "contradictory" || input.identityState === "rejected" ? "Wrong match" : "Research further"
  else if (mode === "active_deal_support") decision = "Pursue now"
  else if (input.strongExistingSite) decision = "Hold"
  else if (mode === "verification_outreach") decision = "Verify one detail, then pursue"
  else decision = "Pursue now"

  const why = unique([
    isIdentityReady(input) ? `${input.businessName} is tied to the active identity${input.address ? ` at ${input.address}` : ""}.` : "The submitted identity is not yet tied to one exact business.",
    input.phone ? `A matching public phone supports direct verification: ${input.phone}.` : "No verified phone is available.",
    input.rejectedSources?.length ? `${input.rejectedSources.length} unrelated or intermediary source${input.rejectedSources.length === 1 ? " was" : "s were"} rejected.` : null,
    input.strongExistingSite ? "The current website appears strong, so Signal found no honest replacement angle." : opportunity.friction,
  ], 4)
  return {
    decision,
    why,
    best_angle: input.strongExistingSite ? "Do not lead with a website replacement; hold for a separately verified need." : opportunity.smallest_sensible_offer,
    best_next_move: action.exact_instruction,
    prepared_asset: preparedAsset(mode, input),
    avoid_saying: [
      "Do not say the business has no website until that is confirmed.",
      "Do not claim the business needs more customers or that a site will increase revenue.",
      "Do not mention unverified services, owner identity, booking behavior, pricing, credentials, or payment methods.",
    ],
  }
}

function action(enabled: boolean, reason: string | null = null) {
  return { enabled, reason: enabled ? null : reason }
}

export function getSignalCopilotActionAvailability(input: SignalCopilotInput, mode: SignalAssistanceMode): SignalActionAvailability {
  const identity = isIdentityReady(input)
  const contacted = mode === "active_deal_support"
  const supportedOpportunity = mode === "opportunity_outreach" || contacted
  const verification = mode === "verification_outreach"
  const closed = Boolean(input.explicitDecline || input.doNotContact || input.pipelineStage === "lost")
  const hold = Boolean(input.strongExistingSite && !contacted)
  const contact = Boolean(input.phone || input.email || input.contactFormUrl || input.websiteUrl || input.socialUrls?.length)
  const reasonIdentity = "Confirm the exact business first."
  const reasonClosed = "This lead is closed or marked do not contact."
  return {
    confirm_identity: action(!identity, identity ? "Identity is already confirmed." : null),
    verification_call: action(verification && identity && Boolean(input.phone) && !closed && !hold, closed ? reasonClosed : hold ? "Hold this lead; there is no supported verification or pitch angle." : !verification ? "The current mode does not need a verification-first call." : input.phone ? null : "No verified phone is available."),
    neutral_walk_in: action(verification && identity && input.locationType === "storefront" && !closed && !hold, closed ? reasonClosed : hold ? "Hold this lead; there is no supported walk-in angle." : !verification ? "The current mode does not need a neutral verification walk-in." : "A verified storefront is required."),
    research: action(!closed, reasonClosed),
    concept: action(identity && !closed && !input.strongExistingSite && (verification || supportedOpportunity), closed ? reasonClosed : !identity ? reasonIdentity : input.strongExistingSite ? "No honest concept opportunity is supported." : "Confirm one customer-information detail first."),
    sales_pack: action(identity && !closed && !hold && (verification || supportedOpportunity), closed ? reasonClosed : hold ? "Signal found no honest outreach angle for the strong current site." : reasonIdentity),
    focus: action(identity && !closed && !hold && (verification || supportedOpportunity), closed ? reasonClosed : hold ? "Hold this lead until a separate need is verified." : reasonIdentity),
    practice: action(identity && !closed && !hold && (verification || supportedOpportunity), closed ? reasonClosed : hold ? "No active outreach should be rehearsed for a held lead." : reasonIdentity),
    teleprompter: action(identity && !closed && !hold && (verification || supportedOpportunity), closed ? reasonClosed : hold ? "No active outreach should be rehearsed for a held lead." : reasonIdentity),
    call: action(identity && Boolean(input.phone) && !closed && !hold, closed ? reasonClosed : hold ? "Hold this lead; no supported call angle is ready." : !identity ? reasonIdentity : "No verified phone is available."),
    text: action(identity && Boolean(input.phone) && !closed && !hold, closed ? reasonClosed : hold ? "Hold this lead; no supported text angle is ready." : !identity ? reasonIdentity : "No verified phone is available."),
    email: action(identity && Boolean(input.email) && !closed && !hold, closed ? reasonClosed : hold ? "Hold this lead; no supported email angle is ready." : "No verified email is available."),
    log_outreach: action(identity && contact && !closed && !hold, closed ? reasonClosed : hold ? "Hold this lead until a specific need is verified." : !identity ? reasonIdentity : "A contact route is required."),
    follow_up: action(contacted && !closed, closed ? reasonClosed : "Log first contact before preparing follow-up."),
    proposal: action(["interested", "proposal"].includes(input.pipelineStage || "") && !closed, closed ? reasonClosed : "Move the lead to Interested before preparing a proposal."),
    create_client_project: action(["interested", "proposal", "won"].includes(input.pipelineStage || "") && !closed, closed ? reasonClosed : "Create a client or project only after interest is recorded."),
  }
}

function scoreQuality(input: SignalCopilotInput, profile: SignalBusinessProfile, opportunity: SignalOpportunityBrief, actionPlan: SignalNextActionPlan): SignalAnalysisQuality {
  const identity = isIdentityReady(input) ? 95 : input.identityState === "likely_match" ? 55 : 25
  const sourceAgreement = input.rejectedSources?.length ? 90 : (input.verifiedFacts?.length || 0) > 2 ? 80 : 60
  const understanding = input.category ? (profile.known_services.length ? 90 : 72) : 35
  const opportunitySpecificity = input.strongExistingSite ? 90 : opportunity.smallest_sensible_offer.includes("one-page") || opportunity.smallest_sensible_offer.includes("focused") ? 88 : 70
  const actionability = actionPlan.exact_instruction.length > 40 && actionPlan.completion_criteria.length > 20 ? 92 : 60
  const claimSafety = opportunity.verification_required.length || input.strongExistingSite ? 94 : 82
  const staleSafety = input.artifactSafetyPassed === false ? 15 : 95
  const dimensions = {
    identity_correctness: identity,
    source_agreement: sourceAgreement,
    business_understanding: understanding,
    opportunity_specificity: opportunitySpecificity,
    actionability,
    sales_usefulness: input.phone || input.websiteUrl ? 88 : 58,
    stale_data_safety: staleSafety,
    claim_safety: claimSafety,
    category_relevance: input.category ? 90 : 45,
    natural_language: 92,
  }
  const score = Math.round(Object.values(dimensions).reduce((sum, value) => sum + value, 0) / Object.values(dimensions).length)
  const weaknesses = unique([
    identity < 70 ? "The exact business identity is not confirmed." : null,
    understanding < 70 ? "The business category or service model is not specific enough." : null,
    staleSafety < 70 ? "One or more active artifacts do not match the current identity version." : null,
    !input.phone && !input.websiteUrl ? "No reliable contact route is ready." : null,
    websiteIsUnresolved(input) ? "The official online presence is still unresolved; verification outreach is ready." : null,
  ])
  return { score, threshold: 76, passed: score >= 76 && identity >= 70 && staleSafety >= 70, dimensions, weaknesses }
}

export function buildSignalCopilotState(input: SignalCopilotInput): SignalCopilotState {
  const businessProfile = buildSignalBusinessProfile(input)
  const uncertaintyBudget = buildSignalUncertaintyBudget(input, businessProfile)
  const assistanceMode = resolveSignalAssistanceMode(input, uncertaintyBudget)
  const opportunity = buildSignalOpportunityBrief(input, businessProfile, uncertaintyBudget)
  const nextAction = bestAction(input, assistanceMode, businessProfile)
  const recommendation = buildSignalExecutiveRecommendation(input, assistanceMode, opportunity, nextAction)
  return {
    business_profile: businessProfile,
    research_missions: buildSignalResearchMissions(input, businessProfile),
    uncertainty_budget: uncertaintyBudget,
    assistance_mode: assistanceMode,
    recommendation,
    opportunity,
    next_action: nextAction,
    action_availability: getSignalCopilotActionAvailability(input, assistanceMode),
    analysis_quality: scoreQuality(input, businessProfile, opportunity, nextAction),
    provider_limitations: input.providerIssues || [],
  }
}

export function changedSignalIdentityFields(
  before: Partial<Record<SignalIdentityField, unknown>>,
  after: Partial<Record<SignalIdentityField, unknown>>,
) {
  return SIGNAL_IDENTITY_FIELDS.filter(
    (field) => JSON.stringify(before[field] ?? null) !== JSON.stringify(after[field] ?? null),
  )
}

export function affectedSignalArtifacts(changedFields: SignalIdentityField[]) {
  return (Object.entries(ARTIFACT_DEPENDENCIES) as Array<[SignalArtifactKind, SignalIdentityField[]]>)
    .filter(([, dependencies]) => dependencies.some((field) => changedFields.includes(field)))
    .map(([artifact]) => artifact)
}

export function staleReasonForSignalArtifacts(changedFields: SignalIdentityField[]) {
  return `Outdated — generated before ${changedFields.map((field) => field.replace(/_/g, " ")).join(", ")} ${changedFields.length === 1 ? "was" : "were"} corrected.`
}

export function validateSignalArtifactCurrent(input: {
  artifactIdentityVersion?: number | null
  activeIdentityVersion: number
  artifactEvidenceVersion?: number | null
  activeEvidenceVersion: number
  artifactSnapshot?: Record<string, unknown> | null
  activeIdentity: Partial<Record<SignalIdentityField, unknown>>
  staleAt?: string | null
}) {
  if (input.staleAt) return { current: false, reason: "The artifact is already marked outdated." }
  if ((input.artifactIdentityVersion ?? 0) !== input.activeIdentityVersion) return { current: false, reason: "The artifact predates the active identity version." }
  if ((input.artifactEvidenceVersion ?? 0) !== input.activeEvidenceVersion) return { current: false, reason: "The artifact predates the active evidence version." }
  const snapshot = input.artifactSnapshot || {}
  const conflicts = (Object.keys(input.activeIdentity) as SignalIdentityField[]).filter((field) => {
    if (!(field in snapshot)) return false
    return JSON.stringify(snapshot[field] ?? null) !== JSON.stringify(input.activeIdentity[field] ?? null)
  })
  if (conflicts.length) return { current: false, reason: `The artifact conflicts with the active ${conflicts.map((field) => field.replace(/_/g, " ")).join(", ")}.` }
  return { current: true, reason: null }
}

export function signalIdentitySnapshot(input: SignalCopilotInput) {
  return {
    canonical_name: input.businessName,
    public_address: input.address || null,
    public_phone: input.phone || null,
    industry: input.category || null,
    website_url: input.websiteUrl || null,
    instagram_url: input.socialUrls?.find((url) => url.includes("instagram.com")) || null,
    facebook_url: input.socialUrls?.find((url) => url.includes("facebook.com")) || null,
    provider_place_id: input.providerPlaceId || null,
    chain_status: input.chainStatus || null,
  }
}
