import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { captureSignalHomepageScreenshot } from "@/lib/signal/screenshot"
import { SIGNAL_EVIDENCE_BUCKET } from "@/lib/signal/visual-evidence"
import { signalScreenshotTypeSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect, SignalVisualEvidence } from "@/lib/supabase/types"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => ({}))
  const screenshotType = signalScreenshotTypeSchema.safeParse(body.screenshot_type || "desktop")
  if (!screenshotType.success) {
    return NextResponse.json({ error: "Choose desktop or mobile screenshot type." }, { status: 400 })
  }

  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: prospectData, error: prospectError } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()

  if (prospectError) return NextResponse.json({ error: prospectError.message }, { status: 500 })
  if (!prospectData) return NextResponse.json({ error: "Prospect not found." }, { status: 404 })

  const prospect = prospectData as SignalProspect
  const result = await captureSignalHomepageScreenshot({
    prospect,
    screenshotType: screenshotType.data,
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.setup_message,
        provider: result.provider,
        manual_available: true,
      },
      { status: result.provider === "browserless" ? 502 : 409 },
    )
  }

  const { data: existingRows } = await supabase
    .from("signal_visual_evidence")
    .select("*")
    .eq("prospect_id", prospectId)
    .eq("screenshot_type", screenshotType.data)

  const existing = (existingRows || []) as SignalVisualEvidence[]
  for (const row of existing) {
    if (row.storage_path) {
      await supabase.storage.from(SIGNAL_EVIDENCE_BUCKET).remove([row.storage_path])
    }
  }
  if (existing.length > 0) {
    await supabase
      .from("signal_visual_evidence")
      .delete()
      .eq("prospect_id", prospectId)
      .eq("screenshot_type", screenshotType.data)
  }

  const path = `prospects/${prospectId}/${screenshotType.data}-browserless-${Date.now()}.${result.extension}`
  const { error: uploadError } = await supabase.storage
    .from(SIGNAL_EVIDENCE_BUCKET)
    .upload(path, result.bytes, {
      contentType: result.mime_type,
      upsert: false,
    })

  if (uploadError) {
    return NextResponse.json(
      {
        error: uploadError.message,
        setup_needed: "Create a private Supabase Storage bucket named signal-evidence.",
      },
      { status: 500 },
    )
  }

  const { data, error } = await supabase
    .from("signal_visual_evidence")
    .insert({
      prospect_id: prospectId,
      screenshot_type: screenshotType.data,
      storage_path: path,
      mime_type: result.mime_type,
      file_size_bytes: result.bytes.byteLength,
      model_provider: result.provider,
      model_name: "browserless-homepage-capture",
      confidence: "medium",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    evidence: data,
    final_url: result.final_url,
  })
}
