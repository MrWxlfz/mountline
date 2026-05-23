import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { isSignalProspectSuppressed } from "@/lib/signal/alerts"
import {
  normalizeProspectInput,
  signalImportCommitSchema,
  signalProspectCreateSchema,
} from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalImportBatch, SignalProspect } from "@/lib/supabase/types"

const PRESERVE_STATUS = new Set([
  "contacted",
  "awaiting_reply",
  "permission_to_send_demo",
  "demo_sent",
  "interested",
  "discovery_call",
  "proposal_sent",
  "won",
  "lost",
  "no_response",
  "do_not_contact",
])

type StoredPreviewRow = {
  mapped?: Record<string, unknown>
  duplicate_matches?: Array<{ prospect_id: string }>
  issues?: string[]
}

function cleanMapped(row: StoredPreviewRow) {
  return {
    ...(row.mapped || {}),
    source: "csv_import",
  }
}

function mergeUpdate(existing: SignalProspect, mapped: Record<string, unknown>) {
  const update: Record<string, unknown> = {}
  const fillOnlyFields = [
    "contact_name",
    "industry",
    "industry_playbook",
    "city",
    "state",
    "locality_relationship",
    "website_url",
    "public_email",
    "public_phone",
    "instagram_url",
    "existing_website_platform",
    "existing_booking_platform",
    "human_notes",
    "what_looks_good",
    "visible_problem",
    "relevant_demo",
    "follow_up_date",
  ] as const

  for (const field of fillOnlyFields) {
    if (!existing[field] && mapped[field]) {
      update[field] = mapped[field]
    }
  }

  if (
    mapped.outreach_status &&
    !PRESERVE_STATUS.has(existing.outreach_status) &&
    existing.outreach_status === "researched"
  ) {
    update.outreach_status = mapped.outreach_status
  }

  return update
}

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalImportCommitSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid import batch." }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: batchData, error: batchError } = await supabase
    .from("signal_import_batches")
    .select("*")
    .eq("id", parsed.data.batch_id)
    .maybeSingle()

  if (batchError) return NextResponse.json({ error: batchError.message }, { status: 500 })
  if (!batchData) return NextResponse.json({ error: "Import batch not found" }, { status: 404 })

  const batch = batchData as SignalImportBatch
  if (batch.status === "imported") {
    return NextResponse.json({ error: "This import batch has already been imported." }, { status: 409 })
  }

  const previewRows = Array.isArray(batch.preview_rows)
    ? (batch.preview_rows as StoredPreviewRow[])
    : []

  const inserted: SignalProspect[] = []
  const merged: SignalProspect[] = []
  const skipped: Array<{ row: number; reason: string }> = []

  for (const row of previewRows) {
    if (row.issues?.length) {
      skipped.push({ row: inserted.length + merged.length + skipped.length + 1, reason: row.issues.join(", ") })
      continue
    }

    const mapped = cleanMapped(row)
    const parseResult = signalProspectCreateSchema.safeParse(mapped)
    if (!parseResult.success) {
      skipped.push({
        row: inserted.length + merged.length + skipped.length + 1,
        reason: parseResult.error.issues[0]?.message || "Invalid row",
      })
      continue
    }

    const duplicateId = row.duplicate_matches?.[0]?.prospect_id
    if (duplicateId) {
      const { data: existingData } = await supabase
        .from("signal_prospects")
        .select("*")
        .eq("id", duplicateId)
        .maybeSingle()

      if (existingData) {
        const existing = existingData as SignalProspect
        const update = mergeUpdate(existing, parseResult.data as Record<string, unknown>)
        if (Object.keys(update).length > 0) {
          const { data: updatedData } = await supabase
            .from("signal_prospects")
            .update(update)
            .eq("id", existing.id)
            .select()
            .single()
          merged.push((updatedData as SignalProspect | null) || existing)
        } else {
          merged.push(existing)
        }
        continue
      }
    }

    const normalized = normalizeProspectInput(parseResult.data)
    const { data: createdData, error: createError } = await supabase
      .from("signal_prospects")
      .insert(normalized)
      .select()
      .single()

    if (createError) {
      skipped.push({
        row: inserted.length + merged.length + skipped.length + 1,
        reason: createError.message,
      })
      continue
    }

    let prospect = createdData as SignalProspect
    if (await isSignalProspectSuppressed(prospect)) {
      const { data: suppressedData } = await supabase
        .from("signal_prospects")
        .update({ outreach_status: "do_not_contact" })
        .eq("id", prospect.id)
        .select()
        .single()
      prospect = (suppressedData as SignalProspect | null) || prospect
    }

    inserted.push(prospect)
  }

  await supabase
    .from("signal_import_batches")
    .update({
      status: "imported",
      imported_count: inserted.length + merged.length,
      error: skipped.length ? `${skipped.length} rows skipped` : null,
    })
    .eq("id", batch.id)

  return NextResponse.json({
    inserted,
    merged,
    skipped,
    imported_count: inserted.length + merged.length,
  })
}
