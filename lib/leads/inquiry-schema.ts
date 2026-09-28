import { z } from "zod"
import { safeBusinessWebsite } from "./validation.ts"

/**
 * The public project inquiry: one short form for websites, Capture, and the receptionist.
 * The same schema runs in the browser (for field messages) and on the server (for the record).
 */

export const inquiryInterests = ["website", "receptionist", "capture", "not_sure"] as const
export type InquiryInterest = typeof inquiryInterests[number]

export const inquiryInterestLabels: Record<InquiryInterest, string> = {
  website: "Website",
  receptionist: "AI receptionist",
  capture: "Photo and video",
  not_sure: "Not sure yet",
}

export const MESSAGE_MAX = 3000
// Links are the usual payload of form spam; a real project note rarely needs more than a couple.
const MAX_LINKS = 3
const MIN_FILL_MS = 1500

const optionalText = (max: number) => z.string().trim().max(max).optional().default("")

export const inquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100, "Keep the name under 100 characters."),
  business_name: z.string().trim().min(2, "Enter the business name.").max(140, "Keep the business name under 140 characters."),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: optionalText(40).refine((value) => !value || /^[\d\s()+.\-x]{7,40}$/i.test(value), "Enter a phone number, or leave it blank."),
  interests: z
    .array(z.enum(inquiryInterests))
    .min(1, "Choose at least one.")
    .max(inquiryInterests.length)
    .transform((values) => inquiryInterests.filter((interest) => values.includes(interest))),
  message: z
    .string()
    .trim()
    .min(10, "Add a sentence or two about the business and what you’d like help with.")
    .max(MESSAGE_MAX, `Keep the message under ${MESSAGE_MAX.toLocaleString("en-US")} characters.`)
    .refine((value) => (value.match(/https?:\/\/|www\./gi) || []).length <= MAX_LINKS, "Please include no more than three links."),
  current_website: optionalText(300).refine((value) => !value || safeBusinessWebsite(value) !== null, "Enter a website address like example.com, or leave it blank."),
  // Bot checks. Neither is shown to people.
  website_confirmation: z.string().max(200).optional().default(""),
  started_at: z.coerce.number().int().nonnegative().optional(),
  submission_key: z.string().uuid(),
}).strict()

export type InquiryInput = z.input<typeof inquirySchema>
export type InquiryValues = z.output<typeof inquirySchema>
export type InquiryField = "name" | "business_name" | "email" | "phone" | "interests" | "message" | "current_website"
export type InquiryFieldErrors = Partial<Record<InquiryField, string>>

export function fieldErrorsFrom(error: z.ZodError): InquiryFieldErrors {
  const errors: InquiryFieldErrors = {}
  for (const issue of error.issues) {
    const field = issue.path[0] as InquiryField
    if (field && !errors[field]) errors[field] = issue.message
  }
  return errors
}

export function looksAutomated(values: Pick<InquiryValues, "website_confirmation" | "started_at">, now: number) {
  if (values.website_confirmation) return true
  // A missing timestamp is allowed (older cached pages); an implausibly fast one is not.
  if (values.started_at && now - values.started_at < MIN_FILL_MS) return true
  return false
}

export function describeInterests(interests: readonly string[]) {
  const labels = interests
    .filter((value): value is InquiryInterest => (inquiryInterests as readonly string[]).includes(value))
    .map((value) => inquiryInterestLabels[value])
  return labels.length ? labels.join(", ") : "Not specified"
}
