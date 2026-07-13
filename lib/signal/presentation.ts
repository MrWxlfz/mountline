const LABELS: Record<string, string> = {
  queued: "Queued",
  discovering: "Running",
  enriching: "Running",
  checking: "Running",
  analyzing: "Running",
  scoring: "Running",
  selecting: "Running",
  generating: "Running",
  writing_packs: "Running",
  ranking: "Running",
  completed: "Completed",
  completed_with_limits: "Completed with limited evidence",
  partial: "Completed with limited evidence",
  failed: "Failed",
  cancelled: "Cancelled",
  needs_attention: "Needs attention",
  social_only: "Social only",
  social_primary: "Social is the primary public presence",
  no_site: "No verified website",
  no_website_found: "No official website verified",
  no_official_website_found: "No official website verified",
  verified_official_website: "Verified official website",
  likely_official_website: "Likely official website",
  directory_only: "Directory only",
  website_unreachable: "Website unreachable",
  website_parked: "Website appears parked",
  website_broken: "Website appears broken",
  website_weak: "Website has clear gaps",
  weak_site: "Website has clear gaps",
  website_adequate: "Website is functional",
  decent_site: "Website is functional",
  website_strong: "Strong website",
  strong_site: "Strong website",
  website_unknown: "Website status needs verification",
  unknown: "Needs verification",
  independent: "Independent",
  likely_independent: "Likely independent",
  independent_likely: "Likely independent",
  local_multi_location: "Local, multiple locations",
  likely_franchise: "Likely franchise",
  chain: "Chain",
  uncertain: "Needs verification",
  owner_operated_likely: "Likely owner-operated",
  likely_owner_operated: "Likely owner-operated",
  exceptional: "Exceptional",
  strong: "Strong",
  promising: "Promising",
  watchlist: "Watchlist",
  weak: "Weak",
  reject: "Rejected",
  rejected: "Rejected",
  qualified: "Recommended",
  research_needed: "Needs research",
  incomplete: "Needs research",
  walk_in: "Walk in",
  call: "Call",
  phone_first: "Phone first",
  text_email: "Text or email",
  research_more: "Research first",
  website: "Website",
  facebook: "Facebook",
  instagram: "Instagram",
  booking_marketplace: "Booking platform",
  directory: "Directory",
  phone: "Phone",
  high: "High",
  medium: "Medium",
  low: "Low",
  verified: "Verified",
  likely: "Likely",
  ambiguous: "Ambiguous",
  generic_result: "Generic result",
  confirmed_in_market: "Confirmed in market",
  confirmed_within_radius: "Confirmed within radius",
  near_market: "Near market",
  outside_market: "Outside market",
  ready: "Ready",
  saved: "Saved",
  ignored: "Rejected",
  excluded: "Excluded",
  candidate: "Candidate",
  researching: "Researching",
  ai: "Generated draft",
  deterministic_fallback: "Verified fallback",
  public_evidence: "Public evidence",
  signal_inference: "Signal inference",
  user_observation: "Luke's observation",
}

const PROVIDER_TERMS = /\b(?:tavily|firecrawl|google places|gemini|openai)\b/gi

function sentenceCase(value: string) {
  const cleaned = value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()
  return cleaned ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1) : ""
}

export function formatSignalLabel(value: string | null | undefined, fallback = "Needs verification") {
  const normalized = (value || "").trim().toLowerCase()
  if (!normalized) return fallback
  return LABELS[normalized] || sentenceCase(normalized)
}

export function formatBusinessCategory(value: string | null | undefined, fallback = "Local business") {
  const normalized = (value || "").trim()
  if (!normalized) return fallback
  return sentenceCase(normalized.replace(/\b(?:establishment|point of interest)\b/gi, "").trim()) || fallback
}

export function formatQualificationStatus(value: string | null | undefined) {
  return formatSignalLabel(value, "Needs research")
}

export function formatOnlinePresence(value: string | null | undefined) {
  return formatSignalLabel(value, "Website status needs verification")
}

export function formatRecommendedAction(value: string | null | undefined) {
  return formatSignalLabel(value, "Research first")
}

export function formatRunStatus(value: string | null | undefined) {
  return formatSignalLabel(value, "Needs attention")
}

export function formatConfidence(value: number | string | null | undefined, options: { includeValue?: boolean } = {}) {
  if (typeof value === "number" && Number.isFinite(value)) {
    const score = Math.max(0, Math.min(99, Math.round(value)))
    const label = score >= 82 ? "High" : score >= 62 ? "Moderate" : score >= 42 ? "Limited" : "Low"
    return options.includeValue === false ? label : `${label} · ${score}%`
  }
  return formatSignalLabel(typeof value === "string" ? value : null, "Not enough evidence")
}

export function formatScoreReason(value: string | null | undefined, options: { debug?: boolean } = {}) {
  if (!value) return ""
  const withoutProviders = options.debug ? value : value.replace(PROVIDER_TERMS, "public research")
  return withoutProviders
    .replace(/\b([a-z]+(?:_[a-z]+)+)\b/g, (match) => formatSignalLabel(match).toLowerCase())
    .replace(/\s+([,.;:!?])/g, "$1")
    .replace(/([.!?]){2,}/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
}

export function formatRunStage(value: string | null | undefined) {
  const stages: Record<string, string> = {
    setting_up: "Preparing research",
    setting_up_market: "Preparing the market",
    resolving_market: "Resolving the market",
    searching_local_map_listings: "Finding local businesses",
    finding_local_businesses: "Finding local businesses",
    filtering_chains_and_duplicates: "Filtering weak matches",
    checking_websites_and_social: "Checking websites and public profiles",
    verifying_business_identities: "Verifying business identities",
    finding_customer_flow_gaps: "Finding customer-flow gaps",
    scoring_opportunities: "Scoring opportunities",
    selecting_finalists: "Selecting finalists",
    writing_sales_packs: "Preparing sales plans",
    writing_packs: "Preparing sales plans",
    ranking_final_leads: "Ranking final leads",
    completed: "Research complete",
    retrying_research: "Retrying research",
    provider_warning: "Research limitation",
  }
  const normalized = (value || "").trim().toLowerCase()
  return stages[normalized] || formatSignalLabel(normalized, "Preparing research")
}

export function formatSignalList(values: Array<string | null | undefined>, options: { debug?: boolean } = {}) {
  return Array.from(new Set(values.map((value) => formatScoreReason(value, options)).filter(Boolean)))
}

