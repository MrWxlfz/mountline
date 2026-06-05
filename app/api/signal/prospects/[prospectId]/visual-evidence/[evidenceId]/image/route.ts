import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { SIGNAL_EVIDENCE_BUCKET } from "@/lib/signal/visual-evidence"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalVisualEvidence } from "@/lib/supabase/types"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ prospectId: string; evidenceId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { prospectId, evidenceId } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_visual_evidence")
    .select("*")
    .eq("id", evidenceId)
    .eq("prospect_id", prospectId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Screenshot not found." }, { status: 404 })

  const evidence = data as SignalVisualEvidence
  if (!evidence.storage_path) {
    return NextResponse.json({ error: "Screenshot file is missing." }, { status: 404 })
  }

  const { data: signed, error: signedError } = await supabase.storage
    .from(SIGNAL_EVIDENCE_BUCKET)
    .createSignedUrl(evidence.storage_path, 60)

  if (signedError) return NextResponse.json({ error: signedError.message }, { status: 500 })

  return NextResponse.redirect(new URL(signed.signedUrl, request.url))
}
