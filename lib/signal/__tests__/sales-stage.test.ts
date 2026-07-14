import test from "node:test"
import assert from "node:assert/strict"
import {
  buildSignalSalesStageGuidance,
  type SignalSalesStageInput,
  type SignalSalesSituation,
} from "../sales-stage.ts"

const verifiedFact = "the site lists same-day estimates and a public phone number"

const goldenScenarios: Array<{
  name: string
  expected: SignalSalesSituation
  input: SignalSalesStageInput
}> = [
  { name: "brand-new cold lead", expected: "brand_new_cold", input: { businessName: "Oak & Ember", verifiedFact } },
  { name: "weak website", expected: "weak_website", input: { businessName: "North Star Detail", verifiedFact, websiteStrength: "weak" } },
  { name: "strong website skip", expected: "strong_website_skip", input: { businessName: "Cedar Chair", verifiedFact, websiteStrength: "strong" } },
  { name: "Facebook-first business", expected: "facebook_first", input: { businessName: "Lakeview Grooming", verifiedFact, facebookFirst: true } },
  { name: "missing booking", expected: "missing_booking", input: { businessName: "Keller Cuts", verifiedFact, missingBooking: true } },
  { name: "missing contact form", expected: "missing_contact_form", input: { businessName: "Atlas Electric", verifiedFact, missingContactForm: true } },
  { name: "owner busy", expected: "owner_busy", input: { businessName: "Elm Street Auto", verifiedFact, ownerBusy: true } },
  { name: "employee answers", expected: "employee_answered", input: { businessName: "Westside Plumbing", verifiedFact, employeeAnswered: true } },
  { name: "demo already sent", expected: "demo_sent", input: { businessName: "Juniper Dental", verifiedFact, demoSent: true } },
  { name: "no response after demo", expected: "no_response_after_demo", input: { businessName: "Union Barber", verifiedFact, demoIgnored: true } },
  { name: "interested but hesitant", expected: "interested_hesitant", input: { businessName: "Brightline Cleaning", verifiedFact, interestedButHesitant: true } },
  { name: "asks price early", expected: "price_asked_early", input: { businessName: "North Loop HVAC", verifiedFact, priceAskedEarly: true } },
  { name: "asks to send link", expected: "send_link_requested", input: { businessName: "Grove Pet Care", verifiedFact, sendLinkRequested: true } },
  { name: "declines", expected: "declined", input: { businessName: "Highland Glass", verifiedFact, explicitlyDeclined: true } },
  { name: "proposal stage", expected: "proposal_stage", input: { businessName: "Stonebridge Roofing", verifiedFact, pipelineStage: "proposal" } },
  { name: "won", expected: "won", input: { businessName: "Clearwater Pools", verifiedFact, pipelineStage: "won" } },
  { name: "lost", expected: "lost", input: { businessName: "Redwood Garage", verifiedFact, pipelineStage: "lost" } },
]

test("golden sales situations resolve to the intended stage", () => {
  for (const scenario of goldenScenarios) {
    const result = buildSignalSalesStageGuidance(scenario.input)
    assert.equal(result.situation, scenario.expected, scenario.name)
  }
})

test("generated openers pass a concise read-aloud check", () => {
  for (const scenario of goldenScenarios) {
    const result = buildSignalSalesStageGuidance(scenario.input)
    const words = result.opener.split(/\s+/).filter(Boolean)
    assert.ok(words.length <= 55, `${scenario.name}: ${words.length} words`)
    assert.doesNotMatch(result.opener, /\b(?:I|me|my)\b/, scenario.name)
    assert.doesNotMatch(result.opener, /\b(?:pipeline_stage|outreach_status|concept_ready)\b/i, scenario.name)
    assert.doesNotMatch(result.opener, /\b(?:guarantee|limited time|act now|last chance|crush|dominate)\b/i, scenario.name)
  }
})

test("later-stage guidance never resets to a cold introduction", () => {
  const laterStages = goldenScenarios.filter((scenario) => [
    "demo_sent",
    "no_response_after_demo",
    "interested_hesitant",
    "proposal_stage",
    "won",
    "lost",
  ].includes(scenario.expected))

  for (const scenario of laterStages) {
    const result = buildSignalSalesStageGuidance(scenario.input)
    assert.doesNotMatch(result.opener, /stood out because|is now a reasonable time/i, scenario.name)
  }
})

test("skip, decline, won, and lost states do not invite new outreach", () => {
  for (const expected of ["strong_website_skip", "declined", "won", "lost"] as const) {
    const scenario = goldenScenarios.find((item) => item.expected === expected)
    assert.ok(scenario)
    const result = buildSignalSalesStageGuidance(scenario.input)
    assert.equal(result.qualifiesForOutreach, false, expected)
  }
})

test("every active scenario has one clear next step and verified grounding", () => {
  for (const scenario of goldenScenarios) {
    const result = buildSignalSalesStageGuidance(scenario.input)
    assert.ok(result.nextStep.length >= 20, scenario.name)
    if (result.qualifiesForOutreach && !["declined"].includes(result.situation)) {
      assert.match(result.opener, new RegExp(scenario.input.businessName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i"), scenario.name)
    }
  }
})
