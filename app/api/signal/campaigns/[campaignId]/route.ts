import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import {
  cleanOptionalText,
  signalCampaignPatchSchema,
} from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { campaignId } = await params
  const supabase = createAdminClient()
  const [{ data: campaign, error }, { data: candidates }] = await Promise.all([
    supabase
      .from("signal_campaigns")
      .select("*")
      .eq("id", campaignId)
      .maybeSingle(),
    supabase
      .from("signal_campaign_candidates")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false }),
  ])

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!campaign) return NextResponse.json({ error: "Campaign not found." }, { status: 404 })
  return NextResponse.json({ campaign, candidates: candidates || [] })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalCampaignPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid campaign update." },
      { status: 400 },
    )
  }

  const update: Record<string, unknown> = { ...parsed.data }
  if ("target_state" in update) update.target_state = cleanOptionalText(update.target_state)
  if ("notes" in update) update.notes = cleanOptionalText(update.notes)
  if ("next_action" in update) update.next_action = cleanOptionalText(update.next_action)

  const { campaignId } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_campaigns")
    .update(update)
    .eq("id", campaignId)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Campaign not found." }, { status: 404 })
  return NextResponse.json({ campaign: data })
}
