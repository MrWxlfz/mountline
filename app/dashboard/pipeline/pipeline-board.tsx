"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, Loader2, Search } from "lucide-react"
import { EmptyState, PageHeader, PrimaryAction, StatusBadge } from "@/components/dashboard/dashboard-ui"
import type { SignalPipelineStage, SignalProspect } from "@/lib/supabase/types"

const stages: Array<{ value: SignalPipelineStage; label: string }> = [
  { value: "found", label: "Found" },
  { value: "analyzed", label: "Analyzed" },
  { value: "concept_ready", label: "Concept ready" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "proposal", label: "Proposal" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
]

function verdictTone(verdict: string | undefined) {
  if (verdict === "pursue") return "green" as const
  if (verdict === "investigate") return "amber" as const
  if (verdict === "skip") return "red" as const
  return "default" as const
}

export function PipelineBoard({ initialProspects, storageError }: { initialProspects: SignalProspect[]; storageError: string | null }) {
  const router = useRouter()
  const [prospects, setProspects] = useState(initialProspects)
  const [search, setSearch] = useState("")
  const [working, setWorking] = useState<string | null>(null)
  const [error, setError] = useState(storageError)
  const grouped = useMemo(() => {
    const query = search.trim().toLowerCase()
    const visible = prospects.filter((prospect) => !query || [prospect.business_name, prospect.city, prospect.industry]
      .filter(Boolean).some((value) => String(value).toLowerCase().includes(query)))
    return Object.fromEntries(stages.map((stage) => [stage.value, visible.filter((prospect) => (prospect.pipeline_stage || "found") === stage.value)])) as Record<SignalPipelineStage, SignalProspect[]>
  }, [prospects, search])

  async function move(prospect: SignalProspect, stage: SignalPipelineStage) {
    setWorking(prospect.id)
    setError(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/pipeline`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipeline_stage: stage }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Stage could not be updated.")
      setProspects((current) => current.map((item) => item.id === prospect.id ? data.prospect : item))
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Stage could not be updated.")
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Pipeline" title="Lead pipeline" subtitle="Signal leads move through one explicit lifecycle. Stage changes remain accessible without drag-and-drop." actions={<PrimaryAction href="/dashboard/signal" icon={ArrowRight}>Analyze business</PrimaryAction>} />
      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full sm:max-w-sm"><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><span className="sr-only">Search pipeline</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search pipeline" className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-foreground/30" /></label>
        <p className="text-sm text-muted-foreground">{prospects.length} operational lead{prospects.length === 1 ? "" : "s"}</p>
      </div>
      {error && <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</div>}
      {prospects.length ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stages.map((stage) => (
            <section key={stage.value} className="min-w-0 rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3"><h2 className="text-sm font-semibold">{stage.label}</h2><span className="font-mono text-xs text-muted-foreground">{grouped[stage.value].length}</span></div>
              <div className="space-y-3 p-3">
                {grouped[stage.value].map((prospect) => (
                  <article key={prospect.id} className="rounded-lg border border-border bg-background p-3">
                    <div className="flex items-start justify-between gap-2"><Link href={`/dashboard/signal/${prospect.id}`} className="font-medium text-foreground hover:underline">{prospect.business_name}</Link>{working === prospect.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}</div>
                    <p className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">{prospect.primary_opportunity || prospect.next_action || "Focused analysis pending"}</p>
                    <div className="mt-3 flex items-center justify-between gap-2"><StatusBadge tone={verdictTone(prospect.verdict)}>{prospect.verdict || "pending"}</StatusBadge><select aria-label={`Move ${prospect.business_name}`} value={prospect.pipeline_stage || "found"} onChange={(event) => move(prospect, event.target.value as SignalPipelineStage)} disabled={working === prospect.id} className="max-w-[130px] rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground"><option value={stage.value}>{stage.label}</option>{stages.filter((item) => item.value !== stage.value).map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div>
                  </article>
                ))}
                {grouped[stage.value].length === 0 && <p className="px-1 py-5 text-center text-xs text-muted-foreground">No leads</p>}
              </div>
            </section>
          ))}
        </div>
      ) : <EmptyState title="No operational leads yet">Analyze a known business in Signal or move a Scout suggestion into Signal.</EmptyState>}
    </div>
  )
}
