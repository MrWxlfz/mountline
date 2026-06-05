import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import {
  cleanOptionalText,
  signalVerifiedObservationCreateSchema,
} from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalVerifiedObservationCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid verified observation." },
      { status: 400 },
    )
  }

  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: prospect, error: prospectError } = await supabase
    .from("signal_prospects")
    .select("id")
    .eq("id", prospectId)
    .maybeSingle()

  if (prospectError) return NextResponse.json({ error: prospectError.message }, { status: 500 })
  if (!prospect) return NextResponse.json({ error: "Prospect not found" }, { status: 404 })

  const { data, error } = await supabase
    .from("signal_verified_observations")
    .insert({
      prospect_id: prospectId,
      category: parsed.data.category,
      source: parsed.data.source,
      note: parsed.data.note,
      url: cleanOptionalText(parsed.data.url),
      created_by: authCheck.access.emails[0] || authCheck.access.userId,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ observation: data })
}
