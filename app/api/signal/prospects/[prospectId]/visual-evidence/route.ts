import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import {
  SIGNAL_EVIDENCE_BUCKET,
  runSignalVisualAnalysis,
  validateSignalScreenshotFile,
} from "@/lib/signal/visual-evidence"
import { signalScreenshotTypeSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect, SignalVisualEvidence } from "@/lib/supabase/types"

async function getProspectOrResponse(supabase: ReturnType<typeof createAdminClient>, prospectId: string) {
  const { data, error } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()

  if (error) return { response: NextResponse.json({ error: error.message }, { status: 500 }) }
  if (!data) return { response: NextResponse.json({ error: "Prospect not found" }, { status: 404 }) }
  return { prospect: data as SignalProspect }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { prospectId } = await params
  const supabase = createAdminClient()
  const prospectResult = await getProspectOrResponse(supabase, prospectId)
  if (prospectResult.response) return prospectResult.response

  const formData = await request.formData().catch(() => null)
  if (!formData) {
    return NextResponse.json({ error: "Invalid screenshot upload." }, { status: 400 })
  }

  const screenshotType = signalScreenshotTypeSchema.safeParse(formData.get("screenshot_type"))
  if (!screenshotType.success) {
    return NextResponse.json({ error: "Choose desktop or mobile screenshot type." }, { status: 400 })
  }

  const file = formData.get("file")
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Screenshot file is required." }, { status: 400 })
  }

  const validated = validateSignalScreenshotFile(file)
  if (!validated.ok) {
    return NextResponse.json({ error: validated.error }, { status: 400 })
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

  const path = `prospects/${prospectId}/${screenshotType.data}-${Date.now()}.${validated.extension}`
  const bytes = await file.arrayBuffer()
  const { error: uploadError } = await supabase.storage
    .from(SIGNAL_EVIDENCE_BUCKET)
    .upload(path, bytes, {
      contentType: validated.mimeType,
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
      mime_type: validated.mimeType,
      file_size_bytes: validated.size,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ evidence: data })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { prospectId } = await params
  const supabase = createAdminClient()
  const prospectResult = await getProspectOrResponse(supabase, prospectId)
  if (prospectResult.response) return prospectResult.response
  const prospect = prospectResult.prospect

  const { data: rows, error } = await supabase
    .from("signal_visual_evidence")
    .select("*")
    .eq("prospect_id", prospectId)
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const evidence = (rows || []) as SignalVisualEvidence[]
  if (evidence.length === 0) {
    return NextResponse.json({ error: "Upload a desktop or mobile screenshot first." }, { status: 400 })
  }

  const images: Array<{ mimeType: string; base64: string }> = []
  for (const item of evidence) {
    if (!item.storage_path || !item.mime_type) continue
    const { data: blob, error: downloadError } = await supabase.storage
      .from(SIGNAL_EVIDENCE_BUCKET)
      .download(item.storage_path)
    if (downloadError) return NextResponse.json({ error: downloadError.message }, { status: 500 })
    const buffer = Buffer.from(await blob.arrayBuffer())
    images.push({
      mimeType: item.mime_type,
      base64: buffer.toString("base64"),
    })
  }

  if (images.length === 0) {
    return NextResponse.json({ error: "No readable screenshot files were found." }, { status: 400 })
  }

  const result = await runSignalVisualAnalysis({
    evidence,
    images,
    prospect,
  })

  if (!result) {
    return NextResponse.json(
      {
        error: "Visual analysis requires SIGNAL_AI_PROVIDER=gemini and GEMINI_API_KEY.",
        ai_unavailable: true,
      },
      { status: 409 },
    )
  }

  const analyzedAt = new Date().toISOString()
  const { data: updated, error: updateError } = await supabase
    .from("signal_visual_evidence")
    .update({
      model_provider: result.provider,
      model_name: result.model,
      analysis: result.output,
      confidence: result.output.confidence,
      analyzed_at: analyzedAt,
    })
    .eq("prospect_id", prospectId)
    .select()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  return NextResponse.json({
    evidence: updated,
    analysis: result.output,
    provider: result.provider,
    model: result.model,
  })
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { prospectId } = await params
  const supabase = createAdminClient()
  const prospectResult = await getProspectOrResponse(supabase, prospectId)
  if (prospectResult.response) return prospectResult.response

  const body = await request.json().catch(() => ({}))
  const evidenceId = typeof body.evidence_id === "string" ? body.evidence_id : null
  if (!evidenceId) {
    return NextResponse.json({ error: "Evidence ID is required." }, { status: 400 })
  }

  const { data: row, error } = await supabase
    .from("signal_visual_evidence")
    .select("*")
    .eq("id", evidenceId)
    .eq("prospect_id", prospectId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!row) return NextResponse.json({ error: "Screenshot not found." }, { status: 404 })

  const evidence = row as SignalVisualEvidence
  if (evidence.storage_path) {
    await supabase.storage.from(SIGNAL_EVIDENCE_BUCKET).remove([evidence.storage_path])
  }

  const { error: deleteError } = await supabase
    .from("signal_visual_evidence")
    .delete()
    .eq("id", evidenceId)
    .eq("prospect_id", prospectId)

  if (deleteError) return NextResponse.json({ error: deleteError.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
