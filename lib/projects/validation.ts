import { z } from "zod"

export const projectStatuses = [
  "discovery",
  "design",
  "build",
  "review",
  "launch",
  "support",
  "completed",
] as const

export const paymentMethods = [
  "stripe_card",
  "crypto",
  "cash",
  "check",
  "bank_transfer",
  "other",
] as const

const nullableText = (max: number) =>
  z.union([z.string().trim().max(max).transform((value) => value || null), z.null()])

const nullableDate = z.union([
  z
    .string()
    .trim()
    .refine(
      (value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value),
      "Use a date in YYYY-MM-DD format.",
    )
    .transform((value) => value || null),
  z.null(),
])

const nullableHttpUrl = z.union([
  z
    .string()
    .trim()
    .max(2_000)
    .refine((value) => {
      if (!value) return true
      try {
        const url = new URL(value)
        return url.protocol === "https:" || url.protocol === "http:"
      } catch {
        return false
      }
    }, "Use a valid http or https URL.")
    .transform((value) => value || null),
  z.null(),
])

export const createProjectSchema = z
  .object({
    idempotency_key: z.string().trim().min(8).max(200),
    project_name: z.string().trim().min(1).max(160),
    client_id: z.string().uuid().nullable().optional().default(null),
    package_type: nullableText(100).optional().default(null),
    status: z.enum(projectStatuses).optional().default("discovery"),
    start_date: nullableDate.optional().default(null),
    target_launch_date: nullableDate.optional().default(null),
    live_url: nullableHttpUrl.optional().default(null),
    preview_url: nullableHttpUrl.optional().default(null),
    payment_link: nullableHttpUrl.optional().default(null),
    next_step: nullableText(4_000).optional().default(null),
    notes: nullableText(10_000).optional().default(null),
    signal_id: z.string().uuid().nullable().optional().default(null),
  })
  .strict()

export const patchProjectSchema = z
  .object({
    status: z.enum(projectStatuses).optional(),
    preview_url: nullableHttpUrl.optional(),
    live_url: nullableHttpUrl.optional(),
    payment_link: nullableHttpUrl.optional(),
    payment_status: z.enum(["not_sent", "pending", "waived"]).optional(),
    accepted_payment_methods: z.array(z.enum(paymentMethods)).max(paymentMethods.length).nullable().optional(),
    manual_payment_instructions: nullableText(4_000).optional(),
    invoice_amount: z
      .union([
        z.number().finite().nonnegative(),
        z.string().trim().refine((value) => value === "" || (Number.isFinite(Number(value)) && Number(value) >= 0), "Use a non-negative amount.").transform((value) => value === "" ? null : Number(value)),
        z.null(),
      ])
      .optional(),
    invoice_label: nullableText(200).optional(),
    next_step: nullableText(4_000).optional(),
    target_launch_date: nullableDate.optional(),
    notes: nullableText(10_000).optional(),
  })
  .strict()
  .refine((value) => Object.keys(value).length > 0, "Supply at least one project field.")

export const createClientSchema = z
  .object({
    business_name: z.string().trim().min(1).max(160),
    contact_name: z.string().trim().min(1).max(160),
    email: z.string().trim().email().max(320).transform((value) => value.toLowerCase()),
    phone: nullableText(80).optional().default(null),
    website: nullableHttpUrl.optional().default(null),
    notes: nullableText(10_000).optional().default(null),
    lead_id: z.string().uuid().nullable().optional().default(null),
    signal_id: z.string().uuid().nullable().optional().default(null),
  })
  .strict()

export const projectReceiptSchema = z
  .object({
    amount_minor: z.number().int().positive().max(Number.MAX_SAFE_INTEGER),
    currency: z.string().trim().regex(/^[A-Za-z]{3}$/).transform((value) => value.toUpperCase()),
    received_at: z.string().datetime({ offset: true }),
    payment_method: z.enum(paymentMethods),
    reference: z.string().trim().min(1).max(500),
  })
  .strict()

export const saleConfirmationSchema = z
  .object({ evidence_reference: z.string().trim().min(1).max(1_000) })
  .strict()

export const uuidSchema = z.string().uuid()

export function firstValidationError(error: z.ZodError) {
  return error.issues[0]?.message || "Invalid request."
}
