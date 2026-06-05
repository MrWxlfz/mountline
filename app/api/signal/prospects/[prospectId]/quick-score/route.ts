import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { runSignalQuickScore } from "@/lib/signal/quick-score"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect } from "@/lib/supabase/types"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: prospectData, error } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!prospectData) {
    return NextResponse.json({ error: "Prospect not found." }, { status: 404 })
  }

  const prospect = prospectData as SignalProspect
  if (!prospect.website_url) {
    return NextResponse.json(
      { error: "Save a confirmed official website before running Quick Score Website." },
      { status: 400 },
    )
  }

  const result = await runSignalQuickScore(prospect)

  return NextResponse.json({
    analysis: result.analysis,
    prospect: result.prospect,
    scan: result.scan,
    stages: result.stages,
    ai_unavailable: result.ai_unavailable,
    visual_unavailable_message: result.visual_unavailable_message,
  })
}
