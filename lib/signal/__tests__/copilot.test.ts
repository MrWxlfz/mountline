import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import test from "node:test"
import {
  affectedSignalArtifacts,
  buildSignalCopilotState,
  changedSignalIdentityFields,
  staleReasonForSignalArtifacts,
  validateSignalArtifactCurrent,
} from "../copilot.ts"
import { generateSignalSalesCopilotPack } from "../sales-copilot.ts"
import {
  customCleanersCopilotFixture,
  signalCopilotEvaluationFixtures,
} from "../fixtures/copilot-evaluation-fixtures.ts"

test("Custom Cleaners becomes a safe, useful verification opportunity", () => {
  const state = buildSignalCopilotState(customCleanersCopilotFixture.input)
  assert.equal(state.assistance_mode, "verification_outreach")
  assert.equal(state.recommendation.decision, "Verify one detail, then pursue")
  assert.match(state.next_action.exact_instruction, /Call Custom Cleaners at \(817\) 337-4480/i)
  assert.match(state.next_action.exact_instruction, /website or page customers currently use/i)
  assert.equal(state.business_profile.playbook, "dry_cleaner_laundry")
  assert.match(state.opportunity.smallest_sensible_offer, /one-page mobile website/i)
  assert.match(state.opportunity.smallest_sensible_offer, /alterations or pickup\/delivery only if/i)
  assert.equal(state.action_availability.verification_call.enabled, true)
  assert.equal(state.action_availability.sales_pack.enabled, true)
  assert.equal(state.action_availability.concept.enabled, true)
})

test("provider failures stay out of the business uncertainty budget", () => {
  const fixture = signalCopilotEvaluationFixtures.find((item) => item.id === "provider-failure")!
  const state = buildSignalCopilotState(fixture.input)
  assert.equal(state.provider_limitations.length, 1)
  assert.equal(state.provider_limitations[0].provider, "Google Places")
  assert.ok(state.uncertainty_budget.every((item) => !/api|key|google|provider|geocod/i.test(`${item.question} ${item.manual_action}`)))
  assert.ok(state.recommendation.why.every((item) => !/api key|server-side key|geocoding api/i.test(item)))
})

test("identity changes invalidate every dependent current artifact", () => {
  const changed = changedSignalIdentityFields(
    {
      canonical_name: "magicpin",
      website_url: "https://magicpin.example",
      instagram_url: "https://instagram.com/magicpin",
      facebook_url: "https://facebook.com/magicpin",
      industry: "marketplace",
    },
    {
      canonical_name: "Custom Cleaners",
      website_url: null,
      instagram_url: null,
      facebook_url: null,
      industry: "Dry cleaner / laundry service",
    },
  )
  const affected = affectedSignalArtifacts(changed)
  for (const artifact of ["verdict", "business_profile", "opportunity", "concept", "sales_strategy", "scripts", "next_action", "supporting_claims"]) {
    assert.ok(affected.includes(artifact as never), `${artifact} should be invalidated`)
  }
  assert.match(staleReasonForSignalArtifacts(changed), /^Outdated — generated before identity correction|^Outdated — generated before canonical name/)
})

test("artifact guards reject version, snapshot, and explicit stale conflicts", () => {
  const activeIdentity = { canonical_name: "Custom Cleaners", public_phone: "(817) 337-4480" }
  assert.equal(validateSignalArtifactCurrent({ artifactIdentityVersion: 1, activeIdentityVersion: 2, artifactEvidenceVersion: 1, activeEvidenceVersion: 1, artifactSnapshot: { canonical_name: "magicpin" }, activeIdentity }).current, false)
  assert.equal(validateSignalArtifactCurrent({ artifactIdentityVersion: 2, activeIdentityVersion: 2, artifactEvidenceVersion: 1, activeEvidenceVersion: 1, artifactSnapshot: { canonical_name: "magicpin" }, activeIdentity }).current, false)
  assert.equal(validateSignalArtifactCurrent({ artifactIdentityVersion: 2, activeIdentityVersion: 2, artifactEvidenceVersion: 1, activeEvidenceVersion: 1, artifactSnapshot: activeIdentity, activeIdentity, staleAt: new Date().toISOString() }).current, false)
  assert.equal(validateSignalArtifactCurrent({ artifactIdentityVersion: 2, activeIdentityVersion: 2, artifactEvidenceVersion: 1, activeEvidenceVersion: 1, artifactSnapshot: activeIdentity, activeIdentity }).current, true)
})

test("all 20 evaluation fixtures produce the expected decision, mode, and contextual actions", () => {
  assert.equal(signalCopilotEvaluationFixtures.length, 20)
  for (const fixture of signalCopilotEvaluationFixtures) {
    const state = buildSignalCopilotState(fixture.input)
    assert.equal(state.assistance_mode, fixture.expected.mode, `${fixture.id}: assistance mode`)
    assert.equal(state.recommendation.decision, fixture.expected.recommendation, `${fixture.id}: recommendation`)
    assert.equal(state.action_availability.concept.enabled, fixture.expected.conceptReady, `${fixture.id}: concept availability`)
    assert.equal(state.action_availability.sales_pack.enabled, fixture.expected.salesReady, `${fixture.id}: sales availability`)
    assert.ok(state.next_action.exact_instruction.length > 20, `${fixture.id}: exact next action`)
    assert.ok(state.next_action.completion_criteria.length > 15, `${fixture.id}: completion criteria`)
  }
})

test("four-pass sales packs are natural, stage-aware, and free of stale Magicpin material", () => {
  for (const fixture of signalCopilotEvaluationFixtures.filter((item) => item.expected.salesReady)) {
    const state = buildSignalCopilotState(fixture.input)
    const pack = generateSignalSalesCopilotPack(fixture.input, state)
    assert.equal(pack.review.passed, true, `${fixture.id}: ${pack.review.issues.join(", ")}`)
    assert.ok(pack.opening.split(/\s+/).length <= 80, `${fixture.id}: opening length`)
    assert.equal(pack.discovery_questions.length, 3, `${fixture.id}: discovery question count`)
    assert.ok(pack.objective.length > 15)
    assert.ok(pack.next_commitment.length > 15)
    assert.doesNotMatch(JSON.stringify(pack), /systems discovery|recommended lane|opportunity sufficiency|calibrated as/i)
  }
  const state = buildSignalCopilotState(customCleanersCopilotFixture.input)
  const customPack = generateSignalSalesCopilotPack(customCleanersCopilotFixture.input, state)
  assert.doesNotMatch(JSON.stringify(customPack), /magicpin/i)
  assert.match(customPack.opening, /Do you currently have an official website customers should use for services and hours\?/)
  assert.match(customPack.recommended_offer.initial_scope, /alterations or pickup\/delivery only if the business confirms/i)
})

test("active-deal support uses recorded outcomes and respects explicit declines", () => {
  const sendIt = signalCopilotEvaluationFixtures.find((item) => item.id === "owner-send-it")!
  const sendState = buildSignalCopilotState(sendIt.input)
  const sendPack = generateSignalSalesCopilotPack(sendIt.input, sendState)
  assert.equal(sendState.assistance_mode, "active_deal_support")
  assert.match(sendPack.opening, /last note|following up/i)
  assert.match(sendPack.branches.send_it, /best number or email/i)

  const declined = signalCopilotEvaluationFixtures.find((item) => item.id === "explicit-decline")!
  const declinedState = buildSignalCopilotState(declined.input)
  assert.equal(declinedState.recommendation.decision, "Skip")
  assert.equal(declinedState.action_availability.call.enabled, false)
  assert.equal(declinedState.action_availability.follow_up.enabled, false)
  assert.match(declinedState.next_action.exact_instruction, /Close Closed Loop Shop/i)
})

test("a strong current website produces a real hold with no outreach actions", () => {
  const fixture = signalCopilotEvaluationFixtures.find((item) => item.id === "exact-strong-site")!
  const state = buildSignalCopilotState(fixture.input)
  assert.equal(state.recommendation.decision, "Hold")
  assert.equal(state.next_action.action_type, "hold")
  assert.match(state.next_action.exact_instruction, /^Hold Polished Local Studio\./)
  assert.equal(state.recommendation.prepared_asset, "Hold note ready")
  for (const action of ["verification_call", "neutral_walk_in", "concept", "sales_pack", "focus", "practice", "teleprompter", "call", "text", "email", "log_outreach"] as const) {
    assert.equal(state.action_availability[action].enabled, false, action)
  }
  assert.equal(state.action_availability.research.enabled, true)

  const active = buildSignalCopilotState({
    ...fixture.input,
    pipelineStage: "contacted",
    outreachStatus: "awaiting_reply",
    lastOutreachSummary: "The owner asked for a focused accessibility note.",
  })
  assert.equal(active.assistance_mode, "active_deal_support")
  assert.equal(active.recommendation.decision, "Pursue now")
  assert.equal(active.next_action.action_type, "follow_up")
})

test("confirming a corrected identity cannot retain the previous entity's website", () => {
  const route = readFileSync(
    new URL("../../../app/api/signal/prospects/[prospectId]/identity/candidates/[candidateId]/route.ts", import.meta.url),
    "utf8",
  )
  assert.match(route, /const websiteUrl = candidate\.official_website_eligible \? candidate\.website_url : null/)
  assert.doesNotMatch(route, /candidate\.official_website_eligible \? candidate\.website_url : prospect\.website_url/)
})
