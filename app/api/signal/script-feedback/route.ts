import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { signalScriptFeedbackCreateSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { searchParams } = new URL(request.url)
  const prospectId = searchParams.get("prospect_id")
  const supabase = createAdminClient()
  let query = supabase
    .from("signal_script_feedback")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(25)

  if (prospectId) query = query.eq("prospect_id", prospectId)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ feedback: data || [] })
}

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalScriptFeedbackCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid script feedback." },
      { status: 400 },
    )
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_script_feedback")
    .insert({
      ...parsed.data,
      active: true,
      created_by: authCheck.access.emails[0] || authCheck.access.userId,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ feedback: data })
}
