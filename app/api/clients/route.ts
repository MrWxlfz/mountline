import { createAdminClient } from "@/lib/supabase/admin"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) {
    return authCheck.response
  }

  const body = await request.json()
  const { business_name, contact_name, email, phone, website, notes, lead_id, signal_id } = body

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
      console.error("[mountline] Lead conversion status update failed:", leadError.message)
    }
  }

  if (signal_id) {
    const { data: signalProspect } = await supabase
      .from("signal_prospects")
      .select("pipeline_stage")
      .eq("id", signal_id)
      .maybeSingle()
    const { error: signalError } = await supabase
      .from("signal_prospects")
      .update({
        converted_client_id: data.id,
        pipeline_stage: "interested",
        outreach_status: "interested",
        next_action: "Create and scope the first client project.",
      })
      .eq("id", signal_id)
    if (signalError) {
      console.error("[mountline] Signal client conversion update failed:", signalError.message)
    } else {
      await supabase.from("signal_lead_stage_history").insert({
        prospect_id: signal_id,
        from_stage: signalProspect?.pipeline_stage || "analyzed",
        to_stage: "interested",
        reason: "Client record created from the Signal workspace.",
        created_by: authCheck.access.userId,
      })
      await supabase.from("signal_lead_activities").insert({
        prospect_id: signal_id,
        activity_type: "client_created",
        summary: `Client record created for ${business_name}.`,
        metadata: { client_id: data.id },
        created_by: authCheck.access.userId,
      })
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
