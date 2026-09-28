import { NextResponse } from "next/server"
import { z } from "zod"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { leadIdSchema } from "@/lib/leads/validation"
import { updateFollowup } from "@/lib/leads/email/server"

const bodySchema = z.object({ action: z.enum(["pause", "resume", "mark_replied"]) }).strict()

// Pause or resume an inquiry's follow-ups, or record that the customer replied.
export async function PATCH(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { leadId } = await params
  if (!leadIdSchema.safeParse(leadId).success) return NextResponse.json({ error: "Invalid inquiry identifier." }, { status: 400 })
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Choose pause, resume, or mark_replied." }, { status: 400 })

  try {
    const lead = await updateFollowup(leadId, parsed.data.action)
    if (!lead) return NextResponse.json({ error: "Inquiry not found." }, { status: 404 })
    return NextResponse.json({ lead })
  } catch {
    return NextResponse.json({ error: "The follow-up setting could not be saved. Please try again." }, { status: 500 })
  }
}
