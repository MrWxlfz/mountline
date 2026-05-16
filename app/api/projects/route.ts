import { createAdminClient } from "@/lib/supabase/admin"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { NextResponse } from "next/server"

function makePortalId(projectName: string) {
  const slug =
    projectName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 40) || "project"

  return `${slug}-${crypto.randomUUID().slice(0, 8)}`
}

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) {
    return authCheck.response
  }

  const body = await request.json()
  const { 
    project_name, client_id, package_type, status,
    start_date, target_launch_date, live_url, preview_url,
    payment_link, next_step, notes
  } = body

  if (!project_name) {
    return NextResponse.json({ error: "Project name is required" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("projects")
    .insert({ 
      project_name, 
      client_id: client_id || null, 
      package_type: package_type || null, 
      status: status || "discovery",
      portal_id: makePortalId(project_name),
      start_date: start_date || null,
      target_launch_date: target_launch_date || null,
      live_url: live_url || null,
      preview_url: preview_url || null,
      payment_link: payment_link || null,
      next_step: next_step || null,
      notes: notes || null
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (client_id) {
    const { data: client } = await supabase
      .from("clients")
      .select("email")
      .eq("id", client_id)
      .maybeSingle()

    if (client?.email) {
      await supabase
        .from("client_portal_access")
        .upsert(
          {
            project_id: data.id,
            client_email: client.email.trim().toLowerCase(),
            access_status: "active",
          },
          { onConflict: "project_id,client_email" },
        )
    }
  }

  return NextResponse.json({ project: data })
}

export async function GET() {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) {
    return authCheck.response
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("projects")
    .select("*, clients(business_name, contact_name, email)")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ projects: data })
}
