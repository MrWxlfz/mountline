"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowRight, Inbox, Search, UserPlus } from "lucide-react"
import { CompactTable, EmptyState, PageHeader, PrimaryAction, SectionPanel, StatusBadge } from "@/components/dashboard/dashboard-ui"
import type { SignalProspect } from "@/lib/supabase/types"

export type InquiryLead = {
  id: string
  created_at: string
  name: string | null
  business_name: string | null
  email: string | null
  phone: string | null
  service_needed: string | null
  status: string | null
  source: string | null
}

function tone(value: string | null | undefined) {
  if (["pursue", "won", "qualified", "converted"].includes(value || "")) return "green" as const
  if (["investigate", "proposal", "contacted", "interested"].includes(value || "")) return "amber" as const
  if (["skip", "lost", "do_not_contact"].includes(value || "")) return "red" as const
  if (["new", "found", "analyzed"].includes(value || "")) return "blue" as const
  return "default" as const
}

function label(value: string | null | undefined) {
  return (value || "unknown").replace(/_/g, " ")
}

export function LeadsDashboard({ prospects, inquiries, storageError }: { prospects: SignalProspect[]; inquiries: InquiryLead[]; storageError: string | null }) {
  const [search, setSearch] = useState("")
  const [stage, setStage] = useState("all")
  const visible = useMemo(() => {
    const query = search.trim().toLowerCase()
    return prospects.filter((prospect) => {
      const queryMatch = !query || [prospect.business_name, prospect.city, prospect.industry, prospect.primary_opportunity].filter(Boolean).some((value) => String(value).toLowerCase().includes(query))
      const stageMatch = stage === "all" || prospect.pipeline_stage === stage || prospect.verdict === stage
      return queryMatch && stageMatch
    })
  }, [prospects, search, stage])

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Leads" title="Lead records" subtitle="Signal prospects are the operational sales source of truth. Contact-form inquiries remain separate until qualified." actions={<PrimaryAction href="/dashboard/signal" icon={ArrowRight}>Analyze business</PrimaryAction>} />
      {storageError && <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">Lead data could not be loaded: {storageError}</div>}
      <SectionPanel title="Operational leads" description="Focused Signal records with verdict, pipeline stage, and next action.">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row">
          <label className="relative block flex-1 sm:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search operational leads</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search business, city, or opportunity" className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-foreground/30" /></label>
          <select aria-label="Filter lead stage" value={stage} onChange={(event) => setStage(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm text-muted-foreground"><option value="all">All stages and verdicts</option><option value="pursue">Pursue</option><option value="investigate">Investigate</option><option value="skip">Skip</option><option value="found">Found</option><option value="analyzed">Analyzed</option><option value="concept_ready">Concept ready</option><option value="contacted">Contacted</option><option value="interested">Interested</option><option value="proposal">Proposal</option><option value="won">Won</option><option value="lost">Lost</option></select>
        </div>
        {visible.length ? <CompactTable minWidth="960px"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="px-3 py-3 font-medium">Business</th><th className="px-3 py-3 font-medium">Verdict</th><th className="px-3 py-3 font-medium">Stage</th><th className="px-3 py-3 font-medium">Primary opportunity</th><th className="px-3 py-3 font-medium">Next action</th><th className="px-3 py-3 text-right font-medium">Workspace</th></tr></thead><tbody className="divide-y divide-border">{visible.map((prospect) => <tr key={prospect.id} className="align-top hover:bg-muted/25"><td className="px-3 py-4"><p className="font-medium">{prospect.business_name}</p><p className="mt-1 text-xs text-muted-foreground">{[prospect.city, prospect.state].filter(Boolean).join(", ") || prospect.industry}</p></td><td className="px-3 py-4"><StatusBadge tone={tone(prospect.verdict)}>{label(prospect.verdict)}</StatusBadge></td><td className="px-3 py-4"><StatusBadge tone={tone(prospect.pipeline_stage)}>{label(prospect.pipeline_stage)}</StatusBadge></td><td className="max-w-[260px] px-3 py-4 text-sm text-muted-foreground">{prospect.primary_opportunity || "Analysis pending"}</td><td className="max-w-[280px] px-3 py-4 text-sm text-muted-foreground">{prospect.next_action || "Open focused analysis"}</td><td className="px-3 py-4 text-right"><Link href={`/dashboard/signal/${prospect.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium hover:underline">Open <ArrowRight className="h-3.5 w-3.5" /></Link></td></tr>)}</tbody></CompactTable> : <EmptyState title="No operational leads match">Change the filters or analyze a known business in Signal.</EmptyState>}
      </SectionPanel>
      <SectionPanel title="Incoming inquiries" description="Public contact-form submissions. Review and create a client only after qualification.">
        {inquiries.length ? <CompactTable minWidth="820px"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="px-3 py-3 font-medium">Contact</th><th className="px-3 py-3 font-medium">Business</th><th className="px-3 py-3 font-medium">Service</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3 font-medium">Received</th><th className="px-3 py-3 text-right font-medium">Action</th></tr></thead><tbody className="divide-y divide-border">{inquiries.map((inquiry) => <tr key={inquiry.id} className="hover:bg-muted/25"><td className="px-3 py-4"><p className="font-medium">{inquiry.name || "Name not supplied"}</p><p className="mt-1 text-xs text-muted-foreground">{inquiry.email || inquiry.phone || "No contact route"}</p></td><td className="px-3 py-4 text-sm text-muted-foreground">{inquiry.business_name || "Not supplied"}</td><td className="px-3 py-4 text-sm text-muted-foreground">{inquiry.service_needed || "Not specified"}</td><td className="px-3 py-4"><StatusBadge tone={tone(inquiry.status)}>{label(inquiry.status || "new")}</StatusBadge></td><td className="px-3 py-4 text-sm text-muted-foreground">{new Date(inquiry.created_at).toLocaleDateString()}</td><td className="px-3 py-4 text-right"><Link href={`/dashboard/clients/new?leadId=${inquiry.id}`} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"><UserPlus className="h-3.5 w-3.5" /> Create client</Link></td></tr>)}</tbody></CompactTable> : <EmptyState title="No incoming inquiries" icon={Inbox}>New contact-form submissions appear here.</EmptyState>}
      </SectionPanel>
    </div>
  )
}

