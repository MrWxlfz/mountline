import { z } from "zod"

export const weekDays = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const
export const intakeFields = ["caller_name", "callback_number", "service_location", "issue", "preferred_time"] as const

const shortText = z.string().trim().min(1).max(300)
const instruction = z.string().trim().min(1).max(1200)
const clockTime = z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, "Use a 24-hour time such as 08:00")
const dailyHours = z.object({ opens: clockTime, closes: clockTime }).strict().refine(
  ({ opens, closes }) => opens < closes,
  "Closing time must be later than opening time; overnight schedules are not supported",
).nullable()

export const receptionistProfileSchema = z.object({
  version: z.literal(1),
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(80),
  mode: z.enum(["demo", "customer"]),
  business: z.object({
    name: shortText,
    timezone: shortText.refine((value) => {
      try {
        new Intl.DateTimeFormat("en-US", { timeZone: value }).format()
        return true
      } catch {
        return false
      }
    }, "Use a valid IANA timezone such as America/Chicago"),
    serviceArea: z.array(shortText).min(1).max(40),
    services: z.array(shortText).min(1).max(30),
    // null means unverified hours; a null day within a verified week means closed.
    hours: z.object({
      monday: dailyHours,
      tuesday: dailyHours,
      wednesday: dailyHours,
      thursday: dailyHours,
      friday: dailyHours,
      saturday: dailyHours,
      sunday: dailyHours,
    }).strict().nullable(),
  }).strict(),
  faqs: z.array(z.object({ question: shortText, answer: instruction }).strict()).max(30),
  pricing: z.object({ policy: instruction }).strict(),
  intake: z.object({
    fields: z.array(z.enum(intakeFields)).min(4).max(5).superRefine((fields, context) => {
      if (new Set(fields).size !== fields.length) {
        context.addIssue({ code: z.ZodIssueCode.custom, message: "Intake fields must not repeat" })
      }
      for (const field of intakeFields.slice(0, 4)) {
        if (!fields.includes(field)) {
          context.addIssue({ code: z.ZodIssueCode.custom, message: `Include ${field} for a usable callback request` })
        }
      }
    }),
  }).strict(),
  appointments: z.object({
    mode: z.literal("request_only"),
    instructions: instruction,
  }).strict(),
  escalation: z.object({
    urgentIssues: z.array(shortText).min(1).max(15),
    instructions: instruction,
  }).strict(),
  // Capability flags are deliberately literals: a profile cannot enable an integration.
  capabilities: z.object({
    booking: z.literal(false),
    sms: z.literal(false),
    liveTransfer: z.literal(false),
  }).strict(),
}).strict()

export type ReceptionistProfile = z.infer<typeof receptionistProfileSchema>

export type ProfileValidation =
  | { success: true; profile: ReceptionistProfile }
  | { success: false; errors: string[] }

export function validateReceptionistProfile(value: unknown): ProfileValidation {
  const result = receptionistProfileSchema.safeParse(value)
  if (result.success) return { success: true, profile: result.data }
  return {
    success: false,
    errors: result.error.issues.map((issue) => `${issue.path.join(".") || "profile"}: ${issue.message}`),
  }
}

export function parseReceptionistProfile(source: string): ProfileValidation {
  let value: unknown
  try {
    value = JSON.parse(source)
  } catch {
    return { success: false, errors: ["The profile must be valid JSON. Check commas, quotes, and brackets."] }
  }
  return validateReceptionistProfile(value)
}
