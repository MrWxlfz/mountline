import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { addSignalProspectToSuppression } from "@/lib/signal/alerts"
import {
  deriveOutreachHistoryFromEvents,
  getContactReadiness,
} from "@/lib/signal/outreach-history"
import { signalFocusOutcomeSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalOutreachEvent, SignalProspect } from "@/lib/supabase/types"

function eventForOutcome(outcome: string): {
  channel: SignalOutreachEvent["channel"] | null
  event_type: SignalOutreachEvent["event_type"] | null
  status: SignalProspect["outreach_status"]
} {
  if (outcome === "no_answer") return { channel: "call", event_type: "attempted", status: "no_response" }
  if (outcome === "voicemail_left") return { channel: "voicemail", event_type: "voicemail_left", status: "awaiting_reply" }
  if (outcome === "permission_to_send_demo") return { channel: "call", event_type: "permission_to_send_demo", status: "permission_to_send_demo" }
  if (outcome === "demo_sent") return { channel: "email", event_type: "demo_sent", status: "demo_sent" }
  if (outcome === "follow_up_later") return { channel: "call", event_type: "attempted", status: "contacted" }
  if (outcome === "interested") return { channel: "call", event_type: "interested", status: "interested" }
  if (outcome === "not_interested") return { channel: "call", event_type: "declined", status: "lost" }
  if (outcome === "do_not_contact") return { channel: "call", event_type: "do_not_contact", status: "do_not_contact" }
  return { channel: null, event_type: null, status: "needs_review" }
}

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalFocusOutcomeSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid focus outcome." },
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
  const outcome = eventForOutcome(parsed.data.outcome)
  const now = new Date().toISOString()

  if (parsed.data.outcome === "do_not_contact") {
    await addSignalProspectToSuppression(prospect, parsed.data.notes || "Focus Mode outcome")
  }

  if (outcome.channel && outcome.event_type) {
    await supabase.from("signal_outreach_events").insert({
      prospect_id: prospect.id,
      channel: outcome.channel,
      direction: "outbound",
      event_type: outcome.event_type,
      event_date: now.slice(0, 10),
      follow_up_date: parsed.data.follow_up_date || null,
      summary: parsed.data.notes || `Focus Mode outcome: ${parsed.data.outcome.replace(/_/g, " ")}`,
      created_by: authCheck.access.emails[0] || authCheck.access.userId,
    })
  }

  const { data: eventsData } = await supabase
    .from("signal_outreach_events")
    .select("*")
    .eq("prospect_id", prospect.id)
    .order("created_at", { ascending: false })
  const events = (eventsData || []) as SignalOutreachEvent[]
  const update: Record<string, unknown> = {
    outreach_status: outcome.status,
    outreach_history: deriveOutreachHistoryFromEvents(events),
  }

  if (parsed.data.follow_up_date) update.follow_up_date = parsed.data.follow_up_date
  if (outcome.event_type && !prospect.contacted_at) update.contacted_at = now

  const readiness = getContactReadiness({ ...prospect, ...update } as SignalProspect, events)
  update.contact_readiness = readiness.state
  update.contact_readiness_reason = readiness.reason

  const { data: updatedProspect, error: updateError } = await supabase
    .from("signal_prospects")
    .update(update)
    .eq("id", prospect.id)
    .select()
    .single()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  let focusItem = null
  if (parsed.data.focus_item_id) {
    const { data } = await supabase
      .from("signal_focus_items")
      .update({
        status: "completed",
        completed_at: now,
      })
      .eq("id", parsed.data.focus_item_id)
      .eq("prospect_id", prospect.id)
      .select()
      .maybeSingle()
    focusItem = data
  }

  return NextResponse.json({
    prospect: updatedProspect,
    focus_item: focusItem,
  })
}
