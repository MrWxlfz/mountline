import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createClientSchema, firstValidationError } from "@/lib/projects/validation"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = createClientSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: firstValidationError(parsed.error) }, { status: 400 })

  const { lead_id, signal_id, ...clientInput } = parsed.data
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("clients").insert(clientInput).select().single()
  if (error) {
    console.error("[mountline] Client creation failed", { code: error.code, message: error.message })
    return NextResponse.json({ error: "Client record could not be created." }, { status: 500 })
  }

  // Linking operational records must not infer an accepted sale or payment.
  if (signal_id) {
    const { error: signalError } = await supabase.from("signal_prospects").update({ converted_client_id: data.id }).eq("id", signal_id)
    if (signalError) console.error("[mountline] Signal/client linkage failed", { code: signalError.code, message: signalError.message })

    const { error: activityError } = await supabase.from("signal_lead_activities").insert({
      prospect_id: signal_id,
      activity_type: "client_created",
      summary: `Client record created for ${clientInput.business_name}.`,
      metadata: { client_id: data.id, legacy_lead_id: lead_id },
      created_by: authCheck.access.userId,
    })
    if (activityError) console.error("[mountline] Client activity log failed", { code: activityError.code, message: activityError.message })
  }

  return NextResponse.json({ client: data }, { status: 201 })
}

export async function GET() {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const supabase = createAdminClient()
  const { data, error } = await supabase.from("clients").select("*").order("created_at", { ascending: false })
  if (error) {
    console.error("[mountline] Client list failed", { code: error.code, message: error.message })
    return NextResponse.json({ error: "Clients could not be loaded." }, { status: 500 })
  }
  return NextResponse.json({ clients: data })
}
