import "server-only"

import { randomUUID } from "node:crypto"
import { z } from "zod"
import {
  addSignalCandidateSuppression,
  findSignalCandidateSuppression,
} from "./alerts"
import { runSignalChainClassificationAi, runSignalLeadSalesPackAi } from "./ai"
import {
  getSignalAiProviderSetup,
  getSignalMarketRuntimeConfig,
  getSignalResearchProviderMode,
  scrapeFirecrawlPage,
  searchSignalTavilyPublicWeb,
  type SignalProviderSearchResult,
} from "./providers"
import {
  classifySignalResearchUrl,
  normalizeSignalBusinessName,
  normalizeSignalHostname,
  normalizeSignalPhone,
} from "./research"
import { normalizeSignalCity } from "./classification"
import {
  assessSignalChain,
  assessSignalEntityName,
  assessSignalGeography,
  calculateSignalConfidence,
  calculateSignalOpportunity,
  qualifySignalLead,
  resolveSignalDiscoveryEntity,
  signalDuplicateKey,
  type SignalChainClassification,
  type SignalEntityStatus,
  type SignalGeographicStatus,
} from "./quality"
import { scanSignalWebsite, type SignalWebsiteScan } from "./website"
import { selectSignalSalesPack } from "./sales-grounding"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalConfidence,
  SignalJson,
  SignalRun,
  SignalRunEvent,
  SignalRunLead,
  SignalRunLeadEvidence,
  SignalRunLeadStatus,
  SignalRunStatus,
  SignalRunWebsiteStatus,
} from "@/lib/supabase/types"

const LEAD_LIMITS = [5, 10, 15, 25] as const
const ACTIVE_STATUSES = new Set<SignalRunStatus>([
  "queued",
  "discovering",
  "checking",
  "scoring",
  "writing_packs",
  "ranking",
])
const TERMINAL_STATUSES = new Set<SignalRunStatus>(["completed", "partial", "failed"])

const INDUSTRY_OPTIONS = [
  "best_opportunities",
  "barbers_salons",
  "groomers_pet_services",
  "auto_detailing",
  "contractors_home_services",
  "med_spas_wellness",
  "restaurants_local_food",
  "churches_nonprofits",
  "commercial_cleaning",
  "custom",
] as const

type IndustryFocus = (typeof INDUSTRY_OPTIONS)[number]
type JsonObject = Record<string, unknown>
type DiscoveryResult = Pick<SignalProviderSearchResult, "title" | "url" | "snippet" | "source_label">
type MutableRun = SignalRun & {
  execution_cursor?: SignalJson
  lease_expires_at?: string | null
  lease_token?: string | null
}
type MutableLead = SignalRunLead & {
  identity_key?: string | null
  normalized_business_name?: string | null
  normalized_hostname?: string | null
  normalized_phone?: string | null
  chain_evidence?: SignalJson
}

type ScoreDimension = {
  score: number | null
  confidence: number
  rationale: string
  evidence: string[]
  unknowns: string[]
}

type LeadScoreBreakdown = {
  fit: ScoreDimension
  website_opportunity: ScoreDimension
  contact_friction: ScoreDimension
  trust_gap: ScoreDimension
  walk_in_viability: ScoreDimension
  demo_potential: ScoreDimension
  operational_opportunity: ScoreDimension
  urgency: ScoreDimension
  confidence: ScoreDimension
  confidence_components: ReturnType<typeof calculateSignalConfidence>
  final: {
    score: number
    opportunity_composite: number
    opportunity_score: number
    ranking_score: number
    confidence_adjustment: number
    chain_adjustment: number
    method: string
  }
}

type ChainAssessment = {
  likelihood: number
  reason: string | null
  evidence: Array<{ signal: string; weight: number }>
  hasHardChainEvidence: boolean
  independentLikely: boolean
  independentConfidence: number
  classification: SignalChainClassification
  reasons: string[]
  locationCountEstimate: number | null
}

type WebsiteReview = {
  status: SignalRunWebsiteStatus
  summary: string
  evidence: string[]
  gaps: string[]
  objectiveSignals: {
    has_cta: boolean
    has_contact: boolean
    has_services: boolean
    has_booking: boolean
    has_trust_language: boolean
    scan_coverage: "none" | "limited" | "usable"
  }
}

function isWebsiteReview(value: unknown): value is WebsiteReview {
  const review = asObject(value)
  const signals = asObject(review.objectiveSignals)
  const status = review.status
  return (
    typeof status === "string"
    && ["no_site", "weak_site", "decent_site", "strong_site", "social_only", "unknown"].includes(status)
    && typeof review.summary === "string"
    && Array.isArray(review.evidence)
    && Array.isArray(review.gaps)
    && typeof signals.has_cta === "boolean"
    && typeof signals.has_contact === "boolean"
    && typeof signals.has_services === "boolean"
    && typeof signals.has_booking === "boolean"
    && typeof signals.has_trust_language === "boolean"
    && ["none", "limited", "usable"].includes(String(signals.scan_coverage))
  )
}

export type SignalLeadRunProviderSetup = {
  tavily: boolean
  firecrawl: boolean
  ai: boolean
  missing: string[]
  warnings: string[]
  researchProvider: string
  aiProvider: "gemini" | "openai" | "disabled"
}

const rawLeadRunSchema = z.object({
  market_type: z.enum(["city", "metro"]).optional(),
  marketType: z.enum(["city", "metro"]).optional(),
  location: z.string().trim().min(2, "Enter a city or metro area.").max(160),
  radius_miles: z.coerce.number().int().min(1).max(100).optional(),
  radiusMiles: z.coerce.number().int().min(1).max(100).optional(),
  lead_limit: z.coerce.number().int().optional(),
  leadLimit: z.coerce.number().int().optional(),
  industry_focus: z.enum(INDUSTRY_OPTIONS).optional(),
  industryFocus: z.enum(INDUSTRY_OPTIONS).optional(),
  custom_industry: z.string().trim().min(2).max(100).optional().nullable(),
  customIndustry: z.string().trim().min(2).max(100).optional().nullable(),
  notes: z.string().trim().max(1000).optional().nullable(),
})

export const signalLeadRunCreateSchema = rawLeadRunSchema
  .transform((value) => {
    const market_type = value.market_type || value.marketType || "city"
    const lead_limit = value.lead_limit || value.leadLimit || 5
    const industry_focus = value.industry_focus || value.industryFocus || "best_opportunities"
    const radius_miles = value.radius_miles || value.radiusMiles || (market_type === "city" ? 10 : 25)
    return {
      market_type,
      location: value.location.replace(/\s+/g, " ").trim(),
      radius_miles,
      lead_limit,
      industry_focus,
      custom_industry: value.custom_industry || value.customIndustry || null,
      notes: value.notes || null,
    }
  })
  .superRefine((value, ctx) => {
    if (!LEAD_LIMITS.includes(value.lead_limit as (typeof LEAD_LIMITS)[number])) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Choose 5, 10, 15, or 25 leads.", path: ["lead_limit"] })
    }
    if (value.industry_focus === "custom" && !value.custom_industry) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Enter a custom industry focus.", path: ["custom_industry"] })
    }
  })

export type SignalLeadRunCreateInput = z.output<typeof signalLeadRunCreateSchema>

function asObject(value: unknown): JsonObject {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonObject)
    : {}
}

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : ""
}

function asNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback
}

function clamp(value: number, minimum = 0, maximum = 100) {
  return Math.max(minimum, Math.min(maximum, Math.round(value)))
}

function unique(values: Array<string | null | undefined>, limit = 20) {
  return Array.from(new Set(values.map((value) => value?.trim() || "").filter(Boolean))).slice(0, limit)
}

function safeArray(value: unknown) {
  return Array.isArray(value) ? value : []
}

function toConfidence(value: number): SignalConfidence {
  if (value >= 70) return "high"
  if (value >= 40) return "medium"
  return "low"
}

function currentIso() {
  return new Date().toISOString()
}

function cleanText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || ""
}

function runCursor(run: MutableRun) {
  return asObject(run.execution_cursor)
}

function runSummary(run: MutableRun) {
  return asObject(run.summary)
}

function sourceText(input: {
  businessName?: string | null
  title?: string | null
  snippet?: string | null
  url?: string | null
  scan?: SignalWebsiteScan | null
  firecrawlExcerpt?: string | null
}) {
  return cleanText([
    input.businessName,
    input.title,
    input.snippet,
    input.url,
    input.scan?.page_title,
    input.scan?.meta_description,
    ...(input.scan?.headings || []),
    ...(input.scan?.service_language || []),
    ...(input.scan?.hours_location_language || []),
    input.firecrawlExcerpt,
  ].filter(Boolean).join(" ")).toLowerCase()
}

function parseDiscoveryResult(value: unknown): DiscoveryResult | null {
  const item = asObject(value)
  const url = asString(item.url)
  if (!/^https?:\/\//i.test(url)) return null
  return {
    title: asString(item.title) || url,
    url,
    snippet: asString(item.snippet),
    source_label: asString(item.source_label) || "Tavily public web result",
  }
}

function extractBusinessName(result: DiscoveryResult) {
  const title = cleanText(result.title)
    .replace(/\b(official\s+(site|website)|home\s*page|website)\b/gi, " ")
    .split(/\s[-–—|:]\s/)[0]
    .replace(/^\s*(best|top|find|contact)\s+/i, "")
    .trim()

  if (title && title.length >= 2 && title.length <= 180) return title

  const hostname = normalizeSignalHostname(result.url)
  const fallback = hostname.split(".")[0]?.replace(/[-_]+/g, " ").trim()
  return fallback ? fallback.replace(/\b\w/g, (letter) => letter.toUpperCase()) : "Unknown local business"
}

function isLikelyDirectoryOrListicleResult(result: DiscoveryResult) {
  const title = cleanText(result.title).toLowerCase()
  const snippet = cleanText(result.snippet).toLowerCase()
  const hostname = normalizeSignalHostname(result.url)
  const combined = `${title} ${snippet}`
  return (
    /\b(top|best)\s+\d+\b/.test(combined)
    || /\b(best|top)\b[^.]{0,80}\b(in|near)\b/.test(combined)
    || /\b(list of|business directory|local directory|find local businesses|compare local)\b/.test(combined)
    || /\b(near me|locations near you|read reviews)\b/.test(combined)
    || /(?:directory|business-listing|local-guide|reviews)\./.test(hostname)
  )
}

function extractPhones(value: string) {
  return unique(
    value.match(/(?:\+?1[.\s-]?)?(?:\(?\d{3}\)?[.\s-]?)\d{3}[.\s-]?\d{4}/g) || [],
    4,
  )
}

function extractEmails(value: string) {
  return unique(value.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi) || [], 4)
}

function extractStreetAddress(value: string) {
  const match = value.match(/\b\d{1,5}\s+[A-Za-z0-9.'#-]+(?:\s+[A-Za-z0-9.'#-]+){0,5}\s(?:Street|St\.?|Avenue|Ave\.?|Road|Rd\.?|Boulevard|Blvd\.?|Drive|Dr\.?|Lane|Ln\.?|Way|Suite|Ste\.?)\b/i)
  return match?.[0]?.replace(/\s+/g, " ").trim() || null
}

function sourceUrls(value: unknown) {
  return safeArray(value).filter((item): item is string => typeof item === "string" && /^https?:\/\//i.test(item))
}

function publicUrl(value: string | null | undefined) {
  try {
    const url = new URL(value || "")
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null
  } catch {
    return null
  }
}

function assessChainLikelihood(input: {
  businessName: string
  url?: string | null
  title?: string | null
  snippet?: string | null
  scan?: SignalWebsiteScan | null
  firecrawlExcerpt?: string | null
}) : ChainAssessment {
  const assessment = assessSignalChain({
    businessName: input.businessName,
    url: input.url,
    publicText: sourceText(input),
  })
  const evidence = assessment.reasons.map((signal) => ({
    signal,
    weight: assessment.deterministicBlock ? 100 : assessment.probability,
  }))

  return {
    likelihood: assessment.probability,
    reason: assessment.reasons.slice(0, 3).join("; ") || null,
    evidence,
    hasHardChainEvidence: assessment.deterministicBlock,
    independentLikely: assessment.classification === "independent" || assessment.classification === "likely_independent" || assessment.classification === "local_multi_location",
    independentConfidence: assessment.independenceConfidence,
    classification: assessment.classification,
    reasons: assessment.reasons,
    locationCountEstimate: assessment.locationCountEstimate,
  }
}

function industryLabel(focus: IndustryFocus, custom: string | null, text: string) {
  const detected: Array<[RegExp, string]> = [
    [/barber|salon|haircut|stylist/i, "Barber / salon"],
    [/groom|pet care|dog wash|boarding/i, "Groomer / pet service"],
    [/detail|ceramic coat|paint correction/i, "Auto detailing"],
    [/roof|plumb|electric|hvac|contractor|remodel|landscap/i, "Contractor / home service"],
    [/spa|wellness|massage|facial|esthetic/i, "Med spa / wellness"],
    [/restaurant|cafe|coffee|catering|kitchen|grill/i, "Restaurant / local food"],
    [/church|ministry|nonprofit|foundation/i, "Church / nonprofit"],
    [/commercial clean|janitorial|office clean/i, "Commercial cleaning"],
  ]
  const detectedLabel = detected.find(([expression]) => expression.test(text))?.[1]
  if (detectedLabel) return detectedLabel
  if (focus === "custom" && focusHasPublicIndustryEvidence(focus, custom, text)) {
    return custom || null
  }
  // The requested focus is a search preference, not proof of the business's
  // industry. Leave it unset until public wording supports a classification.
  return null
}

function discoveryTerms(focus: IndustryFocus, custom: string | null, leadLimit: number) {
  const map: Record<IndustryFocus, string[]> = {
    best_opportunities: ["barber shop", "auto detailing", "pet grooming", "home services contractor", "commercial cleaning"],
    barbers_salons: ["barber shop", "hair salon", "beauty studio"],
    groomers_pet_services: ["pet grooming", "dog grooming", "pet care"],
    auto_detailing: ["auto detailing", "mobile detailing", "ceramic coating"],
    contractors_home_services: ["home services contractor", "roofing contractor", "HVAC contractor", "plumber"],
    med_spas_wellness: ["med spa", "wellness studio", "massage therapy"],
    restaurants_local_food: ["local restaurant", "cafe", "catering"],
    churches_nonprofits: ["church", "local nonprofit", "community ministry"],
    commercial_cleaning: ["commercial cleaning", "janitorial service", "office cleaning"],
    custom: [custom || "local service business"],
  }
  const desired = leadLimit >= 15 ? 5 : leadLimit >= 10 ? 4 : 3
  return map[focus].slice(0, desired)
}

function buildDiscoveryQueries(run: SignalRun) {
  const focus = run.industry_focus as IndustryFocus
  const terms = discoveryTerms(focus, run.custom_industry, Math.max(run.lead_limit, 15))
  const patterns = [
    (term: string) => `independent ${term} in ${run.location}`,
    (term: string) => `local ${term} ${run.location} official website contact`,
    (term: string) => `owner-operated ${term} ${run.location}`,
    (term: string) => `family-owned ${term} near ${run.location}`,
    (term: string) => `${term} ${run.location} Facebook`,
    (term: string) => `${term} ${run.location} Instagram`,
    (term: string) => `best-rated local ${term} ${run.location} -directory`,
  ]
  const desiredQueries = Math.min(14, Math.max(9, Math.ceil(Math.min(75, Math.max(30, run.lead_limit * 8)) / 7)))
  const queries: string[] = []
  for (let patternIndex = 0; patternIndex < patterns.length; patternIndex += 1) {
    for (const term of terms) queries.push(patterns[patternIndex](term))
  }
  return unique(queries, desiredQueries)
}

function requestedMarketTerms(run: SignalRun) {
  const normalized = run.location
    .toLowerCase()
    .replace(/[–—]/g, "-")
    .replace(/\bmetroplex\b|\bmetro area\b|\barea\b/g, " ")
    .replace(/\s+/g, " ")
    .trim()
  if (run.market_type === "city") {
    const city = normalized.split(",")[0]?.trim() || normalized
    return city.length >= 2 ? [city] : []
  }
  const terms = normalized
    .split(/\s*(?:,|-|\/|\band\b)\s*/)
    .map((term) => term.trim())
    .filter((term) => term.length >= 3)
  if (/\bdfw\b|dallas\s*fort\s*worth/.test(normalized)) terms.push("dfw", "dallas", "fort worth")
  return unique(terms, 6)
}

function hasVerifiedMarketEvidence(run: SignalRun, publicText: string) {
  const terms = requestedMarketTerms(run)
  return {
    terms,
    verified: terms.some((term) => publicText.includes(term)),
  }
}

function businessIdentityMatches(left: string, right: string) {
  const leftNormalized = normalizeSignalBusinessName(left)
  const rightNormalized = normalizeSignalBusinessName(right)
  if (!leftNormalized || !rightNormalized) return false
  if (leftNormalized === rightNormalized) return true

  const leftWords = leftNormalized.split(" ").filter((word) => word.length >= 2)
  const rightWords = rightNormalized.split(" ").filter((word) => word.length >= 2)
  const shared = leftWords.filter((word) => rightWords.includes(word)).length
  const required = leftWords.length <= 2 ? leftWords.length : Math.max(2, Math.ceil(leftWords.length * 0.6))
  return shared >= required
}

function assessOfficialSiteIdentity(input: {
  businessName: string
  websiteUrl: string | null
  scan: SignalWebsiteScan | null
}) {
  if (!input.websiteUrl) {
    return {
      verified: true,
      evidence: [],
      reason: null,
    }
  }

  if (!input.scan || input.scan.broken_response) {
    return {
      verified: false,
      evidence: [],
      reason: "The likely official site could not be read well enough to verify that it belongs to this business.",
    }
  }

  const siteIdentitySignals = unique([
    input.scan.page_title,
    input.scan.open_graph_site_name,
    ...input.scan.json_ld_names,
    ...input.scan.logo_alt_text,
  ], 12)
  const matchedSignal = siteIdentitySignals.find((signal) => businessIdentityMatches(input.businessName, signal))
  if (matchedSignal) {
    return {
      verified: true,
      evidence: [`Official-site identity matched public site signal: ${matchedSignal}`],
      reason: null,
    }
  }

  const hostname = normalizeSignalHostname(input.websiteUrl).replace(/[^a-z0-9]/g, "")
  const businessCompact = normalizeSignalBusinessName(input.businessName).replace(/[^a-z0-9]/g, "")
  if (businessCompact.length >= 5 && hostname.includes(businessCompact)) {
    return {
      verified: true,
      evidence: ["Official-site hostname closely matches the public business name"],
      reason: null,
    }
  }

  return {
    verified: false,
    evidence: [],
    reason: "The page identity did not match the business name strongly enough to treat this URL as the official site.",
  }
}

function noteExclusionReason(input: {
  run: SignalRun
  website: WebsiteReview
  chain: ChainAssessment
  hasAddress: boolean
}) {
  const notes = input.run.notes?.toLowerCase() || ""
  if (/avoid[^.]{0,60}(polished|strong|modern) (site|website)/i.test(notes) && input.website.status === "strong_site") {
    return "Excluded because the run notes asked to avoid businesses with strong public sites."
  }
  if (/walk[ -]?in|walk into/i.test(notes) && !input.hasAddress) {
    return "Excluded because the run notes prioritize walk-ins but no public street address was verified."
  }
  if (/owner[ -]?operated|independent owner/i.test(notes) && !input.chain.independentLikely) {
    return "Excluded because the run notes prioritize owner-operated businesses and public evidence did not support that signal."
  }
  return null
}

function websiteReview(input: {
  websiteUrl: string | null
  scan: SignalWebsiteScan | null
  socialLinks: string[]
  firecrawlExcerpt: string | null
}) : WebsiteReview {
  const scan = input.scan
  const hasSite = Boolean(input.websiteUrl)
  const evidence: string[] = []
  const gaps: string[] = []

  if (!hasSite) {
    if (input.socialLinks.length > 0) {
      return {
        status: "social_only",
        summary: "No official website was found; public social context is the only visible web presence.",
        evidence: ["No likely official website in discovery results", "Public social link found"],
        gaps: ["No verified official site", "Customer path needs manual confirmation"],
        objectiveSignals: { has_cta: false, has_contact: false, has_services: false, has_booking: false, has_trust_language: false, scan_coverage: "none" },
      }
    }
    return {
      status: "no_site",
      summary: "No likely official website was found in the public discovery evidence.",
      evidence: ["No likely official website in discovery results"],
      gaps: ["Website presence is unverified", "Contact route needs manual confirmation"],
      objectiveSignals: { has_cta: false, has_contact: false, has_services: false, has_booking: false, has_trust_language: false, scan_coverage: "none" },
    }
  }

  if (!scan || scan.broken_response) {
    return {
      status: "unknown",
      summary: "A likely official website was found, but Signal could not safely read enough public content to assess it.",
      evidence: scan?.error ? [`Website scan issue: ${scan.error}`] : ["Website scan did not return usable content"],
      gaps: ["Website quality is not verified", "Review the public site manually before making a visual claim"],
      objectiveSignals: { has_cta: false, has_contact: false, has_services: false, has_booking: false, has_trust_language: false, scan_coverage: "none" },
    }
  }

  const loginWallText = `${scan.page_title || ""} ${scan.meta_description || ""} ${scan.headings.join(" ")}`
  if (/\b(sign in|log in|password|member portal|members only)\b/i.test(loginWallText)) {
    return {
      status: "unknown",
      summary: "The public page appears to be a login-gated or member-only surface, so Signal did not inspect private content.",
      evidence: ["Public page indicates a login-gated or member-only surface"],
      gaps: ["Website quality and customer flow remain unverified"],
      objectiveSignals: { has_cta: false, has_contact: false, has_services: false, has_booking: false, has_trust_language: false, scan_coverage: "none" },
    }
  }

  const hasCta = scan.cta_words.length > 0
  const hasContact = scan.visible_phones.length > 0 || scan.visible_emails.length > 0 || scan.pages.some((page) => page.links.some((link) => /contact/i.test(link)))
  const hasServices = scan.service_language.length > 0 || scan.headings.some((heading) => /service|what we do|our work/i.test(heading))
  const hasBooking = scan.booking_links.length > 0
  const text = sourceText({ scan, firecrawlExcerpt: input.firecrawlExcerpt })
  const hasTrust = /testimonial|trusted|award|serving since|years of experience|review/i.test(text)
  const coverage = scan.scanned_urls.length > 1 ? "usable" : "limited"

  if (scan.page_title) evidence.push("Public page title found")
  else gaps.push("No public page title was detected")
  if (scan.meta_description) evidence.push("Public page description found")
  else gaps.push("No public page description was detected")
  if (hasServices) evidence.push("Services are described publicly")
  else gaps.push("Services were not clearly described in the scanned public content")
  if (hasCta) evidence.push("A public next-step CTA was detected")
  else gaps.push("No clear public CTA was detected")
  if (hasContact) evidence.push("A public contact route was detected")
  else gaps.push("No public phone, email, or contact-path signal was detected")
  if (hasBooking) evidence.push("A public booking/request path was detected")
  if (hasTrust) evidence.push("Public trust language was detected")

  const gapsCount = gaps.length
  const signalsCount = [scan.page_title, scan.meta_description, hasServices, hasCta, hasContact, hasBooking].filter(Boolean).length
  const status: SignalRunWebsiteStatus = gapsCount >= 4
    ? "weak_site"
    : signalsCount >= 5 && coverage === "usable"
      ? "strong_site"
      : "decent_site"

  return {
    status,
    summary: status === "weak_site"
      ? "The public site has multiple objective clarity or contact-flow gaps. This is not a visual-design judgment."
      : status === "strong_site"
        ? "The public site shows several objective clarity and contact-flow signals; only a systems opportunity may remain."
        : "The public site has some useful customer-flow signals, with specific gaps worth verifying.",
    evidence,
    gaps,
    objectiveSignals: { has_cta: hasCta, has_contact: hasContact, has_services: hasServices, has_booking: hasBooking, has_trust_language: hasTrust, scan_coverage: coverage },
  }
}

function scoreDimension(input: Omit<ScoreDimension, "score"> & { score?: number | null }) : ScoreDimension {
  return {
    score: input.score == null ? null : clamp(input.score),
    confidence: clamp(input.confidence),
    rationale: input.rationale,
    evidence: unique(input.evidence, 6),
    unknowns: unique(input.unknowns, 6),
  }
}

function focusHasPublicIndustryEvidence(
  focus: IndustryFocus,
  customIndustry: string | null,
  publicText: string,
) {
  const cues: Record<Exclude<IndustryFocus, "best_opportunities" | "custom">, RegExp> = {
    barbers_salons: /barber|barbershop|salon|haircut|stylist/i,
    groomers_pet_services: /groom|pet care|dog wash|boarding/i,
    auto_detailing: /detail|ceramic coat|paint correction/i,
    contractors_home_services: /roof|plumb|electric|hvac|contractor|remodel|landscap/i,
    med_spas_wellness: /med spa|wellness|massage|facial|esthetic/i,
    restaurants_local_food: /restaurant|cafe|coffee|catering|kitchen|grill/i,
    churches_nonprofits: /church|ministry|nonprofit|foundation/i,
    commercial_cleaning: /commercial clean|janitorial|office clean/i,
  }
  if (focus === "best_opportunities") return false
  if (focus === "custom") {
    const terms = (customIndustry || "")
      .toLowerCase()
      .split(/[^a-z0-9]+/)
      .filter((term) => term.length >= 4)
    return terms.some((term) => publicText.includes(term))
  }
  return cues[focus].test(publicText)
}

function buildScoreBreakdown(input: {
  run: SignalRun
  lead: MutableLead
  chain: ChainAssessment
  website: WebsiteReview
  scan: SignalWebsiteScan | null
  hasAddress: boolean
  publicFacts: string[]
  entityConfidence?: number
  geographicConfidence?: number
  sourceCount?: number
  contactAgreement?: number
  providerFailure?: boolean
}) : LeadScoreBreakdown {
  const focus = input.run.industry_focus as IndustryFocus
  const scan = input.scan
  const publicText = sourceText({
    businessName: input.lead.business_name,
    url: input.lead.website_url,
    scan,
  })
  const hasPhone = Boolean(input.lead.phone)
  const hasEmail = Boolean(input.lead.public_email)
  const hasSocial = sourceUrls(input.lead.social_links).length > 0
  const isLocalEvidence = publicText.includes(input.run.location.toLowerCase().split(",")[0]?.trim() || "")
  const industryMatches = focusHasPublicIndustryEvidence(focus, input.run.custom_industry, publicText)

  const fitEvidence = [
    input.chain.independentLikely ? "Public wording supports an independent local business" : null,
    industryMatches ? "Public business text supports the selected industry focus" : null,
    isLocalEvidence ? `Public content references the requested market: ${input.run.location}` : null,
    hasPhone || hasEmail ? "A public business contact route was found" : null,
  ].filter(Boolean) as string[]
  const fit = scoreDimension({
    score: fitEvidence.length ? (input.chain.independentLikely ? 35 : 15) + (industryMatches ? 30 : 0) + (isLocalEvidence ? 20 : 0) + (hasPhone || hasEmail ? 15 : 0) : null,
    confidence: fitEvidence.length * 20 + (input.chain.independentLikely ? 15 : 0),
    rationale: fitEvidence.length ? "Fit is based on public local, independent, industry, and contact signals." : "Fit cannot be scored without a public local-business signal.",
    evidence: fitEvidence,
    unknowns: [!input.chain.independentLikely ? "Independent ownership is not confirmed" : null, !isLocalEvidence ? "Requested-market match is not publicly verified" : null].filter(Boolean) as string[],
  })

  const websiteEvidence = [...input.website.gaps, ...input.website.evidence]
  const websiteOpportunityScore = input.website.status === "no_site"
    ? 95
    : input.website.status === "social_only"
      ? 90
      : input.website.status === "weak_site"
        ? 76
        : input.website.status === "decent_site"
          ? clamp(input.website.gaps.length * 16 + 20)
          : input.website.status === "strong_site"
            ? clamp(input.website.gaps.length * 12 + 12)
            : null
  const websiteOpportunity = scoreDimension({
    score: websiteOpportunityScore,
    confidence: input.website.objectiveSignals.scan_coverage === "usable" ? 82 : input.website.status === "no_site" || input.website.status === "social_only" ? 55 : 38,
    rationale: input.website.summary,
    evidence: websiteEvidence,
    unknowns: input.website.status === "unknown" ? ["The public site could not be read safely enough for a quality judgment"] : ["Mobile visual quality is not inferred from HTML signals"],
  })

  const contactEvidence = [
    hasPhone ? "Public phone found" : null,
    hasEmail ? "Public email found" : null,
    input.website.objectiveSignals.has_booking ? "Public booking/request path found" : null,
    input.website.objectiveSignals.has_contact ? "Public contact path found" : null,
    input.website.status === "no_site" || input.website.status === "social_only" ? "No confirmed official site contact flow" : null,
  ].filter(Boolean) as string[]
  const contactPaths = [hasPhone, hasEmail, input.website.objectiveSignals.has_booking, input.website.objectiveSignals.has_contact].filter(Boolean).length
  const contactFriction = scoreDimension({
    score: contactEvidence.length ? clamp(88 - contactPaths * 19 + (input.website.status === "no_site" || input.website.status === "social_only" ? 12 : 0)) : null,
    confidence: contactEvidence.length ? 65 : 20,
    rationale: contactPaths <= 1 ? "Public customer contact paths look limited or unclear." : "Several public contact paths are visible, so friction appears lower.",
    evidence: contactEvidence,
    unknowns: ["Signal does not submit forms or test booking/payment flows"],
  })

  const trustProof = input.website.objectiveSignals.has_trust_language
  const trustGap = scoreDimension({
    score: trustProof && websiteOpportunity.score != null ? clamp((websiteOpportunity.score || 0) * 0.72 + 15) : null,
    confidence: trustProof ? 48 : 0,
    rationale: trustProof
      ? "Public trust language is present while the online customer-flow review still shows gaps."
      : "No public evidence supports a reputation-versus-presentation comparison.",
    evidence: trustProof ? ["Public trust/testimonial language detected", ...input.website.gaps.slice(0, 2)] : [],
    unknowns: trustProof ? ["Third-party review reputation was not collected"] : ["No public trust signal was found", "Third-party review reputation was not collected"],
  })

  const walkEvidence = [
    input.hasAddress ? "A public street-address pattern was found" : null,
    hasPhone ? "Public phone found" : null,
    isLocalEvidence ? `Public content references ${input.run.location}` : null,
  ].filter(Boolean) as string[]
  const walkIn = scoreDimension({
    score: input.hasAddress ? 55 + (hasPhone ? 20 : 0) + (isLocalEvidence ? 15 : 0) : null,
    confidence: input.hasAddress ? 72 : 0,
    rationale: input.hasAddress ? "Walk-in practicality is based on a public address signal, market context, and contact availability." : "No public street address was verified, so walk-in practicality remains unknown.",
    evidence: walkEvidence,
    unknowns: input.hasAddress ? ["Hours and a decision-maker's on-site availability need manual verification"] : ["No public street address was verified"],
  })

  const visualIndustry = /barber|salon|detail|spa|wellness|restaurant|food|groom/i.test(input.lead.industry || "")
  const demoEvidence = [
    visualIndustry ? "Industry can benefit from a visual concept preview" : null,
    websiteOpportunity.score != null && websiteOpportunity.score >= 60 ? "Public customer-flow gaps make a concept preview easy to explain" : null,
    input.website.objectiveSignals.has_services ? "Known services can anchor a factual concept preview" : null,
  ].filter(Boolean) as string[]
  const demoPotential = scoreDimension({
    score: demoEvidence.length ? (visualIndustry ? 35 : 15) + (websiteOpportunity.score != null && websiteOpportunity.score >= 60 ? 35 : 10) + (input.website.objectiveSignals.has_services ? 20 : 0) : null,
    confidence: demoEvidence.length * 20,
    rationale: demoEvidence.length ? "Demo potential is tied to known services and a concrete public-site gap, not invented brand facts." : "A concept would need more verified business context before it would feel custom.",
    evidence: demoEvidence,
    unknowns: ["Use placeholders for services, pricing, reviews, and logos that are not verified"],
  })

  const operationalEvidence = [
    /quote|estimate|request service|service request/i.test(publicText) ? "Public quote or service-request language was detected" : null,
    !input.website.objectiveSignals.has_booking && /appointment|booking|schedule|quote|estimate/i.test(publicText) ? "Customer action language appears without a verified first-party workflow" : null,
    input.website.status === "social_only" ? "Customer flow appears to depend on a social platform" : null,
  ].filter(Boolean) as string[]
  const operationalOpportunity = scoreDimension({
    score: operationalEvidence.length ? clamp(35 + operationalEvidence.length * 20) : 15,
    confidence: operationalEvidence.length ? 62 : 28,
    rationale: operationalEvidence.length
      ? "A small customer-flow or request-routing improvement is supported by public wording."
      : "No specific operational-system opportunity is verified; keep the first offer focused on the visible customer path.",
    evidence: operationalEvidence,
    unknowns: ["Signal does not submit forms, place bookings, or inspect private operations"],
  })

  const urgencySignals = [
    /new location|now open|opening soon|now booking|limited time|hiring/i.test(publicText) ? "Public time-sensitive language was detected" : null,
    /request (a )?quote|book now|call now/i.test(publicText) && !input.website.objectiveSignals.has_booking ? "Conversion language appears without a verified booking/request path" : null,
  ].filter(Boolean) as string[]
  const urgency = scoreDimension({
    score: urgencySignals.length ? 45 + urgencySignals.length * 20 : null,
    confidence: urgencySignals.length ? 48 : 0,
    rationale: urgencySignals.length ? "Urgency is limited to a specific public trigger or visible conversion gap." : "No near-term public urgency signal was found.",
    evidence: urgencySignals,
    unknowns: urgencySignals.length ? ["Business priorities and timing need a direct conversation"] : ["No near-term public urgency signal was found"],
  })

  const factualEvidence = unique([
    ...input.publicFacts,
    ...input.website.evidence,
    input.chain.reason,
  ], 20)
  const confidenceComponents = calculateSignalConfidence({
    identity: input.entityConfidence ?? 45,
    officialSite: scan && !scan.broken_response ? 88 : input.lead.website_url ? 28 : hasSocial ? 42 : 18,
    geography: input.geographicConfidence ?? (isLocalEvidence ? 45 : 15),
    contactAgreement: input.contactAgreement ?? (hasPhone || hasEmail ? 55 : 15),
    sourceDiversity: clamp((input.sourceCount || sourceUrls(input.lead.source_urls).length) * 22, 15, 88),
    websiteCompleteness: input.website.objectiveSignals.scan_coverage === "usable" ? 90 : input.website.objectiveSignals.scan_coverage === "limited" ? 62 : 22,
    chainCertainty: input.chain.classification === "independent" || input.chain.classification === "likely_independent"
      ? input.chain.independentConfidence
      : input.chain.classification === "chain" || input.chain.classification === "likely_franchise"
        ? input.chain.likelihood
        : 35,
    freshness: 92,
    contradictionPenalty: 0,
    providerFailurePenalty: input.providerFailure ? 12 : 0,
  })
  const confidenceScore = confidenceComponents.final
  const confidence = scoreDimension({
    score: confidenceScore,
    confidence: 100,
    rationale: "Confidence measures the amount and quality of public evidence, not confidence in an outcome.",
    evidence: factualEvidence.slice(0, 8),
    unknowns: [
      !scan || scan.broken_response ? "No usable official-site scan" : null,
      !input.hasAddress ? "No public street address was verified" : null,
      !hasPhone && !hasEmail ? "No direct public contact detail was verified" : null,
    ].filter(Boolean) as string[],
  })

  const opportunity = calculateSignalOpportunity({
    dimensions: {
      mountlineFit: Math.round((fit.score || 0) * 0.2),
      websiteOpportunity: Math.round((websiteOpportunity.score || 0) * 0.2),
      contactConversionFriction: Math.round((contactFriction.score || 0) * 0.15),
      trustGap: Math.round((trustGap.score || 0) * 0.15),
      demoPotential: Math.round((demoPotential.score || 0) * 0.1),
      contactViability: Math.round((walkIn.score ?? (hasPhone || hasEmail ? 55 : 0)) * 0.1),
      operationalOpportunity: Math.round((operationalOpportunity.score || 0) * 0.05),
      timingUrgency: Math.round((urgency.score || 0) * 0.05),
    },
    confidence: confidenceScore,
    penalties: {
      uncertain_identity: (input.entityConfidence ?? 0) < 65 ? 35 : 0,
      uncertain_geography: (input.geographicConfidence ?? 0) < 60 ? 25 : 0,
      probable_chain: input.chain.classification === "chain" || input.chain.classification === "likely_franchise" ? 100 : input.chain.classification === "uncertain" ? 24 : 0,
      excellent_website: input.website.status === "strong_site" ? 18 : 0,
      no_contact: !hasPhone && !hasEmail && !input.hasAddress && !input.website.objectiveSignals.has_contact && !input.website.objectiveSignals.has_booking ? 20 : 0,
      insufficient_evidence: confidenceScore < 55 ? 30 : 0,
    },
  })
  const confidenceAdjustment = Number((confidenceScore / 100).toFixed(2))
  const chainAdjustment = opportunity.penalties.probable_chain ? 0 : 1

  return {
    fit,
    website_opportunity: websiteOpportunity,
    contact_friction: contactFriction,
    trust_gap: trustGap,
    walk_in_viability: walkIn,
    demo_potential: demoPotential,
    operational_opportunity: operationalOpportunity,
    urgency,
    confidence,
    confidence_components: confidenceComponents,
    final: {
      score: opportunity.rankingScore,
      opportunity_composite: opportunity.positiveScore,
      opportunity_score: opportunity.opportunityScore,
      ranking_score: opportunity.rankingScore,
      confidence_adjustment: confidenceAdjustment,
      chain_adjustment: chainAdjustment,
      method: "Eight-dimension opportunity score with explicit penalties, multiplied by calibrated evidence confidence.",
    },
  }
}

function communicationProfile(input: {
  lead: MutableLead
  website: WebsiteReview
  scan: SignalWebsiteScan | null
}) {
  const text = sourceText({ businessName: input.lead.business_name, url: input.lead.website_url, scan: input.scan })
  const tags: Array<{ tag: string; label: string; evidence: string[]; confidence: "low" | "medium" | "high" }> = []
  const add = (tag: string, label: string, expression: RegExp, confidence: "low" | "medium" | "high" = "medium") => {
    if (expression.test(text)) tags.push({ tag, label, evidence: [label], confidence })
  }

  add("likely_owner_operated", "Public wording mentions local, family, or owner operation", /locally owned|family owned|owner-operated|owner operated/i, "medium")
  add("relationship_driven", "Public wording emphasizes community, family, or relationships", /community|family|neighbors|locally owned|serving .* since/i, "medium")
  add("appointment_based", "Public booking or appointment language was detected", /appointment|book(ing)?|schedule/i, "high")
  add("phone_first", "A public phone route is more visible than a verified booking path", /call (us|now|today)|phone/i, "medium")
  add("operations_focused", "Public quote, estimate, or service-request language was detected", /quote|estimate|request service|service request/i, "medium")
  if (sourceUrls(input.lead.social_links).some((url) => /facebook\.com/i.test(url)) && !input.lead.website_url) {
    tags.push({ tag: "facebook_first", label: "Facebook is visible without a confirmed official site", evidence: ["Public Facebook link found", "No confirmed official site"], confidence: "medium" })
  }
  if (["weak_site", "no_site", "social_only"].includes(input.website.status)) {
    tags.push({ tag: "needs_visual_proof", label: "A simple visual concept may explain the opportunity better than technical language", evidence: [input.website.summary], confidence: "medium" })
  }
  if (["no_site", "social_only"].includes(input.website.status)) {
    tags.push({ tag: "low_digital_complexity", label: "The visible public presence is simple; lead with one clear customer path", evidence: [input.website.summary], confidence: "medium" })
  }

  return {
    tags: tags.slice(0, 7),
    guidance: tags.some((tag) => tag.tag === "needs_visual_proof")
      ? "Lead with a visual, factual concept preview and one customer-flow improvement."
      : tags.some((tag) => tag.tag === "operations_focused")
        ? "Lead with practical calls, estimates, or next-step clarity rather than design language."
        : "Use a direct, respectful explanation tied to the public evidence.",
    disclaimer: "These are communication hypotheses based only on public business signals, not personal traits.",
  }
}

function topReasons(scores: LeadScoreBreakdown, website: WebsiteReview, chain: ChainAssessment) {
  const candidates = [
    ...scores.fit.evidence,
    ...scores.website_opportunity.evidence,
    ...scores.contact_friction.evidence,
    ...scores.demo_potential.evidence,
    chain.independentLikely ? "Independent-local signals are stronger than chain signals" : null,
  ].filter(Boolean) as string[]
  return unique(candidates, 5)
}

function salesPlan(input: {
  lead: MutableLead
  website: WebsiteReview
  scores: LeadScoreBreakdown
  profile: JsonObject
}) {
  const walkIn = input.scores.walk_in_viability.score != null && input.scores.walk_in_viability.score >= 65
  const call = Boolean(input.lead.phone)
  const email = Boolean(input.lead.public_email)
  const bestFirstAction = walkIn ? "walk_in" : call ? "call" : email ? "text_email" : "research_more"
  const offer = input.website.status === "no_site" || input.website.status === "social_only"
    ? "Simple starter website with a clear call, services, and contact path; optional care can stay lightweight."
    : input.website.status === "weak_site"
      ? "Website refresh with clearer services, calls-to-action, and a quote or appointment path."
      : "Customer-flow review: tighten the next step, quote/booking path, and proof customers need before calling."
  const pitch = input.website.status === "no_site" || input.website.status === "social_only"
    ? "Keep the existing social presence. Add one clear home for services, calls, and trust."
    : input.website.status === "weak_site"
      ? "The public business may be stronger than its current customer path shows."
      : "The site has a foundation; the pitch is cleaner customer flow rather than a needless redesign."
  const pricingAngle = input.website.status === "no_site" || input.website.status === "social_only"
    ? "Offer a concept preview first, then position a focused starter site around $900–$1,800 if the confirmed scope stays lean; optional care stays separate."
    : input.website.status === "weak_site"
      ? "Position a scoped website refresh around $1,800–$3,500 after confirming pages, assets, and the one customer flow that matters."
      : "Lead with a focused $450–$950 customer-flow improvement; quote a broader rebuild only if the business confirms a larger need."
  return {
    recommended_offer: offer,
    pitch_angle: pitch,
    pricing_angle: pricingAngle,
    best_first_action: bestFirstAction,
    next_step_checklist: [
      "Open the public evidence links before contact.",
      input.lead.address ? "Verify the address and walk-in timing manually." : "Verify an address or preferred contact route manually.",
      "Use only the public facts in the opening conversation.",
      "Offer a concept preview only as a clearly labeled Mountline concept, never as an official site.",
    ],
  }
}

function fallbackSalesPack(input: {
  lead: MutableLead
  website: WebsiteReview
  scores: LeadScoreBreakdown
  reasons: string[]
  plan: ReturnType<typeof salesPlan>
}) {
  const name = input.lead.business_name
  const location = [input.lead.city, input.lead.state].filter(Boolean).join(", ") || "the local area"
  const raw = asObject(input.lead.raw_research)
  const storedScan = asObject(raw.scan)
  const branding = asObject(raw.firecrawl_branding)
  const brandingColorValue = asObject(branding.colors).primary
  const brandingColors = unique(
    typeof brandingColorValue === "string"
      ? [brandingColorValue]
      : safeArray(brandingColorValue).filter((item): item is string => typeof item === "string"),
    4,
  )
  const services = unique(safeArray(storedScan.service_language).filter((item): item is string => typeof item === "string"), 4)
  const facts = unique([
    ...input.reasons,
    ...input.website.evidence,
    ...services,
  ], 6)
  const specificFact = services[0]
    || input.reasons.find((reason) => !/^independent|^official-site identity/i.test(reason))
    || input.website.evidence[0]
    || "a public local-business identity and contact route were verified"
  const verifiedServices = services.length
    ? `Verified service wording: ${services.join(" | ")}`
    : "Services are not verified; use clearly labeled placeholders until confirmed."
  const painPoints: Array<{ statement: string; basis: "evidence" | "hypothesis" }> = input.website.gaps
    .slice(0, 3)
    .map((statement) => ({ statement, basis: "evidence" }))
  if (painPoints.length === 0) {
    painPoints.push({ statement: "Ask whether the current customer path answers the questions callers ask most often.", basis: "hypothesis" })
  }
  const strongestAngle = input.website.status === "no_site" || input.website.status === "social_only"
    ? `Give ${name} one clear home for its verified services and contact route without replacing the social presence that already works.`
    : input.website.status === "weak_site"
      ? `Make the next customer step clearer around ${input.website.gaps[0]?.toLowerCase() || "services and contact"}, while respecting the business's existing reputation.`
      : `Keep the existing site foundation and improve only ${input.website.gaps[0]?.toLowerCase() || "the clearest customer-flow friction"}.`
  const channel = input.plan.best_first_action === "walk_in" ? "walk-in" : input.plan.best_first_action === "call" ? "call" : "text or email"
  const questions = unique([
    input.website.objectiveSignals.has_booking
      ? "Is the current booking path working smoothly, or do customers still call before they can choose the right service?"
      : "When someone is ready to start, would you rather have them call directly or send the details first?",
    services.length
      ? `Which of the publicly listed services—${services.slice(0, 2).join(" or ")}—usually needs the most explanation before a customer commits?`
      : "Which service or request usually creates the most back-and-forth before a customer is ready?",
    "Are you trying to create more demand right now, or mainly make the process easier for people already reaching out?",
    input.lead.phone ? "Do most new customers come through referrals, Google, social, or the public phone number?" : "Where do most serious new inquiries start today?",
  ], 4)
  const designDirection = /barber|salon/i.test(input.lead.industry || "")
    ? "Use an editorial, confident barber/salon layout with service clarity, strong work imagery placeholders, and an appointment-first mobile CTA."
    : /groom|pet/i.test(input.lead.industry || "")
      ? "Use a warm, trustworthy pet-service layout with friendly image treatment, service cards, safety/trust placeholders, and a call-or-book mobile path."
      : /detail|auto/i.test(input.lead.industry || "")
        ? "Use a high-contrast automotive layout with large work imagery placeholders, package clarity, vehicle/service fit, and a quote-first mobile CTA."
        : /contract|roof|plumb|hvac|home service/i.test(input.lead.industry || "")
          ? "Use a practical home-service layout with service-area clarity, proof placeholders, emergency/estimate routing, and a prominent mobile call CTA."
          : /church|nonprofit|ministry/i.test(input.lead.industry || "")
            ? "Use a calm, welcoming community layout with visit information, programs, location/hours, and a low-friction plan-a-visit CTA."
            : /spa|wellness/i.test(input.lead.industry || "")
              ? "Use a refined, restrained wellness layout with service education, trust placeholders, and an appointment-led customer path."
              : /restaurant|food|cafe/i.test(input.lead.industry || "")
                ? "Use an appetite-led local-food layout with hours/location, menu placeholders, strong public-image treatment, and call/order/reservation CTAs only when verified."
                : "Use a restrained local-service layout centered on service clarity, trust, and one obvious customer next step."
  const opener = `Hey, Luke with Mountline. ${name} stood out because ${specificFact.toLowerCase()}. We noticed ${input.website.gaps[0]?.toLowerCase() || "one part of the customer path that may be worth simplifying"}, so we mocked up a small concept because it is easier to show than explain.`
  return {
    lead_briefing: `${name} is a verified ${input.lead.industry || "local business"} in ${location}. Public evidence shows ${specificFact.toLowerCase()}. Signal's strongest honest angle is: ${strongestAngle} Verify ${input.scores.fit.unknowns[0]?.toLowerCase() || "the preferred contact flow"} before outreach. Best first channel: ${channel}.`,
    strongest_honest_angle: strongestAngle,
    fifteen_second_opener: opener,
    why_this_fits: `${name} is worth a closer look because ${specificFact.toLowerCase()}. Signal is not assuming a problem beyond stored public evidence.`,
    what_stood_out: facts,
    likely_pain_points: painPoints,
    recommended_offer: input.plan.recommended_offer,
    pricing_angle: input.plan.pricing_angle,
    pitch_angle: input.plan.pitch_angle,
    best_first_action: input.plan.best_first_action,
    walk_in_script: [
      `Greeting: “${opener}”`,
      "Permission: “Is now a bad time, or can we show the idea in thirty seconds?”",
      `After the concept: “The part we would keep focused is ${strongestAngle.toLowerCase()}”`,
      `Discovery: “${questions[0]}” “${questions[1]}” “${questions[2]}”`,
      `Offer: “The smallest useful version is ${input.plan.recommended_offer.toLowerCase()} ${input.plan.pricing_angle}”`,
      "Soft close: “If that direction makes sense, what is the best number or email for sending the concept and a one-page scope?”",
      "Busy exit: “No problem—we can leave the link and get out of the way. If it is not useful, no follow-up pressure.”",
    ].join("\n\n"),
    call_script: `“Hey, Luke with Mountline—did we catch you with thirty seconds? ${name} came up because ${specificFact.toLowerCase()}. We noticed ${input.website.gaps[0]?.toLowerCase() || "a possible customer-flow simplification"} and mocked up one focused idea. This is not a pitch for a giant rebuild. Would a quick explanation be useful, or should we send the concept instead?”`,
    discovery_questions: questions,
    follow_up_message: `Mountline concept for ${name}: ${strongestAngle} This is a clearly labeled preview, not finished or official work.`,
    follow_up_text: `Thanks for the quick conversation about ${name}. Here is the Mountline concept centered on ${strongestAngle.toLowerCase()} It is a preview, not a finished site. If the direction is useful, we can turn it into a small, clear scope.`,
    follow_up_email: `Subject: The ${name} concept we discussed\n\nThanks for taking a look. The concept is built around one thing: ${strongestAngle}\n\nIt uses only the public facts we could verify and keeps unknown details as placeholders. If the direction feels right, Mountline can send a short scope for the smallest useful version. No generic rebuild pitch attached.`,
    objection_handling: [
      { objection: "Who are you with?", response: "Mountline. We build focused websites and customer flows for local businesses, and this idea was prepared specifically for your public setup." },
      { objection: "How did you find us?", response: `Through public local-business research. ${name} stood out because ${specificFact.toLowerCase()}.` },
      { objection: "We already have Facebook.", response: "Facebook can keep doing what it does. A website would not replace it; it gives customers one simple place to see services, call, and understand what to do next." },
      { objection: "We already get enough business.", response: "Then more traffic is not the pitch. The useful question is whether the current process can save time for the customers and team already reaching out." },
      { objection: "Technical setup is not our thing.", response: "That is exactly why the first version stays simple. Mountline handles the setup and keeps the business focused on one clear customer action." },
      { objection: "We already have a website.", response: "That may be enough. The idea is only to review the next step a customer sees and see whether calls, quotes, or booking could be clearer—not to push a rebuild that is not needed." },
      { objection: "Can you send it?", response: "Absolutely. What is the best number or email? The message will include the one specific idea and the labeled concept link—nothing automated." },
      { objection: "We are busy.", response: "Understood. A one-page concept can be left behind or sent later, and it can be reviewed whenever there is time." },
      { objection: "What does it cost?", response: input.plan.pricing_angle },
    ],
    what_to_avoid: [
      "Do not claim the current site is ugly or broken.",
      "Do not claim revenue, conversion, reviews, or urgency that public evidence does not prove.",
      "Do not imply a concept preview is the official business website.",
      "Do not lead with payments or complex systems unless the business asks about them.",
    ],
    risks_to_verify: unique([
      ...input.scores.fit.unknowns,
      ...input.scores.walk_in_viability.unknowns,
      ...input.website.gaps.slice(0, 2),
    ], 6),
    next_action_checklist: [
      input.lead.address ? "Verify the address, public hours, and a respectful walk-in time." : "Verify the preferred public contact route before outreach.",
      "Open every evidence link and confirm the exact fact used in the opener.",
      "Build only the one-angle concept; keep all unknown facts as visible placeholders.",
      `Start with a ${channel}; do not sequence automated follow-ups.`,
      "Bring the concept on a phone or laptop and a simple QR/contact card.",
    ],
    lovable_prompt: [
      `Create a clearly labeled concept preview for ${name}, a ${input.lead.industry || "local service business"} in ${location}.`,
      "This is not the official website. Add a discreet preview disclaimer in the concept and do not use the business's logo unless it is explicitly supplied.",
      `Use only these verified public signals: ${facts.join(" | ") || "No additional facts verified."}`,
      verifiedServices,
      "Do not invent testimonials, review counts, pricing, staff names, ownership facts, services, awards, logos, photos, or contact details. Use tasteful placeholders for anything unverified.",
      `Verified contact method: ${input.lead.phone ? `phone ${input.lead.phone}` : input.lead.public_email ? `email ${input.lead.public_email}` : "unknown—use a non-functional CTA placeholder"}.`,
      `Strongest customer-flow opportunity: ${strongestAngle}`,
      "Build mobile-first. Include: focused hero, verified services or explicit placeholders, proof placeholder area, process/FAQ, and one contact/request section. Use call/text/request CTAs only where the contact data is verified.",
      `Category-specific design direction: ${designDirection}`,
      brandingColors.length ? `Verified public-site color cues: ${brandingColors.join(", ")}. Use them as a starting point, not as an invented brand standard.` : "No reliable color palette was extracted; use a tasteful neutral concept palette and label it as an assumption.",
      "Use existing logo colors and public visual cues only if supplied in the evidence. Otherwise use a tasteful neutral palette and label the color direction as an assumption. Do not invent a logo.",
      `Avoid generic agency language and fake social proof. Intended primary CTA: ${input.lead.phone ? "Call the verified public phone" : input.website.objectiveSignals.has_booking ? "Use the verified booking path" : "Request details through a placeholder flow"}.`,
    ].join("\n"),
    generated_by: "deterministic_fallback",
    generated_at: currentIso(),
    source: "public_evidence_only",
  }
}

function leadPublicFacts(lead: MutableLead, scan: SignalWebsiteScan | null, website: WebsiteReview) {
  const storedScan = asObject(asObject(lead.raw_research).scan)
  const storedServices = safeArray(storedScan.service_language).filter((item): item is string => typeof item === "string")
  return unique([
    `Canonical business name: ${lead.canonical_name || lead.business_name}`,
    lead.industry ? `Industry: ${lead.industry}` : null,
    lead.verified_city || lead.city ? `Verified city: ${lead.verified_city || lead.city}` : null,
    lead.verified_address ? `Verified public address: ${lead.verified_address}` : null,
    lead.phone ? `Public phone: ${lead.phone}` : null,
    lead.public_email ? `Public email: ${lead.public_email}` : null,
    ...website.evidence,
    ...(scan?.service_language || []).slice(0, 3),
    ...storedServices.slice(0, 4),
  ], 12)
}

async function addRunEvent(input: {
  runId: string
  stage: string
  message: string
  progress?: number | null
  metadata?: JsonObject
}) {
  const supabase = createAdminClient()
  const { error } = await supabase.from("signal_run_events").insert({
    run_id: input.runId,
    stage: input.stage,
    message: input.message,
    progress_percent: input.progress ?? null,
    metadata: input.metadata || null,
  })
  if (error) console.error("[signal] Lead-run event write failed:", error.message)
}

async function updateRun(runId: string, update: Record<string, unknown>) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_runs")
    .update(update)
    .eq("id", runId)
    .select("*")
    .maybeSingle()
  if (error) throw new Error(error.message)
  if (!data) throw new Error("Lead run not found.")
  return data as MutableRun
}

async function fetchRun(runId: string) {
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("signal_runs").select("*").eq("id", runId).maybeSingle()
  if (error) throw new Error(error.message)
  return (data || null) as MutableRun | null
}

async function writeProviderWarning(run: MutableRun, warning: string) {
  const current = safeArray(run.provider_errors).filter((item): item is string => typeof item === "string")
  const provider_errors = unique([...current, warning], 10)
  return updateRun(run.id, { provider_errors })
}

function snapshotRunStatus(run: MutableRun, stage: string, progress: number, update: Record<string, unknown> = {}) {
  return {
    current_stage: stage,
    progress_percent: clamp(progress),
    heartbeat_at: currentIso(),
    ...update,
  }
}

export function getSignalLeadRunProviderSetup(): SignalLeadRunProviderSetup {
  const researchProvider = getSignalResearchProviderMode()
  const tavily = (researchProvider === "tavily" || researchProvider === "hybrid") && Boolean(process.env.TAVILY_API_KEY)
  const firecrawl = (researchProvider === "firecrawl" || researchProvider === "hybrid") && Boolean(process.env.FIRECRAWL_API_KEY)
  const aiSetup = getSignalAiProviderSetup()
  const missing: string[] = []
  const warnings: string[] = []

  if (!tavily) {
    missing.push("TAVILY_API_KEY")
    warnings.push(
      researchProvider === "disabled"
        ? "Public research is disabled by SIGNAL_RESEARCH_PROVIDER."
        : "Tavily is required to discover new local lead candidates.",
    )
  }
  if (!firecrawl) {
    missing.push("FIRECRAWL_API_KEY")
    warnings.push("Firecrawl is unavailable; Signal will keep using the safe public-site scanner where possible.")
  }
  if (!aiSetup.enabled) {
    missing.push(...aiSetup.missing_env)
    if (aiSetup.message) warnings.push(aiSetup.message)
  }

  return {
    tavily,
    firecrawl,
    ai: aiSetup.enabled,
    missing: unique(missing, 6),
    warnings: unique(warnings, 6),
    researchProvider,
    aiProvider: aiSetup.provider,
  }
}

export async function createSignalLeadRun({
  createdBy,
  input,
}: {
  createdBy: string
  input: SignalLeadRunCreateInput
}) {
  const providerSetup = getSignalLeadRunProviderSetup()
  if (!providerSetup.tavily) {
    throw new Error("Signal needs TAVILY_API_KEY and public research enabled before it can find new leads.")
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_runs")
    .insert({
      market_type: input.market_type,
      location: input.location,
      radius_miles: input.radius_miles,
      lead_limit: input.lead_limit,
      industry_focus: input.industry_focus,
      custom_industry: input.custom_industry,
      notes: input.notes,
      status: "queued",
      current_stage: "setting_up_market",
      progress_percent: 0,
      provider_status: {
        tavily: providerSetup.tavily,
        firecrawl: providerSetup.firecrawl,
        ai: providerSetup.ai,
        research_provider: providerSetup.researchProvider,
        ai_provider: providerSetup.aiProvider,
      },
      provider_errors: providerSetup.warnings,
      summary: {
        requested_leads: input.lead_limit,
        radius_is_a_discovery_preference: true,
        excluded_chains: 0,
        excluded_duplicates: 0,
        excluded_suppressed: 0,
        qualified_leads: 0,
      },
      execution_cursor: {},
      created_by: createdBy,
    })
    .select("*")
    .single()

  if (error) throw new Error(error.message)
  const run = data as MutableRun
  await addRunEvent({
    runId: run.id,
    stage: "setting_up_market",
    message: `Setting up ${input.market_type === "metro" ? "the metro" : "the city"} market for ${input.location}.`,
    progress: 0,
  })
  return { run, providerSetup }
}

export async function getSignalLeadRunSnapshot(runId: string) {
  const supabase = createAdminClient()
  const [{ data: run, error: runError }, { data: leads, error: leadsError }, { data: events, error: eventsError }] = await Promise.all([
    supabase.from("signal_runs").select("*").eq("id", runId).maybeSingle(),
    supabase
      .from("signal_run_leads")
      .select("*")
      .eq("run_id", runId)
      .order("rank", { ascending: true, nullsFirst: false })
      .order("final_score", { ascending: false, nullsFirst: false })
      .limit(60),
    supabase
      .from("signal_run_events")
      .select("*")
      .eq("run_id", runId)
      .order("created_at", { ascending: false })
      .limit(30),
  ])
  if (runError) throw new Error(runError.message)
  if (!run) return null
  if (leadsError) throw new Error(leadsError.message)
  if (eventsError) throw new Error(eventsError.message)
  return {
    run: run as MutableRun,
    leads: (leads || []) as MutableLead[],
    events: (events || []) as SignalRunEvent[],
  }
}

async function claimRun(run: MutableRun) {
  const now = Date.now()
  const token = randomUUID()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_runs")
    .update({
      lease_token: token,
      // A bounded route is allowed 60 seconds. Keep the lease longer than one
      // route so a slow public scan cannot be claimed by the next poll.
      lease_expires_at: new Date(now + 90_000).toISOString(),
      started_at: run.started_at || currentIso(),
      heartbeat_at: currentIso(),
      attempt_count: Math.max(0, run.attempt_count || 0) + 1,
    })
    .eq("id", run.id)
    .or(`lease_token.is.null,lease_expires_at.lt.${new Date(now).toISOString()}`)
    .select("*")
    .maybeSingle()
  if (error) throw new Error(error.message)
  return data ? { run: data as MutableRun, token } : null
}

async function releaseRun(runId: string, token: string) {
  try {
    const supabase = createAdminClient()
    const { error } = await supabase
      .from("signal_runs")
      .update({ lease_token: null, lease_expires_at: null, heartbeat_at: currentIso() })
      .eq("id", runId)
      .eq("lease_token", token)
    if (error) throw new Error(error.message)
  } catch (error) {
    console.error("[signal] Lead-run lease release failed:", error)
  }
}

async function advanceDiscovery(run: MutableRun) {
  const cursor = runCursor(run)
  const queries = safeArray(cursor.queries).filter((item): item is string => typeof item === "string")
  const preparedQueries = queries.length ? queries : buildDiscoveryQueries(run)
  const index = Math.max(0, Math.floor(asNumber(cursor.query_index)))
  const storedResults = safeArray(cursor.discovery_results).map(parseDiscoveryResult).filter(Boolean) as DiscoveryResult[]

  if (index < preparedQueries.length) {
    const query = preparedQueries[index]
    await addRunEvent({
      runId: run.id,
      stage: "finding_local_businesses",
      message: `Searching ${run.location} for independent local businesses (${index + 1} of ${preparedQueries.length})…`,
      progress: 8 + Math.round((index / Math.max(1, preparedQueries.length)) * 20),
    })

    const rawCandidateTarget = Math.min(75, Math.max(30, run.lead_limit * 8))
    const response = await searchSignalTavilyPublicWeb({ query, maxResults: 10 })
    const nextResults = [...storedResults, ...response.results].slice(0, rawCandidateTarget)
    const warnings = response.setup_messages
    const nextRun = await updateRun(run.id, snapshotRunStatus(run, "finding_local_businesses", 10 + Math.round(((index + 1) / preparedQueries.length) * 20), {
      status: "discovering",
      execution_cursor: {
        ...cursor,
        queries: preparedQueries,
        query_index: index + 1,
        discovery_results: nextResults,
      },
      provider_errors: unique([
        ...safeArray(run.provider_errors).filter((item): item is string => typeof item === "string"),
        ...warnings,
      ], 10),
    }))
    if (warnings.length) await addRunEvent({ runId: run.id, stage: "provider_warning", message: warnings[0], progress: nextRun.progress_percent })
    return
  }

  const materialized = await materializeCandidates(run, storedResults)
  if (materialized.eligible === 0) {
    await updateRun(run.id, snapshotRunStatus(run, "completed_with_no_matches", 100, {
      status: "partial",
      completed_at: currentIso(),
      summary: { ...runSummary(run), ...materialized.summary, qualified_leads: 0 },
      error_message: "No independent local candidates met the public-evidence filter for this run.",
    }))
    await addRunEvent({ runId: run.id, stage: "completed", message: "No independent local candidates made it through the first public-evidence filter.", progress: 100 })
    return
  }

  await updateRun(run.id, snapshotRunStatus(run, "filtering_chains_and_duplicates", 34, {
    status: "checking",
    summary: { ...runSummary(run), ...materialized.summary },
    execution_cursor: { ...cursor, queries: preparedQueries, query_index: index, discovery_results: [] },
  }))
  await addRunEvent({
    runId: run.id,
    stage: "filtering_chains_and_duplicates",
    message: `Filtering chains and duplicates left ${materialized.eligible} public-business candidate${materialized.eligible === 1 ? "" : "s"} to check.`,
    progress: 34,
    metadata: materialized.summary,
  })
}

async function materializeCandidates(run: MutableRun, rawResults: DiscoveryResult[]) {
  const supabase = createAdminClient()
  let eligible = 0
  let excludedChains = 0
  let excludedDuplicates = 0
  let excludedNonBusinessSources = 0
  let excludedGenericEntities = 0
  let mergedDuplicateSources = 0
  let viableScanCandidates = 0
  const records: Array<Record<string, unknown>> = []
  const recordsByIdentity = new Map<string, Record<string, unknown>>()
  const recordsByName = new Map<string, Record<string, unknown>>()
  const recordsByHost = new Map<string, Record<string, unknown>>()
  // Research a true funnel, not exactly the requested result count. Cheap
  // deterministic gates run first; website/Firecrawl work happens later.
  const poolLimit = Math.min(75, Math.max(30, run.lead_limit * 6))

  for (const result of rawResults) {
    const sourceType = classifySignalResearchUrl(result.url)
    if (sourceType !== "likely_official_site" && sourceType !== "social") {
      excludedNonBusinessSources += 1
      continue
    }
    if (sourceType === "likely_official_site" && isLikelyDirectoryOrListicleResult(result)) {
      excludedNonBusinessSources += 1
      continue
    }
    const identity = resolveSignalDiscoveryEntity({
      title: result.title,
      url: result.url,
      city: run.location,
      industry: run.custom_industry || run.industry_focus,
      sourceType,
    })
    if (!identity.canonicalName || !["verified", "likely"].includes(identity.status)) {
      excludedGenericEntities += 1
      continue
    }
    const businessName = identity.canonicalName
    const hostname = sourceType === "likely_official_site" ? normalizeSignalHostname(result.url) : ""
    // A social result and an official-domain result for the same local name
    // should resolve to one candidate. Domain/phone stay as aliases, while the
    // stable run identity stays name + requested market.
    const identityKey = [
      normalizeSignalBusinessName(businessName),
      normalizeSignalCity(run.location),
    ].filter(Boolean).join(":")
    if (!identityKey) {
      excludedDuplicates += 1
      continue
    }

    const social = sourceType === "social" ? [result.url] : []
    const websiteUrl = sourceType === "likely_official_site" ? publicUrl(result.url) : null
    const chain = assessChainLikelihood({ businessName, url: websiteUrl || result.url, title: result.title, snippet: result.snippet })
    const normalizedName = normalizeSignalBusinessName(businessName)
    const existingRecord = recordsByIdentity.get(identityKey)
      || recordsByName.get(normalizedName)
      || (hostname ? recordsByHost.get(hostname) : undefined)

    if (existingRecord) {
      // A title-matched Facebook result and official-domain result often refer
      // to the same shop. Preserve both as public evidence, while preferring
      // the official URL for the actual scan.
      mergedDuplicateSources += 1
      const existingRaw = asObject(existingRecord.raw_research)
      const existingSources = sourceUrls(existingRecord.source_urls)
      const existingSocial = sourceUrls(existingRecord.social_links)
      existingRecord.source_urls = unique([...existingSources, result.url], 12)
      existingRecord.social_links = unique([...existingSocial, ...social], 10)
      existingRecord.phone = asString(existingRecord.phone) || extractPhones(`${result.title} ${result.snippet}`)[0] || null
      existingRecord.public_email = asString(existingRecord.public_email) || extractEmails(`${result.title} ${result.snippet}`)[0] || null
      if (websiteUrl && !asString(existingRecord.website_url)) {
        existingRecord.website_url = websiteUrl
        existingRecord.normalized_hostname = hostname || null
        existingRecord.website_status = "unknown"
      }
      if (!asString(existingRecord.industry)) {
        existingRecord.industry = industryLabel(run.industry_focus as IndustryFocus, run.custom_industry, `${result.title} ${result.snippet}`)
      }
      if (chain.likelihood > asNumber(existingRecord.chain_likelihood)) {
        const wasEligible = existingRecord.status === "candidate"
        const isHighChain = chain.likelihood >= 75
        existingRecord.chain_likelihood = chain.likelihood
        existingRecord.chain_reason = chain.reason
        existingRecord.chain_evidence = chain.evidence
        existingRecord.chain_classification = chain.classification
        existingRecord.chain_probability = chain.likelihood
        existingRecord.chain_reasons = chain.reasons
        existingRecord.location_count_estimate = chain.locationCountEstimate
        existingRecord.is_independent_likely = chain.independentLikely
        existingRecord.independent_confidence = chain.independentConfidence
        if (isHighChain && wasEligible) {
          existingRecord.status = "excluded"
          existingRecord.key_reasons = [`Excluded because of chain likelihood: ${chain.reason || "public chain signal"}`]
          existingRecord.risks = ["High chain/franchise likelihood"]
          eligible -= 1
          viableScanCandidates -= 1
          excludedChains += 1
        }
      }
      existingRecord.raw_research = {
        ...existingRaw,
        discovery: websiteUrl ? result : existingRaw.discovery || result,
        discovery_sources: [...safeArray(existingRaw.discovery_sources), result].slice(0, 12),
        source_type: websiteUrl ? "likely_official_site" : existingRaw.source_type || sourceType,
      }
      continue
    }

    const isHighChain = chain.likelihood >= 75
    if (!isHighChain && viableScanCandidates >= poolLimit) continue
    if (isHighChain) excludedChains += 1
    else {
      eligible += 1
      viableScanCandidates += 1
    }
    const industry = industryLabel(run.industry_focus as IndustryFocus, run.custom_industry, `${result.title} ${result.snippet}`)
    const record: Record<string, unknown> = {
      run_id: run.id,
      identity_key: identityKey,
      normalized_business_name: normalizeSignalBusinessName(businessName) || null,
      normalized_hostname: hostname || null,
      rank: null,
      status: isHighChain ? "excluded" : "candidate",
      business_name: businessName,
      canonical_name: businessName,
      canonical_name_confidence: identity.confidence,
      entity_status: identity.status,
      entity_rejection_reason: identity.rejectionReason,
      identity_evidence_count: identity.evidence.length,
      identity_evidence_summary: identity.evidence,
      industry,
      city: null,
      state: null,
      address: null,
      website_url: websiteUrl,
      phone: extractPhones(`${result.title} ${result.snippet}`)[0] || null,
      public_email: extractEmails(`${result.title} ${result.snippet}`)[0] || null,
      social_links: social,
      source_urls: [result.url],
      website_status: websiteUrl ? "unknown" : social.length ? "social_only" : "no_site",
      chain_likelihood: chain.likelihood,
      chain_reason: chain.reason,
      chain_evidence: chain.evidence,
      chain_classification: chain.classification,
      chain_probability: chain.likelihood,
      chain_reasons: chain.reasons,
      location_count_estimate: chain.locationCountEstimate,
      is_independent_likely: chain.independentLikely,
      independent_confidence: chain.independentConfidence,
      final_score: null,
      confidence_score: null,
      opportunity_score: null,
      ranking_score: null,
      confidence_components: {},
      geographic_status: "unclear",
      verified_city: null,
      verified_address: null,
      distance_estimate_miles: null,
      geographic_confidence: 0,
      geographic_evidence: [],
      qualification_status: isHighChain ? "rejected" : null,
      rejection_reason: isHighChain ? `Known or probable chain: ${chain.reason || "deterministic chain evidence"}` : null,
      script_generation_type: null,
      prompt_version: null,
      evaluation_metadata: { discovery_entity_version: "signal-quality-v2" },
      score_breakdown: {},
      key_reasons: isHighChain ? [`Excluded because of chain likelihood: ${chain.reason || "public chain signal"}`] : [],
      website_analysis: {},
      communication_profile: {},
      sales_pack: null,
      lovable_prompt: null,
      risks: isHighChain ? ["High chain/franchise likelihood"] : [],
      next_steps: [],
      raw_research: { discovery: result, discovery_sources: [result], source_type: sourceType },
    }
    records.push(record)
    recordsByIdentity.set(identityKey, record)
    recordsByName.set(normalizedName, record)
    if (hostname) recordsByHost.set(hostname, record)
  }

  if (records.length) {
    const identityKeys = records
      .map((record) => typeof record.identity_key === "string" ? record.identity_key : null)
      .filter((key): key is string => Boolean(key))
    const { data: existing, error: existingError } = await supabase
      .from("signal_run_leads")
      .select("identity_key")
      .eq("run_id", run.id)
      .in("identity_key", identityKeys)
    if (existingError) throw new Error(existingError.message)
    const existingKeys = new Set(
      (existing || [])
        .map((item) => typeof item.identity_key === "string" ? item.identity_key : "")
        .filter(Boolean),
    )
    const newRecords = records.filter((record) => !existingKeys.has(String(record.identity_key || "")))
    if (newRecords.length) {
      const { error } = await supabase.from("signal_run_leads").insert(newRecords)
      if (error) throw new Error(error.message)
    }
  }

  return {
    eligible,
    summary: {
      candidates_discovered: records.length,
      viable_scan_candidates: viableScanCandidates,
      candidate_scan_budget: poolLimit,
      excluded_chains: excludedChains,
      excluded_duplicates: excludedDuplicates,
      excluded_nonbusiness_sources: excludedNonBusinessSources,
      excluded_generic_entities: excludedGenericEntities,
      merged_duplicate_sources: mergedDuplicateSources,
    },
  }
}

async function claimNextCandidate(runId: string) {
  const supabase = createAdminClient()

  // A run lease normally prevents overlapping workers. This conditional row
  // claim is still needed when a lease expires while an old request is being
  // torn down: only one worker can move a candidate into active research.
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const { data: candidate, error: candidateError } = await supabase
      .from("signal_run_leads")
      .select("*")
      .eq("run_id", runId)
      .eq("status", "candidate")
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle()
    if (candidateError) throw new Error(candidateError.message)
    if (!candidate) break

    const { data: claimed, error: claimError } = await supabase
      .from("signal_run_leads")
      .update({ status: "researching", research_error: null })
      .eq("id", candidate.id)
      .eq("run_id", runId)
      .eq("status", "candidate")
      .select("*")
      .maybeSingle()
    if (claimError) throw new Error(claimError.message)
    if (claimed) return claimed as MutableLead
  }

  // A route can be interrupted after its candidate claim. Reclaim only a
  // genuinely stale row; never duplicate a fresh public-site check.
  const staleBefore = new Date(Date.now() - 120_000).toISOString()
  const { data: stale, error: staleError } = await supabase
    .from("signal_run_leads")
    .select("*")
    .eq("run_id", runId)
    .eq("status", "researching")
    .lt("updated_at", staleBefore)
    .order("updated_at", { ascending: true })
    .limit(1)
    .maybeSingle()
  if (staleError) throw new Error(staleError.message)
  if (!stale) return null

  const { data: reclaimed, error: reclaimError } = await supabase
    .from("signal_run_leads")
    .update({ research_error: null })
    .eq("id", stale.id)
    .eq("run_id", runId)
    .eq("status", "researching")
    .lt("updated_at", staleBefore)
    .select("*")
    .maybeSingle()
  if (reclaimError) throw new Error(reclaimError.message)
  return (reclaimed || null) as MutableLead | null
}

function nextCheckingProgress(run: MutableRun, done: number, total: number) {
  return 35 + Math.round((done / Math.max(1, total)) * 32)
}

async function countRunLeads(runId: string, statuses: SignalRunLeadStatus[]) {
  const supabase = createAdminClient()
  const { count, error } = await supabase
    .from("signal_run_leads")
    .select("*", { count: "exact", head: true })
    .eq("run_id", runId)
    .in("status", statuses)
  if (error) throw new Error(error.message)
  return count || 0
}

async function saveEvidence(run: MutableRun, lead: MutableLead, rows: Array<{
  evidence_type: string
  source_url?: string | null
  source_title?: string | null
  excerpt?: string | null
  confidence?: SignalConfidence
  source_tier?: 1 | 2 | 3
  reliability_score?: number
  extracted_fact?: string | null
  retrieved_at?: string
  metadata?: JsonObject
}>) {
  if (!rows.length) return
  const supabase = createAdminClient()
  const { error } = await supabase.from("signal_run_lead_evidence").insert(
    rows.slice(0, 40).map((row) => ({
      run_id: run.id,
      lead_id: lead.id,
      evidence_type: row.evidence_type,
      source_url: row.source_url || null,
      source_title: row.source_title || null,
      excerpt: row.excerpt?.slice(0, 1200) || null,
      confidence: row.confidence || "medium",
      source_tier: row.source_tier || 3,
      reliability_score: clamp(row.reliability_score ?? (row.source_tier === 1 ? 90 : row.source_tier === 2 ? 72 : 38)),
      extracted_fact: row.extracted_fact?.slice(0, 500) || row.excerpt?.slice(0, 500) || null,
      retrieved_at: row.retrieved_at || currentIso(),
      metadata: row.metadata || null,
    })),
  )
  if (error) console.error("[signal] Lead evidence write failed:", error.message)
}

async function analyzeCandidate(run: MutableRun, lead: MutableLead) {
  const supabase = createAdminClient()

  const raw = asObject(lead.raw_research)
  const discovery = parseDiscoveryResult(raw.discovery)
  const source = discovery || {
    title: lead.business_name,
    url: sourceUrls(lead.source_urls)[0] || lead.website_url || "",
    snippet: "",
    source_label: "Stored public result",
  }
  const initialSuppression = await findSignalCandidateSuppression({
    businessName: lead.business_name,
    city: lead.city || run.location,
    hostname: lead.website_url,
    phone: lead.phone,
    email: lead.public_email,
  })
  if (initialSuppression) {
    await supabase.from("signal_run_leads").update({
      status: "excluded",
      risks: ["Previously suppressed in Signal"],
      key_reasons: ["Excluded because the business matches an existing Signal suppression"],
    }).eq("id", lead.id)
    await addRunEvent({ runId: run.id, stage: "filtering_chains_and_duplicates", message: `Skipped suppressed business: ${lead.business_name}.`, progress: run.progress_percent })
    return
  }

  let scan: SignalWebsiteScan | null = null
  let firecrawlExcerpt: string | null = null
  let firecrawlBranding: JsonObject | null = null
  let firecrawlCreditsUsed = 0
  const cursor = runCursor(run)
  const firecrawlBudget = Math.min(getSignalMarketRuntimeConfig().maxFirecrawlCreditsPerMarket, run.lead_limit * 2)
  const priorFirecrawlCredits = asNumber(cursor.firecrawl_credits_used)
  if (lead.website_url) {
    scan = await scanSignalWebsite(lead.website_url, { maxSecondaryPages: 0 })
  }

  const identityNames = unique([
    ...(scan?.json_ld_names || []),
    scan?.open_graph_site_name,
    ...(scan?.logo_alt_text || []).map((value) => value.replace(/\blogo\b/gi, " ").trim()),
    scan?.page_title?.split(/\s[-–—|:]\s/)[0],
    lead.canonical_name,
    lead.business_name,
  ], 12)
  const entityAssessments = identityNames.map((name) => assessSignalEntityName({
    name,
    city: run.location,
    industry: lead.industry || run.custom_industry,
    url: lead.website_url || source.url,
    sourceType: asString(raw.source_type),
    corroboratingNames: identityNames.filter((candidate) => candidate !== name),
  }))
  const entity = entityAssessments.sort((left, right) => right.confidence - left.confidence)[0]
    || assessSignalEntityName({ name: lead.business_name, city: run.location, url: lead.website_url || source.url })
  const canonicalName = entity.canonicalName || lead.business_name
  const preChain = assessChainLikelihood({
    businessName: canonicalName,
    url: lead.website_url || source.url,
    title: source.title,
    snippet: source.snippet,
    scan,
  })
  let chainSearchResults: DiscoveryResult[] = []
  if (!preChain.hasHardChainEvidence && preChain.likelihood >= 25 && preChain.likelihood < 75) {
    const response = await searchSignalTavilyPublicWeb({
      query: `"${canonicalName}" locations franchise corporate parent company`,
      maxResults: 5,
    })
    chainSearchResults = response.results.map(parseDiscoveryResult).filter(Boolean) as DiscoveryResult[]
    if (response.setup_messages.length) await writeProviderWarning(run, response.setup_messages[0])
  }
  const chainSearchText = chainSearchResults.map((result) => `${result.title} ${result.snippet} ${result.url}`).join(" ")

  // Firecrawl is intentionally downstream of cheap identity and known-chain
  // gates. It is never spent on a generic result or deterministic chain.
  if (lead.website_url
    && scan
    && !scan.broken_response
    && ["verified", "likely"].includes(entity.status)
    && !preChain.hasHardChainEvidence
    && getSignalLeadRunProviderSetup().firecrawl
    && priorFirecrawlCredits < firecrawlBudget) {
      try {
        const extracted = await scrapeFirecrawlPage(lead.website_url)
        firecrawlExcerpt = extracted.markdown_excerpt
        firecrawlBranding = extracted.branding
        firecrawlCreditsUsed = Math.max(0, extracted.credits_used)
        if (firecrawlCreditsUsed > 0) {
          await updateRun(run.id, {
            execution_cursor: {
              ...cursor,
              firecrawl_credit_budget: firecrawlBudget,
              firecrawl_credits_used: priorFirecrawlCredits + firecrawlCreditsUsed,
            },
          })
        }
        if (extracted.error) await writeProviderWarning(run, extracted.error)
      } catch (error) {
        await writeProviderWarning(
          run,
          `Firecrawl extraction failed for ${lead.business_name}; Signal kept the safe public-site scan instead. ${error instanceof Error ? error.message : ""}`.trim(),
        )
      }
  }

  const socialLinks = unique([
    ...sourceUrls(lead.social_links),
    ...(scan?.social_links || []),
  ], 10)
  const pageText = sourceText({
    businessName: canonicalName,
    title: source.title,
    snippet: `${source.snippet} ${chainSearchText}`,
    url: lead.website_url || source.url,
    scan,
    firecrawlExcerpt,
  })
  const phone = unique([lead.phone, ...extractPhones(`${source.snippet} ${scan?.visible_phones.join(" ") || ""}`)])[0] || null
  const publicEmail = unique([lead.public_email, ...extractEmails(`${source.snippet} ${scan?.visible_emails.join(" ") || ""}`)])[0] || null
  const address = lead.address || extractStreetAddress(`${source.snippet} ${(scan?.hours_location_language || []).join(" ")}`)
  const website = websiteReview({ websiteUrl: lead.website_url, scan, socialLinks, firecrawlExcerpt })
  let chain = assessChainLikelihood({
    businessName: canonicalName,
    url: lead.website_url || source.url,
    title: source.title,
    snippet: source.snippet,
    scan,
    firecrawlExcerpt,
  })
  const chainAi = !chain.hasHardChainEvidence && chain.likelihood >= 25 && chain.likelihood < 75 && getSignalLeadRunProviderSetup().ai
    ? await runSignalChainClassificationAi({
      businessName: canonicalName,
      websiteUrl: lead.website_url,
      evidence: unique([...chain.reasons, ...chainSearchResults.map((result) => `${result.title}: ${result.snippet}`), firecrawlExcerpt], 12),
    })
    : null
  if (chainAi?.output.classification === "chain" || chainAi?.output.classification === "likely_franchise") {
    chain = {
      ...chain,
      classification: chainAi.output.classification,
      likelihood: Math.max(chain.likelihood, chainAi.output.probability),
      hasHardChainEvidence: chainAi.output.probability >= 85,
      independentLikely: false,
      reasons: unique([...chain.reasons, ...chainAi.output.evidence, chainAi.output.reason], 8),
      locationCountEstimate: chainAi.output.location_count_estimate || chain.locationCountEstimate,
    }
  } else if (chainAi && ["independent", "likely_independent", "local_multi_location"].includes(chainAi.output.classification)) {
    chain = {
      ...chain,
      classification: chainAi.output.classification,
      independentConfidence: Math.max(chain.independentConfidence, Math.min(78, chainAi.output.probability)),
      reasons: unique([...chain.reasons, ...chainAi.output.evidence, chainAi.output.reason], 8),
      locationCountEstimate: chainAi.output.location_count_estimate || chain.locationCountEstimate,
    }
  }
  const sourceIsOfficialSocial = asString(raw.source_type) === "social"
  const geography = assessSignalGeography({
    location: run.location,
    marketType: run.market_type,
    address,
    officialTexts: [
      ...(scan ? [scan.page_title || "", scan.meta_description || "", ...scan.hours_location_language] : []),
      firecrawlExcerpt || "",
      ...(sourceIsOfficialSocial ? [source.title, source.snippet] : []),
    ],
    corroboratingTexts: [],
    discoveryTexts: sourceIsOfficialSocial ? [] : [source.title, source.snippet],
  })
  const independenceBoost = !chain.hasHardChainEvidence && chain.likelihood < 40
    ? (entity.confidence >= 65 ? 10 : 0) + (geography.confidence >= 60 ? 12 : 0) + (lead.website_url || socialLinks.length ? 10 : 0)
    : 0
  if (independenceBoost > 0) {
    const independenceConfidence = clamp(chain.independentConfidence + independenceBoost)
    chain = {
      ...chain,
      independentConfidence: independenceConfidence,
      independentLikely: independenceConfidence >= 70,
      classification: independenceConfidence >= 80 ? "independent" : independenceConfidence >= 70 ? "likely_independent" : chain.classification,
      reasons: unique([...chain.reasons, independenceConfidence >= 70 ? "Distinct identity, local first-party evidence, and no chain signals support likely independence." : null], 8),
    }
  }
  const noteExclusion = noteExclusionReason({
    run,
    website,
    chain,
    hasAddress: Boolean(address),
  })
  const publicFacts = unique([
    `Canonical business name: ${canonicalName}`,
    ...geography.evidence,
    ...website.evidence,
    scan?.page_title,
    scan?.meta_description,
    ...(scan?.service_language || []),
    ...entity.evidence,
  ], 12)
  const scoredLead = {
    ...lead,
    business_name: canonicalName,
    canonical_name: canonicalName,
    phone,
    public_email: publicEmail,
    address,
    social_links: socialLinks as unknown as SignalJson,
    website_status: website.status,
    chain_likelihood: chain.likelihood,
    chain_reason: chain.reason,
    is_independent_likely: chain.independentLikely,
    independent_confidence: chain.independentConfidence,
  } as MutableLead
  const scanPhones = scan?.visible_phones.map(normalizeSignalPhone).filter(Boolean) || []
  const contactAgreement = phone && scanPhones.includes(normalizeSignalPhone(phone))
    ? 90
    : phone || publicEmail
      ? 58
      : website.objectiveSignals.has_contact || website.objectiveSignals.has_booking
        ? 45
        : 10
  const sourceCount = unique(sourceUrls(lead.source_urls).map(normalizeSignalHostname), 12).length
  const scores = buildScoreBreakdown({
    run,
    lead: scoredLead,
    chain,
    website,
    scan,
    hasAddress: Boolean(address),
    publicFacts,
    entityConfidence: entity.confidence,
    geographicConfidence: geography.confidence,
    sourceCount,
    contactAgreement,
    providerFailure: Boolean(scan?.broken_response || (getSignalLeadRunProviderSetup().firecrawl && !firecrawlExcerpt)),
  })
  const profile = communicationProfile({ lead: scoredLead, website, scan })
  const plan = salesPlan({ lead: scoredLead, website, scores, profile: profile as unknown as JsonObject })
  const hasClearContactPath = Boolean(
    address
    || phone
    || publicEmail
    || website.objectiveSignals.has_contact
    || website.objectiveSignals.has_booking,
  )
  const qualification = qualifySignalLead({
    entityStatus: entity.status,
    entityConfidence: entity.confidence,
    chainClassification: chain.classification,
    independenceConfidence: chain.independentConfidence,
    geographicStatus: geography.status,
    geographicConfidence: geography.confidence,
    evidenceConfidence: scores.confidence.score || 0,
    opportunityScore: scores.final.opportunity_score,
    hasContactRoute: hasClearContactPath,
    hasEvidenceLinks: sourceUrls(lead.source_urls).length > 0,
    incompleteResearch: Boolean(scan?.broken_response && lead.website_url && !sourceIsOfficialSocial),
  })
  const exclusionReasons = unique([
    ...qualification.reasons,
    noteExclusion,
  ], 10)
  const exclusionReason = exclusionReasons[0] || null
  const status: SignalRunLeadStatus = qualification.qualified && !noteExclusion ? "ready" : "excluded"
  const risks = unique([
    ...website.gaps,
    ...scores.fit.unknowns,
    ...scores.walk_in_viability.unknowns,
    chain.likelihood >= 45 ? `Chain likelihood: ${chain.reason || "public franchise/multi-location signal"}` : null,
    geography.confidence < 60 ? `Requested-market evidence is insufficient for ${run.location}; radius cannot be treated as verified distance.` : null,
    entity.rejectionReason,
    !hasClearContactPath ? "No clear public contact route was verified" : null,
    noteExclusion,
  ], 8)

  const { error } = await supabase.from("signal_run_leads").update({
    status,
    business_name: canonicalName,
    canonical_name: canonicalName,
    canonical_name_confidence: entity.confidence,
    entity_status: entity.status,
    entity_rejection_reason: entity.rejectionReason,
    identity_evidence_count: entity.evidence.length,
    identity_evidence_summary: entity.evidence,
    industry: industryLabel(run.industry_focus as IndustryFocus, run.custom_industry, pageText),
    city: geography.verifiedCity,
    verified_city: geography.verifiedCity,
    verified_address: geography.verifiedAddress,
    geographic_status: geography.status,
    geographic_confidence: geography.confidence,
    geographic_evidence: geography.evidence,
    distance_estimate_miles: geography.distanceEstimateMiles,
    address,
    phone,
    public_email: publicEmail,
    normalized_phone: normalizeSignalPhone(phone) || null,
    social_links: socialLinks,
    website_status: website.status,
    chain_likelihood: chain.likelihood,
    chain_reason: chain.reason,
    chain_evidence: chain.evidence,
    chain_classification: chain.classification,
    chain_probability: chain.likelihood,
    chain_reasons: chain.reasons,
    location_count_estimate: chain.locationCountEstimate,
    is_independent_likely: chain.independentLikely,
    independent_confidence: chain.independentConfidence,
    final_score: scores.final.score,
    opportunity_score: scores.final.opportunity_score,
    ranking_score: scores.final.ranking_score,
    confidence_score: scores.confidence.score,
    confidence_components: scores.confidence_components,
    qualification_status: qualification.qualified && !noteExclusion ? "qualified" : qualification.status,
    rejection_reason: exclusionReasons.join(" ") || null,
    score_breakdown: scores,
    key_reasons: exclusionReason ? [exclusionReason] : unique([
      ...entity.evidence,
      ...topReasons(scores, website, chain),
    ], 5),
    website_analysis: website,
    communication_profile: profile,
    risks,
    next_steps: plan.next_step_checklist,
    raw_research: {
      discovery: source,
      scan: scan ? {
        scanned_at: scan.scanned_at,
        scanned_urls: scan.scanned_urls,
        broken_response: scan.broken_response,
        page_title: scan.page_title,
        meta_description: scan.meta_description,
        service_language: scan.service_language,
        visible_phones: scan.visible_phones,
        visible_emails: scan.visible_emails,
        booking_links: scan.booking_links,
      } : null,
      firecrawl_excerpt: firecrawlExcerpt,
      firecrawl_branding: firecrawlBranding,
      firecrawl_credits_used: firecrawlCreditsUsed,
      firecrawl_credit_budget: firecrawlBudget,
      canonical_identity: entity,
      geography,
      qualification,
      chain_search_results: chainSearchResults,
      chain_ai_classification: chainAi ? { ...chainAi.output, provider: `${chainAi.provider}:${chainAi.model}` } : null,
      prompt_version: "signal-quality-v2",
    },
    research_error: scan?.broken_response ? scan.error : null,
  }).eq("id", lead.id)
  if (error) throw new Error(error.message)

  const evidenceRows: Array<{
    evidence_type: string
    source_url?: string | null
    source_title?: string | null
    excerpt?: string | null
    confidence?: SignalConfidence
    source_tier?: 1 | 2 | 3
    reliability_score?: number
    extracted_fact?: string | null
    metadata?: JsonObject
  }> = [
    { evidence_type: "discovery_result", source_url: source.url, source_title: source.title, excerpt: source.snippet, extracted_fact: "Discovery evidence only; not canonical identity proof.", confidence: "low" as SignalConfidence, source_tier: 3, reliability_score: 35, metadata: { source_label: source.source_label } },
    ...entity.evidence.map((excerpt) => ({ evidence_type: "official_site_identity", source_url: lead.website_url || source.url, source_title: "Canonical identity", excerpt, extracted_fact: canonicalName, confidence: "high" as SignalConfidence, source_tier: 1 as const, reliability_score: 90, metadata: {} })),
    ...geography.evidence.map((excerpt) => ({ evidence_type: "geographic_validation", source_url: lead.website_url || source.url, source_title: "Geographic validation", excerpt, extracted_fact: geography.verifiedCity, confidence: geography.confidence >= 75 ? "high" as SignalConfidence : "medium" as SignalConfidence, source_tier: sourceIsOfficialSocial || lead.website_url ? 1 as const : 3 as const, reliability_score: geography.confidence, metadata: { status: geography.status } })),
    ...chain.evidence.map((item) => ({ evidence_type: "chain_assessment", source_url: lead.website_url || source.url, source_title: "Chain classification", excerpt: item.signal, extracted_fact: chain.classification, confidence: chain.hasHardChainEvidence ? "high" as SignalConfidence : "medium" as SignalConfidence, source_tier: lead.website_url ? 1 as const : 3 as const, reliability_score: chain.hasHardChainEvidence ? 96 : 65, metadata: { weight: item.weight } })),
    ...chainSearchResults.map((result) => ({ evidence_type: "chain_search_evidence", source_url: result.url, source_title: result.title, excerpt: result.snippet, extracted_fact: "Selective chain/franchise corroboration search", confidence: "medium" as SignalConfidence, source_tier: 3 as const, reliability_score: 45, metadata: {} })),
    ...(scan?.evidence || []).map((item) => ({ evidence_type: item.signal, source_url: item.url, source_title: "Official-site scan", excerpt: item.snippet, extracted_fact: item.snippet, confidence: item.confidence, source_tier: 1 as const, reliability_score: item.confidence === "high" ? 92 : item.confidence === "medium" ? 75 : 55, metadata: {} })),
    ...(firecrawlExcerpt ? [{ evidence_type: "firecrawl_public_page", source_url: lead.website_url, source_title: "Firecrawl official-page extract", excerpt: firecrawlExcerpt, extracted_fact: "Official-page content used for identity, geography, website, and chain analysis.", confidence: "high" as SignalConfidence, source_tier: 1 as const, reliability_score: 88, metadata: {} }] : []),
  ]
  await saveEvidence(run, lead, evidenceRows)
  await addRunEvent({
    runId: run.id,
    stage: "checking_websites",
    message: status === "excluded"
      ? `Excluded ${lead.business_name}: ${exclusionReason || "public-evidence filter"}`
      : `Checked public website and contact signals for ${lead.business_name}.`,
    progress: run.progress_percent,
  })
}

async function advanceChecking(run: MutableRun) {
  const candidate = await claimNextCandidate(run.id)
  if (!candidate) {
    const outstanding = await countRunLeads(run.id, ["candidate", "researching"])
    if (outstanding > 0) {
      await addRunEvent({
        runId: run.id,
        stage: "checking_websites",
        message: "Waiting for an in-progress public-site check to finish before scoring.",
        progress: run.progress_percent,
      })
      return
    }
    await updateRun(run.id, snapshotRunStatus(run, "scoring_opportunities", 70, { status: "scoring" }))
    await addRunEvent({ runId: run.id, stage: "scoring_opportunities", message: "Scoring opportunities with the public evidence collected so far…", progress: 70 })
    return
  }

  const total = await countRunLeads(run.id, ["candidate", "researching", "ready", "excluded", "failed"])
  const done = await countRunLeads(run.id, ["ready", "excluded", "failed"])
  await updateRun(run.id, snapshotRunStatus(run, "checking_websites", nextCheckingProgress(run, done, total), { status: "checking" }))
  try {
    await analyzeCandidate(run, candidate)
  } catch (error) {
    const message = error instanceof Error ? error.message : "Public website check failed."
    const supabase = createAdminClient()
    await supabase.from("signal_run_leads").update({ status: "failed", research_error: message, risks: ["Research step failed; manual review needed"] }).eq("id", candidate.id)
    await writeProviderWarning(run, message)
    await addRunEvent({ runId: run.id, stage: "checking_websites", message: `Could not finish ${candidate.business_name}; keeping partial research.`, progress: run.progress_percent })
  }
}

async function rankLeads(run: MutableRun) {
  const supabase = createAdminClient()
  // Ranks are unique within a run. Clear the previous ordering before writing
  // a new one so a reordered lead never collides with an existing rank.
  const { error: clearError } = await supabase
    .from("signal_run_leads")
    .update({ rank: null })
    .eq("run_id", run.id)
    .not("rank", "is", null)
  if (clearError) throw new Error(clearError.message)
  const { data, error } = await supabase
    .from("signal_run_leads")
    .select("*")
    .eq("run_id", run.id)
    .eq("status", "ready")
    .eq("qualification_status", "qualified")
    .order("ranking_score", { ascending: false, nullsFirst: false })
    .order("opportunity_score", { ascending: false, nullsFirst: false })
    .order("confidence_score", { ascending: false, nullsFirst: false })
    .order("id", { ascending: true })
    .limit(60)
  if (error) throw new Error(error.message)
  const candidates = (data || []) as MutableLead[]
  const ranked: MutableLead[] = []
  const seenAliases = new Set<string>()
  for (const lead of candidates) {
    const aliases = unique([
      signalDuplicateKey({ canonicalName: lead.canonical_name || lead.business_name, city: lead.verified_city || lead.city, websiteUrl: lead.website_url, phone: lead.phone }),
      lead.normalized_hostname ? `domain:${lead.normalized_hostname}` : null,
      lead.normalized_phone ? `phone:${lead.normalized_phone}` : null,
      `name:${normalizeSignalBusinessName(lead.canonical_name || lead.business_name)}:${normalizeSignalCity(lead.verified_city || lead.city || run.location)}`,
    ], 8)
    if (aliases.some((alias) => seenAliases.has(alias))) {
      await supabase.from("signal_run_leads").update({
        status: "excluded",
        qualification_status: "rejected",
        rejection_reason: "Duplicate resolved identity, domain, or phone within this run.",
        key_reasons: ["Excluded as a duplicate of a higher-ranked candidate."],
      }).eq("id", lead.id)
      continue
    }
    aliases.forEach((alias) => seenAliases.add(alias))
    ranked.push(lead)
  }
  for (const [index, lead] of ranked.entries()) {
    await supabase.from("signal_run_leads").update({ rank: index + 1 }).eq("id", lead.id)
  }
  return ranked
}

async function advanceScoring(run: MutableRun) {
  const ranked = await rankLeads(run)
  if (ranked.length === 0) {
    await updateRun(run.id, snapshotRunStatus(run, "completed_with_partial_research", 100, {
      status: "partial",
      completed_at: currentIso(),
      summary: { ...runSummary(run), qualified_leads: 0 },
      error_message: "No candidates had enough independent public evidence to rank.",
    }))
    await addRunEvent({ runId: run.id, stage: "completed", message: "Signal kept the partial research but could not rank an independent lead.", progress: 100 })
    return
  }
  await updateRun(run.id, snapshotRunStatus(run, "writing_sales_packs", 78, {
    status: "writing_packs",
    summary: { ...runSummary(run), qualified_leads: ranked.length, returned_leads: Math.min(run.lead_limit, ranked.length) },
  }))
  await addRunEvent({ runId: run.id, stage: "writing_sales_packs", message: `Writing honest sales angles for ${Math.min(run.lead_limit, ranked.length)} top lead${Math.min(run.lead_limit, ranked.length) === 1 ? "" : "s"}…`, progress: 78 })
}

function asScoreBreakdown(value: SignalJson): LeadScoreBreakdown | null {
  const raw = asObject(value)
  return raw && "final" in raw ? raw as unknown as LeadScoreBreakdown : null
}

async function buildSalesPack(run: MutableRun, lead: MutableLead, kind: "scripts" | "lovable" | "all") {
  const website = isWebsiteReview(lead.website_analysis)
    ? lead.website_analysis
    : websiteReview({ websiteUrl: lead.website_url, scan: null, socialLinks: sourceUrls(lead.social_links), firecrawlExcerpt: null })
  const scores = asScoreBreakdown(lead.score_breakdown) || buildScoreBreakdown({
    run,
    lead,
    chain: assessChainLikelihood({ businessName: lead.business_name, url: lead.website_url }),
    website,
    scan: null,
    hasAddress: Boolean(lead.address),
    publicFacts: [],
  })
  const plan = salesPlan({ lead, website, scores, profile: asObject(lead.communication_profile) })
  const facts = leadPublicFacts(lead, null, website)
  const fallback = fallbackSalesPack({ lead, website, scores, reasons: safeArray(lead.key_reasons).filter((item): item is string => typeof item === "string"), plan })
  const supabase = createAdminClient()
  const { data: storedEvidence, error: evidenceError } = await supabase
    .from("signal_run_lead_evidence")
    .select("source_title, source_url, excerpt, extracted_fact, source_tier, reliability_score")
    .eq("run_id", run.id)
    .eq("lead_id", lead.id)
    .order("source_tier", { ascending: true, nullsFirst: false })
    .order("reliability_score", { ascending: false, nullsFirst: false })
    .limit(16)
  if (evidenceError) throw new Error(evidenceError.message)
  const evidence = (storedEvidence || []).map((item) => ({
    label: item.source_title || `Tier ${item.source_tier || 3} public evidence`,
    excerpt: item.extracted_fact || item.excerpt || "Public evidence link",
    url: item.source_url,
  }))
  const communication = asObject(lead.communication_profile)
  const profileTags = safeArray(communication.tags).flatMap((item) => {
    const tag = asObject(item)
    const label = asString(tag.label) || asString(tag.tag)
    return label ? [label] : []
  })
  const risks = safeArray(lead.risks).filter((item): item is string => typeof item === "string")
  const aiPack = kind === "lovable" ? null : await runSignalLeadSalesPackAi({
    businessName: lead.business_name,
    city: lead.city,
    industry: lead.industry,
    websiteStatus: lead.website_status,
    publicFacts: facts,
    evidence,
    scoreSummary: `Opportunity ${lead.opportunity_score ?? scores.final.opportunity_score}; confidence ${lead.confidence_score ?? "unknown"}; ranking ${lead.ranking_score ?? scores.final.ranking_score}; website opportunity ${scores.website_opportunity.score ?? "unknown"}.`,
    verifiedContact: unique([lead.phone ? `Public phone: ${lead.phone}` : null, lead.public_email ? `Public email: ${lead.public_email}` : null, lead.verified_address ? `Public address: ${lead.verified_address}` : null], 6),
    websiteFindings: unique([website.summary, ...website.evidence, ...website.gaps], 10),
    communicationProfile: profileTags,
    strongestOpportunity: fallback.strongest_honest_angle,
    uncertainties: risks,
    forbiddenClaims: fallback.what_to_avoid,
    recommendedChannel: plan.best_first_action,
  })
  if (kind !== "lovable" && !aiPack && getSignalLeadRunProviderSetup().ai) {
    await writeProviderWarning(run, "AI sales-pack generation was unavailable for one lead; Signal used the deterministic public-evidence fallback.")
  }
  const previous = asObject(lead.sales_pack)
  const aiOutput = aiPack
    ? {
      ...fallback,
      ...aiPack.output,
      what_stood_out: fallback.what_stood_out,
      likely_pain_points: fallback.likely_pain_points,
      risks_to_verify: fallback.risks_to_verify,
      lovable_prompt: fallback.lovable_prompt,
      ai_phrase_provider: `${aiPack.provider}:${aiPack.model}`,
    }
    : null
  const selectedPack = selectSignalSalesPack({ fallback, aiPack: aiOutput, businessName: lead.business_name, verifiedFacts: facts })
  if (aiOutput && selectedPack.generatedBy === "deterministic_fallback") {
    await writeProviderWarning(run, `AI sales-pack grounding failed for ${lead.business_name}; Signal used the verified fallback.`)
  }
  const acceptedAi = selectedPack.generatedBy === "ai"
  const output = selectedPack.pack
  const nextPack: JsonObject = kind === "lovable"
    ? { ...previous, lovable_prompt: fallback.lovable_prompt, generated_at: currentIso(), generated_by: "deterministic_fallback", prompt_version: "signal-sales-pack-v2" }
    : { ...previous, ...output, generated_at: currentIso(), generated_by: acceptedAi ? "ai" : "deterministic_fallback", prompt_version: "signal-sales-pack-v2" }
  const { data, error } = await supabase
    .from("signal_run_leads")
    .update({
      sales_pack: nextPack,
      lovable_prompt: asString(nextPack.lovable_prompt) || fallback.lovable_prompt,
      next_steps: plan.next_step_checklist,
      script_generation_type: kind === "lovable" ? lead.script_generation_type : acceptedAi ? "ai" : "deterministic_fallback",
      prompt_version: "signal-sales-pack-v2",
    })
    .eq("id", lead.id)
    .select("*")
    .single()
  if (error) throw new Error(error.message)
  return data as MutableLead
}

async function advanceWritingPacks(run: MutableRun) {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_run_leads")
    .select("*")
    .eq("run_id", run.id)
    .eq("status", "ready")
    .lte("rank", run.lead_limit)
    .is("sales_pack", null)
    .order("rank", { ascending: true, nullsFirst: false })
    .limit(1)
    .maybeSingle()
  if (error) throw new Error(error.message)
  const lead = data as MutableLead | null
  if (!lead) {
    await updateRun(run.id, snapshotRunStatus(run, "ranking_final_leads", 96, { status: "ranking" }))
    await addRunEvent({ runId: run.id, stage: "ranking_final_leads", message: "Ranking the strongest independent opportunities…", progress: 96 })
    return
  }
  const target = Math.min(run.lead_limit, Math.max(1, await countRunLeads(run.id, ["ready"])))
  const completed = await countRunLeads(run.id, ["ready"])
  await updateRun(run.id, snapshotRunStatus(run, "writing_sales_packs", clamp(80 + (1 - Math.min(completed, target) / Math.max(1, target)) * 12), { status: "writing_packs" }))
  const result = await buildSalesPack(run, lead, "all")
  await addRunEvent({ runId: run.id, stage: "writing_sales_packs", message: `Wrote a sales pack for ${result.business_name}.`, progress: run.progress_percent })
}

async function finishRun(run: MutableRun) {
  const ranked = await rankLeads(run)
  const returned = ranked.slice(0, run.lead_limit)
  const [checked, rejected] = await Promise.all([
    countRunLeads(run.id, ["ready", "saved", "excluded", "failed"]),
    countRunLeads(run.id, ["excluded", "failed"]),
  ])
  const status: SignalRunStatus = returned.length < run.lead_limit ? "partial" : "completed"
  await updateRun(run.id, snapshotRunStatus(run, "completed", 100, {
    status,
    completed_at: currentIso(),
    summary: {
      ...runSummary(run),
      qualified_leads: ranked.length,
      returned_leads: returned.length,
      candidates_checked: checked,
      candidates_rejected: rejected,
      top_lead_names: returned.map((lead) => lead.business_name),
    },
    error_message: status === "partial" ? `Signal found ${returned.length} lead${returned.length === 1 ? "" : "s"} with enough independent public evidence.` : null,
  }))
  await addRunEvent({
    runId: run.id,
    stage: "completed",
    message: status === "completed"
      ? `Signal checked ${checked} candidates, rejected ${rejected}, and ranked ${returned.length} leads worth opening.`
      : `Signal found only ${returned.length} lead${returned.length === 1 ? "" : "s"} that met the quality bar after rejecting ${rejected}.`,
    progress: 100,
  })
}

export async function advanceSignalLeadRun(runId: string) {
  const fetched = await fetchRun(runId)
  if (!fetched) throw new Error("Lead run not found.")
  if (fetched.status === "failed") {
    const cursor = runCursor(fetched)
    const requestedResume = asString(cursor.resume_status) as SignalRunStatus
    const resumeStatus = ACTIVE_STATUSES.has(requestedResume) ? requestedResume : "discovering"
    await updateRun(fetched.id, snapshotRunStatus(fetched, "retrying_research", Math.max(5, fetched.progress_percent), {
      status: resumeStatus,
      completed_at: null,
      error_message: null,
      execution_cursor: { ...cursor, resume_status: null },
    }))
    await addRunEvent({ runId: fetched.id, stage: "retrying_research", message: "Retrying the last safe Signal stage from its persisted checkpoint.", progress: fetched.progress_percent })
    const snapshot = await getSignalLeadRunSnapshot(runId)
    if (!snapshot) throw new Error("Lead run not found.")
    return snapshot
  }
  if (TERMINAL_STATUSES.has(fetched.status)) {
    const snapshot = await getSignalLeadRunSnapshot(runId)
    if (!snapshot) throw new Error("Lead run not found.")
    return snapshot
  }
  const lease = await claimRun(fetched)
  if (!lease) {
    const snapshot = await getSignalLeadRunSnapshot(runId)
    if (!snapshot) throw new Error("Lead run not found.")
    return snapshot
  }
  const claimed = lease.run

  try {
    if (claimed.status === "queued") {
      await updateRun(claimed.id, snapshotRunStatus(claimed, "setting_up_market", 5, { status: "discovering" }))
      await addRunEvent({ runId: claimed.id, stage: "setting_up_market", message: `Setting up ${claimed.location} before public-web discovery…`, progress: 5 })
    } else if (claimed.status === "discovering") {
      await advanceDiscovery(claimed)
    } else if (claimed.status === "checking") {
      await advanceChecking(claimed)
    } else if (claimed.status === "scoring") {
      await advanceScoring(claimed)
    } else if (claimed.status === "writing_packs") {
      await advanceWritingPacks(claimed)
    } else if (claimed.status === "ranking") {
      await finishRun(claimed)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signal research failed unexpectedly."
    console.error("[signal] Lead-run stage failed:", message)
    const ready = await countRunLeads(runId, ["ready", "saved"])
    await updateRun(runId, snapshotRunStatus(claimed, "partial_research", ready > 0 ? 96 : 100, {
      status: ready > 0 ? "partial" : "failed",
      completed_at: ready > 0 ? currentIso() : null,
      error_message: message,
      provider_errors: unique([
        ...safeArray(claimed.provider_errors).filter((item): item is string => typeof item === "string"),
        message,
      ], 10),
      execution_cursor: { ...runCursor(claimed), resume_status: claimed.status },
    }))
    await addRunEvent({ runId, stage: "provider_warning", message: `Signal kept what it could: ${message}`, progress: ready > 0 ? 96 : 100 })
  } finally {
    await releaseRun(runId, lease.token)
  }

  const snapshot = await getSignalLeadRunSnapshot(runId)
  if (!snapshot) throw new Error("Lead run not found.")
  return snapshot
}

export async function updateSignalRunLeadDisposition({
  leadId,
  runId,
  status,
}: {
  runId: string
  leadId: string
  status: "saved" | "ignored"
}) {
  const supabase = createAdminClient()
  const { data: lead, error: readError } = await supabase
    .from("signal_run_leads")
    .select("*")
    .eq("id", leadId)
    .eq("run_id", runId)
    .maybeSingle()
  if (readError) throw new Error(readError.message)
  if (!lead) throw new Error("Lead not found.")

  if (status === "ignored") {
    await addSignalCandidateSuppression({
      businessName: lead.business_name,
      city: lead.city,
      hostname: lead.website_url,
      phone: lead.phone,
      email: lead.public_email,
      reason: `Ignored from Signal lead run ${runId}.`,
      suppressionType: "rejected",
    })
  }

  const { data, error } = await supabase
    .from("signal_run_leads")
    .update({ status })
    .eq("id", leadId)
    .eq("run_id", runId)
    .select("*")
    .single()
  if (error) throw new Error(error.message)
  await addRunEvent({ runId, stage: status === "saved" ? "lead_saved" : "lead_ignored", message: `${lead.business_name} was ${status}.` })
  return { lead: data as MutableLead }
}

export async function generateSignalRunLeadSalesPack({
  kind,
  leadId,
  runId,
}: {
  runId: string
  leadId: string
  kind: "scripts" | "lovable"
}) {
  const snapshot = await getSignalLeadRunSnapshot(runId)
  if (!snapshot) throw new Error("Lead run not found.")
  const lead = snapshot.leads.find((item) => item.id === leadId) as MutableLead | undefined
  if (!lead) throw new Error("Lead not found.")
  if (lead.status !== "ready" && lead.status !== "saved") {
    throw new Error("Sales packs can only be generated for qualified completed leads.")
  }
  const result = await buildSalesPack(snapshot.run as MutableRun, lead, kind)
  await addRunEvent({
    runId,
    stage: kind === "lovable" ? "lovable_prompt" : "sales_pack",
    message: `Regenerated ${kind === "lovable" ? "the Lovable prompt" : "the sales scripts"} for ${result.business_name}.`,
  })
  return { lead: result }
}
