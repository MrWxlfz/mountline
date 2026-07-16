import assert from "node:assert/strict"
import {
  buildSignalCopilotState,
  validateSignalArtifactCurrent,
} from "../lib/signal/copilot.ts"
import {
  signalCopilotEvaluationFixtures,
} from "../lib/signal/fixtures/copilot-evaluation-fixtures.ts"
import { generateSignalSalesCopilotPack } from "../lib/signal/sales-copilot.ts"

const scenarios = signalCopilotEvaluationFixtures.map((fixture) => {
  const state = buildSignalCopilotState(fixture.input)
  const pack = state.action_availability.sales_pack.enabled
    ? generateSignalSalesCopilotPack(fixture.input, state)
    : null
  const identitySnapshot = {
    canonical_name: fixture.input.businessName,
    public_address: fixture.input.address ?? null,
    public_phone: fixture.input.phone ?? null,
    industry: fixture.input.category ?? null,
    website_url: fixture.input.websiteUrl ?? null,
  }
  const staleGuard = validateSignalArtifactCurrent({
    artifactIdentityVersion: fixture.input.artifactSafetyPassed === false ? 1 : 2,
    activeIdentityVersion: 2,
    artifactEvidenceVersion: 2,
    activeEvidenceVersion: 2,
    artifactSnapshot: identitySnapshot,
    activeIdentity: identitySnapshot,
  })

  assert.equal(state.assistance_mode, fixture.expected.mode, `${fixture.id}: assistance mode`)
  assert.equal(state.recommendation.decision, fixture.expected.recommendation, `${fixture.id}: recommendation`)
  assert.equal(state.action_availability.concept.enabled, fixture.expected.conceptReady, `${fixture.id}: concept readiness`)
  assert.equal(state.action_availability.sales_pack.enabled, fixture.expected.salesReady, `${fixture.id}: sales readiness`)
  if (pack) {
    assert.equal(pack.review.passed, true, `${fixture.id}: sales review`)
    assert.ok(pack.opening.split(/\s+/).length <= 80, `${fixture.id}: spoken opening length`)
    assert.equal(pack.discovery_questions.length, 3, `${fixture.id}: discovery question count`)
  }
  if (fixture.input.artifactSafetyPassed === false) {
    assert.equal(staleGuard.current, false, `${fixture.id}: stale artifact guard`)
  }

  return {
    id: fixture.id,
    scenario: fixture.description,
    identity_result: {
      state: fixture.input.identityState ?? "unresolved",
      canonical_name: fixture.input.businessName,
      address: fixture.input.address ?? null,
      phone: fixture.input.phone ?? null,
      website_status: fixture.input.websiteStatus ?? "unknown",
    },
    rejected_sources: fixture.input.rejectedSources ?? [],
    business_understanding: {
      playbook: state.business_profile.playbook,
      business_model: state.business_profile.likely_business_model,
      customer_journey: state.business_profile.public_customer_journey,
      dominant_contact_route: state.business_profile.dominant_contact_route,
    },
    assistance_mode: state.assistance_mode,
    recommendation: state.recommendation,
    primary_opportunity: state.opportunity,
    uncertainty_budget: state.uncertainty_budget.map(({ classification, question, automatic_action, manual_action }) => ({
      classification,
      question,
      automatic_action,
      manual_action,
    })),
    next_action: state.next_action,
    scripts: pack
      ? {
          quality_score: pack.review.quality_score,
          fallback_used: pack.review.fallback_used,
          opening: pack.opening,
          discovery_questions: pack.discovery_questions,
          next_commitment: pack.next_commitment,
        }
      : null,
    concept_readiness: state.action_availability.concept,
    stale_checks: staleGuard,
    action_availability: state.action_availability,
    provider_limitations: state.provider_limitations,
    analysis_quality: state.analysis_quality,
  }
})

const customCleaners = scenarios.find((scenario) => scenario.id === "custom-cleaners-regression")
assert.ok(customCleaners)
assert.deepEqual(customCleaners.rejected_sources, ["Magicpin"])
assert.equal(customCleaners.assistance_mode, "verification_outreach")
assert.equal(customCleaners.recommendation.decision, "Verify one detail, then pursue")
assert.doesNotMatch(JSON.stringify(customCleaners.scripts), /magicpin/i)

console.log(JSON.stringify({
  evaluation: "Mountline Signal sales-copilot fixture gate",
  evaluated_at: new Date().toISOString(),
  scope_note: "Deterministic offline scenarios; no provider credentials, outreach, deployment, or remote database writes are used.",
  fixture_count: scenarios.length,
  required_scenarios: [
    "custom-cleaners-regression",
    "walk-in-donut",
    "groomer-outdated-site",
    "appointment-spa",
    "exact-strong-site",
    "facebook-primary",
    "ambiguous-common-name",
    "directory-outranks-official",
    "provider-failure",
    "contacted-follow-up",
  ],
  all_expectations_passed: true,
  scenarios,
}, null, 2))
