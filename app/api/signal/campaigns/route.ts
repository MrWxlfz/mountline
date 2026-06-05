import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import {
  cleanOptionalText,
  signalCampaignCreateSchema,
} from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalCampaign } from "@/lib/supabase/types"

export async function GET() {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_campaigns")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ campaigns: data || [] })
}

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalCampaignCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid campaign." },
      { status: 400 },
    )
  }

  const input = parsed.data
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_campaigns")
    .insert({
      name: input.name.trim(),
      target_city: input.target_city.trim(),
      target_state: cleanOptionalText(input.target_state),
      target_radius_miles: input.target_radius_miles || null,
      selected_playbooks: input.selected_playbooks,
      max_candidates: input.max_candidates || 25,
      status: "draft",
      notes: cleanOptionalText(input.notes),
      created_by: authCheck.access.emails[0] || authCheck.access.userId,
      next_action: "Run public discovery, then review candidate official sources.",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ campaign: data as SignalCampaign })
}
