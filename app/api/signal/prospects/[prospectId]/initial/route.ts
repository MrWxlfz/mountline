import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { runAndStoreInitialSignalAnalysis } from "@/lib/signal/analysis"
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
  const result = await runAndStoreInitialSignalAnalysis({ prospect })

  return NextResponse.json({
    analysis: result.analysis,
    scan: result.scan,
    alert: result.alert,
    prospect: result.prospect,
    ai_unavailable: result.ai_unavailable,
  })
}
