import assert from "node:assert/strict"
import test from "node:test"
import { canSendEmail, readInquiryEmailSettings } from "../email/config.ts"
import { decide, type FollowupRules, type LeadState } from "../email/eligibility.ts"
import { classifyResendResponse, idempotencyKeyFor, type EmailSender, type SendResult } from "../email/provider.ts"
import { addBusinessDays } from "../email/schedule.ts"
import { buildEmail, greetingName, type LeadForEmail, type OutgoingEmail } from "../email/templates.ts"
import type { EmailKind } from "../email/kinds.ts"
import { interpretWebhook, shouldApplyDelivery, signWebhookForTest, verifyWebhookSignature } from "../email/webhook.ts"
import { processEmailQueue, retryDelayMs, scheduleCheckins, type ClaimedJob, type EmailStore, type JobPatch, type LeadRecord } from "../email/worker.ts"

// TEST values only. The domain matches production so address handling is exercised, but nothing here sends mail.
const env = {
  RESEND_API_KEY: "re_test_key",
  INQUIRY_FROM_EMAIL: "Mountline <hello@mountline.dev>",
  INQUIRY_REPLY_TO_EMAIL: "hello@mountline.dev",
  INQUIRY_OWNER_EMAIL: "luke.nordin@icloud.com",
}
const settings = readInquiryEmailSettings(env)

const lead: LeadRecord = {
  id: "7d0c3f2e-1a2b-4c3d-8e9f-0a1b2c3d4e5f",
  created_at: "2026-09-28T15:00:00.000Z",
  name: "Dana Rivera",
  business_name: "Rivera <b>Dental</b>",
  email: "dana@example.com",
  phone: "817-555-0142",
  current_website: "https://riveradental.example/",
  interests: ["website", "capture"],
  message: "Hello <script>alert(1)</script>\nWe need a site. Visit http://spam.example",
  optout_token: "4f7c2a91-6b3d-4e8f-a0b1-c2d3e4f5a6b7",
  status: "new",
  contacted_at: null,
  customer_replied_at: null,
  followup_paused_at: null,
  followup_opted_out_at: null,
  email_suppressed_at: null,
}

/* Settings ----------------------------------------------------------------------------- */

test("missing email settings are reported by name and block sending", () => {
  const empty = readInquiryEmailSettings({})
  assert.deepEqual(empty.missing, ["RESEND_API_KEY", "INQUIRY_FROM_EMAIL", "INQUIRY_REPLY_TO_EMAIL", "INQUIRY_OWNER_EMAIL"])
  assert.equal(canSendEmail(empty), false)
  assert.equal(canSendEmail(settings), true)
  assert.equal(settings.timeZone, "America/Chicago")
  assert.equal(settings.checkinBusinessDays, 3)
})

test("malformed sender settings are refused without echoing their values", () => {
  const bad = readInquiryEmailSettings({ ...env, INQUIRY_FROM_EMAIL: "hello at mountline", INQUIRY_TIMEZONE: "Mars/Olympus", INQUIRY_CHECKIN_BUSINESS_DAYS: "0" })
  assert.equal(canSendEmail(bad), false)
  assert.ok(bad.problems.every((problem) => !problem.includes("hello at mountline")))
  assert.equal(bad.timeZone, "America/Chicago")
  assert.equal(bad.checkinBusinessDays, 3)
})

test("automatic customer follow-up stays on approval until reply detection works", () => {
  assert.equal(settings.customerFollowup, "approval")
  const wanted = readInquiryEmailSettings({ ...env, INQUIRY_CUSTOMER_FOLLOWUP: "automatic" })
  assert.equal(wanted.requestedCustomerFollowup, "automatic")
  assert.equal(wanted.customerFollowup, "approval")
  const halfSet = readInquiryEmailSettings({ ...env, INQUIRY_CUSTOMER_FOLLOWUP: "automatic", INQUIRY_REPLY_DETECTION: "resend_inbound" })
  assert.equal(halfSet.customerFollowup, "approval")
  const ready = readInquiryEmailSettings({ ...env, INQUIRY_CUSTOMER_FOLLOWUP: "automatic", INQUIRY_REPLY_DETECTION: "resend_inbound", RESEND_WEBHOOK_SECRET: "whsec_dGVzdC1zZWNyZXQtdmFsdWUtMTIzNA==" })
  assert.equal(ready.customerFollowup, "automatic")
  assert.equal(readInquiryEmailSettings({ ...env, INQUIRY_CUSTOMER_FOLLOWUP: "off" }).customerFollowup, "off")
})

/* Templates ---------------------------------------------------------------------------- */

test("the owner notification escapes everything and replies to the customer", () => {
  const email = buildEmail("owner_notification", lead, "job-1", settings)
  assert.equal(email.to, "luke.nordin@icloud.com")
  assert.equal(email.replyTo, "dana@example.com")
  assert.doesNotMatch(email.html, /<script>|<b>Dental/)
  assert.match(email.html, /&lt;script&gt;/)
  assert.match(email.text, /Interested in: Website, Photo and video/)
  assert.match(email.text, /\/dashboard\/leads\?inquiry=7d0c3f2e/)
  assert.doesNotMatch(email.subject, /[\r\n]/)
})

test("the customer confirmation is a fixed template that repeats nothing they typed but a clean first name", () => {
  const email = buildEmail("customer_acknowledgment", lead, "job-2", settings)
  assert.equal(email.to, "dana@example.com")
  assert.equal(email.replyTo, "hello@mountline.dev")
  assert.match(email.text, /^Hi Dana,/)
  assert.match(email.text, /Luke will take a look and reply to you here/)
  for (const typed of ["spam.example", "Rivera", "We need a site", "script", "817-555"]) {
    assert.ok(!email.html.includes(typed) && !email.text.includes(typed), `confirmation must not echo "${typed}"`)
  }
  // No promise of a response time, and no claim that anyone has read it yet.
  assert.doesNotMatch(email.text, /within|hours|reviewed|we’ve read/i)
})

test("greetings fall back when the name field isn’t a plain name", () => {
  assert.equal(greetingName("Dana Rivera"), "Dana")
  assert.equal(greetingName("O’Brien"), "O’Brien")
  assert.equal(greetingName("<img src=x>"), null)
  assert.equal(greetingName("http://spam.example"), null)
  assert.equal(greetingName("x".repeat(40)), null)
  const email = buildEmail("customer_acknowledgment", { ...lead, name: "Visit http://spam.example now" }, "job-3", settings)
  assert.match(email.text, /^Hi there,/)
})

test("templates are identical on retry, so the idempotency key never sees a different payload", () => {
  for (const kind of ["owner_notification", "customer_acknowledgment", "owner_reminder", "owner_checkin_prompt", "customer_checkin"] as EmailKind[]) {
    assert.deepEqual(buildEmail(kind, lead, "job-x", settings), buildEmail(kind, lead, "job-x", settings), kind)
  }
})

test("the customer check-in carries one-click and visible opt-out links", () => {
  const email = buildEmail("customer_checkin", lead, "job-4", settings)
  assert.equal(email.headers?.["List-Unsubscribe-Post"], "List-Unsubscribe=One-Click")
  assert.match(email.headers?.["List-Unsubscribe"] || "", /^<https:\/\/mountline\.dev\/api\/inquiries\/opt-out\?token=4f7c2a91/)
  assert.match(email.text, /inquiry\/stop\/4f7c2a91/)
  assert.match(email.text, /only follow-up/)
})

/* Provider ----------------------------------------------------------------------------- */

test("Resend responses map to accepted, retry, or failed", () => {
  assert.deepEqual(classifyResendResponse(200, { id: "em_1" }, null), { outcome: "accepted", providerMessageId: "em_1" })
  assert.equal(classifyResendResponse(409, { name: "invalid_idempotent_request" }, null).outcome, "accepted")
  assert.equal(classifyResendResponse(409, { name: "concurrent_idempotent_requests" }, null).outcome, "retry")
  const limited = classifyResendResponse(429, { name: "rate_limit_exceeded" }, "30")
  assert.equal(limited.outcome, "retry")
  assert.equal(limited.outcome === "retry" && limited.retryAfterSeconds, 30)
  assert.equal(classifyResendResponse(503, null, null).outcome, "retry")
  assert.equal(classifyResendResponse(403, { name: "validation_error", message: "domain not verified" }, null).outcome, "retry")
  assert.equal(classifyResendResponse(422, { name: "invalid_parameter" }, null).outcome, "failed")
  assert.equal(idempotencyKeyFor("abc"), "mountline-inquiry-email/abc")
  assert.equal(retryDelayMs(1), 5 * 60_000)
  assert.equal(retryDelayMs(3), 20 * 60_000)
  assert.equal(retryDelayMs(20), 6 * 3_600_000)
  assert.equal(retryDelayMs(1, 3600), 3_600_000)
})

/* Business days ------------------------------------------------------------------------ */

test("follow-ups land at 9 AM Central on the right weekday, across daylight saving", () => {
  const tz = "America/Chicago"
  // Monday 10:00 CDT + 3 business days = Thursday 9:00 CDT.
  assert.equal(addBusinessDays(new Date("2026-09-28T15:00:00Z"), 3, tz).toISOString(), "2026-10-01T14:00:00.000Z")
  // Friday 4 PM + 3 = Wednesday.
  assert.equal(addBusinessDays(new Date("2026-10-02T21:00:00Z"), 3, tz).toISOString(), "2026-10-07T14:00:00.000Z")
  // Saturday + 1 = Monday.
  assert.equal(addBusinessDays(new Date("2026-10-03T17:00:00Z"), 1, tz).toISOString(), "2026-10-05T14:00:00.000Z")
  // Friday before the November change + 1 = Monday 9:00 CST (UTC-6).
  assert.equal(addBusinessDays(new Date("2026-10-30T20:00:00Z"), 1, tz).toISOString(), "2026-11-02T15:00:00.000Z")
  // 11 PM Friday local is still Friday there, even though it is Saturday in UTC.
  assert.equal(addBusinessDays(new Date("2026-10-03T04:00:00Z"), 1, tz).toISOString(), "2026-10-05T14:00:00.000Z")
})

/* Eligibility -------------------------------------------------------------------------- */

const rules: FollowupRules = { customerFollowup: "approval", checkinBusinessDays: 3, ownerReminderBusinessDays: 1, timeZone: "America/Chicago" }
const contacted: LeadState = { ...lead, status: "contacted", contacted_at: "2026-09-28T15:00:00.000Z" }
const afterDue = new Date("2026-10-01T15:00:00Z")
const checkin = { kind: "customer_checkin" as const, approved_at: null }

test("the owner is reminded only about an inquiry nobody has handled", () => {
  const reminder = { kind: "owner_reminder" as const, approved_at: null }
  assert.deepEqual(decide(reminder, lead, rules, afterDue), { action: "send" })
  assert.deepEqual(decide(reminder, { ...lead, status: "reviewed" }, rules, afterDue), { action: "send" })
  for (const status of ["contacted", "qualified", "closed"]) {
    assert.deepEqual(decide(reminder, { ...lead, status }, rules, afterDue), { action: "skip", reason: "inquiry_handled" })
  }
  assert.deepEqual(decide(reminder, { ...lead, followup_paused_at: "2026-09-28T16:00:00Z" }, rules, afterDue), { action: "hold" })
})

test("a customer check-in waits for its due time and, by default, for approval", () => {
  const due = decide(checkin, contacted, rules, new Date("2026-09-30T15:00:00Z"))
  assert.equal(due.action, "reschedule")
  assert.equal(due.action === "reschedule" && due.at.toISOString(), "2026-10-01T14:00:00.000Z")
  assert.deepEqual(decide(checkin, contacted, rules, afterDue), { action: "await_approval" })
  assert.deepEqual(decide({ ...checkin, approved_at: "2026-10-01T15:00:00Z" }, contacted, rules, afterDue), { action: "send" })
  assert.deepEqual(decide(checkin, contacted, { ...rules, customerFollowup: "automatic" }, afterDue), { action: "send" })
})

test("replies, opt-outs, bounces, closing, pausing, and turning follow-ups off all stop a check-in", () => {
  const approved = { ...checkin, approved_at: "2026-10-01T15:00:00Z" }
  assert.deepEqual(decide(approved, { ...contacted, customer_replied_at: "2026-09-29T12:00:00Z" }, rules, afterDue), { action: "skip", reason: "customer_replied" })
  assert.deepEqual(decide(approved, { ...contacted, followup_opted_out_at: "2026-09-29T12:00:00Z" }, rules, afterDue), { action: "skip", reason: "opted_out" })
  assert.deepEqual(decide(approved, { ...contacted, email_suppressed_at: "2026-09-29T12:00:00Z" }, rules, afterDue), { action: "skip", reason: "suppressed" })
  assert.deepEqual(decide(approved, { ...contacted, status: "closed" }, rules, afterDue), { action: "skip", reason: "not_awaiting_customer" })
  assert.deepEqual(decide(approved, { ...contacted, status: "qualified" }, rules, afterDue), { action: "skip", reason: "not_awaiting_customer" })
  assert.deepEqual(decide(approved, { ...contacted, followup_paused_at: "2026-09-30T12:00:00Z" }, rules, afterDue), { action: "hold" })
  assert.deepEqual(decide(approved, contacted, { ...rules, customerFollowup: "off" }, afterDue), { action: "skip", reason: "followups_off" })
  // A reply from before the latest contact doesn't count as answering it.
  assert.deepEqual(decide(approved, { ...contacted, customer_replied_at: "2026-09-27T12:00:00Z" }, rules, afterDue), { action: "send" })
  // A bounced address also stops the confirmation.
  assert.deepEqual(decide({ kind: "customer_acknowledgment", approved_at: null }, { ...lead, email_suppressed_at: "2026-09-29T12:00:00Z" }, rules, afterDue), { action: "skip", reason: "suppressed" })
})

/* Worker ------------------------------------------------------------------------------- */

type Job = ClaimedJob & { status: string; send_after: string; lease_expires: number; provider_message_id?: string | null; last_error?: string | null; skip_reason?: string | null }

// Mirrors claim_inquiry_email_jobs: due, under the attempt limit, not paused, leased atomically.
function memoryStore(leads: LeadRecord[], clock: { now: Date }) {
  const jobs: Job[] = []
  let seq = 0
  const store: EmailStore & { jobs: Job[]; stealLease: (id: string) => void } = {
    jobs,
    async claim({ limit, leadId }) {
      const now = clock.now.getTime()
      const claimed: ClaimedJob[] = []
      for (const job of jobs) {
        if (claimed.length >= limit) break
        if (leadId && job.lead_id !== leadId) continue
        const owner = leads.find((row) => row.id === job.lead_id)
        if (owner?.followup_paused_at && ["owner_reminder", "owner_checkin_prompt", "customer_checkin"].includes(job.kind)) continue
        const due = (["queued", "retry"].includes(job.status) && new Date(job.send_after).getTime() <= now) || (job.status === "sending" && job.lease_expires < now)
        if (!due || job.attempts >= job.max_attempts) continue
        job.status = "sending"
        job.attempts += 1
        job.lease_token = `lease-${++seq}`
        job.lease_expires = now + 120_000
        claimed.push({ ...job })
      }
      return claimed
    },
    async loadLead(id) {
      return leads.find((row) => row.id === id) || null
    },
    async checkinAwaitingApproval(id) {
      return jobs.some((job) => job.lead_id === id && job.kind === "customer_checkin" && job.status === "awaiting_approval")
    },
    async finish(id, token, patch: JobPatch) {
      const job = jobs.find((row) => row.id === id)
      if (!job || job.lease_token !== token || job.status !== "sending") return false
      Object.assign(job, patch, { lease_token: "", lease_expires: 0 })
      return true
    },
    async ensureJob(leadId, kind, sendAfter) {
      if (jobs.some((job) => job.lead_id === leadId && job.kind === kind)) return
      jobs.push({ id: `job-${kind}-${leadId.slice(0, 4)}`, lead_id: leadId, kind, attempts: 0, max_attempts: 6, lease_token: "", approved_at: null, status: "queued", send_after: sendAfter.toISOString(), lease_expires: 0 })
    },
    async leadsAwaitingCheckinJob() {
      return leads
        .filter((row) => row.status === "contacted" && row.contacted_at && !jobs.some((job) => job.lead_id === row.id && job.kind === "customer_checkin"))
        .map((row) => ({ id: row.id, contacted_at: row.contacted_at! }))
    },
    stealLease(id) {
      const job = jobs.find((row) => row.id === id)!
      job.lease_token = "someone-else"
    },
  }
  return store
}

function recorder(respond: (email: OutgoingEmail, call: number) => SendResult) {
  const calls: Array<{ email: OutgoingEmail; key: string; from: string }> = []
  const send: EmailSender = async (email, { idempotencyKey, from }) => {
    calls.push({ email, key: idempotencyKey, from })
    return respond(email, calls.length)
  }
  return { send, calls }
}

async function queued(store: ReturnType<typeof memoryStore>, clock: { now: Date }) {
  await store.ensureJob(lead.id, "owner_notification", clock.now)
  await store.ensureJob(lead.id, "customer_acknowledgment", clock.now)
}

test("without email settings, nothing is claimed and the queue waits intact", async () => {
  const clock = { now: new Date("2026-09-28T15:00:00Z") }
  const store = memoryStore([lead], clock)
  await queued(store, clock)
  const { send, calls } = recorder(() => ({ outcome: "accepted", providerMessageId: "x" }))
  const summary = await processEmailQueue({ store, send, settings: readInquiryEmailSettings({}), now: () => clock.now })
  assert.equal(summary.configured, false)
  assert.ok(summary.missing.includes("RESEND_API_KEY"))
  assert.equal(calls.length, 0)
  assert.deepEqual(store.jobs.map((job) => [job.status, job.attempts]), [["queued", 0], ["queued", 0]])
})

test("both emails go out once, each with its own idempotency key and the Mountline sender", async () => {
  const clock = { now: new Date("2026-09-28T15:00:00Z") }
  const store = memoryStore([lead], clock)
  await queued(store, clock)
  const { send, calls } = recorder((_, call) => ({ outcome: "accepted", providerMessageId: `em_${call}` }))
  const summary = await processEmailQueue({ store, send, settings, now: () => clock.now, leadId: lead.id })
  assert.equal(summary.accepted, 2)
  assert.deepEqual(calls.map((call) => call.key), store.jobs.map((job) => `mountline-inquiry-email/${job.id}`))
  assert.ok(calls.every((call) => call.from === "Mountline <hello@mountline.dev>"))
  assert.deepEqual(store.jobs.map((job) => job.status), ["accepted", "accepted"])
  // Running again sends nothing.
  await processEmailQueue({ store, send, settings, now: () => clock.now })
  assert.equal(calls.length, 2)
})

test("overlapping worker runs never send the same email twice", async () => {
  const clock = { now: new Date("2026-09-28T15:00:00Z") }
  const store = memoryStore([lead], clock)
  await queued(store, clock)
  const { send, calls } = recorder(() => ({ outcome: "accepted", providerMessageId: null }))
  await Promise.all([
    processEmailQueue({ store, send, settings, now: () => clock.now }),
    processEmailQueue({ store, send, settings, now: () => clock.now }),
    processEmailQueue({ store, send, settings, now: () => clock.now, leadId: lead.id }),
  ])
  assert.equal(calls.length, 2)
})

test("a provider outage after saving leaves the inquiry intact and retries with the same key and payload", async () => {
  const clock = { now: new Date("2026-09-28T15:00:00Z") }
  const store = memoryStore([lead], clock)
  await queued(store, clock)
  let down = true
  const { send, calls } = recorder(() => (down ? { outcome: "retry", error: "Resend 503: service_unavailable" } : { outcome: "accepted", providerMessageId: "em_ok" }))

  const first = await processEmailQueue({ store, send, settings, now: () => clock.now })
  assert.equal(first.retrying, 2)
  assert.ok(store.jobs.every((job) => job.status === "retry" && job.attempts === 1 && job.last_error?.includes("503")))
  assert.equal(new Date(store.jobs[0].send_after).getTime() - clock.now.getTime(), 5 * 60_000)

  // Not due yet: nothing is sent.
  clock.now = new Date(clock.now.getTime() + 60_000)
  await processEmailQueue({ store, send, settings, now: () => clock.now })
  assert.equal(calls.length, 2)

  down = false
  clock.now = new Date(clock.now.getTime() + 10 * 60_000)
  await processEmailQueue({ store, send, settings, now: () => clock.now })
  assert.deepEqual(store.jobs.map((job) => job.status), ["accepted", "accepted"])
  assert.equal(calls[0].key, calls[2].key)
  assert.deepEqual(calls[0].email, calls[2].email)
})

test("retries stop at the attempt limit and permanent errors fail immediately", async () => {
  const clock = { now: new Date("2026-09-28T15:00:00Z") }
  const store = memoryStore([lead], clock)
  await store.ensureJob(lead.id, "owner_notification", clock.now)
  store.jobs[0].max_attempts = 2
  const { send } = recorder(() => ({ outcome: "retry", error: "Resend timed out." }))
  await processEmailQueue({ store, send, settings, now: () => clock.now })
  clock.now = new Date(clock.now.getTime() + 3_600_000)
  await processEmailQueue({ store, send, settings, now: () => clock.now })
  assert.equal(store.jobs[0].status, "failed")

  const other = memoryStore([lead], clock)
  await other.ensureJob(lead.id, "customer_acknowledgment", clock.now)
  const rejected = recorder(() => ({ outcome: "failed", error: "Resend 422: invalid_parameter" }))
  await processEmailQueue({ store: other, send: rejected.send, settings, now: () => clock.now })
  assert.equal(other.jobs[0].status, "failed")
  assert.equal(rejected.calls.length, 1)
})

test("a worker that lost its lease does not overwrite the result", async () => {
  const clock = { now: new Date("2026-09-28T15:00:00Z") }
  const store = memoryStore([lead], clock)
  await store.ensureJob(lead.id, "owner_notification", clock.now)
  const { send } = recorder(() => {
    store.stealLease(store.jobs[0].id)
    return { outcome: "accepted", providerMessageId: "em_1" }
  })
  const summary = await processEmailQueue({ store, send, settings, now: () => clock.now })
  assert.equal(summary.leaseLost, 1)
  assert.equal(store.jobs[0].status, "sending")
})

test("a due check-in waits for approval and prompts the owner instead of emailing the customer", async () => {
  const clock = { now: new Date("2026-09-28T15:00:00Z") }
  const waiting = { ...lead, status: "contacted", contacted_at: "2026-09-28T15:00:00.000Z" }
  const store = memoryStore([waiting], clock)
  assert.equal(await scheduleCheckins(store, settings), 1)
  assert.equal(store.jobs[0].send_after, "2026-10-01T14:00:00.000Z")

  const { send, calls } = recorder(() => ({ outcome: "accepted", providerMessageId: "em" }))
  await processEmailQueue({ store, send, settings, now: () => clock.now })
  assert.equal(calls.length, 0, "nothing is due before the third business day")

  clock.now = afterDue
  await processEmailQueue({ store, send, settings, now: () => clock.now })
  const checkinJob = store.jobs.find((job) => job.kind === "customer_checkin")!
  assert.equal(checkinJob.status, "awaiting_approval")
  assert.equal(checkinJob.attempts, 0)
  assert.deepEqual(calls.map((call) => call.email.to), ["luke.nordin@icloud.com"])
  assert.match(calls[0].email.subject, /Check in with/)
})

test("a check-in stops at send time when the customer has replied since it was queued", async () => {
  const clock = { now: afterDue }
  const waiting = { ...lead, status: "contacted", contacted_at: "2026-09-28T15:00:00.000Z" }
  const store = memoryStore([waiting], clock)
  await scheduleCheckins(store, settings)
  store.jobs[0].approved_at = "2026-10-01T14:30:00Z"
  waiting.customer_replied_at = "2026-09-30T18:00:00Z"
  const { send, calls } = recorder(() => ({ outcome: "accepted", providerMessageId: "em" }))
  await processEmailQueue({ store, send, settings, now: () => clock.now })
  assert.equal(calls.length, 0)
  assert.equal(store.jobs[0].status, "skipped")
  assert.equal(store.jobs[0].skip_reason, "customer_replied")
})

test("paused inquiries keep their follow-ups queued until resumed", async () => {
  const clock = { now: new Date("2026-10-05T15:00:00Z") }
  const paused: LeadRecord = { ...lead, followup_paused_at: "2026-09-28T16:00:00Z" }
  const store = memoryStore([paused], clock)
  await store.ensureJob(lead.id, "owner_reminder", new Date("2026-09-29T14:00:00Z"))
  const { send, calls } = recorder(() => ({ outcome: "accepted", providerMessageId: "em" }))
  await processEmailQueue({ store, send, settings, now: () => clock.now })
  assert.equal(calls.length, 0)
  assert.equal(store.jobs[0].status, "queued")
  paused.followup_paused_at = null
  await processEmailQueue({ store, send, settings, now: () => clock.now })
  assert.equal(calls.length, 1)
})

/* Webhooks ----------------------------------------------------------------------------- */

const secret = "whsec_" + Buffer.from("mountline-test-signing-secret").toString("base64")

test("webhook signatures are verified, timestamp-bounded, and rotation-friendly", () => {
  const body = JSON.stringify({ type: "email.delivered", data: { email_id: "em_1" } })
  const now = new Date("2026-09-28T15:00:00Z")
  const timestamp = String(Math.floor(now.getTime() / 1000))
  const signature = signWebhookForTest(secret, "msg_1", timestamp, body)
  assert.equal(verifyWebhookSignature({ secret, id: "msg_1", timestamp, signature, body, now }), true)
  assert.equal(verifyWebhookSignature({ secret, id: "msg_1", timestamp, signature: `v1,bm90LWl0 ${signature}`, body, now }), true)
  assert.equal(verifyWebhookSignature({ secret, id: "msg_1", timestamp, signature, body: body.replace("em_1", "em_2"), now }), false)
  assert.equal(verifyWebhookSignature({ secret, id: "msg_2", timestamp, signature, body, now }), false)
  assert.equal(verifyWebhookSignature({ secret: "whsec_" + Buffer.from("other").toString("base64"), id: "msg_1", timestamp, signature, body, now }), false)
  assert.equal(verifyWebhookSignature({ secret, id: "msg_1", timestamp, signature, body, now: new Date(now.getTime() + 10 * 60_000) }), false)
  assert.equal(verifyWebhookSignature({ secret, id: null, timestamp, signature, body, now }), false)
})

test("provider events become delivery updates, suppressions, or replies", () => {
  const bounced = interpretWebhook({ type: "email.bounced", created_at: "2026-09-28T15:01:00Z", data: { email_id: "em_1", bounce: { type: "Permanent", subType: "General" }, tags: { inquiry_job: "job-1" } } })
  assert.equal(bounced.kind === "delivery" && bounced.status, "bounced")
  assert.equal(bounced.kind === "delivery" && bounced.suppress, "bounced")
  assert.equal(bounced.kind === "delivery" && bounced.jobId, "job-1")
  const transient = interpretWebhook({ type: "email.bounced", data: { email_id: "em_1", bounce: { type: "Transient" } } })
  assert.equal(transient.kind === "delivery" && transient.suppress, null)
  const complaint = interpretWebhook({ type: "email.complained", data: { email_id: "em_1" } })
  assert.equal(complaint.kind === "delivery" && complaint.suppress, "complained")
  const reply = interpretWebhook({ type: "email.received", data: { email_id: "in_1", from: "Dana Rivera <Dana@Example.com>" } })
  assert.deepEqual(reply.kind === "reply" && reply.from, "dana@example.com")
  assert.equal(interpretWebhook({ type: "email.opened", data: { email_id: "em_1" } }).kind, "ignore")
  assert.equal(interpretWebhook({ type: "email.delivered", data: {} }).kind, "ignore")
})

test("delivery status only moves forward, whatever order events arrive in", () => {
  assert.equal(shouldApplyDelivery("accepted", "delivered"), true)
  assert.equal(shouldApplyDelivery("delivered", "delayed"), false)
  assert.equal(shouldApplyDelivery("delayed", "delivered"), true)
  assert.equal(shouldApplyDelivery("delivered", "complained"), true)
  assert.equal(shouldApplyDelivery("bounced", "delivered"), false)
  assert.equal(shouldApplyDelivery("cancelled", "delivered"), false)
})

test("template input stays the saved inquiry, never the live form", () => {
  const minimal: LeadForEmail = { ...lead, phone: null, current_website: null, interests: null }
  const email = buildEmail("owner_notification", minimal, "job-9", settings)
  assert.match(email.text, /Phone: Not given/)
  assert.match(email.text, /Interested in: Not specified/)
})
