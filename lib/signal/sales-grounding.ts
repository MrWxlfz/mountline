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

export function validateSignalSalesPackGrounding(input: {
  pack: unknown
  businessName: string
  verifiedFacts: string[]
}) {
  const pack = asRecord(input.pack)
  const issues: string[] = []
  const businessName = input.businessName.toLowerCase()
  const requiredSections = [
    "lead_briefing",
    "strongest_honest_angle",
    "fifteen_second_opener",
    "walk_in_script",
    "call_script",
    "discovery_questions",
    "recommended_offer",
    "objection_handling",
    "follow_up_text",
    "follow_up_email",
    "what_to_avoid",
    "next_action_checklist",
    "lovable_prompt",
  ]
  for (const section of requiredSections) {
    if (!text(pack[section]).trim()) issues.push(`Missing required sales-pack section: ${section}.`)
  }

  for (const section of ["lead_briefing", "fifteen_second_opener", "call_script", "follow_up_text"]) {
    if (!text(pack[section]).toLowerCase().includes(businessName)) {
      issues.push(`${section} does not name the verified business.`)
    }
  }

  const allText = text(pack).toLowerCase()
  for (const phrase of GENERIC_AGENCY_PHRASES) {
    if (allText.includes(phrase)) issues.push(`Generic agency phrase is not allowed: ${phrase}.`)
  }
  if (/\b(?:i|i'm|i’m|my|me)\b/i.test(text(pack.fifteen_second_opener))) {
    issues.push("The opener uses first-person singular instead of Mountline/we language.")
  }

  const distinctiveFactTokens = input.verifiedFacts
    .flatMap((fact) => fact.toLowerCase().split(/[^a-z0-9]+/))
    .filter((token) => token.length >= 6 && !["public", "business", "verified", "website", "contact", "canonical"].includes(token))
  if (distinctiveFactTokens.length > 0 && !distinctiveFactTokens.some((token) => allText.includes(token))) {
    issues.push("No distinctive verified fact appears in the sales pack.")
  }

  return { valid: issues.length === 0, issues }
}

export function selectSignalSalesPack(input: {
  fallback: JsonRecord
  aiPack: JsonRecord | null
  businessName: string
  verifiedFacts: string[]
}) {
  if (!input.aiPack) {
    return { pack: { ...input.fallback, generated_by: "deterministic_fallback" }, generatedBy: "deterministic_fallback" as const, issues: ["AI pack unavailable."] }
  }
  const grounding = validateSignalSalesPackGrounding({ pack: input.aiPack, businessName: input.businessName, verifiedFacts: input.verifiedFacts })
  if (!grounding.valid) {
    return { pack: { ...input.fallback, generated_by: "deterministic_fallback" }, generatedBy: "deterministic_fallback" as const, issues: grounding.issues }
  }
  return { pack: { ...input.aiPack, generated_by: "ai" }, generatedBy: "ai" as const, issues: [] }
}
