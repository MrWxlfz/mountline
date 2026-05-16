import { createClient } from "@/lib/supabase/server"
import { auth } from "@clerk/nextjs/server"
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

  const supabase = await createClient()

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

  // Check if the user has portal access (or is admin via dashboard)
  const { data: access } = await supabase
    .from("client_portal_access")
    .select("id")
    .eq("project_id", project.id)
    .eq("clerk_user_id", userId)
    .eq("access_status", "active")
    .maybeSingle()

  // For now, allow any authenticated user (admin can always view)
  // In production, you'd restrict to only users with portal access
  
  return NextResponse.json({
    project: {
      ...project,
      client: project.clients
    }
  })
}
