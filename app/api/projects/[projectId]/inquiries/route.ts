import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createProjectInquiry, listProjectInquiries } from "@/lib/inquiries/service"
import { createInquirySchema, firstInquiryValidationError } from "@/lib/inquiries/validation"
import { uuidSchema } from "@/lib/projects/validation"

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const { projectId } = await params
  if (!uuidSchema.safeParse(projectId).success) return NextResponse.json({ error: "Invalid project identifier." }, { status: 400 })

  try {
    return NextResponse.json({ inquiries: await listProjectInquiries(projectId) })
  } catch (error) {
    console.error("[mountline] Inquiry list failed", error instanceof Error ? error.message : "Unknown database error")
    return NextResponse.json({ error: "Inquiries could not be loaded." }, { status: 500 })
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const { projectId } = await params
  if (!uuidSchema.safeParse(projectId).success) return NextResponse.json({ error: "Invalid project identifier." }, { status: 400 })

  const parsed = createInquirySchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: firstInquiryValidationError(parsed.error) }, { status: 400 })
  try {
    const inquiry = await createProjectInquiry(projectId, parsed.data, authCheck.access.userId)
    if (!inquiry) return NextResponse.json({ error: "Inquiry capture could not be confirmed." }, { status: 500 })
    return NextResponse.json({ inquiry }, { status: 201 })
  } catch (error) {
    const details = error as { code?: string; message?: string }
    console.error("[mountline] Inquiry capture failed", { code: details.code, message: details.message })
    if (details.code === "23503") return NextResponse.json({ error: "Project not found." }, { status: 404 })
    return NextResponse.json({ error: "Inquiry could not be recorded. Retry with the same form." }, { status: 500 })
  }
}
