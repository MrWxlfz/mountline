type JsonRecord = Record<string, unknown>

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {}
}

function text(value: unknown): string {
  if (typeof value === "string") return value
  if (Array.isArray(value)) return value.map(text).join(" ")
  if (value && typeof value === "object") return Object.values(value as JsonRecord).map(text).join(" ")
  return ""
}

const GENERIC_AGENCY_PHRASES = [
  "optimize your digital footprint",
  "leverage synergies",
  "transformational growth",
  "premium digital solutions",
  "help businesses like yours scale",
  "increase your revenue",
]

function wordCount(value: unknown) {
  return text(value).trim().split(/\s+/).filter(Boolean).length
}

function clamp(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

export function validateSignalConceptPrompt(input: {
  prompt: string
  businessName: string
  verifiedFacts: string[]
}) {
  const prompt = input.prompt.trim()
  const normalized = prompt.toLowerCase()
  const issues: string[] = []
  if (!normalized.includes(input.businessName.toLowerCase())) issues.push("Concept prompt does not name the canonical business.")
  const factTokens = input.verifiedFacts
    .flatMap((fact) => fact.toLowerCase().split(/[^a-z0-9]+/))
    .filter((token) => token.length >= 6 && !["business", "verified", "public", "website", "official"].includes(token))
  if (factTokens.length > 0 && !factTokens.some((token) => normalized.includes(token))) issues.push("Concept prompt does not include a distinctive verified fact.")
  if (!/(?:concept preview|not the official|not an official)/i.test(prompt)) issues.push("Concept prompt is missing a visible preview disclaimer.")
  for (const safeguard of ["testimonial", "pricing", "team", "review", "award"]) {
    if (!/(?:do not|don’t|never)\s+invent/i.test(prompt) || !normalized.includes(safeguard)) {
      issues.push(`Concept prompt does not prohibit invented ${safeguard} content.`)
    }
  }
  if (!/mobile-first|mobile first/i.test(prompt)) issues.push("Concept prompt does not define mobile behavior.")
  if (!/(?:primary cta|call|quote|request|book|appointment)/i.test(prompt)) issues.push("Concept prompt does not define a customer next step.")
  if (/\b[a-z]+_[a-z]+\b/.test(prompt)) issues.push("Concept prompt contains a raw internal enum.")
  if (/@[a-z0-9._-]+/i.test(input.businessName)) issues.push("Canonical business name still contains a social handle.")
  if (wordCount(prompt) < 90) issues.push("Concept prompt is too shallow for a business-specific first draft.")
  return { valid: issues.length === 0, issues }
}

export type SignalScriptQuality = {
  score: number
  dimensions: {
    specificity: number
    evidenceGrounding: number
    naturalness: number
    confidence: number
    concision: number
    stageAwareness: number
    voiceMatch: number
    objectionRelevance: number
    nextStepClarity: number
    ethicalSafety: number
  }
  issues: string[]
}

export function evaluateSignalSalesPackQuality(input: {
  pack: unknown
  businessName: string
  verifiedFacts: string[]
  pipelineStage?: string
  contactHistory?: string[]
  explicitlyDeclined?: boolean
  promisedNextStep?: string | null
}) : SignalScriptQuality {
  const pack = asRecord(input.pack)
  const visibleKeys = [
    "one_minute_briefing", "best_angle", "walk_in_opener", "busy_response", "concept_transition",
    "discovery_questions", "price_transition", "call_script", "follow_up_text", "objections",
    "do_not_say", "next_steps", "lovable_prompt", "objective", "value_bridge",
    "concept_reveal", "recommended_close", "fallback_close", "graceful_exit",
    "delivery_notes", "variants",
  ]
  const allText = visibleKeys.map((key) => text(pack[key])).join(" ")
  const normalizedText = allText.toLowerCase()
  const issues: string[] = []
  const distinctiveTokens = Array.from(new Set(input.verifiedFacts
    .flatMap((fact) => fact.toLowerCase().split(/[^a-z0-9]+/))
    .filter((token) => token.length >= 5 && !["public", "business", "verified", "website", "contact", "signal", "official"].includes(token))))
  const groundedTokens = distinctiveTokens.filter((token) => normalizedText.includes(token))
  const namedSections = ["one_minute_briefing", "walk_in_opener", "call_script", "follow_up_text"]
    .filter((key) => text(pack[key]).toLowerCase().includes(input.businessName.toLowerCase())).length
  const specificity = clamp(28 + namedSections * 10 + Math.min(32, groundedTokens.length * 12))
  if (groundedTokens.length < Math.min(2, distinctiveTokens.length)) issues.push("Fewer than two distinctive verified facts appear in the scripts.")

  let naturalness = 92
  for (const phrase of GENERIC_AGENCY_PHRASES) if (normalizedText.includes(phrase)) naturalness -= 18
  if (/\b(?:cutting-edge|leverage ai|conversion funnel|underoptimized|full-service agency)\b/i.test(allText)) naturalness -= 22
  const paragraphs = allText.split(/\n{2,}/).map((value) => value.trim().toLowerCase()).filter((value) => value.length > 30)
  if (new Set(paragraphs).size < paragraphs.length) {
    naturalness -= 18
    issues.push("The pack repeats a paragraph.")
  }

  let confidence = 92
  const hedges = allText.match(/\b(?:maybe|perhaps|kind of|sort of|i guess|hopefully)\b/gi)?.length || 0
  confidence -= Math.min(36, hedges * 7)
  if (/\b(?:crush it|game[- ]changer|dominate|no[- ]brainer|close them)\b/i.test(allText)) {
    confidence -= 30
    issues.push("The pack uses performative or sales-bro confidence language.")
  }

  const evidenceGrounding = clamp(30 + Math.min(55, groundedTokens.length * 18) + (namedSections >= 3 ? 15 : 0))
  const limits: Array<[string, number]> = [
    ["one_minute_briefing", 150], ["walk_in_opener", 55], ["busy_response", 30],
    ["concept_transition", 35], ["call_script", 110], ["follow_up_text", 55],
  ]
  let concision = 100
  for (const [key, limit] of limits) {
    if (wordCount(pack[key]) > limit) {
      concision -= 18
      issues.push(`${key} exceeds ${limit} words.`)
    }
  }

  const requiredSections = [
    "one_minute_briefing", "best_angle", "walk_in_opener", "busy_response", "concept_transition",
    "discovery_questions", "price_transition", "call_script", "follow_up_text", "objections",
    "do_not_say", "next_steps", "lovable_prompt",
  ]
  for (const key of requiredSections) if (!text(pack[key]).trim()) issues.push(`Missing required sales-pack section: ${key}.`)

  const stage = input.pipelineStage || "found"
  const opener = text(pack.walk_in_opener)
  const laterStage = ["contacted", "interested", "proposal", "won", "lost"].includes(stage)
  let stageAwareness = 94
  if (laterStage && /\b(?:came across|first time|are you the owner|cold call|reaching out for the first time)\b/i.test(opener)) {
    stageAwareness -= 55
    issues.push("The opener resets a lead that already has contact history to a cold introduction.")
  }
  if (input.promisedNextStep && !normalizedText.includes(input.promisedNextStep.toLowerCase().split(/\s+/).slice(0, 4).join(" "))) {
    stageAwareness -= 16
    issues.push("The pack does not reference the recorded promised next step.")
  }
  if ((input.explicitlyDeclined || stage === "lost") && !/\b(?:thank|leave it there|respect|no further follow|won't keep|will not keep)\b/i.test(text(pack.graceful_exit) || allText)) {
    stageAwareness -= 55
    issues.push("A declined lead does not have a clear respectful exit.")
  }
  if ((input.contactHistory?.length || 0) > 0 && !laterStage && stage === "found") stageAwareness -= 12

  let voiceMatch = 100
  if (/\b(?:i|i'm|i’m|my|me)\b/i.test(`${text(pack.walk_in_opener)} ${text(pack.call_script)} ${text(pack.follow_up_text)}`)) {
    voiceMatch -= 45
    issues.push("Scripts use first-person singular instead of Mountline/we language.")
  }
  if (/\b(?:school|student|age|side hustle|agency specializes)\b/i.test(allText)) {
    voiceMatch -= 35
    issues.push("Scripts include prohibited identity or agency framing.")
  }

  const objections = Array.isArray(pack.objections) ? pack.objections : []
  let objectionRelevance = objections.length === 4 ? 90 : 45
  for (const objection of objections) {
    const objectionRecord = asRecord(objection)
    const responseWords = wordCount(objectionRecord.response)
    if (responseWords < 18 || responseWords > 55) {
      objectionRelevance -= 12
      issues.push("An objection response falls outside the 18–55 word limit.")
    }
    if (objectionRecord.acknowledge && objectionRecord.clarify && objectionRecord.reframe && objectionRecord.next_step) objectionRelevance += 2
    if (typeof objectionRecord.loop_limit === "number" && objectionRecord.loop_limit > 2) objectionRelevance -= 25
  }
  const nextStepText = `${text(pack.next_steps)} ${text(pack.recommended_close)} ${text(pack.fallback_close)} ${text(pack.follow_up_text)}`
  let nextStepClarity = 45
  if (/\b(?:show|send|schedule|review|confirm|call|check back|follow up|number|email|proposal|agreement)\b/i.test(nextStepText)) nextStepClarity += 30
  if (/\b(?:today|tomorrow|monday|tuesday|wednesday|thursday|friday|next week|specific time|best number|best email)\b/i.test(nextStepText)) nextStepClarity += 18
  if (/\b(?:pay now|deposit today|sign today)\b/i.test(nextStepText) && !["proposal", "interested"].includes(stage)) {
    nextStepClarity -= 35
    issues.push("The close asks for a high-readiness commitment without recorded buying intent.")
  }

  let ethicalSafety = 100
  if (/\b(?:guarantee|guaranteed|increase (?:your )?revenue|will (?:bring|drive|get) (?:you )?(?:more )?(?:sales|customers|leads)|double your)\b/i.test(allText)) {
    ethicalSafety -= 60
    issues.push("The pack contains an unsupported outcome claim.")
  }
  if (/\b(?:act now|limited spots|before it is too late|you are losing money|fear of missing|pressure them|won't take no)\b/i.test(allText)) {
    ethicalSafety -= 55
    issues.push("The pack contains pressure, fake urgency, or manufactured fear language.")
  }
  if (/\b[a-z]+_[a-z]+\b/.test(allText)) {
    ethicalSafety -= 30
    issues.push("A raw internal enum appears in the sales pack.")
  }

  const dimensions = {
    specificity,
    evidenceGrounding,
    naturalness: clamp(naturalness),
    confidence: clamp(confidence),
    concision: clamp(concision),
    stageAwareness: clamp(stageAwareness),
    voiceMatch: clamp(voiceMatch),
    objectionRelevance: clamp(objectionRelevance),
    nextStepClarity: clamp(nextStepClarity),
    ethicalSafety: clamp(ethicalSafety),
  }
  const score = clamp(
    dimensions.specificity * 0.13
    + dimensions.evidenceGrounding * 0.14
    + dimensions.naturalness * 0.11
    + dimensions.confidence * 0.08
    + dimensions.concision * 0.09
    + dimensions.stageAwareness * 0.12
    + dimensions.objectionRelevance * 0.08
    + dimensions.nextStepClarity * 0.09
    + dimensions.voiceMatch * 0.07
    + dimensions.ethicalSafety * 0.09,
  )
  return { score, dimensions, issues: Array.from(new Set(issues)) }
}

export function validateSignalSalesPackGrounding(input: {
  pack: unknown
  businessName: string
  verifiedFacts: string[]
  pipelineStage?: string
  contactHistory?: string[]
  explicitlyDeclined?: boolean
  promisedNextStep?: string | null
}) {
  const pack = asRecord(input.pack)
  const issues: string[] = []
  const businessName = input.businessName.toLowerCase()
  for (const section of ["one_minute_briefing", "walk_in_opener", "call_script", "follow_up_text"]) {
    if (!text(pack[section]).toLowerCase().includes(businessName)) {
      issues.push(`${section} does not name the verified business.`)
    }
  }

  const allText = text(pack).toLowerCase()
  for (const phrase of GENERIC_AGENCY_PHRASES) {
    if (allText.includes(phrase)) issues.push(`Generic agency phrase is not allowed: ${phrase}.`)
  }
  if (/\b(?:i|i'm|i’m|my|me)\b/i.test(text(pack.walk_in_opener))) {
    issues.push("The opener uses first-person singular instead of Mountline/we language.")
  }

  const distinctiveFactTokens = input.verifiedFacts
    .flatMap((fact) => fact.toLowerCase().split(/[^a-z0-9]+/))
    .filter((token) => token.length >= 6 && !["public", "business", "verified", "website", "contact", "canonical"].includes(token))
  if (distinctiveFactTokens.length > 0 && !distinctiveFactTokens.some((token) => allText.includes(token))) {
    issues.push("No distinctive verified fact appears in the sales pack.")
  }

  const quality = evaluateSignalSalesPackQuality(input)
  issues.push(...quality.issues)
  if (quality.score < 78) issues.push(`Script quality ${quality.score}/100 is below the persistence threshold.`)
  return { valid: issues.length === 0, issues: Array.from(new Set(issues)), quality }
}

export function selectSignalSalesPack(input: {
  fallback: JsonRecord
  aiPack: JsonRecord | null
  businessName: string
  verifiedFacts: string[]
  pipelineStage?: string
  contactHistory?: string[]
  explicitlyDeclined?: boolean
  promisedNextStep?: string | null
}) {
  if (!input.aiPack) {
    const pack = { ...input.fallback, generated_by: "deterministic_fallback" }
    return { pack, generatedBy: "deterministic_fallback" as const, issues: ["AI pack unavailable."], quality: evaluateSignalSalesPackQuality({ ...input, pack }) }
  }
  const grounding = validateSignalSalesPackGrounding({ ...input, pack: input.aiPack })
  if (!grounding.valid) {
    const pack = { ...input.fallback, generated_by: "deterministic_fallback" }
    return { pack, generatedBy: "deterministic_fallback" as const, issues: grounding.issues, quality: evaluateSignalSalesPackQuality({ ...input, pack }) }
  }
  return { pack: { ...input.aiPack, generated_by: "ai" }, generatedBy: "ai" as const, issues: [], quality: grounding.quality }
}
