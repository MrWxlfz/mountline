import Link from "next/link"
import { MapPin, RadioTower } from "lucide-react"
import {
  EmptyState,
  MetricStrip,
  PageHeader,
  PrimaryAction,
  SectionPanel,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { getSignalPlaybook } from "@/lib/signal/playbooks"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalMarket, SignalMarketCandidate } from "@/lib/supabase/types"

type MarketRow = SignalMarket & {
  candidates: SignalMarketCandidate[]
}

function statusTone(status: string) {
  if (status === "ready_for_review" || status === "completed") return "green" as const
  if (status === "discovering" || status === "researching" || status === "scoring") return "blue" as const
  if (status === "failed") return "red" as const
  if (status === "paused") return "amber" as const
  return "default" as const
}

function progressValue(market: MarketRow) {
  const total = market.candidates.length
  if (!total) return 0
  const done = market.candidates.filter((candidate) =>
    ["quick_scored", "visual_shortlisted", "imported_to_signal", "approved"].includes(candidate.research_state),
  ).length
  return Math.round((done / total) * 100)
}

async function getMarkets() {
  const supabase = createAdminClient()
  const [{ data: markets }, { data: candidates }] = await Promise.all([
    supabase.from("signal_markets").select("*").order("created_at", { ascending: false }),
    supabase.from("signal_market_candidates").select("*").order("created_at", { ascending: false }),
  ])

  const candidatesByMarket = new Map<string, SignalMarketCandidate[]>()
  ;((candidates || []) as SignalMarketCandidate[]).forEach((candidate) => {
    candidatesByMarket.set(candidate.market_id, [
      ...(candidatesByMarket.get(candidate.market_id) || []),
      candidate,
    ])
  })

  return ((markets || []) as SignalMarket[]).map((market) => ({
    ...market,
    candidates: candidatesByMarket.get(market.id) || [],
  }))
}

export default async function SignalMarketsPage() {
  await requireNorthlineTeamMember()
  const markets = await getMarkets()
  const active = markets.filter((market) => !["completed", "failed"].includes(market.status)).length
  const ready = markets.filter((market) => market.status === "ready_for_review").length
  const candidates = markets.reduce((sum, market) => sum + market.candidates.length, 0)
  const approved = markets.reduce(
    (sum, market) =>
      sum + market.candidates.filter((candidate) => candidate.imported_prospect_id).length,
    0,
  )

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Mountline Signal"
        title="Markets"
        subtitle="Autonomous market scans stay inside Signal for review, confirmation, and manual approval."
        actions={<PrimaryAction href="/dashboard/signal/markets/new" icon={RadioTower}>Build Market</PrimaryAction>}
      />

      <MetricStrip
        items={[
          { label: "Active markets", value: active, tone: active ? "blue" : "default" },
          { label: "Ready for review", value: ready, tone: ready ? "green" : "default" },
          { label: "Candidates", value: candidates },
          { label: "Approved", value: approved, tone: approved ? "green" : "default" },
          { label: "Recent scans", value: markets.length },
        ]}
      />

      <SectionPanel title="Recent Markets" description="Open a market to run discovery, review evidence, approve prospects, and prepare Focus Mode.">
        {markets.length > 0 ? (
          <div className="space-y-3">
            {markets.map((market) => {
              const progress = progressValue(market)
              const top = market.candidates
                .filter((candidate) => ["A", "B"].includes(candidate.preliminary_priority || ""))
                .sort((a, b) => (b.website_opportunity_score || 0) - (a.website_opportunity_score || 0))
                .slice(0, 2)
              return (
                <Link
                  key={market.id}
                  href={`/dashboard/signal/markets/${market.id}`}
                  className="block rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/35"
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium text-foreground">{market.name}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {[market.city, market.state].filter(Boolean).join(", ")}
                        <span>·</span>
                        {market.industries.map((key) => getSignalPlaybook(key).name).join(", ")}
                      </p>
                    </div>
                    <StatusBadge tone={statusTone(market.status)}>{market.status.replace(/_/g, " ")}</StatusBadge>
                  </div>
                  <div className="mt-4 h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                    <span>{market.candidates.length} discovered</span>
                    <span>{top.length} top opportunities</span>
                    <span>{market.actual_credit_usage ? "Usage recorded" : "Usage pending"}</span>
                    <span>{market.next_action || "Review market."}</span>
                  </div>
                  {top.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2 text-xs">
                      {top.map((candidate) => (
                        <span key={candidate.id} className="rounded-full border border-border bg-card px-2 py-1 text-muted-foreground">
                          {candidate.business_name} · {candidate.preliminary_priority}
                        </span>
                      ))}
                    </div>
                  )}
                </Link>
              )
            })}
          </div>
        ) : (
          <EmptyState
            title="No markets yet"
            icon={RadioTower}
            action={<PrimaryAction href="/dashboard/signal/markets/new" icon={RadioTower}>Build Market</PrimaryAction>}
          >
            Build a small pilot market to discover prospects, score public website evidence, and prepare review.
          </EmptyState>
        )}
      </SectionPanel>
    </div>
  )
}
