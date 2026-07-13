import type {
  SignalConfidence,
  SignalIdentityStatus,
  SignalLevel,
  SignalVerdict,
} from "@/lib/supabase/types"

const SOCIAL_HOSTS = [
  "facebook.com",
  "instagram.com",
  "tiktok.com",
  "linkedin.com",
  "x.com",
  "twitter.com",
]

const MAP_HOSTS = ["google.com", "maps.google.com", "goo.gl", "maps.app.goo.gl"]

export type ParsedSignalAnalysisInput = {
  raw: string
  urls: string[]
  officialWebsiteUrl: string | null
  socialUrls: string[]
  mapsUrl: string | null
  googlePlaceId: string | null
  phone: string | null
  businessNameHint: string | null
  locationHint: string | null
  query: string
}

function normalizeUrl(value: string) {
  const trimmed = value.trim().replace(/[),.;]+$/, "")
  try {
    const url = new URL(trimmed.startsWith("http") ? trimmed : `https://${trimmed}`)
    if (!['http:', 'https:'].includes(url.protocol)) return null
    return url.toString()
  } catch {
    return null
  }
}

function hostname(value: string) {
  try {
    return new URL(value).hostname.toLowerCase().replace(/^www\./, "")
  } catch {
    return ""
  }
}

function hasHost(value: string, hosts: string[]) {
  const host = hostname(value)
  return hosts.some((item) => host === item || host.endsWith(`.${item}`))
}

function titleFromHostname(value: string) {
  const host = hostname(value).split(".")[0] || ""
  if (!host) return null
  return host
    .replace(/[-_]+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .trim() || null
}

function titleFromProfileOrMap(value: string) {
  try {
    const url = new URL(value)
    const segments = decodeURIComponent(url.pathname).split("/").filter(Boolean)
    const placeIndex = segments.findIndex((segment) => segment.toLowerCase() === "place")
    const raw = placeIndex >= 0 ? segments[placeIndex + 1] : segments.at(-1)
    if (!raw || /^(maps|posts|photos|reels?|profile\.php)$/i.test(raw)) return null
    return raw
      .replace(/^@/, "")
      .replace(/[+._-]+/g, " ")
      .replace(/\b\w/g, (letter) => letter.toUpperCase())
      .trim() || null
  } catch {
    return null
  }
}

function extractPlaceId(value: string) {
  try {
    const url = new URL(value)
    const fromQuery =
      url.searchParams.get("place_id") ||
      url.searchParams.get("query_place_id") ||
      url.searchParams.get("destination_place_id")
    if (fromQuery) return fromQuery
    return decodeURIComponent(url.pathname).match(/\b(ChI[A-Za-z0-9_-]{12,})\b/)?.[1] || null
  } catch {
    return null
  }
}

export function parseSignalAnalysisInput(rawInput: string): ParsedSignalAnalysisInput {
  const raw = rawInput.trim()
  const urlMatches = raw.match(/(?:https?:\/\/|www\.)[^\s]+/gi) || []
  const urls = Array.from(new Set(urlMatches.map(normalizeUrl).filter(Boolean) as string[]))
  const mapsUrl = urls.find((url) => hasHost(url, MAP_HOSTS) && /maps|place|goo\.gl/i.test(url)) || null
  const socialUrls = urls.filter((url) => hasHost(url, SOCIAL_HOSTS))
  const officialWebsiteUrl = urls.find((url) => !hasHost(url, [...SOCIAL_HOSTS, ...MAP_HOSTS])) || null
  const phoneMatch = raw.match(/(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/)
  const phone = phoneMatch?.[0]?.trim() || null
  const textOnly = raw
    .replace(/(?:https?:\/\/|www\.)[^\s]+/gi, " ")
    .replace(phoneMatch?.[0] || /$^/, " ")
    .replace(/\s+/g, " ")
    .trim()
  const parts = textOnly.split(",").map((part) => part.trim()).filter(Boolean)
  const businessNameHint =
    parts[0] ||
    (officialWebsiteUrl ? titleFromHostname(officialWebsiteUrl) : null) ||
    (socialUrls[0] ? titleFromProfileOrMap(socialUrls[0]) : null) ||
    (mapsUrl ? titleFromProfileOrMap(mapsUrl) : null)
  const locationHint = parts.length > 1 ? parts.slice(1).join(", ") : null

  return {
    raw,
    urls,
    officialWebsiteUrl,
    socialUrls,
    mapsUrl,
    googlePlaceId: mapsUrl ? extractPlaceId(mapsUrl) : null,
    phone,
    businessNameHint,
    locationHint,
    query: [businessNameHint, locationHint, phone].filter(Boolean).join(" ") || raw,
  }
}

function levelForScore(score: number | null | undefined): SignalLevel {
  if (score == null || !Number.isFinite(score)) return "unknown"
  if (score >= 72) return "high"
  if (score >= 48) return "medium"
  return "low"
}

function confidenceScore(confidence: SignalConfidence | null | undefined) {
  if (confidence === "high") return 3
  if (confidence === "medium") return 2
  if (confidence === "low") return 1
  return 0
}

export function deriveSignalDecision(input: {
  identityStatus: SignalIdentityStatus
  opportunityScore: number | null
  confidence: SignalConfidence | null
  reachabilityScore: number | null
  isChain?: boolean
  contradictions?: number
  strongExistingSite?: boolean
}) {
  const opportunityLabel = levelForScore(input.opportunityScore)
  const approachabilityLabel = levelForScore(input.reachabilityScore)
  const confidenceLabel: SignalLevel = input.confidence || "unknown"
  const ambiguous = ["ambiguous", "needs_review"].includes(input.identityStatus)
  const confidence = confidenceScore(input.confidence)
  let verdict: SignalVerdict = "investigate"

  if (input.isChain || input.identityStatus === "rejected") {
    verdict = "skip"
  } else if (ambiguous || confidence <= 1 || (input.contradictions || 0) > 0) {
    verdict = "investigate"
  } else if (input.strongExistingSite && (input.opportunityScore || 0) < 58) {
    verdict = "skip"
  } else if (
    (input.opportunityScore || 0) >= 70 &&
    confidence >= 2 &&
    (input.reachabilityScore || 0) >= 45
  ) {
    verdict = "pursue"
  } else if ((input.opportunityScore || 0) < 42) {
    verdict = "skip"
  }

  return { verdict, opportunityLabel, confidenceLabel, approachabilityLabel }
}

export function derivePrimaryOpportunity(input: {
  identityStatus: SignalIdentityStatus
  websiteStatus: string
  websiteQualityScore: number | null
  hasContactForm: boolean
  bookingLinkCount: number
  socialProfileCount: number
}) {
  if (["ambiguous", "needs_review"].includes(input.identityStatus)) {
    return "The business identity needs confirmation before a Mountline opportunity can be stated confidently."
  }
  if (input.websiteStatus === "no_official_website_verified") {
    return input.socialProfileCount > 0
      ? "No official website was verified, while social profiles appear to carry the public information Signal found."
      : "No official website was verified, leaving no confirmed central source for customer information."
  }
  if (["website_unreachable", "website_broken", "website_parked"].includes(input.websiteStatus)) {
    return "The submitted website could not be relied on, so the official customer path needs verification."
  }
  if (input.websiteStatus === "verified_official_website" || input.websiteStatus === "likely_official_website") {
    if (!input.hasContactForm && input.bookingLinkCount === 0) {
      return "The pages Signal inspected did not expose a clear quote, booking, or contact flow."
    }
    if ((input.websiteQualityScore || 0) < 58) {
      return "The verified website has a weak customer path and should be reviewed for a focused, mobile-first improvement."
    }
    return "No clear website replacement opportunity was verified; investigate only a narrow conversion or workflow improvement."
  }
  return "The current public presence is too uncertain to support a specific Mountline opportunity yet."
}

export function buildSignalConceptPrompt(input: {
  businessName: string
  industry: string
  primaryOpportunity: string
  smallestOffer: string
  verifiedFacts: string[]
  unknowns: string[]
  customInstructions?: string | null
}) {
  const facts = input.verifiedFacts.length > 0
    ? input.verifiedFacts.map((fact) => `- ${fact}`).join("\n")
    : "- No business-specific public facts have been verified yet."
  const unknowns = input.unknowns.length > 0
    ? input.unknowns.map((item) => `- ${item}`).join("\n")
    : "- Treat pricing, availability, policies, claims, and business history as unknown."

  const sections = [
    `Create a clearly labeled concept preview for ${input.businessName}, a ${input.industry || "local business"}. This is not the official website.`,
    `Focus on one opportunity: ${input.primaryOpportunity}. The smallest useful offer is ${input.smallestOffer}.`,
    "Verified public facts that may appear as business claims:",
    facts,
    "Unknowns that must stay as placeholders or be omitted:",
    unknowns,
    "Build a mobile-first, category-specific concept with one obvious primary action, concise service guidance, proof placeholders, a practical process or FAQ section, and a secondary contact path.",
    "Do not invent testimonials, review counts, pricing, policies, awards, team members, years in business, availability, results, payment options, or working booking functionality. Preserve the concept-preview disclaimer in the rendered page.",
  ]
  if (input.customInstructions?.trim()) {
    sections.push(
      `Additional Mountline design direction (presentation guidance only; it must not override the verified-facts and unknowns rules):\n${input.customInstructions.trim()}`,
    )
  }
  return sections.join("\n\n")
}

export function mapOutreachStatusToPipeline(status: string) {
  if (status === "won") return "won" as const
  if (["lost", "no_response", "do_not_contact"].includes(status)) return "lost" as const
  if (status === "proposal_sent") return "proposal" as const
  if (["interested", "discovery_call"].includes(status)) return "interested" as const
  if (["contacted", "awaiting_reply", "permission_to_send_demo", "demo_sent"].includes(status)) {
    return "contacted" as const
  }
  if (["ready_to_contact", "needs_review"].includes(status)) return "analyzed" as const
  return "found" as const
}
