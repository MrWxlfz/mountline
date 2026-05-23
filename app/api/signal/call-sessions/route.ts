import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { isSignalProspectSuppressed } from "@/lib/signal/alerts"
import { signalCallSessionCreateSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect } from "@/lib/supabase/types"

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalCallSessionCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Select 1 to 5 approved prospects for a call session." },
      { status: 400 },
    )
  }

  const supabase = createAdminClient()
  const { data: prospectsData, error: prospectsError } = await supabase
    .from("signal_prospects")
    .select("*")
    .in("id", parsed.data.prospect_ids)

  if (prospectsError) return NextResponse.json({ error: prospectsError.message }, { status: 500 })

  const prospects = (prospectsData || []) as SignalProspect[]
  if (prospects.length !== parsed.data.prospect_ids.length) {
    return NextResponse.json({ error: "One or more prospects were not found." }, { status: 404 })
  }

  for (const prospect of prospects) {
    if (prospect.outreach_status === "do_not_contact" || (await isSignalProspectSuppressed(prospect))) {
      return NextResponse.json(
        { error: `${prospect.business_name} is marked do-not-contact and cannot be added to a call session.` },
        { status: 409 },
      )
    }
  }

  const title =
    prospects.length === 1
      ? `Call prep: ${prospects[0].business_name}`
      : `Signal call session (${prospects.length} prospects)`

  const { data: session, error: sessionError } = await supabase
    .from("signal_call_sessions")
    .insert({ title })
    .select()
    .single()

  if (sessionError) return NextResponse.json({ error: sessionError.message }, { status: 500 })

  const items = parsed.data.prospect_ids.map((prospectId, index) => ({
    session_id: session.id,
    prospect_id: prospectId,
    position: index + 1,
  }))

  const { data: savedItems, error: itemError } = await supabase
    .from("signal_call_session_items")
    .insert(items)
    .select()

  if (itemError) return NextResponse.json({ error: itemError.message }, { status: 500 })

  return NextResponse.json({ session, items: savedItems || [] })
}
