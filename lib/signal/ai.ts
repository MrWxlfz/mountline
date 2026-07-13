import "server-only"

import { z } from "zod"
import type { SignalProspect } from "@/lib/supabase/types"
import { getSignalPlaybook, MEDICAL_COMPLIANCE_WARNING } from "./playbooks"
import { getSignalAiProviderMode } from "./providers"
import type { SignalWebsiteScan } from "./website"
import {
  signalDeepAnalysisSchema,
  signalInitialAnalysisSchema,
  type SignalDeepAnalysisOutput,
  type SignalInitialAnalysisOutput,
} from "./validation"

type SignalAiProvider = "gemini" | "openai" | "disabled"

type AiResult<T> = {
  output: T
  provider: Exclude<SignalAiProvider, "disabled">
  model: string
}

const signalImportMappingOutputSchema = z.object({
  business_name: z.string().optional().nullable(),
  contact_name: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  state: z.string().optional().nullable(),
  website_url: z.string().optional().nullable(),
  public_email: z.string().optional().nullable(),
  public_phone: z.string().optional().nullable(),
  instagram_url: z.string().optional().nullable(),
  human_notes: z.string().optional().nullable(),
  what_looks_good: z.string().optional().nullable(),
  visible_problem: z.string().optional().nullable(),
  relevant_demo: z.string().optional().nullable(),
  outreach_status: z.string().optional().nullable(),
  follow_up_date: z.string().optional().nullable(),
  existing_website_platform: z.string().optional().nullable(),
  existing_booking_platform: z.string().optional().nullable(),
  locality_relationship: z.string().optional().nullable(),
})

const signalClassificationOutputSchema = z.object({
  playbook: z.enum([
    "auto_detailing",
    "barber_salon",
    "hvac",
    "roofing_contractors_home_services",
    "medical_dental",
    "restaurant_food",
    "beauty_wellness",
    "general_local_business",
    "unknown_needs_review",
  ]),
  confidence: z.enum(["low", "medium", "high"]),
  evidence: z.array(z.string().trim().min(1).max(220)).min(1).max(6),
})

const signalLeadSalesPackSchema = z.object({
  lead_briefing: z.string().trim().min(1).max(1400),
  strongest_honest_angle: z.string().trim().min(1).max(500),
  fifteen_second_opener: z.string().trim().min(1).max(700),
  why_this_fits: z.string().trim().min(1).max(1200),
  what_stood_out: z.array(z.string().trim().min(1).max(320)).min(1).max(6),
  likely_pain_points: z.array(
    z.object({
      statement: z.string().trim().min(1).max(360),
      basis: z.enum(["evidence", "hypothesis"]),
    }),
  ).min(1).max(5),
  recommended_offer: z.string().trim().min(1).max(420),
  pricing_angle: z.string().trim().min(1).max(420),
  pitch_angle: z.string().trim().min(1).max(500),
  best_first_action: z.enum(["walk_in", "call", "text_email", "research_more"]),
  walk_in_script: z.string().trim().min(1).max(1800),
  call_script: z.string().trim().min(1).max(1800),
  discovery_questions: z.array(z.string().trim().min(1).max(420)).min(3).max(6),
  follow_up_message: z.string().trim().min(1).max(1800),
  follow_up_text: z.string().trim().min(1).max(900),
  follow_up_email: z.string().trim().min(1).max(1800),
  objection_handling: z.array(
    z.object({
      objection: z.string().trim().min(1).max(240),
      response: z.string().trim().min(1).max(900),
    }),
  ).min(5).max(6),
  what_to_avoid: z.array(z.string().trim().min(1).max(280)).min(1).max(6),
  risks_to_verify: z.array(z.string().trim().min(1).max(280)).max(6),
  next_action_checklist: z.array(z.string().trim().min(1).max(280)).min(3).max(8),
  lovable_prompt: z.string().trim().min(1).max(7000),
})

const signalLeadSalesStrategySchema = z.object({
  strongest_angle: z.string().trim().min(20).max(420),
  lead_value: z.string().trim().min(20).max(420),
  best_approach: z.enum(["walk_in", "call", "text_email", "research_more"]),
  recommended_offer: z.string().trim().min(20).max(420),
  likely_objections: z.array(z.string().trim().min(3).max(180)).min(4).max(4),
  tone: z.string().trim().min(10).max(220),
  facts_to_mention: z.array(z.string().trim().min(3).max(260)).min(2).max(5),
  facts_not_to_mention: z.array(z.string().trim().min(3).max(260)).min(2).max(6),
})

const signalLeadScriptsSchema = z.object({
  one_minute_briefing: z.string().trim().min(40).max(1200),
  best_angle: z.string().trim().min(15).max(420),
  walk_in_opener: z.string().trim().min(20).max(650),
  busy_response: z.string().trim().min(5).max(240),
  concept_transition: z.string().trim().min(5).max(300),
  discovery_questions: z.array(z.string().trim().min(8).max(260)).length(3),
  price_transition: z.string().trim().min(10).max(360),
  call_script: z.string().trim().min(20).max(950),
  follow_up_text: z.string().trim().min(10).max(500),
  objections: z.array(z.object({
    objection: z.string().trim().min(3).max(160),
    response: z.string().trim().min(12).max(520),
  })).length(4),
  do_not_say: z.array(z.string().trim().min(3).max(220)).min(3).max(6),
  next_steps: z.array(z.string().trim().min(3).max(220)).min(3).max(5),
})

const signalChainClassificationSchema = z.object({
  classification: z.enum(["independent", "likely_independent", "local_multi_location", "likely_franchise", "chain", "uncertain"]),
  probability: z.number().int().min(0).max(100),
  evidence: z.array(z.string().trim().min(1).max(300)).min(1).max(6),
  reason: z.string().trim().min(1).max(500),
  location_count_estimate: z.number().int().min(1).max(10000).nullable(),
})

const DEFAULT_OPENAI_FAST_MODEL = "gpt-4.1-mini"
const DEFAULT_OPENAI_DEEP_MODEL = "gpt-4.1"
const DEFAULT_GEMINI_FAST_MODEL = "gemini-2.0-flash"
const DEFAULT_GEMINI_DEEP_MODEL = "gemini-2.0-flash"

function getProvider(): SignalAiProvider {
  return getSignalAiProviderMode()
}

function cleanJsonText(text: string) {
  const trimmed = text.trim()
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed
  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i)?.[1]
  if (fenced) return fenced.trim()
  const match = trimmed.match(/\{[\s\S]*\}/)
  return match?.[0] || trimmed
}

function safeParseJson(text: string) {
  return JSON.parse(cleanJsonText(text)) as unknown
}

function compactScan(scan: SignalWebsiteScan | null) {
  if (!scan) return "No website scan has been run."

  return JSON.stringify(
    {
      scanned_at: scan.scanned_at,
      scanned_urls: scan.scanned_urls,
      broken_response: scan.broken_response,
      error: scan.error,
      page_title: scan.page_title,
      meta_description: scan.meta_description,
      headings: scan.headings.slice(0, 12),
      cta_words: scan.cta_words,
      service_language: scan.service_language,
      pricing_language: scan.pricing_language,
      hours_location_language: scan.hours_location_language,
      visible_emails: scan.visible_emails,
      visible_phones: scan.visible_phones,
      booking_links: scan.booking_links.slice(0, 8),
      social_links_found_on_official_site: scan.social_links?.slice(0, 8) || [],
      detected_website_platform: scan.detected_website_platform,
      detected_booking_platform: scan.detected_booking_platform,
      image_count: scan.image_count,
      evidence: scan.evidence.slice(0, 18),
    },
    null,
    2,
  )
}

function buildBaseContext(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  const playbook = getSignalPlaybook(prospect.industry_playbook)

  return [
    `Business: ${prospect.business_name}`,
    `Contact name: ${prospect.contact_name || "unknown"}`,
    `Industry: ${prospect.industry}`,
    `Playbook: ${playbook.name}`,
    `Compliance tier: ${prospect.compliance_tier}`,
    `Location: ${[prospect.city, prospect.state].filter(Boolean).join(", ") || "unknown"}`,
    `Relationship context entered by Mountline team: ${prospect.locality_relationship || "none"}`,
    `Website URL: ${prospect.website_url || "none"}`,
    `Public email entered: ${prospect.public_email || "none"}`,
    `Public phone entered: ${prospect.public_phone || "none"}`,
    `Public contact form URL entered: ${prospect.public_contact_form_url || "none"}`,
    `Existing website platform entered: ${prospect.existing_website_platform || "unknown"}`,
    `Existing booking platform entered: ${prospect.existing_booking_platform || "unknown"}`,
    `Relevant demo entered: ${prospect.relevant_demo || "none"}`,
    `Selected outreach mode: ${prospect.outreach_mode}`,
    `Human notes: ${prospect.human_notes || "none"}`,
    `What looks good: ${prospect.what_looks_good || "none"}`,
    `Visible problem: ${prospect.visible_problem || "none"}`,
    "",
    "Public website scan:",
    compactScan(scan),
  ].join("\n")
}

function safetyInstructions() {
  return [
    "Use only public website evidence and human-entered observations supplied here.",
    "Do not invent reviews, revenue, customer sentiment, conversion loss, owner wealth, demographics, or pain points.",
    "Do not recommend automated cold outreach, bulk sending, scraping third-party platforms, social scraping, or form submission.",
    "All outreach is draft-only for human review.",
    "Do not overpromise AI. Keep AI/workflow ideas practical and scoped as discovery unless clearly supported.",
    "Avoid first-person singular phrasing. Use Mountline, we, or our team.",
    "If medical or dental, limit recommendations to public marketing website, public FAQ, locations/hours/contact clarity, and general non-patient-specific admin discovery.",
    `Medical/dental warning if relevant: ${MEDICAL_COMPLIANCE_WARNING}`,
    "Return only strict JSON matching the requested schema. No markdown.",
  ].join("\n")
}

function initialPrompt(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  return [
    "Run an initial screening analysis for Mountline Signal.",
    safetyInstructions(),
    "",
    "Return JSON with exactly these keys:",
    "website_quality_score, business_viability_score, operational_opportunity_score, website_service_fit_score, ai_workflow_fit_score, reachability_score, compliance_risk_score, overall_opportunity_score, priority, commercial_fit, potential_project_value_band, potential_project_value_reason, recommended_primary_offer, recommended_secondary_offer, recommended_demo, suggested_channel, suggested_outreach_mode, executive_summary, reasons_to_contact, red_flags, compliance_warning, confidence.",
    "",
    "Value bands must be one of: $500-$1,250, $1,250-$3,500, $3,500-$10,000+, unknown.",
    "Recommended demos must be one of: auto-detailing, barber-shop, none.",
    "",
    buildBaseContext(prospect, scan),
  ].join("\n")
}

function deepPrompt(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
  initial: SignalInitialAnalysisOutput,
) {
  const playbook = getSignalPlaybook(prospect.industry_playbook)

  return [
    "Run a manually triggered deep dive for Mountline Signal.",
    safetyInstructions(),
    "",
    "Generate evidence-grounded opportunity mapping, pitch strategy, call scripts, email draft, discovery questions, warnings, and next action.",
    "Outreach drafts must be human, specific, respectful, and permission-based.",
    "Do not insult the existing website. Do not create fake urgency or fake proof. Include a respectful no-follow-up option in the email where appropriate.",
    "For local_student mode, introduce Mountline as local to the Keller area. Avoid personal-background, calendar-season, informal-venture, or agency-size framing. For professional_studio, lead with Mountline Studio. For warm_connection, mention only relationship details entered by the user.",
    "Opportunity types must be one of: website_redesign, photo_gallery_or_portfolio, service_or_pricing_clarity, booking_or_quote_flow, preserve_existing_booking_integration, client_portal, support_messaging, payment_link_workflow, missed_call_followup_discovery, lead_organization, estimate_request_routing, appointment_routing_discovery, faq_knowledge_base, review_request_workflow_discovery, internal_task_summary, compliance_review_required, no_recommended_offer.",
    "",
    "Return JSON with exactly these keys:",
    "what_looks_good, visible_problem, evidence_based_opportunities, recommended_primary_offer, recommended_secondary_offer, project_value_band, project_value_reason, suggested_channel, suggested_outreach_mode, first_contact_subject, first_contact_email, permission_based_dm, owner_call_opener, gatekeeper_script, voicemail_script, demo_send_followup, discovery_call_questions, proposal_angle, red_flags, compliance_warning, confidence.",
    "",
    `Playbook discovery questions: ${playbook.discoveryQuestions.join(" | ")}`,
    `Initial analysis: ${JSON.stringify(initial, null, 2)}`,
    "",
    buildBaseContext(prospect, scan),
  ].join("\n")
}

async function callOpenAi(prompt: string, model: string) {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a conservative internal sales research analyst. Return only valid JSON and keep every claim evidence-grounded.",
        },
        { role: "user", content: prompt },
      ],
    }),
    signal: AbortSignal.timeout(25_000),
  })

  if (!response.ok) {
    console.error("[signal] OpenAI analysis failed:", response.status, await response.text())
    return null
  }

  const data = await response.json()
  const content = data?.choices?.[0]?.message?.content
  return typeof content === "string" ? content : null
}

async function callGemini(prompt: string, model: string) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(25_000),
    },
  )

  if (!response.ok) {
    console.error("[signal] Gemini analysis failed:", response.status, await response.text())
    return null
  }

  const data = await response.json()
  const content = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: unknown }) => (typeof part.text === "string" ? part.text : ""))
    .join("")
  return typeof content === "string" && content.trim() ? content : null
}

async function callProvider(prompt: string, deep = false) {
  const provider = getProvider()
  if (provider === "disabled") return null

  const model =
    (deep ? process.env.SIGNAL_DEEP_MODEL : process.env.SIGNAL_FAST_MODEL)?.trim() ||
    (provider === "openai"
      ? deep
        ? DEFAULT_OPENAI_DEEP_MODEL
        : DEFAULT_OPENAI_FAST_MODEL
      : deep
        ? DEFAULT_GEMINI_DEEP_MODEL
        : DEFAULT_GEMINI_FAST_MODEL)

  try {
    const text =
      provider === "openai"
        ? await callOpenAi(prompt, model)
        : await callGemini(prompt, model)

    if (!text) return null

    return {
      provider,
      model,
      json: safeParseJson(text),
    }
  } catch (error) {
    console.error("[signal] Provider analysis error:", error)
    return null
  }
}

function classificationPrompt({
  businessName,
  city,
  state,
  text,
}: {
  businessName: string
  city?: string | null
  state?: string | null
  text: string
}) {
  return [
    "Classify a local business into one Mountline Signal playbook.",
    "Use only the supplied public business text. Be conservative.",
    "If the category is ambiguous, return unknown_needs_review.",
    "Return only strict JSON.",
    "",
    "Allowed playbooks: auto_detailing, barber_salon, hvac, roofing_contractors_home_services, medical_dental, restaurant_food, beauty_wellness, general_local_business, unknown_needs_review.",
    "Medical/dental should win only when official content clearly indicates clinical or dental services.",
    "Beauty or med spa content without clear medical signals should usually be beauty_wellness.",
    "",
    `Business: ${businessName}`,
    `Location: ${[city, state].filter(Boolean).join(", ") || "unknown"}`,
    "Return JSON keys: playbook, confidence, evidence.",
    "",
    text,
  ].join("\n")
}

export async function runInitialAiAnalysis(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
): Promise<AiResult<SignalInitialAnalysisOutput> | null> {
  const result = await callProvider(initialPrompt(prospect, scan), false)
  if (!result) return null

  const parsed = signalInitialAnalysisSchema.safeParse(result.json)
  if (!parsed.success) {
    console.error("[signal] Initial AI output invalid:", parsed.error.flatten())
    return null
  }

  return {
    output: parsed.data,
    provider: result.provider,
    model: result.model,
  }
}

export async function runDeepAiAnalysis(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
  initial: SignalInitialAnalysisOutput,
): Promise<AiResult<SignalDeepAnalysisOutput> | null> {
  const result = await callProvider(deepPrompt(prospect, scan, initial), true)
  if (!result) return null

  const parsed = signalDeepAnalysisSchema.safeParse(result.json)
  if (!parsed.success) {
    console.error("[signal] Deep AI output invalid:", parsed.error.flatten())
    return null
  }

  return {
    output: parsed.data,
    provider: result.provider,
    model: result.model,
  }
}

export type SignalLeadSalesPackOutput = z.infer<typeof signalLeadSalesPackSchema>
export type SignalLeadSalesStrategyOutput = z.infer<typeof signalLeadSalesStrategySchema>
export type SignalLeadScriptsOutput = z.infer<typeof signalLeadScriptsSchema>

export type SignalLeadSalesContext = {
  businessName: string
  city: string | null
  industry: string | null
  websiteStatus: string
  publicFacts: string[]
  evidence: Array<{ label: string; excerpt: string; url?: string | null }>
  scoreSummary: string
  verifiedContact: string[]
  websiteFindings: string[]
  communicationProfile: string[]
  strongestOpportunity: string
  uncertainties: string[]
  forbiddenClaims: string[]
  recommendedChannel: string
}

function salesContext(input: SignalLeadSalesContext) {
  return [
    `Business: ${input.businessName}`,
    `Location: ${input.city || "unknown"}`,
    `Industry: ${input.industry || "unknown"}`,
    `Website status: ${input.websiteStatus}`,
    `Verified public facts: ${input.publicFacts.join(" | ") || "No additional public facts confirmed."}`,
    `Score summary: ${input.scoreSummary}`,
    `Verified contact: ${input.verifiedContact.join(" | ") || "No direct contact fact verified."}`,
    `Website findings: ${input.websiteFindings.join(" | ") || "Website findings incomplete."}`,
    `Communication profile: ${input.communicationProfile.join(" | ") || "Keep the approach direct and respectful."}`,
    `Strongest opportunity: ${input.strongestOpportunity}`,
    `Recommended first channel: ${input.recommendedChannel}`,
    `Facts to verify: ${input.uncertainties.join(" | ") || "None listed."}`,
    `Forbidden claims: ${input.forbiddenClaims.join(" | ") || "Do not add unsupported facts."}`,
    "Evidence:",
    ...input.evidence.slice(0, 12).map((item) => `- ${item.label}: ${item.excerpt}${item.url ? ` (${item.url})` : ""}`),
  ].join("\n")
}

function verifiedFactGrounded(values: string[], facts: string[]) {
  const factTokens = facts
    .flatMap((fact) => fact.toLowerCase().split(/[^a-z0-9]+/))
    .filter((token) => token.length >= 5 && !["public", "verified", "business", "website", "contact"].includes(token))
  const output = values.join(" ").toLowerCase()
  return new Set(factTokens.filter((token) => output.includes(token))).size >= Math.min(2, new Set(factTokens).size)
}

export async function runSignalLeadSalesStrategyAi(input: SignalLeadSalesContext) {
  let critique = ""
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const prompt = [
      "Create the strategy pass for one Mountline Signal sales plan.",
      safetyInstructions(),
      "Choose exactly one primary angle and the smallest credible offer. Use at least two supplied business-specific facts.",
      "Keep the voice local, observant, friendly, credible, and direct. Do not pretend Mountline is a large agency.",
      "Do not use first-person singular. Use 'Luke with Mountline', 'Mountline', 'we', or 'our'. Never mention school or age.",
      "Treat every uncertainty as something to verify, never as a fact. Do not promise revenue, traffic, or conversion results.",
      "Return strict JSON only with: strongest_angle, lead_value, best_approach, recommended_offer, likely_objections, tone, facts_to_mention, facts_not_to_mention.",
      critique,
      salesContext(input),
    ].filter(Boolean).join("\n\n")
    const result = await callProvider(prompt, true)
    if (!result) continue
    const parsed = signalLeadSalesStrategySchema.safeParse(result.json)
    if (parsed.success && verifiedFactGrounded(parsed.data.facts_to_mention, input.publicFacts)) {
      return { output: parsed.data, provider: result.provider, model: result.model, attempt }
    }
    critique = "Previous attempt failed: strategy must match the schema and facts_to_mention must contain at least two distinctive verified facts from the supplied evidence. Rewrite it without adding facts."
  }
  return null
}

export async function runSignalLeadScriptsAi(input: SignalLeadSalesContext & { strategy: SignalLeadSalesStrategyOutput }) {
  let critique = ""
  for (let attempt = 1; attempt <= 3; attempt += 1) {
    const prompt = [
      "Write the script pass for one Mountline Signal sales plan using the approved strategy below.",
      safetyInstructions(),
      "The result must sound natural when read aloud and must fail the swap test: changing only the business name cannot make it fit another lead.",
      "Use at least two verified business-specific references across the briefing, opener, call script, and follow-up.",
      "Do not use first-person singular. Use 'Luke with Mountline', 'Mountline', 'we', or 'our'. Never mention school or age.",
      "Word limits: briefing 150; walk-in opener 70; busy response 30; concept transition 35; call script 120; follow-up text 60; each objection response 20–60.",
      "Return exactly three conversational discovery questions, exactly four relevant objections, three to six do-not-say items, and three to five next steps.",
      "Do not add a Lovable prompt; concept generation is deterministic from verified evidence.",
      "Return strict JSON only with: one_minute_briefing, best_angle, walk_in_opener, busy_response, concept_transition, discovery_questions, price_transition, call_script, follow_up_text, objections, do_not_say, next_steps.",
      `Approved strategy: ${JSON.stringify(input.strategy)}`,
      critique,
      salesContext(input),
    ].filter(Boolean).join("\n\n")
    const result = await callProvider(prompt, true)
    if (!result) continue
    const parsed = signalLeadScriptsSchema.safeParse(result.json)
    if (parsed.success && verifiedFactGrounded([
      parsed.data.one_minute_briefing,
      parsed.data.walk_in_opener,
      parsed.data.call_script,
      parsed.data.follow_up_text,
    ], input.publicFacts)) {
      return { output: parsed.data, provider: result.provider, model: result.model, attempt }
    }
    critique = "Previous attempt failed quality checks: obey every word limit, include exactly the required item counts, and ground at least two distinctive references in supplied verified facts. Remove unsupported claims and generic agency language."
  }
  return null
}

export async function runSignalChainClassificationAi(input: {
  businessName: string
  websiteUrl: string | null
  evidence: string[]
}) {
  const prompt = [
    "Classify whether this public business entity is independent, a local multi-location business, a franchise, or a chain.",
    safetyInstructions(),
    "Known-chain registry and deterministic hard blocks are handled outside this model. Be conservative: absence of franchise wording is not proof of independence.",
    "Return exactly: classification, probability, evidence, reason, location_count_estimate.",
    "classification must be independent, likely_independent, local_multi_location, likely_franchise, chain, or uncertain.",
    `Business: ${input.businessName}`,
    `Website: ${input.websiteUrl || "unknown"}`,
    `Collected public evidence: ${input.evidence.join(" | ") || "No useful evidence."}`,
  ].join("\n")
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const result = await callProvider(prompt, false)
    if (!result) continue
    const parsed = signalChainClassificationSchema.safeParse(result.json)
    if (parsed.success) return { output: parsed.data, provider: result.provider, model: result.model }
    console.error(`[signal] Chain classification output invalid (attempt ${attempt}):`, parsed.error.flatten())
  }
  return null
}

export async function runSignalLeadSalesPackAi(input: {
  businessName: string
  city: string | null
  industry: string | null
  websiteStatus: string
  publicFacts: string[]
  evidence: Array<{ label: string; excerpt: string; url?: string | null }>
  scoreSummary: string
  verifiedContact: string[]
  websiteFindings: string[]
  communicationProfile: string[]
  strongestOpportunity: string
  uncertainties: string[]
  forbiddenClaims: string[]
  recommendedChannel: string
}) {
  const prompt = [
      "Create a practical, evidence-grounded Mountline Signal sales pack for one local business.",
      safetyInstructions(),
      "Voice: sharp, energetic, socially aware, respectful, conversational, and prepared. Never sound like an agency automation platform.",
      "Do not use first-person singular. Use 'Luke with Mountline', 'Mountline', 'we', or 'our'. Never mention school, age, seasons, friends, or side-hustle framing.",
      "Use only the supplied public facts and evidence. State uncertain items as hypotheses. Never imply a concept preview is the business's official website.",
      "The script must fail a swap test: changing only the business name must not make it usable for another lead. Anchor every opener and follow-up to a supplied verified fact.",
      "Choose one strongest honest angle. Do not bundle every Mountline service. Recommend the smallest credible first offer and a realistic price range.",
      "The walk-in script must be a short dialogue sequence with greeting, reason, specific compliment, observation, permission to show a concept, 2–3 discovery questions, smallest offer, soft close, contact exchange, and graceful busy exit—not a monologue.",
      "The call opening must ask permission and immediately explain the specific reason for the call.",
      "Avoid: optimize your digital footprint, leverage synergies, transformational growth, scale, premium digital solutions, and unsupported revenue claims.",
      "The Lovable prompt must request a clearly labeled concept preview, mobile-first design, verified facts only, placeholders for unknown facts, and no invented reviews, pricing, services, logos, or testimonials.",
      "For objections, tailor brief answers for: who Mountline is, how the business was found, already have Facebook, enough business, not technical, already have a website, need to think, send it, too busy, and cost. Return 6 of the most relevant.",
      "Return only strict JSON with exactly these keys: lead_briefing, strongest_honest_angle, fifteen_second_opener, why_this_fits, what_stood_out, likely_pain_points, recommended_offer, pricing_angle, pitch_angle, best_first_action, walk_in_script, call_script, discovery_questions, follow_up_message, follow_up_text, follow_up_email, objection_handling, what_to_avoid, risks_to_verify, next_action_checklist, lovable_prompt.",
      "",
      `Business: ${input.businessName}`,
      `Location: ${input.city || "unknown"}`,
      `Industry: ${input.industry || "unknown"}`,
      `Website status: ${input.websiteStatus}`,
      `Public facts: ${input.publicFacts.join(" | ") || "No additional public facts confirmed."}`,
      `Score summary: ${input.scoreSummary}`,
      `Verified contact: ${input.verifiedContact.join(" | ") || "No direct contact fact verified."}`,
      `Website findings: ${input.websiteFindings.join(" | ") || "Website findings incomplete."}`,
      `Communication profile: ${input.communicationProfile.join(" | ") || "No communication hypothesis beyond direct and respectful."}`,
      `Strongest opportunity: ${input.strongestOpportunity}`,
      `Recommended first channel: ${input.recommendedChannel}`,
      `Uncertainties that must be stated or verified: ${input.uncertainties.join(" | ") || "None listed."}`,
      `Forbidden claims: ${input.forbiddenClaims.join(" | ") || "Do not add unsupported facts."}`,
      "Evidence:",
      ...input.evidence.slice(0, 10).map((item) =>
        `- ${item.label}: ${item.excerpt}${item.url ? ` (${item.url})` : ""}`,
      ),
    ].join("\n")

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const result = await callProvider(prompt, true)
    if (!result) continue
    const parsed = signalLeadSalesPackSchema.safeParse(result.json)
    if (parsed.success) {
      return {
        output: parsed.data,
        provider: result.provider,
        model: result.model,
      }
    }
    console.error(`[signal] Lead sales pack output invalid (attempt ${attempt}):`, parsed.error.flatten())
  }
  return null
}

export async function runSignalImportMappingAi(headers: string[]) {
  if (headers.length === 0) return null

  const result = await callProvider(
    [
      "Map spreadsheet headers to Mountline Signal fields.",
      "Use only the exact header strings supplied. Return JSON where each value is either an exact header string or null.",
      "Do not infer any business facts. This is only column mapping.",
      "Allowed keys: business_name, contact_name, industry, city, state, website_url, public_email, public_phone, instagram_url, human_notes, what_looks_good, visible_problem, relevant_demo, outreach_status, follow_up_date, existing_website_platform, existing_booking_platform, locality_relationship.",
      `Headers: ${JSON.stringify(headers)}`,
    ].join("\n"),
    false,
  )
  if (!result) return null

  const parsed = signalImportMappingOutputSchema.safeParse(result.json)
  if (!parsed.success) return null

  const mapping: Record<string, number> = {}
  for (const [field, header] of Object.entries(parsed.data)) {
    if (!header) continue
    const index = headers.findIndex((candidate) => candidate === header)
    if (index >= 0) mapping[field] = index
  }

  return {
    provider: result.provider,
    model: result.model,
    mapping,
  }
}

export async function runSignalClassificationAi({
  businessName,
  city,
  state,
  text,
}: {
  businessName: string
  city?: string | null
  state?: string | null
  text: string
}) {
  const result = await callProvider(
    classificationPrompt({ businessName, city, state, text }),
    false,
  )
  if (!result) return null

  const parsed = signalClassificationOutputSchema.safeParse(result.json)
  if (!parsed.success) {
    console.error("[signal] Classification AI output invalid:", parsed.error.flatten())
    return null
  }

  return {
    output: parsed.data,
    provider: result.provider,
    model: result.model,
  }
}
