import assert from "node:assert/strict"
import test from "node:test"
import { readFile } from "node:fs/promises"
import { updateLeadReview } from "../review.ts"
import { leadReviewStatuses, safeBusinessWebsite } from "../validation.ts"

const leadId = "be661f59-14f2-4896-93aa-30a3d9caf2ba"

test("review updates accept only explicit review states without sale or payment inference", async () => {
  for (const status of leadReviewStatuses) {
    let writes = 0
    const result = await updateLeadReview(leadId, { status }, async (id, nextStatus) => {
      writes += 1
      assert.equal(id, leadId)
      assert.equal(nextStatus, status)
      return { id, status: nextStatus }
    })
    assert.deepEqual(result, { status: 200, body: { lead: { id: leadId, status } } })
    assert.equal(writes, 1)
  }
  for (const status of ["paid", "won", "converted", "manual_received", "active", "", null]) {
    const result = await updateLeadReview(leadId, { status }, async () => { assert.fail("Must not persist") })
    assert.equal(result.status, 400)
  }
})

test("review rejects malformed IDs, invalid bodies, and extra mutable fields", async () => {
  for (const [id, body] of [["../leads", { status: "new" }], [leadId, null], [leadId, { status: "contacted", email: "other@example.com" }]] as const) {
    const result = await updateLeadReview(id, body, async () => { assert.fail("Must not persist") })
    assert.equal(result.status, 400)
  }
})

test("review distinguishes missing records, failed writes, and unconfirmed updates", async () => {
  assert.equal((await updateLeadReview(leadId, { status: "reviewed" }, async () => null)).status, 404)
  assert.equal((await updateLeadReview(leadId, { status: "reviewed" }, async () => { throw new Error("private") })).status, 500)
  assert.equal((await updateLeadReview(leadId, { status: "reviewed" }, async (id) => ({ id, status: "new" }))).status, 500)
})

test("lead handlers authorize team membership before reading or updating data", async () => {
  const route = await readFile(new URL("../../../app/api/leads/[leadId]/route.ts", import.meta.url), "utf8")
  for (const method of ["GET", "PATCH"]) {
    const body = route.split(`export async function ${method}`)[1].split("export async function")[0]
    const guard = body.indexOf("requireNorthlineTeamMemberApi()")
    const deny = body.indexOf("return authCheck.response")
    const access = body.indexOf(method === "GET" ? "createAdminClient()" : "updateLeadReview(")
    assert.ok(guard >= 0 && deny > guard && access > deny, `${method} must reject unauthorized requests before data access`)
  }
})

test("business links allow ordinary HTTP websites without executable or credential URLs", () => {
  assert.equal(safeBusinessWebsite("example.com"), "https://example.com/")
  assert.equal(safeBusinessWebsite("https://example.com/contact"), "https://example.com/contact")
  for (const value of ["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "https://user:pass@example.com", "not a website", "", null]) {
    assert.equal(safeBusinessWebsite(value), null)
  }
})
