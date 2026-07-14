import assert from "node:assert/strict"
import test from "node:test"
import {
  resolveSignalIdentityGraph,
  submittedInputCandidate,
  type SignalIdentityCandidate,
  type SignalIdentityGraphResolution,
} from "../identity-resolution.ts"
import { parseSignalBusinessInput } from "../input-parser.ts"
import { assessSignalOfficialWebsite } from "../presence.ts"
import {
  calculateSignalResearchSufficiency,
  getSignalActionAvailability,
} from "../research-sufficiency.ts"

function candidate(overrides: Partial<SignalIdentityCandidate>): SignalIdentityCandidate {
  return {
    id: crypto.randomUUID(),
    name: null,
    address: null,
    city: null,
    state: null,
    zip: null,
    latitude: null,
    longitude: null,
    phone: null,
    domain: null,
    websiteUrl: null,
    socialUrls: [],
    placesId: null,
    category: null,
    sourceUrl: null,
    sourceTitle: null,
    sourceProvider: "fixture",
    sourceTier: "search",
    sourceClassification: "unknown",
    sourceReliability: 50,
    supportingLinks: [],
    ...overrides,
  }
}

function resolve(input: string, candidates: SignalIdentityCandidate[]) {
  return resolveSignalIdentityGraph({
    anchor: submittedInputCandidate(parseSignalBusinessInput(input)),
    candidates,
  })
}

function sufficiency(graph: SignalIdentityGraphResolution, overrides: Parameters<typeof calculateSignalResearchSufficiency>[0] = { identityState: graph.state }) {
  return calculateSignalResearchSufficiency({
    websiteStatus: "website_unknown",
    ...overrides,
    identityState: graph.state,
  })
}

test("end-to-end: an exact Maps place ID resolves immediately", () => {
  const placeId = "ChIJN1t_tDeuEmsRUsoyG83frY4"
  const graph = resolve(
    `https://www.google.com/maps/search/?api=1&query=Custom+Cleaners&query_place_id=${placeId}`,
    [candidate({
      id: "place:custom-cleaners",
      name: "Custom Cleaners",
      address: "1540 Keller Pkwy #150, Keller, TX 76248",
      city: "Keller",
      state: "TX",
      placesId: placeId,
      sourceProvider: "google_places",
      sourceTier: "structured_listing",
      sourceClassification: "places_map_listing",
      sourceReliability: 96,
    })],
  )
  assert.equal(graph.state, "exact_match")
  assert.equal(graph.canonicalName, "Custom Cleaners")
  assert.equal(graph.canonicalSource, "google_places")
})

test("end-to-end: Facebook-only input stays unresolved without identity agreement", () => {
  const url = "https://facebook.com/lakesidecleaners"
  const graph = resolve(url, [candidate({
    name: "Lakeside Cleaners",
    socialUrls: [url],
    sourceUrl: url,
    sourceTier: "social",
    sourceClassification: "official_social_network",
    sourceReliability: 72,
  })])
  assert.equal(graph.state, "unresolved")
  assert.equal(graph.canonicalSource, "submitted_input")
  assert.equal(sufficiency(graph).salesPackState, "not_ready")
})

test("end-to-end: a common name with multiple locations requires selection", () => {
  const graph = resolve("Main Street Cafe, Keller TX", [
    candidate({ name: "Main Street Cafe", address: "100 Main St, Keller, TX 76248", city: "Keller", state: "TX", sourceTier: "structured_listing", sourceClassification: "places_map_listing", sourceReliability: 94 }),
    candidate({ name: "Main Street Cafe", address: "500 Oak St, Keller, TX 76248", city: "Keller", state: "TX", sourceTier: "structured_listing", sourceClassification: "places_map_listing", sourceReliability: 94 }),
  ])
  assert.equal(graph.state, "ambiguous")
  assert.equal(graph.selectedCandidateId, null)
  assert.equal(getSignalActionAvailability({ identityState: graph.state, verdict: "investigate", pipelineStage: "found", sufficiency: sufficiency(graph) }).primaryAction, "Confirm identity")
})

test("end-to-end: a directory ranking above the official source is rejected", () => {
  const input = "Custom Cleaners - 1540 Keller Pkwy #150, Keller, TX 76248"
  const graph = resolve(input, [
    candidate({
      id: "magicpin",
      name: "Custom Cleaners",
      address: "1540 Keller Pkwy #150, Keller, TX 76248",
      city: "Keller",
      state: "TX",
      sourceProvider: "magicpin",
      sourceTier: "directory",
      sourceClassification: "aggregator",
      sourceReliability: 100,
      sourceUrl: "https://magicpin.com/listing/custom-cleaners",
    }),
    candidate({
      id: "official",
      name: "Custom Cleaners",
      address: "1540 Keller Pkwy #150, Keller, TX 76248",
      city: "Keller",
      state: "TX",
      domain: "customcleaners.example",
      websiteUrl: "https://customcleaners.example",
      sourceProvider: "website_scan",
      sourceTier: "first_party",
      sourceClassification: "official_business_site",
      sourceReliability: 78,
    }),
  ])
  assert.equal(graph.state, "exact_match")
  assert.equal(graph.selectedCandidateId, "official")
  assert.equal(graph.candidates.find((item) => item.id === "magicpin")?.canonicalEligible, false)
  assert.match(graph.candidates.find((item) => item.id === "magicpin")?.rejectionReason || "", /intermediary publisher/)
})

test("end-to-end: a broken site leaves opportunity research limited", () => {
  const graph = resolve("Northside Dental - 12 Oak St, Keller, TX 76248", [candidate({
    name: "Northside Dental",
    address: "12 Oak St, Keller, TX 76248",
    city: "Keller",
    state: "TX",
    sourceTier: "structured_listing",
    sourceClassification: "places_map_listing",
    sourceReliability: 94,
  })])
  const gates = sufficiency(graph, {
    identityState: graph.state,
    possibleContact: true,
    websiteStatus: "website_broken",
    onlineResearchAttempted: true,
    opportunityEvidenceCount: 1,
  })
  assert.equal(gates.onlinePresence.status, "limited")
  assert.equal(gates.opportunity.status, "limited")
  assert.equal(gates.salesPackState, "draft_outreach")
})

test("end-to-end: no verified website produces a concrete research action", () => {
  const graph = resolve("Keller Mobile Detail - 200 Main St, Keller, TX 76248", [candidate({
    name: "Keller Mobile Detail",
    address: "200 Main St, Keller, TX 76248",
    city: "Keller",
    state: "TX",
    sourceTier: "structured_listing",
    sourceClassification: "places_map_listing",
    sourceReliability: 94,
  })])
  const gates = sufficiency(graph, { identityState: graph.state, websiteStatus: "website_unknown", onlineResearchAttempted: true })
  const actions = getSignalActionAvailability({ identityState: graph.state, verdict: "investigate", pipelineStage: "analyzed", sufficiency: gates })
  assert.equal(gates.opportunity.status, "insufficient")
  assert.equal(actions.primaryAction, "Verify online presence")
  assert.equal(actions.canBuildConcept, false)
})

test("end-to-end: a digitally strong business can be skipped without concept actions", () => {
  const graph = resolve("Strong Studio - 14 Elm St, Keller, TX 76248", [candidate({
    name: "Strong Studio",
    address: "14 Elm St, Keller, TX 76248",
    city: "Keller",
    state: "TX",
    sourceTier: "structured_listing",
    sourceClassification: "places_map_listing",
    sourceReliability: 94,
  })])
  const gates = sufficiency(graph, {
    identityState: graph.state,
    verifiedPhone: true,
    websiteStatus: "verified_official_website",
    onlineResearchAttempted: true,
    opportunityEvidenceCount: 3,
    positiveBusinessSignal: true,
  })
  const actions = getSignalActionAvailability({ identityState: graph.state, verdict: "skip", pipelineStage: "analyzed", sufficiency: gates })
  assert.equal(gates.sales.status, "sufficient")
  assert.equal(actions.canBuildConcept, false)
  assert.equal(actions.primaryAction, "Review decision")
})

test("end-to-end: duplicate address formatting produces the same fingerprint", () => {
  const first = parseSignalBusinessInput("Custom Cleaners - 1540 Keller Pkwy #150, Keller, TX 76248")
  const second = parseSignalBusinessInput("Custom Cleaners — 1540 Keller Parkway Suite 150, Keller, TX 76248")
  assert.equal(first.identityFingerprint, second.identityFingerprint)
})

test("end-to-end: unresolved research preserves the submitted name", () => {
  const graph = resolve("Quiet Oak Services, Keller TX", [])
  assert.equal(graph.state, "unresolved")
  assert.equal(graph.canonicalName, "Quiet Oak Services")
  assert.equal(graph.canonicalSource, "submitted_input")
  assert.equal(getSignalActionAvailability({ identityState: graph.state, verdict: "could_not_resolve", pipelineStage: "found", sufficiency: sufficiency(graph) }).canCreateClientProject, false)
})

test("end-to-end: opportunity-ready identity unlocks concept and sales preparation", () => {
  const graph = resolve("Oak & Main Salon — (817) 555-0123", [candidate({
    name: "Oak & Main Salon",
    phone: "817-555-0123",
    sourceTier: "structured_listing",
    sourceClassification: "places_map_listing",
    sourceReliability: 94,
  })])
  const gates = sufficiency(graph, {
    identityState: graph.state,
    verifiedPhone: true,
    websiteStatus: "verified_official_website",
    opportunityEvidenceCount: 3,
    positiveBusinessSignal: true,
  })
  const actions = getSignalActionAvailability({ identityState: graph.state, verdict: "pursue", pipelineStage: "analyzed", sufficiency: gates })
  assert.equal(graph.state, "exact_match")
  assert.equal(gates.salesPackState, "fully_personalized")
  assert.equal(actions.canBuildConcept, true)
  assert.equal(actions.canPrepareSales, true)
})

test("exact website URL requires its own organization identity, then resolves as likely", () => {
  const input = parseSignalBusinessInput("https://customcleaners.example")
  const assessment = assessSignalOfficialWebsite({
    businessName: input.submittedName || "",
    websiteUrl: input.officialWebsiteUrl,
    listingWebsite: true,
    reachable: true,
    openGraphSiteName: "Custom Cleaners",
    structuredNames: ["Custom Cleaners"],
    pageText: "Custom Cleaners provides dry cleaning services.",
  })
  assert.equal(assessment.accepted, true)
  const graph = resolve("https://customcleaners.example", [candidate({
    name: "Custom Cleaners",
    domain: "customcleaners.example",
    websiteUrl: "https://customcleaners.example",
    sourceTier: "first_party",
    sourceClassification: "official_business_site",
    sourceReliability: assessment.confidence,
  })])
  assert.equal(graph.state, "likely_match")
  assert.equal(graph.canonicalName, "Custom Cleaners")
})

test("matching social phone confirms a profile; a similar username alone does not", () => {
  const matched = resolve("Oak Salon — (817) 555-0123 https://facebook.com/oaksalon", [candidate({
    name: "Oak Salon",
    phone: "8175550123",
    socialUrls: ["https://facebook.com/oaksalon"],
    sourceTier: "social",
    sourceClassification: "official_social_network",
    sourceReliability: 82,
  })])
  assert.equal(matched.state, "exact_match")

  const weak = resolve("Oak Salon, Keller TX", [candidate({
    name: "Oak Salon Dallas",
    city: "Dallas",
    state: "TX",
    socialUrls: ["https://instagram.com/oaksalondallas"],
    sourceTier: "social",
    sourceClassification: "official_social_network",
    sourceReliability: 55,
  })])
  assert.equal(weak.state, "unresolved")
})

test("parked and dead domains remain distinct online-presence states", () => {
  const parked = assessSignalOfficialWebsite({
    businessName: "Oak Studio",
    websiteUrl: "https://oakstudio.example",
    reachable: true,
    pageTitle: "OakStudio.example is for sale",
  })
  const dead = assessSignalOfficialWebsite({
    businessName: "Oak Studio",
    websiteUrl: "https://oakstudio.example",
    reachable: false,
    broken: true,
  })
  assert.equal(parked.status, "website_parked")
  assert.equal(dead.status, "website_broken")
})

test("typos, renamed businesses, and shared addresses preserve uncertainty", () => {
  const typo = resolve("Custm Cleaners - 1540 Keller Pkwy #150, Keller, TX 76248", [candidate({
    name: "Custom Cleaners",
    address: "1540 Keller Parkway Suite 150, Keller, TX 76248",
    city: "Keller",
    state: "TX",
    sourceTier: "structured_listing",
    sourceClassification: "places_map_listing",
    sourceReliability: 94,
  })])
  assert.equal(typo.state, "likely_match")

  const renamed = resolve("Old Oak Studio — (817) 555-0123", [candidate({
    name: "New Oak Studio",
    phone: "8175550123",
    sourceTier: "first_party",
    sourceClassification: "official_business_site",
    sourceReliability: 80,
  })])
  assert.equal(renamed.state, "likely_match")

  const sharedAddress = resolve("Alpha Salon - 20 Market St, Keller, TX 76248", [candidate({
    name: "Beta Cafe",
    address: "20 Market St, Keller, TX 76248",
    city: "Keller",
    state: "TX",
    sourceTier: "structured_listing",
    sourceClassification: "places_map_listing",
    sourceReliability: 94,
  })])
  assert.notEqual(sharedAddress.state, "exact_match")
  assert.equal(sharedAddress.canonicalName, "Alpha Salon")
})
