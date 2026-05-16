import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"

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
  const body = await request.json()
  const accessStatus = typeof body.access_status === "string" ? body.access_status : ""

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
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ access: data })
}
