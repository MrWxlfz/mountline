import assert from "node:assert/strict"
import test from "node:test"
import {
  planSignalLegacyIdentityRepair,
  type SignalLegacyIdentityRecord,
} from "../legacy-repair.ts"

function record(overrides: Partial<SignalLegacyIdentityRecord> = {}): SignalLegacyIdentityRecord {
  return {
    id: "prospect-1",
    business_name: "magicpin",
    display_name: "magicpin",
    canonical_name: "magicpin",
    canonical_name_status: "submitted",
    canonical_name_source: "search_result",
    submitted_name: "Custom Cleaners",
    identity_resolution_state: "unresolved",
    identity_status: "needs_review",
    lead_lifecycle: "analyzed",
    verdict: "investigate",
    sales_pack_state: "research_briefing",
    manual_identity_override: {},
    ...overrides,
  }
}

test("legacy repair restores an unverified directory publisher to the submitted name", () => {
  const repair = planSignalLegacyIdentityRepair(record())
  assert.ok(repair)
  assert.equal(repair.restoredName, "Custom Cleaners")
  assert.equal(repair.restoredRecord.identity_resolution_state, "unresolved")
  assert.equal(repair.restoredRecord.lead_lifecycle, "needs_confirmation")
  assert.equal(repair.restoredRecord.sales_pack_state, "not_ready")
})

test("legacy repair never rewrites verified or manually corrected identities", () => {
  assert.equal(planSignalLegacyIdentityRepair(record({ identity_status: "verified" })), null)
  assert.equal(planSignalLegacyIdentityRepair(record({ canonical_name_status: "user_confirmed" })), null)
  assert.equal(planSignalLegacyIdentityRepair(record({ manual_identity_override: { canonical_name: "Magic Pin Cleaning" } })), null)
})

test("legacy repair ignores normal canonical names and missing submitted names", () => {
  assert.equal(planSignalLegacyIdentityRepair(record({ canonical_name: "Custom Cleaners" })), null)
  assert.equal(planSignalLegacyIdentityRepair(record({ submitted_name: null })), null)
})
