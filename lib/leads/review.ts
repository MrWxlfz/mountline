import { leadIdSchema, leadReviewSchema, type LeadReviewStatus } from "./validation.ts"

type ReviewResult =
  | { status: 200; body: { lead: { id: string; status: LeadReviewStatus } } }
  | { status: 400 | 404 | 500; body: { error: string } }

export async function updateLeadReview(
  leadId: string,
  input: unknown,
  persist: (id: string, status: LeadReviewStatus) => Promise<{ id: string; status: string } | null>,
): Promise<ReviewResult> {
  if (!leadIdSchema.safeParse(leadId).success) return { status: 400, body: { error: "Invalid inquiry identifier." } }
  const parsed = leadReviewSchema.safeParse(input)
  if (!parsed.success) return { status: 400, body: { error: "Choose a valid inquiry review status. Sales and payment states are recorded separately." } }
  try {
    const lead = await persist(leadId, parsed.data.status)
    if (!lead) return { status: 404, body: { error: "Inquiry not found." } }
    if (lead.id !== leadId || lead.status !== parsed.data.status) throw new Error("Review update was not confirmed.")
    return { status: 200, body: { lead: { id: lead.id, status: parsed.data.status } } }
  } catch {
    return { status: 500, body: { error: "The review status could not be saved. Please try again." } }
  }
}
