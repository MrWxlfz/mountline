import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { cleanOptionalText, signalMarketPatchSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalMarket } from "@/lib/supabase/types"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ marketId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { marketId } = await params
  const supabase = createAdminClient()
  const [{ data: market, error: marketError }, { data: candidates, error: candidateError }] =
    await Promise.all([
      supabase.from("signal_markets").select("*").eq("id", marketId).maybeSingle(),
      supabase
        .from("signal_market_candidates")
        .select("*")
        .eq("market_id", marketId)
        .order("website_opportunity_score", { ascending: false, nullsFirst: false }),
    ])

  if (marketError) return NextResponse.json({ error: marketError.message }, { status: 500 })
  if (candidateError) return NextResponse.json({ error: candidateError.message }, { status: 500 })
  if (!market) return NextResponse.json({ error: "Market not found." }, { status: 404 })

  return NextResponse.json({ market, candidates: candidates || [] })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ marketId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalMarketPatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid market update." },
      { status: 400 },
    )
  }

  const input = parsed.data
  const update: Record<string, unknown> = {}
  if (input.name !== undefined) update.name = input.name.trim()
  if (input.city !== undefined) update.city = input.city.trim()
  if (input.state !== undefined) update.state = cleanOptionalText(input.state)
  if (input.radius_miles !== undefined) update.radius_miles = input.radius_miles || null
  if (input.industries !== undefined) update.industries = input.industries
  if (input.max_candidates !== undefined) update.max_candidates = input.max_candidates
  if (input.research_depth !== undefined) update.research_depth = input.research_depth
  if (input.status !== undefined) update.status = input.status
  if (input.notes !== undefined) update.notes = cleanOptionalText(input.notes)
  if (input.next_action !== undefined) update.next_action = cleanOptionalText(input.next_action)

  const { marketId } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_markets")
    .update(update)
    .eq("id", marketId)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Market not found." }, { status: 404 })

  return NextResponse.json({ market: data as SignalMarket })
}
