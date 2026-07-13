import test from "node:test"
import assert from "node:assert/strict"
import {
  assessSignalChain,
  assessSignalEntityName,
  assessSignalGeography,
  buildSignalOpportunityEvidence,
  calculateSignalConfidence,
  calculateSignalOpportunity,
  qualifySignalLead,
  resolveSignalDiscoveryEntity,
  signalDuplicateKey,
} from "../quality.ts"
import { buildSignalPlaceSearchPlan, buildSignalPlaceTiles, mergeSignalPlaces, signalDistanceMiles, type SignalPlace } from "../places-core.ts"
import { selectSignalSalesPack, validateSignalSalesPackGrounding } from "../sales-grounding.ts"
import { genericEntities, independentEntities, knownChains, mapFirstOpportunities } from "../fixtures/signal-evaluation-fixtures.ts"

test("known chains have zero leakage", () => {
  for (const fixture of knownChains) {
    const result = assessSignalChain({ businessName: fixture.name, url: fixture.url })
    assert.equal(result.deterministicBlock, true, fixture.name)
    assert.ok(result.classification === "chain" || result.classification === "likely_franchise", fixture.name)
  }
})

test("generic search phrases have zero entity leakage", () => {
  for (const title of genericEntities) {
    const result = resolveSignalDiscoveryEntity({
      title,
      url: `https://${title.toLowerCase().replace(/[^a-z0-9]+/g, "")}.example`,
      city: /keller/i.test(title) ? "Keller, TX" : "Southlake, TX",
      industry: /barber/i.test(title) ? "barber" : /clean/i.test(title) ? "commercial cleaning" : /auto/i.test(title) ? "auto detailing" : "pet grooming",
      sourceType: "likely_official_site",
    })
    assert.ok(["generic_result", "rejected"].includes(result.status), title)
  }
})

test("distinct independent identities survive canonical-name checks", () => {
  for (const fixture of independentEntities) {
    const result = assessSignalEntityName({
      ...fixture,
      sourceType: fixture.url.includes("facebook") ? "social" : "likely_official_site",
      corroboratingNames: [fixture.name],
    })
    assert.ok(result.status === "verified" || result.status === "likely", fixture.name)
    assert.ok(result.confidence >= 65, fixture.name)
  }
})

test("geography requires first-party or corroborating evidence", () => {
  const weak = assessSignalGeography({ location: "Southlake, TX", marketType: "city", discoveryTexts: ["Southlake pet grooming"] })
  assert.equal(weak.status, "unclear")
  assert.ok(weak.confidence < 60)

  const strong = assessSignalGeography({
    location: "Southlake, TX",
    marketType: "city",
    address: "123 Main Street, Southlake, TX",
    officialTexts: ["Serving Southlake, Texas"],
  })
  assert.equal(strong.status, "confirmed_in_market")
  assert.ok(strong.confidence >= 80)
})

test("provider failure lowers confidence and 100 is unavailable", () => {
  const base = {
    identity: 95,
    geography: 90,
    independence: 86,
    contact: 90,
    onlinePresence: 88,
    opportunityAnalysis: 84,
    contradictionPenalty: 0,
  }
  const complete = calculateSignalConfidence({ ...base, providerFailurePenalty: 0 })
  const failed = calculateSignalConfidence({ ...base, providerFailurePenalty: 18 })
  assert.ok(complete.final <= 97)
  assert.ok(failed.final < complete.final)
})

test("weighted scores have meaningful spread and confidence affects rank", () => {
  const strong = calculateSignalOpportunity({
    confidence: 88,
    dimensions: { reputationViability: 19, digitalGap: 24, customerFlowOpportunity: 18, trustGap: 14, demoPotential: 9, outreachViability: 9 },
  })
  const weak = calculateSignalOpportunity({
    confidence: 58,
    dimensions: { reputationViability: 10, digitalGap: 7, customerFlowOpportunity: 4, trustGap: 2, demoPotential: 3, outreachViability: 4 },
    penalties: { insufficient_evidence: 12 },
  })
  assert.ok(strong.opportunityScore - weak.opportunityScore >= 35)
  assert.ok(strong.rankingScore > strong.opportunityScore * 0.8)
  assert.ok(weak.rankingScore < weak.opportunityScore)
})

test("hard quality gates allow fewer results", () => {
  const rejected = qualifySignalLead({ entityStatus: "likely", entityConfidence: 70, chainClassification: "likely_independent", independenceConfidence: 75, geographicStatus: "unclear", geographicConfidence: 35, evidenceConfidence: 62, opportunityScore: 70, hasContactRoute: true, hasEvidenceLinks: true })
  assert.equal(rejected.qualified, false)
  const qualified = qualifySignalLead({ entityStatus: "verified", entityConfidence: 88, chainClassification: "independent", independenceConfidence: 84, geographicStatus: "confirmed_in_market", geographicConfidence: 86, evidenceConfidence: 78, opportunityScore: 72, hasContactRoute: true, hasEvidenceLinks: true })
  assert.equal(qualified.qualified, true)
})

test("duplicate identity keys consolidate domain and phone aliases", () => {
  assert.equal(
    signalDuplicateKey({ canonicalName: "Oak & Ember Grooming", city: "Southlake", websiteUrl: "https://www.oakandember.example/contact" }),
    signalDuplicateKey({ canonicalName: "Oak and Ember LLC", city: "Southlake", websiteUrl: "https://oakandember.example" }),
  )
  assert.equal(
    signalDuplicateKey({ canonicalName: "One", city: "Southlake", phone: "(817) 555-0101" }),
    signalDuplicateKey({ canonicalName: "Another", city: "Keller", phone: "+1 817-555-0101" }),
  )
})

test("sales-pack grounding catches generic or swappable scripts", () => {
  const missing = validateSignalSalesPackGrounding({
    businessName: "Oak & Ember Grooming",
    verifiedFacts: ["Fear-free dog grooming appointments"],
    pack: { fifteen_second_opener: "We help businesses like yours scale." },
  })
  assert.equal(missing.valid, false)

  const groundedPack = {
    lead_briefing: "Oak & Ember Grooming lists fear-free dog grooming appointments in Southlake.",
    strongest_honest_angle: "Make the fear-free appointment path easier to understand.",
    fifteen_second_opener: "Luke with Mountline—Oak & Ember Grooming stood out for its fear-free grooming language.",
    walk_in_script: "Oak & Ember Grooming and its fear-free appointment path are the focus.",
    call_script: "Oak & Ember Grooming came up because the public site explains fear-free grooming.",
    discovery_questions: ["Do customers call before choosing a grooming appointment?"],
    recommended_offer: "Focused booking-path concept",
    objection_handling: [{ objection: "Busy", response: "We can send the concept." }],
    follow_up_text: "Oak & Ember Grooming concept: clearer fear-free booking.",
    follow_up_email: "Oak & Ember Grooming concept focused on fear-free grooming.",
    what_to_avoid: ["Do not promise more revenue."],
    next_action_checklist: ["Verify booking path"],
    lovable_prompt: "Concept preview for Oak & Ember Grooming using verified fear-free grooming wording.",
  }
  assert.equal(validateSignalSalesPackGrounding({ pack: groundedPack, businessName: "Oak & Ember Grooming", verifiedFacts: ["Fear-free dog grooming appointments"] }).valid, true)
  const fallbackSelection = selectSignalSalesPack({ fallback: groundedPack, aiPack: { fifteen_second_opener: "Generic growth pitch" }, businessName: "Oak & Ember Grooming", verifiedFacts: ["Fear-free dog grooming appointments"] })
  assert.equal(fallbackSelection.generatedBy, "deterministic_fallback")
  assert.equal(fallbackSelection.pack.generated_by, "deterministic_fallback")
})

test("map-first no-site groomer is a strong opportunity, not missing evidence", () => {
  const fixture = mapFirstOpportunities.independentGroomer
  const signals = buildSignalOpportunityEvidence({
    onlinePresence: fixture.onlinePresence,
    rating: fixture.rating,
    reviewCount: fixture.reviewCount,
    hasPhone: true,
    hasContactForm: false,
    hasBooking: false,
  })
  assert.ok(signals.some((signal) => signal.signal === "social_only"))
  assert.ok(signals.some((signal) => signal.signal === "reputation_to_digital_gap"))
  assert.match(signals[0].suggestedMountlineSolution, /phone-first one-page website/i)

  const qualification = qualifySignalLead({
    entityStatus: "verified",
    entityConfidence: 92,
    chainClassification: "likely_independent",
    independenceConfidence: 74,
    geographicStatus: "confirmed_within_radius",
    geographicConfidence: 95,
    onlinePresenceConfidence: 86,
    opportunityConfidence: 72,
    opportunityScore: 82,
    hasContactRoute: true,
    hasEvidenceLinks: true,
  })
  assert.equal(qualification.status, "qualified")
})

test("social-first barber and weak-site cleaner remain eligible", () => {
  const barber = buildSignalOpportunityEvidence({
    onlinePresence: mapFirstOpportunities.independentBarber.onlinePresence,
    rating: mapFirstOpportunities.independentBarber.rating,
    reviewCount: mapFirstOpportunities.independentBarber.reviewCount,
    hasPhone: true,
    hasBooking: false,
  })
  assert.ok(barber.some((signal) => signal.signal === "phone_first_customer_flow"))

  const cleaner = buildSignalOpportunityEvidence({
    onlinePresence: mapFirstOpportunities.independentCleaner.onlinePresence,
    rating: mapFirstOpportunities.independentCleaner.rating,
    reviewCount: mapFirstOpportunities.independentCleaner.reviewCount,
    hasPhone: true,
    hasContactForm: false,
  })
  assert.ok(cleaner.some((signal) => signal.signal === "website_weak"))
})

test("payment claims require first-party evidence and reviews stay verify-only", () => {
  const official = buildSignalOpportunityEvidence({
    onlinePresence: "website_weak",
    hasPhone: true,
    officialTexts: ["Payment policy: cash or check only at this time."],
  })
  const confirmed = official.find((signal) => signal.signal === "verified_payment_friction")
  assert.equal(confirmed?.verificationStatus, "confirmed")
  assert.equal(confirmed?.safeToMentionInFirstPitch, false)

  const reviewOnly = buildSignalOpportunityEvidence({
    onlinePresence: "no_website_found",
    hasPhone: true,
    reviewTexts: ["They were cash only when we visited."],
  })
  const unconfirmed = reviewOnly.find((signal) => signal.signal === "possible_payment_friction")
  assert.equal(unconfirmed?.verificationStatus, "verify_before_mention")
  assert.equal(unconfirmed?.safeToMentionInFirstPitch, false)
})

test("places tiling expands larger markets and deduplicates provider identities", () => {
  const center = { latitude: 32.9343, longitude: -97.2292 }
  assert.equal(buildSignalPlaceTiles({ center, radiusMiles: 5, maxTiles: 9 }).length, 1)
  const metroTiles = buildSignalPlaceTiles({ center, radiusMiles: 18, maxTiles: 5 })
  assert.equal(metroTiles.length, 5)
  const coveragePlan = buildSignalPlaceSearchPlan({ queries: ["dog groomer", "barber shop", "car detailing", "house cleaning", "plumber"], tiles: metroTiles, maxSearchCalls: 10 })
  assert.equal(new Set(coveragePlan.slice(0, 5).map((item) => item.tile.id)).size, 5)
  assert.ok(signalDistanceMiles(center, { latitude: 32.95, longitude: -97.22 }) < 3)

  const basePlace: SignalPlace = {
    provider: "google",
    provider_place_id: "fixture-place-1",
    canonical_name: "Pine & Paws Grooming",
    formatted_address: "100 Main St, Keller, TX",
    city: "Keller",
    state: "TX",
    coordinates: center,
    phone: null,
    website_url: null,
    listing_url: "https://maps.google.com/?cid=fixture",
    business_status: "OPERATIONAL",
    categories: ["pet_groomer"],
    rating: null,
    review_count: null,
    opening_hours: [],
    price_level: null,
    primary_category: "pet_groomer",
    service_area_business: false,
    retrieved_at: "2026-07-10T00:00:00.000Z",
  }
  const merged = mergeSignalPlaces([basePlace, { ...basePlace, phone: "(817) 555-0142", rating: 4.8, review_count: 86 }])
  assert.equal(merged.length, 1)
  assert.equal(merged[0].phone, "(817) 555-0142")
  assert.equal(merged[0].review_count, 86)
})

test("hard rejects stay hard while sparse markets preserve watchlist research", () => {
  const chain = qualifySignalLead({ entityStatus: "verified", entityConfidence: 95, chainClassification: "chain", independenceConfidence: 2, geographicStatus: "confirmed_within_radius", geographicConfidence: 95, onlinePresenceConfidence: 80, opportunityConfidence: 80, opportunityScore: 90, hasContactRoute: true, hasEvidenceLinks: true })
  const closed = qualifySignalLead({ entityStatus: "verified", entityConfidence: 95, chainClassification: "likely_independent", independenceConfidence: 75, geographicStatus: "confirmed_within_radius", geographicConfidence: 95, onlinePresenceConfidence: 80, opportunityConfidence: 80, opportunityScore: 90, hasContactRoute: true, hasEvidenceLinks: true, permanentlyClosed: true })
  const outside = qualifySignalLead({ entityStatus: "verified", entityConfidence: 95, chainClassification: "likely_independent", independenceConfidence: 75, geographicStatus: "outside_market", geographicConfidence: 95, onlinePresenceConfidence: 80, opportunityConfidence: 80, opportunityScore: 90, hasContactRoute: true, hasEvidenceLinks: true })
  assert.equal(chain.status, "rejected")
  assert.equal(closed.status, "rejected")
  assert.equal(outside.status, "rejected")
  const listingOnly = qualifySignalLead({ entityStatus: "verified", entityConfidence: 92, chainClassification: "likely_independent", independenceConfidence: 72, geographicStatus: "confirmed_within_radius", geographicConfidence: 95, onlinePresenceConfidence: 70, opportunityConfidence: 62, opportunityScore: 68, hasContactRoute: false, hasListingRoute: true, hasEvidenceLinks: true })
  assert.equal(listingOnly.status, "research_needed")

  const outcomes = [
    qualifySignalLead({ entityStatus: "verified", entityConfidence: 92, chainClassification: "independent", independenceConfidence: 84, geographicStatus: "confirmed_within_radius", geographicConfidence: 95, onlinePresenceConfidence: 80, opportunityConfidence: 70, opportunityScore: 75, hasContactRoute: true, hasEvidenceLinks: true }),
    qualifySignalLead({ entityStatus: "verified", entityConfidence: 90, chainClassification: "likely_independent", independenceConfidence: 72, geographicStatus: "confirmed_within_radius", geographicConfidence: 92, onlinePresenceConfidence: 76, opportunityConfidence: 66, opportunityScore: 68, hasContactRoute: true, hasEvidenceLinks: true }),
    qualifySignalLead({ entityStatus: "verified", entityConfidence: 86, chainClassification: "uncertain", independenceConfidence: 52, geographicStatus: "confirmed_within_radius", geographicConfidence: 90, onlinePresenceConfidence: 55, opportunityConfidence: 50, opportunityScore: 62, hasContactRoute: true, hasEvidenceLinks: true, incompleteResearch: true }),
  ]
  assert.equal(outcomes.filter((outcome) => outcome.status === "qualified").length, 2)
  assert.equal(outcomes.filter((outcome) => outcome.status === "watchlist").length, 1)
})
