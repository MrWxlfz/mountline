import { createAdminClient } from "@/lib/supabase/admin"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) {
    return authCheck.response
  }

  const body = await request.json()
  const { business_name, contact_name, email, phone, website, notes, lead_id } = body

  if (!business_name || !contact_name || !email) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("clients")
    .insert({
      business_name,
      contact_name,
      email: email.trim().toLowerCase(),
      phone: phone || null,
      website: website || null,
      notes: notes || null,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (lead_id) {
    const { error: leadError } = await supabase
      .from("leads")
      .update({ status: "converted" })
      .eq("id", lead_id)

    if (leadError) {
      console.error("[northline] Lead conversion status update failed:", leadError.message)
    }
  }

  return NextResponse.json({ client: data })
}

export async function GET() {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) {
    return authCheck.response
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("clients")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ clients: data })
}
