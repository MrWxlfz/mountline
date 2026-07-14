export type SignalBusinessNameSource =
  | "manual_correction"
  | "user_confirmed"
  | "submitted_input"
  | "official_website_structured_data"
  | "places_listing"
  | "official_website_site_name"
  | "verified_official_social"
  | "reputable_business_listing"
  | "official_website_title"
  | "search_result_title"
  | "social_handle"

export type SignalRawName = {
  value: string | null | undefined
  source: SignalBusinessNameSource
  verified?: boolean
}

export type SignalCanonicalNameResolution = {
  rawNames: Array<{ value: string; source: SignalBusinessNameSource }>
  canonicalName: string | null
  canonicalNameSource: SignalBusinessNameSource | null
  canonicalNameConfidence: number
  canonicalNameWarnings: string[]
  displayName: string | null
}

const SOURCE_SCORE: Record<SignalBusinessNameSource, number> = {
  manual_correction: 100,
  user_confirmed: 99,
  submitted_input: 82,
  official_website_structured_data: 96,
  places_listing: 92,
  official_website_site_name: 89,
  verified_official_social: 83,
  reputable_business_listing: 74,
  official_website_title: 70,
  search_result_title: 54,
  social_handle: 18,
}

const GENERIC_TERMS = new Set([
  "a", "an", "and", "best", "business", "businesses", "directory", "facebook", "find", "for", "home", "instagram",
  "barber", "cleaner", "cleaning", "contractor", "detail", "detailer", "detailing", "groomer", "grooming",
  "location", "locations", "near", "official", "salon", "service", "services", "shop", "top", "welcome", "website",
  "of", "pet", "the", "to",
])

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

function normalizeComparison(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[’']/g, "")
    .replace(/\b(?:llc|inc|incorporated|corp|corporation|company|co|ltd)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)))
}

function stripEmoji(value: string) {
  return value
    .replace(/[\p{Extended_Pictographic}\p{Emoji_Presentation}\uFE0F\u200D]/gu, " ")
    .replace(/[\u{1F1E6}-\u{1F1FF}]/gu, " ")
}

export function cleanSignalBusinessName(
  value: string | null | undefined,
  context: { city?: string | null; state?: string | null; category?: string | null } = {},
) {
  const warnings: string[] = []
  let name = (value || "").normalize("NFKC").replace(/[\u0000-\u001F\u007F]/g, " ").trim()
  if (!name) return { name: null, warnings: ["No business name was supplied."] }

  const withoutEmoji = stripEmoji(name)
  if (withoutEmoji !== name) warnings.push("Decorative emoji was removed.")
  name = withoutEmoji

  const withoutUrl = name.replace(/https?:\/\/\S+|\bwww\.\S+/gi, " ")
  if (withoutUrl !== name) warnings.push("A URL was removed from the name.")
  name = withoutUrl

  const withoutHandle = name.replace(/(^|\s)@[a-z0-9._-]+\b/gi, " ")
  if (withoutHandle !== name) warnings.push("A social handle was removed from the name.")
  name = withoutHandle

  const withoutPhone = name.replace(/(?:\+?1[.\s-]?)?(?:\(?\d{3}\)?[.\s-]?)\d{3}[.\s-]?\d{4}/g, " ")
  if (withoutPhone !== name) warnings.push("A phone number was removed from the name.")
  name = withoutPhone

  name = name
    .replace(/^\s*(?:official\s+)?(?:facebook|instagram)\s*(?:page)?\s*[-–—|:]?\s*/i, "")
    .replace(/\s*[-–—|:]\s*(?:official\s+)?(?:facebook|instagram|home|welcome|locations?|official\s+(?:site|website)|website)\s*$/i, "")
    .replace(/\b(?:in|near)\s+[a-z][a-z .'-]+,?\s*(?:tx|texas)\s*$/i, "")
    .replace(/\bnear\s+me\b/gi, "")
    .replace(/^\s*(?:best|top(?:\s+\d+)?)\s+/i, "")

  for (const location of [context.city, context.state, context.state === "TX" ? "Texas" : null]) {
    const cleaned = location?.split(",")[0]?.trim()
    if (!cleaned || cleaned.length < 2) continue
    name = name.replace(new RegExp(`\\s*[-–—|,]\\s*${escapeRegExp(cleaned)}(?:\\s*,?\\s*(?:TX|Texas))?\\s*$`, "i"), "")
  }

  const segments = name.split(/\s[-–—|:]\s/).map((segment) => segment.trim()).filter(Boolean)
  if (segments.length > 1) {
    const first = segments[0]
    const rest = segments.slice(1).join(" ").toLowerCase()
    const firstNormalized = normalizeComparison(first)
    const looksLikeSlogan = rest.length > 28 || /\b(?:best|quality|professional|services?|serving|book|call|welcome|official|located)\b/i.test(rest)
    const duplicate = rest.includes(firstNormalized) || firstNormalized.includes(normalizeComparison(segments[1]))
    if (looksLikeSlogan || duplicate) {
      name = first
      warnings.push(duplicate ? "A duplicated name fragment was removed." : "A marketing or listing suffix was removed.")
    }
  }

  name = name
    .replace(/\bOfficial\b/gi, " ")
    .replace(/\s*&\s*/g, " & ")
    .replace(/\s*(['’.-])\s*/g, "$1")
    .replace(/([!?.;,:'’&-])\1+/g, "$1")
    .replace(/\s+/g, " ")
    .replace(/^[\s|:;,.!?'’"-]+|[\s|:;,.!?'’"-]+$/g, "")
    .trim()

  const normalized = normalizeComparison(name)
  const tokens = normalized.split(" ").filter(Boolean)
  const categoryTokens = normalizeComparison(context.category || "").split(" ").filter(Boolean)
  const cityTokens = normalizeComparison(context.city || "").split(" ").filter(Boolean)
  const distinctive = tokens.filter((token) => !GENERIC_TERMS.has(token) && !categoryTokens.includes(token) && !cityTokens.includes(token))
  if (name.length < 2 || name.length > 120 || distinctive.length === 0) {
    warnings.push("The remaining text does not establish a distinct professional business name.")
    return { name: null, warnings: unique(warnings) }
  }

  return { name, warnings: unique(warnings) }
}

export function resolveSignalCanonicalName(
  candidates: SignalRawName[],
  context: { city?: string | null; state?: string | null; category?: string | null } = {},
): SignalCanonicalNameResolution {
  const rawNames = candidates
    .map((candidate) => ({ value: (candidate.value || "").trim(), source: candidate.source, verified: candidate.verified }))
    .filter((candidate) => Boolean(candidate.value))
  const cleaned = rawNames.flatMap((candidate) => {
    const result = cleanSignalBusinessName(candidate.value, context)
    return result.name ? [{ ...candidate, name: result.name, warnings: result.warnings }] : []
  })
  const groups = new Map<string, typeof cleaned>()
  for (const item of cleaned) {
    const key = normalizeComparison(item.name)
    groups.set(key, [...(groups.get(key) || []), item])
  }
  const ranked = cleaned
    .map((candidate) => {
      const agreement = (groups.get(normalizeComparison(candidate.name))?.length || 1) - 1
      const verifiedBoost = candidate.verified ? 4 : 0
      const sourceScore = SOURCE_SCORE[candidate.source]
      return { ...candidate, score: Math.min(99, sourceScore + Math.min(8, agreement * 4) + verifiedBoost) }
    })
    .sort((left, right) => right.score - left.score || left.name.length - right.name.length)
  const selected = ranked[0]
  const warnings = unique([
    ...ranked.flatMap((item) => item.warnings),
    ...(ranked.length > 1 && new Set(ranked.map((item) => normalizeComparison(item.name))).size > 1
      ? ["Public name sources disagree; the highest-quality verified source was selected."]
      : []),
    ...(selected?.source === "search_result_title" || selected?.source === "social_handle"
      ? ["The canonical name depends on a lower-confidence public source."]
      : []),
  ])

  return {
    rawNames: rawNames.map(({ value, source }) => ({ value, source })),
    canonicalName: selected?.name || null,
    canonicalNameSource: selected?.source || null,
    canonicalNameConfidence: selected?.score || 0,
    canonicalNameWarnings: warnings,
    displayName: selected?.name || null,
  }
}
