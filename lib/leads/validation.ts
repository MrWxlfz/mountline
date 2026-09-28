import { z } from "zod"

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
