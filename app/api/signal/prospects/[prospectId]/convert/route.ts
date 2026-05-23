import { NextResponse } from "next/server"
import { z } from "zod"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { isSignalProspectSuppressed } from "@/lib/signal/alerts"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalAnalysis, SignalProspect } from "@/lib/supabase/types"

const convertSchema = z.object({
  confirm: z.literal(true),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = convertSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Explicit confirmation is required before converting a Signal prospect." },
      { status: 400 },
    )
  }

  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: prospectData, error: prospectError } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()

  if (prospectError) {
    return NextResponse.json({ error: prospectError.message }, { status: 500 })
  }
  if (!prospectData) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 })
  }

  const prospect = prospectData as SignalProspect
  if (prospect.outreach_status === "do_not_contact" || (await isSignalProspectSuppressed(prospect))) {
    return NextResponse.json(
      { error: "Do-not-contact prospects cannot be converted to a lead." },
      { status: 409 },
    )
  }
  if (!prospect.public_email) {
    return NextResponse.json(
      { error: "A public business email is required before creating an existing lead." },
      { status: 400 },
    )
  }

  const { data: analysisData } = await supabase
    .from("signal_analyses")
    .select("*")
    .eq("prospect_id", prospect.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const analysis = analysisData as SignalAnalysis | null
  const message = [
    "Created from Mountline Signal after explicit team confirmation.",
    analysis?.executive_summary ? `Signal summary: ${analysis.executive_summary}` : null,
    analysis?.recommended_primary_offer
      ? `Recommended offer: ${analysis.recommended_primary_offer}`
      : null,
    prospect.human_notes ? `Human notes: ${prospect.human_notes}` : null,
  ]
    .filter(Boolean)
    .join("\n\n")

  const { data: lead, error: leadError } = await supabase
    .from("leads")
    .insert({
      name: prospect.contact_name || prospect.business_name,
      business_name: prospect.business_name,
      email: prospect.public_email.toLowerCase(),
      phone: prospect.public_phone,
      current_website: prospect.website_url,
      service_needed: analysis?.recommended_primary_offer || "Signal prospect",
      budget_range: analysis?.potential_project_value_band,
      message,
      source: "signal",
      status: "new",
    })
    .select()
    .single()

  if (leadError) {
    return NextResponse.json({ error: leadError.message }, { status: 500 })
  }

  const { data: updatedProspect } = await supabase
    .from("signal_prospects")
    .update({ outreach_status: "interested" })
    .eq("id", prospect.id)
    .select()
    .single()

  return NextResponse.json({ lead, prospect: updatedProspect || prospect })
}
