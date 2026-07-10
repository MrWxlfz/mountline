import "server-only"

import type {
  SignalAiProviderMode,
  SignalMarketResearchDepth,
  SignalResearchProviderMode,
  SignalScreenshotProviderMode,
} from "@/lib/supabase/types"

export type SignalProviderSearchResult = {
  provider: Exclude<SignalResearchProviderMode, "hybrid" | "disabled">
  query: string
  title: string
  url: string
  snippet: string
  source_label: string
}

export type SignalProviderSearchResponse = {
  results: SignalProviderSearchResult[]
  provider_mode: SignalResearchProviderMode
  setup_messages: string[]
  usage: {
    tavily_searches: number
    firecrawl_searches: number
    firecrawl_credits: number
  }
}

export type SignalFirecrawlPageEvidence = {
  provider: "firecrawl"
  url: string
  title: string | null
  description: string | null
  markdown_excerpt: string | null
  links: string[]
  credits_used: number
  error: string | null
}

export type SignalMarketUsageEstimate = {
  provider_mode: SignalResearchProviderMode
  candidate_limit: number
  research_depth: SignalMarketResearchDepth
  tavily_searches: number
  firecrawl_searches: number
  firecrawl_pages_per_candidate: number
  estimated_firecrawl_pages: number
  max_firecrawl_credits: number
  screenshot_provider: SignalScreenshotProviderMode
  estimated_screenshots: number
  ai_provider: SignalAiProviderMode
  estimated_fast_ai_analyses: number
  estimated_credit_budget: number
  stop_conditions: string[]
}

export type SignalMarketRuntimeConfig = {
  maxCandidates: number
  maxFirecrawlPagesPerCandidate: number
  maxFirecrawlCreditsPerMarket: number
  visualShortlistThreshold: number
  visualMaxScreenshotsPerMarket: number
}

export type SignalAiProviderSetup = {
  provider: SignalAiProviderMode
  enabled: boolean
  missing_env: string[]
  message: string | null
}

const FIRECRAWL_BASE_URL = "https://api.firecrawl.dev/v2"

function clean(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || ""
}

function intFromEnv(name: string, fallback: number) {
  const value = Number.parseInt(process.env[name] || "", 10)
  return Number.isFinite(value) && value > 0 ? value : fallback
}

function bounded(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, Math.round(value)))
}

export function getSignalResearchProviderMode(): SignalResearchProviderMode {
  const provider = process.env.SIGNAL_RESEARCH_PROVIDER?.trim().toLowerCase()
  if (provider === "disabled") return "disabled"
  if (provider === "tavily" || provider === "firecrawl" || provider === "hybrid") {
    return provider
  }
  // Lead runs should work from the keys already configured for Signal. An
  // explicit provider mode still wins for teams that need to constrain usage.
  if (process.env.TAVILY_API_KEY && process.env.FIRECRAWL_API_KEY) return "hybrid"
  if (process.env.TAVILY_API_KEY) return "tavily"
  if (process.env.FIRECRAWL_API_KEY) return "firecrawl"
  return "disabled"
}

export function getSignalScreenshotProviderMode(): SignalScreenshotProviderMode {
  const provider = process.env.SIGNAL_SCREENSHOT_PROVIDER?.trim().toLowerCase()
  if (
    provider === "browserless" ||
    provider === "firecrawl" ||
    provider === "manual" ||
    provider === "disabled"
  ) {
    return provider
  }
  return "manual"
}

export function getSignalAiProviderMode(): SignalAiProviderMode {
  const provider = process.env.SIGNAL_AI_PROVIDER?.trim().toLowerCase()
  if (provider === "disabled") return "disabled"
  if (provider === "gemini" || provider === "openai") return provider
  if (process.env.GEMINI_API_KEY) return "gemini"
  if (process.env.OPENAI_API_KEY) return "openai"
  return "disabled"
}

export function getSignalAiProviderSetup(): SignalAiProviderSetup {
  const provider = getSignalAiProviderMode()
  if (provider === "disabled") {
    const explicitlyDisabled = process.env.SIGNAL_AI_PROVIDER?.trim().toLowerCase() === "disabled"
    return {
      provider,
      enabled: false,
      missing_env: explicitlyDisabled ? [] : ["GEMINI_API_KEY or OPENAI_API_KEY"],
      message: explicitlyDisabled
        ? "AI generation is disabled. Signal will use deterministic scoring and sales-pack fallbacks."
        : "No AI key is configured. Signal will use deterministic scoring and sales-pack fallbacks.",
    }
  }

  const requiredKey = provider === "gemini" ? "GEMINI_API_KEY" : "OPENAI_API_KEY"
  const hasKey = Boolean(process.env[requiredKey])
  return {
    provider,
    enabled: hasKey,
    missing_env: hasKey ? [] : [requiredKey],
    message: hasKey ? null : `${provider === "gemini" ? "Gemini" : "OpenAI"} is selected, but ${requiredKey} is missing.`,
  }
}

export function getSignalMarketRuntimeConfig(): SignalMarketRuntimeConfig {
  return {
    maxCandidates: bounded(intFromEnv("SIGNAL_MARKET_MAX_CANDIDATES", 25), 1, 50),
    maxFirecrawlPagesPerCandidate: bounded(
      intFromEnv("SIGNAL_FIRECRAWL_MAX_PAGES_PER_CANDIDATE", 3),
      1,
      8,
    ),
    maxFirecrawlCreditsPerMarket: bounded(
      intFromEnv("SIGNAL_FIRECRAWL_MAX_CREDITS_PER_MARKET", 150),
      1,
      500,
    ),
    visualShortlistThreshold: bounded(intFromEnv("SIGNAL_VISUAL_SHORTLIST_THRESHOLD", 70), 1, 100),
    visualMaxScreenshotsPerMarket: bounded(
      intFromEnv("SIGNAL_VISUAL_MAX_SCREENSHOTS_PER_MARKET", 8),
      0,
      30,
    ),
  }
}

export function firecrawlPageLimitForDepth(depth: SignalMarketResearchDepth) {
  const config = getSignalMarketRuntimeConfig()
  const requested = depth === "quick" ? 1 : depth === "balanced" ? 3 : 6
  return Math.min(requested, config.maxFirecrawlPagesPerCandidate)
}

export function estimateSignalMarketUsage(input: {
  industries: string[]
  maxCandidates?: number | null
  researchDepth?: SignalMarketResearchDepth | null
}): SignalMarketUsageEstimate {
  const config = getSignalMarketRuntimeConfig()
  const providerMode = getSignalResearchProviderMode()
  const candidateLimit = bounded(input.maxCandidates || config.maxCandidates, 1, config.maxCandidates)
  const researchDepth = input.researchDepth || "balanced"
  const queryCount = Math.max(1, input.industries.length * 2)
  const includesTavily = providerMode === "tavily" || providerMode === "hybrid"
  const includesFirecrawl = providerMode === "firecrawl" || providerMode === "hybrid"
  const pagesPerCandidate = firecrawlPageLimitForDepth(researchDepth)
  const firecrawlSearches = includesFirecrawl ? queryCount : 0
  const firecrawlPages = includesFirecrawl ? candidateLimit * pagesPerCandidate : 0
  const screenshotProvider = getSignalScreenshotProviderMode()
  const estimatedScreenshots =
    screenshotProvider === "browserless" || screenshotProvider === "firecrawl"
      ? Math.min(config.visualMaxScreenshotsPerMarket, Math.ceil(candidateLimit * 0.35))
      : 0
  const aiProvider = getSignalAiProviderMode()
  const estimatedAi = aiProvider === "disabled" ? 0 : candidateLimit

  return {
    provider_mode: providerMode,
    candidate_limit: candidateLimit,
    research_depth: researchDepth,
    tavily_searches: includesTavily ? queryCount : 0,
    firecrawl_searches: firecrawlSearches,
    firecrawl_pages_per_candidate: pagesPerCandidate,
    estimated_firecrawl_pages: firecrawlPages,
    max_firecrawl_credits: config.maxFirecrawlCreditsPerMarket,
    screenshot_provider: screenshotProvider,
    estimated_screenshots: estimatedScreenshots,
    ai_provider: aiProvider,
    estimated_fast_ai_analyses: estimatedAi,
    estimated_credit_budget: firecrawlSearches + firecrawlPages + (screenshotProvider === "firecrawl" ? estimatedScreenshots : 0),
    stop_conditions: [
      `Stop Firecrawl extraction at ${config.maxFirecrawlCreditsPerMarket} estimated credits.`,
      `Read at most ${pagesPerCandidate} official-site page${pagesPerCandidate === 1 ? "" : "s"} per candidate.`,
      `Shortlist at most ${config.visualMaxScreenshotsPerMarket} screenshot candidate${config.visualMaxScreenshotsPerMarket === 1 ? "" : "s"}.`,
      `Do not research more than ${candidateLimit} candidate${candidateLimit === 1 ? "" : "s"} for this market.`,
    ],
  }
}

async function tavilySearch(query: string, maxResults: number) {
  const apiKey = process.env.TAVILY_API_KEY
  if (!apiKey) {
    return {
      setupMessage: "Tavily is selected, but TAVILY_API_KEY is missing.",
      results: [] as SignalProviderSearchResult[],
    }
  }

  const response = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: apiKey,
      query,
      search_depth: "basic",
      include_answer: false,
      include_raw_content: false,
      max_results: maxResults,
    }),
    signal: AbortSignal.timeout(15_000),
  })

  if (!response.ok) {
    return {
      setupMessage: `Tavily search failed with status ${response.status}.`,
      results: [] as SignalProviderSearchResult[],
    }
  }

  const data = await response.json()
  const rawResults = Array.isArray(data?.results) ? data.results : []
  return {
    setupMessage: null,
    results: rawResults
      .map((result: Record<string, unknown>) => {
        const url = typeof result.url === "string" ? result.url : ""
        if (!/^https?:\/\//i.test(url)) return null
        return {
          provider: "tavily" as const,
          query,
          title: clean(typeof result.title === "string" ? result.title : url),
          url,
          snippet: clean(typeof result.content === "string" ? result.content : ""),
          source_label: "Tavily public web result",
        }
      })
      .filter(Boolean) as SignalProviderSearchResult[],
  }
}

/**
 * Lead Runs deliberately keep discovery on Tavily. Firecrawl is used after a
 * public official URL passes the website scanner's SSRF-safe validation.
 */
export async function searchSignalTavilyPublicWeb({
  maxResults,
  query,
}: {
  maxResults: number
  query: string
}) {
  try {
    const response = await tavilySearch(query, maxResults)
    return {
      results: response.results,
      setup_messages: response.setupMessage ? [response.setupMessage] : [],
    }
  } catch (error) {
    return {
      results: [] as SignalProviderSearchResult[],
      setup_messages: [error instanceof Error ? error.message : "Tavily search failed."],
    }
  }
}

async function firecrawlSearch(query: string, maxResults: number) {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) {
    return {
      setupMessage: "Firecrawl is selected, but FIRECRAWL_API_KEY is missing.",
      creditsUsed: 0,
      results: [] as SignalProviderSearchResult[],
    }
  }

  const response = await fetch(`${FIRECRAWL_BASE_URL}/search`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query,
      limit: maxResults,
      sources: ["web"],
      country: "US",
      timeout: 60_000,
      ignoreInvalidURLs: true,
    }),
    signal: AbortSignal.timeout(25_000),
  })

  if (!response.ok) {
    return {
      setupMessage: `Firecrawl search failed with status ${response.status}.`,
      creditsUsed: 0,
      results: [] as SignalProviderSearchResult[],
    }
  }

  const data = await response.json()
  const rawWebResults = Array.isArray(data?.data?.web)
    ? data.data.web
    : Array.isArray(data?.data)
      ? data.data
      : []

  return {
    setupMessage: typeof data?.warning === "string" ? data.warning : null,
    creditsUsed: Number(data?.creditsUsed || data?.credits_used || 0) || 0,
    results: rawWebResults
      .map((result: Record<string, unknown>) => {
        const url = typeof result.url === "string" ? result.url : ""
        if (!/^https?:\/\//i.test(url)) return null
        return {
          provider: "firecrawl" as const,
          query,
          title: clean(typeof result.title === "string" ? result.title : url),
          url,
          snippet: clean(
            typeof result.description === "string"
              ? result.description
              : typeof result.markdown === "string"
                ? result.markdown.slice(0, 500)
                : "",
          ),
          source_label: "Firecrawl public web result",
        }
      })
      .filter(Boolean) as SignalProviderSearchResult[],
  }
}

export async function searchSignalResearchProviders({
  maxResultsPerQuery,
  queries,
}: {
  maxResultsPerQuery: number
  queries: string[]
}): Promise<SignalProviderSearchResponse> {
  const providerMode = getSignalResearchProviderMode()
  const setupMessages: string[] = []
  const usage = {
    tavily_searches: 0,
    firecrawl_searches: 0,
    firecrawl_credits: 0,
  }
  const results: SignalProviderSearchResult[] = []

  if (providerMode === "disabled") {
    return {
      results,
      provider_mode: providerMode,
      setup_messages: [
        "Signal public research is disabled. Set SIGNAL_RESEARCH_PROVIDER=tavily, firecrawl, or hybrid to build markets.",
      ],
      usage,
    }
  }

  for (const query of queries) {
    if (providerMode === "tavily" || providerMode === "hybrid") {
      usage.tavily_searches += 1
      try {
        const response = await tavilySearch(query, maxResultsPerQuery)
        if (response.setupMessage) setupMessages.push(response.setupMessage)
        results.push(...response.results)
      } catch (error) {
        setupMessages.push(error instanceof Error ? error.message : "Tavily search failed.")
      }
    }

    if (providerMode === "firecrawl" || providerMode === "hybrid") {
      usage.firecrawl_searches += 1
      try {
        const response = await firecrawlSearch(query, maxResultsPerQuery)
        if (response.setupMessage) setupMessages.push(response.setupMessage)
        usage.firecrawl_credits += response.creditsUsed
        results.push(...response.results)
      } catch (error) {
        setupMessages.push(error instanceof Error ? error.message : "Firecrawl search failed.")
      }
    }
  }

  return {
    results,
    provider_mode: providerMode,
    setup_messages: Array.from(new Set(setupMessages)).slice(0, 6),
    usage,
  }
}

export async function mapFirecrawlSite(url: string, limit: number) {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) return { links: [] as Array<{ url: string; title: string | null; description: string | null }>, creditsUsed: 0 }

  const response = await fetch(`${FIRECRAWL_BASE_URL}/map`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      sitemap: "include",
      includeSubdomains: false,
      ignoreQueryParameters: true,
      limit: Math.max(1, Math.min(limit, 20)),
      timeout: 15_000,
      location: { country: "US", languages: ["en-US"] },
    }),
    signal: AbortSignal.timeout(20_000),
  })

  if (!response.ok) return { links: [], creditsUsed: 0 }
  const data = await response.json()
  const links = Array.isArray(data?.links) ? data.links : []
  return {
    links: links
      .map((link: Record<string, unknown>) => ({
        url: typeof link.url === "string" ? link.url : "",
        title: typeof link.title === "string" ? link.title : null,
        description: typeof link.description === "string" ? link.description : null,
      }))
      .filter((link: { url: string }) => /^https?:\/\//i.test(link.url)),
    creditsUsed: Number(data?.creditsUsed || data?.credits_used || 0) || 0,
  }
}

export async function scrapeFirecrawlPage(url: string): Promise<SignalFirecrawlPageEvidence> {
  const apiKey = process.env.FIRECRAWL_API_KEY
  if (!apiKey) {
    return {
      provider: "firecrawl",
      url,
      title: null,
      description: null,
      markdown_excerpt: null,
      links: [],
      credits_used: 0,
      error: "FIRECRAWL_API_KEY is missing.",
    }
  }

  const response = await fetch(`${FIRECRAWL_BASE_URL}/scrape`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      url,
      formats: ["markdown", "links"],
      onlyMainContent: true,
      timeout: 30_000,
      removeBase64Images: true,
      blockAds: true,
      location: { country: "US", languages: ["en-US"] },
    }),
    signal: AbortSignal.timeout(35_000),
  })

  if (!response.ok) {
    return {
      provider: "firecrawl",
      url,
      title: null,
      description: null,
      markdown_excerpt: null,
      links: [],
      credits_used: 0,
      error: `Firecrawl scrape failed with status ${response.status}.`,
    }
  }

  const data = await response.json()
  const markdown = typeof data?.data?.markdown === "string" ? data.data.markdown : ""
  const metadata = data?.data?.metadata && typeof data.data.metadata === "object"
    ? data.data.metadata as Record<string, unknown>
    : {}
  return {
    provider: "firecrawl",
    url,
    title: typeof metadata.title === "string" ? metadata.title : null,
    description: typeof metadata.description === "string" ? metadata.description : null,
    markdown_excerpt: clean(markdown).slice(0, 2200) || null,
    links: Array.isArray(data?.data?.links)
      ? data.data.links.filter((link: unknown): link is string => typeof link === "string").slice(0, 40)
      : [],
    credits_used: Number(data?.creditsUsed || data?.credits_used || 0) || 1,
    error: null,
  }
}
