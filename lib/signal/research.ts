import "server-only"

import { getSignalPlaybook, type SignalPlaybookKey } from "./playbooks"
import type {
  SignalCampaignCandidateStatus,
  SignalConfidence,
  SignalProspect,
} from "@/lib/supabase/types"

export type SignalResearchCandidate = {
  title: string
  url: string
  source_type: "likely_official_site" | "directory" | "social" | "search_result" | "unknown"
  evidence: string
  confidence: SignalConfidence
}

export type SignalCampaignDiscoveryCandidate = {
  business_name: string
  city: string | null
  state: string | null
  industry_hint: string | null
  candidate_url: string | null
  likely_official_url: string | null
  source_url: string | null
  source_title: string | null
  source_snippet: string | null
  source_provider: "tavily"
  official_source_confidence: SignalConfidence
  candidate_status: SignalCampaignCandidateStatus
  reason: string | null
}

export type SignalCampaignDiscoveryResult =
  | {
      ok: true
      provider: "tavily"
      queries: string[]
      candidates: SignalCampaignDiscoveryCandidate[]
      setup_message: null
    }
  | {
      ok: false
      provider: "disabled" | "tavily"
      queries: string[]
      candidates: SignalCampaignDiscoveryCandidate[]
      setup_message: string
    }

export type SignalResearchResult =
  | {
      ok: true
      provider: "tavily"
      query: string
      candidates: SignalResearchCandidate[]
      setup_message: null
    }
  | {
      ok: false
      provider: "disabled" | "tavily"
      query: string
      candidates: SignalResearchCandidate[]
      setup_message: string
    }

const DIRECTORY_HOST_PARTS = [
  "bbb.org",
  "chamberofcommerce",
  "mapquest",
  "yellowpages",
  "yelp",
  "angi",
  "homeadvisor",
  "thumbtack",
  "nextdoor",
  "birdeye",
  "manta",
  "foursquare",
  "datanyze",
  "zoominfo",
]

const SOCIAL_HOST_PARTS = [
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "x.com",
  "twitter.com",
  "tiktok.com",
  "youtube.com",
]

const SEARCH_HOST_PARTS = [
  "google.",
  "maps.google",
  "bing.",
  "duckduckgo.",
  "yahoo.",
]

function clean(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || ""
}

function compactLower(value: string) {
  return clean(value).toLowerCase()
}

export function normalizeSignalBusinessName(value: string | null | undefined) {
  return compactLower(value || "")
    .replace(/&/g, " and ")
    .replace(/\b(llc|inc|co|company|the)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
}

export function normalizeSignalPhone(value: string | null | undefined) {
  const digits = (value || "").replace(/\D/g, "")
  return digits.length >= 7 ? digits.slice(-10) : ""
}

export function normalizeSignalHostname(value: string | null | undefined) {
  if (!value) return ""
  try {
    const url = new URL(value.startsWith("http") ? value : `https://${value}`)
    return url.hostname.toLowerCase().replace(/^www\./, "")
  } catch {
    return ""
  }
}

function classifyUrl(url: string): SignalResearchCandidate["source_type"] {
  const host = normalizeSignalHostname(url)
  if (!host) return "unknown"
  if (SOCIAL_HOST_PARTS.some((part) => host.includes(part))) return "social"
  if (DIRECTORY_HOST_PARTS.some((part) => host.includes(part))) return "directory"
  if (SEARCH_HOST_PARTS.some((part) => host.includes(part))) return "search_result"
  return "likely_official_site"
}

export function classifySignalResearchUrl(url: string) {
  return classifyUrl(url)
}

export function isClearlyNonOfficialSignalSource(url: string) {
  return classifyUrl(url) !== "likely_official_site"
}

function candidateConfidence({
  businessName,
  content,
  location,
  title,
  url,
}: {
  businessName: string
  content: string
  location: string
  title: string
  url: string
}): SignalConfidence {
  const sourceType = classifyUrl(url)
  if (sourceType !== "likely_official_site") return "low"

  const business = normalizeSignalBusinessName(businessName)
  const text = normalizeSignalBusinessName(`${title} ${content} ${url}`)
  const locationText = compactLower(`${title} ${content}`)
  const businessWords = business.split(" ").filter((word) => word.length > 2)
  const matchedWords = businessWords.filter((word) => text.includes(word)).length
  const locationParts = compactLower(location)
    .split(/[,\s]+/)
    .filter((word) => word.length > 2)
  const locationHit = locationParts.some((word) => locationText.includes(word))

  if (matchedWords >= Math.min(2, businessWords.length) && locationHit) return "high"
  if (matchedWords >= Math.min(2, businessWords.length)) return "medium"
  return "low"
}

export function buildSignalResearchQuery({
  businessName,
  industryHint,
  location,
}: {
  businessName: string
  industryHint?: string | null
  location: string
}) {
  return [
    `"${clean(businessName)}"`,
    `"${clean(location)}"`,
    industryHint ? clean(industryHint) : null,
    "official website contact services",
  ]
    .filter(Boolean)
    .join(" ")
}

const CAMPAIGN_QUERY_TERMS: Record<SignalPlaybookKey, string[]> = {
  auto_detailing: ["auto detailing", "mobile detailing", "ceramic coating"],
  barber_salon: ["barber shop", "hair salon", "barber salon"],
  hvac: ["HVAC contractor", "air conditioning repair", "heating cooling company"],
  roofing_contractors_home_services: [
    "roofing contractor",
    "home services contractor",
    "remodeling contractor",
  ],
  medical_dental: ["dental office", "medical clinic"],
  general_local_business: ["local business", "service business"],
}

export function buildSignalCampaignDiscoveryQueries({
  city,
  maxQueries = 10,
  playbooks,
  state,
}: {
  city: string
  maxQueries?: number
  playbooks: SignalPlaybookKey[]
  state?: string | null
}) {
  const location = [clean(city), clean(state)].filter(Boolean).join(" ")
  const queries = playbooks.flatMap((playbookKey) =>
    (CAMPAIGN_QUERY_TERMS[playbookKey] || CAMPAIGN_QUERY_TERMS.general_local_business)
      .slice(0, 2)
      .map((term) => `${term} ${location} official website`),
  )

  return Array.from(new Set(queries)).slice(0, maxQueries)
}

function campaignCandidateConfidence({
  content,
  city,
  sourceType,
  state,
  title,
}: {
  content: string
  city: string
  sourceType: SignalResearchCandidate["source_type"]
  state?: string | null
  title: string
}): SignalConfidence {
  if (sourceType !== "likely_official_site") return "low"
  const text = compactLower(`${title} ${content}`)
  const cityHit = clean(city) ? text.includes(compactLower(city)) : false
  const stateText = clean(state)
  const stateHit = stateText ? text.includes(compactLower(stateText)) : false
  if (cityHit && stateHit) return "high"
  if (cityHit || stateHit) return "medium"
  return "medium"
}

function extractCampaignBusinessName(title: string, url: string) {
  const titleName = clean(title)
    .replace(/\b(official\s+website|home\s+page|homepage|website)\b/gi, " ")
    .split(/\s[-–—:]\s|\|/)[0]
    .replace(/\s+/g, " ")
    .trim()

  if (titleName && titleName.length >= 2 && !/^best\s+/i.test(titleName)) {
    return titleName.slice(0, 180)
  }

  const host = normalizeSignalHostname(url)
  const fallback = host
    .split(".")[0]
    ?.replace(/[-_]+/g, " ")
    .replace(/\b(tx|dfw|usa)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()

  return fallback ? fallback.replace(/\b\w/g, (letter) => letter.toUpperCase()).slice(0, 180) : "Unknown business"
}

function dedupeCampaignCandidates(candidates: SignalCampaignDiscoveryCandidate[]) {
  const seen = new Set<string>()
  return candidates.filter((candidate) => {
    const host = normalizeSignalHostname(candidate.likely_official_url || candidate.candidate_url)
    const name = normalizeSignalBusinessName(candidate.business_name)
    const key = [name, host].filter(Boolean).join(":") || candidate.source_url || candidate.business_name
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function campaignStatusForCandidate({
  confidence,
  sourceType,
}: {
  confidence: SignalConfidence
  sourceType: SignalResearchCandidate["source_type"]
}): SignalCampaignCandidateStatus {
  if (sourceType !== "likely_official_site" || confidence === "low") return "needs_confirmation"
  return "pending_review"
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export async function runSignalCampaignDiscovery(input: {
  city: string
  maxCandidates: number
  playbooks: SignalPlaybookKey[]
  state?: string | null
}): Promise<SignalCampaignDiscoveryResult> {
  const queries = buildSignalCampaignDiscoveryQueries({
    city: input.city,
    playbooks: input.playbooks,
    state: input.state,
  })
  const provider = process.env.SIGNAL_RESEARCH_PROVIDER?.trim().toLowerCase()

  if (provider !== "tavily") {
    return {
      ok: false,
      provider: "disabled",
      queries,
      candidates: [],
      setup_message:
        "Signal campaign discovery is disabled. Set SIGNAL_RESEARCH_PROVIDER=tavily and TAVILY_API_KEY server-side to enable city campaigns.",
    }
  }

  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      provider: "tavily",
      queries,
      candidates: [],
      setup_message:
        "Tavily is selected, but TAVILY_API_KEY is missing. Campaigns can still be created and reviewed manually.",
    }
  }

  const allCandidates: SignalCampaignDiscoveryCandidate[] = []

  try {
    for (const [index, query] of queries.entries()) {
      if (index > 0) await delay(450)

      const response = await fetch("https://api.tavily.com/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          api_key: apiKey,
          query,
          search_depth: "basic",
          include_answer: false,
          include_raw_content: false,
          max_results: Math.min(8, Math.max(3, input.maxCandidates)),
        }),
        signal: AbortSignal.timeout(15_000),
      })

      if (!response.ok) {
        return {
          ok: false,
          provider: "tavily",
          queries,
          candidates: allCandidates,
          setup_message: `Tavily campaign discovery failed with status ${response.status}.`,
        }
      }

      const data = await response.json()
      const rawResults = Array.isArray(data?.results) ? data.results : []
      const playbook = getSignalPlaybook(input.playbooks[Math.min(index, input.playbooks.length - 1)])

      for (const result of rawResults as Array<Record<string, unknown>>) {
        const url = typeof result.url === "string" ? result.url : ""
        if (!url || !/^https?:\/\//i.test(url)) continue

        const title = clean(typeof result.title === "string" ? result.title : url)
        const content = clean(typeof result.content === "string" ? result.content : "")
        const sourceType = classifyUrl(url)
        const confidence = campaignCandidateConfidence({
          city: input.city,
          content,
          sourceType,
          state: input.state,
          title,
        })
        const status = campaignStatusForCandidate({ confidence, sourceType })

        allCandidates.push({
          business_name: extractCampaignBusinessName(title, url),
          city: clean(input.city) || null,
          state: clean(input.state) || null,
          industry_hint: playbook.name,
          candidate_url: url,
          likely_official_url: sourceType === "likely_official_site" ? url : null,
          source_url: url,
          source_title: title,
          source_snippet: content.slice(0, 360) || title,
          source_provider: "tavily",
          official_source_confidence: confidence,
          candidate_status: status,
          reason:
            sourceType === "likely_official_site"
              ? "Public web result may be an official business website. Confirm before importing."
              : "Public web result is not an official website candidate by itself. Choose an official site before importing.",
        })
      }

      if (allCandidates.length >= input.maxCandidates * 2) break
    }

    const candidates = dedupeCampaignCandidates(allCandidates)
      .sort((a, b) => {
        const rank = { high: 3, medium: 2, low: 1 }
        const statusBoost = (candidate: SignalCampaignDiscoveryCandidate) =>
          candidate.candidate_status === "pending_review" ? 2 : 0
        return (
          rank[b.official_source_confidence] +
          statusBoost(b) -
          (rank[a.official_source_confidence] + statusBoost(a))
        )
      })
      .slice(0, input.maxCandidates)

    return {
      ok: true,
      provider: "tavily",
      queries,
      candidates,
      setup_message: null,
    }
  } catch (error) {
    return {
      ok: false,
      provider: "tavily",
      queries,
      candidates: allCandidates.slice(0, input.maxCandidates),
      setup_message:
        error instanceof Error ? error.message : "Campaign discovery could not complete.",
    }
  }
}

function dedupeCandidates(candidates: SignalResearchCandidate[]) {
  const seen = new Set<string>()
  return candidates.filter((candidate) => {
    const host = normalizeSignalHostname(candidate.url)
    const key = host || candidate.url
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

export async function runSignalPublicResearch(input: {
  businessName: string
  industryHint?: string | null
  location: string
}): Promise<SignalResearchResult> {
  const query = buildSignalResearchQuery(input)
  const provider = process.env.SIGNAL_RESEARCH_PROVIDER?.trim().toLowerCase()

  if (provider !== "tavily") {
    return {
      ok: false,
      provider: "disabled",
      query,
      candidates: [],
      setup_message:
        "Signal research provider is disabled. Set SIGNAL_RESEARCH_PROVIDER=tavily and TAVILY_API_KEY server-side to enable Quick Research.",
    }
  }

  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    return {
      ok: false,
      provider: "tavily",
      query,
      candidates: [],
      setup_message:
        "Tavily is selected, but TAVILY_API_KEY is missing. Manual Signal workflows still work.",
    }
  }

  try {
    const response = await fetch("https://api.tavily.com/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        api_key: apiKey,
        query,
        search_depth: "basic",
        include_answer: false,
        include_raw_content: false,
        max_results: 8,
      }),
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) {
      return {
        ok: false,
        provider: "tavily",
        query,
        candidates: [],
        setup_message: `Tavily research failed with status ${response.status}.`,
      }
    }

    const data = await response.json()
    const rawResults = Array.isArray(data?.results) ? data.results : []
    const candidates = dedupeCandidates(
      rawResults
        .map((result: Record<string, unknown>) => {
          const url = typeof result.url === "string" ? result.url : ""
          if (!url || !/^https?:\/\//i.test(url)) return null

          const title = clean(typeof result.title === "string" ? result.title : url)
          const content = clean(typeof result.content === "string" ? result.content : "")
          const sourceType = classifyUrl(url)
          return {
            title,
            url,
            source_type: sourceType,
            evidence: content.slice(0, 260) || title,
            confidence: candidateConfidence({
              businessName: input.businessName,
              content,
              location: input.location,
              title,
              url,
            }),
          } satisfies SignalResearchCandidate
        })
        .filter(Boolean) as SignalResearchCandidate[],
    )
      .sort((a, b) => {
        const rank = { high: 3, medium: 2, low: 1 }
        const typeBoost = (candidate: SignalResearchCandidate) =>
          candidate.source_type === "likely_official_site" ? 2 : 0
        return rank[b.confidence] + typeBoost(b) - (rank[a.confidence] + typeBoost(a))
      })
      .slice(0, 3)

    return {
      ok: true,
      provider: "tavily",
      query,
      candidates,
      setup_message: null,
    }
  } catch (error) {
    return {
      ok: false,
      provider: "tavily",
      query,
      candidates: [],
      setup_message:
        error instanceof Error ? error.message : "Tavily research could not complete.",
    }
  }
}

export function findLikelySignalDuplicates(
  prospects: SignalProspect[],
  input: {
    businessName: string
    websiteUrl?: string | null
    email?: string | null
    phone?: string | null
  },
) {
  const inputName = normalizeSignalBusinessName(input.businessName)
  const inputHost = normalizeSignalHostname(input.websiteUrl)
  const inputEmail = input.email?.trim().toLowerCase() || ""
  const inputPhone = normalizeSignalPhone(input.phone)

  return prospects
    .map((prospect) => {
      let score = 0
      const reasons: string[] = []

      const prospectName = normalizeSignalBusinessName(prospect.business_name)
      const prospectHost = normalizeSignalHostname(prospect.website_url)
      const prospectEmail = prospect.public_email?.trim().toLowerCase() || ""
      const prospectPhone = normalizeSignalPhone(prospect.public_phone)

      if (inputName && prospectName && inputName === prospectName) {
        score += 4
        reasons.push("business name")
      } else if (
        inputName &&
        prospectName &&
        (inputName.includes(prospectName) || prospectName.includes(inputName))
      ) {
        score += 2
        reasons.push("similar business name")
      }

      if (inputHost && prospectHost && inputHost === prospectHost) {
        score += 5
        reasons.push("website host")
      }
      if (inputEmail && prospectEmail && inputEmail === prospectEmail) {
        score += 5
        reasons.push("public email")
      }
      if (inputPhone && prospectPhone && inputPhone === prospectPhone) {
        score += 5
        reasons.push("public phone")
      }

      return { prospect, score, reasons }
    })
    .filter((match) => match.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
}
