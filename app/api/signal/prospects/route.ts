import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { isSignalProspectSuppressed } from "@/lib/signal/alerts"
import {
  blankToNull,
  normalizeProspectInput,
  signalProspectCreateSchema,
} from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect } from "@/lib/supabase/types"

function normalizeBody(body: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => [key, blankToNull(value)]),
  )
}

export async function GET() {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_prospects")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ prospects: data || [] })
}

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid prospect payload" }, { status: 400 })
  }

  const parsed = signalProspectCreateSchema.safeParse(
    normalizeBody(body as Record<string, unknown>),
  )

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid prospect" },
      { status: 400 },
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_prospects")
    .insert(normalizeProspectInput(parsed.data))
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  let prospect = data as SignalProspect
  if (await isSignalProspectSuppressed(prospect)) {
    const { data: suppressedProspect } = await supabase
      .from("signal_prospects")
      .update({ outreach_status: "do_not_contact" })
      .eq("id", prospect.id)
      .select()
      .single()

    prospect = (suppressedProspect || prospect) as SignalProspect
  }

  return NextResponse.json({ prospect })
}
