import { createAdminClient } from "@/lib/supabase/admin"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) {
    return authCheck.response
  }

  const body = await request.json()
  const { 
    project_name, client_id, package_type, status,
    start_date, target_launch_date, preview_url, notes 
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
      start_date: start_date || null,
      target_launch_date: target_launch_date || null,
      preview_url: preview_url || null,
      notes: notes || null
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
    .select("*, clients(business_name, contact_name)")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ projects: data })
}
