import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { scanSignalWebsite } from "@/lib/signal/website"
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
  const { data: prospect, error: prospectError } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()

  if (prospectError) {
    return NextResponse.json({ error: prospectError.message }, { status: 500 })
  }
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 })
  }

  const scan = await scanSignalWebsite((prospect as SignalProspect).website_url)

  const { data: analysis, error: analysisError } = await supabase
    .from("signal_analyses")
    .insert({
      prospect_id: prospectId,
      analysis_type: "initial",
      model_provider: "scanner",
      model_name: "deterministic-website-scan",
      scanned_urls: scan.scanned_urls,
      website_signals: scan,
      evidence: scan.evidence,
      confidence: scan.broken_response ? "low" : "medium",
      red_flags: scan.broken_response && scan.error ? [scan.error] : [],
      executive_summary: scan.broken_response
        ? `Website scan could not read the public homepage: ${scan.error || "unknown issue"}.`
        : `Website scan read ${scan.scanned_urls.length} public page${scan.scanned_urls.length === 1 ? "" : "s"} and found ${scan.evidence.length} evidence signal${scan.evidence.length === 1 ? "" : "s"}.`,
    })
    .select()
    .single()

  if (analysisError) {
    return NextResponse.json({ error: analysisError.message }, { status: 500 })
  }

  const update: Record<string, string> = {}
  if (scan.detected_website_platform && !(prospect as SignalProspect).existing_website_platform) {
    update.existing_website_platform = scan.detected_website_platform
  }
  if (scan.detected_booking_platform && !(prospect as SignalProspect).existing_booking_platform) {
    update.existing_booking_platform = scan.detected_booking_platform
  }

  if (Object.keys(update).length > 0) {
    await supabase.from("signal_prospects").update(update).eq("id", prospectId)
  }

  return NextResponse.json({ scan, analysis })
}
