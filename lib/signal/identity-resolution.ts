import {
  normalizeSignalAddress,
  normalizeSignalPhoneE164,
  signalHostname,
  type ParsedSignalBusinessInput,
} from "./input-parser.ts"
import {
  isBlockedIdentityPublisher,
  type SignalSourceClassification,
} from "./source-classification.ts"

export type SignalIdentityResolutionState =
  | "input_received"
  | "parsed"
  | "candidates_found"
  | "exact_match"
  | "likely_match"
  | "ambiguous"
  | "contradictory"
  | "unresolved"
  | "user_confirmed"
  | "verified"
  | "rejected"

export type SignalIdentityCandidate = {
  id: string
  name: string | null
  address: string | null
  city: string | null
  state: string | null
  zip: string | null
  latitude: number | null
  longitude: number | null
  phone: string | null
  domain: string | null
  websiteUrl: string | null
  socialUrls: string[]
  placesId: string | null
  category: string | null
  sourceUrl: string | null
  sourceTitle: string | null
  sourceProvider: string
  sourceTier: "submitted" | "manual" | "structured_listing" | "first_party" | "social" | "directory" | "search"
  sourceClassification: SignalSourceClassification
  sourceReliability: number
  userConfirmed?: boolean
  supportingLinks: string[]
}

export type SignalIdentityMatchComponents = {
  nameAgreement: number
  addressAgreement: number
  phoneAgreement: number
  coordinateAgreement: number
  domainAgreement: number
  socialAgreement: number
  categoryAgreement: number
  localityAgreement: number
  sourceReliability: number
  contradictionPenalty: number
  total: number
}

export type ScoredSignalIdentityCandidate = SignalIdentityCandidate & {
  match: SignalIdentityMatchComponents
  conflicts: string[]
  matchReasons: string[]
  canonicalEligible: boolean
  officialWebsiteEligible: boolean
  rejectionReason: string | null
}

export type SignalIdentityCluster = {
  id: string
  candidateIds: string[]
  stableLinks: string[]
}

export type SignalIdentityGraphResolution = {
  state: SignalIdentityResolutionState
  candidates: ScoredSignalIdentityCandidate[]
  clusters: SignalIdentityCluster[]
  selectedCandidateId: string | null
  canonicalName: string
  canonicalNameStatus: "submitted" | "user_confirmed" | "verified" | "likely"
  canonicalSource: string
  confidence: number
  conflicts: string[]
  explanation: string
}

function clean(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || ""
}

export function normalizeIdentityName(value: string | null | undefined) {
  return clean(value).toLowerCase().replace(/&/g, " and ")
    .replace(/\b(?:the|llc|inc|incorporated|corp|corporation|company|co|ltd)\b/g, " ")
    .replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ").trim()
}

function nameAgreement(left: string | null | undefined, right: string | null | undefined) {
  const a = normalizeIdentityName(left)
  const b = normalizeIdentityName(right)
  if (!a || !b) return 0
  if (a === b) return 100
  if (a.replace(/\s/g, "") === b.replace(/\s/g, "")) return 96
  if (a.includes(b) || b.includes(a)) return Math.min(a.length, b.length) >= 5 ? 86 : 60
  const leftTokens = new Set(a.split(" ").filter((token) => token.length > 1))
  const rightTokens = new Set(b.split(" ").filter((token) => token.length > 1))
  const shared = [...leftTokens].filter((token) => rightTokens.has(token)).length
  const union = new Set([...leftTokens, ...rightTokens]).size
  return union ? Math.round(shared / union * 100) : 0
}

function addressAgreement(left: string | null | undefined, right: string | null | undefined) {
  const a = normalizeSignalAddress(left)
  const b = normalizeSignalAddress(right)
  if (!a || !b) return 0
  if (a === b) return 100
  const aNumber = a.match(/^\d+/)?.[0]
  const bNumber = b.match(/^\d+/)?.[0]
  const aZip = clean(left).match(/\b\d{5}(?:-\d{4})?\b/)?.[0]?.slice(0, 5)
  const bZip = clean(right).match(/\b\d{5}(?:-\d{4})?\b/)?.[0]?.slice(0, 5)
  const aSuite = a.match(/#\s*([a-z0-9-]+)/)?.[1]
  const bSuite = b.match(/#\s*([a-z0-9-]+)/)?.[1]
  if (aNumber && bNumber && aNumber !== bNumber) return 0
  if (aZip && bZip && aZip !== bZip) return 0
  const aTokens = new Set(a.split(" ").filter((token) => token.length > 1 && !/^#/.test(token)))
  const bTokens = new Set(b.split(" ").filter((token) => token.length > 1 && !/^#/.test(token)))
  const shared = [...aTokens].filter((token) => bTokens.has(token)).length
  const coverage = Math.round(shared / Math.max(1, Math.min(aTokens.size, bTokens.size)) * 100)
  if (aSuite && bSuite && aSuite !== bSuite) return Math.min(68, coverage)
  return coverage >= 75 ? 92 : coverage
}

function normalizedLocality(city: string | null | undefined, state: string | null | undefined) {
  return `${clean(city).toLowerCase()}|${clean(state).toLowerCase()}`
}

function coordinateDistanceMiles(left: SignalIdentityCandidate, anchor: SignalIdentityCandidate) {
  if (left.latitude == null || left.longitude == null || anchor.latitude == null || anchor.longitude == null) return null
  const radians = (degrees: number) => degrees * Math.PI / 180
  const dLat = radians(left.latitude - anchor.latitude)
  const dLon = radians(left.longitude - anchor.longitude)
  const a = Math.sin(dLat / 2) ** 2
    + Math.cos(radians(anchor.latitude)) * Math.cos(radians(left.latitude)) * Math.sin(dLon / 2) ** 2
  return 3958.8 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export function submittedInputCandidate(parsed: ParsedSignalBusinessInput): SignalIdentityCandidate {
  return {
    id: "submitted-input",
    name: parsed.submittedName,
    address: parsed.submittedAddress,
    city: parsed.submittedCity,
    state: parsed.submittedState,
    zip: parsed.submittedZip,
    latitude: null,
    longitude: null,
    phone: parsed.phone,
    domain: signalHostname(parsed.officialWebsiteUrl) || null,
    websiteUrl: parsed.officialWebsiteUrl,
    socialUrls: parsed.socialUrls,
    placesId: parsed.googlePlaceId,
    category: null,
    sourceUrl: parsed.mapsUrl || parsed.officialWebsiteUrl || parsed.socialUrls[0] || null,
    sourceTitle: parsed.submittedName,
    sourceProvider: "submitted_input",
    sourceTier: "submitted",
    sourceClassification: parsed.mapsUrl
      ? "places_map_listing"
      : parsed.socialUrls.length && !parsed.officialWebsiteUrl
        ? "official_social_network"
        : parsed.officialWebsiteUrl
          ? "likely_official"
          : "unknown",
    sourceReliability: parsed.identityAnchorStrength === "strong" ? 96 : parsed.identityAnchorStrength === "moderate" ? 72 : 52,
    supportingLinks: parsed.urls,
  }
}

export function scoreSignalIdentityCandidate(
  anchor: SignalIdentityCandidate,
  candidate: SignalIdentityCandidate,
): ScoredSignalIdentityCandidate {
  const name = nameAgreement(anchor.name, candidate.name)
  const address = addressAgreement(anchor.address, candidate.address)
  const anchorPhone = normalizeSignalPhoneE164(anchor.phone)
  const candidatePhone = normalizeSignalPhoneE164(candidate.phone)
  const phone = anchorPhone && candidatePhone ? (anchorPhone === candidatePhone ? 100 : 0) : 0
  const anchorDomain = signalHostname(anchor.domain || anchor.websiteUrl)
  const candidateDomain = signalHostname(candidate.domain || candidate.websiteUrl)
  const domain = anchorDomain && candidateDomain ? (anchorDomain === candidateDomain ? 100 : 0) : 0
  const anchorSocials = new Set(anchor.socialUrls.map(signalHostname).filter(Boolean))
  const social = candidate.socialUrls.some((url) => anchorSocials.has(signalHostname(url))) ? 100 : 0
  const anchorLocality = normalizedLocality(anchor.city, anchor.state)
  const candidateLocality = normalizedLocality(candidate.city, candidate.state)
  const locality = anchorLocality !== "|" && candidateLocality !== "|"
    ? anchorLocality === candidateLocality ? 100 : anchor.state && candidate.state && anchor.state.toLowerCase() === candidate.state.toLowerCase() ? 30 : 0
    : 0
  const distance = coordinateDistanceMiles(candidate, anchor)
  const coordinate = distance == null ? 0 : distance <= 0.1 ? 100 : distance <= 0.5 ? 85 : distance <= 2 ? 40 : 0
  const category = anchor.category && candidate.category
    ? nameAgreement(anchor.category, candidate.category)
    : 0

  const conflicts: string[] = []
  let contradictionPenalty = 0
  if (anchorPhone && candidatePhone && anchorPhone !== candidatePhone) {
    conflicts.push(`Phone conflict: submitted ${anchor.phone}; candidate ${candidate.phone}.`)
    contradictionPenalty += 42
  }
  if (anchor.address && candidate.address && address < 45) {
    conflicts.push(`Address conflict: submitted ${anchor.address}; candidate ${candidate.address}.`)
    contradictionPenalty += 46
  }
  if (anchorDomain && candidateDomain && anchorDomain !== candidateDomain && anchor.sourceTier === "manual") {
    conflicts.push(`Domain conflict: confirmed ${anchorDomain}; candidate ${candidateDomain}.`)
    contradictionPenalty += 38
  }
  if (anchor.placesId && candidate.placesId && anchor.placesId !== candidate.placesId) {
    conflicts.push("Places listing conflict: the candidate has a different stable place ID.")
    contradictionPenalty += 60
  }

  const matchReasons: string[] = []
  if (anchor.placesId && candidate.placesId && anchor.placesId === candidate.placesId) matchReasons.push("Exact Places ID")
  if (name >= 85) matchReasons.push("Business name agrees")
  if (address >= 90) matchReasons.push("Full address agrees")
  if (phone === 100) matchReasons.push("Phone agrees")
  if (domain === 100) matchReasons.push("Domain agrees")
  if (coordinate >= 85) matchReasons.push("Coordinates agree")
  if (social === 100) matchReasons.push("Social profile agrees")
  if (locality === 100) matchReasons.push("Locality agrees")

  const exactPlace = Boolean(anchor.placesId && candidate.placesId && anchor.placesId === candidate.placesId)
  let total = exactPlace ? 100 : 0
  if (!exactPlace) {
    total += name >= 85 ? 22 : Math.round(name * 0.12)
    total += address >= 90 ? 38 : Math.round(address * 0.2)
    total += phone === 100 ? 40 : 0
    total += domain === 100 ? 38 : 0
    total += coordinate >= 85 ? 30 : Math.round(coordinate * 0.12)
    total += social === 100 ? 25 : 0
    total += locality === 100 ? 12 : locality ? 3 : 0
    total += category >= 70 ? 5 : 0
    total += Math.round(Math.max(0, Math.min(100, candidate.sourceReliability)) * 0.05)
  }
  total = Math.max(0, Math.min(99, total - contradictionPenalty))

  const blockedPublisher = isBlockedIdentityPublisher(candidate.sourceClassification)
    && !["places_map_listing", "official_social_network"].includes(candidate.sourceClassification)
  const canonicalEligible = candidate.userConfirmed === true
    || candidate.sourceTier === "manual"
    || (!blockedPublisher && ["structured_listing", "first_party", "social"].includes(candidate.sourceTier))
  const officialWebsiteEligible = candidate.userConfirmed === true
    || (["official_business_site", "likely_official", "unknown"].includes(candidate.sourceClassification)
      && !blockedPublisher && conflicts.length === 0)
  const rejectionReason = blockedPublisher
    ? "This source is an intermediary publisher and has no canonical identity authority."
    : conflicts.length
      ? conflicts.join(" ")
      : total < 35
        ? "The candidate does not agree with enough submitted identity facts."
        : null

  return {
    ...candidate,
    match: {
      nameAgreement: name,
      addressAgreement: address,
      phoneAgreement: phone,
      coordinateAgreement: coordinate,
      domainAgreement: domain,
      socialAgreement: social,
      categoryAgreement: category,
      localityAgreement: locality,
      sourceReliability: candidate.sourceReliability,
      contradictionPenalty,
      total,
    },
    conflicts,
    matchReasons,
    canonicalEligible,
    officialWebsiteEligible,
    rejectionReason,
  }
}

function stableLinks(left: SignalIdentityCandidate, right: SignalIdentityCandidate) {
  const links: string[] = []
  if (left.placesId && right.placesId && left.placesId === right.placesId) links.push("Places ID")
  const leftPhone = normalizeSignalPhoneE164(left.phone)
  const rightPhone = normalizeSignalPhoneE164(right.phone)
  if (leftPhone && rightPhone && leftPhone === rightPhone) links.push("phone")
  if (left.address && right.address && addressAgreement(left.address, right.address) >= 92) links.push("address")
  const leftDomain = signalHostname(left.domain || left.websiteUrl)
  const rightDomain = signalHostname(right.domain || right.websiteUrl)
  if (leftDomain && rightDomain && leftDomain === rightDomain) links.push("domain")
  if (left.socialUrls.some((url) => right.socialUrls.some((other) => signalHostname(url) === signalHostname(other)))) links.push("social profile")
  const distance = coordinateDistanceMiles(left, right)
  if (distance != null && distance <= 0.1) links.push("coordinates")
  return links
}

export function buildSignalIdentityClusters(candidates: SignalIdentityCandidate[]) {
  const clusters: SignalIdentityCluster[] = []
  for (const candidate of candidates) {
    const linked = clusters.find((cluster) => cluster.candidateIds.some((id) => {
      const member = candidates.find((item) => item.id === id)
      return member ? stableLinks(candidate, member).length > 0 : false
    }))
    if (!linked) {
      clusters.push({ id: `cluster-${clusters.length + 1}`, candidateIds: [candidate.id], stableLinks: [] })
      continue
    }
    for (const id of linked.candidateIds) {
      const member = candidates.find((item) => item.id === id)
      if (member) linked.stableLinks.push(...stableLinks(candidate, member))
    }
    linked.candidateIds.push(candidate.id)
    linked.stableLinks = Array.from(new Set(linked.stableLinks))
  }
  return clusters
}

function isExactMatch(anchor: SignalIdentityCandidate, candidate: ScoredSignalIdentityCandidate) {
  if (anchor.placesId && candidate.placesId && anchor.placesId === candidate.placesId) return true
  if (candidate.match.nameAgreement >= 85 && candidate.match.addressAgreement >= 92) return true
  if (candidate.match.nameAgreement >= 85 && candidate.match.phoneAgreement === 100) return true
  return candidate.match.domainAgreement === 100
    && (candidate.match.addressAgreement >= 85 || candidate.match.phoneAgreement === 100)
}

export function resolveSignalIdentityGraph(input: {
  anchor: SignalIdentityCandidate
  candidates: SignalIdentityCandidate[]
}): SignalIdentityGraphResolution {
  const allCandidates = input.candidates.filter((candidate) => candidate.id !== input.anchor.id)
  const scored = allCandidates.map((candidate) => scoreSignalIdentityCandidate(input.anchor, candidate))
    .sort((left, right) => right.match.total - left.match.total || right.sourceReliability - left.sourceReliability)
  const clusters = buildSignalIdentityClusters([input.anchor, ...allCandidates])
  const userConfirmed = scored.find((candidate) => candidate.userConfirmed)
  const exact = scored.find((candidate) => !candidate.rejectionReason && candidate.conflicts.length === 0 && isExactMatch(input.anchor, candidate))
  const plausible = scored.filter((candidate) => !candidate.rejectionReason && candidate.match.total >= 35 && candidate.conflicts.length === 0)
  const top = plausible[0] || null
  const second = plausible[1] || null
  const contradicted = scored.find((candidate) => candidate.match.contradictionPenalty >= 38 && candidate.match.nameAgreement >= 70)

  let state: SignalIdentityResolutionState = "unresolved"
  let selected: ScoredSignalIdentityCandidate | null = null
  if (input.anchor.userConfirmed) {
    state = "user_confirmed"
  } else if (userConfirmed) {
    state = "user_confirmed"
    selected = userConfirmed
  } else if (exact) {
    state = "exact_match"
    selected = exact
  } else if (top && second && top.match.total - second.match.total <= 12 && !stableLinks(top, second).length) {
    state = "ambiguous"
  } else if (top && (
    top.match.total >= 58
    || (top.match.phoneAgreement === 100 && top.match.nameAgreement >= 35)
    || (top.match.domainAgreement === 100 && top.match.nameAgreement >= 35)
  )) {
    state = "likely_match"
    selected = top
  } else if (contradicted && !top) {
    state = "contradictory"
  }

  const submittedName = clean(input.anchor.name) || "Submitted business"
  const canonicalCandidate = selected?.canonicalEligible ? selected : null
  const canonicalName = clean(canonicalCandidate?.name) || submittedName
  const canonicalNameStatus = state === "user_confirmed"
    ? "user_confirmed" as const
    : state === "exact_match" && canonicalCandidate
      ? "verified" as const
      : state === "likely_match" && canonicalCandidate
        ? "likely" as const
        : "submitted" as const
  const conflicts = Array.from(new Set(scored.flatMap((candidate) => candidate.conflicts)))
  const explanation = state === "exact_match"
    ? `Strong match: ${selected?.matchReasons.join(" and ").toLowerCase() || "stable identity facts agree"}.`
    : state === "user_confirmed"
      ? "Mountline confirmed this candidate as the intended business."
      : state === "likely_match"
        ? `Likely match: ${selected?.matchReasons.join(" and ").toLowerCase() || "several identity facts agree"}, but one strong corroborating fact is still missing.`
        : state === "ambiguous"
          ? "More than one plausible business remains. Choose the correct candidate before Signal prepares a verdict."
          : state === "contradictory"
            ? "A likely source conflicts with submitted identity facts. Confirm the correct address, phone, or website."
            : "No source agreed strongly enough with the submitted business. The submitted name remains unchanged."

  return {
    state,
    candidates: scored,
    clusters,
    selectedCandidateId: selected?.id || null,
    canonicalName,
    canonicalNameStatus,
    canonicalSource: canonicalCandidate?.sourceProvider || (input.anchor.userConfirmed ? input.anchor.sourceProvider : "submitted_input"),
    confidence: input.anchor.userConfirmed ? input.anchor.sourceReliability : selected?.match.total || 0,
    conflicts,
    explanation,
  }
}

export function signalIdentityStateLabel(state: SignalIdentityResolutionState | null | undefined) {
  const labels: Record<SignalIdentityResolutionState, string> = {
    input_received: "Resolving identity",
    parsed: "Resolving identity",
    candidates_found: "Resolving identity",
    exact_match: "Match found",
    likely_match: "Likely match",
    ambiguous: "Choose the correct business",
    contradictory: "Conflicting information",
    unresolved: "Could not resolve",
    user_confirmed: "Confirmed by Mountline",
    verified: "Verified",
    rejected: "Wrong match",
  }
  return state ? labels[state] : "Needs identity confirmation"
}
