import type { SignalIdentityResolutionState } from "./identity-resolution.ts"

export type SignalSufficiencyLevel = "sufficient" | "limited" | "insufficient"
export type SignalSalesPackState = "not_ready" | "research_briefing" | "draft_outreach" | "fully_personalized"

export type SignalResearchSufficiency = {
  identity: { status: SignalSufficiencyLevel; reason: string }
  contact: { status: SignalSufficiencyLevel; reason: string }
  onlinePresence: { status: SignalSufficiencyLevel; reason: string }
  opportunity: { status: SignalSufficiencyLevel; reason: string }
  sales: { status: SignalSufficiencyLevel; reason: string }
  salesPackState: SignalSalesPackState
}

export type SignalVerificationChecklistItem = {
  key: string
  title: string
  whyItMatters: string
  currentEvidence: string
  fastestMethod: string
  actionType: "open_source" | "search_phone" | "confirm_website" | "confirm_social" | "edit_identity" | "add_maps_url" | "add_observation"
  actionUrl?: string | null
  required: boolean
}

const identityReady = new Set<SignalIdentityResolutionState>(["exact_match", "user_confirmed", "verified"])

export function calculateSignalResearchSufficiency(input: {
  identityState: SignalIdentityResolutionState
  verifiedPhone?: boolean
  verifiedEmail?: boolean
  verifiedContactForm?: boolean
  possibleContact?: boolean
  websiteStatus?: string | null
  officialSocialCount?: number
  onlineResearchAttempted?: boolean
  opportunityEvidenceCount?: number
  opportunityScore?: number | null
  positiveBusinessSignal?: boolean
}) : SignalResearchSufficiency {
  const identity = identityReady.has(input.identityState)
    ? { status: "sufficient" as const, reason: "The intended business is anchored by stable identity facts or Mountline confirmation." }
    : input.identityState === "likely_match"
      ? { status: "limited" as const, reason: "The leading match is plausible, but one stable identity fact still needs confirmation." }
      : { status: "insufficient" as const, reason: "Signal cannot safely attribute public evidence to the submitted business yet." }

  const contact = input.verifiedPhone || input.verifiedEmail || input.verifiedContactForm
    ? { status: "sufficient" as const, reason: "At least one business contact route is verified." }
    : input.possibleContact
      ? { status: "limited" as const, reason: "A possible contact route exists but still needs confirmation." }
      : { status: "insufficient" as const, reason: "No reliable contact route is available." }

  const websiteResolved = ["verified_official_website", "likely_official_website", "no_official_website_found"].includes(input.websiteStatus || "")
  const onlinePresence = websiteResolved || (input.officialSocialCount || 0) > 0
    ? { status: "sufficient" as const, reason: "Signal has resolved the main public website or verified social presence." }
    : input.onlineResearchAttempted
      ? { status: "limited" as const, reason: "Public research ran, but the official online presence remains uncertain." }
      : { status: "insufficient" as const, reason: "The business's public online presence has not been resolved." }

  const evidenceCount = input.opportunityEvidenceCount || 0
  const opportunity = identity.status === "sufficient" && onlinePresence.status === "sufficient" && evidenceCount >= 2
    ? { status: "sufficient" as const, reason: "At least two business-specific facts support a clear Mountline opportunity." }
    : identity.status !== "insufficient" && evidenceCount >= 1
      ? { status: "limited" as const, reason: "A possible opportunity exists, but it needs another verified supporting fact." }
      : { status: "insufficient" as const, reason: "There is not enough verified evidence to define a responsible offer." }

  const sales = identity.status === "sufficient" && contact.status === "sufficient" && opportunity.status === "sufficient"
    && input.positiveBusinessSignal
    ? { status: "sufficient" as const, reason: "Identity, opportunity, contact route, and a business-specific positive signal are ready for personalized outreach." }
    : identity.status === "sufficient" && contact.status !== "insufficient" && opportunity.status !== "insufficient"
      ? { status: "limited" as const, reason: "Signal can prepare neutral discovery guidance, but not fully personalized claims." }
      : { status: "insufficient" as const, reason: "Personalized outreach would risk using the wrong identity or unsupported opportunity claims." }

  const salesPackState: SignalSalesPackState = sales.status === "sufficient"
    ? "fully_personalized"
    : sales.status === "limited"
      ? "draft_outreach"
      : identity.status === "sufficient" || identity.status === "limited"
        ? "research_briefing"
        : "not_ready"

  return { identity, contact, onlinePresence, opportunity, sales, salesPackState }
}

export function buildSignalVerificationChecklist(input: {
  businessName: string
  identityState: SignalIdentityResolutionState
  submittedAddress?: string | null
  submittedPhone?: string | null
  websiteUrl?: string | null
  websiteStatus?: string | null
  socialCandidateUrl?: string | null
  mapsUrl?: string | null
  conflicts?: string[]
  sufficiency: SignalResearchSufficiency
}) {
  const items: SignalVerificationChecklistItem[] = []
  const exactBusinessSearch = `https://www.google.com/search?q=${encodeURIComponent(`"${input.businessName}" ${input.submittedAddress || ""}`.trim())}`
  const mapsSearch = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent([input.businessName, input.submittedAddress].filter(Boolean).join(" "))}`
  if (!identityReady.has(input.identityState)) {
    if (!input.mapsUrl) {
      items.push({
        key: "add-maps-url",
        title: `Add the exact Maps listing for ${input.businessName}`,
        whyItMatters: "A Places ID is the fastest way to separate same-name businesses and lock the correct location.",
        currentEvidence: input.submittedAddress ? `Submitted address: ${input.submittedAddress}` : "No stable Places ID is attached.",
        fastestMethod: "Open the business in Google Maps, copy its share link, and add it to the identity details.",
        actionType: "add_maps_url",
        actionUrl: mapsSearch,
        required: true,
      })
    }
    if (input.submittedPhone) {
      items.push({
        key: "verify-submitted-phone",
        title: `Verify ${input.submittedPhone} belongs to ${input.businessName}`,
        whyItMatters: "A confirmed exact phone match can separate same-name businesses and provide a safe contact route.",
        currentEvidence: `Submitted phone: ${input.submittedPhone}`,
        fastestMethod: "Search the exact number, then compare the business name and location on a first-party or Places source.",
        actionType: "search_phone",
        actionUrl: `https://www.google.com/search?q=${encodeURIComponent(`"${input.submittedPhone}"`)}`,
        required: true,
      })
    } else {
      items.push({
        key: "confirm-phone",
        title: "Confirm the current public phone",
        whyItMatters: "An exact phone match is strong identity evidence and provides a safe contact route.",
        currentEvidence: "No submitted phone is available.",
        fastestMethod: "Check the Maps listing or the business's own page, then add the number.",
        actionType: "search_phone",
        actionUrl: exactBusinessSearch,
        required: true,
      })
    }
  }
  if (!input.websiteUrl || !["verified_official_website", "likely_official_website"].includes(input.websiteStatus || "")) {
    items.push({
      key: "confirm-website",
      title: input.websiteUrl ? `Confirm whether ${input.websiteUrl} belongs to this location` : "Confirm whether an official website exists",
      whyItMatters: "Signal cannot judge website quality or personalize an offer until the domain belongs to the exact business.",
      currentEvidence: input.websiteUrl ? "The domain is only a candidate." : "No official domain is verified.",
      fastestMethod: "Compare the site's phone and full address with the submitted business or its Places listing.",
      actionType: "confirm_website",
      actionUrl: input.websiteUrl || exactBusinessSearch,
      required: true,
    })
  }
  if (input.socialCandidateUrl) {
    items.push({
      key: "confirm-social",
      title: "Confirm the social profile belongs to this business",
      whyItMatters: "A similar username is not enough to safely use social content in outreach.",
      currentEvidence: `Candidate: ${input.socialCandidateUrl}`,
      fastestMethod: "Check for the same phone, address, website, or a reciprocal link from the official site.",
      actionType: "confirm_social",
      actionUrl: input.socialCandidateUrl,
      required: false,
    })
  }
  for (const [index, conflict] of (input.conflicts || []).slice(0, 3).entries()) {
    items.push({
      key: `resolve-conflict-${index + 1}`,
      title: "Resolve conflicting identity information",
      whyItMatters: "Signal must not average conflicting business details or merge two locations.",
      currentEvidence: conflict,
      fastestMethod: "Use the business's Places listing or direct confirmation, then correct the identity details.",
      actionType: "edit_identity",
      required: true,
    })
  }
  if (input.sufficiency.opportunity.status === "insufficient" && identityReady.has(input.identityState)) {
    items.push({
      key: "add-observation",
      title: "Add one concrete customer-path observation",
      whyItMatters: "A real opportunity needs business-specific evidence, not generic website language.",
      currentEvidence: input.sufficiency.opportunity.reason,
      fastestMethod: "Review how a customer finds services, hours, directions, or a quote path and record the exact friction.",
      actionType: "add_observation",
      required: true,
    })
  }
  return items
}

export function getSignalActionAvailability(input: {
  identityState: SignalIdentityResolutionState
  verdict: string
  pipelineStage: string
  sufficiency: SignalResearchSufficiency
}) {
  const identityVerified = identityReady.has(input.identityState)
  const canBuildConcept = identityVerified && input.sufficiency.opportunity.status === "sufficient" && input.verdict === "pursue"
  const canPrepareSales = ["draft_outreach", "fully_personalized"].includes(input.sufficiency.salesPackState)
  const canOperate = identityVerified && input.verdict === "pursue"
  const canCreateClientProject = identityVerified
    && ["interested", "proposal", "won"].includes(input.pipelineStage)
    && input.sufficiency.sales.status !== "insufficient"
  return {
    canBuildConcept,
    canPrepareSales,
    canOpenFocus: canOperate,
    canContact: canPrepareSales,
    canCreateClientProject,
    primaryAction: !identityVerified
      ? "Confirm identity"
      : input.sufficiency.opportunity.status !== "sufficient"
        ? "Verify online presence"
        : input.verdict === "pursue"
          ? "Build concept"
          : "Review decision",
    blockedReason: !identityVerified
      ? "Confirm the exact business before operational actions become available."
      : input.sufficiency.opportunity.status !== "sufficient"
        ? "Verify a business-specific opportunity before preparing a pitch."
        : null,
  }
}
