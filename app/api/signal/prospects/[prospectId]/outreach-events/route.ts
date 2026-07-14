import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { isSignalProspectSuppressed } from "@/lib/signal/alerts"
import {
  deriveOutreachHistoryFromEvents,
  getContactReadiness,
  statusFromOutreachEvent,
} from "@/lib/signal/outreach-history"
import {
  cleanOptionalText,
  normalizeEmail,
  signalOutreachEventCreateSchema,
} from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalOutreachEvent, SignalProspect } from "@/lib/supabase/types"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalOutreachEventCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid outreach event." },
      { status: 400 },
    )
  }

  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: prospectData, error: prospectError } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()

  if (prospectError) return NextResponse.json({ error: prospectError.message }, { status: 500 })
  if (!prospectData) return NextResponse.json({ error: "Prospect not found" }, { status: 404 })

  const prospect = prospectData as SignalProspect
  if (parsed.data.direction !== "inbound" && !["draft_outreach", "fully_personalized"].includes(prospect.sales_pack_state || "not_ready")) {
    return NextResponse.json(
      { error: "Outbound contact is gated until the exact business, opportunity, and contact route are sufficiently verified." },
      { status: 409 },
    )
  }
  if (prospect.outreach_status === "do_not_contact" || (await isSignalProspectSuppressed(prospect))) {
    return NextResponse.json(
      { error: "This prospect is marked do-not-contact." },
      { status: 409 },
    )
  }

  const eventPayload = {
    prospect_id: prospect.id,
    channel: parsed.data.channel,
    direction: parsed.data.direction || "outbound",
    event_type: parsed.data.event_type,
    event_date: cleanOptionalText(parsed.data.event_date),
    summary: cleanOptionalText(parsed.data.summary),
    follow_up_date: cleanOptionalText(parsed.data.follow_up_date),
    created_by: cleanOptionalText(parsed.data.created_by) || authCheck.access.emails[0] || authCheck.access.userId,
  }

  const { data: eventData, error: eventError } = await supabase
    .from("signal_outreach_events")
    .insert(eventPayload)
    .select()
    .single()

  if (eventError) return NextResponse.json({ error: eventError.message }, { status: 500 })

  const { data: eventsData } = await supabase
    .from("signal_outreach_events")
    .select("*")
    .eq("prospect_id", prospect.id)
    .order("created_at", { ascending: false })

  const events = (eventsData || []) as SignalOutreachEvent[]
  const update: Record<string, unknown> = {
    outreach_history: deriveOutreachHistoryFromEvents(events),
    outreach_status: statusFromOutreachEvent(parsed.data.event_type),
  }

  if (parsed.data.follow_up_date) update.follow_up_date = parsed.data.follow_up_date
  if (parsed.data.direction !== "inbound" && !prospect.contacted_at) {
    update.contacted_at = new Date().toISOString()
  }

  const contactValue = cleanOptionalText(parsed.data.contact_value)
  if (contactValue) {
    if (parsed.data.channel === "email") update.public_email = normalizeEmail(contactValue)
    if (["call", "voicemail", "text"].includes(parsed.data.channel)) update.public_phone = contactValue
    if (parsed.data.channel === "contact_form") update.public_contact_form_url = contactValue
    if (parsed.data.channel === "instagram") update.instagram_url = contactValue
  }

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

  return NextResponse.json({
    event: eventData,
    events,
    prospect: updatedProspect,
  })
}
