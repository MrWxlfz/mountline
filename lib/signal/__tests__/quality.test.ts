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
import { selectSignalSalesPack, validateSignalConceptPrompt, validateSignalSalesPackGrounding } from "../sales-grounding.ts"
import { cleanSignalBusinessName, resolveSignalCanonicalName } from "../business-name.ts"
import { assessSignalOfficialWebsite, assessSignalSocialProfile, detectSignalParkedWebsite } from "../presence.ts"
import { formatConfidence, formatOnlinePresence, formatRunStatus, formatSignalLabel } from "../presentation.ts"
import { genericEntities, independentEntities, knownChains, leadQualityFixtures, mapFirstOpportunities } from "../fixtures/signal-evaluation-fixtures.ts"
import { normalizeSignalWorkbookCell } from "../workbook-values.ts"
import { buildSignalConceptPrompt, derivePrimaryOpportunity, deriveSignalDecision, parseSignalAnalysisInput } from "../analysis-model.ts"

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

test("business-name resolver removes discovery noise and honors source priority", () => {
  const noisy = cleanSignalBusinessName("✨ Oak & Ember Grooming — Best Pet Services in Southlake, TX @oakandember", {
    city: "Southlake",
    state: "TX",
    category: "pet grooming",
  })
  assert.equal(noisy.name, "Oak & Ember Grooming")
  assert.ok(noisy.warnings.length > 0)

  const resolved = resolveSignalCanonicalName([
    { value: "@oakandembergrooming", source: "social_handle" },
    { value: "Oak & Ember Grooming | Official Website", source: "official_website_title", verified: true },
    { value: "Oak & Ember Grooming", source: "places_listing", verified: true },
  ], { city: "Southlake", state: "TX", category: "pet grooming" })
  assert.equal(resolved.canonicalName, "Oak & Ember Grooming")
  assert.equal(resolved.canonicalNameSource, "places_listing")
  assert.ok(resolved.canonicalNameConfidence >= 90)
})

test("business-name resolver preserves meaningful punctuation and acronyms", () => {
  assert.equal(cleanSignalBusinessName("DFW Auto & Detail Co.", { city: "Keller", category: "auto detailing" }).name, "DFW Auto & Detail Co")
  assert.equal(cleanSignalBusinessName("O'Neil's Barber Co.", { city: "Keller", category: "barber" }).name, "O'Neil's Barber Co")
  assert.equal(cleanSignalBusinessName("Top 10 Pet Grooming Services Near Me", { category: "pet grooming" }).name, null)
})

test("official website validation requires identity evidence and detects parked domains", () => {
  const official = assessSignalOfficialWebsite({
    businessName: "Oak & Ember Grooming",
    websiteUrl: "https://oakandember.example",
    listingWebsite: true,
    reachable: true,
    openGraphSiteName: "Oak & Ember Grooming",
    visiblePhones: ["817-555-0142"],
    expectedPhone: "(817) 555-0142",
    city: "Southlake",
    pageText: "Fear-free grooming in Southlake",
  })
  assert.equal(official.status, "verified_official_website")
  assert.equal(official.accepted, true)

  const unrelated = assessSignalOfficialWebsite({
    businessName: "Oak & Ember Grooming",
    websiteUrl: "https://unrelated-directory.example",
    reachable: true,
    pageTitle: "A national directory",
  })
  assert.equal(unrelated.accepted, false)
  assert.equal(detectSignalParkedWebsite({ pageTitle: "Buy this domain", url: "https://oakandember.example" }), true)
})

test("official social validation needs a name match plus corroboration", () => {
  const official = assessSignalSocialProfile({
    businessName: "Cedar Chair Barber Co.",
    profileUrl: "https://instagram.com/cedarchairbarber",
    title: "Cedar Chair Barber Co. | Instagram",
    snippet: "Appointments in Southlake, TX · Call 817-555-0188",
    expectedPhone: "817-555-0188",
    expectedCity: "Southlake",
  })
  assert.equal(official.official, true)
  const weak = assessSignalSocialProfile({
    businessName: "Cedar Chair Barber Co.",
    profileUrl: "https://instagram.com/barbers",
    title: "Barber inspiration",
    snippet: "Popular haircuts",
    expectedCity: "Southlake",
  })
  assert.equal(weak.official, false)
})

test("presentation helpers never expose raw enums or fake perfect confidence", () => {
  assert.equal(formatRunStatus("completed_with_limits"), "Completed with limited evidence")
  assert.equal(formatOnlinePresence("website_parked"), "Website appears parked")
  assert.equal(formatSignalLabel("research_needed"), "Needs research")
  assert.equal(formatConfidence(100), "High · 99%")
  assert.equal(formatSignalLabel("owner_operated_likely").includes("_"), false)
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
    websiteStatus: 88,
    socialStatus: 78,
    opportunityAnalysis: 84,
    evidenceSourceDiversity: 82,
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
    dimensions: { leadViability: 15, digitalOpportunity: 20, customerFlowFriction: 18, trustReputationGap: 13, salesAccessibility: 9, conceptPotential: 9, commercialFit: 9 },
  })
  const weak = calculateSignalOpportunity({
    confidence: 58,
    dimensions: { leadViability: 8, digitalOpportunity: 5, customerFlowFriction: 3, trustReputationGap: 2, salesAccessibility: 3, conceptPotential: 2, commercialFit: 3 },
    penalties: { insufficient_evidence: 8 },
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
    one_minute_briefing: "Oak & Ember Grooming lists fear-free dog grooming appointments in Southlake. The focused opportunity is to make that appointment path easier to understand without replacing the business's current public channels.",
    best_angle: "Make the verified fear-free appointment path easier for Southlake pet owners to understand.",
    walk_in_opener: "Luke with Mountline—Oak & Ember Grooming stood out for its fear-free grooming language in Southlake. We prepared one small appointment-path concept because it is easier to show than explain.",
    busy_response: "No problem. Mountline can send the labeled concept for a quieter moment, with no automated follow-up attached.",
    concept_transition: "The concept keeps fear-free appointments central. Would this simpler path be useful for Oak & Ember Grooming?",
    discovery_questions: [
      "Do customers call before they understand which fear-free appointment fits?",
      "Would a phone-first request path fit the way the team currently works?",
      "Is the goal more demand, or less back-and-forth for current inquiries?",
    ],
    price_transition: "Mountline would confirm the smallest useful scope, then put the exact pages and price in writing before work starts.",
    call_script: "Luke with Mountline here—did we catch Oak & Ember Grooming with thirty seconds? The verified fear-free grooming language in Southlake stood out, and we prepared one focused appointment-path concept. Would a quick explanation be useful, or should Mountline send the preview?",
    follow_up_text: "Thanks for reviewing the Oak & Ember Grooming concept. It keeps the verified fear-free appointment path central. Mountline can outline the smallest useful version if the direction fits.",
    objections: [
      { objection: "We already use social media.", response: "That can stay exactly where it is. The concept gives fear-free appointment details one reliable home while social continues handling updates and daily visibility for Oak & Ember Grooming." },
      { objection: "We are too busy.", response: "No problem. Mountline can send one labeled concept link for a quieter moment. There is no automated follow-up sequence, and the team can decide whether the direction is useful." },
      { objection: "We get enough business.", response: "More traffic does not need to be the goal. The practical question is whether clearer fear-free appointment information reduces repetitive calls and makes existing inquiries easier for the team." },
      { objection: "What would it cost?", response: "Mountline would start with the smallest useful version, confirm the exact appointment flow and pages, and put the scope and price in writing before any work begins." },
    ],
    do_not_say: ["Do not promise revenue.", "Do not criticize the current social presence.", "Do not present the concept as an official site."],
    next_steps: ["Verify the appointment path.", "Confirm public hours.", "Prepare one labeled concept."],
    lovable_prompt: "Create a labeled concept preview for Oak & Ember Grooming using only verified fear-free grooming and Southlake details. Use placeholders for every unknown fact.",
  }
  assert.equal(validateSignalSalesPackGrounding({ pack: groundedPack, businessName: "Oak & Ember Grooming", verifiedFacts: ["Fear-free dog grooming appointments"] }).valid, true)
  const fallbackSelection = selectSignalSalesPack({ fallback: groundedPack, aiPack: { walk_in_opener: "Generic growth pitch" }, businessName: "Oak & Ember Grooming", verifiedFacts: ["Fear-free dog grooming appointments"] })
  assert.equal(fallbackSelection.generatedBy, "deterministic_fallback")
  assert.equal(fallbackSelection.pack.generated_by, "deterministic_fallback")
})

test("concept prompts are specific, substantial, safe, and category-aware", () => {
  const fixtures = [
    { name: "Pine & Paws Grooming", fact: "fear-free grooming appointments", direction: "Use warm pet-service imagery, preparation guidance, and a call-or-appointment path." },
    { name: "Cedar Chair Barber Co.", fact: "appointment and walk-in barber services", direction: "Use an editorial barber layout, work-gallery placeholders, and a clear appointment-or-walk-in choice." },
    { name: "Blacktop & Brass Detailing", fact: "mobile interior detailing packages", direction: "Use a high-contrast automotive layout, package comparison, vehicle fit, and a quote-first path." },
    { name: "North Gate Home Services", fact: "residential repair estimates", direction: "Use a practical service-area layout, project-proof placeholders, and estimate-request routing." },
    { name: "Clearline Home Cleaning", fact: "recurring home-cleaning visits", direction: "Use a calm, trustworthy cleaning layout, recurring-service explanation, and a request-first path." },
  ]
  const prompts = fixtures.map((fixture) => [
    `Create a clearly labeled concept preview for ${fixture.name}. This is not the official website.`,
    `Use only the verified fact: ${fixture.fact}. ${fixture.direction}`,
    "Build mobile-first with one obvious primary CTA, a compact sticky mobile call or request action when appropriate, verified service content, proof placeholders, process guidance, a practical FAQ, and a secondary contact option.",
    "Choose typography, spacing, imagery, warmth, and layout character for this exact category instead of applying a generic agency template. Keep unknown details visibly labeled as placeholders.",
    "Do not invent testimonials, review counts, pricing, policies, awards, team members, owner quotes, years in business, payment options, availability, or booking functionality. Do not invent a logo. Preserve the concept disclaimer in the rendered page.",
  ].join(" "))
  assert.equal(new Set(prompts).size, fixtures.length)
  prompts.forEach((prompt, index) => {
    const fixture = fixtures[index]
    const result = validateSignalConceptPrompt({ prompt, businessName: fixture.name, verifiedFacts: [fixture.fact] })
    assert.equal(result.valid, true, `${fixture.name}: ${result.issues.join(" ")}`)
  })
  assert.equal(validateSignalConceptPrompt({ prompt: "Make a nice website.", businessName: "Pine & Paws Grooming", verifiedFacts: ["fear-free grooming appointments"] }).valid, false)
})

test("focused analysis accepts supported business input shapes", () => {
  const maps = parseSignalAnalysisInput("Oak & Ember Grooming, Southlake, TX https://www.google.com/maps/search/?api=1&query=Oak&query_place_id=ChIJN1t_tDeuEmsRUsoyG83frY4")
  assert.equal(maps.googlePlaceId, "ChIJN1t_tDeuEmsRUsoyG83frY4")
  assert.equal(maps.businessNameHint, "Oak & Ember Grooming")

  const website = parseSignalAnalysisInput("https://cedarchairbarber.example")
  assert.equal(website.officialWebsiteUrl, "https://cedarchairbarber.example/")
  assert.equal(website.businessNameHint, "Cedarchairbarber")

  const social = parseSignalAnalysisInput("https://www.instagram.com/pineandpawsgrooming/ (817) 555-0191")
  assert.equal(social.socialUrls.length, 1)
  assert.equal(social.phone, "(817) 555-0191")
  assert.equal(social.businessNameHint, "Pineandpawsgrooming")
})

test("focused verdicts distinguish opportunity, uncertainty, strong sites, and chains", () => {
  const fixtures = [
    { name: "independent donut shop", expected: "pursue", input: { identityStatus: "verified" as const, opportunityScore: 82, confidence: "high" as const, reachabilityScore: 76 } },
    { name: "independent groomer", expected: "pursue", input: { identityStatus: "likely" as const, opportunityScore: 74, confidence: "medium" as const, reachabilityScore: 68 } },
    { name: "spa needing compliance review", expected: "investigate", input: { identityStatus: "needs_review" as const, opportunityScore: 73, confidence: "medium" as const, reachabilityScore: 66 } },
    { name: "strong existing site", expected: "skip", input: { identityStatus: "verified" as const, opportunityScore: 50, confidence: "high" as const, reachabilityScore: 72, strongExistingSite: true } },
    { name: "social-primary business", expected: "investigate", input: { identityStatus: "needs_review" as const, opportunityScore: 69, confidence: "low" as const, reachabilityScore: 58 } },
    { name: "known chain", expected: "skip", input: { identityStatus: "rejected" as const, opportunityScore: 84, confidence: "high" as const, reachabilityScore: 80, isChain: true } },
    { name: "ambiguous identity", expected: "investigate", input: { identityStatus: "ambiguous" as const, opportunityScore: 78, confidence: "low" as const, reachabilityScore: 70 } },
  ]
  for (const fixture of fixtures) {
    assert.equal(deriveSignalDecision(fixture.input).verdict, fixture.expected, fixture.name)
  }
})

test("primary opportunity stays distinct from the recommended offer", () => {
  const noSite = derivePrimaryOpportunity({
    identityStatus: "verified",
    websiteStatus: "no_official_website_verified",
    websiteQualityScore: 0,
    hasContactForm: false,
    bookingLinkCount: 0,
    socialProfileCount: 1,
  })
  assert.match(noSite, /no official website was verified/i)
  assert.doesNotMatch(noSite, /package|offer|build a/i)

  const strongSite = derivePrimaryOpportunity({
    identityStatus: "verified",
    websiteStatus: "verified_official_website",
    websiteQualityScore: 88,
    hasContactForm: true,
    bookingLinkCount: 1,
    socialProfileCount: 1,
  })
  assert.match(strongSite, /no clear website replacement opportunity/i)
})

test("private observations never become concept claims", () => {
  const privateObservation = "The owner seemed overwhelmed during a private visit."
  const prompt = buildSignalConceptPrompt({
    businessName: "Morning Ring Donuts",
    industry: "Donut shop",
    primaryOpportunity: "Clarify the public catering request path",
    smallestOffer: "A focused catering inquiry page",
    verifiedFacts: ["The official site lists custom donut orders."],
    unknowns: ["Confirm catering lead time."],
  })
  assert.match(prompt, /official site lists custom donut orders/i)
  assert.doesNotMatch(prompt, new RegExp(privateObservation.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"))
  assert.match(prompt, /do not invent testimonials/i)
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

  const detailer = buildSignalOpportunityEvidence({
    onlinePresence: mapFirstOpportunities.independentDetailer.onlinePresence,
    rating: mapFirstOpportunities.independentDetailer.rating,
    reviewCount: mapFirstOpportunities.independentDetailer.reviewCount,
    hasPhone: true,
    hasContactForm: false,
  })
  const contractor = buildSignalOpportunityEvidence({
    onlinePresence: mapFirstOpportunities.independentContractor.onlinePresence,
    rating: mapFirstOpportunities.independentContractor.rating,
    reviewCount: mapFirstOpportunities.independentContractor.reviewCount,
    hasPhone: true,
    hasContactForm: false,
  })
  assert.ok(detailer.some((signal) => signal.signal === "reputation_to_digital_gap"))
  assert.ok(contractor.some((signal) => signal.signal === "directory_only"))
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

  const observed = buildSignalOpportunityEvidence({
    onlinePresence: "social_only",
    hasPhone: true,
    userObservations: [leadQualityFixtures.cashOnlyObservation.observation],
  }).find((signal) => signal.signal === "verified_payment_friction")
  assert.equal(observed?.evidenceSource, "user_observation")
  assert.equal(observed?.safeToMentionInFirstPitch, false)
})

test("weak but real businesses do not survive the quality model", () => {
  const strongSite = calculateSignalOpportunity({
    confidence: 90,
    dimensions: { leadViability: 14, digitalOpportunity: 2, customerFlowFriction: 3, trustReputationGap: 1, salesAccessibility: 7, conceptPotential: 3, commercialFit: 7 },
    penalties: { excellent_website: 8 },
  })
  assert.ok(strongSite.opportunityScore < 48)

  const inactive = qualifySignalLead({ entityStatus: "verified", entityConfidence: 94, chainClassification: "independent", independenceConfidence: 86, geographicStatus: "confirmed_in_market", geographicConfidence: 92, onlinePresenceConfidence: 80, opportunityConfidence: 80, opportunityScore: 82, hasContactRoute: true, hasEvidenceLinks: true, permanentlyClosed: true })
  assert.equal(inactive.status, "rejected")

  const ambiguous = assessSignalEntityName({ name: leadQualityFixtures.ambiguousIdentity.name, city: leadQualityFixtures.ambiguousIdentity.city, industry: "local services" })
  assert.ok(["ambiguous", "generic_result", "rejected"].includes(ambiguous.status))

  const lowReviewSignals = buildSignalOpportunityEvidence({ onlinePresence: leadQualityFixtures.lowReviewBusiness.onlinePresence, rating: leadQualityFixtures.lowReviewBusiness.rating, reviewCount: leadQualityFixtures.lowReviewBusiness.reviewCount, hasPhone: true })
  assert.equal(lowReviewSignals.some((signal) => signal.signal === "reputation_to_digital_gap"), false)

  const appointmentSignals = buildSignalOpportunityEvidence({ onlinePresence: leadQualityFixtures.appointmentSalon.onlinePresence, hasPhone: true, hasBooking: leadQualityFixtures.appointmentSalon.hasBooking })
  assert.equal(appointmentSignals.some((signal) => signal.signal === "phone_first_customer_flow"), false)
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

test("workbook values stay readable after safe XLSX parsing", () => {
  assert.equal(
    normalizeSignalWorkbookCell("  Pine &amp; Paws\u0000  Grooming  "),
    "Pine & Paws Grooming",
  )
  assert.equal(normalizeSignalWorkbookCell("Cedar &#38; Chair"), "Cedar & Chair")
  assert.equal(normalizeSignalWorkbookCell("Blacktop &#x26; Brass"), "Blacktop & Brass")
})
