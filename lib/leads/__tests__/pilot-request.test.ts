import assert from "node:assert/strict"
import test from "node:test"
import { readFile } from "node:fs/promises"
import { savePilotRequest, type PilotLeadRecord } from "../pilot-request.ts"
import { updateLeadReview } from "../review.ts"
import { leadReviewStatuses, safeBusinessWebsite } from "../validation.ts"

const request = {
  name: " Jamie Owner ",
  business_name: " Example HVAC ",
  email: "owner@example.com",
  phone: "817-555-0100",
  industry: "HVAC",
  call_handling: "Calls go to voicemail when the crew is on a job.",
  website_confirmation: "",
}
const leadId = "be661f59-14f2-4896-93aa-30a3d9caf2ba"

test("pilot requests preserve useful context in the existing lead schema", async () => {
  const saved: PilotLeadRecord[] = []
  const result = await savePilotRequest(request, async (lead) => { saved.push(lead) })
  assert.deepEqual(result, { success: true })
  assert.equal(saved.length, 1)
  assert.equal(saved[0].name, "Jamie Owner")
  assert.equal(saved[0].business_name, "Example HVAC")
  assert.equal(saved[0].service_needed, "lead-recovery")
  assert.equal(saved[0].source, "website")
  assert.equal(saved[0].status, "new")
  assert.match(saved[0].message, /Receptionist pilot request\nBusiness type: HVAC/)
  assert.ok(saved[0].message.includes(request.call_handling))
  assert.equal("industry" in saved[0], false)
  assert.equal("website_confirmation" in saved[0], false)
})

test("invalid, oversized, and client-controlled status requests never reach persistence", async () => {
  for (const input of [
    { ...request, name: " " },
    { ...request, business_name: "" },
    { ...request, email: "no email" },
    { ...request, industry: "Injected industry" },
    { ...request, call_handling: "" },
    { ...request, call_handling: "x".repeat(2001) },
    { ...request, phone: "x".repeat(41) },
    { ...request, status: "paid" },
    null,
  ]) {
    let called = false
    const result = await savePilotRequest(input, async () => { called = true })
    assert.equal(result.success, false)
    assert.equal(called, false)
  }
})

test("honeypot submissions neither persist nor report successful capture", async () => {
  let called = false
  const result = await savePilotRequest({ ...request, website_confirmation: "spam.example" }, async () => { called = true })
  assert.equal(result.success, false)
  assert.equal(called, false)
})

test("storage failures stay failures and do not expose database details", async () => {
  const result = await savePilotRequest(request, async () => { throw new Error("private database connection details") })
  assert.equal(result.success, false)
  if (!result.success) {
    assert.match(result.error, /could not be saved/)
    assert.match(result.error, /hello@mountline.dev/)
    assert.doesNotMatch(result.error, /private database/)
  }
})

test("a request reports success only after the storage write finishes", async () => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  let finished = false
  const pending = savePilotRequest(request, () => gate).then((result) => { finished = true; return result })
  await Promise.resolve()
  assert.equal(finished, false)
  release()
  assert.deepEqual(await pending, { success: true })
})

test("optional phone becomes null and an unknown field cannot become a database column", async () => {
  await savePilotRequest({ ...request, phone: " " }, async (lead) => { assert.equal(lead.phone, null) })
  const rejected = await savePilotRequest({ ...request, project_id: leadId }, async () => { assert.fail("Must not persist") })
  assert.equal(rejected.success, false)
})

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

test("request persistence stays behind a server action and requires an inserted record", async () => {
  const action = await readFile(new URL("../../../app/actions/request-receptionist-pilot.ts", import.meta.url), "utf8")
  assert.match(action, /^"use server"/)
  assert.match(action, /\.insert\(lead\)\.select\("id"\)\.single\(\)/)
  assert.match(action, /error \|\| !data\?\.id/)
})

test("business links allow ordinary HTTP websites without executable or credential URLs", () => {
  assert.equal(safeBusinessWebsite("example.com"), "https://example.com/")
  assert.equal(safeBusinessWebsite("https://example.com/contact"), "https://example.com/contact")
  for (const value of ["javascript:alert(1)", "data:text/html,<script>alert(1)</script>", "https://user:pass@example.com", "not a website", "", null]) {
    assert.equal(safeBusinessWebsite(value), null)
  }
})
