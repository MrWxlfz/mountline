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
    naturalness: number
    evidenceGrounding: number
    concision: number
    usefulness: number
    voiceMatch: number
    objectionRelevance: number
    offerFit: number
    claimSafety: number
  }
  issues: string[]
}

export function evaluateSignalSalesPackQuality(input: {
  pack: unknown
  businessName: string
  verifiedFacts: string[]
}) : SignalScriptQuality {
  const pack = asRecord(input.pack)
  const visibleKeys = [
    "one_minute_briefing", "best_angle", "walk_in_opener", "busy_response", "concept_transition",
    "discovery_questions", "price_transition", "call_script", "follow_up_text", "objections",
    "do_not_say", "next_steps", "lovable_prompt",
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

  const evidenceGrounding = clamp(30 + Math.min(55, groundedTokens.length * 18) + (namedSections >= 3 ? 15 : 0))
  const limits: Array<[string, number]> = [
    ["one_minute_briefing", 150], ["walk_in_opener", 70], ["busy_response", 30],
    ["concept_transition", 35], ["call_script", 120], ["follow_up_text", 60],
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
  const present = requiredSections.filter((key) => text(pack[key]).trim()).length
  const usefulness = clamp(present / requiredSections.length * 100)
  for (const key of requiredSections) if (!text(pack[key]).trim()) issues.push(`Missing required sales-pack section: ${key}.`)

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
    const responseWords = wordCount(asRecord(objection).response)
    if (responseWords < 20 || responseWords > 60) {
      objectionRelevance -= 12
      issues.push("An objection response falls outside the 20–60 word limit.")
    }
  }
  const offerFit = text(pack.price_transition) && text(pack.best_angle) && text(pack.next_steps) ? 90 : 45
  let claimSafety = 100
  if (/\b(?:guarantee|guaranteed|increase (?:your )?revenue|will (?:bring|drive|get) (?:you )?(?:more )?(?:sales|customers|leads)|double your)\b/i.test(allText)) {
    claimSafety -= 60
    issues.push("The pack contains an unsupported outcome claim.")
  }
  if (/\b[a-z]+_[a-z]+\b/.test(allText)) {
    claimSafety -= 30
    issues.push("A raw internal enum appears in the sales pack.")
  }

  const dimensions = {
    specificity,
    naturalness: clamp(naturalness),
    evidenceGrounding,
    concision: clamp(concision),
    usefulness,
    voiceMatch: clamp(voiceMatch),
    objectionRelevance: clamp(objectionRelevance),
    offerFit,
    claimSafety: clamp(claimSafety),
  }
  const score = clamp(
    dimensions.specificity * 0.16
    + dimensions.naturalness * 0.11
    + dimensions.evidenceGrounding * 0.16
    + dimensions.concision * 0.1
    + dimensions.usefulness * 0.12
    + dimensions.voiceMatch * 0.11
    + dimensions.objectionRelevance * 0.08
    + dimensions.offerFit * 0.07
    + dimensions.claimSafety * 0.09,
  )
  return { score, dimensions, issues: Array.from(new Set(issues)) }
}

export function validateSignalSalesPackGrounding(input: {
  pack: unknown
  businessName: string
  verifiedFacts: string[]
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
  if (quality.score < 76) issues.push(`Script quality ${quality.score}/100 is below the persistence threshold.`)
  return { valid: issues.length === 0, issues: Array.from(new Set(issues)), quality }
}

export function selectSignalSalesPack(input: {
  fallback: JsonRecord
  aiPack: JsonRecord | null
  businessName: string
  verifiedFacts: string[]
}) {
  if (!input.aiPack) {
    const pack = { ...input.fallback, generated_by: "deterministic_fallback" }
    return { pack, generatedBy: "deterministic_fallback" as const, issues: ["AI pack unavailable."], quality: evaluateSignalSalesPackQuality({ pack, businessName: input.businessName, verifiedFacts: input.verifiedFacts }) }
  }
  const grounding = validateSignalSalesPackGrounding({ pack: input.aiPack, businessName: input.businessName, verifiedFacts: input.verifiedFacts })
  if (!grounding.valid) {
    const pack = { ...input.fallback, generated_by: "deterministic_fallback" }
    return { pack, generatedBy: "deterministic_fallback" as const, issues: grounding.issues, quality: evaluateSignalSalesPackQuality({ pack, businessName: input.businessName, verifiedFacts: input.verifiedFacts }) }
  }
  return { pack: { ...input.aiPack, generated_by: "ai" }, generatedBy: "ai" as const, issues: [], quality: grounding.quality }
}
