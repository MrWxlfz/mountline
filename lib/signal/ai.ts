import "server-only"

import type { SignalProspect } from "@/lib/supabase/types"
import { getSignalPlaybook, MEDICAL_COMPLIANCE_WARNING } from "./playbooks"
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

const DEFAULT_OPENAI_FAST_MODEL = "gpt-4.1-mini"
const DEFAULT_OPENAI_DEEP_MODEL = "gpt-4.1"
const DEFAULT_GEMINI_FAST_MODEL = "gemini-2.0-flash"
const DEFAULT_GEMINI_DEEP_MODEL = "gemini-2.0-flash"

function getProvider(): SignalAiProvider {
  const provider = process.env.SIGNAL_AI_PROVIDER?.trim().toLowerCase()
  if (provider === "gemini" || provider === "openai") return provider
  return "disabled"
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
    "For local_student mode only, identify Luke as a local Keller High student building Mountline Studio. For professional_studio, do not lead with student identity. For warm_connection, mention only relationship details entered by the user.",
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
