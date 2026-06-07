import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { estimateSignalMarketUsage } from "@/lib/signal/providers"
import {
  cleanOptionalText,
  signalMarketCreateSchema,
} from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalMarket } from "@/lib/supabase/types"

export async function GET() {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_markets")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ markets: data || [] })
}

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalMarketCreateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid market." },
      { status: 400 },
    )
  }

  const input = parsed.data
  const estimate = estimateSignalMarketUsage({
    industries: input.industries,
    maxCandidates: input.max_candidates,
    researchDepth: input.research_depth || "balanced",
  })
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_markets")
    .insert({
      name: input.name.trim(),
      city: input.city.trim(),
      state: cleanOptionalText(input.state),
      radius_miles: input.radius_miles || null,
      industries: input.industries,
      max_candidates: Math.min(input.max_candidates || estimate.candidate_limit, estimate.candidate_limit),
      research_depth: input.research_depth || "balanced",
      status: "draft",
      provider_mode: estimate.provider_mode,
      progress: {
        stage: "draft",
        usage_estimate: estimate,
        updated_at: new Date().toISOString(),
      },
      estimated_credit_budget: estimate.estimated_credit_budget,
      actual_credit_usage: null,
      notes: cleanOptionalText(input.notes),
      created_by: authCheck.access.emails[0] || authCheck.access.userId,
      next_action: "Review the cost estimate, then run market discovery.",
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ market: data as SignalMarket, estimate })
}
