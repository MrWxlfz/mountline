import assert from "node:assert/strict"
import test from "node:test"
import { inquirySchema, looksAutomated, describeInterests } from "../inquiry-schema.ts"
import { contentFingerprint, hashSubmitter, toInquiryRecord, type InquiryRecord } from "../inquiry-record.ts"
import { SAVE_FAILED, submitProjectInquiry, type SaveOutcome, type SubmitInquiryDeps } from "../submit-inquiry.ts"

const now = new Date("2026-09-28T15:00:00Z")
const inquiry = {
  name: " Dana Rivera ",
  business_name: " Rivera Dental ",
  email: " Dana@Example.com ",
  phone: "817-555-0142",
  interests: ["capture", "website"],
  message: "We need a new website and would like photos of the office.",
  current_website: "riveradental.example",
  website_confirmation: "",
  started_at: now.getTime() - 60_000,
  submission_key: "0b0f8c6e-3f7a-4c52-9a0e-6b1f3f6d2a11",
}

function deps(overrides: Partial<SubmitInquiryDeps> = {}) {
  const saved: InquiryRecord[] = []
  const dispatched: string[] = []
  const base: SubmitInquiryDeps = {
    now: () => now,
    submitterIp: "203.0.113.9",
    hashSecret: "test-secret-value",
    ownerReminderAt: () => new Date("2026-09-29T14:00:00Z"),
    async save(record) {
      saved.push(record)
      return { inquiryId: "7d0c3f2e-1a2b-4c3d-8e9f-0a1b2c3d4e5f", outcome: "created" }
    },
    dispatch: (id) => dispatched.push(id),
    ...overrides,
  }
  return { deps: base, saved, dispatched }
}

test("a valid inquiry is normalized and saved once, then its emails are dispatched", async () => {
  const { deps: d, saved, dispatched } = deps()
  const result = await submitProjectInquiry(inquiry, d)
  assert.deepEqual(result, { success: true, duplicate: false })
  assert.equal(saved.length, 1)
  const record = saved[0]
  assert.equal(record.name, "Dana Rivera")
  assert.equal(record.business_name, "Rivera Dental")
  assert.equal(record.email, "dana@example.com")
  // Interests keep a fixed order regardless of click order.
  assert.deepEqual(record.interests, ["website", "capture"])
  assert.equal(record.service_needed, "multiple")
  assert.equal(record.current_website, "https://riveradental.example/")
  assert.match(record.submitter_hash || "", /^[0-9a-f]{64}$/)
  assert.ok(!JSON.stringify(record).includes("203.0.113.9"), "the raw IP is never stored")
  assert.deepEqual(dispatched, ["7d0c3f2e-1a2b-4c3d-8e9f-0a1b2c3d4e5f"])
})

test("field errors come back per field and nothing is saved", async () => {
  for (const [patch, field] of [
    [{ name: " " }, "name"],
    [{ business_name: "" }, "business_name"],
    [{ email: "not an email" }, "email"],
    [{ phone: "call me maybe" }, "phone"],
    [{ interests: [] }, "interests"],
    [{ interests: ["advertising"] }, "interests"],
    [{ message: "hi" }, "message"],
    [{ message: "x".repeat(3001) }, "message"],
    [{ message: "See http://a.test http://b.test http://c.test http://d.test for details." }, "message"],
    [{ current_website: "javascript:alert(1)" }, "current_website"],
  ] as const) {
    const { deps: d, saved } = deps()
    const result = await submitProjectInquiry({ ...inquiry, ...patch }, d)
    assert.equal(result.success, false)
    if (!result.success) assert.ok(result.fieldErrors?.[field], `expected an error for ${field}`)
    assert.equal(saved.length, 0)
  }
})

test("unknown fields and client-chosen status are rejected before persistence", async () => {
  for (const extra of [{ status: "qualified" }, { source: "admin" }, { lead_id: "x" }]) {
    const { deps: d, saved } = deps()
    const result = await submitProjectInquiry({ ...inquiry, ...extra }, d)
    assert.equal(result.success, false)
    assert.equal(saved.length, 0)
  }
})

test("bot signals are refused without saving or claiming receipt", async () => {
  for (const patch of [{ website_confirmation: "spam.example" }, { started_at: now.getTime() - 400 }]) {
    const { deps: d, saved, dispatched } = deps()
    const result = await submitProjectInquiry({ ...inquiry, ...patch }, d)
    assert.equal(result.success, false)
    assert.equal(saved.length, 0)
    assert.equal(dispatched.length, 0)
  }
  assert.equal(looksAutomated({ website_confirmation: "", started_at: undefined }, now.getTime()), false)
})

test("a duplicate submission succeeds without queueing a second set of emails", async () => {
  const { deps: d, dispatched } = deps({
    save: async (): Promise<SaveOutcome> => ({ inquiryId: "7d0c3f2e-1a2b-4c3d-8e9f-0a1b2c3d4e5f", outcome: "duplicate" }),
  })
  assert.deepEqual(await submitProjectInquiry(inquiry, d), { success: true, duplicate: true })
  assert.equal(dispatched.length, 0)
})

test("storage failure is reported as a failure, without database details", async () => {
  const { deps: d, dispatched } = deps({ save: async () => { throw new Error("connection to db.internal refused") } })
  const result = await submitProjectInquiry(inquiry, d)
  assert.deepEqual(result, { success: false, error: SAVE_FAILED })
  assert.doesNotMatch(SAVE_FAILED, /db\.internal/)
  assert.equal(dispatched.length, 0)
})

test("a save that returns no record is not reported as received", async () => {
  const { deps: d } = deps({ save: async () => ({ inquiryId: null, outcome: "created" }) })
  assert.equal((await submitProjectInquiry(inquiry, d)).success, false)
})

test("rate-limited submissions fail visibly and are not dispatched", async () => {
  const { deps: d, dispatched } = deps({ save: async () => ({ inquiryId: null, outcome: "rate_limited" }) })
  const result = await submitProjectInquiry(inquiry, d)
  assert.equal(result.success, false)
  if (!result.success) assert.match(result.error, /wait/)
  assert.equal(dispatched.length, 0)
})

test("an email problem after saving never turns a saved inquiry into an error", async () => {
  const { deps: d } = deps({ dispatch: () => { throw new Error("Resend is down") } })
  assert.deepEqual(await submitProjectInquiry(inquiry, d), { success: true, duplicate: false })
})

test("success is reported only after the database write finishes", async () => {
  let release!: () => void
  const gate = new Promise<void>((resolve) => { release = resolve })
  let finished = false
  const { deps: d } = deps({
    save: async () => {
      await gate
      return { inquiryId: "7d0c3f2e-1a2b-4c3d-8e9f-0a1b2c3d4e5f", outcome: "created" }
    },
  })
  const pending = submitProjectInquiry(inquiry, d).then((result) => { finished = true; return result })
  await new Promise((resolve) => setTimeout(resolve, 5))
  assert.equal(finished, false)
  release()
  assert.equal((await pending).success, true)
})

test("the same words from the same address on the same day share a fingerprint", () => {
  const parsed = inquirySchema.parse(inquiry)
  const again = inquirySchema.parse({ ...inquiry, message: "  We need a NEW website and would like photos of the office. ", submission_key: "5a8e7c1d-2b3f-4a6c-9d0e-1f2a3b4c5d6e" })
  assert.equal(contentFingerprint(parsed, now), contentFingerprint(again, now))
  assert.notEqual(contentFingerprint(parsed, now), contentFingerprint(parsed, new Date("2026-09-29T15:00:00Z")))
  assert.equal(hashSubmitter("203.0.113.9", null), null)
  const record = toInquiryRecord(parsed, { now, submitterHash: null })
  assert.equal(record.phone, "817-555-0142")
})

test("interest labels read naturally in the dashboard and email", () => {
  assert.equal(describeInterests(["website", "capture"]), "Website, Photo and video")
  assert.equal(describeInterests(["receptionist"]), "AI receptionist")
  assert.equal(describeInterests(["made-up"]), "Not specified")
})
