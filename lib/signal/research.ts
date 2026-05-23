import "server-only"

import type { SignalConfidence, SignalProspect } from "@/lib/supabase/types"

export type SignalResearchCandidate = {
  title: string
  url: string
  source_type: "likely_official_site" | "directory" | "social" | "search_result" | "unknown"
  evidence: string
  confidence: SignalConfidence
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
