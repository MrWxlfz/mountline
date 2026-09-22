import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import { uuidSchema } from "@/lib/projects/validation"

const allowedAccessStatuses = new Set(["invited", "active", "revoked"])

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string; accessId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) {
    return authCheck.response
  }

  const { projectId, accessId } = await params
  if (!uuidSchema.safeParse(projectId).success || !uuidSchema.safeParse(accessId).success) return NextResponse.json({ error: "Invalid portal access identifier." }, { status: 400 })
  const body = await request.json().catch(() => null)
  const accessStatus = body && typeof body.access_status === "string" ? body.access_status : ""

  if (!allowedAccessStatuses.has(accessStatus)) {
    return NextResponse.json({ error: "Invalid portal access status" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("client_portal_access")
    .update({ access_status: accessStatus })
    .eq("id", accessId)
    .eq("project_id", projectId)
    .select("id, created_at, project_id, client_email, clerk_user_id, access_status")
    .maybeSingle()

  if (error) {
    console.error("[mountline] Portal assignment update failed", { code: error.code, message: error.message })
    return NextResponse.json({ error: "Portal access could not be updated." }, { status: 500 })
  }

  if (!data) return NextResponse.json({ error: "Portal access record not found." }, { status: 404 })

  return NextResponse.json({ access: data })
}
