import { notFound } from "next/navigation"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { getSignalMarketEstimateForMarket } from "@/lib/signal/markets"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalMarket, SignalMarketCandidate, SignalMarketEvent } from "@/lib/supabase/types"
import { SignalMarketDetail } from "./signal-market-detail"

export default async function SignalMarketDetailPage({
  params,
}: {
  params: Promise<{ marketId: string }>
}) {
  await requireNorthlineTeamMember()
  const { marketId } = await params
  const supabase = createAdminClient()
  const [{ data: market }, { data: candidates }, { data: events }] = await Promise.all([
    supabase.from("signal_markets").select("*").eq("id", marketId).maybeSingle(),
    supabase
      .from("signal_market_candidates")
      .select("*")
      .eq("market_id", marketId)
      .order("website_opportunity_score", { ascending: false, nullsFirst: false }),
    supabase
      .from("signal_market_events")
      .select("*")
      .eq("market_id", marketId)
      .order("created_at", { ascending: false })
      .limit(80),
  ])

  if (!market) notFound()

  return (
    <SignalMarketDetail
      initialCandidates={(candidates || []) as SignalMarketCandidate[]}
      initialEvents={(events || []) as SignalMarketEvent[]}
      initialMarket={market as SignalMarket}
      estimate={getSignalMarketEstimateForMarket(market as SignalMarket)}
    />
  )
}
