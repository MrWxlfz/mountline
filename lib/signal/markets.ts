import "server-only"

import { findSignalCandidateSuppression, isSignalProspectSuppressed } from "./alerts"
import { runInitialAiAnalysis } from "./ai"
import {
  buildSignalClassificationFields,
  resolveSignalClassification,
  syncSignalProspectAliases,
} from "./classification"
import { runAndStoreInitialSignalAnalysis } from "./analysis"
import {
  estimateSignalMarketUsage,
  firecrawlPageLimitForDepth,
  getSignalAiProviderMode,
  getSignalMarketRuntimeConfig,
  getSignalResearchProviderMode,
  getSignalScreenshotProviderMode,
  mapFirecrawlSite,
  scrapeFirecrawlPage,
  searchSignalResearchProviders,
  type SignalFirecrawlPageEvidence,
  type SignalMarketUsageEstimate,
  type SignalProviderSearchResult,
} from "./providers"
import { getSignalPlaybook, type SignalPlaybookKey } from "./playbooks"
import {
  classifySignalResearchUrl,
  findLikelySignalDuplicates,
  isClearlyNonOfficialSignalSource,
  normalizeSignalBusinessName,
  normalizeSignalHostname,
} from "./research"
import {
  buildDeterministicInitialAnalysis,
  calibrateInitialAnalysisOutput,
  getSignalOpportunityCalibration,
} from "./scoring"
import { normalizeProspectInput } from "./validation"
import { normalizeSignalUrl, scanSignalWebsite, type SignalWebsiteScan } from "./website"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalConfidence,
  SignalJson,
  SignalMarket,
  SignalMarketCandidate,
  SignalMarketResearchDepth,
  SignalProspect,
  SignalRecommendedLane,
  SignalRelevantDemo,
} from "@/lib/supabase/types"

type MarketProgress = {
  stage: string
  steps: Array<{ key: string; label: string; status: "pending" | "running" | "done" | "failed" }>
  counts: Record<string, number>
  usage: Record<string, unknown>
  setup_messages: string[]
  updated_at: string
}

type MarketUsage = {
  tavily_searches: number
  firecrawl_searches: number
  firecrawl_pages: number
  firecrawl_credits: number
  ai_fast_analyses: number
  screenshots: number
  setup_messages: string[]
  stopped_reason: string | null
}

const MARKET_STEPS = [
  { key: "discovery", label: "Finding businesses" },
  { key: "suppression", label: "Removing rejected matches" },
  { key: "duplicates", label: "Detecting duplicates" },
  { key: "official_sites", label: "Confirming official sites" },
  { key: "evidence", label: "Reading public websites" },
  { key: "scoring", label: "Calculating opportunity" },
  { key: "review", label: "Preparing ranked review" },
]

const MARKET_QUERY_TERMS: Record<SignalPlaybookKey, string[]> = {
  auto_detailing: ["auto detailing", "mobile detailing", "ceramic coating"],
  barber_salon: ["barber shop", "hair salon", "barber salon"],
  hvac: ["HVAC contractor", "air conditioning repair", "heating cooling company"],
  roofing_contractors_home_services: [
    "roofing contractor",
    "home services contractor",
    "remodeling contractor",
  ],
  medical_dental: ["dental office", "medical clinic"],
  restaurant_food: ["restaurant", "cafe", "catering"],
  beauty_wellness: ["beauty studio", "day spa", "wellness studio"],
  general_local_business: ["local service business", "local business official website"],
  unknown_needs_review: ["local service business", "official website"],
}

function clean(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || ""
}

function unique<T>(values: T[]) {
  return Array.from(new Set(values))
}

function nowIso() {
  return new Date().toISOString()
}

function stepProgress(stage: string, counts: Record<string, number>, usage: MarketUsage, setupMessages: string[] = []): MarketProgress {
  const activeIndex = MARKET_STEPS.findIndex((step) => step.key === stage)
  return {
    stage,
    steps: MARKET_STEPS.map((step, index) => ({
      ...step,
      status:
        activeIndex === -1
          ? "pending"
          : index < activeIndex
            ? "done"
            : index === activeIndex
              ? "running"
              : "pending",
    })),
    counts,
    usage,
    setup_messages: setupMessages,
    updated_at: nowIso(),
  }
}

function completedProgress(counts: Record<string, number>, usage: MarketUsage, setupMessages: string[] = []): MarketProgress {
  return {
    stage: "review",
    steps: MARKET_STEPS.map((step) => ({ ...step, status: "done" })),
    counts,
    usage,
    setup_messages: setupMessages,
    updated_at: nowIso(),
  }
}

export function buildSignalMarketDiscoveryQueries({
  city,
  industries,
  state,
}: {
  city: string
  industries: string[]
  state?: string | null
}) {
  const location = [clean(city), clean(state)].filter(Boolean).join(" ")
  return unique(
    industries.flatMap((industry) => {
      const key = industry as SignalPlaybookKey
      const terms = MARKET_QUERY_TERMS[key] || MARKET_QUERY_TERMS.general_local_business
      return terms.slice(0, 2).map((term) => `${term} ${location} official website`)
    }),
  ).slice(0, 16)
}

function extractBusinessNameFromSearch(result: SignalProviderSearchResult) {
  const titleName = clean(result.title)
    .replace(/\b(official\s+website|home\s+page|homepage|website|contact|services)\b/gi, " ")
    .split(/\s[-–—:]\s|\|/)[0]
    .replace(/\s+/g, " ")
    .trim()

  if (titleName && titleName.length >= 2 && !/^best\s+/i.test(titleName)) {
    return titleName.slice(0, 180)
  }

  const host = normalizeSignalHostname(result.url)
  const fallback = host
    .split(".")[0]
    ?.replace(/[-_]+/g, " ")
    .replace(/\b(tx|dfw|usa|www)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()

  return fallback ? fallback.replace(/\b\w/g, (letter) => letter.toUpperCase()).slice(0, 180) : "Unknown business"
}

function sourceConfidence(result: SignalProviderSearchResult, city: string, state?: string | null): SignalConfidence {
  if (classifySignalResearchUrl(result.url) !== "likely_official_site") return "low"
  const text = `${result.title} ${result.snippet}`.toLowerCase()
  const cityHit = clean(city) ? text.includes(clean(city).toLowerCase()) : false
  const stateHit = clean(state) ? text.includes(clean(state).toLowerCase()) : false
  if (cityHit && stateHit) return "high"
  if (cityHit || stateHit) return "medium"
  return "medium"
}

function dedupeSearchResults(results: SignalProviderSearchResult[]) {
  const seen = new Set<string>()
  return results.filter((result) => {
    const host = normalizeSignalHostname(result.url)
    const name = normalizeSignalBusinessName(extractBusinessNameFromSearch(result))
    const key = [name, host].filter(Boolean).join(":") || result.url
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function buildTemporaryMarketProspect({
  candidate,
  classificationPlaybook,
  scan,
}: {
  candidate: Pick<
    SignalMarketCandidate,
    "business_name" | "city" | "state" | "industry_hint" | "category" | "confirmed_official_url" | "likely_official_url" | "candidate_url" | "quick_score_summary"
  >
  classificationPlaybook?: string | null
  scan: SignalWebsiteScan | null
}): SignalProspect {
  const now = nowIso()
  const playbook = getSignalPlaybook((classificationPlaybook || candidate.category || "general_local_business") as SignalPlaybookKey)

  return {
    id: "market-temp",
    created_at: now,
    updated_at: now,
    business_name: candidate.business_name,
    contact_name: null,
    industry: candidate.industry_hint || playbook.name,
    industry_playbook: playbook.key,
    compliance_tier: playbook.complianceTier,
    city: candidate.city,
    state: candidate.state,
    locality_relationship: null,
    website_url: candidate.confirmed_official_url || candidate.likely_official_url || candidate.candidate_url,
    public_email: scan?.visible_emails[0] || null,
    public_phone: scan?.visible_phones[0] || null,
    public_contact_form_url: scan?.booking_links[0] || null,
    instagram_url: null,
    source: "public_web_research",
    existing_website_platform: scan?.detected_website_platform || null,
    existing_booking_platform: scan?.detected_booking_platform || null,
    human_notes: null,
    what_looks_good: null,
    visible_problem: null,
    relevant_demo: playbook.relevantDemo,
    outreach_mode: "professional_studio",
    locality_scope: "unknown",
    relationship_type: "none",
    outreach_history: "never_contacted",
    conversation_style: playbook.key === "medical_dental" ? "clinical_professional" : "friendly_local",
    conversation_style_reason: null,
    known_communication_context: null,
    public_brand_tone: null,
    suggested_communication_profile: null,
    communication_profile_reason: null,
    communication_profile_confirmed: false,
    script_guidance: null,
    normalized_business_name: null,
    normalized_hostname: null,
    public_email_normalized: null,
    public_phone_normalized: null,
    classification_source: null,
    classification_confidence: null,
    classification_evidence: [],
    classification_manual_override: false,
    classified_at: null,
    quick_score_updated_at: null,
    contact_readiness: scan?.visible_phones[0]
      ? "verified_phone_available"
      : scan?.visible_emails[0]
        ? "verified_email_available"
        : scan?.booking_links[0]
          ? "verified_contact_form_available"
          : "contact_missing",
    contact_readiness_reason: null,
    outreach_status: "needs_review",
    contacted_at: null,
    follow_up_date: null,
    assigned_to: null,
    last_researched_at: null,
  }
}

function outreachReadinessScore(scan: SignalWebsiteScan | null) {
  let score = 15
  if (scan?.visible_phones.length) score += 35
  if (scan?.visible_emails.length) score += 25
  if (scan?.booking_links.length) score += 15
  if (scan && !scan.broken_response) score += 10
  return Math.max(0, Math.min(100, score))
}

function selectUsefulUrls(homeUrl: string, scan: SignalWebsiteScan | null, mappedLinks: Array<{ url: string }>, limit: number) {
  const words = ["service", "services", "menu", "pricing", "gallery", "portfolio", "contact", "about", "booking", "book", "appointment", "locations"]
  const home = normalizeSignalUrl(homeUrl)
  const candidates = unique([
    ...(scan?.pages.flatMap((page) => page.links) || []),
    ...mappedLinks.map((link) => link.url),
  ]).filter((rawUrl) => {
    try {
      const url = new URL(rawUrl)
      if (home && url.origin !== home.origin) return false
      const lower = url.toString().toLowerCase()
      return words.some((word) => lower.includes(word)) && !/login|account|cart|checkout|wp-admin|admin/.test(lower)
    } catch {
      return false
    }
  })

  return unique([homeUrl, ...candidates]).slice(0, limit)
}

function evidenceItem({
  confidence,
  provider,
  snippet,
  sourceType,
  type,
  url,
}: {
  type: string
  snippet: string
  url?: string | null
  provider: string
  sourceType: string
  confidence: SignalConfidence
}) {
  return {
    type,
    snippet,
    url: url || null,
    provider,
    source_type: sourceType,
    confidence,
    captured_at: nowIso(),
  }
}

function buildMarketEvidenceGraph({
  candidate,
  classificationEvidence,
  firecrawlEvidence,
  scan,
  summary,
}: {
  candidate: SignalMarketCandidate
  classificationEvidence: string[]
  firecrawlEvidence: SignalFirecrawlPageEvidence[]
  scan: SignalWebsiteScan | null
  summary: Record<string, unknown>
}) {
  const facts = [
    candidate.confirmed_official_url || candidate.likely_official_url
      ? evidenceItem({
          type: "official_url",
          snippet: candidate.confirmed_official_url || candidate.likely_official_url || "",
          url: candidate.confirmed_official_url || candidate.likely_official_url,
          provider: "signal",
          sourceType: "official_site",
          confidence: candidate.official_source_confidence || "medium",
        })
      : null,
    ...(scan?.evidence || []).map((item) =>
      evidenceItem({
        type: item.signal,
        snippet: item.snippet,
        url: item.url,
        provider: "signal_scanner",
        sourceType: "official_site",
        confidence: item.confidence,
      }),
    ),
    ...firecrawlEvidence
      .filter((item) => item.markdown_excerpt)
      .map((item) =>
        evidenceItem({
          type: "firecrawl_page_excerpt",
          snippet: item.markdown_excerpt || "",
          url: item.url,
          provider: "firecrawl",
          sourceType: "official_site",
          confidence: item.error ? "low" : "medium",
        }),
      ),
  ].filter(Boolean)

  const inferences = [
    candidate.category
      ? evidenceItem({
          type: "category_classification",
          snippet: `Classified as ${candidate.category} with ${candidate.category_confidence || "low"} confidence.`,
          provider: "signal_classification",
          sourceType: "AI_interpretation",
          confidence: candidate.category_confidence || "low",
        })
      : null,
    ...classificationEvidence.map((snippet) =>
      evidenceItem({
        type: "classification_evidence",
        snippet,
        provider: "signal_classification",
        sourceType: "AI_interpretation",
        confidence: candidate.category_confidence || "low",
      }),
    ),
    candidate.recommended_lane
      ? evidenceItem({
          type: "recommended_lane",
          snippet: `${candidate.recommended_lane.replace(/_/g, " ")} based on preliminary scoring.`,
          provider: "signal_scoring",
          sourceType: "AI_interpretation",
          confidence: candidate.confidence || "low",
        })
      : null,
  ].filter(Boolean)

  const playbook = getSignalPlaybook((candidate.category || "general_local_business") as SignalPlaybookKey)
  const discoveryQuestions = playbook.discoveryQuestions.slice(0, 5).map((question) =>
    evidenceItem({
      type: "discovery_question",
      snippet: question,
      provider: "signal_playbook",
      sourceType: "human_observation",
      confidence: "medium",
    }),
  )

  return {
    verified_facts: facts.slice(0, 24),
    reasonable_inferences: inferences.slice(0, 12),
    discovery_questions: discoveryQuestions,
    unknowns: [
      "Decision maker and preferred contact route require human confirmation.",
      "Systems opportunities are discovery questions unless directly supported by public site copy.",
      "No outreach has been sent automatically.",
    ],
    source_urls: unique([
      candidate.candidate_url,
      candidate.likely_official_url,
      candidate.confirmed_official_url,
      ...(scan?.scanned_urls || []),
      ...firecrawlEvidence.map((item) => item.url),
    ].filter(Boolean) as string[]),
    summary,
    generated_at: nowIso(),
  }
}

function isSignalWebsiteScan(value: unknown): value is SignalWebsiteScan {
  return Boolean(
    value &&
      typeof value === "object" &&
      "scanned_at" in value &&
      "broken_response" in value &&
      "evidence" in value,
  )
}

async function updateMarket(
  marketId: string,
  update: Record<string, unknown>,
) {
  const supabase = createAdminClient()
  await supabase.from("signal_markets").update(update).eq("id", marketId)
}

async function collectFirecrawlEvidence({
  depth,
  officialUrl,
  scan,
  usage,
}: {
  depth: SignalMarketResearchDepth
  officialUrl: string
  scan: SignalWebsiteScan | null
  usage: MarketUsage
}) {
  const providerMode = getSignalResearchProviderMode()
  const config = getSignalMarketRuntimeConfig()
  if (providerMode !== "firecrawl" && providerMode !== "hybrid") return []
  if (!process.env.FIRECRAWL_API_KEY) {
    usage.setup_messages.push("Firecrawl evidence extraction skipped because FIRECRAWL_API_KEY is missing.")
    return []
  }

  const maxPages = firecrawlPageLimitForDepth(depth)
  if (usage.firecrawl_credits >= config.maxFirecrawlCreditsPerMarket) {
    usage.stopped_reason = `Firecrawl credit cap reached before reading ${officialUrl}.`
    return []
  }

  const mapped = maxPages > 1 ? await mapFirecrawlSite(officialUrl, maxPages * 3) : { links: [], creditsUsed: 0 }
  usage.firecrawl_credits += mapped.creditsUsed
  const urls = selectUsefulUrls(officialUrl, scan, mapped.links, maxPages)
  const evidence: SignalFirecrawlPageEvidence[] = []

  for (const url of urls) {
    if (usage.firecrawl_pages >= config.maxFirecrawlCreditsPerMarket) {
      usage.stopped_reason = "Firecrawl page cap reached while reading official sites."
      break
    }
    if (usage.firecrawl_credits >= config.maxFirecrawlCreditsPerMarket) {
      usage.stopped_reason = "Firecrawl credit cap reached while reading official sites."
      break
    }
    const page = await scrapeFirecrawlPage(url)
    usage.firecrawl_pages += 1
    usage.firecrawl_credits += page.credits_used
    if (page.error) usage.setup_messages.push(page.error)
    evidence.push(page)
  }

  return evidence
}

async function scoreMarketCandidate({
  candidate,
  depth,
  usage,
}: {
  candidate: SignalMarketCandidate
  depth: SignalMarketResearchDepth
  usage: MarketUsage
}) {
  const officialUrl = normalizeSignalUrl(candidate.confirmed_official_url || candidate.likely_official_url)
  if (!officialUrl) {
    return {
      update: {
        research_state: "needs_confirmation",
        error_message: "Candidate needs a confirmed official public website before scoring.",
      },
      scan: null,
      firecrawlEvidence: [] as SignalFirecrawlPageEvidence[],
      classificationEvidence: [] as string[],
    }
  }

  const pageLimit = firecrawlPageLimitForDepth(depth)
  const scan = await scanSignalWebsite(officialUrl.toString(), {
    maxSecondaryPages: Math.max(0, pageLimit - 1),
  })
  const firecrawlEvidence = await collectFirecrawlEvidence({
    depth,
    officialUrl: officialUrl.toString(),
    scan,
    usage,
  })
  const classification = await resolveSignalClassification({
    businessName: candidate.business_name,
    city: candidate.city,
    state: candidate.state,
    industryHint: candidate.industry_hint,
    websiteUrl: officialUrl.toString(),
    scan,
    sourceSnippet:
      firecrawlEvidence.find((item) => item.markdown_excerpt)?.markdown_excerpt ||
      null,
  })

  const prospect = {
    ...buildTemporaryMarketProspect({
      candidate: {
        ...candidate,
        confirmed_official_url: officialUrl.toString(),
      },
      classificationPlaybook: classification.playbook,
      scan,
    }),
    ...buildSignalClassificationFields(classification),
  } as SignalProspect

  const fallback = buildDeterministicInitialAnalysis(prospect, scan, [])
  if (getSignalAiProviderMode() !== "disabled") usage.ai_fast_analyses += 1
  const ai = await runInitialAiAnalysis(prospect, scan)
  const output = calibrateInitialAnalysisOutput(prospect, scan, ai?.output || fallback, [])
  const calibration = getSignalOpportunityCalibration(prospect, scan, [])
  const readinessScore = outreachReadinessScore(scan)
  const visualThreshold = getSignalMarketRuntimeConfig().visualShortlistThreshold
  const screenshotLimit = getSignalMarketRuntimeConfig().visualMaxScreenshotsPerMarket
  const shouldShortlistVisual =
    output.overall_opportunity_score >= visualThreshold &&
    usage.screenshots < screenshotLimit &&
    getSignalScreenshotProviderMode() !== "disabled"

  if (shouldShortlistVisual) usage.screenshots += 1

  const summary = {
    official_url: officialUrl.toString(),
    classification: {
      playbook: classification.playbook,
      source: classification.source,
      confidence: classification.confidence,
      evidence: classification.evidence,
    },
    quick_score: {
      overall_opportunity_score: output.overall_opportunity_score,
      website_opportunity_score: calibration.website_opportunity_score,
      systems_opportunity_score: calibration.systems_opportunity_score,
      outreach_readiness_score: readinessScore,
      priority: output.priority,
      recommended_lane: calibration.recommended_lane,
      recommended_demo: output.recommended_demo,
      confidence: output.confidence,
      scan_coverage_confidence: calibration.scan_coverage_confidence,
      scan_coverage_note: calibration.scan_coverage_note,
      executive_summary: output.executive_summary,
      ai_unavailable: !ai,
    },
    evidence: scan.evidence.slice(0, 8),
    firecrawl_pages: firecrawlEvidence.map((item) => ({
      url: item.url,
      title: item.title,
      error: item.error,
    })),
    updated_at: nowIso(),
  }

  const update = {
    category: classification.playbook,
    category_confidence: classification.confidence,
    confirmed_official_url: officialUrl.toString(),
    official_source_confidence: candidate.official_source_confidence || "medium",
    normalized_business_name: classification.normalizedBusinessName || null,
    normalized_hostname: classification.normalizedHostname || null,
    classified_at: classification.classifiedAt,
    quick_score_state: ai ? "scored" : "ai_unavailable",
    preliminary_priority: output.priority,
    confidence: output.confidence,
    website_opportunity_score: calibration.website_opportunity_score,
    systems_opportunity_score: calibration.systems_opportunity_score,
    outreach_readiness_score: readinessScore,
    pursuit_priority: output.priority,
    recommended_lane: calibration.recommended_lane,
    relevant_demo: output.recommended_demo,
    visual_state: shouldShortlistVisual
      ? "shortlisted_for_desktop_capture"
      : output.overall_opportunity_score >= visualThreshold
        ? "shortlist_limit_reached"
        : null,
    quick_score_summary: summary,
    evidence_graph: buildMarketEvidenceGraph({
      candidate: {
        ...candidate,
        category: classification.playbook,
        category_confidence: classification.confidence,
        confirmed_official_url: officialUrl.toString(),
        official_source_confidence: candidate.official_source_confidence || "medium",
        preliminary_priority: output.priority,
        confidence: output.confidence,
        website_opportunity_score: calibration.website_opportunity_score,
        systems_opportunity_score: calibration.systems_opportunity_score,
        outreach_readiness_score: readinessScore,
        recommended_lane: calibration.recommended_lane as SignalRecommendedLane,
        relevant_demo: output.recommended_demo as SignalRelevantDemo,
      },
      classificationEvidence: classification.evidence,
      firecrawlEvidence,
      scan,
      summary,
    }) as SignalJson,
    website_scan: scan as unknown as SignalJson,
    firecrawl_evidence: firecrawlEvidence as unknown as SignalJson,
    research_state: shouldShortlistVisual ? "visual_shortlisted" : "quick_scored",
    error_message: scan.broken_response ? scan.error : null,
  }

  return {
    update,
    scan,
    firecrawlEvidence,
    classificationEvidence: classification.evidence,
  }
}

export async function runSignalMarketBuild(marketId: string) {
  const supabase = createAdminClient()
  const { data: marketData, error: marketError } = await supabase
    .from("signal_markets")
    .select("*")
    .eq("id", marketId)
    .maybeSingle()

  if (marketError) throw new Error(marketError.message)
  if (!marketData) throw new Error("Market not found.")

  const market = marketData as SignalMarket
  const industries = (Array.isArray(market.industries) ? market.industries : []) as string[]
  const estimate = estimateSignalMarketUsage({
    industries,
    maxCandidates: market.max_candidates,
    researchDepth: market.research_depth,
  })
  const usage: MarketUsage = {
    tavily_searches: 0,
    firecrawl_searches: 0,
    firecrawl_pages: 0,
    firecrawl_credits: 0,
    ai_fast_analyses: 0,
    screenshots: 0,
    setup_messages: [],
    stopped_reason: null,
  }
  const counts = {
    discovered: 0,
    suppressed: 0,
    duplicates: 0,
    official_sites_resolved: 0,
    quick_scored: 0,
    visual_shortlisted: 0,
    a_leads: 0,
    b_leads: 0,
    needs_review: 0,
    failed: 0,
  }

  await updateMarket(market.id, {
    status: "discovering",
    provider_mode: estimate.provider_mode,
    estimated_credit_budget: estimate.estimated_credit_budget,
    progress: stepProgress("discovery", counts, usage),
    actual_credit_usage: usage,
    last_run_at: nowIso(),
    next_action: "Finding candidate businesses from permitted public web research.",
  })

  const queries = buildSignalMarketDiscoveryQueries({
    city: market.city,
    state: market.state,
    industries,
  })
  const providerSearch = await searchSignalResearchProviders({
    queries,
    maxResultsPerQuery: Math.max(4, Math.ceil(market.max_candidates / Math.max(1, queries.length)) + 2),
  })
  usage.tavily_searches += providerSearch.usage.tavily_searches
  usage.firecrawl_searches += providerSearch.usage.firecrawl_searches
  usage.firecrawl_credits += providerSearch.usage.firecrawl_credits
  usage.setup_messages.push(...providerSearch.setup_messages)

  const discoveryResults = dedupeSearchResults(providerSearch.results).slice(0, market.max_candidates)
  counts.discovered = discoveryResults.length

  await updateMarket(market.id, {
    status: "deduplicating",
    progress: stepProgress("suppression", counts, usage, usage.setup_messages),
    actual_credit_usage: usage,
    next_action: "Filtering suppressed records and likely duplicates.",
  })

  const { data: prospects } = await supabase.from("signal_prospects").select("*")
  const existingProspects = (prospects || []) as SignalProspect[]
  const { data: existingMarketCandidates } = await supabase
    .from("signal_market_candidates")
    .select("business_name, likely_official_url, confirmed_official_url, candidate_url, research_state")
    .eq("market_id", market.id)
  const lockedKeys = new Set(
    ((existingMarketCandidates || []) as Array<{
      business_name: string
      likely_official_url: string | null
      confirmed_official_url: string | null
      candidate_url: string | null
      research_state: string
    }>)
      .filter((candidate) => ["rejected", "approved", "imported_to_signal"].includes(candidate.research_state))
      .map((candidate) =>
        [
          normalizeSignalBusinessName(candidate.business_name),
          normalizeSignalHostname(candidate.confirmed_official_url || candidate.likely_official_url || candidate.candidate_url),
        ].join(":"),
      ),
  )

  await supabase
    .from("signal_market_candidates")
    .delete()
    .eq("market_id", market.id)
    .in("research_state", [
      "discovered",
      "suppressed",
      "duplicate",
      "needs_confirmation",
      "official_site_resolved",
      "researching",
      "quick_scored",
      "visual_shortlisted",
      "failed",
    ])

  const candidateRows: Array<Record<string, unknown>> = []
  for (const result of discoveryResults) {
    const businessName = extractBusinessNameFromSearch(result)
    const sourceType = classifySignalResearchUrl(result.url)
    const likelyOfficialUrl = sourceType === "likely_official_site" ? result.url : null
    const lockedKey = [
      normalizeSignalBusinessName(businessName),
      normalizeSignalHostname(likelyOfficialUrl || result.url),
    ].join(":")
    if (lockedKeys.has(lockedKey)) continue

    const suppression = await findSignalCandidateSuppression({
      businessName,
      city: market.city,
      hostname: likelyOfficialUrl || result.url,
    })
    const duplicate = findLikelySignalDuplicates(existingProspects, {
      businessName,
      city: market.city,
      websiteUrl: likelyOfficialUrl || result.url,
    })[0]
    const classification = await resolveSignalClassification({
      businessName,
      city: market.city,
      state: market.state,
      industryHint: getSignalPlaybook(industries[0] as SignalPlaybookKey).name,
      websiteUrl: likelyOfficialUrl || result.url,
      sourceTitle: result.title,
      sourceSnippet: result.snippet,
    })

    if (suppression) counts.suppressed += 1
    if (duplicate) counts.duplicates += 1
    if (likelyOfficialUrl && !suppression && !duplicate) counts.official_sites_resolved += 1

    candidateRows.push({
      market_id: market.id,
      business_name: businessName,
      city: market.city,
      state: market.state,
      industry_hint: getSignalPlaybook(classification.playbook).name,
      category: classification.playbook,
      category_confidence: classification.confidence,
      candidate_url: result.url,
      likely_official_url: likelyOfficialUrl,
      confirmed_official_url: likelyOfficialUrl && sourceConfidence(result, market.city, market.state) !== "low" ? likelyOfficialUrl : null,
      official_source_confidence: sourceConfidence(result, market.city, market.state),
      source_urls: [result.url],
      provider_sources: [
        {
          provider: result.provider,
          query: result.query,
          title: result.title,
          snippet: result.snippet,
          url: result.url,
        },
      ],
      duplicate_state: duplicate?.confidence || "none",
      duplicate_prospect_id: duplicate?.prospect.id || null,
      suppression_state: suppression ? "suppressed" : "clear",
      suppression_id: suppression?.id || null,
      research_state: suppression
        ? "suppressed"
        : duplicate
          ? "duplicate"
          : likelyOfficialUrl
            ? "official_site_resolved"
            : "needs_confirmation",
      quick_score_state: "not_started",
      confidence: classification.confidence,
      normalized_business_name: classification.normalizedBusinessName || null,
      normalized_hostname: classification.normalizedHostname || normalizeSignalHostname(likelyOfficialUrl || result.url) || null,
      classified_at: classification.classifiedAt,
      error_message: suppression
        ? "Suppressed by prior rejection or do-not-contact rule."
        : duplicate
          ? `${duplicate.confidence} duplicate: ${duplicate.reasons.join(", ")}.`
          : sourceType !== "likely_official_site"
            ? "Needs an official public website confirmation before research."
            : null,
    })
  }

  const { data: insertedCandidates, error: insertError } = candidateRows.length
    ? await supabase.from("signal_market_candidates").insert(candidateRows).select("*")
    : { data: [], error: null }

  if (insertError) {
    await updateMarket(market.id, {
      status: "failed",
      progress: { ...stepProgress("discovery", counts, usage, usage.setup_messages), error: insertError.message },
      actual_credit_usage: usage,
      next_action: insertError.message,
    })
    throw new Error(insertError.message)
  }

  await updateMarket(market.id, {
    status: "researching",
    progress: stepProgress("evidence", counts, usage, usage.setup_messages),
    actual_credit_usage: usage,
    next_action: "Reading confirmed official public sites for the strongest candidates.",
  })

  const candidates = ((insertedCandidates || []) as SignalMarketCandidate[])
    .filter((candidate) => candidate.research_state === "official_site_resolved")
    .slice(0, market.max_candidates)

  for (const candidate of candidates) {
    if (usage.stopped_reason) break
    await supabase
      .from("signal_market_candidates")
      .update({ research_state: "researching" })
      .eq("id", candidate.id)

    try {
      const scored = await scoreMarketCandidate({
        candidate,
        depth: market.research_depth,
        usage,
      })
      const candidateUpdate = scored.update as Record<string, unknown>
      const { error } = await supabase
        .from("signal_market_candidates")
        .update(candidateUpdate)
        .eq("id", candidate.id)

      if (error) throw new Error(error.message)

      counts.quick_scored += 1
      if (candidateUpdate.research_state === "visual_shortlisted") counts.visual_shortlisted += 1
      if (candidateUpdate.preliminary_priority === "A") counts.a_leads += 1
      if (candidateUpdate.preliminary_priority === "B") counts.b_leads += 1
    } catch (error) {
      counts.failed += 1
      await supabase
        .from("signal_market_candidates")
        .update({
          research_state: "failed",
          quick_score_state: "failed",
          error_message: error instanceof Error ? error.message : "Candidate scoring failed.",
        })
        .eq("id", candidate.id)
    }

    await updateMarket(market.id, {
      status: "scoring",
      progress: stepProgress("scoring", counts, usage, usage.setup_messages),
      actual_credit_usage: usage,
      next_action: "Scoring candidates and preparing the review queue.",
    })
  }

  counts.needs_review = Math.max(
    0,
    candidateRows.length - counts.suppressed - counts.duplicates - counts.quick_scored - counts.failed,
  )
  const finalStatus = candidateRows.length > 0 ? "ready_for_review" : "failed"
  const nextAction = candidateRows.length > 0
    ? "Review ranked candidates, confirm ambiguous official sites, and approve only prospects that should enter Focus Mode."
    : "No candidates were found. Check provider setup or try a broader industry."

  await updateMarket(market.id, {
    status: finalStatus,
    progress: completedProgress(counts, usage, usage.setup_messages),
    actual_credit_usage: usage,
    next_action: usage.stopped_reason ? `${nextAction} ${usage.stopped_reason}` : nextAction,
  })

  const { data: updatedMarket } = await supabase
    .from("signal_markets")
    .select("*")
    .eq("id", market.id)
    .single()
  const { data: updatedCandidates } = await supabase
    .from("signal_market_candidates")
    .select("*")
    .eq("market_id", market.id)
    .order("website_opportunity_score", { ascending: false, nullsFirst: false })

  return {
    market: updatedMarket as SignalMarket,
    candidates: (updatedCandidates || []) as SignalMarketCandidate[],
    usage,
    estimate,
  }
}

function mergeMarketCandidateFields(
  existing: SignalProspect,
  candidate: SignalMarketCandidate,
  scan: SignalWebsiteScan,
) {
  const update: Record<string, unknown> = {
    last_researched_at: nowIso(),
  }

  if (!existing.website_url) update.website_url = scan.scanned_urls[0] || candidate.confirmed_official_url || candidate.likely_official_url
  if (!existing.public_email && scan.visible_emails[0]) update.public_email = scan.visible_emails[0]
  if (!existing.public_phone && scan.visible_phones[0]) update.public_phone = scan.visible_phones[0]
  if (!existing.public_contact_form_url && scan.booking_links[0]) update.public_contact_form_url = scan.booking_links[0]
  if (!existing.city && candidate.city) update.city = candidate.city
  if (!existing.state && candidate.state) update.state = candidate.state
  if (!existing.existing_website_platform && scan.detected_website_platform) {
    update.existing_website_platform = scan.detected_website_platform
  }
  if (!existing.existing_booking_platform && scan.detected_booking_platform) {
    update.existing_booking_platform = scan.detected_booking_platform
  }
  if (!existing.human_notes) {
    update.human_notes = `Created or refreshed from Signal market candidate: ${candidate.business_name}.`
  }

  return update
}

export async function approveSignalMarketCandidate({
  addToFocus,
  candidateId,
  createdBy,
  marketId,
  mergeProspectId,
}: {
  addToFocus?: boolean
  candidateId: string
  createdBy: string
  marketId: string
  mergeProspectId?: string | null
}) {
  const supabase = createAdminClient()
  const [{ data: marketData }, { data: candidateData }] = await Promise.all([
    supabase.from("signal_markets").select("*").eq("id", marketId).maybeSingle(),
    supabase
      .from("signal_market_candidates")
      .select("*")
      .eq("id", candidateId)
      .eq("market_id", marketId)
      .maybeSingle(),
  ])

  if (!marketData) throw new Error("Market not found.")
  if (!candidateData) throw new Error("Candidate not found.")

  const market = marketData as SignalMarket
  const candidate = candidateData as SignalMarketCandidate
  const officialUrl = normalizeSignalUrl(candidate.confirmed_official_url || candidate.likely_official_url || candidate.candidate_url)
  if (!officialUrl || isClearlyNonOfficialSignalSource(officialUrl.toString())) {
    throw new Error("Confirm an official public website before approving this prospect.")
  }

  let scan = isSignalWebsiteScan(candidate.website_scan)
    ? candidate.website_scan
    : await scanSignalWebsite(officialUrl.toString(), {
        maxSecondaryPages: Math.max(0, firecrawlPageLimitForDepth(market.research_depth) - 1),
      })

  if (scan.broken_response) {
    scan = await scanSignalWebsite(officialUrl.toString())
  }

  const { data: allProspects } = await supabase.from("signal_prospects").select("*")
  const duplicates = findLikelySignalDuplicates((allProspects || []) as SignalProspect[], {
    businessName: candidate.business_name,
    city: candidate.city || market.city,
    email: scan.visible_emails[0],
    phone: scan.visible_phones[0],
    websiteUrl: officialUrl.toString(),
  })
  const duplicateProspectId = mergeProspectId || candidate.duplicate_prospect_id || duplicates[0]?.prospect.id || null

  let prospect: SignalProspect | null = null
  if (duplicateProspectId) {
    const existing = ((allProspects || []) as SignalProspect[]).find(
      (item) => item.id === duplicateProspectId,
    )
    if (!existing) throw new Error("Merge prospect was not found.")

    const { data: updated, error } = await supabase
      .from("signal_prospects")
      .update(mergeMarketCandidateFields(existing, candidate, scan))
      .eq("id", existing.id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    prospect = updated as SignalProspect
  } else {
    const classification = await resolveSignalClassification({
      businessName: candidate.business_name,
      city: candidate.city || market.city,
      state: candidate.state || market.state,
      industryHint: candidate.industry_hint,
      websiteUrl: officialUrl.toString(),
      selectedPlaybook: candidate.category,
      manualOverride: false,
      scan,
    })
    const prospectInput = normalizeProspectInput({
      business_name: candidate.business_name,
      industry: candidate.industry_hint || getSignalPlaybook(classification.playbook).name,
      industry_playbook: classification.playbook,
      city: candidate.city || market.city,
      state: candidate.state || market.state,
      website_url: officialUrl.toString(),
      public_email: scan.visible_emails[0] || null,
      public_phone: scan.visible_phones[0] || null,
      public_contact_form_url: scan.booking_links[0] || null,
      source: "public_web_research",
      existing_website_platform: scan.detected_website_platform,
      existing_booking_platform: scan.detected_booking_platform,
      human_notes: [
        `Created from Signal market: ${market.name}.`,
        candidate.quick_score_summary && typeof candidate.quick_score_summary === "object"
          ? "Market evidence and quick score are stored on the market candidate."
          : null,
      ].filter(Boolean).join("\n"),
      outreach_status: "needs_review",
      classification_manual_override: false,
    })
    Object.assign(prospectInput, buildSignalClassificationFields(classification))

    const { data: created, error } = await supabase
      .from("signal_prospects")
      .insert(prospectInput)
      .select()
      .single()

    if (error) throw new Error(error.message)
    prospect = created as SignalProspect
  }

  if (!prospect) throw new Error("Prospect could not be approved.")

  await syncSignalProspectAliases(
    {
      id: prospect.id,
      business_name: prospect.business_name,
      website_url: prospect.website_url,
      public_phone: prospect.public_phone,
      public_email: prospect.public_email,
    },
    duplicateProspectId ? "market_merge" : "market_import",
  )

  if (await isSignalProspectSuppressed(prospect)) {
    const { data: suppressed } = await supabase
      .from("signal_prospects")
      .update({ outreach_status: "do_not_contact" })
      .eq("id", prospect.id)
      .select()
      .single()
    prospect = (suppressed as SignalProspect | null) || prospect
  }

  const result = await runAndStoreInitialSignalAnalysis({
    prospect,
    scan,
    researchContext: {
      research_provider: getSignalResearchProviderMode(),
      research_query: buildSignalMarketDiscoveryQueries({
        city: market.city,
        state: market.state,
        industries: market.industries,
      })[0],
      confirmed_official_url: officialUrl.toString(),
      official_source_confidence: candidate.official_source_confidence || "medium",
      candidate_urls: [candidate.candidate_url, candidate.likely_official_url].filter(Boolean) as string[],
    },
  })

  const { data: updatedCandidate, error: candidateError } = await supabase
    .from("signal_market_candidates")
    .update({
      research_state: "imported_to_signal",
      imported_prospect_id: result.prospect.id,
      duplicate_prospect_id: duplicateProspectId || null,
      approved_at: nowIso(),
      confirmed_official_url: officialUrl.toString(),
      error_message: duplicateProspectId
        ? "Merged into an existing Signal prospect and refreshed analysis."
        : "Imported to Signal prospect and refreshed analysis.",
    })
    .eq("id", candidate.id)
    .eq("market_id", market.id)
    .select()
    .single()

  if (candidateError) throw new Error(candidateError.message)

  let focusItem = null
  if (addToFocus && result.prospect.outreach_status !== "do_not_contact") {
    const { data } = await supabase
      .from("signal_focus_items")
      .insert({
        prospect_id: result.prospect.id,
        market_id: market.id,
        focus_reason:
          result.analysis.recommended_primary_offer ||
          `Approved from ${market.name}.`,
        recommended_action:
          result.analysis.recommended_next_action ||
          "Review market evidence, confirm contact route, and prepare the next manual step.",
        due_date: new Date().toISOString().slice(0, 10),
        created_by: createdBy,
      })
      .select()
      .maybeSingle()
    focusItem = data
  }

  return {
    analysis: result.analysis,
    candidate: updatedCandidate as SignalMarketCandidate,
    focus_item: focusItem,
    prospect: result.prospect,
  }
}

export function getSignalMarketEstimateForMarket(market: Pick<SignalMarket, "industries" | "max_candidates" | "research_depth">): SignalMarketUsageEstimate {
  return estimateSignalMarketUsage({
    industries: Array.isArray(market.industries) ? market.industries : [],
    maxCandidates: market.max_candidates,
    researchDepth: market.research_depth,
  })
}
