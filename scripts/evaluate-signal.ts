import {
  assessSignalChain,
  calculateSignalOpportunity,
  resolveSignalDiscoveryEntity,
} from "../lib/signal/quality.ts"
import { genericEntities, knownChains, southlakeRegression } from "../lib/signal/fixtures/signal-evaluation-fixtures.ts"

const chainRejected = knownChains.filter((fixture) => assessSignalChain({ businessName: fixture.name, url: fixture.url }).deterministicBlock).length
const genericRejected = genericEntities.filter((title) => {
  const result = resolveSignalDiscoveryEntity({ title, url: `https://${title.toLowerCase().replace(/[^a-z0-9]+/g, "")}.example`, city: southlakeRegression.location, industry: "local services", sourceType: "likely_official_site" })
  return result.status === "generic_result" || result.status === "rejected"
}).length
const strongFixture = calculateSignalOpportunity({ confidence: 88, dimensions: { mountlineFit: 19, websiteOpportunity: 19, contactConversionFriction: 13, trustGap: 13, demoPotential: 9, contactViability: 9, operationalOpportunity: 4, timingUrgency: 4 } })
const weakFixture = calculateSignalOpportunity({ confidence: 58, dimensions: { mountlineFit: 12, websiteOpportunity: 8, contactConversionFriction: 5, trustGap: 2, demoPotential: 4, contactViability: 5, operationalOpportunity: 1, timingUrgency: 0 }, penalties: { insufficient_evidence: 12 } })

console.log(JSON.stringify({
  evaluation: "Mountline Signal offline quality gate",
  southlake: {
    requested_leads: southlakeRegression.requested,
    before_failures: southlakeRegression.badBefore,
    after: "Known chains and generic query titles are rejected before enrichment; qualifying output may contain fewer than five leads.",
  },
  known_chain_leakage: `${knownChains.length - chainRejected}/${knownChains.length}`,
  generic_entity_leakage: `${genericEntities.length - genericRejected}/${genericEntities.length}`,
  score_distribution_fixture: {
    strong_opportunity: strongFixture.opportunityScore,
    strong_ranking: strongFixture.rankingScore,
    weak_opportunity: weakFixture.opportunityScore,
    weak_ranking: weakFixture.rankingScore,
  },
}, null, 2))
