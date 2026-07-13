import {
  assessSignalChain,
  buildSignalOpportunityEvidence,
  calculateSignalOpportunity,
  resolveSignalDiscoveryEntity,
} from "../lib/signal/quality.ts"
import { genericEntities, knownChains, mapFirstOpportunities, southlakeRegression } from "../lib/signal/fixtures/signal-evaluation-fixtures.ts"

const chainRejected = knownChains.filter((fixture) => assessSignalChain({ businessName: fixture.name, url: fixture.url }).deterministicBlock).length
const genericRejected = genericEntities.filter((title) => {
  const result = resolveSignalDiscoveryEntity({ title, url: `https://${title.toLowerCase().replace(/[^a-z0-9]+/g, "")}.example`, city: southlakeRegression.location, industry: "local services", sourceType: "likely_official_site" })
  return result.status === "generic_result" || result.status === "rejected"
}).length
const strongFixture = calculateSignalOpportunity({ confidence: 88, dimensions: { reputationViability: 19, digitalGap: 24, customerFlowOpportunity: 18, trustGap: 14, demoPotential: 9, outreachViability: 9 } })
const weakFixture = calculateSignalOpportunity({ confidence: 58, dimensions: { reputationViability: 10, digitalGap: 7, customerFlowOpportunity: 4, trustGap: 2, demoPotential: 3, outreachViability: 4 }, penalties: { insufficient_evidence: 12 } })
const groomerSignals = buildSignalOpportunityEvidence({
  onlinePresence: mapFirstOpportunities.independentGroomer.onlinePresence,
  rating: mapFirstOpportunities.independentGroomer.rating,
  reviewCount: mapFirstOpportunities.independentGroomer.reviewCount,
  hasPhone: true,
  hasBooking: false,
})

console.log(JSON.stringify({
  evaluation: "Mountline Signal map-first offline quality gate",
  southlake: {
    requested_leads: southlakeRegression.requested,
    before_failures: southlakeRegression.badBefore,
    after: "Structured place identities can qualify without a website; known chains and generic entities remain blocked; scarce output may contain fewer than five qualified leads plus a labeled watchlist.",
  },
  known_chain_leakage: `${knownChains.length - chainRejected}/${knownChains.length}`,
  generic_entity_leakage: `${genericEntities.length - genericRejected}/${genericEntities.length}`,
  score_distribution_fixture: {
    strong_opportunity: strongFixture.opportunityScore,
    strong_ranking: strongFixture.rankingScore,
    weak_opportunity: weakFixture.opportunityScore,
    weak_ranking: weakFixture.rankingScore,
  },
  independent_groomer_fixture: groomerSignals.map((signal) => signal.signal),
}, null, 2))
