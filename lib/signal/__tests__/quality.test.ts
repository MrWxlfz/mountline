import test from "node:test"
import assert from "node:assert/strict"
import {
  assessSignalChain,
  assessSignalEntityName,
  assessSignalGeography,
  calculateSignalConfidence,
  calculateSignalOpportunity,
  qualifySignalLead,
  resolveSignalDiscoveryEntity,
  signalDuplicateKey,
} from "../quality.ts"
import { selectSignalSalesPack, validateSignalSalesPackGrounding } from "../sales-grounding.ts"
import { genericEntities, independentEntities, knownChains } from "../fixtures/signal-evaluation-fixtures.ts"

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
    officialSite: 95,
    geography: 90,
    contactAgreement: 90,
    sourceDiversity: 90,
    websiteCompleteness: 90,
    chainCertainty: 90,
    freshness: 90,
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
    dimensions: { mountlineFit: 19, websiteOpportunity: 19, contactConversionFriction: 13, trustGap: 13, demoPotential: 9, contactViability: 9, operationalOpportunity: 4, timingUrgency: 4 },
  })
  const weak = calculateSignalOpportunity({
    confidence: 58,
    dimensions: { mountlineFit: 12, websiteOpportunity: 8, contactConversionFriction: 5, trustGap: 2, demoPotential: 4, contactViability: 5, operationalOpportunity: 1, timingUrgency: 0 },
    penalties: { insufficient_evidence: 12 },
  })
  assert.ok(strong.opportunityScore - weak.opportunityScore >= 35)
  assert.ok(strong.rankingScore > strong.opportunityScore * 0.8)
  assert.ok(weak.rankingScore < weak.opportunityScore * 0.7)
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
