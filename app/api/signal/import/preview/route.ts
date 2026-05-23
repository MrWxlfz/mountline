import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { runSignalImportMappingAi } from "@/lib/signal/ai"
import {
  buildSignalImportPreview,
  readSignalWorkbookRows,
  type SignalImportMapping,
} from "@/lib/signal/import-workbook"
import { signalImportPreviewSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect } from "@/lib/supabase/types"

const MAX_IMPORT_BYTES = 5 * 1024 * 1024
const ALLOWED_EXTENSIONS = [".csv", ".xlsx", ".xls"]

function extensionOf(filename: string) {
  const lower = filename.toLowerCase()
  return ALLOWED_EXTENSIONS.find((extension) => lower.endsWith(extension)) || null
}

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const formData = await request.formData().catch(() => null)
  const file = formData?.get("file")
  const sheetName = formData?.get("sheet_name")
  const parsed = signalImportPreviewSchema.safeParse({
    sheet_name: typeof sheetName === "string" ? sheetName : null,
  })

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid worksheet selection." }, { status: 400 })
  }

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Upload a CSV or Excel workbook." }, { status: 400 })
  }

  const extension = extensionOf(file.name)
  if (!extension) {
    return NextResponse.json(
      { error: "Signal import accepts .csv, .xlsx, or .xls files only." },
      { status: 400 },
    )
  }

  if (file.size > MAX_IMPORT_BYTES) {
    return NextResponse.json(
      { error: "Workbook is too large. Keep Signal imports under 5 MB." },
      { status: 413 },
    )
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = await readSignalWorkbookRows({
      buffer,
      filename: file.name,
      sheetName: parsed.data.sheet_name,
    })

    if (workbook.rows.length < 2) {
      return NextResponse.json(
        { error: "Workbook needs a header row and at least one lead row." },
        { status: 400 },
      )
    }

    const supabase = createAdminClient()
    const { data: prospects } = await supabase.from("signal_prospects").select("*")
    let aiMapping:
      | { provider: string; model: string; mapping: SignalImportMapping }
      | null = null
    let preview = buildSignalImportPreview({
      existingProspects: (prospects || []) as SignalProspect[],
      rows: workbook.rows,
    })

    if (!preview.mapping.business_name || !preview.mapping.industry) {
      aiMapping = await runSignalImportMappingAi(preview.headers)
      if (aiMapping) {
        preview = buildSignalImportPreview({
          existingProspects: (prospects || []) as SignalProspect[],
          mappingOverride: aiMapping.mapping,
          rows: workbook.rows,
        })
      }
    }

    const { data: batch, error } = await supabase
      .from("signal_import_batches")
      .insert({
        source_filename: file.name,
        file_type: workbook.file_type,
        sheet_name: workbook.selected_sheet_name,
        row_count: preview.rowCount,
        headers: preview.headers,
        mapping: {
          source: aiMapping ? "deterministic_plus_ai_headers" : "deterministic",
          ai_provider: aiMapping?.provider || null,
          ai_model: aiMapping?.model || null,
          fields: preview.mapping,
          note:
            "Raw workbook files stay server-side. Signal maps sanitized rows before import.",
        },
        preview_rows: preview.previewRows,
        duplicate_summary: preview.duplicateSummary,
        status: "previewed",
      })
      .select()
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    return NextResponse.json({
      batch,
      sheet_names: workbook.sheet_names,
      selected_sheet_name: workbook.selected_sheet_name,
      headers: preview.headers,
      mapping: preview.mapping,
      row_count: preview.rowCount,
      preview_rows: preview.previewRows.slice(0, 25),
      duplicate_summary: preview.duplicateSummary,
    })
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Signal could not parse this workbook.",
      },
      { status: 500 },
    )
  }
}
