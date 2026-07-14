import Link from "next/link"
import { ArrowRight, MessageSquare, PhoneCall } from "lucide-react"
import { CompactTable, EmptyState, MetricStrip, PageHeader, PrimaryAction, SectionPanel, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalOutreachEvent, SignalProspect } from "@/lib/supabase/types"

export const dynamic = "force-dynamic"

function label(value: string | null | undefined) {
  return (value || "unknown").replace(/_/g, " ")
}

export default async function OutreachPage() {
  await requireNorthlineTeamMember()
  const supabase = createAdminClient()
  const [{ data: prospects }, { data: events, error }] = await Promise.all([
    supabase.from("signal_prospects").select("*").in("pipeline_stage", ["contacted", "interested", "proposal", "won", "lost"]).order("updated_at", { ascending: false }),
    supabase.from("signal_outreach_events").select("*").order("created_at", { ascending: false }).limit(100),
  ])
  const rows = (prospects || []) as SignalProspect[]
  const outreachEvents = (events || []) as SignalOutreachEvent[]
  const latestByProspect = new Map<string, SignalOutreachEvent>()
  outreachEvents.forEach((item) => { if (!latestByProspect.has(item.prospect_id)) latestByProspect.set(item.prospect_id, item) })
  const due = rows.filter((item) => {
    const value = item.next_action_due_at || item.follow_up_date
    return value && new Date(value).getTime() <= Date.now() && !["won", "lost"].includes(item.pipeline_stage || "found")
  }).length

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Outreach" title="Manual outreach" subtitle="Review contact attempts and follow-ups logged from Signal workspaces. Mountline OS does not send outreach automatically." actions={<PrimaryAction href="/dashboard/signal" icon={ArrowRight}>Open Signal</PrimaryAction>} />
      {error && <div className="rounded-lg border border-error-border bg-error-soft px-3 py-2 text-sm text-error-foreground">Outreach activity could not be loaded: {error.message}</div>}
      <MetricStrip items={[
        { label: "Contacted", value: rows.filter((item) => item.pipeline_stage === "contacted").length, tone: "blue" },
        { label: "Interested", value: rows.filter((item) => item.pipeline_stage === "interested").length, tone: "green" },
        { label: "Proposal", value: rows.filter((item) => item.pipeline_stage === "proposal").length, tone: "amber" },
        { label: "Follow-ups due", value: due, tone: due ? "red" : "default" },
      ]} />
      <SectionPanel title="Outreach records" description="One row per operational Signal lead that has reached outreach or a final stage.">
        {rows.length ? <CompactTable minWidth="920px"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="px-3 py-3 font-medium">Business</th><th className="px-3 py-3 font-medium">Stage</th><th className="px-3 py-3 font-medium">Latest channel</th><th className="px-3 py-3 font-medium">Latest outcome</th><th className="px-3 py-3 font-medium">Follow-up</th><th className="px-3 py-3 text-right font-medium">Workspace</th></tr></thead><tbody className="divide-y divide-border">{rows.map((prospect) => { const latest = latestByProspect.get(prospect.id); return <tr key={prospect.id} className="hover:bg-muted/25"><td className="px-3 py-4"><p className="font-medium">{prospect.business_name}</p><p className="mt-1 text-xs text-muted-foreground">{prospect.public_email || prospect.public_phone || "Contact route needs review"}</p></td><td className="px-3 py-4"><StatusBadge tone={prospect.pipeline_stage === "won" ? "green" : prospect.pipeline_stage === "lost" ? "red" : "blue"}>{label(prospect.pipeline_stage)}</StatusBadge></td><td className="px-3 py-4 text-sm text-muted-foreground">{latest ? label(latest.channel) : "Not logged"}</td><td className="max-w-[280px] px-3 py-4 text-sm text-muted-foreground">{latest?.summary || (latest ? label(latest.event_type) : "No event details")}</td><td className="px-3 py-4 text-sm text-muted-foreground">{prospect.next_action_due_at || prospect.follow_up_date ? new Date(prospect.next_action_due_at || prospect.follow_up_date!).toLocaleDateString() : "Not set"}</td><td className="px-3 py-4 text-right"><Link href={`/dashboard/signal/${prospect.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline">Open <ArrowRight className="h-3.5 w-3.5" /></Link></td></tr>})}</tbody></CompactTable> : <EmptyState title="No outreach logged" icon={PhoneCall}>Log a manual attempt from a Signal workspace after evidence and scripts have been reviewed.</EmptyState>}
      </SectionPanel>
      <SectionPanel title="Recent activity" description="Latest manual attempts across Signal leads.">
        {outreachEvents.length ? <div className="space-y-2">{outreachEvents.slice(0, 12).map((item) => { const prospect = rows.find((row) => row.id === item.prospect_id); return <Link key={item.id} href={`/dashboard/signal/${item.prospect_id}`} className="flex flex-col gap-2 rounded-lg border border-border px-4 py-3 hover:bg-muted/25 sm:flex-row sm:items-center"><MessageSquare className="h-4 w-4 text-muted-foreground" /><span className="font-medium">{prospect?.business_name || "Signal lead"}</span><span className="text-sm text-muted-foreground">{label(item.channel)} · {label(item.event_type)}</span><span className="sm:ml-auto text-xs text-muted-foreground">{new Date(item.event_date || item.created_at).toLocaleString()}</span></Link>})}</div> : <p className="text-sm text-muted-foreground">No manual outreach activity has been recorded.</p>}
      </SectionPanel>
    </div>
  )
}
