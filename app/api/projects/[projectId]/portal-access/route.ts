import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"

const allowedAccessStatuses = new Set(["invited", "active", "revoked"])

export async function POST(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) {
    return authCheck.response
  }

  const { projectId } = await params
  const body = await request.json()
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : ""
  const accessStatus =
    typeof body.access_status === "string" && allowedAccessStatuses.has(body.access_status)
      ? body.access_status
      : "invited"

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "A valid client email is required" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("client_portal_access")
    .upsert(
      {
        project_id: projectId,
        client_email: email,
        access_status: accessStatus,
      },
      { onConflict: "project_id,client_email" },
    )
    .select("id, created_at, project_id, client_email, clerk_user_id, access_status")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ access: data })
}
