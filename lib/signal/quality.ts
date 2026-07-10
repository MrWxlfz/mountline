export type SignalEntityStatus =
  | "verified"
  | "likely"
  | "ambiguous"
  | "generic_result"
  | "directory"
  | "rejected"

export type SignalChainClassification =
  | "independent"
  | "likely_independent"
  | "local_multi_location"
  | "likely_franchise"
  | "chain"
  | "uncertain"

export type SignalGeographicStatus =
  | "confirmed_in_market"
  | "confirmed_within_radius"
  | "near_market"
  | "unclear"
  | "outside_market"

export type SignalQualificationStatus = "qualified" | "rejected" | "incomplete"

export type SignalEvidenceTier = 1 | 2 | 3

export type SignalQualityEvidence = {
  url: string | null
  title: string
  tier: SignalEvidenceTier
  evidenceType: string
  fact: string
  excerpt: string | null
  reliability: number
  retrievedAt: string
}

export type SignalEntityAssessment = {
  canonicalName: string | null
  confidence: number
  status: SignalEntityStatus
  rejectionReason: string | null
  evidence: string[]
}

export type SignalChainAssessment = {
  classification: SignalChainClassification
  probability: number
  independenceConfidence: number
  locationCountEstimate: number | null
  reasons: string[]
  deterministicBlock: boolean
}

export type SignalGeographicAssessment = {
  status: SignalGeographicStatus
  confidence: number
  verifiedCity: string | null
  verifiedAddress: string | null
  distanceEstimateMiles: number | null
  evidence: string[]
}

export type SignalConfidenceComponents = {
  identity: number
  officialSite: number
  geography: number
  contactAgreement: number
  sourceDiversity: number
  websiteCompleteness: number
  chainCertainty: number
  freshness: number
  contradictionPenalty: number
  providerFailurePenalty: number
  final: number
}

export type SignalOpportunityDimensions = {
  mountlineFit: number
  websiteOpportunity: number
  contactConversionFriction: number
  trustGap: number
  demoPotential: number
  contactViability: number
  operationalOpportunity: number
  timingUrgency: number
}

export type SignalOpportunityResult = {
  dimensions: SignalOpportunityDimensions
  penalties: Record<string, number>
  positiveScore: number
  opportunityScore: number
  rankingScore: number
}

export type SignalQualificationResult = {
  status: SignalQualificationStatus
  qualified: boolean
  reasons: string[]
}

type ChainDefinition = {
  name: string
  aliases: string[]
  domains: string[]
}

const CHAIN_REGISTRY: ChainDefinition[] = [
  { name: "PetSmart", aliases: ["petsmart", "petsmart grooming", "petsmart pet grooming"], domains: ["petsmart.com"] },
  { name: "Petco", aliases: ["petco", "petco grooming"], domains: ["petco.com"] },
  { name: "Great Clips", aliases: ["great clips"], domains: ["greatclips.com"] },
  { name: "Supercuts", aliases: ["supercuts"], domains: ["supercuts.com"] },
  { name: "Sport Clips", aliases: ["sport clips", "sportclips"], domains: ["sportclips.com"] },
  { name: "Fantastic Sams", aliases: ["fantastic sams"], domains: ["fantasticsams.com"] },
  { name: "McDonald's", aliases: ["mcdonalds", "mcdonald's"], domains: ["mcdonalds.com"] },
  { name: "Starbucks", aliases: ["starbucks"], domains: ["starbucks.com"] },
  { name: "Subway", aliases: ["subway"], domains: ["subway.com"] },
  { name: "Chick-fil-A", aliases: ["chick fil a", "chick-fil-a"], domains: ["chick-fil-a.com"] },
  { name: "Dunkin'", aliases: ["dunkin", "dunkin donuts"], domains: ["dunkindonuts.com"] },
  { name: "Chipotle", aliases: ["chipotle", "chipotle mexican grill"], domains: ["chipotle.com"] },
  { name: "Domino's", aliases: ["dominos", "domino's pizza"], domains: ["dominos.com"] },
  { name: "Crumbl", aliases: ["crumbl", "crumbl cookies"], domains: ["crumblcookies.com"] },
  { name: "Jersey Mike's", aliases: ["jersey mikes", "jersey mike's"], domains: ["jerseymikes.com"] },
  { name: "Walmart", aliases: ["walmart", "wal mart"], domains: ["walmart.com"] },
  { name: "Target", aliases: ["target"], domains: ["target.com"] },
  { name: "The Home Depot", aliases: ["home depot", "the home depot"], domains: ["homedepot.com"] },
  { name: "Lowe's", aliases: ["lowes", "lowe's"], domains: ["lowes.com"] },
  { name: "Jiffy Lube", aliases: ["jiffy lube"], domains: ["jiffylube.com"] },
  { name: "Meineke", aliases: ["meineke", "meineke car care"], domains: ["meineke.com"] },
  { name: "Midas", aliases: ["midas"], domains: ["midas.com"] },
  { name: "Valvoline", aliases: ["valvoline", "valvoline instant oil change"], domains: ["valvoline.com"] },
  { name: "Take 5 Oil Change", aliases: ["take 5", "take 5 oil change"], domains: ["take5.com"] },
  { name: "Christian Brothers Automotive", aliases: ["christian brothers automotive"], domains: ["cbac.com"] },
  { name: "Planet Fitness", aliases: ["planet fitness"], domains: ["planetfitness.com"] },
  { name: "Anytime Fitness", aliases: ["anytime fitness"], domains: ["anytimefitness.com"] },
  { name: "Orangetheory", aliases: ["orangetheory", "orange theory fitness"], domains: ["orangetheory.com"] },
  { name: "Massage Envy", aliases: ["massage envy"], domains: ["massageenvy.com"] },
  { name: "Hand & Stone", aliases: ["hand and stone", "hand & stone"], domains: ["handandstone.com"] },
  { name: "European Wax Center", aliases: ["european wax center"], domains: ["waxcenter.com"] },
  { name: "The UPS Store", aliases: ["the ups store", "ups store"], domains: ["theupsstore.com"] },
  { name: "Molly Maid", aliases: ["molly maid"], domains: ["mollymaid.com"] },
  { name: "Merry Maids", aliases: ["merry maids"], domains: ["merrymaids.com"] },
  { name: "SERVPRO", aliases: ["servpro"], domains: ["servpro.com"] },
  { name: "Mr. Rooter", aliases: ["mr rooter", "mr. rooter"], domains: ["mrrooter.com"] },
  { name: "One Hour Heating & Air Conditioning", aliases: ["one hour heating", "one hour air conditioning"], domains: ["onehourheatandair.com"] },
  { name: "Ace Hardware", aliases: ["ace hardware"], domains: ["acehardware.com"] },
  { name: "Aspen Dental", aliases: ["aspen dental"], domains: ["aspendental.com"] },
  { name: "Ideal Image", aliases: ["ideal image"], domains: ["idealimage.com"] },
]

const DIRECTORY_HOSTS = [
  "angi.com",
  "bbb.org",
  "birdeye.com",
  "chamberofcommerce.com",
  "foursquare.com",
  "homeadvisor.com",
  "mapquest.com",
  "manta.com",
  "thumbtack.com",
  "yellowpages.com",
  "yelp.com",
]

const SOCIAL_HOSTS = ["facebook.com", "instagram.com", "linkedin.com", "tiktok.com", "x.com", "youtube.com"]

const GENERIC_WORDS = new Set([
  "and", "auto", "barber", "barbers", "best", "business", "businesses", "car", "cleaners", "cleaning",
  "commercial", "company", "contractor", "contractors", "detail", "detailer", "detailing", "directory", "dog",
  "find", "groomer", "groomers", "grooming", "hair", "home", "local", "location", "locations", "medical",
  "mobile", "near", "pet", "pets", "restaurant", "results", "salon", "service", "services", "shop", "spa",
  "studio", "top", "wellness",
])

const CHAIN_LANGUAGE: Array<{ expression: RegExp; reason: string; weight: number; hard?: boolean }> = [
  { expression: /\/(?:store-)?locations?(?:\/|$)|\/(?:find-a|find-your)-location(?:\/|$)|\/store-locator(?:\/|$)/i, reason: "Corporate location-finder URL", weight: 52, hard: true },
  { expression: /\/(?:franchise|franchising)(?:\/|$)/i, reason: "Franchise URL", weight: 75, hard: true },
  { expression: /franchise (?:opportunit|owner|information)|franchise with us|own a franchise/i, reason: "Franchise opportunity language", weight: 82, hard: true },
  { expression: /find (?:a |your )?(?:store|location)|store locator|locations near you/i, reason: "Location-finder language", weight: 48, hard: true },
  { expression: /locations? nationwide|hundreds of locations|across (?:the )?(?:u\.?s\.?|country|states)/i, reason: "National location network language", weight: 62, hard: true },
  { expression: /investor relations|corporate careers|corporate office|parent company/i, reason: "Corporate organization language", weight: 52, hard: true },
  { expression: /store\s*(?:#|number)\s*\d+|location\s*(?:#|id)\s*\d+/i, reason: "Store or location identifier", weight: 35 },
]

const INDEPENDENT_LANGUAGE: Array<{ expression: RegExp; reason: string; weight: number }> = [
  { expression: /owner[- ]operated/i, reason: "Owner-operated wording", weight: 32 },
  { expression: /family[- ]owned|family[- ]run/i, reason: "Family-owned wording", weight: 28 },
  { expression: /locally owned|locally operated/i, reason: "Locally owned wording", weight: 25 },
  { expression: /serving (?:our|the local) community|hometown/i, reason: "Local-community wording", weight: 10 },
]

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, Math.round(value)))
}

function unique(values: Array<string | null | undefined>, limit = 20) {
  return Array.from(new Set(values.map((value) => value?.replace(/\s+/g, " ").trim() || "").filter(Boolean))).slice(0, limit)
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

export function normalizeQualityName(value: string | null | undefined) {
  return (value || "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/['’]/g, "")
    .replace(/\b(?:llc|inc|incorporated|corp|corporation|company|co|ltd)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function normalizeQualityHostname(value: string | null | undefined) {
  if (!value) return ""
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
    return url.hostname.toLowerCase().replace(/^www\./, "")
  } catch {
    return ""
  }
}

export function normalizeQualityPhone(value: string | null | undefined) {
  const digits = (value || "").replace(/\D/g, "")
  return digits.length >= 10 ? digits.slice(-10) : ""
}

function titleCase(value: string) {
  return value.toLowerCase().replace(/\b[a-z]/g, (letter) => letter.toUpperCase())
}

function hostnameName(value: string | null | undefined) {
  const root = normalizeQualityHostname(value).split(".")[0] || ""
  const candidate = root.replace(/[-_]+/g, " ").replace(/\b(?:tx|texas|dfw|usa|official|site|online)\b/gi, " ").replace(/\s+/g, " ").trim()
  return candidate.length >= 3 ? titleCase(candidate) : null
}

function meaningfulTokens(value: string, city?: string | null, industry?: string | null) {
  const excluded = new Set([
    ...normalizeQualityName(city).split(" "),
    ...normalizeQualityName(industry).split(" "),
    "texas", "tx", "dallas", "fort", "worth", "dfw",
  ])
  return normalizeQualityName(value)
    .split(" ")
    .filter((token) => token.length >= 2 && !GENERIC_WORDS.has(token) && !excluded.has(token))
}

export function assessSignalEntityName(input: {
  name: string | null | undefined
  city?: string | null
  industry?: string | null
  url?: string | null
  sourceType?: string | null
  corroboratingNames?: string[]
}) : SignalEntityAssessment {
  const raw = (input.name || "").replace(/\s+/g, " ").trim()
  const normalized = normalizeQualityName(raw)
  const hostname = normalizeQualityHostname(input.url)
  const sourceType = input.sourceType || "unknown"
  const evidence: string[] = []

  if (!raw || raw.length < 2 || normalized === "unknown business" || normalized === "unknown local business") {
    return { canonicalName: null, confidence: 0, status: "rejected", rejectionReason: "No identifiable business name was found.", evidence }
  }
  if (sourceType === "directory" || DIRECTORY_HOSTS.some((host) => hostname === host || hostname.endsWith(`.${host}`))) {
    return { canonicalName: null, confidence: 5, status: "directory", rejectionReason: "The result is a directory page, not a canonical business entity.", evidence }
  }

  const city = (input.city || "").split(",")[0]?.trim() || ""
  const cityExpression = city ? new RegExp(`\\b${escapeRegExp(city)}\\b`, "i") : null
  const genericPatterns: RegExp[] = [
    /\bservices?\s+(?:in|near)\b/i,
    /\b(?:businesses?|locations?|results?|directory)\s+(?:in|near)\b/i,
    /^(?:best|top(?:\s+\d+)?|find\s+a|local)\b/i,
    /\bnear\s+me\b/i,
    /\b(?:top|best)\s+\d+\b/i,
    /\b(?:read reviews|compare|list of)\b/i,
    /\b(?:locations?|services?)\s+near\s+(?:you|me)\b/i,
  ]
  const looksGeneric = genericPatterns.some((pattern) => pattern.test(raw))
  const tokens = meaningfulTokens(raw, city, input.industry)
  const compactName = normalized.replace(/\s+/g, "")
  const compactGenericParts = unique([
    ...normalizeQualityName(city).split(" "),
    ...normalizeQualityName(input.industry).split(" "),
    ...Array.from(GENERIC_WORDS),
    "texas", "tx", "dallas", "dfw", "keller", "southlake", "fortworth",
  ], 200).sort((left, right) => right.length - left.length)
  const compactRemainder = compactGenericParts.reduce(
    (value, part) => part.length >= 2 ? value.replaceAll(part.replace(/\s+/g, ""), "") : value,
    compactName,
  )
  const categoryGeoOnly = Boolean(cityExpression?.test(raw)) && tokens.length === 0
  const endsWithGeo = /\b(?:tx|texas|dallas|dfw|keller|southlake|fort worth)\b[.,]?$/i.test(raw)
    && tokens.length === 0
  const concatenatedCategoryGeo = compactName.length >= 8 && compactRemainder.length < 3

  if (looksGeneric || categoryGeoOnly || endsWithGeo || concatenatedCategoryGeo) {
    return {
      canonicalName: null,
      confidence: 8,
      status: "generic_result",
      rejectionReason: "The result title is an industry/search phrase rather than a distinct business identity.",
      evidence,
    }
  }

  const corroborating = unique(input.corroboratingNames || [], 8)
  const matchingNames = corroborating.filter((name) => normalizeQualityName(name) === normalized)
  if (matchingNames.length > 0) evidence.push("The same proper business name appears in another public identity signal.")
  if (hostname && !DIRECTORY_HOSTS.includes(hostname) && !SOCIAL_HOSTS.some((host) => hostname.endsWith(host))) evidence.push("A distinct likely official domain is available.")
  if (tokens.length > 0) evidence.push("The name contains distinctive branded wording beyond industry and geography.")

  const confidence = clamp(42 + (tokens.length > 0 ? 18 : 0) + (hostname ? 14 : 0) + matchingNames.length * 18)
  return {
    canonicalName: raw.slice(0, 180),
    confidence,
    status: confidence >= 80 ? "verified" : confidence >= 65 ? "likely" : "ambiguous",
    rejectionReason: confidence < 55 ? "The business identity is not supported by enough distinctive public signals." : null,
    evidence,
  }
}

export function resolveSignalDiscoveryEntity(input: {
  title: string
  url: string
  city?: string | null
  industry?: string | null
  sourceType?: string | null
}) : SignalEntityAssessment {
  const firstTitleSegment = input.title
    .replace(/\b(?:official\s+(?:site|website)|home\s*page|website)\b/gi, " ")
    .split(/\s[-–—|:]\s/)[0]
    .replace(/\s+/g, " ")
    .trim()
  const titleAssessment = assessSignalEntityName({ ...input, name: firstTitleSegment })
  if (titleAssessment.status !== "generic_result" && titleAssessment.status !== "rejected" && titleAssessment.status !== "directory") {
    return titleAssessment
  }
  if (/\b(?:top\s*\d+|best\b|near\s+me|businesses?\s+in|services?\s+in|locations?\s+near)\b/i.test(firstTitleSegment)) {
    return titleAssessment
  }

  const hostCandidate = hostnameName(input.url)
  if (hostCandidate && input.sourceType !== "social") {
    const hostAssessment = assessSignalEntityName({ ...input, name: hostCandidate, corroboratingNames: [firstTitleSegment] })
    if (hostAssessment.status === "verified" || hostAssessment.status === "likely") {
      return {
        ...hostAssessment,
        confidence: clamp(hostAssessment.confidence - 8),
        evidence: unique([...hostAssessment.evidence, "Canonical label was derived from the likely official hostname because the search title was generic."], 8),
      }
    }
  }
  return titleAssessment
}

export function assessSignalChain(input: {
  businessName: string
  url?: string | null
  publicText?: string | null
  discoveredUrls?: string[]
}) : SignalChainAssessment {
  const normalizedName = normalizeQualityName(input.businessName)
  const hostname = normalizeQualityHostname(input.url)
  const combined = [input.businessName, input.url, input.publicText, ...(input.discoveredUrls || [])].filter(Boolean).join(" ")
  const reasons: string[] = []
  let probability = 8
  let hard = false
  let independentSignals = 0
  let locationCountEstimate: number | null = null

  for (const chain of CHAIN_REGISTRY) {
    const aliasMatch = chain.aliases.some((alias) => {
      const normalizedAlias = normalizeQualityName(alias)
      if (normalizedName === normalizedAlias) return true
      if (!normalizedName.startsWith(`${normalizedAlias} `)) return false
      if (normalizedAlias.includes(" ")) return true
      const suffix = normalizedName.slice(normalizedAlias.length + 1)
      return /\b(?:grooming|haircuts?|locations?|store|supercenter|restaurant|coffee|sandwiches|pizza|fitness|salon|spa|car care|oil change)\b/.test(suffix)
    })
    const domainMatch = chain.domains.some((domain) => hostname === domain || hostname.endsWith(`.${domain}`))
    if (aliasMatch || domainMatch) {
      probability = 100
      hard = true
      reasons.push(`Known-chain registry match: ${chain.name}${domainMatch ? " domain" : " name"}.`)
      break
    }
  }

  for (const cue of CHAIN_LANGUAGE) {
    if (!cue.expression.test(combined)) continue
    probability += cue.weight
    if (cue.hard) hard = true
    reasons.push(cue.reason)
  }
  for (const cue of INDEPENDENT_LANGUAGE) {
    if (!cue.expression.test(combined)) continue
    independentSignals += cue.weight
    reasons.push(cue.reason)
  }

  const explicitCount = combined.match(/\b(\d{2,4})\+?\s+locations?\b/i)?.[1]
  if (explicitCount) locationCountEstimate = Number(explicitCount)
  else if (/our locations|location finder|store locator/i.test(combined)) locationCountEstimate = 2

  probability = clamp(hard ? Math.max(probability, 78) : probability - independentSignals * 0.7)
  const independenceConfidence = clamp(independentSignals + (probability <= 15 ? 40 : probability <= 30 ? 25 : 5))
  const classification: SignalChainClassification = probability >= 85
    ? "chain"
    : probability >= 65
      ? "likely_franchise"
      : probability >= 40
        ? "uncertain"
        : locationCountEstimate && locationCountEstimate > 1
          ? "local_multi_location"
          : independenceConfidence >= 70
            ? "independent"
            : independenceConfidence >= 55
              ? "likely_independent"
              : "uncertain"

  return {
    classification,
    probability,
    independenceConfidence,
    locationCountEstimate,
    reasons: unique(reasons, 8),
    deterministicBlock: hard || classification === "chain" || classification === "likely_franchise",
  }
}

function normalizedMarketTerms(location: string) {
  const normalized = location.toLowerCase().replace(/[–—]/g, "-").replace(/\b(?:metroplex|metro area|area)\b/g, " ").trim()
  const city = normalized.split(",")[0]?.trim() || normalized
  const state = normalized.split(",")[1]?.trim() || ""
  return unique([city, state, /\bdfw\b|dallas\s*fort\s*worth/.test(normalized) ? "dfw" : null], 5)
}

function termHits(terms: string[], values: string[]) {
  const normalizedValues = values.map((value) => value.toLowerCase())
  return terms.filter((term) => normalizedValues.some((value) => new RegExp(`\\b${escapeRegExp(term)}\\b`, "i").test(value)))
}

export function assessSignalGeography(input: {
  location: string
  marketType: "city" | "metro"
  address?: string | null
  officialTexts?: string[]
  corroboratingTexts?: string[]
  discoveryTexts?: string[]
  explicitOutsideMarket?: boolean
}) : SignalGeographicAssessment {
  const terms = normalizedMarketTerms(input.location)
  const officialHits = termHits(terms, [input.address || "", ...(input.officialTexts || [])])
  const corroboratingHits = termHits(terms, input.corroboratingTexts || [])
  const discoveryHits = termHits(terms, input.discoveryTexts || [])
  const evidence: string[] = []

  if (input.explicitOutsideMarket) {
    return { status: "outside_market", confidence: 90, verifiedCity: null, verifiedAddress: input.address || null, distanceEstimateMiles: null, evidence: ["Public evidence places the business outside the requested market."] }
  }
  if (officialHits.length > 0) evidence.push(`First-party location evidence matches: ${officialHits.join(", ")}.`)
  if (input.address && officialHits.length > 0) evidence.push("A public street-address signal supports the market match.")
  if (corroboratingHits.length > 0) evidence.push(`Corroborating public evidence matches: ${corroboratingHits.join(", ")}.`)
  if (discoveryHits.length > 0) evidence.push("Search-result text mentions the requested market; this is weak discovery evidence only.")

  if (officialHits.length > 0) {
    const confidence = clamp(72 + (input.address ? 12 : 0) + (corroboratingHits.length > 0 ? 10 : 0))
    return {
      status: "confirmed_in_market",
      confidence,
      verifiedCity: terms[0] || input.location,
      verifiedAddress: input.address || null,
      distanceEstimateMiles: null,
      evidence,
    }
  }
  if (corroboratingHits.length >= 2 || (corroboratingHits.length > 0 && discoveryHits.length > 0)) {
    return { status: "near_market", confidence: 58, verifiedCity: terms[0] || null, verifiedAddress: input.address || null, distanceEstimateMiles: null, evidence }
  }
  return { status: "unclear", confidence: discoveryHits.length > 0 ? 32 : 12, verifiedCity: null, verifiedAddress: input.address || null, distanceEstimateMiles: null, evidence }
}

export function calculateSignalConfidence(input: Omit<SignalConfidenceComponents, "final">) : SignalConfidenceComponents {
  const weighted =
    clamp(input.identity) * 0.22
    + clamp(input.officialSite) * 0.15
    + clamp(input.geography) * 0.14
    + clamp(input.contactAgreement) * 0.1
    + clamp(input.sourceDiversity) * 0.12
    + clamp(input.websiteCompleteness) * 0.1
    + clamp(input.chainCertainty) * 0.12
    + clamp(input.freshness) * 0.05
  const final = clamp(Math.min(97, weighted - clamp(input.contradictionPenalty, 0, 60) - clamp(input.providerFailurePenalty, 0, 40)))
  return { ...input, final }
}

export function calculateSignalOpportunity(input: {
  dimensions: SignalOpportunityDimensions
  confidence: number
  penalties?: Partial<Record<"uncertain_identity" | "uncertain_geography" | "probable_chain" | "excellent_website" | "no_contact" | "contradictory_evidence" | "insufficient_evidence" | "duplicate", number>>
}) : SignalOpportunityResult {
  const dimensions: SignalOpportunityDimensions = {
    mountlineFit: clamp(input.dimensions.mountlineFit, 0, 20),
    websiteOpportunity: clamp(input.dimensions.websiteOpportunity, 0, 20),
    contactConversionFriction: clamp(input.dimensions.contactConversionFriction, 0, 15),
    trustGap: clamp(input.dimensions.trustGap, 0, 15),
    demoPotential: clamp(input.dimensions.demoPotential, 0, 10),
    contactViability: clamp(input.dimensions.contactViability, 0, 10),
    operationalOpportunity: clamp(input.dimensions.operationalOpportunity, 0, 5),
    timingUrgency: clamp(input.dimensions.timingUrgency, 0, 5),
  }
  const positiveScore = Object.values(dimensions).reduce((sum, value) => sum + value, 0)
  const penalties = Object.fromEntries(
    Object.entries(input.penalties || {}).map(([key, value]) => [key, clamp(value || 0, 0, 100)]),
  )
  const penaltyTotal = Object.values(penalties).reduce((sum, value) => sum + value, 0)
  const opportunityScore = clamp(positiveScore - penaltyTotal)
  const rankingScore = clamp(opportunityScore * clamp(input.confidence) / 100)
  return { dimensions, penalties, positiveScore, opportunityScore, rankingScore }
}

export function qualifySignalLead(input: {
  entityStatus: SignalEntityStatus
  entityConfidence: number
  chainClassification: SignalChainClassification
  independenceConfidence: number
  geographicStatus: SignalGeographicStatus
  geographicConfidence: number
  evidenceConfidence: number
  opportunityScore: number
  hasContactRoute: boolean
  hasEvidenceLinks: boolean
  duplicate?: boolean
  incompleteResearch?: boolean
}) : SignalQualificationResult {
  const reasons: string[] = []
  if (!input.hasEvidenceLinks) reasons.push("No traceable public evidence link is available.")
  if (!input.hasContactRoute) reasons.push("No viable public contact route was verified.")
  if (!(["verified", "likely"] as SignalEntityStatus[]).includes(input.entityStatus) || input.entityConfidence < 65) reasons.push("Canonical business identity did not meet the 65-point quality gate.")
  if ((["chain", "likely_franchise", "uncertain"] as SignalChainClassification[]).includes(input.chainClassification) || input.independenceConfidence < 70) reasons.push("Independent-business evidence did not meet the 70-point quality gate.")
  if ((["unclear", "outside_market"] as SignalGeographicStatus[]).includes(input.geographicStatus) || input.geographicConfidence < 60) reasons.push("Geographic evidence did not meet the 60-point quality gate.")
  if (input.evidenceConfidence < 55) reasons.push("Overall evidence confidence did not meet the 55-point quality gate.")
  if (input.opportunityScore < 55) reasons.push("Opportunity score did not meet the 55-point quality gate.")
  if (input.duplicate) reasons.push("Candidate duplicates another resolved business identity.")
  if (input.incompleteResearch) reasons.push("Critical provider research is incomplete.")
  const incomplete = input.incompleteResearch || !input.hasEvidenceLinks
  return {
    status: reasons.length === 0 ? "qualified" : incomplete ? "incomplete" : "rejected",
    qualified: reasons.length === 0,
    reasons,
  }
}

export function signalDuplicateKey(input: {
  canonicalName?: string | null
  city?: string | null
  websiteUrl?: string | null
  phone?: string | null
}) {
  const hostname = normalizeQualityHostname(input.websiteUrl)
  const phone = normalizeQualityPhone(input.phone)
  if (hostname) return `domain:${hostname}`
  if (phone) return `phone:${phone}`
  return `name:${normalizeQualityName(input.canonicalName)}:${normalizeQualityName(input.city)}`
}

export const SIGNAL_KNOWN_CHAIN_FIXTURES = CHAIN_REGISTRY.map((chain) => chain.name)
