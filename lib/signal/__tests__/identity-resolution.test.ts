import assert from "node:assert/strict"
import test from "node:test"
import {
  buildSignalIdentityClusters,
  resolveSignalIdentityGraph,
  submittedInputCandidate,
  type SignalIdentityCandidate,
} from "../identity-resolution.ts"
import { parseSignalBusinessInput } from "../input-parser.ts"

function candidate(overrides: Partial<SignalIdentityCandidate>): SignalIdentityCandidate {
  return {
    id: "candidate",
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
    sourceReliability: 55,
    supportingLinks: [],
    ...overrides,
  }
}

test("Magicpin can never overwrite the Custom Cleaners identity", () => {
  const anchor = submittedInputCandidate(parseSignalBusinessInput("Custom Cleaners - 1540 Keller Pkwy #150, Keller, TX 76248"))
  const result = resolveSignalIdentityGraph({
    anchor,
    candidates: [candidate({
      id: "magicpin",
      name: "Magicpin",
      sourceUrl: "https://magicpin.com/custom-cleaners",
      sourceTitle: "Magicpin",
      sourceClassification: "aggregator",
      sourceTier: "directory",
      sourceReliability: 25,
    })],
  })
  assert.equal(result.canonicalName, "Custom Cleaners")
  assert.equal(result.canonicalSource, "submitted_input")
  assert.equal(result.state, "unresolved")
  assert.equal(result.candidates[0].canonicalEligible, false)
  assert.equal(result.candidates[0].officialWebsiteEligible, false)
})

test("matching name and full address is an exact match", () => {
  const anchor = submittedInputCandidate(parseSignalBusinessInput("Custom Cleaners - 1540 Keller Pkwy #150, Keller, TX 76248"))
  const result = resolveSignalIdentityGraph({
    anchor,
    candidates: [candidate({
      id: "place:custom-cleaners",
      name: "Custom Cleaners",
      address: "1540 Keller Parkway, Suite 150, Keller, TX 76248",
      city: "Keller",
      state: "TX",
      placesId: "custom-cleaners-keller",
      sourceTier: "structured_listing",
      sourceClassification: "places_map_listing",
      sourceReliability: 94,
    })],
  })
  assert.equal(result.state, "exact_match")
  assert.equal(result.canonicalName, "Custom Cleaners")
})

test("same-name business at another address is not merged", () => {
  const anchor = submittedInputCandidate(parseSignalBusinessInput("Custom Cleaners - 1540 Keller Pkwy #150, Keller, TX 76248"))
  const other = candidate({
    id: "place:dallas",
    name: "Custom Cleaners",
    address: "2200 Main St, Dallas, TX 75201",
    city: "Dallas",
    state: "TX",
    placesId: "custom-cleaners-dallas",
    sourceTier: "structured_listing",
    sourceClassification: "places_map_listing",
    sourceReliability: 94,
  })
  const result = resolveSignalIdentityGraph({ anchor, candidates: [other] })
  assert.equal(result.canonicalName, "Custom Cleaners")
  assert.equal(result.state, "contradictory")
  assert.match(result.conflicts.join(" "), /Address conflict/)
  const clusters = buildSignalIdentityClusters([anchor, other])
  assert.equal(clusters.length, 2)
})

test("two common-name city matches trigger candidate choice", () => {
  const anchor = submittedInputCandidate(parseSignalBusinessInput("Main Street Cafe, Keller TX"))
  const result = resolveSignalIdentityGraph({
    anchor,
    candidates: [
      candidate({ id: "place:one", name: "Main Street Cafe", city: "Keller", state: "TX", address: "100 Main St, Keller, TX 76248", sourceTier: "structured_listing", sourceClassification: "places_map_listing", sourceReliability: 94 }),
      candidate({ id: "place:two", name: "Main Street Cafe", city: "Keller", state: "TX", address: "500 Oak St, Keller, TX 76248", sourceTier: "structured_listing", sourceClassification: "places_map_listing", sourceReliability: 94 }),
    ],
  })
  assert.equal(result.state, "ambiguous")
  assert.equal(result.selectedCandidateId, null)
})

test("user-confirmed identity outranks weaker sources", () => {
  const anchor = submittedInputCandidate(parseSignalBusinessInput("Custom Cleaners, Keller TX"))
  const result = resolveSignalIdentityGraph({
    anchor,
    candidates: [candidate({
      id: "manual",
      name: "Custom Cleaners",
      address: "1540 Keller Pkwy #150, Keller, TX 76248",
      sourceTier: "manual",
      sourceClassification: "official_business_site",
      sourceReliability: 100,
      userConfirmed: true,
    })],
  })
  assert.equal(result.state, "user_confirmed")
  assert.equal(result.canonicalNameStatus, "user_confirmed")
})

test("a saved manual anchor stays confirmed when public research finds nothing", () => {
  const anchor = submittedInputCandidate(parseSignalBusinessInput("Custom Cleaners - 1540 Keller Pkwy #150, Keller, TX 76248"))
  anchor.userConfirmed = true
  anchor.sourceTier = "manual"
  anchor.sourceProvider = "mountline_correction"
  anchor.sourceReliability = 100
  const result = resolveSignalIdentityGraph({ anchor, candidates: [] })
  assert.equal(result.state, "user_confirmed")
  assert.equal(result.canonicalName, "Custom Cleaners")
  assert.equal(result.canonicalSource, "mountline_correction")
  assert.equal(result.confidence, 100)
})
