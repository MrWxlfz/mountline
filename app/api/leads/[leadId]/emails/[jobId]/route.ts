import { NextResponse } from "next/server"
import { z } from "zod"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { leadIdSchema } from "@/lib/leads/validation"
import { actOnEmailJob } from "@/lib/leads/email/server"

const bodySchema = z.object({ action: z.enum(["approve", "skip", "retry"]) }).strict()

// Approve or skip a customer check-in, or retry an email that failed.
export async function POST(request: Request, { params }: { params: Promise<{ leadId: string; jobId: string }> }) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { leadId, jobId } = await params
  if (!leadIdSchema.safeParse(leadId).success || !leadIdSchema.safeParse(jobId).success) {
    return NextResponse.json({ error: "Invalid identifier." }, { status: 400 })
  }
  const parsed = bodySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Choose approve, skip, or retry." }, { status: 400 })

  try {
    const job = await actOnEmailJob(leadId, jobId, parsed.data.action, authCheck.access.userId ?? "team")
    if (!job) return NextResponse.json({ error: "That email can’t be changed from its current state. Refresh to see the latest." }, { status: 409 })
    return NextResponse.json({ job })
  } catch {
    return NextResponse.json({ error: "The email could not be updated. Please try again." }, { status: 500 })
  }
}
