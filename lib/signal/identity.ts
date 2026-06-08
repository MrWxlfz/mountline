import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalConfidence, SignalJson, SignalProspect } from "@/lib/supabase/types"
import { classifySignalResearchUrl, normalizeSignalBusinessName, normalizeSignalHostname } from "./research"
import type { SignalFirecrawlPageEvidence, SignalProviderSearchResult } from "./providers"
import type { SignalWebsiteScan } from "./website"

export type SignalIdentityEvidenceItem = {
  source: string
  value: string
  confidence: SignalConfidence
  note?: string
}

export type SignalResolvedCandidateIdentity = {
  search_result_title: string | null
  search_result_url: string | null
  normalized_hostname: string | null
  likely_official_site: boolean
  extracted_business_name: string | null
  canonical_business_name: string
  resolution_confidence: SignalConfidence
  resolution_evidence: SignalIdentityEvidenceItem[]
  requires_confirmation: boolean
}

function clean(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || ""
}

function titleCase(value: string) {
  return value
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase())
    .replace(/\b(And|Of|The|For|In)\b/g, (match) => match.toLowerCase())
    .replace(/\bDfw\b/g, "DFW")
    .replace(/\bTx\b/g, "TX")
}

function stripBusinessSuffixes(value: string) {
  return clean(value)
    .replace(/\b(official\s+website|home\s+page|homepage|website|contact|services|service|booking|book\s+now)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function hostNameCandidate(rawUrl: string | null | undefined) {
  const host = normalizeSignalHostname(rawUrl)
  if (!host) return null
  const root = host.split(".")[0] || ""
  const cleaned = root
    .replace(/[-_]+/g, " ")
    .replace(/\b(tx|dfw|usa|us|llc|inc|co|company|site|official|online)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim()

  return cleaned.length >= 2 ? titleCase(cleaned).slice(0, 180) : null
}

function looksLikeSeoHeadline(value: string, city?: string | null, state?: string | null) {
  const text = clean(value).toLowerCase()
  if (!text) return true
  if (text.length > 72) return true
  if (/^(best|top[-\s]?rated|premium|affordable|professional|local|trusted|quality)\b/.test(text)) return true
  if (/\b(near me|in keller|in dfw|in texas|in tx|services?|pricing|contact|booking|appointment|quote)\b/.test(text)) return true
  if (/\b(auto tinting|paint protection|ppf|ceramic coating|car detailing|mobile detailing|barber shop|hair salon|hvac|roofing)\b/.test(text) && !/\b(llc|inc|studio|detailing|barber|salon|spa|dental|roofing|hvac)\b/.test(text.split(/\s[-–—:]\s|\|/)[0] || "")) {
    return true
  }
  const cityText = clean(city).toLowerCase()
  const stateText = clean(state).toLowerCase()
  return Boolean((cityText && text.endsWith(` ${cityText}`)) || (stateText && text.endsWith(` ${stateText}`)))
}

function titleNameCandidate({
  city,
  hostname,
  state,
  title,
}: {
  title: string | null | undefined
  hostname?: string | null
  city?: string | null
  state?: string | null
}) {
  const raw = clean(title)
  if (!raw) return null
  const firstSegment = stripBusinessSuffixes(raw.split(/\s[-–—:]\s|\|/)[0] || raw)
  if (!firstSegment || firstSegment.length < 2) return null
  if (looksLikeSeoHeadline(firstSegment, city, state)) return null

  const normalizedTitle = normalizeSignalBusinessName(firstSegment)
  const hostRoot = (hostname || "").split(".")[0]?.replace(/[-_]+/g, " ") || ""
  const normalizedHost = normalizeSignalBusinessName(hostRoot)
  const titleWords = normalizedTitle.split(" ").filter((word) => word.length > 2)
  const matchedHostWords = titleWords.filter((word) => normalizedHost.includes(word)).length
  const confidence: SignalConfidence =
    matchedHostWords >= Math.min(2, titleWords.length) || normalizedHost.includes(normalizedTitle)
      ? "high"
      : "medium"

  return {
    name: firstSegment.slice(0, 180),
    confidence,
    note:
      confidence === "high"
        ? "Title identity matched the official hostname."
        : "Title identity looked like a business name, but needs supporting official evidence.",
  }
}

function bestEvidence(items: SignalIdentityEvidenceItem[]) {
  const rank: Record<SignalConfidence, number> = { high: 3, medium: 2, low: 1 }
  return [...items].sort((a, b) => rank[b.confidence] - rank[a.confidence])[0] || null
}

async function manualCorrectionForHost(hostname: string | null) {
  if (!hostname) return null
  const supabase = createAdminClient()
  const { data } = await supabase
    .from("signal_identity_corrections")
    .select("*")
    .eq("normalized_hostname", hostname)
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const corrected = data && typeof data.corrected_business_name === "string"
    ? clean(data.corrected_business_name)
    : ""
  return corrected || null
}

export async function resolveMarketCandidateIdentityFromSearch({
  city,
  existingProspect,
  result,
  state,
}: {
  result: SignalProviderSearchResult
  city?: string | null
  state?: string | null
  existingProspect?: Pick<SignalProspect, "business_name"> | null
}): Promise<SignalResolvedCandidateIdentity> {
  const hostname = normalizeSignalHostname(result.url) || null
  const likelyOfficialSite = classifySignalResearchUrl(result.url) === "likely_official_site"
  const evidence: SignalIdentityEvidenceItem[] = []

  const manual = await manualCorrectionForHost(hostname)
  if (manual) {
    evidence.push({
      source: "manual_correction",
      value: manual,
      confidence: "high",
      note: "Stored Mountline identity correction for this domain.",
    })
  }

  if (existingProspect?.business_name) {
    evidence.push({
      source: "known_prospect",
      value: existingProspect.business_name,
      confidence: "high",
      note: "Matched an existing Signal prospect.",
    })
  }

  const titleCandidate = titleNameCandidate({
    city,
    hostname,
    state,
    title: result.title,
  })
  if (titleCandidate) {
    evidence.push({
      source: "search_result_title",
      value: titleCandidate.name,
      confidence: titleCandidate.confidence,
      note: titleCandidate.note,
    })
  }

  const hostCandidate = hostNameCandidate(result.url)
  if (hostCandidate) {
    evidence.push({
      source: "hostname",
      value: hostCandidate,
      confidence: likelyOfficialSite ? "medium" : "low",
      note: "Derived from the domain because the search title was not reliable enough.",
    })
  }

  const selected = bestEvidence(evidence)
  const canonical = selected?.value || "Unknown business"
  const confidence = selected?.confidence || "low"

  return {
    search_result_title: clean(result.title) || null,
    search_result_url: result.url,
    normalized_hostname: hostname,
    likely_official_site: likelyOfficialSite,
    extracted_business_name: titleCandidate?.name || hostCandidate || null,
    canonical_business_name: canonical,
    resolution_confidence: confidence,
    resolution_evidence: evidence,
    requires_confirmation: confidence !== "high" || selected?.source === "search_result_title",
  }
}

export async function resolveMarketCandidateIdentityFromOfficialEvidence({
  candidateName,
  city,
  firecrawlEvidence,
  officialUrl,
  scan,
  state,
}: {
  candidateName: string
  officialUrl: string
  scan: SignalWebsiteScan | null
  firecrawlEvidence: SignalFirecrawlPageEvidence[]
  city?: string | null
  state?: string | null
}): Promise<SignalResolvedCandidateIdentity> {
  const hostname = normalizeSignalHostname(officialUrl) || null
  const evidence: SignalIdentityEvidenceItem[] = []

  const manual = await manualCorrectionForHost(hostname)
  if (manual) {
    evidence.push({
      source: "manual_correction",
      value: manual,
      confidence: "high",
      note: "Stored Mountline identity correction for this domain.",
    })
  }

  scan?.json_ld_names?.forEach((name) => {
    const value = stripBusinessSuffixes(name)
    if (value) evidence.push({ source: "json_ld", value, confidence: "high", note: "Structured LocalBusiness or Organization data." })
  })
  if (scan?.open_graph_site_name) {
    evidence.push({
      source: "open_graph_site_name",
      value: stripBusinessSuffixes(scan.open_graph_site_name),
      confidence: "high",
      note: "Open Graph site name from the official website.",
    })
  }
  scan?.logo_alt_text?.forEach((name) => {
    const value = stripBusinessSuffixes(name.replace(/\blogo\b/gi, " "))
    if (value) evidence.push({ source: "logo_alt", value, confidence: "medium", note: "Logo or brand image alt text from the official site." })
  })

  const scanTitle = titleNameCandidate({
    city,
    hostname,
    state,
    title: scan?.page_title,
  })
  if (scanTitle) {
    evidence.push({
      source: "official_page_title",
      value: scanTitle.name,
      confidence: scanTitle.confidence,
      note: scanTitle.note,
    })
  }

  firecrawlEvidence
    .map((item) => titleNameCandidate({ city, hostname, state, title: item.title }))
    .filter(Boolean)
    .forEach((item) => {
      if (!item) return
      evidence.push({
        source: "firecrawl_official_page_title",
        value: item.name,
        confidence: item.confidence,
        note: item.note,
      })
    })

  const hostCandidate = hostNameCandidate(officialUrl)
  if (hostCandidate) {
    evidence.push({
      source: "hostname",
      value: hostCandidate,
      confidence: "medium",
      note: "Derived from the confirmed official domain.",
    })
  }

  if (candidateName && !looksLikeSeoHeadline(candidateName, city, state)) {
    evidence.push({
      source: "previous_candidate_name",
      value: candidateName,
      confidence: "medium",
      note: "Existing candidate label retained as supporting evidence.",
    })
  }

  const selected = bestEvidence(evidence)
  const canonical = selected?.value || candidateName || hostCandidate || "Unknown business"
  const confidence = selected?.confidence || "low"

  return {
    search_result_title: null,
    search_result_url: null,
    normalized_hostname: hostname,
    likely_official_site: true,
    extracted_business_name: canonical,
    canonical_business_name: canonical,
    resolution_confidence: confidence,
    resolution_evidence: evidence,
    requires_confirmation: confidence !== "high",
  }
}

export function identityFields(identity: SignalResolvedCandidateIdentity): Record<string, SignalJson | string | boolean | null> {
  return {
    search_result_title: identity.search_result_title,
    search_result_url: identity.search_result_url,
    normalized_hostname: identity.normalized_hostname,
    likely_official_site: identity.likely_official_site,
    extracted_business_name: identity.extracted_business_name,
    canonical_business_name: identity.canonical_business_name,
    business_name: identity.canonical_business_name,
    resolution_confidence: identity.resolution_confidence,
    resolution_evidence: identity.resolution_evidence as unknown as SignalJson,
    requires_confirmation: identity.requires_confirmation,
    identity_updated_at: new Date().toISOString(),
  }
}
