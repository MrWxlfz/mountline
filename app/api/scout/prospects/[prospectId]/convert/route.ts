import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { queueSignalBusinessAnalysis } from "@/lib/signal/analyze-business"
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
  if (prospectError) return NextResponse.json({ error: prospectError.message }, { status: 500 })
  if (!prospect) return NextResponse.json({ error: "Scout suggestion not found." }, { status: 404 })

  const businessInput = [
    prospect.business_name,
    [prospect.city, prospect.state].filter(Boolean).join(", "),
    prospect.website,
    prospect.phone,
  ].filter(Boolean).join(" — ")
  const observation = [
    prospect.ai_summary ? `Scout summary: ${prospect.ai_summary}` : null,
    prospect.outreach_angle ? `Scout suggested angle: ${prospect.outreach_angle}` : null,
    prospect.notes ? `Scout note: ${prospect.notes}` : null,
  ].filter(Boolean).join("\n\n")

  try {
    const queued = await queueSignalBusinessAnalysis({
      businessInput,
      observation: observation || null,
      createdBy: authCheck.access.userId,
      source: "scout_suggestion",
    })
    const { data: updatedProspect } = await supabase
      .from("scout_prospects")
      .update({ outreach_status: "lead_created" })
      .eq("id", prospectId)
      .select()
      .single()
    return NextResponse.json({
      prospect: updatedProspect || prospect,
      signal_prospect: queued.prospect,
      workspace_url: `/dashboard/signal/${queued.prospect.id}`,
    })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Suggestion could not be opened in Signal." },
      { status: 500 },
    )
  }
}
