import { createAdminClient } from "@/lib/supabase/admin"
import { auth, currentUser } from "@clerk/nextjs/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ portalId: string }> }
) {
  const { portalId } = await params
  const { userId } = await auth()

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await currentUser()
  const email = user?.emailAddresses?.[0]?.emailAddress

  if (!email) {
    return NextResponse.json({ error: "No email found" }, { status: 403 })
  }

  const supabase = createAdminClient()

  // Fetch the project by portal_id
  const { data: project, error: projectError } = await supabase
    .from("projects")
    .select(`
      id,
      project_name,
      package_type,
      status,
      start_date,
      target_launch_date,
      live_url,
      preview_url,
      notes,
      clients (
        business_name,
        contact_name
      )
    `)
    .eq("portal_id", portalId)
    .single()

  if (projectError || !project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  // Check access: either a team member OR has portal access for this project
  const { data: teamMember } = await supabase
    .from("team_members")
    .select("id")
    .eq("email", email)
    .eq("status", "active")
    .maybeSingle()

  if (!teamMember) {
    // Not a team member - check portal access by email
    const { data: portalAccess } = await supabase
      .from("client_portal_access")
      .select("id")
      .eq("project_id", project.id)
      .eq("client_email", email)
      .eq("access_status", "active")
      .maybeSingle()

    if (!portalAccess) {
      return NextResponse.json(
        { error: "You do not have access to this project portal." },
        { status: 403 }
      )
    }
  }

  return NextResponse.json({
    project: {
      ...project,
      client: project.clients,
    },
  })
}
