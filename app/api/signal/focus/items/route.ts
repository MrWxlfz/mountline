import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { isSignalProspectSuppressed } from "@/lib/signal/alerts"
import { signalFocusItemCreateSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect } from "@/lib/supabase/types"

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalFocusItemCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid focus item." },
      { status: 400 },
    )
  }

  const supabase = createAdminClient()
  const { data: prospectData, error: prospectError } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", parsed.data.prospect_id)
    .maybeSingle()

  if (prospectError) return NextResponse.json({ error: prospectError.message }, { status: 500 })
  if (!prospectData) return NextResponse.json({ error: "Prospect not found." }, { status: 404 })

  const prospect = prospectData as SignalProspect
  if (prospect.outreach_status === "do_not_contact" || (await isSignalProspectSuppressed(prospect))) {
    return NextResponse.json(
      { error: "Do-not-contact prospects cannot be added to Focus Mode." },
      { status: 409 },
    )
  }

  const { data: existing } = await supabase
    .from("signal_focus_items")
    .select("*")
    .eq("prospect_id", prospect.id)
    .in("status", ["pending", "active"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (existing) return NextResponse.json({ focus_item: existing, existing: true })

  const { data, error } = await supabase
    .from("signal_focus_items")
    .insert({
      prospect_id: prospect.id,
      campaign_id: parsed.data.campaign_id || null,
      market_id: parsed.data.market_id || null,
      focus_reason: parsed.data.focus_reason || null,
      recommended_action: parsed.data.recommended_action || null,
      due_date: parsed.data.due_date || new Date().toISOString().slice(0, 10),
      created_by: authCheck.access.emails[0] || authCheck.access.userId,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ focus_item: data, existing: false })
}
