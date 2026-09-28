import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test, { before } from "node:test"
import { PGlite } from "@electric-sql/pglite"

// Runs the real migration in an in-process Postgres (PGlite) and exercises it the way the app does.
const root = new URL("../../../", import.meta.url)
const read = (path: string) => readFile(new URL(path, root), "utf8")
const MIGRATION = "supabase/migrations/20260928120000_project_inquiry_email.sql"

let db: PGlite

before(async () => {
  db = new PGlite()
  await db.exec("create role anon; create role authenticated; create role service_role;")
  // PGlite has gen_random_uuid() built in (Postgres 13+) but not the pgcrypto extension.
  await db.exec((await read("supabase/northline_schema.sql")).replace(/create extension[^;]*;/gi, ""))
  const migration = await read(MIGRATION)
  await db.exec(migration)
  await db.exec(migration) // re-running is safe
})

let keySeq = 0
const key = () => `00000000-0000-4000-8000-${String(++keySeq).padStart(12, "0")}`

async function submit(overrides: Partial<{ key: string; fingerprint: string; submitter: string | null; email: string; reminder: string | null }> = {}) {
  const k = overrides.key ?? key()
  const result = await db.query<{ inquiry_id: string | null; outcome: string }>(
    "select * from submit_mountline_inquiry($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)",
    [
      k,
      overrides.fingerprint ?? `fp-${k}`,
      overrides.submitter === undefined ? "ip-hash-a" : overrides.submitter,
      "Dana Rivera",
      "Rivera Dental",
      overrides.email ?? "dana@example.com",
      null,
      null,
      ["website", "capture"],
      "multiple",
      "We need a new website.",
      overrides.reminder === undefined ? "2099-01-01T15:00:00Z" : overrides.reminder,
      5,
      3,
      60,
    ],
  )
  return result.rows[0]
}

const jobs = async (leadId: string) =>
  (await db.query<{ kind: string; status: string; skip_reason: string | null }>("select kind, status, skip_reason from inquiry_email_jobs where lead_id = $1 order by kind", [leadId])).rows

test("an inquiry is saved with its owner notification, confirmation, and reminder queued together", async () => {
  const saved = await submit({ email: "first@example.com" })
  assert.equal(saved.outcome, "created")
  assert.deepEqual(await jobs(saved.inquiry_id!), [
    { kind: "customer_acknowledgment", status: "queued", skip_reason: null },
    { kind: "owner_notification", status: "queued", skip_reason: null },
    { kind: "owner_reminder", status: "queued", skip_reason: null },
  ])
  const lead = (await db.query<{ source: string; status: string; interests: string[]; optout_token: string }>("select source, status, interests, optout_token from leads where id = $1", [saved.inquiry_id])).rows[0]
  assert.equal(lead.source, "website")
  assert.equal(lead.status, "new")
  assert.deepEqual(lead.interests, ["website", "capture"])
  assert.match(lead.optout_token, /^[0-9a-f-]{36}$/)
})

test("the same submission key or the same content that day resolves to the first inquiry", async () => {
  const k = key()
  const first = await submit({ key: k, email: "dup@example.com", fingerprint: "fp-dup" })
  const again = await submit({ key: k, email: "dup@example.com", fingerprint: "fp-other" })
  const sameWords = await submit({ email: "dup@example.com", fingerprint: "fp-dup" })
  assert.equal(first.outcome, "created")
  assert.deepEqual(again, { inquiry_id: first.inquiry_id, outcome: "duplicate" })
  assert.deepEqual(sameWords, { inquiry_id: first.inquiry_id, outcome: "duplicate" })
  const count = await db.query<{ n: number }>("select count(*)::int as n from inquiry_email_jobs where lead_id = $1 and kind = 'owner_notification'", [first.inquiry_id])
  assert.equal(count.rows[0].n, 1)
})

test("the database refuses a second row with the same submission key even without the function", async () => {
  const k = key()
  await submit({ key: k, email: "direct@example.com" })
  await assert.rejects(db.query("insert into leads (name, email, submission_key) values ('x', 'x@example.com', $1)", [k]), /duplicate key/)
})

test("submissions are rate limited per connection and per address", async () => {
  for (let i = 0; i < 5; i++) assert.equal((await submit({ submitter: "ip-busy", email: `busy${i}@example.com` })).outcome, "created")
  assert.deepEqual(await submit({ submitter: "ip-busy", email: "busy9@example.com" }), { inquiry_id: null, outcome: "rate_limited" })
  for (let i = 0; i < 3; i++) await submit({ submitter: `ip-${i}-x`, email: "same@example.com" })
  assert.equal((await submit({ submitter: "ip-new", email: "SAME@example.com" })).outcome, "rate_limited")
})

test("an address gets at most one confirmation a day, and none after it bounced", async () => {
  const first = await submit({ submitter: null, email: "ack@example.com" })
  const second = await submit({ submitter: null, email: "ack@example.com" })
  assert.equal((await jobs(first.inquiry_id!))[0].status, "queued")
  assert.deepEqual((await jobs(second.inquiry_id!))[0], { kind: "customer_acknowledgment", status: "skipped", skip_reason: "recent_acknowledgment" })
  // The owner still hears about both.
  assert.equal((await jobs(second.inquiry_id!))[1].status, "queued")

  const bounced = await submit({ submitter: null, email: "gone@example.com" })
  await db.query("update leads set email_suppressed_at = now(), email_suppressed_reason = 'bounced' where id = $1", [bounced.inquiry_id])
  await db.query("update inquiry_email_jobs set created_at = now() - interval '2 days' where lead_id = $1", [bounced.inquiry_id])
  const later = await submit({ submitter: null, email: "gone@example.com" })
  assert.deepEqual((await jobs(later.inquiry_id!))[0], { kind: "customer_acknowledgment", status: "skipped", skip_reason: "suppressed" })
})

test("claims lease each due job once; an expired lease is reclaimed; a stale unknown send is set aside", async () => {
  await db.query("update inquiry_email_jobs set status = 'accepted'")
  const saved = await submit({ submitter: null, email: "claim@example.com", reminder: null })
  const claim = async () => (await db.query<{ id: string; kind: string; attempts: number; lease_token: string }>("select * from claim_inquiry_email_jobs(10, 120, $1)", [saved.inquiry_id])).rows

  const first = await claim()
  assert.equal(first.length, 2)
  assert.ok(first.every((job) => job.attempts === 1 && job.lease_token))
  assert.equal((await claim()).length, 0, "leased jobs are not claimed again")

  await db.query("update inquiry_email_jobs set locked_until = now() - interval '1 minute' where lead_id = $1", [saved.inquiry_id])
  const reclaimed = await claim()
  assert.equal(reclaimed.length, 2)
  assert.ok(reclaimed.every((job) => job.attempts === 2 && !first.some((old) => old.lease_token === job.lease_token)))

  await db.query("update inquiry_email_jobs set locked_until = now() - interval '1 minute', first_attempt_at = now() - interval '1 day' where lead_id = $1", [saved.inquiry_id])
  assert.equal((await claim()).length, 0)
  const stale = await db.query<{ status: string; last_error: string }>("select status, last_error from inquiry_email_jobs where lead_id = $1", [saved.inquiry_id])
  assert.ok(stale.rows.every((row) => row.status === "failed" && /outcome is unknown/.test(row.last_error)))
})

test("future, paused, and exhausted jobs are not claimed", async () => {
  await db.query("update inquiry_email_jobs set status = 'accepted' where status in ('queued', 'retry')")
  const saved = await submit({ submitter: null, email: "paused@example.com", reminder: null })
  await db.query("update inquiry_email_jobs set status = 'accepted' where lead_id = $1", [saved.inquiry_id])
  await db.query("insert into inquiry_email_jobs (lead_id, kind, send_after) values ($1, 'owner_reminder', now() - interval '1 hour')", [saved.inquiry_id])
  await db.query("insert into inquiry_email_jobs (lead_id, kind, send_after) values ($1, 'customer_checkin', now() + interval '1 day')", [saved.inquiry_id])
  await db.query("update leads set followup_paused_at = now() where id = $1", [saved.inquiry_id])
  assert.equal((await db.query("select * from claim_inquiry_email_jobs(10, 120, $1)", [saved.inquiry_id])).rows.length, 0)
  await db.query("update leads set followup_paused_at = null where id = $1", [saved.inquiry_id])
  const resumed = (await db.query<{ kind: string }>("select * from claim_inquiry_email_jobs(10, 120, $1)", [saved.inquiry_id])).rows
  assert.deepEqual(resumed.map((job) => job.kind), ["owner_reminder"])

  await db.query("update inquiry_email_jobs set status = 'retry', send_after = now() - interval '1 minute', attempts = max_attempts where lead_id = $1 and kind = 'owner_reminder'", [saved.inquiry_id])
  assert.equal((await db.query("select * from claim_inquiry_email_jobs(10, 120, $1)", [saved.inquiry_id])).rows.length, 0)
})

test("each email kind exists at most once per inquiry", async () => {
  const saved = await submit({ submitter: null, email: "once@example.com" })
  await assert.rejects(db.query("insert into inquiry_email_jobs (lead_id, kind) values ($1, 'owner_notification')", [saved.inquiry_id]), /duplicate key/)
  await db.query("insert into inquiry_email_jobs (lead_id, kind) values ($1, 'customer_checkin') on conflict (lead_id, kind) do nothing", [saved.inquiry_id])
  await db.query("insert into inquiry_email_jobs (lead_id, kind) values ($1, 'customer_checkin') on conflict (lead_id, kind) do nothing", [saved.inquiry_id])
  const n = await db.query<{ n: number }>("select count(*)::int as n from inquiry_email_jobs where lead_id = $1 and kind = 'customer_checkin'", [saved.inquiry_id])
  assert.equal(n.rows[0].n, 1)
})

test("marking an inquiry Contacted records when, which starts the wait for the customer", async () => {
  const saved = await submit({ submitter: null, email: "status@example.com" })
  await db.query("update leads set status = 'reviewed' where id = $1", [saved.inquiry_id])
  let row = (await db.query<{ contacted_at: string | null; status_changed_at: string | null }>("select contacted_at, status_changed_at from leads where id = $1", [saved.inquiry_id])).rows[0]
  assert.equal(row.contacted_at, null)
  assert.ok(row.status_changed_at)
  await db.query("update leads set status = 'contacted' where id = $1", [saved.inquiry_id])
  row = (await db.query<{ contacted_at: string | null; status_changed_at: string | null }>("select contacted_at, status_changed_at from leads where id = $1", [saved.inquiry_id])).rows[0]
  assert.ok(row.contacted_at)
})

test("interests and job states are constrained in the database", async () => {
  await assert.rejects(db.query("update leads set interests = array['advertising'] where email = 'status@example.com'"), /leads_interests_check/)
  await assert.rejects(db.query("update inquiry_email_jobs set status = 'delivered_to_inbox' where kind = 'owner_notification'"), /check constraint/)
})

test("the public roles cannot read inquiries or run the inquiry functions", async () => {
  for (const role of ["anon", "authenticated"]) {
    await db.exec(`set role ${role}`)
    try {
      await assert.rejects(db.query("select * from inquiry_email_jobs"), /permission denied/)
      await assert.rejects(db.query("select * from inquiry_email_events"), /permission denied/)
      await assert.rejects(db.query("select * from claim_inquiry_email_jobs(1, 60, null)"), /permission denied/)
    } finally {
      await db.exec("reset role")
    }
  }
})
