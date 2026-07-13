import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { analyzeQueuedSignalProspect } from "@/lib/signal/analyze-business"
import { createAdminClient } from "@/lib/supabase/admin"

export const maxDuration = 60

export async function GET(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_prospects")
    .select("id, analysis_status, analysis_error, analysis_started_at, analysis_completed_at, verdict, pipeline_stage")
    .eq("id", prospectId)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Signal lead not found." }, { status: 404 })
  return NextResponse.json({ prospect: data })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const { prospectId } = await params

  try {
    const result = await analyzeQueuedSignalProspect(prospectId, authCheck.access.userId)
    return NextResponse.json(result)
  } catch (error) {
    console.error("[signal] Focused analysis failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Signal analysis failed." },
      { status: 500 },
    )
  }
}

