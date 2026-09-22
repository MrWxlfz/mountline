import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { recordInquiryEvent } from "@/lib/inquiries/service"
import { firstInquiryValidationError, inquiryEventSchema } from "@/lib/inquiries/validation"
import { uuidSchema } from "@/lib/projects/validation"

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string; inquiryId: string }> }) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const { projectId, inquiryId } = await params
  if (!uuidSchema.safeParse(projectId).success || !uuidSchema.safeParse(inquiryId).success) {
    return NextResponse.json({ error: "Invalid project or inquiry identifier." }, { status: 400 })
  }

  const parsed = inquiryEventSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: firstInquiryValidationError(parsed.error) }, { status: 400 })

  try {
    const result = await recordInquiryEvent(projectId, inquiryId, parsed.data, authCheck.access.userId)
    if (result.status === "not_found") return NextResponse.json({ error: "Inquiry not found for this project." }, { status: 404 })
    return NextResponse.json({ event: result.event, duplicate: result.status === "duplicate" }, { status: result.status === "created" ? 201 : 200 })
  } catch (error) {
    const details = error as { code?: string; message?: string }
    console.error("[mountline] Inquiry event insert failed", { code: details.code, message: details.message })
    return NextResponse.json({ error: "Inquiry event could not be recorded." }, { status: 500 })
  }
}
