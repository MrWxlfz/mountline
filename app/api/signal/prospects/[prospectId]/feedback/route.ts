import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { cleanOptionalText, signalFeedbackCreateSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalFeedbackCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid Signal feedback." },
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
    .from("signal_feedback")
    .insert({
      prospect_id: prospectId,
      analysis_id: parsed.data.analysis_id || null,
      feedback_type: parsed.data.feedback_type,
      original_value: cleanOptionalText(parsed.data.original_value),
      corrected_value: cleanOptionalText(parsed.data.corrected_value),
      note: cleanOptionalText(parsed.data.note),
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ feedback: data })
}

