import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ScoutProspect } from "@/lib/supabase/types"
import { maybeCreateScoutAlert } from "@/lib/scout/alerts"
import { scoreScoutProspect } from "@/lib/scout/scoring"

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

  const score = await scoreScoutProspect(prospect as ScoutProspect)
  const { data: updatedProspect, error: updateError } = await supabase
    .from("scout_prospects")
    .update({
      website_score: score.website_score,
      opportunity_score: score.opportunity_score,
      estimated_project_fit: score.estimated_project_fit,
      reasons: score.reasons,
      website_notes: score.website_notes,
      ai_summary: score.ai_summary,
      outreach_angle: score.outreach_angle,
      red_flags: score.red_flags,
      last_checked_at: new Date().toISOString(),
    })
    .eq("id", prospectId)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  const alert = await maybeCreateScoutAlert(updatedProspect as ScoutProspect, score)

  return NextResponse.json({ prospect: updatedProspect, alert })
}
