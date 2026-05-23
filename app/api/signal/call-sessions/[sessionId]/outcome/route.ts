import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { addSignalProspectToSuppression } from "@/lib/signal/alerts"
import { signalCallOutcomeSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect } from "@/lib/supabase/types"

function statusForOutcome(outcome: string) {
  if (outcome === "voicemail_left") return "contacted"
  if (outcome === "permission_to_send_demo") return "permission_to_send_demo"
  if (outcome === "interested") return "interested"
  if (outcome === "follow_up_later") return "contacted"
  if (outcome === "not_interested") return "lost"
  if (outcome === "do_not_contact") return "do_not_contact"
  if (outcome === "no_answer") return "no_response"
  return null
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ sessionId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalCallOutcomeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid call outcome." },
      { status: 400 },
    )
  }

  const { sessionId } = await params
  const supabase = createAdminClient()
  const { data: item, error: itemError } = await supabase
    .from("signal_call_session_items")
    .select("*")
    .eq("id", parsed.data.item_id)
    .eq("session_id", sessionId)
    .maybeSingle()

  if (itemError) return NextResponse.json({ error: itemError.message }, { status: 500 })
  if (!item) return NextResponse.json({ error: "Call session item not found." }, { status: 404 })

  const { data: prospectData, error: prospectError } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", item.prospect_id)
    .maybeSingle()

  if (prospectError) return NextResponse.json({ error: prospectError.message }, { status: 500 })
  if (!prospectData) return NextResponse.json({ error: "Prospect not found." }, { status: 404 })

  const prospect = prospectData as SignalProspect
  const status = statusForOutcome(parsed.data.outcome)
  const now = new Date().toISOString()

  const { data: updatedItem, error: updateItemError } = await supabase
    .from("signal_call_session_items")
    .update({
      outcome: parsed.data.outcome,
      outcome_notes: parsed.data.notes || null,
      follow_up_date: parsed.data.follow_up_date || null,
      completed_at: now,
    })
    .eq("id", parsed.data.item_id)
    .select()
    .single()

  if (updateItemError) {
    return NextResponse.json({ error: updateItemError.message }, { status: 500 })
  }

  if (parsed.data.outcome === "do_not_contact") {
    await addSignalProspectToSuppression(prospect, parsed.data.notes || "Call session outcome")
  }

  const prospectUpdate: Record<string, unknown> = {
    contacted_at: prospect.contacted_at || now,
  }
  if (status) prospectUpdate.outreach_status = status
  if (parsed.data.follow_up_date) prospectUpdate.follow_up_date = parsed.data.follow_up_date

  const { data: updatedProspect, error: updateProspectError } = await supabase
    .from("signal_prospects")
    .update(prospectUpdate)
    .eq("id", prospect.id)
    .select()
    .single()

  if (updateProspectError) {
    return NextResponse.json({ error: updateProspectError.message }, { status: 500 })
  }

  return NextResponse.json({ item: updatedItem, prospect: updatedProspect })
}
