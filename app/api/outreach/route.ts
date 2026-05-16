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
    business_name, website, industry, city, state, 
    source, website_quality_notes, estimated_needs, notes 
  } = body

  if (!business_name) {
    return NextResponse.json({ error: "Business name is required" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("potential_clients")
    .insert({ 
      business_name, website, industry, city, state,
      source, website_quality_notes, estimated_needs, notes 
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ prospect: data })
}

export async function GET() {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) {
    return authCheck.response
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("potential_clients")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ prospects: data })
}
