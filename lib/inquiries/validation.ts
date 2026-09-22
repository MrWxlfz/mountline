import { z } from "zod"

const nullableText = (max: number) => z.union([
  z.string().trim().max(max).transform((value) => value || null),
  z.null(),
])

const eventBase = {
  occurred_at: z.string().datetime({ offset: true }),
  actor_source: z.enum(["manual_team", "provider", "customer", "business_owner", "system"]),
  source_event_key: z.string().trim().min(1).max(500),
  attempt_id: nullableText(500).optional().default(null),
  supersedes_event_id: z.string().uuid().nullable().optional().default(null),
}

export const createInquirySchema = z.object({
  idempotency_key: z.string().trim().min(8).max(200),
  source: z.enum(["manual", "phone", "website", "email", "referral", "provider"]),
  external_reference: nullableText(500).optional().default(null),
  received_at: z.string().datetime({ offset: true }),
  contact_name: nullableText(200).optional().default(null),
  contact_phone: nullableText(100).optional().default(null),
  contact_email: z.union([z.string().trim().email().max(320).transform((value) => value.toLowerCase()), z.literal("").transform(() => null), z.null()]).optional().default(null),
  service_requested: nullableText(1_000).optional().default(null),
  intake_details: nullableText(10_000).optional().default(null),
  is_test: z.boolean().optional().default(false),
}).strict()

export const inquiryEventSchema = z.discriminatedUnion("event_type", [
  z.object({ ...eventBase, event_type: z.literal("inquiry_received"), evidence: z.object({ source_reference: z.string().trim().min(1).max(500) }).strict() }).strict(),
  z.object({ ...eventBase, event_type: z.literal("handoff_pending"), attempt_id: z.string().trim().min(1).max(500), evidence: z.object({ reason: z.string().trim().min(1).max(1_000).optional() }).strict() }).strict(),
  z.object({ ...eventBase, event_type: z.literal("handoff_attempted"), attempt_id: z.string().trim().min(1).max(500), evidence: z.object({ destination: z.string().trim().min(1).max(500) }).strict() }).strict(),
  z.object({ ...eventBase, event_type: z.literal("handoff_accepted_by_provider"), attempt_id: z.string().trim().min(1).max(500), evidence: z.object({ provider_reference: z.string().trim().min(1).max(500) }).strict() }).strict(),
  z.object({ ...eventBase, event_type: z.literal("handoff_successful"), attempt_id: z.string().trim().min(1).max(500), evidence: z.object({ delivery_reference: z.string().trim().min(1).max(500).optional(), owner_acknowledged_at: z.string().datetime({ offset: true }).optional() }).strict().refine((value) => Boolean(value.delivery_reference || value.owner_acknowledged_at), "Verified delivery evidence or owner acknowledgement is required.") }).strict(),
  z.object({ ...eventBase, event_type: z.literal("handoff_failed"), attempt_id: z.string().trim().min(1).max(500), evidence: z.object({ failure_reason: z.string().trim().min(1).max(2_000) }).strict() }).strict(),
  z.object({ ...eventBase, event_type: z.literal("customer_contacted"), evidence: z.object({ contact_method: z.string().trim().min(1).max(200) }).strict() }).strict(),
  z.object({ ...eventBase, event_type: z.literal("quote_produced"), evidence: z.object({ quote_reference: z.string().trim().min(1).max(500) }).strict() }).strict(),
  z.object({ ...eventBase, event_type: z.literal("job_won"), evidence: z.object({ job_reference: z.string().trim().min(1).max(500) }).strict() }).strict(),
  z.object({ ...eventBase, event_type: z.literal("payment_received"), evidence: z.object({
    payment_context: z.literal("client_job"),
    receipt_reference: z.string().trim().min(1).max(500),
    amount_minor: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    currency: z.string().trim().regex(/^[A-Za-z]{3}$/).transform((value) => value.toUpperCase()),
    received_at: z.string().datetime({ offset: true }),
  }).strict() }).strict(),
])

export function firstInquiryValidationError(error: z.ZodError) {
  return error.issues[0]?.message || "Invalid inquiry record."
}
