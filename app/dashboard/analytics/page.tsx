import Link from "next/link"
import { BarChart3 } from "lucide-react"
import { EmptyState, MetricStrip, PageHeader, SectionPanel, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalOutreachEvent, SignalProspect } from "@/lib/supabase/types"

const windows = { "30": 30, "90": 90, all: null } as const

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ window?: string }> }) {
  await requireNorthlineTeamMember()
  const query = await searchParams
  const selected = query.window === "90" || query.window === "all" ? query.window : "30"
  const days = windows[selected]
  const since = days ? new Date(Date.now() - days * 86_400_000).toISOString() : null
  const supabase = createAdminClient()
  let prospectQuery = supabase.from("signal_prospects").select("*").order("updated_at", { ascending: false })
  let eventQuery = supabase.from("signal_outreach_events").select("*").order("created_at", { ascending: false })
  if (since) { prospectQuery = prospectQuery.gte("created_at", since); eventQuery = eventQuery.gte("created_at", since) }
  const [{ data: prospects, error: prospectError }, { data: events, error: eventError }, { count: activeProjects }, { count: clients }] = await Promise.all([
    prospectQuery,
    eventQuery,
    supabase.from("projects").select("*", { count: "exact", head: true }).neq("status", "completed"),
    supabase.from("clients").select("*", { count: "exact", head: true }),
  ])
  const rows = (prospects || []) as SignalProspect[]
  const outreachEvents = (events || []) as SignalOutreachEvent[]
  const analyzed = rows.filter((item) => item.analysis_completed_at).length
  const pursue = rows.filter((item) => item.verdict === "pursue").length
  const won = rows.filter((item) => item.pipeline_stage === "won").length
  const stageCounts = ["found", "analyzed", "concept_ready", "contacted", "interested", "proposal", "won", "lost"].map((stage) => ({ stage, count: rows.filter((item) => item.pipeline_stage === stage).length }))
  const maxStage = Math.max(1, ...stageCounts.map((item) => item.count))
  const windowLabel = days ? `Last ${days} days` : "All recorded time"

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Analytics" title="Operating metrics" subtitle="Counts come from persisted Signal, outreach, client, and project records. No estimated trends or implied outcomes." meta={<StatusBadge>{windowLabel}</StatusBadge>} />
      <div className="flex flex-wrap gap-2">{Object.keys(windows).map((value) => <Link key={value} href={`/dashboard/analytics?window=${value}`} className={`rounded-md border px-3 py-2 text-xs font-medium ${selected === value ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{value === "all" ? "All time" : `${value} days`}</Link>)}</div>
      {(prospectError || eventError) && <div className="rounded-lg border border-error-border bg-error-soft px-3 py-2 text-sm text-error-foreground">Some metrics could not be loaded: {(prospectError || eventError)?.message}</div>}
      <MetricStrip items={[
        { href: "/dashboard/leads", label: `Signal leads · ${windowLabel}`, value: rows.length },
        { href: "/dashboard/signal", label: `Analyses completed · ${windowLabel}`, value: analyzed, tone: "blue" },
        { href: "/dashboard/pipeline", label: `Pursue verdicts · ${windowLabel}`, value: pursue, tone: "green" },
        { href: "/dashboard/outreach", label: `Outreach events · ${windowLabel}`, value: outreachEvents.length, tone: "amber" },
        { href: "/dashboard/pipeline", label: `Won · ${windowLabel}`, value: won, tone: "green" },
      ]} />
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <SectionPanel title="Pipeline distribution" description={`Current stage for leads created ${days ? `during the last ${days} days` : "at any recorded time"}.`}>
          {rows.length ? <div className="space-y-4">{stageCounts.map((item) => <div key={item.stage}><div className="mb-1.5 flex justify-between text-sm"><span className="capitalize">{item.stage.replace(/_/g, " ")}</span><span className="font-mono text-muted-foreground">{item.count}</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground" style={{ width: `${Math.round(item.count / maxStage * 100)}%` }} /></div></div>)}</div> : <EmptyState title="No Signal data in this window" icon={BarChart3}>Choose a larger window or complete a focused analysis.</EmptyState>}
        </SectionPanel>
        <SectionPanel title="Business context" description="Current totals are shown separately because clients and active projects are not windowed event metrics.">
          <div className="space-y-4"><div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Current clients</p><p className="mt-1 font-mono text-2xl font-semibold">{clients || 0}</p></div><div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Current active projects</p><p className="mt-1 font-mono text-2xl font-semibold">{activeProjects || 0}</p></div><div className="rounded-lg border border-border p-4"><p className="text-xs text-muted-foreground">Measurement note</p><p className="mt-2 text-sm leading-6 text-muted-foreground">Lead and outreach metrics use record creation timestamps. Stage distribution shows each included lead’s current stage, not historical movement during the window.</p></div></div>
        </SectionPanel>
      </div>
    </div>
  )
}
