import { z } from "zod"

export const pilotIndustries = ["HVAC", "Plumbing", "Electrical", "Cleaning", "Roofing", "Other service business"] as const

export const pilotRequestSchema = z.object({
  name: z.string().trim().min(2, "Enter your name.").max(100),
  business_name: z.string().trim().min(2, "Enter the business name.").max(140),
  email: z.string().trim().email("Enter a valid email address.").max(254),
  phone: z.string().trim().max(40).optional().default(""),
  industry: z.enum(pilotIndustries, { errorMap: () => ({ message: "Choose your type of business." }) }),
  call_handling: z.string().trim().min(10, "Add a short note about the calls you need help with.").max(2000),
  website_confirmation: z.string().max(200).optional().default(""),
}).strict()

export type PilotRequestInput = z.input<typeof pilotRequestSchema>
export type PilotFieldErrors = Partial<Record<keyof PilotRequestInput, string>>

// Review states concern Mountline's response to an inquiry, never a sale or payment.
export const leadReviewStatuses = ["new", "reviewed", "contacted", "qualified", "closed"] as const
export type LeadReviewStatus = typeof leadReviewStatuses[number]
export const leadReviewLabels: Record<LeadReviewStatus, string> = {
  new: "New",
  reviewed: "Reviewed",
  contacted: "Contacted",
  qualified: "Qualified for a conversation",
  closed: "Closed — no follow-up",
}
export const leadReviewSchema = z.object({ status: z.enum(leadReviewStatuses) }).strict()
export const leadIdSchema = z.string().uuid()

export function safeBusinessWebsite(value: string | null) {
  if (!value?.trim()) return null
  try {
    const url = new URL(/^https?:\/\//i.test(value) ? value : `https://${value}`)
    if (!["https:", "http:"].includes(url.protocol) || !url.hostname.includes(".") || url.username || url.password) return null
    return url.toString()
  } catch {
    return null
  }
}
