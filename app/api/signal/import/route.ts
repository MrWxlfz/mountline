import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { isSignalProspectSuppressed } from "@/lib/signal/alerts"
import {
  blankToNull,
  normalizeProspectInput,
  signalImportSchema,
} from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect } from "@/lib/supabase/types"

function normalizeBody(body: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => [key, blankToNull(value)]),
  )
}

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const prospects = Array.isArray(body?.prospects)
    ? body.prospects.map((item: unknown) =>
        item && typeof item === "object"
          ? normalizeBody(item as Record<string, unknown>)
          : item,
      )
    : []

  const parsed = signalImportSchema.safeParse({ prospects })
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid import file" },
      { status: 400 },
    )
  }

  const rows = parsed.data.prospects.map((prospect) => ({
    ...normalizeProspectInput({ ...prospect, source: "csv_import" }),
    source: "csv_import",
  }))

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_prospects")
    .insert(rows)
    .select()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  const saved = (data || []) as SignalProspect[]
  const suppressedIds: string[] = []

  for (const prospect of saved) {
    if (await isSignalProspectSuppressed(prospect)) {
      suppressedIds.push(prospect.id)
    }
  }

  if (suppressedIds.length > 0) {
    await supabase
      .from("signal_prospects")
      .update({ outreach_status: "do_not_contact" })
      .in("id", suppressedIds)
  }

  return NextResponse.json({
    prospects: saved.map((prospect) =>
      suppressedIds.includes(prospect.id)
        ? { ...prospect, outreach_status: "do_not_contact" }
        : prospect,
    ),
    suppressed_count: suppressedIds.length,
  })
}
