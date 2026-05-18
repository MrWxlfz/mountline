import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { prospectId } = await params
  const supabase = createAdminClient()

  const { data: prospect, error: prospectError } = await supabase
    .from("scout_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()

  if (prospectError) {
    return NextResponse.json({ error: prospectError.message }, { status: 500 })
  }

  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 })
  }

  if (!prospect.email) {
    return NextResponse.json(
      { error: "A public business email is required before creating a lead." },
      { status: 400 },
    )
  }

  const message = [
    prospect.ai_summary ? `Scout summary: ${prospect.ai_summary}` : null,
    prospect.outreach_angle ? `Suggested angle: ${prospect.outreach_angle}` : null,
    prospect.notes ? `Notes: ${prospect.notes}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      name: prospect.business_name,
      business_name: prospect.business_name,
      email: prospect.email.toLowerCase(),
      phone: prospect.phone,
      current_website: prospect.website,
      service_needed: prospect.estimated_project_fit
        ? `Scout fit: ${prospect.estimated_project_fit}`
        : "Scout prospect",
      message: message || "Created from Mountline Scout.",
      source: "scout",
      status: "new",
    })
    .select()
    .single()

  if (leadError) {
    return NextResponse.json({ error: leadError.message }, { status: 500 })
  }

  const { data: updatedProspect, error: updateError } = await supabase
    .from("scout_prospects")
    .update({ outreach_status: "lead_created" })
    .eq("id", prospectId)
    .select()
    .single()

  if (updateError) {
    console.error("[scout] Prospect conversion status update failed:", updateError.message)
  }

  return NextResponse.json({ lead, prospect: updatedProspect || prospect })
}
