import { NextResponse } from "next/server"
import { z } from "zod"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"

const verificationSchema = z.object({
  status: z.enum(["resolved", "unrelated", "dismissed"]),
  note: z.string().trim().max(1000).optional().nullable(),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ prospectId: string; itemId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const parsed = verificationSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid verification update." }, { status: 400 })
  const { prospectId, itemId } = await params
  const supabase = createAdminClient()
  const { data: updated, error } = await supabase.from("signal_verification_items").update({
    status: parsed.data.status,
    resolution_note: parsed.data.note || null,
    resolved_at: new Date().toISOString(),
    resolved_by: authCheck.access.userId,
    updated_at: new Date().toISOString(),
  }).eq("id", itemId).eq("prospect_id", prospectId).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const { count } = await supabase.from("signal_verification_items").select("id", { count: "exact", head: true })
    .eq("prospect_id", prospectId).eq("required", true).eq("status", "unresolved")
  if (!count) {
    await supabase.from("signal_prospects").update({ next_action: "Continue analysis with the verified corrections." }).eq("id", prospectId)
  }
  await supabase.from("signal_lead_activities").insert({
    prospect_id: prospectId,
    activity_type: "verification_item_updated",
    summary: `${updated.title} was marked ${parsed.data.status}.`,
    metadata: { verification_item_id: itemId, status: parsed.data.status },
    created_by: authCheck.access.userId,
  })
  return NextResponse.json({ item: updated, remaining_required: count || 0 })
}
