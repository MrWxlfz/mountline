import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { firstValidationError, projectReceiptSchema, uuidSchema } from "@/lib/projects/validation"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(_request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const { projectId } = await params
  if (!uuidSchema.safeParse(projectId).success) return NextResponse.json({ error: "Invalid project identifier." }, { status: 400 })

  const { data, error } = await createAdminClient().from("project_receipts").select("id, created_at, amount_minor, currency, received_at, payment_method, reference, recorded_by").eq("project_id", projectId).order("received_at", { ascending: false })
  if (error) {
    console.error("[mountline] Receipt list failed", { code: error.code, message: error.message })
    return NextResponse.json({ error: "Receipts could not be loaded." }, { status: 500 })
  }
  return NextResponse.json({ receipts: data })
}

export async function POST(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const { projectId } = await params
  if (!uuidSchema.safeParse(projectId).success) return NextResponse.json({ error: "Invalid project identifier." }, { status: 400 })

  const body = await request.json().catch(() => null)
  const parsed = projectReceiptSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: firstValidationError(parsed.error) }, { status: 400 })

  const supabase = createAdminClient()
  const { data: project, error: projectError } = await supabase.from("projects").select("id").eq("id", projectId).maybeSingle()
  if (projectError) {
    console.error("[mountline] Receipt project lookup failed", { code: projectError.code, message: projectError.message })
    return NextResponse.json({ error: "Receipt could not be recorded." }, { status: 500 })
  }
  if (!project) return NextResponse.json({ error: "Project not found." }, { status: 404 })

  const { data, error } = await supabase.from("project_receipts").insert({
    ...parsed.data,
    project_id: projectId,
    recorded_by: authCheck.access.userId,
  }).select("id, created_at, amount_minor, currency, received_at, payment_method, reference, recorded_by").single()
  if (error) {
    console.error("[mountline] Receipt insert failed", { code: error.code, message: error.message })
    const status = error.code === "23505" ? 409 : 500
    const message = status === 409 ? "A receipt with this reference is already recorded for the project." : "Receipt could not be recorded."
    return NextResponse.json({ error: message }, { status })
  }
  return NextResponse.json({ receipt: data }, { status: 201 })
}
