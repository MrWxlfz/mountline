import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { firstValidationError, patchProjectSchema, uuidSchema } from "@/lib/projects/validation"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(request: Request, { params }: { params: Promise<{ projectId: string }> }) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { projectId } = await params
  if (!uuidSchema.safeParse(projectId).success) return NextResponse.json({ error: "Invalid project identifier." }, { status: 400 })

  const body = await request.json().catch(() => null)
  const parsed = patchProjectSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: firstValidationError(parsed.error) }, { status: 400 })

  const supabase = createAdminClient()
  const { data, error } = await supabase.from("projects").update(parsed.data).eq("id", projectId).select().maybeSingle()
  if (error) {
    console.error("[mountline] Project update failed", { code: error.code, message: error.message })
    return NextResponse.json({ error: "Project changes could not be saved." }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: "Project not found." }, { status: 404 })
  return NextResponse.json({ project: data })
}
