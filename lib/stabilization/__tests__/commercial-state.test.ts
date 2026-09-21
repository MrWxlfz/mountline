import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"
import { fileURLToPath } from "node:url"
import { createProjectSchema, patchProjectSchema, projectReceiptSchema } from "../../projects/validation.ts"
import { createInquirySchema, inquiryEventSchema } from "../../inquiries/validation.ts"

const repositoryRoot = fileURLToPath(new URL("../../../", import.meta.url))
const source = (path: string) => readFile(new URL(path, `file://${repositoryRoot}/`), "utf8")

test("project PATCH accepts only supplied safe fields", () => {
  assert.deepEqual(patchProjectSchema.parse({ notes: "internal" }), { notes: "internal" })
  assert.equal(patchProjectSchema.safeParse({ preview_url: "javascript:alert(1)" }).success, false)
  assert.equal(patchProjectSchema.safeParse({ payment_status: "paid" }).success, false)
  assert.equal(patchProjectSchema.safeParse({ unknown: "field" }).success, false)
})

test("project creation is idempotency-keyed and receipt evidence is bounded", () => {
  assert.equal(createProjectSchema.safeParse({ project_name: "Pilot" }).success, false)
  assert.equal(projectReceiptSchema.safeParse({ amount_minor: 5000, currency: "usd", received_at: "2026-09-06T12:00:00.000Z", payment_method: "bank_transfer", reference: "bank-123" }).success, true)
  assert.equal(projectReceiptSchema.safeParse({ amount_minor: 0, currency: "USD", received_at: "2026-09-06T12:00:00.000Z", payment_method: "bank_transfer", reference: "bank-123" }).success, false)
})

test("inquiry outcomes require independent event evidence", () => {
  assert.equal(createInquirySchema.safeParse({ idempotency_key: "capture-123", source: "phone", received_at: "2026-09-06T12:00:00.000Z", is_test: true }).success, true)
  assert.equal(inquiryEventSchema.safeParse({ event_type: "handoff_attempted", occurred_at: "2026-09-06T12:01:00.000Z", actor_source: "manual_team", source_event_key: "event-1", attempt_id: "attempt-1", supersedes_event_id: null, evidence: { destination: "owner phone" } }).success, true)
  assert.equal(inquiryEventSchema.safeParse({ event_type: "handoff_attempted", occurred_at: "2026-09-06T12:01:00.000Z", actor_source: "manual_team", source_event_key: "event-1", attempt_id: "attempt-1", supersedes_event_id: null, evidence: { provider_reference: "accepted" } }).success, false)
  assert.equal(inquiryEventSchema.safeParse({ event_type: "handoff_successful", occurred_at: "2026-09-06T12:01:00.000Z", actor_source: "manual_team", source_event_key: "event-2", attempt_id: "attempt-1", supersedes_event_id: null, evidence: {} }).success, false)
  assert.equal(inquiryEventSchema.safeParse({ event_type: "payment_received", occurred_at: "2026-09-06T12:01:00.000Z", actor_source: "manual_team", source_event_key: "event-3", attempt_id: null, supersedes_event_id: null, evidence: { payment_context: "mountline", receipt_reference: "r", amount_minor: 100, currency: "USD", received_at: "2026-09-06T12:01:00.000Z" } }).success, false)
})

test("migration denies direct roles and preserves evidence uniqueness", async () => {
  const sql = await source("supabase/migrations/20260906232259_pilot_stabilization.sql")
  assert.match(sql, /revoke all privileges on all tables in schema public from public, anon, authenticated/i)
  assert.match(sql, /enable row level security/i)
  assert.match(sql, /project_receipts_project_reference_idx/i)
  assert.match(sql, /inquiry_events_source_event_key_idx/i)
  assert.match(sql, /security definer[\s\S]*record_project_inquiry/i)
  assert.doesNotMatch(sql, /grant execute[\s\S]*to anon/i)
})

test("record creation no longer manufactures sales", async () => {
  const [projectsRoute, clientsRoute, convertRoute, pipelineRoute, leadAction] = await Promise.all([
    source("app/api/projects/route.ts"),
    source("app/api/clients/route.ts"),
    source("app/api/signal/prospects/[prospectId]/convert/route.ts"),
    source("app/api/signal/prospects/[prospectId]/pipeline/route.ts"),
    source("app/actions/submit-lead.ts"),
  ])
  assert.doesNotMatch(projectsRoute, /pipeline_stage:\s*["']won/)
  assert.doesNotMatch(clientsRoute, /pipeline_stage:\s*["']interested/)
  assert.doesNotMatch(convertRoute, /outreach_status:\s*["']interested/)
  assert.match(pipelineRoute, /sale_confirmed_at/)
  assert.match(leadAction, /createAdminClient/)
})
