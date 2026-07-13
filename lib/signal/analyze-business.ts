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
import { resolveSignalCanonicalName } from "./business-name"
import { getSignalPlacesProvider } from "./places"
import { assessSignalOfficialWebsite } from "./presence"
import { assessSignalChain } from "./quality"
import {
  classifySignalResearchUrl,
  findLikelySignalDuplicates,
  normalizeSignalBusinessName,
  normalizeSignalHostname,
  normalizeSignalPhone,
  runSignalPublicResearch,
} from "./research"
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

export async function queueSignalBusinessAnalysis(input: {
  businessInput: string
  observation?: string | null
  createdBy: string
  source?: "manual" | "scout_suggestion"
  analyzeNow?: boolean
}) {
  const parsed = parseSignalAnalysisInput(input.businessInput)
  const analysisStatus = input.analyzeNow === false ? "needs_review" as const : "queued" as const
  const supabase = createAdminClient()
  const { data: prospectRows, error: prospectsError } = await supabase
    .from("signal_prospects")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(500)

  if (prospectsError) throw new Error(prospectsError.message)

  const candidate = {
    businessName: prospectFallbackName(parsed),
    websiteUrl: parsed.officialWebsiteUrl,
    phone: parsed.phone,
    city: parsed.locationHint?.split(",")[0]?.trim() || null,
  }
  const duplicates = findLikelySignalDuplicates((prospectRows || []) as SignalProspect[], candidate)
  const exactDuplicate = duplicates.find((item) => item.confidence === "exact")?.prospect || null
  let prospect: SignalProspect

  if (exactDuplicate) {
    const { data, error } = await supabase
      .from("signal_prospects")
      .update({
        analysis_input: input.businessInput.trim(),
        analysis_status: analysisStatus,
        analysis_error: null,
        website_url: exactDuplicate.website_url || parsed.officialWebsiteUrl,
        public_phone: exactDuplicate.public_phone || parsed.phone,
        instagram_url: exactDuplicate.instagram_url || parsed.socialUrls.find((url) => url.includes("instagram.com")) || null,
        facebook_url: exactDuplicate.facebook_url || parsed.socialUrls.find((url) => url.includes("facebook.com")) || null,
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
        city: parsed.locationHint?.split(",")[0]?.trim() || null,
        state: parsed.locationHint?.split(",")[1]?.trim() || null,
        website_url: parsed.officialWebsiteUrl,
        public_phone: parsed.phone,
        instagram_url: parsed.socialUrls.find((url) => url.includes("instagram.com")) || null,
        facebook_url: parsed.socialUrls.find((url) => url.includes("facebook.com")) || null,
        source: input.source || "manual",
        normalized_business_name: normalizeSignalBusinessName(name) || null,
        normalized_hostname: normalizeSignalHostname(parsed.officialWebsiteUrl) || null,
        public_phone_normalized: normalizeSignalPhone(parsed.phone) || null,
        analysis_input: input.businessInput.trim(),
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
  const parsed = await expandSubmittedMapsUrl(
    parseSignalAnalysisInput(prospect.analysis_input || prospect.business_name),
  )
  let place = null
  let providerWarning: string | null = null
  const placesProvider = getSignalPlacesProvider()
  if (parsed.googlePlaceId && placesProvider) {
    try {
      place = (await placesProvider.placeDetails(parsed.googlePlaceId)).place
    } catch (error) {
      providerWarning = error instanceof Error ? error.message : "Google Places details were unavailable."
    }
  } else if (parsed.googlePlaceId && !placesProvider) {
    providerWarning = "Google Places is not configured; the submitted place ID could not be expanded."
  }

  let websiteUrl = place?.website_url || parsed.officialWebsiteUrl || prospect.website_url
  let research = null
  const nameForResearch = place?.canonical_name || parsed.businessNameHint || parsed.phone || prospect.business_name
  const locationForResearch = [place?.city || prospect.city || parsed.locationHint, place?.state || prospect.state]
    .filter(Boolean)
    .join(", ") || "business"

  if ((!websiteUrl || parsed.socialUrls.length > 0) && nameForResearch && locationForResearch) {
    research = await runSignalPublicResearch({
      businessName: nameForResearch,
      industryHint: place?.primary_category || prospect.industry,
      location: locationForResearch,
    })
    const officialCandidate = research.candidates.find((candidate) =>
      candidate.source_type === "likely_official_site" && candidate.confidence !== "low",
    )
    if (!websiteUrl && officialCandidate) websiteUrl = officialCandidate.url
  }

  const scan = await scanSignalWebsite(websiteUrl)
  const candidateNames = [
    { value: place?.canonical_name, source: "places_listing" as const, verified: Boolean(place) },
    ...scan.json_ld_names.map((value) => ({ value, source: "official_website_structured_data" as const, verified: true })),
    { value: scan.open_graph_site_name, source: "official_website_site_name" as const, verified: !scan.broken_response },
    { value: scan.page_title, source: "official_website_title" as const, verified: !scan.broken_response },
    ...(research?.candidates || []).map((candidate) => ({
      value: candidate.title,
      source: "search_result_title" as const,
      verified: false,
    })),
    { value: parsed.businessNameHint || prospect.business_name, source: "search_result_title" as const, verified: false },
  ]
  const name = resolveSignalCanonicalName(candidateNames, {
    city: place?.city || prospect.city,
    state: place?.state || prospect.state,
    category: place?.primary_category || prospect.industry,
  })
  const businessName = name.canonicalName || place?.canonical_name || prospect.business_name
  const siteAssessment = assessSignalOfficialWebsite({
    businessName,
    websiteUrl,
    listingWebsite: Boolean(place?.website_url && place.website_url === websiteUrl),
    reachable: !scan.broken_response,
    broken: scan.broken_response,
    pageTitle: scan.page_title,
    openGraphSiteName: scan.open_graph_site_name,
    structuredNames: scan.json_ld_names,
    visiblePhones: scan.visible_phones,
    expectedPhone: place?.phone || prospect.public_phone || parsed.phone,
    addressText: scan.hours_location_language.join(" "),
    expectedAddress: place?.formatted_address,
    city: place?.city || prospect.city,
    linkedSocialUrls: scan.social_links,
    expectedSocialUrls: parsed.socialUrls,
    pageText: scan.pages.map((page) => page.textExcerpt).join(" ").slice(0, 5000),
  })
  const chain = assessSignalChain({
    businessName,
    url: websiteUrl,
    publicText: scan.pages.map((page) => page.textExcerpt).join(" ").slice(0, 8000),
    discoveredUrls: unique([websiteUrl, place?.listing_url, ...scan.social_links]),
  })
  const identityStatus = chain.deterministicBlock
    ? "rejected" as const
    : place && siteAssessment.status === "verified_official_website"
      ? "verified" as const
      : place || siteAssessment.accepted || name.canonicalNameConfidence >= 72
        ? "likely" as const
        : name.canonicalNameConfidence >= 45
          ? "needs_review" as const
          : "ambiguous" as const

  return {
    businessName,
    chain,
    identityStatus,
    name,
    parsed,
    place,
    providerWarning,
    research,
    scan,
    siteAssessment,
    websiteUrl: siteAssessment.accepted ? websiteUrl : place?.website_url || null,
  }
}

function buildResolvedEvidence(
  prospectId: string,
  resolved: Awaited<ReturnType<typeof resolveSignalIdentity>>,
) {
  const rows: LedgerInsert[] = []
  const { place, research, scan, siteAssessment } = resolved

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
        evidence_category: "verified_public_fact",
        evidence_tier: "platform_listing",
        claim_type: claimType,
        claim_text: String(claimText),
        source_url: place.listing_url,
        source_title: `${place.canonical_name} public place listing`,
        source_provider: place.provider,
        source_excerpt: String(claimText),
        verification_status: "verified",
        confidence: 90,
        metadata: { provider_place_id: place.provider_place_id },
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
      }))
    }
  } else if (scan.requested_url) {
    rows.push(evidenceRow(prospectId, {
      evidence_category: "unverified_claim",
      evidence_tier: "search_result",
      claim_type: "website_candidate",
      claim_text: scan.requested_url,
      source_url: scan.requested_url,
      source_provider: "website_scan",
      source_excerpt: siteAssessment.evidence.join(" "),
      verification_status: "unverified",
      confidence: Math.min(50, siteAssessment.confidence),
    }))
  }

  for (const candidate of research?.candidates || []) {
    rows.push(evidenceRow(prospectId, {
      evidence_category: candidate.source_type === "likely_official_site" && candidate.confidence !== "low"
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
      verification_status: "unverified",
      confidence: candidate.confidence === "high" ? 72 : candidate.confidence === "medium" ? 55 : 30,
    }))
  }

  for (const socialUrl of unique([...resolved.parsed.socialUrls, ...scan.social_links])) {
    rows.push(evidenceRow(prospectId, {
      evidence_category: "unverified_claim",
      evidence_tier: "social_profile",
      claim_type: "social_profile_candidate",
      claim_text: socialUrl,
      source_url: socialUrl,
      source_provider: classifySignalResearchUrl(socialUrl),
      source_excerpt: "A public social profile was found, but its ownership needs corroboration before claims are treated as verified.",
      verification_status: "unverified",
      confidence: 45,
    }))
  }

  if (resolved.providerWarning) {
    rows.push(evidenceRow(prospectId, {
      evidence_category: "unknown",
      evidence_tier: "unknown",
      claim_type: "provider_limitation",
      claim_text: resolved.providerWarning,
      source_provider: "signal",
      verification_status: "unknown",
      confidence: null,
    }))
  }
  return rows
}

export async function analyzeQueuedSignalProspect(prospectId: string, createdBy: string) {
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
    analysis_error: null,
    analysis_started_at: new Date().toISOString(),
  }).eq("id", prospectId)

  try {
    const resolved = await resolveSignalIdentity(original)
    const socialUrl = unique([...resolved.parsed.socialUrls, ...resolved.scan.social_links])
      .find((url) => url.includes("instagram.com")) || original.instagram_url
    const facebookUrl = unique([...resolved.parsed.socialUrls, ...resolved.scan.social_links])
      .find((url) => url.includes("facebook.com")) || original.facebook_url
    const identityUpdate = {
      business_name: resolved.businessName,
      normalized_business_name: normalizeSignalBusinessName(resolved.businessName) || null,
      website_url: resolved.websiteUrl,
      normalized_hostname: normalizeSignalHostname(resolved.websiteUrl) || null,
      public_phone: resolved.place?.phone || original.public_phone || resolved.parsed.phone,
      public_phone_normalized: normalizeSignalPhone(resolved.place?.phone || original.public_phone || resolved.parsed.phone) || null,
      instagram_url: socialUrl,
      facebook_url: facebookUrl,
      provider_place_id: resolved.place?.provider_place_id || original.provider_place_id,
      public_address: resolved.place?.formatted_address || original.public_address,
      business_status: resolved.place?.business_status || original.business_status,
      opening_hours: resolved.place?.opening_hours || original.opening_hours || [],
      chain_status: resolved.chain.classification,
      city: resolved.place?.city || original.city,
      state: resolved.place?.state || original.state,
      industry: resolved.place?.primary_category || original.industry,
      identity_status: resolved.identityStatus,
      analysis_status: "analyzing",
    }
    const { data: identifiedData, error: identityError } = await supabase
      .from("signal_prospects")
      .update(identityUpdate)
      .eq("id", prospectId)
      .select()
      .single()
    if (identityError) throw new Error(identityError.message)
    const identified = identifiedData as SignalProspect

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
    const mustVerify = unique([
      resolved.identityStatus !== "verified" ? "Confirm the exact business identity and location." : null,
      !resolved.siteAssessment.accepted ? "Confirm whether an official website exists." : null,
      ...result.output.red_flags,
      resolved.providerWarning,
    ])
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
    const smallestOffer = result.output.recommended_primary_offer
      ? `A focused first version of ${result.output.recommended_primary_offer.toLowerCase()}`
      : "A small verified-information concept"
    const nextAction = decision.verdict === "pursue"
      ? "Review the evidence, prepare the concept, and choose a manual contact route."
      : decision.verdict === "investigate"
        ? "Resolve the items under Must verify before preparing outreach."
        : "Archive or keep for reference; do not prepare outreach."

    let conceptStatus: SignalConceptStatus = "not_started"
    if (decision.verdict !== "skip") {
      const prompt = buildSignalConceptPrompt({
        businessName: resolved.businessName,
        industry: identified.industry,
        primaryOpportunity,
        smallestOffer,
        verifiedFacts,
        unknowns: mustVerify,
      })
      await supabase
        .from("signal_concepts")
        .delete()
        .eq("prospect_id", prospectId)
        .eq("status", "prompt_ready")
      const { error: conceptError } = await supabase.from("signal_concepts").insert({
        prospect_id: prospectId,
        analysis_id: result.analysis.id,
        status: "prompt_ready",
        generation_prompt: prompt,
        verified_facts: verifiedFacts,
        created_by: createdBy,
      })
      if (conceptError) throw new Error(conceptError.message)
      conceptStatus = "prompt_ready"
    }

    const previousStage = original.pipeline_stage || "found"
    const nextStage = previousStage === "found" ? "analyzed" : previousStage
    const completedAt = new Date().toISOString()
    const { data: completed, error: completedError } = await supabase
      .from("signal_prospects")
      .update({
        analysis_status: resolved.identityStatus === "ambiguous" ? "needs_review" : "ready",
        analysis_error: null,
        analysis_completed_at: completedAt,
        verdict: decision.verdict,
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
        last_researched_at: completedAt,
      })
      .eq("id", prospectId)
      .select()
      .single()
    if (completedError) throw new Error(completedError.message)

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
        evidence_count: evidenceRows.length,
        ai_unavailable: result.ai_unavailable,
      },
      created_by: createdBy,
    })

    return {
      analysis: result.analysis,
      prospect: completed as SignalProspect,
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
