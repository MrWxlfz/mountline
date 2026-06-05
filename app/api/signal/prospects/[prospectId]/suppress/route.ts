import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import {
  addSignalCandidateSuppression,
  addSignalProspectToSuppression,
} from "@/lib/signal/alerts"
import { signalSuppressionSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect } from "@/lib/supabase/types"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => ({}))
  const parsed = signalSuppressionSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid suppression reason" }, { status: 400 })
  }

  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: prospect, error: prospectError } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()

  if (prospectError) {
    return NextResponse.json({ error: prospectError.message }, { status: 500 })
  }
  if (!prospect) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 })
  }

  const suppression = await addSignalProspectToSuppression(
    prospect as SignalProspect,
    parsed.data.reason || "Added from Signal prospect detail",
  )
  await addSignalCandidateSuppression({
    businessName: prospect.business_name,
    city: prospect.city,
    email: prospect.public_email,
    hostname: prospect.website_url,
    phone: prospect.public_phone,
    reason: parsed.data.reason || "Added from Signal prospect detail",
    suppressionType: "do_not_contact",
  })

  const { data: updatedProspect, error: updateError } = await supabase
    .from("signal_prospects")
    .update({ outreach_status: "do_not_contact" })
    .eq("id", prospectId)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ suppression, prospect: updatedProspect })
}
