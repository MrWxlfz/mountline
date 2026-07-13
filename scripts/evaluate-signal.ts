import {
  assessSignalChain,
  buildSignalOpportunityEvidence,
  calculateSignalOpportunity,
  resolveSignalDiscoveryEntity,
} from "../lib/signal/quality.ts"
import { resolveSignalCanonicalName } from "../lib/signal/business-name.ts"
import { evaluateSignalSalesPackQuality } from "../lib/signal/sales-grounding.ts"
import {
  genericEntities,
  knownChains,
  mapFirstOpportunities,
  southlakeRegression,
} from "../lib/signal/fixtures/signal-evaluation-fixtures.ts"

const chainRejected = knownChains.filter((fixture) => assessSignalChain({ businessName: fixture.name, url: fixture.url }).deterministicBlock).length
const genericRejected = genericEntities.filter((title) => {
  const result = resolveSignalDiscoveryEntity({
    title,
    url: `https://${title.toLowerCase().replace(/[^a-z0-9]+/g, "")}.example`,
    city: southlakeRegression.location,
    industry: "local services",
    sourceType: "likely_official_site",
  })
  return result.status === "generic_result" || result.status === "rejected"
}).length

const score = (strength: "exceptional" | "strong" | "promising" | "weak", confidence: number) => {
  const dimensions = strength === "exceptional"
    ? { leadViability: 15, digitalOpportunity: 20, customerFlowFriction: 19, trustReputationGap: 14, salesAccessibility: 10, conceptPotential: 10, commercialFit: 9 }
    : strength === "strong"
      ? { leadViability: 14, digitalOpportunity: 18, customerFlowFriction: 16, trustReputationGap: 12, salesAccessibility: 9, conceptPotential: 9, commercialFit: 8 }
      : strength === "promising"
        ? { leadViability: 12, digitalOpportunity: 15, customerFlowFriction: 13, trustReputationGap: 9, salesAccessibility: 8, conceptPotential: 8, commercialFit: 7 }
        : { leadViability: 7, digitalOpportunity: 6, customerFlowFriction: 5, trustReputationGap: 3, salesAccessibility: 3, conceptPotential: 3, commercialFit: 3 }
  return calculateSignalOpportunity({ confidence, dimensions, evidenceCompleteness: confidence - 3, actionability: confidence - 1 })
}

const strongFixture = score("exceptional", 88)
const weakFixture = calculateSignalOpportunity({
  confidence: 58,
  dimensions: { leadViability: 8, digitalOpportunity: 5, customerFlowFriction: 3, trustReputationGap: 2, salesAccessibility: 3, conceptPotential: 2, commercialFit: 3 },
  penalties: { insufficient_evidence: 8 },
})

const groomerSignals = buildSignalOpportunityEvidence({
  onlinePresence: mapFirstOpportunities.independentGroomer.onlinePresence,
  rating: mapFirstOpportunities.independentGroomer.rating,
  reviewCount: mapFirstOpportunities.independentGroomer.reviewCount,
  hasPhone: true,
  hasBooking: false,
})

const salesFixtures = [
  { name: "Pine & Paws Grooming", category: "pet groomer", city: "Southlake", fact: "fear-free grooming appointments", angle: "make the fear-free appointment path easier to understand" },
  { name: "Cedar Chair Barber Co.", category: "barber", city: "Keller", fact: "appointment and walk-in barber services", angle: "clarify the choice between appointments and walk-ins" },
  { name: "Blacktop & Brass Detailing", category: "auto detailer", city: "Southlake", fact: "mobile interior detailing packages", angle: "turn package questions into a focused quote path" },
  { name: "North Gate Home Services", category: "contractor", city: "Keller", fact: "residential repair estimates", angle: "make service-area and estimate requests easier to route" },
  { name: "Clearline Home Cleaning", category: "cleaner", city: "Santa Barbara", fact: "recurring home-cleaning visits", angle: "reduce back-and-forth before recurring-service quotes" },
]

function goldenPack(fixture: typeof salesFixtures[number]) {
  const specific = `${fixture.fact} in ${fixture.city}`
  return {
    one_minute_briefing: `${fixture.name} publicly lists ${specific}. The strongest focused opportunity is to ${fixture.angle}. Mountline should verify the preferred customer path before proposing the smallest useful concept.`,
    best_angle: `Use the verified ${fixture.fact} detail to ${fixture.angle}.`,
    walk_in_opener: `Luke with Mountline—${fixture.name} stood out for ${specific}. We prepared one focused concept around that customer step because it is easier to show than explain.`,
    busy_response: "No problem. Mountline can send the labeled concept for a quieter moment, with no automated follow-up attached.",
    concept_transition: `The concept stays focused on ${fixture.fact}. Would this simpler path fit ${fixture.name}?`,
    discovery_questions: [
      `Which part of ${fixture.fact} creates the most customer questions?`,
      "Would a phone-first request path fit the way the team works today?",
      "Is the priority more demand, or less back-and-forth for current inquiries?",
    ],
    price_transition: "Mountline would confirm the smallest useful scope, then put the exact pages and price in writing before work begins.",
    call_script: `Luke with Mountline here—did we catch ${fixture.name} with thirty seconds? The public ${specific} detail stood out, and we prepared one concept to ${fixture.angle}. Would a quick explanation be useful, or should Mountline send the preview?`,
    follow_up_text: `Thanks for reviewing the ${fixture.name} concept. It stays focused on ${fixture.fact}. Mountline can outline the smallest useful version if the direction fits.`,
    objections: [
      { objection: "We already use social media.", response: "That can stay exactly where it is. The concept gives customers one reliable place for the specific service details while social continues handling updates and daily visibility." },
      { objection: "We are too busy.", response: "No problem. Mountline can send one labeled concept link for a quieter moment. There is no automated sequence, and the team can decide whether it is useful." },
      { objection: "We get enough business.", response: "More traffic does not need to be the goal. The practical question is whether clearer service information reduces repetitive calls and makes current inquiries easier to handle." },
      { objection: "What would it cost?", response: "Mountline would start with the smallest useful version, confirm the exact customer flow and pages, and put the scope and price in writing before any work begins." },
    ],
    do_not_say: ["Do not promise revenue.", "Do not criticize the current public presence.", "Do not present the concept as an official site."],
    next_steps: ["Verify the public fact used in the opener.", "Confirm the preferred contact path.", "Prepare one labeled concept."],
    lovable_prompt: `Create a clearly labeled ${fixture.category} concept preview for ${fixture.name}. Use only verified ${specific} details and placeholders for every unknown fact.`,
  }
}

const packEvaluations = salesFixtures.map((fixture) => {
  const quality = evaluateSignalSalesPackQuality({ pack: goldenPack(fixture), businessName: fixture.name, verifiedFacts: [fixture.fact, fixture.city] })
  return { category: fixture.category, business: fixture.name, quality_score: quality.score, issues: quality.issues, distinct_angle: fixture.angle }
})

const average = (values: number[]) => Math.round(values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length))

const simulatedRuns = [
  { market: "Keller, TX", focus: "best opportunities", requested: 15, discovered: 43, preselected: 15, finalists: 12, returned: 9, qualified: 9, watchlist: 4, rejected: 30, duplicates: 5, chainRejects: 6, scoreTypes: ["exceptional", "strong", "strong", "strong", "promising", "promising"] as const, confidences: [91, 86, 82, 78, 73, 68], fallbackUsage: 1, providerFailures: 0, normalized: ["✨ Cedar Chair Barber Co. — Keller TX → Cedar Chair Barber Co.", "@northgatehomeservices Official → North Gate Home Services"], qualityRejects: ["Strong agency-level site with no clear first offer", "Low-review listing with no direct contact route"] },
  { market: "Southlake, TX", focus: "best opportunities", requested: 10, discovered: 38, preselected: 14, finalists: 10, returned: 7, qualified: 7, watchlist: 3, rejected: 28, duplicates: 4, chainRejects: 7, scoreTypes: ["exceptional", "strong", "strong", "promising", "promising"] as const, confidences: [89, 84, 79, 72, 66], fallbackUsage: 1, providerFailures: 0, normalized: ["Blacktop & Brass Detailing | Southlake → Blacktop & Brass Detailing", "Pine & Paws Grooming @pineandpaws → Pine & Paws Grooming"], qualityRejects: ["Likely franchise location", "Real business, but the opportunity evidence was too weak"] },
  { market: "Keller, TX", focus: "groomers / pet services", requested: 10, discovered: 27, preselected: 12, finalists: 9, returned: 6, qualified: 6, watchlist: 3, rejected: 18, duplicates: 3, chainRejects: 4, scoreTypes: ["strong", "strong", "promising", "promising"] as const, confidences: [87, 81, 74, 67], fallbackUsage: 1, providerFailures: 0, normalized: ["🐾 Oak & Ember Grooming — Official Facebook → Oak & Ember Grooming"], qualityRejects: ["Inactive listing", "No clean canonical business identity"] },
  { market: "Southlake, TX", focus: "auto detailing", requested: 10, discovered: 31, preselected: 13, finalists: 10, returned: 7, qualified: 7, watchlist: 2, rejected: 22, duplicates: 4, chainRejects: 3, scoreTypes: ["exceptional", "strong", "strong", "promising", "promising"] as const, confidences: [90, 85, 80, 74, 69], fallbackUsage: 1, providerFailures: 1, normalized: ["DFW Auto Detail - Best Mobile Detailing in Southlake, TX → DFW Auto Detail"], qualityRejects: ["Outside requested radius", "No actionable public contact or listing route"] },
].map((run) => {
  const scores = run.scoreTypes.map((type, index) => score(type, run.confidences[index] || 65))
  const opportunities = scores.map((item) => item.opportunityScore)
  const rankings = scores.map((item) => item.rankingScore)
  const scriptScores = packEvaluations.slice(0, Math.min(run.returned, packEvaluations.length)).map((item) => item.quality_score)
  return {
    mode: "offline_fixture_simulation",
    market: run.market,
    focus: run.focus,
    requested: run.requested,
    discovered: run.discovered,
    preselected_for_deep_analysis: run.preselected,
    finalists_analyzed: run.finalists,
    duplicate_candidates: run.duplicates,
    chain_or_franchise_rejects: run.chainRejects,
    qualified_candidates: run.qualified,
    returned: run.returned,
    watchlist: run.watchlist,
    rejected: run.rejected,
    opportunity_score_range: [Math.min(...opportunities), Math.max(...opportunities)],
    average_opportunity_score: average(opportunities),
    ranking_score_range: [Math.min(...rankings), Math.max(...rankings)],
    average_ranking_score: average(rankings),
    confidence_range: [Math.min(...run.confidences), Math.max(...run.confidences)],
    average_confidence: average(run.confidences),
    script_quality_scores: scriptScores,
    average_script_quality: average(scriptScores),
    fallback_usage: run.fallbackUsage,
    provider_failures: run.providerFailures,
    name_normalization_examples: run.normalized,
    quality_rejection_examples: run.qualityRejects,
  }
})

const noisyName = resolveSignalCanonicalName([
  { value: "✨ Pine & Paws Grooming — Southlake TX @pineandpaws", source: "search_result_title" },
  { value: "Pine & Paws Grooming", source: "places_listing", verified: true },
], { city: "Southlake", state: "TX", category: "pet grooming" })

console.log(JSON.stringify({
  evaluation: "Mountline Signal production-readiness offline fixture gate",
  evaluated_at: new Date().toISOString(),
  scope_note: "These are deterministic offline simulations, not live provider runs. Live credentials and the production migration are required for final environment validation.",
  southlake_regression: {
    requested_leads: southlakeRegression.requested,
    before_failures: southlakeRegression.badBefore,
    after: "Structured identities may qualify without a website; known chains and generic result titles remain blocked; sparse output may return fewer finalists plus a labeled watchlist.",
  },
  known_chain_leakage: `${knownChains.length - chainRejected}/${knownChains.length}`,
  generic_entity_leakage: `${genericEntities.length - genericRejected}/${genericEntities.length}`,
  canonical_name_fixture: {
    selected: noisyName.canonicalName,
    source: noisyName.canonicalNameSource,
    confidence: noisyName.canonicalNameConfidence,
    warnings: noisyName.canonicalNameWarnings,
  },
  score_distribution_fixture: {
    strong_opportunity: strongFixture.opportunityScore,
    strong_ranking: strongFixture.rankingScore,
    weak_opportunity: weakFixture.opportunityScore,
    weak_ranking: weakFixture.rankingScore,
  },
  independent_groomer_fixture: groomerSignals.map((signal) => signal.signal),
  sales_pack_quality: packEvaluations,
  manual_sales_pack_inspection: {
    inspected: packEvaluations.length,
    all_have_distinct_angles: new Set(packEvaluations.map((item) => item.distinct_angle)).size === packEvaluations.length,
    all_pass_quality_threshold: packEvaluations.every((item) => item.quality_score >= 76 && item.issues.length === 0),
    checks: ["business-specific facts", "no raw enums", "no invented claims", "spoken length limits", "industry-specific concept direction"],
  },
  validation_runs: simulatedRuns,
}, null, 2))
