import type {
  SignalAssistanceMode,
  SignalBusinessProfile,
  SignalCopilotInput,
  SignalCopilotState,
} from "./copilot.ts"

export type SignalDealDiagnosis = {
  verified_facts: string[]
  important_unknowns: string[]
  strongest_positive_signal: string
  strongest_opportunity: string
  safest_opportunity_hypothesis: string
  likely_customer_journey: string
  likely_owner_concern: string
  reason_to_pursue_or_skip: string
  current_sales_stage: string
  required_next_commitment: string
}

export type SignalDealStrategy = {
  conversation_objective: string
  best_channel: string
  opening_angle: string
  business_specific_compliment: string
  curiosity_hook: string
  discovery_priorities: string[]
  likely_objections: string[]
  objection_isolation_questions: string[]
  smallest_sensible_offer: string
  price_framing: string
  desired_next_step: string
  graceful_exit: string
}

export type SignalSalesObjection = {
  objection: string
  acknowledge: string
  clarify: string
  reframe: string
  next_step: string
  response: string
}

export type SignalPreparedOffer = {
  initial_scope: string
  excluded: string[]
  suggested_price_range: string
  recurring_care_option: string
  why_this_scope_fits: string
}

export type SignalThinksAhead = {
  before_contact: string[]
  during_contact: string[]
  after_contact: string[]
}

export type SignalSalesPackReview = {
  passed: boolean
  quality_score: number
  issues: string[]
  attempts: number
  fallback_used: boolean
}

export type SignalSalesCopilotPack = {
  ten_second_summary: string
  objective: string
  best_first_move: string
  opening: string
  employee_answer: string
  owner_busy: string
  discovery_questions: string[]
  value_bridge: string
  concept_reveal: string
  recommended_offer: SignalPreparedOffer
  price_transition: string
  objections: SignalSalesObjection[]
  follow_up_text: string
  follow_up_email: string
  graceful_exit: string
  next_commitment: string
  branches: Record<"already_has_website" | "facebook_primary" | "already_busy" | "send_it", string>
  thinks_ahead: SignalThinksAhead
  diagnosis: SignalDealDiagnosis
  strategy: SignalDealStrategy
  review: SignalSalesPackReview
}

function unique(values: Array<string | null | undefined>, limit = 12) {
  return Array.from(new Set(values.map((value) => value?.replace(/\s+/g, " ").trim()).filter((value): value is string => Boolean(value)))).slice(0, limit)
}

function locationPhrase(input: SignalCopilotInput) {
  if (input.city) return ` here in ${input.city}`
  return ""
}

function modeObjective(mode: SignalAssistanceMode, business: string) {
  if (mode === "identity_resolution") return `Confirm which exact ${business} the submitted input refers to.`
  if (mode === "verification_outreach") return `Confirm the current customer-information source and one category-specific fact for ${business}.`
  if (mode === "opportunity_outreach") return `Earn permission to show the focused concept and schedule one clear next step with ${business}.`
  return `Continue the real ${business} conversation and secure the next commitment already discussed.`
}

function buildDiagnosis(input: SignalCopilotInput, state: SignalCopilotState): SignalDealDiagnosis {
  const facts = unique([
    input.address ? `${input.businessName} is tied to ${input.address}` : null,
    input.phone ? `Public phone: ${input.phone}` : null,
    input.category ? `Category: ${input.category}` : null,
    ...(input.verifiedFacts || []),
  ])
  const unknowns = state.uncertainty_budget
    .filter((item) => item.classification !== "non_blocking")
    .map((item) => item.question)
  return {
    verified_facts: facts,
    important_unknowns: unknowns,
    strongest_positive_signal: state.business_profile.reputation_signals[0] || state.business_profile.trust_signals[0] || "The business identity and public contact route agree.",
    strongest_opportunity: state.opportunity.smallest_sensible_offer,
    safest_opportunity_hypothesis: state.opportunity.friction,
    likely_customer_journey: state.business_profile.public_customer_journey,
    likely_owner_concern: state.assistance_mode === "verification_outreach" ? "Avoid spending time on a solution before confirming what customers use today." : "Keep the first scope small, relevant, and easy to maintain.",
    reason_to_pursue_or_skip: `${state.recommendation.decision}: ${state.recommendation.why.join(" ")}`,
    current_sales_stage: input.pipelineStage || "analyzed",
    required_next_commitment: state.next_action.completion_criteria,
  }
}

function discoveryQuestions(profile: SignalBusinessProfile, mode: SignalAssistanceMode) {
  const serviceQuestion = profile.facts_requiring_verification[0]
  const questions = mode === "verification_outreach"
    ? unique([
      "Which website or page should customers currently use for services and hours?",
      serviceQuestion,
      "Which information do customers most often need to call about?",
    ], 3)
    : unique([
      "What information do new customers ask for most often?",
      serviceQuestion,
      `Is the current ${profile.dominant_contact_route.toLowerCase()} working the way the team wants?`,
    ], 3)
  const fallbacks = [
    "What should a first-time customer know before contacting the business?",
    "Which part of the current customer process creates the most repeated questions?",
    "What would make the smallest useful first version feel complete?",
  ]
  for (const fallback of fallbacks) {
    if (questions.length >= 3) break
    if (!questions.includes(fallback)) questions.push(fallback)
  }
  return questions.slice(0, 3)
}

function buildStrategy(input: SignalCopilotInput, state: SignalCopilotState, diagnosis: SignalDealDiagnosis): SignalDealStrategy {
  const questions = discoveryQuestions(state.business_profile, state.assistance_mode)
  const verification = state.assistance_mode === "verification_outreach"
  return {
    conversation_objective: modeObjective(state.assistance_mode, input.businessName),
    best_channel: input.phone ? "Call" : input.locationType === "storefront" ? "Walk in" : "Research the contact route",
    opening_angle: verification ? "Verify the current customer-information source before suggesting a solution." : state.opportunity.friction,
    business_specific_compliment: diagnosis.strongest_positive_signal,
    curiosity_hook: verification ? "Signal found reliable identity and contact details, but no official customer-information page it can safely name." : "A focused concept is ready around the specific public customer path Signal reviewed.",
    discovery_priorities: questions,
    likely_objections: ["We already have a website", "Facebook is enough", "We are already busy", "Just send it"],
    objection_isolation_questions: ["Is the concern mainly value, price, timing, scope, or another decision-maker?"],
    smallest_sensible_offer: state.opportunity.smallest_sensible_offer,
    price_framing: verification ? "Do not discuss price until the current setup and smallest useful scope are confirmed." : "Frame a small fixed scope first; explain exclusions before naming a range.",
    desired_next_step: state.next_action.completion_criteria,
    graceful_exit: "Thanks for the clarity. Mountline will leave it there and will not keep following up.",
  }
}

function verificationOpening(input: SignalCopilotInput) {
  return `Hi, Luke with Mountline Studio${locationPhrase(input)}. Mountline was looking at ${input.businessName}${input.address ? ` at ${input.address}` : ""} and wanted to make sure the information was correct. Do you currently have an official website customers should use for services and hours?`
}

function opportunityOpening(input: SignalCopilotInput, state: SignalCopilotState) {
  return `Hi, Luke with Mountline Studio${locationPhrase(input)}. Mountline reviewed ${input.businessName}'s public customer information and prepared one focused idea around ${state.opportunity.smallest_sensible_offer.toLowerCase()} Would a quick look be useful?`
}

function activeDealOpening(input: SignalCopilotInput, state: SignalCopilotState) {
  return `Hi, Luke with Mountline following up on the ${input.businessName} conversation. ${input.lastOutreachSummary ? `The last note was: ${input.lastOutreachSummary}. ` : ""}Would it be useful to settle the next step Signal prepared: ${state.next_action.completion_criteria.toLowerCase()}?`
}

function spokenOpening(input: SignalCopilotInput, state: SignalCopilotState) {
  if (state.assistance_mode === "identity_resolution") return `Hi, Luke with Mountline Studio. Mountline is confirming the correct listing for ${input.businessName}. Could you confirm the business address and best public phone?`
  if (state.assistance_mode === "verification_outreach") return verificationOpening(input)
  if (state.assistance_mode === "opportunity_outreach") return opportunityOpening(input, state)
  return activeDealOpening(input, state)
}

function suggestedPrice(profile: SignalBusinessProfile, mode: SignalAssistanceMode) {
  if (mode === "verification_outreach" || mode === "identity_resolution") return "Price after verification; do not quote an unconfirmed scope."
  if (["roofing_contractors_home_services", "hvac", "auto_detailing"].includes(profile.playbook)) return "$1,500–$3,500 after scope and content are confirmed."
  return "$900–$2,200 after scope and content are confirmed."
}

function objection(objectionText: string, acknowledge: string, clarify: string, reframe: string, nextStep: string): SignalSalesObjection {
  return {
    objection: objectionText,
    acknowledge,
    clarify,
    reframe,
    next_step: nextStep,
    response: `${acknowledge} ${clarify} ${reframe} ${nextStep}`,
  }
}

function makeObjections(input: SignalCopilotInput) {
  return [
    objection("We already have a website", "That makes sense.", "Are you happy with how it handles services and customer questions, or is there anything you wish were easier?", "Mountline would not replace something that is working.", "If one gap is real, Mountline can outline only that change."),
    objection("Facebook is enough", "That can work well for updates and conversation.", "Do customers still call for basic information such as services, hours, or directions?", "Mountline would keep Facebook and use a small site only as one reliable home for repeated information.", "If that is useful, Mountline can show the one-page version."),
    objection("We are already busy", "That is a good position to protect.", "Are repeated customer questions or unclear information still taking time?", "The idea would not be framed as getting more customers; it would be about making the current customer process easier.", "If there is no operational benefit, Mountline should leave it alone."),
    objection("Just send it", "Absolutely.", "What is the best number or email, and what should the concept answer first?", "Mountline will send only the focused ${business} concept and the assumptions behind it.".replace("${business}", input.businessName), "Would a brief check-back on a specific day be alright?"),
  ]
}

function buildScripts(input: SignalCopilotInput, state: SignalCopilotState, diagnosis: SignalDealDiagnosis, strategy: SignalDealStrategy): Omit<SignalSalesCopilotPack, "review"> {
  const questions = discoveryQuestions(state.business_profile, state.assistance_mode)
  const opening = spokenOpening(input, state)
  const verification = state.assistance_mode === "verification_outreach"
  const offer: SignalPreparedOffer = {
    initial_scope: state.opportunity.smallest_sensible_offer,
    excluded: state.opportunity.exclusions,
    suggested_price_range: suggestedPrice(state.business_profile, state.assistance_mode),
    recurring_care_option: verification ? "Discuss only after the initial scope is confirmed." : "$75–$200/month for agreed content updates, monitoring, and small changes when those needs are real.",
    why_this_scope_fits: verification ? "It keeps the first contact useful without pretending the current website or service list is known." : "It addresses the supported public customer path without turning the first project into a broad redesign or systems engagement.",
  }
  const followUpText = verification
    ? `Thanks for confirming the current customer-information setup for ${input.businessName}. Mountline recorded the answer and will send only the focused next step discussed. Would ${input.nextActionDueAt ? "the scheduled follow-up" : "a brief check-back later this week"} work?`
    : `Thanks for taking a look at the ${input.businessName} concept. Mountline can revise it around the verified services and customer path discussed. Would a brief review on a specific day be useful?`
  const followUpEmail = [
    `Subject: ${input.businessName} — focused next step`,
    "",
    `Hi, Luke with Mountline Studio${locationPhrase(input)}.`,
    "",
    verification
      ? `Thanks for confirming what customers currently use for ${input.businessName} information. Mountline will keep the idea limited to the facts discussed.`
      : `Thanks for reviewing the focused ${input.businessName} idea. Mountline kept the scope tied to the verified customer path and excluded anything not confirmed.`,
    "",
    `Proposed next step: ${state.next_action.completion_criteria}`,
    "",
    "If that is not useful, no problem—Mountline will close the loop.",
    "",
    "Luke",
    "Mountline Studio",
  ].join("\n")
  return {
    ten_second_summary: `${state.recommendation.decision}: ${input.businessName} — ${state.next_action.exact_instruction}`,
    objective: strategy.conversation_objective,
    best_first_move: strategy.best_channel,
    opening,
    employee_answer: `Thanks. Who usually handles ${input.businessName}'s website or customer information, and when is the least disruptive time to reach them?`,
    owner_busy: "No problem. What is the best contact for one short note, and when would a brief follow-up be reasonable?",
    discovery_questions: questions,
    value_bridge: verification
      ? "That helps. Based on the current setup, Mountline would keep the first version small and focused only on the information customers repeatedly need."
      : `That makes sense. Mountline would connect that answer to ${state.opportunity.smallest_sensible_offer.toLowerCase()} and leave everything else out.`,
    concept_reveal: `Mountline kept the concept focused on ${state.business_profile.likely_customer_intent.toLowerCase()}. It is a preview, not the current official website. What feels useful, and what is wrong or missing?`,
    recommended_offer: offer,
    price_transition: verification
      ? "Before discussing price, Mountline should confirm the current setup and the smallest useful scope."
      : `If that scope is the right one, Mountline would usually place it in the ${offer.suggested_price_range.replace(" after scope and content are confirmed.", "")} range. The written outline would state exactly what is included and excluded.`,
    objections: makeObjections(input),
    follow_up_text: followUpText,
    follow_up_email: followUpEmail,
    graceful_exit: strategy.graceful_exit,
    next_commitment: strategy.desired_next_step,
    branches: {
      already_has_website: "That makes sense. Are you happy with how it handles services and customer questions, or is there anything you wish were easier?",
      facebook_primary: "Mountline would not replace Facebook. A small website would only give customers one reliable place for the information they repeatedly need.",
      already_busy: "Then Mountline would not position this as getting more customers. It may be useful only if it makes current customer questions and contact easier.",
      send_it: `Absolutely. What is the best number or email for the ${input.businessName} concept, and would a brief check-back on a specific day be alright?`,
    },
    thinks_ahead: {
      before_contact: ["Open the recommendation and verification questions.", "Keep the public phone or directions ready.", "Set the desired outcome: one verified answer or one agreed next step.", "Avoid calling during a visibly busy service window when public hours make that risk clear."],
      during_contact: [questions[0] || "Ask which customer-information source is current.", "Listen for the current contact path and repeated customer questions.", "Do not overexplain the concept or price before the need is confirmed.", "Show the concept only after permission, then stop talking and invite correction."],
      after_contact: ["Record who answered, the exact answer, objection, and promised follow-up.", "Update the pipeline stage and due date.", "Regenerate only the opportunity, concept, scripts, and next action affected by new facts.", "Quote only after scope is confirmed; disqualify or close when the owner clearly declines."],
    },
    diagnosis,
    strategy,
  }
}

const ROBOTIC_PATTERNS = [/systems discovery/i, /recommended lane/i, /customer-path problem/i, /opportunity sufficiency/i, /confidence dimension/i, /calibrated as/i, /must verify before/i]
const UNSAFE_PATTERNS = [/guarantee/i, /increase revenue/i, /get more customers/i, /you have no website/i, /the owner is/i, /nontechnical/i]

export function reviewSignalSalesPack(pack: Omit<SignalSalesCopilotPack, "review">, input: SignalCopilotInput) {
  const issues: string[] = []
  const text = JSON.stringify(pack)
  const openingWords = pack.opening.trim().split(/\s+/).length
  if (openingWords > 80) issues.push("Opening exceeds 80 spoken words.")
  if (pack.discovery_questions.length !== 3) issues.push("Exactly three discovery questions are required.")
  if (!pack.objective || !pack.next_commitment) issues.push("Objective or next commitment is missing.")
  if (ROBOTIC_PATTERNS.some((pattern) => pattern.test(text))) issues.push("Robotic or internal product language is present.")
  if (UNSAFE_PATTERNS.some((pattern) => pattern.test(text))) issues.push("An unsupported or manipulative claim is present.")
  if (input.rejectedSources?.some((source) => source && text.toLowerCase().includes(source.toLowerCase()))) issues.push("A rejected source remains in the active sales pack.")
  if (!text.includes(input.businessName)) issues.push("The pack is not tied to the active business identity.")
  if (!pack.graceful_exit || !/leave|close|stop/i.test(pack.graceful_exit)) issues.push("The pack lacks a respectful exit.")
  const qualityScore = Math.max(0, 100 - issues.length * 18 - Math.max(0, openingWords - 80))
  return { passed: issues.length === 0 && qualityScore >= 82, quality_score: qualityScore, issues }
}

function safeFallback(input: SignalCopilotInput, state: SignalCopilotState, diagnosis: SignalDealDiagnosis, strategy: SignalDealStrategy) {
  const nextState = {
    ...state,
    assistance_mode: state.assistance_mode === "identity_resolution" ? "identity_resolution" as const : "verification_outreach" as const,
  }
  return buildScripts(input, nextState, diagnosis, strategy)
}

export function generateSignalSalesCopilotPack(input: SignalCopilotInput, state: SignalCopilotState): SignalSalesCopilotPack {
  // Pass 1: diagnosis. Pass 2: strategy. Pass 3: spoken/written assets.
  const diagnosis = buildDiagnosis(input, state)
  const strategy = buildStrategy(input, state, diagnosis)
  let pack = buildScripts(input, state, diagnosis, strategy)
  let reviewed = reviewSignalSalesPack(pack, input)
  let attempts = 1
  let fallbackUsed = false

  // Pass 4: red-team. A deterministic verification-first fallback replaces any
  // draft that still contains unsafe, generic, stale, or awkward material.
  if (!reviewed.passed) {
    attempts += 1
    fallbackUsed = true
    pack = safeFallback(input, state, diagnosis, strategy)
    reviewed = reviewSignalSalesPack(pack, input)
  }

  return {
    ...pack,
    review: {
      ...reviewed,
      attempts,
      fallback_used: fallbackUsed,
    },
  }
}
