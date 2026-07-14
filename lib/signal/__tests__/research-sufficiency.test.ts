import assert from "node:assert/strict"
import test from "node:test"
import {
  buildSignalVerificationChecklist,
  calculateSignalResearchSufficiency,
  getSignalActionAvailability,
} from "../research-sufficiency.ts"

test("unresolved identity gates opportunity, sales, concept, and contact", () => {
  const sufficiency = calculateSignalResearchSufficiency({
    identityState: "unresolved",
    onlineResearchAttempted: true,
    possibleContact: true,
  })
  assert.equal(sufficiency.identity.status, "insufficient")
  assert.equal(sufficiency.opportunity.status, "insufficient")
  assert.equal(sufficiency.salesPackState, "not_ready")
  const actions = getSignalActionAvailability({ identityState: "unresolved", verdict: "could_not_resolve", pipelineStage: "found", sufficiency })
  assert.equal(actions.canBuildConcept, false)
  assert.equal(actions.canPrepareSales, false)
  assert.equal(actions.canCreateClientProject, false)
  assert.equal(actions.primaryAction, "Confirm identity")
})

test("verified opportunity and contact unlock a personalized pack, but not client creation before interest", () => {
  const sufficiency = calculateSignalResearchSufficiency({
    identityState: "exact_match",
    verifiedPhone: true,
    websiteStatus: "verified_official_website",
    opportunityEvidenceCount: 3,
    opportunityScore: 82,
    positiveBusinessSignal: true,
  })
  assert.equal(sufficiency.sales.status, "sufficient")
  assert.equal(sufficiency.salesPackState, "fully_personalized")
  assert.equal(getSignalActionAvailability({ identityState: "exact_match", verdict: "pursue", pipelineStage: "analyzed", sufficiency }).canCreateClientProject, false)
  assert.equal(getSignalActionAvailability({ identityState: "exact_match", verdict: "pursue", pipelineStage: "interested", sufficiency }).canCreateClientProject, true)
})

test("Investigate checklist provides specific verification methods", () => {
  const sufficiency = calculateSignalResearchSufficiency({ identityState: "unresolved", onlineResearchAttempted: true })
  const checklist = buildSignalVerificationChecklist({
    businessName: "Custom Cleaners",
    identityState: "unresolved",
    submittedAddress: "1540 Keller Pkwy #150, Keller, TX 76248",
    websiteUrl: "https://customcleanerskeller.com",
    websiteStatus: "website_unknown",
    conflicts: ["The submitted address is in Keller, but this website lists an address in Dallas."],
    sufficiency,
  })
  assert.ok(checklist.some((item) => item.actionType === "add_maps_url"))
  assert.ok(checklist.some((item) => item.actionType === "search_phone"))
  assert.ok(checklist.some((item) => item.actionType === "confirm_website"))
  assert.ok(checklist.some((item) => /conflict/i.test(item.title)))
  assert.ok(checklist.every((item) => item.whyItMatters && item.fastestMethod))
  assert.ok(checklist.filter((item) => ["add_maps_url", "search_phone", "confirm_website"].includes(item.actionType)).every((item) => item.actionUrl))
})
