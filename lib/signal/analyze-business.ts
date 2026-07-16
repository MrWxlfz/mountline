import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalEvidenceLedgerItem,
  SignalConceptStatus,
  SignalProspect,
} from "@/lib/supabase/types"
import {
  buildSignalConceptPrompt,
  derivePrimaryOpportunity,
  deriveSignalDecision,
  parseSignalAnalysisInput,
} from "./analysis-model"
import { runAndStoreInitialSignalAnalysis } from "./analysis"
import { cleanSignalBusinessName } from "./business-name"
import {
  resolveSignalIdentityGraph,
  scoreSignalIdentityCandidate,
  submittedInputCandidate,
  type SignalIdentityCandidate,
  type SignalIdentityGraphResolution,
  type SignalIdentityResolutionState,
} from "./identity-resolution"
import { formatSignalPhone, signalHostname, type SignalInputOverrides } from "./input-parser"
import { getSignalPlacesProvider } from "./places"
import type { SignalPlace } from "./places-core"
import { assessSignalOfficialWebsite, assessSignalSocialProfile, type SignalSocialProfileAssessment } from "./presence"
import { assessSignalChain } from "./quality"
import {
  buildSignalVerificationChecklist,
  calculateSignalResearchSufficiency,
  type SignalResearchSufficiency,
} from "./research-sufficiency"
import {
  buildSignalCopilotInputFromProspect,
  persistSignalCopilotState,
  providerIssueFromSignalWarning,
} from "./artifacts"
import {
  classifySignalSource,
  findLikelySignalDuplicates,
  normalizeSignalBusinessName,
  normalizeSignalHostname,
  normalizeSignalPhone,
  runSignalPublicResearch,
} from "./research"
import { classifySourceDomain, type SignalSourceClassification } from "./source-classification"
import { scanSignalWebsite, type SignalWebsiteScan } from "./website"

type LedgerInsert = Omit<SignalEvidenceLedgerItem, "id" | "created_at" | "metadata"> & {
  metadata?: Record<string, unknown>
}

function unique(values: Array<string | null | undefined>, limit = 12) {
  return Array.from(new Set(values.map((value) => value?.trim() || "").filter(Boolean))).slice(0, limit)
}

function confidenceLabel(score: number) {
  if (score >= 78) return "high" as const
  if (score >= 55) return "medium" as const
  return "low" as const
}

function evidenceRow(
  prospectId: string,
  input: Partial<LedgerInsert> & Pick<LedgerInsert, "claim_type" | "claim_text" | "evidence_category" | "evidence_tier">,
): LedgerInsert {
  return {
    prospect_id: prospectId,
    retrieved_at: new Date().toISOString(),
    source_url: null,
    source_title: null,
    source_provider: null,
    source_excerpt: null,
    verification_status: "unverified",
    confidence: null,
    contradiction_group: null,
    subject_name: null,
    subject_identity_key: null,
    publisher_name: null,
    publisher_domain: null,
    source_classification: null,
    decision_status: "needs_confirmation",
    decision_reason: null,
    affected_analysis_areas: [],
    created_by: "signal_analysis",
    ...input,
  }
}

function prospectFallbackName(input: ReturnType<typeof parseSignalAnalysisInput>) {
  return input.businessNameHint || "Business from submitted source"
}

function allowedMapsHost(value: string) {
  try {
    const host = new URL(value).hostname.toLowerCase()
    return host === "goo.gl" || host === "maps.app.goo.gl" || host === "google.com" ||
      host === "www.google.com" || host === "maps.google.com"
  } catch {
    return false
  }
}

async function expandSubmittedMapsUrl(parsed: ReturnType<typeof parseSignalAnalysisInput>) {
  if (!parsed.mapsUrl || parsed.googlePlaceId || !allowedMapsHost(parsed.mapsUrl)) return parsed
  let current = parsed.mapsUrl
  try {
    for (let index = 0; index < 5; index += 1) {
      const response = await fetch(current, {
        method: "GET",
        redirect: "manual",
        headers: { "User-Agent": "MountlineSignal/1.0 (+https://mountline.dev)" },
        signal: AbortSignal.timeout(8_000),
      })
      await response.body?.cancel().catch(() => undefined)
      const location = response.headers.get("location")
      if (!location) break
      const next = new URL(location, current).toString()
      if (!allowedMapsHost(next)) break
      current = next
    }
    const expanded = parseSignalAnalysisInput(current)
    return {
      ...parsed,
      businessNameHint: parsed.businessNameHint || expanded.businessNameHint,
      googlePlaceId: expanded.googlePlaceId || parsed.googlePlaceId,
      mapsUrl: current,
      query: [parsed.businessNameHint || expanded.businessNameHint, parsed.locationHint, parsed.phone]
        .filter(Boolean)
        .join(" ") || parsed.query,
      urls: unique([...parsed.urls, ...expanded.urls]),
    }
  } catch {
    return parsed
  }
}

function objectRecord(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

function candidateFromPlace(place: SignalPlace): SignalIdentityCandidate {
  const addressParts = parseSignalAnalysisInput(`${place.canonical_name} — ${place.formatted_address || ""}`)
  return {
    id: `place:${place.provider_place_id}`,
    name: place.canonical_name,
    address: place.formatted_address,
    city: place.city,
    state: place.state,
    zip: addressParts.submittedZip,
    latitude: place.coordinates.latitude,
    longitude: place.coordinates.longitude,
    phone: formatSignalPhone(place.phone),
    domain: signalHostname(place.website_url) || null,
    websiteUrl: place.website_url,
    socialUrls: [],
    placesId: place.provider_place_id,
    category: place.primary_category,
    sourceUrl: place.listing_url,
    sourceTitle: place.canonical_name,
    sourceProvider: place.provider,
    sourceTier: "structured_listing",
    sourceClassification: "places_map_listing",
    sourceReliability: 94,
    supportingLinks: unique([place.listing_url, place.website_url]),
  }
}

function candidateFromResearch(
  candidate: Awaited<ReturnType<typeof runSignalPublicResearch>>["candidates"][number],
  index: number,
): SignalIdentityCandidate {
  const parsed = parseSignalAnalysisInput(`${candidate.title} ${candidate.evidence}`)
  const titleName = cleanSignalBusinessName(candidate.title.split(/\s[-–—|:]\s/)[0], {
    city: parsed.submittedCity,
    state: parsed.submittedState,
  }).name
  const sourceTier = candidate.source_classification === "official_social_network"
    ? "social" as const
    : ["directory", "aggregator", "marketplace", "review_platform", "booking_platform"].includes(candidate.source_classification)
      ? "directory" as const
      : "search" as const
  return {
    id: `research:${index}:${signalHostname(candidate.url) || index}`,
    name: titleName,
    address: parsed.submittedAddress,
    city: parsed.submittedCity,
    state: parsed.submittedState,
    zip: parsed.submittedZip,
    latitude: null,
    longitude: null,
    phone: parsed.phone,
    domain: candidate.official_site_eligible ? signalHostname(candidate.url) || null : null,
    websiteUrl: candidate.official_site_eligible ? candidate.url : null,
    socialUrls: candidate.source_classification === "official_social_network" ? [candidate.url] : [],
    placesId: null,
    category: null,
    sourceUrl: candidate.url,
    sourceTitle: candidate.title,
    sourceProvider: "public_research",
    sourceTier,
    sourceClassification: candidate.source_classification,
    sourceReliability: candidate.source_classification === "unknown"
      ? 55
      : candidate.source_classification === "official_social_network"
        ? 48
        : 30,
    supportingLinks: [candidate.url],
  }
}

function manualCandidate(prospect: SignalProspect, parsed: ReturnType<typeof parseSignalAnalysisInput>) {
  const override = objectRecord(prospect.manual_identity_override)
  if (!Object.keys(override).length) return null
  const name = typeof override.canonical_name === "string"
    ? override.canonical_name
    : typeof override.business_name === "string"
      ? override.business_name
      : parsed.submittedName
  const address = typeof override.public_address === "string" ? override.public_address : parsed.submittedAddress
  const websiteUrl = typeof override.website_url === "string" ? override.website_url : parsed.officialWebsiteUrl
  const mapsUrl = typeof override.maps_url === "string" ? override.maps_url : parsed.mapsUrl
  const reparsed = parseSignalAnalysisInput(
    [name, address, typeof override.public_phone === "string" ? override.public_phone : parsed.phone, mapsUrl, websiteUrl]
      .filter(Boolean).join(" — "),
  )
  return {
    ...submittedInputCandidate(reparsed),
    id: "manual-confirmation",
    sourceTier: "manual" as const,
    sourceProvider: "mountline_correction",
    sourceReliability: 100,
    userConfirmed: true,
  }
}

async function resolveSubmittedPlaces(parsed: ReturnType<typeof parseSignalAnalysisInput>) {
  const places: SignalPlace[] = []
  const warnings: string[] = []
  const provider = getSignalPlacesProvider()
  if (!provider) {
    if (parsed.googlePlaceId || parsed.submittedLocation) warnings.push("Google Places is not configured; structured identity matching is unavailable.")
    return { places, warnings }
  }
  try {
    if (parsed.googlePlaceId) {
      const detail = await provider.placeDetails(parsed.googlePlaceId)
      if (detail.place) places.push(detail.place)
      return { places, warnings }
    }
    if (!parsed.submittedName || !parsed.submittedLocation) return { places, warnings }
    const market = await provider.resolveMarket(parsed.submittedAddress || parsed.submittedLocation, 5)
    const search = await provider.textSearch({ query: parsed.query, boundary: market.boundary })
    const detailed = await Promise.all(search.places.slice(0, 5).map(async (place) => {
      try {
        return (await provider.placeDetails(place.provider_place_id)).place || place
      } catch {
        return place
      }
    }))
    places.push(...detailed.filter((place): place is SignalPlace => Boolean(place)))
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : "Google Places identity search was unavailable.")
  }
  return { places, warnings }
}

export async function queueSignalBusinessAnalysis(input: {
  businessInput: string
  observation?: string | null
  createdBy: string
  source?: "manual" | "scout_suggestion"
  analyzeNow?: boolean
  parsedOverrides?: SignalInputOverrides
}) {
  const parsed = parseSignalAnalysisInput(input.businessInput, input.parsedOverrides)
  const analysisStatus = input.analyzeNow === false ? "needs_review" as const : "queued" as const
  const supabase = createAdminClient()
  const [{ data: prospectRows, error: prospectsError }, fingerprintResult] = await Promise.all([
    supabase.from("signal_prospects").select("*").order("updated_at", { ascending: false }).limit(500),
    parsed.identityFingerprint
      ? supabase.from("signal_prospects").select("*").eq("identity_fingerprint", parsed.identityFingerprint).maybeSingle()
      : Promise.resolve({ data: null, error: null }),
  ])

  if (prospectsError) throw new Error(prospectsError.message)
  if (fingerprintResult.error) throw new Error(fingerprintResult.error.message)

  const candidate = {
    businessName: prospectFallbackName(parsed),
    websiteUrl: parsed.officialWebsiteUrl,
    phone: parsed.phone,
    city: parsed.submittedCity,
  }
  const duplicates = findLikelySignalDuplicates((prospectRows || []) as SignalProspect[], candidate)
  const fingerprintDuplicate = fingerprintResult.data as SignalProspect | null
  const exactDuplicate = fingerprintDuplicate || duplicates.find((item) => item.confidence === "exact")?.prospect || null
  let prospect: SignalProspect

  if (exactDuplicate) {
    const manualOverride = exactDuplicate.manual_identity_override && typeof exactDuplicate.manual_identity_override === "object"
      ? exactDuplicate.manual_identity_override
      : {}
    const submittedName = parsed.submittedName || exactDuplicate.submitted_name || exactDuplicate.business_name
    const { data, error } = await supabase
      .from("signal_prospects")
      .update({
        analysis_input: input.businessInput.trim(),
        submitted_input: input.businessInput.trim(),
        submitted_name: submittedName,
        submitted_address: parsed.submittedAddress,
        submitted_phone: parsed.phone,
        submitted_url: parsed.mapsUrl || parsed.officialWebsiteUrl || parsed.socialUrls[0] || null,
        submitted_location: parsed.submittedLocation,
        submitted_note: parsed.noteFragments.join("\n") || null,
        identity_anchor_type: parsed.identityAnchorType,
        identity_anchor_strength: parsed.identityAnchorStrength,
        identity_fingerprint: parsed.identityFingerprint || exactDuplicate.identity_fingerprint,
        identity_resolution_state: "parsed",
        identity_resolution: { parser: parsed, reused_prospect_id: exactDuplicate.id },
        lead_lifecycle: input.analyzeNow === false ? "draft_input" : "resolving",
        analysis_status: analysisStatus,
        analysis_error: null,
        website_url: exactDuplicate.website_url || parsed.officialWebsiteUrl,
        public_phone: exactDuplicate.public_phone || parsed.phone,
        instagram_url: exactDuplicate.instagram_url || parsed.socialUrls.find((url) => url.includes("instagram.com")) || null,
        facebook_url: exactDuplicate.facebook_url || parsed.socialUrls.find((url) => url.includes("facebook.com")) || null,
        business_name: typeof (manualOverride as Record<string, unknown>).canonical_name === "string"
          ? (manualOverride as Record<string, unknown>).canonical_name
          : submittedName,
        display_name: typeof (manualOverride as Record<string, unknown>).canonical_name === "string"
          ? (manualOverride as Record<string, unknown>).canonical_name
          : submittedName,
      })
      .eq("id", exactDuplicate.id)
      .select()
      .single()
    if (error) throw new Error(error.message)
    prospect = data as SignalProspect
  } else {
    const name = prospectFallbackName(parsed)
    const { data, error } = await supabase
      .from("signal_prospects")
      .insert({
        business_name: name,
        industry: "Unknown — needs review",
        city: parsed.submittedCity,
        state: parsed.submittedState,
        website_url: parsed.officialWebsiteUrl,
        public_phone: parsed.phone,
        instagram_url: parsed.socialUrls.find((url) => url.includes("instagram.com")) || null,
        facebook_url: parsed.socialUrls.find((url) => url.includes("facebook.com")) || null,
        source: input.source || "manual",
        normalized_business_name: normalizeSignalBusinessName(name) || null,
        normalized_hostname: normalizeSignalHostname(parsed.officialWebsiteUrl) || null,
        public_phone_normalized: normalizeSignalPhone(parsed.phone) || null,
        analysis_input: input.businessInput.trim(),
        submitted_input: input.businessInput.trim(),
        submitted_name: parsed.submittedName,
        submitted_address: parsed.submittedAddress,
        submitted_phone: parsed.phone,
        submitted_url: parsed.mapsUrl || parsed.officialWebsiteUrl || parsed.socialUrls[0] || null,
        submitted_location: parsed.submittedLocation,
        submitted_note: parsed.noteFragments.join("\n") || null,
        identity_anchor_type: parsed.identityAnchorType,
        identity_anchor_strength: parsed.identityAnchorStrength,
        identity_fingerprint: parsed.identityFingerprint || null,
        identity_resolution_state: "parsed",
        identity_resolution: { parser: parsed },
        canonical_name: name,
        canonical_name_status: "submitted",
        canonical_name_source: "submitted_input",
        display_name: name,
        lead_lifecycle: input.analyzeNow === false ? "draft_input" : "resolving",
        analysis_status: analysisStatus,
        identity_status: "needs_review",
        pipeline_stage: "found",
        next_action: input.analyzeNow === false
          ? "Review the saved lead and run focused Signal analysis when ready."
          : "Run focused Signal analysis",
      })
      .select()
      .single()
    if (error) throw new Error(error.message)
    prospect = data as SignalProspect

    await supabase.from("signal_lead_stage_history").insert({
      prospect_id: prospect.id,
      from_stage: null,
      to_stage: "found",
      reason: "Focused analysis submitted.",
      created_by: input.createdBy,
    })
  }

  const inputRows: LedgerInsert[] = [
    evidenceRow(prospect.id, {
      evidence_category: "unverified_claim",
      evidence_tier: "unknown",
      claim_type: "submitted_input",
      claim_text: input.businessInput.trim(),
      source_url: parsed.urls[0] || null,
      source_provider: "manual_input",
      source_excerpt: "Submitted for Signal analysis; identity and business claims remain unverified until corroborated.",
      confidence: 20,
      created_by: input.createdBy,
      subject_name: parsed.submittedName,
      subject_identity_key: parsed.identityFingerprint || null,
      publisher_name: "Mountline team submission",
      source_classification: "unknown",
      decision_status: "accepted",
      decision_reason: "Submitted facts are the identity anchor; public research may verify or contradict them but cannot silently replace them.",
      affected_analysis_areas: ["identity"],
    }),
  ]
  if (input.observation?.trim()) {
    inputRows.push(evidenceRow(prospect.id, {
      evidence_category: "mountline_observation",
      evidence_tier: "mountline_private",
      claim_type: "private_observation",
      claim_text: input.observation.trim().slice(0, 3000),
      source_provider: "team_observation",
      verification_status: "unknown",
      confidence: null,
      created_by: input.createdBy,
    }))
  }

  const { error: evidenceError } = await supabase.from("signal_evidence_ledger").insert(inputRows)
  if (evidenceError) throw new Error(evidenceError.message)
  await supabase.from("signal_lead_activities").insert({
    prospect_id: prospect.id,
    activity_type: input.analyzeNow === false
      ? (exactDuplicate ? "manual_lead_updated" : "manual_lead_created")
      : (exactDuplicate ? "analysis_requeued" : "analysis_queued"),
    summary: input.analyzeNow === false
      ? (exactDuplicate ? "The existing lead was updated without starting research." : "A manual lead was saved without starting research.")
      : (exactDuplicate
          ? "Focused analysis was queued against the existing lead record."
          : "Focused analysis was queued."),
    metadata: { input_types: {
      maps: Boolean(parsed.mapsUrl),
      website: Boolean(parsed.officialWebsiteUrl),
      social: parsed.socialUrls.length > 0,
      phone: Boolean(parsed.phone),
    } },
    created_by: input.createdBy,
  })

  return { prospect, reused: Boolean(exactDuplicate), parsed }
}

async function resolveSignalIdentity(prospect: SignalProspect) {
  const override = objectRecord(prospect.manual_identity_override)
  const parsed = await expandSubmittedMapsUrl(parseSignalAnalysisInput(
    prospect.submitted_input || prospect.analysis_input || prospect.business_name,
    {
      businessName: typeof override.canonical_name === "string" ? override.canonical_name : prospect.submitted_name,
      address: typeof override.public_address === "string" ? override.public_address : prospect.submitted_address,
      phone: typeof override.public_phone === "string" ? override.public_phone : prospect.submitted_phone,
      websiteUrl: typeof override.website_url === "string" ? override.website_url : undefined,
    },
  ))
  const anchor = submittedInputCandidate(parsed)
  const storedManual = manualCandidate(prospect, parsed)
  if (storedManual) Object.assign(anchor, storedManual)

  const placeResult = await resolveSubmittedPlaces(parsed)
  const placeCandidates = placeResult.places.map(candidateFromPlace)
  const nameForResearch = parsed.submittedName || parsed.phone || prospect.business_name
  const locationForResearch = parsed.submittedLocation || [prospect.city, prospect.state].filter(Boolean).join(", ") || "business"
  const research = nameForResearch
    ? await runSignalPublicResearch({ businessName: nameForResearch, industryHint: prospect.industry, location: locationForResearch })
    : null
  const researchCandidates = (research?.candidates || []).map(candidateFromResearch)
  const initialCandidates = [...placeCandidates, ...researchCandidates]
  const initialGraph = resolveSignalIdentityGraph({ anchor, candidates: initialCandidates })
  const selectedInitial = initialGraph.candidates.find((candidate) => candidate.id === initialGraph.selectedCandidateId)
  const selectedPlace = initialGraph.candidates
    .filter((candidate) => candidate.id.startsWith("place:") && candidate.conflicts.length === 0)
    .sort((left, right) => right.match.total - left.match.total)[0]
  const place = selectedPlace
    ? placeResult.places.find((item) => `place:${item.provider_place_id}` === selectedPlace.id) || null
    : placeResult.places.length === 1 && parsed.googlePlaceId
      ? placeResult.places[0]
      : null
  const manualWebsite = typeof override.website_url === "string" ? override.website_url : null
  const websiteCandidateUrl = manualWebsite
    || parsed.officialWebsiteUrl
    || place?.website_url
    || (selectedInitial?.officialWebsiteEligible && selectedInitial.match.total >= 58 ? selectedInitial.websiteUrl : null)
  const sourceClassification = websiteCandidateUrl
    ? classifySourceDomain(websiteCandidateUrl, { confirmedOfficial: Boolean(manualWebsite) }).classification
    : null
  const scan = await scanSignalWebsite(websiteCandidateUrl)
  const pageText = scan.pages.map((page) => page.textExcerpt).join(" ").slice(0, 8000)
  const expectedAddress = place?.formatted_address || parsed.submittedAddress
  const expectedPhone = place?.phone || parsed.phone
  const assessedSite = assessSignalOfficialWebsite({
    businessName: parsed.submittedName || prospect.business_name,
    websiteUrl: websiteCandidateUrl,
    listingWebsite: Boolean(
      (place?.website_url && place.website_url === websiteCandidateUrl)
      || (parsed.officialWebsiteUrl && parsed.officialWebsiteUrl === websiteCandidateUrl),
    ),
    reachable: !scan.broken_response,
    broken: scan.broken_response,
    pageTitle: scan.page_title,
    openGraphSiteName: scan.open_graph_site_name,
    structuredNames: scan.json_ld_names,
    visiblePhones: scan.visible_phones,
    expectedPhone,
    addressText: `${scan.hours_location_language.join(" ")} ${pageText}`,
    expectedAddress,
    city: place?.city || parsed.submittedCity,
    linkedSocialUrls: scan.social_links,
    expectedSocialUrls: parsed.socialUrls,
    pageText,
    sourceClassification,
  })
  const siteAssessment = !websiteCandidateUrl && !research?.ok
    ? {
        status: "website_unknown" as const,
        confidence: 0,
        accepted: false,
        evidence: ["No official website candidate was verified because public web research was unavailable."],
      }
    : assessedSite
  const websiteParsed = parseSignalAnalysisInput(`${scan.open_graph_site_name || scan.json_ld_names[0] || scan.page_title || ""} ${pageText}`)
  const websiteName = cleanSignalBusinessName(
    scan.json_ld_names[0] || scan.open_graph_site_name || scan.page_title,
    { city: place?.city || parsed.submittedCity, state: place?.state || parsed.submittedState, category: place?.primary_category || prospect.industry },
  ).name
  const websiteCandidate: SignalIdentityCandidate | null = websiteCandidateUrl ? {
    id: `website:${signalHostname(websiteCandidateUrl)}`,
    name: websiteName,
    address: websiteParsed.submittedAddress,
    city: websiteParsed.submittedCity || place?.city || null,
    state: websiteParsed.submittedState || place?.state || null,
    zip: websiteParsed.submittedZip,
    latitude: null,
    longitude: null,
    phone: scan.visible_phones[0] || null,
    domain: signalHostname(websiteCandidateUrl) || null,
    websiteUrl: websiteCandidateUrl,
    socialUrls: scan.social_links,
    placesId: place?.website_url === websiteCandidateUrl ? place.provider_place_id : null,
    category: place?.primary_category || null,
    sourceUrl: websiteCandidateUrl,
    sourceTitle: scan.open_graph_site_name || scan.page_title,
    sourceProvider: "website_scan",
    sourceTier: siteAssessment.accepted ? "first_party" : "search",
    sourceClassification: siteAssessment.accepted ? "official_business_site" : sourceClassification || "unknown",
    sourceReliability: siteAssessment.accepted ? Math.max(72, siteAssessment.confidence) : 42,
    supportingLinks: unique([websiteCandidateUrl, ...scan.scanned_urls, ...scan.social_links]),
  } : null

  const manuallyConfirmedSocialUrls = unique([
    typeof override.facebook_url === "string" ? override.facebook_url : null,
    typeof override.instagram_url === "string" ? override.instagram_url : null,
  ])
  const socialInputs = unique([
    ...parsed.socialUrls,
    ...manuallyConfirmedSocialUrls,
    ...scan.social_links,
    ...(research?.candidates || []).filter((candidate) => candidate.source_classification === "official_social_network").map((candidate) => candidate.url),
  ])
  const socialAssessments: SignalSocialProfileAssessment[] = socialInputs.map((profileUrl) => {
    if (manuallyConfirmedSocialUrls.includes(profileUrl)) {
      return {
        platform: profileUrl.includes("facebook.com") ? "facebook" : profileUrl.includes("instagram.com") ? "instagram" : "other",
        profileUrl,
        displayName: parsed.submittedName || prospect.business_name,
        matchingPhone: Boolean(expectedPhone),
        matchingCity: Boolean(place?.city || parsed.submittedCity),
        matchingAddress: Boolean(expectedAddress),
        matchingWebsite: Boolean(websiteCandidateUrl),
        confidence: 100,
        official: true,
        verificationExplanation: "Mountline confirmed this profile in the saved identity correction.",
      }
    }
    const publicResult = research?.candidates.find((candidate) => candidate.url === profileUrl)
    return assessSignalSocialProfile({
      businessName: parsed.submittedName || prospect.business_name,
      profileUrl,
      title: publicResult?.title,
      snippet: publicResult?.evidence,
      expectedPhone,
      expectedCity: place?.city || parsed.submittedCity,
      expectedAddress,
      expectedWebsite: siteAssessment.accepted ? websiteCandidateUrl : null,
      linkedFromVerifiedWebsite: siteAssessment.accepted && scan.social_links.includes(profileUrl),
    })
  })
  const socialCandidates: SignalIdentityCandidate[] = socialAssessments
    .filter((assessment) => assessment.official)
    .map((assessment, index) => ({
      id: `social:${index}:${signalHostname(assessment.profileUrl)}`,
      name: assessment.displayName,
      address: assessment.matchingAddress ? expectedAddress : null,
      city: assessment.matchingCity ? place?.city || parsed.submittedCity : null,
      state: assessment.matchingCity ? place?.state || parsed.submittedState : null,
      zip: null,
      latitude: null,
      longitude: null,
      phone: assessment.matchingPhone ? expectedPhone : null,
      domain: null,
      websiteUrl: null,
      socialUrls: [assessment.profileUrl],
      placesId: null,
      category: null,
      sourceUrl: assessment.profileUrl,
      sourceTitle: assessment.displayName,
      sourceProvider: assessment.platform,
      sourceTier: "social",
      sourceClassification: "official_social_network",
      sourceReliability: assessment.confidence,
      supportingLinks: [assessment.profileUrl],
    }))
  const graph = resolveSignalIdentityGraph({
    anchor,
    candidates: [...initialCandidates, ...(websiteCandidate ? [websiteCandidate] : []), ...socialCandidates],
  })
  const selectedPlaceCandidate = graph.candidates
    .filter((candidate) => candidate.id.startsWith("place:") && candidate.conflicts.length === 0)
    .sort((left, right) => right.match.total - left.match.total)[0]
  const resolvedPlace = selectedPlaceCandidate
    ? placeResult.places.find((item) => `place:${item.provider_place_id}` === selectedPlaceCandidate.id) || place
    : place
  const identityStatus = ["exact_match", "user_confirmed", "verified"].includes(graph.state)
    ? "verified" as const
    : graph.state === "likely_match"
      ? "likely" as const
      : graph.state === "ambiguous"
        ? "ambiguous" as const
        : graph.state === "rejected"
          ? "rejected" as const
          : "needs_review" as const
  const businessName = graph.canonicalName || parsed.submittedName || prospect.business_name
  const acceptedWebsiteUrl = siteAssessment.accepted ? websiteCandidateUrl : null
  const chain = assessSignalChain({
    businessName,
    url: acceptedWebsiteUrl,
    publicText: pageText,
    discoveredUrls: unique([acceptedWebsiteUrl, resolvedPlace?.listing_url, ...scan.social_links]),
  })
  return {
    businessName,
    chain,
    graph,
    identityStatus,
    parsed,
    place: resolvedPlace,
    providerWarning: unique([research?.setup_message, ...placeResult.warnings]).join(" ") || null,
    research,
    scan,
    siteAssessment,
    socialAssessments,
    verifiedSocialUrls: socialAssessments.filter((assessment) => assessment.official).map((assessment) => assessment.profileUrl),
    websiteUrl: acceptedWebsiteUrl,
  }
}

function buildResolvedEvidence(
  prospectId: string,
  resolved: Awaited<ReturnType<typeof resolveSignalIdentity>>,
) {
  const rows: LedgerInsert[] = []
  const { place, research, scan, siteAssessment } = resolved
  const identityAccepted = ["exact_match", "user_confirmed", "verified"].includes(resolved.graph.state)
  const subject = resolved.businessName
  const subjectKey = resolved.parsed.identityFingerprint || null

  if (place) {
    const placeFacts = [
      ["business_name", place.canonical_name],
      ["public_address", place.formatted_address],
      ["public_phone", place.phone],
      ["official_website_candidate", place.website_url],
      ["business_status", place.business_status],
      ["primary_category", place.primary_category],
      ["public_rating", place.rating == null ? null : `${place.rating} from ${place.review_count ?? "unknown"} public reviews`],
    ] as const
    for (const [claimType, claimText] of placeFacts) {
      if (!claimText) continue
      rows.push(evidenceRow(prospectId, {
        evidence_category: identityAccepted ? "verified_public_fact" : "likely_inference",
        evidence_tier: "platform_listing",
        claim_type: claimType,
        claim_text: String(claimText),
        source_url: place.listing_url,
        source_title: `${place.canonical_name} public place listing`,
        source_provider: place.provider,
        source_excerpt: String(claimText),
        verification_status: identityAccepted ? "verified" : "unverified",
        confidence: identityAccepted ? 90 : 58,
        metadata: { provider_place_id: place.provider_place_id },
        subject_name: subject,
        subject_identity_key: subjectKey,
        publisher_name: "Google Places",
        publisher_domain: signalHostname(place.listing_url) || "google.com",
        source_classification: "places_map_listing",
        decision_status: identityAccepted ? "accepted" : "needs_confirmation",
        decision_reason: resolved.graph.explanation,
        affected_analysis_areas: ["identity", claimType === "public_phone" ? "contact" : "location"],
      }))
    }
  }

  if (siteAssessment.accepted) {
    rows.push(evidenceRow(prospectId, {
      evidence_category: "verified_public_fact",
      evidence_tier: "first_party",
      claim_type: "official_website",
      claim_text: resolved.websiteUrl || scan.requested_url || "Official website confirmed",
      source_url: resolved.websiteUrl,
      source_title: scan.open_graph_site_name || scan.page_title,
      source_provider: "official_website",
      source_excerpt: siteAssessment.evidence.join(" "),
      verification_status: siteAssessment.status === "verified_official_website" ? "verified" : "corroborated",
      confidence: Math.min(99, siteAssessment.confidence),
      subject_name: subject,
      subject_identity_key: subjectKey,
      publisher_name: subject,
      publisher_domain: signalHostname(resolved.websiteUrl),
      source_classification: "official_business_site",
      decision_status: "accepted",
      decision_reason: siteAssessment.evidence.join(" "),
      affected_analysis_areas: ["website", "opportunity", "sales"],
    }))
    for (const item of scan.evidence.slice(0, 30)) {
      rows.push(evidenceRow(prospectId, {
        evidence_category: "verified_public_fact",
        evidence_tier: "first_party",
        claim_type: item.signal,
        claim_text: item.snippet,
        source_url: item.url,
        source_title: scan.page_title,
        source_provider: "official_website",
        source_excerpt: item.snippet,
        verification_status: "verified",
        confidence: item.confidence === "high" ? 92 : item.confidence === "medium" ? 76 : 58,
        subject_name: subject,
        subject_identity_key: subjectKey,
        publisher_name: subject,
        publisher_domain: signalHostname(item.url),
        source_classification: "official_business_site",
        decision_status: "accepted",
        decision_reason: "The fact was extracted from the identity-matched official business site.",
        affected_analysis_areas: ["opportunity"],
      }))
    }
  } else if (scan.requested_url) {
    rows.push(evidenceRow(prospectId, {
      evidence_category: classifySourceDomain(scan.requested_url).canBeOfficialWebsite ? "unverified_claim" : "rejected_source",
      evidence_tier: "search_result",
      claim_type: "website_candidate",
      claim_text: scan.requested_url,
      source_url: scan.requested_url,
      source_provider: "website_scan",
      source_excerpt: siteAssessment.evidence.join(" "),
      verification_status: classifySourceDomain(scan.requested_url).canBeOfficialWebsite ? "unverified" : "rejected",
      confidence: Math.min(50, siteAssessment.confidence),
      subject_name: subject,
      subject_identity_key: subjectKey,
      publisher_name: classifySourceDomain(scan.requested_url).publisherName,
      publisher_domain: signalHostname(scan.requested_url),
      source_classification: classifySourceDomain(scan.requested_url).classification,
      decision_status: classifySourceDomain(scan.requested_url).canBeOfficialWebsite ? "needs_confirmation" : "rejected",
      decision_reason: siteAssessment.evidence.join(" "),
      affected_analysis_areas: ["identity", "website"],
    }))
  }

  for (const candidate of research?.candidates || []) {
    const graphCandidate = resolved.graph.candidates.find((item) => item.sourceUrl === candidate.url)
    const reviewProfileMatch = candidate.source_classification === "review_platform"
      && identityAccepted
      && Boolean(graphCandidate && graphCandidate.match.total >= 58)
    if (reviewProfileMatch && graphCandidate) {
      const matchedFields = unique([
        graphCandidate.name ? `name (${graphCandidate.name})` : null,
        graphCandidate.address ? `address (${graphCandidate.address})` : null,
        graphCandidate.phone ? `phone (${formatSignalPhone(graphCandidate.phone)})` : null,
      ])
      const reviewCount = candidate.evidence.match(/\b([\d,]+)\s+(?:public\s+)?reviews?\b/i)?.[1]
      rows.push(evidenceRow(prospectId, {
        evidence_category: "verified_public_fact",
        evidence_tier: "directory",
        claim_type: "public_review_profile",
        claim_text: `${candidate.publisher_name || "The review platform"} is a third-party profile, not the official website. It agrees with the active business ${matchedFields.join(" and ")}${reviewCount ? ` and shows ${reviewCount} public reviews` : ""}.`,
        source_url: candidate.url,
        source_title: candidate.title,
        source_provider: research?.provider || "public_research",
        source_excerpt: candidate.evidence,
        verification_status: "corroborated",
        confidence: Math.min(82, graphCandidate.match.total),
        subject_name: subject,
        subject_identity_key: subjectKey,
        publisher_name: candidate.publisher_name,
        publisher_domain: signalHostname(candidate.url),
        source_classification: "review_platform",
        decision_status: "accepted",
        decision_reason: "The profile supports matching identity and reputation facts but cannot supply the official website or unverified business claims.",
        affected_analysis_areas: ["identity", "reputation"],
      }))
    }
    const rejected = !candidate.official_site_eligible
      || Boolean(graphCandidate?.rejectionReason && graphCandidate.match.total < 58)
    rows.push(evidenceRow(prospectId, {
      evidence_category: rejected
        ? "rejected_source"
        : candidate.source_type === "likely_official_site" && candidate.confidence !== "low"
        ? "likely_inference"
        : "unverified_claim",
      evidence_tier: candidate.source_type === "social"
        ? "social_profile"
        : candidate.source_type === "directory"
          ? "directory"
          : "search_result",
      claim_type: `${candidate.source_type}_candidate`,
      claim_text: candidate.title,
      source_url: candidate.url,
      source_title: candidate.title,
      source_provider: research?.provider || "public_research",
      source_excerpt: candidate.evidence,
      verification_status: rejected ? "rejected" : "unverified",
      confidence: graphCandidate?.match.total || (candidate.confidence === "high" ? 72 : candidate.confidence === "medium" ? 55 : 30),
      subject_name: subject,
      subject_identity_key: subjectKey,
      publisher_name: candidate.publisher_name,
      publisher_domain: signalHostname(candidate.url),
      source_classification: candidate.source_classification,
      decision_status: rejected ? "rejected" : "needs_confirmation",
      decision_reason: rejected
        ? graphCandidate?.rejectionReason || candidate.classification_reason
        : graphCandidate?.matchReasons.join(" and ") || "This result still needs a stable identity match.",
      affected_analysis_areas: ["identity", candidate.source_type === "social" ? "social" : "website"],
    }))
  }

  for (const assessment of resolved.socialAssessments) {
    const source = classifySignalSource(assessment.profileUrl)
    rows.push(evidenceRow(prospectId, {
      evidence_category: assessment.official ? "verified_public_fact" : "rejected_source",
      evidence_tier: "social_profile",
      claim_type: "social_profile_candidate",
      claim_text: assessment.profileUrl,
      source_url: assessment.profileUrl,
      source_provider: assessment.platform,
      source_excerpt: assessment.verificationExplanation,
      verification_status: assessment.official ? "corroborated" : "rejected",
      confidence: assessment.confidence,
      subject_name: subject,
      subject_identity_key: subjectKey,
      publisher_name: source.publisherName,
      publisher_domain: source.hostname,
      source_classification: "official_social_network",
      decision_status: assessment.official ? "accepted" : "rejected",
      decision_reason: assessment.verificationExplanation,
      affected_analysis_areas: ["identity", "social", "contact"],
    }))
  }

  return rows
}

async function persistIdentityCandidates(
  prospectId: string,
  graph: SignalIdentityGraphResolution,
  createdBy: string,
) {
  const supabase = createAdminClient()
  await supabase.from("signal_identity_candidates").delete().eq("prospect_id", prospectId)
  if (!graph.candidates.length) return
  const { error } = await supabase.from("signal_identity_candidates").insert(graph.candidates.map((candidate) => ({
    prospect_id: prospectId,
    candidate_key: candidate.id,
    candidate_name: candidate.name,
    address: candidate.address,
    city: candidate.city,
    state: candidate.state,
    zip: candidate.zip,
    latitude: candidate.latitude,
    longitude: candidate.longitude,
    phone: formatSignalPhone(candidate.phone),
    domain: candidate.domain,
    website_url: candidate.websiteUrl,
    social_urls: candidate.socialUrls,
    provider_place_id: candidate.placesId,
    category: candidate.category,
    source_url: candidate.sourceUrl,
    source_title: candidate.sourceTitle,
    source_provider: candidate.sourceProvider,
    source_tier: candidate.sourceTier,
    source_classification: candidate.sourceClassification,
    source_reliability: candidate.sourceReliability,
    match_score: candidate.match.total,
    match_components: candidate.match,
    conflicts: candidate.conflicts,
    match_reasons: candidate.matchReasons,
    supporting_links: candidate.supportingLinks,
    canonical_eligible: candidate.canonicalEligible,
    official_website_eligible: candidate.officialWebsiteEligible,
    resolution_status: candidate.userConfirmed
      ? "user_confirmed"
      : graph.selectedCandidateId === candidate.id
        ? "selected"
        : candidate.rejectionReason
          ? "rejected"
          : "possible",
    rejection_reason: candidate.rejectionReason,
    user_confirmed_at: candidate.userConfirmed ? new Date().toISOString() : null,
    user_confirmed_by: candidate.userConfirmed ? createdBy : null,
  })))
  if (error) throw new Error(error.message)
}

async function persistVerificationItems(
  prospectId: string,
  items: ReturnType<typeof buildSignalVerificationChecklist>,
) {
  const supabase = createAdminClient()
  const { data: existing } = await supabase
    .from("signal_verification_items")
    .select("requirement_key, status, resolution_note, resolved_at, resolved_by")
    .eq("prospect_id", prospectId)
  const prior = new Map((existing || []).map((item) => [item.requirement_key, item]))
  const currentKeys = items.map((item) => item.key)
  await Promise.all((existing || [])
    .filter((item) => item.status === "unresolved" && !currentKeys.includes(item.requirement_key))
    .map((item) => supabase.from("signal_verification_items")
      .update({ status: "dismissed", resolved_at: new Date().toISOString() })
      .eq("prospect_id", prospectId)
      .eq("requirement_key", item.requirement_key)))
  if (!items.length) return
  const { error } = await supabase.from("signal_verification_items").upsert(items.map((item) => {
    const previous = prior.get(item.key)
    return {
      prospect_id: prospectId,
      requirement_key: item.key,
      title: item.title,
      why_it_matters: item.whyItMatters,
      current_evidence: item.currentEvidence,
      fastest_method: item.fastestMethod,
      action_type: item.actionType,
      action_url: item.actionUrl || null,
      required: item.required,
      status: previous?.status === "resolved" || previous?.status === "unrelated" ? previous.status : "unresolved",
      resolution_note: previous?.resolution_note || null,
      resolved_at: previous?.resolved_at || null,
      resolved_by: previous?.resolved_by || null,
      updated_at: new Date().toISOString(),
    }
  }), { onConflict: "prospect_id,requirement_key" })
  if (error) throw new Error(error.message)
}

function identityReady(state: SignalIdentityResolutionState) {
  return ["exact_match", "user_confirmed", "verified"].includes(state)
}

function buildApproachabilityPlan(input: {
  prospect: SignalProspect
  place: SignalPlace | null
  verifiedPhone: string | null
  verifiedEmail: string | null
}) {
  if (input.verifiedPhone) {
    const appointmentBased = /appointment|clinic|dental|medical|salon|spa/i.test(input.prospect.industry || "")
      || input.place?.service_area_business
    return {
      best_first_move: appointmentBased ? "Call first." : "Call first, then offer an in-person walkthrough if the owner is available.",
      why: appointmentBased
        ? "This appears appointment-based or service-area based, so an unannounced visit could interrupt work."
        : "The phone is verified and lets Mountline confirm the right contact before arriving.",
      best_likely_timing: "No quieter time is verified. Use the published hours and ask for a better time if the business is busy.",
      backup_route: input.verifiedEmail ? `Email ${input.verifiedEmail}.` : "Use the verified public contact route or visit only during published hours.",
      prepare: "Have the evidence summary and one focused concept direction ready; do not lead with unverified claims.",
    }
  }
  if (input.verifiedEmail) {
    return {
      best_first_move: "Send a short email asking who handles the public website or customer contact flow.",
      why: "Email is the only verified direct route currently available.",
      best_likely_timing: "No timing pattern is supported by current evidence.",
      backup_route: "Confirm a public phone or Maps listing before trying another route.",
      prepare: "Use a neutral introduction and one discovery question; do not attach a speculative pitch.",
    }
  }
  return {
    best_first_move: "Verify a current phone, email, or storefront route before contact.",
    why: "Signal does not have a reliable contact path yet.",
    best_likely_timing: "Unknown until the contact route and business hours are verified.",
    backup_route: "Add the exact Maps listing or an official social profile with matching contact details.",
    prepare: "Keep this as a research briefing only.",
  }
}

function directSmallestOffer(input: {
  identityState: SignalIdentityResolutionState
  websiteStatus: string
  hasContactFlow: boolean
  recommendedOffer?: string | null
}) {
  if (!identityReady(input.identityState)) return "No project yet—verify the correct business and its official online presence first."
  if (input.websiteStatus === "no_official_website_found") {
    return "A simple one-page website with services, hours, directions or service area, and a clear call or quote button. Excludes custom booking and back-office systems."
  }
  if (["website_unreachable", "website_broken", "website_parked"].includes(input.websiteStatus)) {
    return "A reliable one-page replacement that restores essential business information and one contact path. Excludes a full rebrand or custom customer portal."
  }
  if (!input.hasContactFlow) {
    return "A focused refresh of the main service page and quote/contact flow so customers can take one clear next step. Excludes unrelated feature work."
  }
  if (input.recommendedOffer) {
    return `${input.recommendedOffer.replace(/[.]+$/, "")}. Keep the first phase limited to the verified customer-path problem; exclude speculative automation and unrelated features.`
  }
  return "No project yet—verify one customer-path problem before defining scope."
}

function confidenceDimensions(input: {
  graph: SignalIdentityGraphResolution
  sufficiency: SignalResearchSufficiency
  websiteConfidence: number
  socialConfidence: number
  opportunityConfidence?: string | null
}) {
  const label = (score: number) => score >= 78 ? "strong" : score >= 55 ? "moderate" : "limited"
  return {
    overall: input.sufficiency.sales.status === "sufficient" ? "strong" : input.sufficiency.identity.status === "insufficient" ? "limited" : "moderate",
    identity: { label: label(input.graph.confidence), explanation: input.graph.explanation },
    location: { label: input.graph.candidates.some((candidate) => candidate.match.addressAgreement >= 92) ? "strong" : "limited" },
    contact: { label: input.sufficiency.contact.status === "sufficient" ? "strong" : input.sufficiency.contact.status === "limited" ? "moderate" : "limited" },
    website: { label: label(input.websiteConfidence) },
    social_profiles: { label: label(input.socialConfidence) },
    opportunity: { label: input.opportunityConfidence || (input.sufficiency.opportunity.status === "sufficient" ? "strong" : "limited") },
    approachability: { label: input.sufficiency.contact.status === "sufficient" ? "moderate" : "limited" },
  }
}

export async function analyzeQueuedSignalProspect(
  prospectId: string,
  createdBy: string,
  scope: "full" | "identity" | "website" | "social" | "opportunity" | "sales" = "full",
) {
  const supabase = createAdminClient()
  const { data: prospectData, error: prospectError } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()
  if (prospectError) throw new Error(prospectError.message)
  if (!prospectData) throw new Error("Signal lead not found.")
  const original = prospectData as SignalProspect

  await supabase.from("signal_prospects").update({
    analysis_status: "resolving",
    lead_lifecycle: "resolving",
    last_reanalysis_scope: scope,
    analysis_error: null,
    analysis_started_at: new Date().toISOString(),
  }).eq("id", prospectId)

  try {
    const resolved = await resolveSignalIdentity(original)
    const manualOverride = objectRecord(original.manual_identity_override)
    const socialUrl = resolved.verifiedSocialUrls
      .find((url) => url.includes("instagram.com"))
      || (typeof manualOverride.instagram_url === "string" ? manualOverride.instagram_url : null)
    const facebookUrl = resolved.verifiedSocialUrls
      .find((url) => url.includes("facebook.com"))
      || (typeof manualOverride.facebook_url === "string" ? manualOverride.facebook_url : null)
    const identityIsReady = identityReady(resolved.graph.state)
    const verifiedPhone = identityIsReady
      ? formatSignalPhone(resolved.place?.phone || resolved.parsed.phone)
      : null
    const verifiedAddress = identityIsReady
      ? resolved.place?.formatted_address || resolved.parsed.submittedAddress
      : resolved.parsed.submittedAddress || original.submitted_address
    const identityUpdate = {
      business_name: resolved.businessName,
      canonical_name: resolved.businessName,
      canonical_name_status: resolved.graph.canonicalNameStatus,
      canonical_name_source: resolved.graph.canonicalSource,
      display_name: resolved.businessName,
      identity_resolution_state: resolved.graph.state,
      identity_resolution: {
        selected_candidate_id: resolved.graph.selectedCandidateId,
        explanation: resolved.graph.explanation,
        confidence: resolved.graph.confidence,
        conflicts: resolved.graph.conflicts,
        clusters: resolved.graph.clusters,
      },
      normalized_business_name: normalizeSignalBusinessName(resolved.businessName) || null,
      website_url: resolved.websiteUrl,
      normalized_hostname: normalizeSignalHostname(resolved.websiteUrl) || null,
      public_phone: verifiedPhone,
      public_phone_normalized: normalizeSignalPhone(verifiedPhone) || null,
      instagram_url: socialUrl,
      facebook_url: facebookUrl,
      provider_place_id: resolved.place?.provider_place_id || null,
      public_address: verifiedAddress,
      business_status: resolved.place?.business_status || original.business_status,
      business_location_type: typeof manualOverride.business_location_type === "string"
        ? manualOverride.business_location_type
        : resolved.place?.service_area_business
          ? "service_area"
          : resolved.place?.formatted_address
            ? "storefront"
            : original.business_location_type || "unknown",
      opening_hours: resolved.place?.opening_hours || original.opening_hours || [],
      chain_status: typeof manualOverride.chain_status === "string" ? manualOverride.chain_status : resolved.chain.classification,
      city: typeof manualOverride.city === "string" ? manualOverride.city : resolved.place?.city || original.city,
      state: typeof manualOverride.state === "string" ? manualOverride.state : resolved.place?.state || original.state,
      industry: typeof manualOverride.industry === "string" ? manualOverride.industry : resolved.place?.primary_category || original.industry,
      identity_status: resolved.identityStatus,
      analysis_status: identityIsReady ? "analyzing" : "needs_review",
      lead_lifecycle: identityIsReady ? "analyzed" : "needs_confirmation",
    }
    const { data: identifiedData, error: identityError } = await supabase
      .from("signal_prospects")
      .update(identityUpdate)
      .eq("id", prospectId)
      .select()
      .single()
    if (identityError) throw new Error(identityError.message)
    const identified = identifiedData as SignalProspect

    await persistIdentityCandidates(prospectId, resolved.graph, createdBy)

    await supabase
      .from("signal_evidence_ledger")
      .delete()
      .eq("prospect_id", prospectId)
      .eq("created_by", "signal_analysis")
    const evidenceRows = buildResolvedEvidence(prospectId, resolved)
    if (evidenceRows.length > 0) {
      const { error } = await supabase.from("signal_evidence_ledger").insert(evidenceRows)
      if (error) throw new Error(error.message)
    }

    const preliminarySufficiency = calculateSignalResearchSufficiency({
      identityState: resolved.graph.state,
      verifiedPhone: Boolean(verifiedPhone),
      verifiedEmail: Boolean(identityIsReady && identified.public_email),
      verifiedContactForm: Boolean(resolved.siteAssessment.accepted && resolved.scan.pages.some((page) => page.hasContactForm)),
      possibleContact: Boolean(resolved.parsed.phone || resolved.parsed.socialUrls.length),
      websiteStatus: resolved.siteAssessment.status,
      officialSocialCount: resolved.verifiedSocialUrls.length,
      onlineResearchAttempted: Boolean(resolved.research?.ok),
      opportunityEvidenceCount: resolved.siteAssessment.accepted ? Math.min(3, resolved.scan.evidence.length) : 0,
      positiveBusinessSignal: Boolean(resolved.place?.business_status || resolved.scan.evidence.length),
    })
    const preliminaryChecklist = buildSignalVerificationChecklist({
      businessName: resolved.businessName,
      identityState: resolved.graph.state,
      submittedAddress: resolved.parsed.submittedAddress,
      submittedPhone: resolved.parsed.phone,
      websiteUrl: resolved.websiteUrl || resolved.scan.requested_url,
      websiteStatus: resolved.siteAssessment.status,
      socialCandidateUrl: resolved.socialAssessments.find((item) => !item.official)?.profileUrl || null,
      mapsUrl: resolved.parsed.mapsUrl,
      conflicts: resolved.graph.conflicts,
      sufficiency: preliminarySufficiency,
    })
    await persistVerificationItems(prospectId, preliminaryChecklist)
    const providerIssue = providerIssueFromSignalWarning(resolved.providerWarning)

    if (!identityIsReady) {
      const verdict = resolved.graph.state === "contradictory" || resolved.graph.state === "rejected"
        ? "wrong_match" as const
        : resolved.graph.state === "likely_match"
          ? "investigate" as const
          : "could_not_resolve" as const
      const completedAt = new Date().toISOString()
      await supabase.from("signal_concepts").update({ status: "archived" })
        .eq("prospect_id", prospectId).eq("status", "prompt_ready")
      const { data: completed, error: completedError } = await supabase.from("signal_prospects").update({
        analysis_status: "needs_review",
        analysis_error: null,
        analysis_completed_at: completedAt,
        lead_lifecycle: "needs_confirmation",
        verdict,
        opportunity_label: "unknown",
        confidence_label: "low",
        approachability_label: "unknown",
        primary_opportunity: "No project yet—Signal has not verified that the discovered sources belong to the submitted business.",
        why_it_matters: resolved.graph.explanation,
        smallest_offer: directSmallestOffer({ identityState: resolved.graph.state, websiteStatus: resolved.siteAssessment.status, hasContactFlow: false }),
        must_verify: preliminaryChecklist.map((item) => item.title),
        do_not_pitch: [
          "Do not prepare outreach or a concept until the exact business is confirmed.",
          "Do not use directory publishers, search titles, or weak social profiles as business facts.",
        ],
        next_action: preliminaryChecklist[0]?.title || "Add a Maps URL, official phone, or website.",
        concept_status: "not_started",
        research_sufficiency: preliminarySufficiency,
        sales_pack_state: preliminarySufficiency.salesPackState,
        confidence_dimensions: confidenceDimensions({
          graph: resolved.graph,
          sufficiency: preliminarySufficiency,
          websiteConfidence: resolved.siteAssessment.confidence,
          socialConfidence: Math.max(0, ...resolved.socialAssessments.map((item) => item.confidence)),
        }),
        approachability_plan: buildApproachabilityPlan({ prospect: identified, place: resolved.place, verifiedPhone: null, verifiedEmail: null }),
        last_researched_at: completedAt,
      }).eq("id", prospectId).select().single()
      if (completedError) throw new Error(completedError.message)
      const completedProspect = completed as SignalProspect
      await persistSignalCopilotState({
        prospect: completedProspect,
        copilotInput: buildSignalCopilotInputFromProspect({
          prospect: completedProspect,
          evidence: evidenceRows as unknown as SignalEvidenceLedgerItem[],
          providerIssues: providerIssue ? [providerIssue] : [],
          opportunityScore: null,
          strongExistingSite: false,
        }),
        createdBy,
      })
      await supabase.from("signal_lead_activities").insert({
        prospect_id: prospectId,
        activity_type: "identity_confirmation_required",
        summary: `Signal preserved ${resolved.businessName} as submitted and withheld opportunity and sales generation.`,
        metadata: { identity_state: resolved.graph.state, candidate_count: resolved.graph.candidates.length, scope },
        created_by: createdBy,
      })
      return { analysis: null, prospect: completedProspect, evidenceCount: evidenceRows.length, aiUnavailable: true }
    }

    if (["identity", "website", "social"].includes(scope)) {
      const completedAt = new Date().toISOString()
      const { data: completed, error: completedError } = await supabase.from("signal_prospects").update({
        analysis_status: "ready",
        analysis_error: null,
        analysis_completed_at: completedAt,
        lead_lifecycle: preliminaryChecklist.some((item) => item.required) ? "needs_confirmation" : "analyzed",
        research_sufficiency: preliminarySufficiency,
        sales_pack_state: preliminarySufficiency.salesPackState,
        must_verify: preliminaryChecklist.map((item) => item.title),
        next_action: preliminaryChecklist[0]?.title || "Continue opportunity analysis.",
        confidence_dimensions: confidenceDimensions({
          graph: resolved.graph,
          sufficiency: preliminarySufficiency,
          websiteConfidence: resolved.siteAssessment.confidence,
          socialConfidence: Math.max(0, ...resolved.socialAssessments.map((item) => item.confidence)),
        }),
        approachability_plan: buildApproachabilityPlan({
          prospect: identified,
          place: resolved.place,
          verifiedPhone,
          verifiedEmail: identified.public_email,
        }),
        last_researched_at: completedAt,
      }).eq("id", prospectId).select().single()
      if (completedError) throw new Error(completedError.message)
      const completedProspect = completed as SignalProspect
      await persistSignalCopilotState({
        prospect: completedProspect,
        copilotInput: buildSignalCopilotInputFromProspect({
          prospect: completedProspect,
          evidence: evidenceRows as unknown as SignalEvidenceLedgerItem[],
          providerIssues: providerIssue ? [providerIssue] : [],
          opportunityScore: null,
          strongExistingSite: false,
        }),
        createdBy,
      })
      await supabase.from("signal_lead_activities").insert({
        prospect_id: prospectId,
        activity_type: "partial_analysis_completed",
        summary: `Signal re-ran ${scope} resolution and kept only artifacts that still match the active identity.`,
        metadata: { scope, identity_state: resolved.graph.state },
        created_by: createdBy,
      })
      return { analysis: null, prospect: completedProspect, evidenceCount: evidenceRows.length, aiUnavailable: false }
    }

    const result = await runAndStoreInitialSignalAnalysis({
      prospect: identified,
      scan: resolved.scan,
      researchContext: {
        research_provider: resolved.research?.provider || (resolved.place ? resolved.place.provider : null),
        research_query: resolved.research?.query || resolved.parsed.query,
        candidate_urls: resolved.research?.candidates.map((candidate) => candidate.url) || [],
        confirmed_official_url: resolved.siteAssessment.accepted ? resolved.websiteUrl : null,
        official_source_confidence: confidenceLabel(resolved.siteAssessment.confidence),
      },
    })

    const contradictions = evidenceRows.filter((row) => row.verification_status === "contradicted").length
    const decision = deriveSignalDecision({
      identityStatus: resolved.identityStatus,
      opportunityScore: result.output.overall_opportunity_score,
      confidence: result.output.confidence,
      reachabilityScore: result.output.reachability_score,
      isChain: resolved.chain.deterministicBlock,
      contradictions,
      strongExistingSite: result.output.website_quality_score >= 76,
    })
    const verifiedFacts = evidenceRows
      .filter((row) => row.evidence_category === "verified_public_fact")
      .map((row) => row.claim_text)
      .filter((value, index, values) => values.indexOf(value) === index)
      .slice(0, 16)
    const sufficiency = calculateSignalResearchSufficiency({
      identityState: resolved.graph.state,
      verifiedPhone: Boolean(verifiedPhone),
      verifiedEmail: Boolean(identified.public_email),
      verifiedContactForm: Boolean(resolved.siteAssessment.accepted && resolved.scan.pages.some((page) => page.hasContactForm)),
      possibleContact: Boolean(resolved.parsed.phone || resolved.parsed.socialUrls.length),
      websiteStatus: resolved.siteAssessment.status,
      officialSocialCount: resolved.verifiedSocialUrls.length,
      onlineResearchAttempted: Boolean(resolved.research?.ok),
      opportunityEvidenceCount: unique([
        ...resolved.scan.evidence.map((item) => item.snippet),
        ...result.output.reasons_to_contact,
      ]).length,
      opportunityScore: result.output.overall_opportunity_score,
      positiveBusinessSignal: Boolean(resolved.place?.business_status || result.output.reasons_to_contact.length),
    })
    const checklist = buildSignalVerificationChecklist({
      businessName: resolved.businessName,
      identityState: resolved.graph.state,
      submittedAddress: resolved.parsed.submittedAddress,
      submittedPhone: resolved.parsed.phone,
      websiteUrl: resolved.websiteUrl || resolved.scan.requested_url,
      websiteStatus: resolved.siteAssessment.status,
      socialCandidateUrl: resolved.socialAssessments.find((item) => !item.official)?.profileUrl || null,
      mapsUrl: resolved.parsed.mapsUrl,
      conflicts: resolved.graph.conflicts,
      sufficiency,
    })
    await persistVerificationItems(prospectId, checklist)
    if (sufficiency.opportunity.status !== "sufficient" && decision.verdict === "pursue") decision.verdict = "investigate"
    const mustVerify = unique([...checklist.map((item) => item.title), ...result.output.red_flags])
    const doNotPitch = unique([
      "Do not promise revenue, rankings, lead volume, or operational savings.",
      "Do not present an unverified social profile, review claim, or directory detail as a fact.",
      resolved.chain.deterministicBlock ? "Do not pitch this record as an independent local-business opportunity." : null,
      result.output.confidence === "low" ? "Do not use uncertain findings in first contact before manual verification." : null,
    ])
    const primaryOpportunity = derivePrimaryOpportunity({
      identityStatus: resolved.identityStatus,
      websiteStatus: resolved.siteAssessment.status,
      websiteQualityScore: result.output.website_quality_score,
      hasContactForm: resolved.scan.pages.some((page) => page.hasContactForm),
      bookingLinkCount: resolved.scan.booking_links.length,
      socialProfileCount: unique([...resolved.parsed.socialUrls, ...resolved.scan.social_links]).length,
    })
    const hasContactFlow = resolved.scan.pages.some((page) => page.hasContactForm) || resolved.scan.booking_links.length > 0
    const smallestOffer = directSmallestOffer({
      identityState: resolved.graph.state,
      websiteStatus: resolved.siteAssessment.status,
      hasContactFlow,
      recommendedOffer: result.output.recommended_primary_offer,
    })
    const approachability = buildApproachabilityPlan({
      prospect: identified,
      place: resolved.place,
      verifiedPhone,
      verifiedEmail: identified.public_email,
    })
    const nextAction = decision.verdict === "pursue"
      ? approachability.best_first_move
      : decision.verdict === "investigate"
        ? checklist[0]?.title || "Verify one business-specific opportunity fact before preparing outreach."
        : "Archive or keep for reference; do not prepare outreach."

    let conceptStatus: SignalConceptStatus = "not_started"
    if (identityIsReady && !resolved.chain.deterministicBlock && result.output.website_quality_score < 76) {
      const prompt = buildSignalConceptPrompt({
        businessName: resolved.businessName,
        industry: identified.industry,
        primaryOpportunity,
        smallestOffer,
        verifiedFacts,
        unknowns: mustVerify,
      })
      const generatedAt = new Date().toISOString()
      await supabase
        .from("signal_concepts")
        .update({ status: "archived", is_current: false, stale_at: generatedAt, stale_reason: "Replaced by a newer concept prompt." })
        .eq("prospect_id", prospectId)
        .eq("is_current", true)
      const { error: conceptError } = await supabase.from("signal_concepts").insert({
        prospect_id: prospectId,
        analysis_id: result.analysis.id,
        status: "prompt_ready",
        generation_prompt: prompt,
        verified_facts: verifiedFacts,
        created_by: createdBy,
        identity_version: identified.identity_version || 1,
        evidence_version: identified.evidence_version || 1,
        website_version: identified.website_version || 1,
        category_version: identified.category_version || 1,
        prompt_version: "signal-concept-v4",
        input_snapshot: {
          canonical_name: resolved.businessName,
          public_address: identified.public_address,
          public_phone: identified.public_phone,
          industry: identified.industry,
          website_url: identified.website_url,
          instagram_url: identified.instagram_url,
          facebook_url: identified.facebook_url,
          provider_place_id: identified.provider_place_id,
          chain_status: identified.chain_status,
        },
        is_current: true,
      })
      if (conceptError) throw new Error(conceptError.message)
      conceptStatus = "prompt_ready"
    } else {
      await supabase.from("signal_concepts").update({ status: "archived", is_current: false, stale_at: new Date().toISOString(), stale_reason: "The active analysis does not support a concept." })
        .eq("prospect_id", prospectId).eq("is_current", true)
    }

    const previousStage = original.pipeline_stage || "found"
    const nextStage = previousStage === "found" && sufficiency.identity.status === "sufficient" ? "analyzed" : previousStage
    const completedAt = new Date().toISOString()
    const { data: completed, error: completedError } = await supabase
      .from("signal_prospects")
      .update({
        analysis_status: resolved.identityStatus === "ambiguous" ? "needs_review" : "ready",
        analysis_error: null,
        analysis_completed_at: completedAt,
        verdict: decision.verdict,
        lead_lifecycle: checklist.some((item) => item.required)
          ? "needs_confirmation"
          : decision.verdict === "pursue"
            ? "operational"
            : "analyzed",
        opportunity_label: decision.opportunityLabel,
        confidence_label: decision.confidenceLabel,
        approachability_label: decision.approachabilityLabel,
        pipeline_stage: nextStage,
        primary_opportunity: primaryOpportunity,
        why_it_matters: result.output.executive_summary,
        smallest_offer: smallestOffer,
        must_verify: mustVerify,
        do_not_pitch: doNotPitch,
        next_action: nextAction,
        concept_status: conceptStatus,
        research_sufficiency: sufficiency,
        sales_pack_state: sufficiency.salesPackState,
        confidence_dimensions: confidenceDimensions({
          graph: resolved.graph,
          sufficiency,
          websiteConfidence: resolved.siteAssessment.confidence,
          socialConfidence: Math.max(0, ...resolved.socialAssessments.map((item) => item.confidence)),
          opportunityConfidence: result.output.confidence,
        }),
        approachability_plan: approachability,
        last_researched_at: completedAt,
      })
      .eq("id", prospectId)
      .select()
      .single()
    if (completedError) throw new Error(completedError.message)
    const completedProspect = completed as SignalProspect
    await persistSignalCopilotState({
      prospect: completedProspect,
      copilotInput: buildSignalCopilotInputFromProspect({
        prospect: completedProspect,
        evidence: evidenceRows as unknown as SignalEvidenceLedgerItem[],
        providerIssues: providerIssue ? [providerIssue] : [],
        opportunityScore: result.output.overall_opportunity_score,
        strongExistingSite: result.output.website_quality_score >= 76,
      }),
      createdBy,
    })

    if (nextStage !== previousStage) {
      await supabase.from("signal_lead_stage_history").insert({
        prospect_id: prospectId,
        from_stage: previousStage,
        to_stage: nextStage,
        reason: "Focused analysis completed.",
        created_by: createdBy,
      })
    }
    await supabase.from("signal_lead_activities").insert({
      prospect_id: prospectId,
      activity_type: "analysis_completed",
      summary: `Signal completed the focused analysis with a ${decision.verdict} verdict.`,
      metadata: {
        analysis_id: result.analysis.id,
        identity_status: resolved.identityStatus,
        identity_resolution_state: resolved.graph.state,
        sales_pack_state: sufficiency.salesPackState,
        evidence_count: evidenceRows.length,
        ai_unavailable: result.ai_unavailable,
      },
      created_by: createdBy,
    })

    return {
      analysis: result.analysis,
      prospect: completedProspect,
      evidenceCount: evidenceRows.length,
      aiUnavailable: result.ai_unavailable,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Signal analysis failed."
    await supabase.from("signal_prospects").update({
      analysis_status: "failed",
      analysis_error: message.slice(0, 1000),
    }).eq("id", prospectId)
    await supabase.from("signal_lead_activities").insert({
      prospect_id: prospectId,
      activity_type: "analysis_failed",
      summary: "Focused analysis failed and can be retried.",
      metadata: { error: message.slice(0, 500) },
      created_by: createdBy,
    })
    throw error
  }
}
