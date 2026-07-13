"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  Loader2,
  Plus,
  Radar,
  Search,
  ShieldQuestion,
} from "lucide-react"
import {
  CompactTable,
  EmptyState,
  PageHeader,
  PrimaryAction,
  SectionPanel,
  SecondaryAction,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import type { SignalProspect } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type InboxView = "action" | "pursue" | "verify" | "followups" | "all"

const views: Array<{ key: InboxView; label: string }> = [
  { key: "action", label: "Action needed" },
  { key: "pursue", label: "Ready to pursue" },
  { key: "verify", label: "Needs verification" },
  { key: "followups", label: "Follow-ups due" },
  { key: "all", label: "All leads" },
]

function due(value: string | null | undefined) {
  return Boolean(value && new Date(value).getTime() <= Date.now())
}

function matchesView(prospect: SignalProspect, view: InboxView) {
  if (view === "pursue") return prospect.verdict === "pursue" && prospect.analysis_status === "ready"
  if (view === "verify") {
    return prospect.verdict === "investigate" || ["needs_review", "ambiguous"].includes(prospect.identity_status || "needs_review")
  }
  if (view === "followups") return due(prospect.next_action_due_at || prospect.follow_up_date)
  if (view === "action") {
    return ["queued", "failed", "needs_review"].includes(prospect.analysis_status || "ready") ||
      prospect.verdict === "investigate" || due(prospect.next_action_due_at || prospect.follow_up_date)
  }
  return true
}

function statusTone(prospect: SignalProspect) {
  if (prospect.analysis_status === "failed") return "red" as const
  if (prospect.analysis_status === "queued" || ["resolving", "researching", "analyzing"].includes(prospect.analysis_status || "ready")) return "blue" as const
  if (prospect.verdict === "pursue") return "green" as const
  if (prospect.verdict === "investigate" || prospect.analysis_status === "needs_review") return "amber" as const
  if (prospect.verdict === "skip") return "red" as const
  return "default" as const
}

function statusLabel(prospect: SignalProspect) {
  if (prospect.analysis_status === "queued") return "Queued"
  if (["resolving", "researching", "analyzing"].includes(prospect.analysis_status || "ready")) return "Analyzing"
  if (prospect.analysis_status === "failed") return "Retry needed"
  if (prospect.analysis_status === "needs_review") return "Needs review"
  if (prospect.verdict === "pursue") return "Pursue"
  if (prospect.verdict === "investigate") return "Investigate"
  if (prospect.verdict === "skip") return "Skip"
  return "Not analyzed"
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Not set"
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export function SignalInbox({
  initialProspects,
  storageError,
}: {
  initialProspects: SignalProspect[]
  storageError: string | null
}) {
  const router = useRouter()
  const [businessInput, setBusinessInput] = useState("")
  const [observation, setObservation] = useState("")
  const [showObservation, setShowObservation] = useState(false)
  const [view, setView] = useState<InboxView>("action")
  const [search, setSearch] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submissionMode, setSubmissionMode] = useState<"analyze" | "manual">("analyze")
  const [error, setError] = useState<string | null>(null)

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return initialProspects.filter((prospect) => {
      const viewMatch = matchesView(prospect, view)
      const queryMatch = !query || [
        prospect.business_name,
        prospect.city,
        prospect.state,
        prospect.industry,
        prospect.primary_opportunity,
      ].filter(Boolean).some((value) => String(value).toLowerCase().includes(query))
      return viewMatch && queryMatch
    })
  }, [initialProspects, search, view])

  const counts = useMemo(() => Object.fromEntries(
    views.map((item) => [item.key, initialProspects.filter((prospect) => matchesView(prospect, item.key)).length]),
  ) as Record<InboxView, number>, [initialProspects])

  async function createLead(analyzeNow: boolean) {
    if (!businessInput.trim() || submitting) return
    setSubmissionMode(analyzeNow ? "analyze" : "manual")
    setSubmitting(true)
    setError(null)
    try {
      const response = await fetch("/api/signal/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_input: businessInput,
          observation: observation.trim() || null,
          analyze_now: analyzeNow,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Analysis could not be queued.")
      router.push(data.workspace_url)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis could not be queued.")
    } finally {
      setSubmitting(false)
    }
  }

  function submitAnalysis(event: React.FormEvent) {
    event.preventDefault()
    void createLead(true)
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Signal"
        title="Business analysis"
        subtitle="Paste one business or public source. Signal resolves the identity, separates evidence from inference, and prepares an honest verdict, concept direction, and manual sales path."
        actions={
          <SecondaryAction href="/dashboard/scout/discovery" icon={Radar}>
            Open Scout discovery
          </SecondaryAction>
        }
      />

      <SectionPanel
        title="Analyze a business"
        description="Accepts a Google Maps or Places URL, official website, Facebook or Instagram profile, business and city, public phone number, or a combination."
      >
        <form onSubmit={submitAnalysis} className="space-y-4">
          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground">Business or public source</span>
            <textarea
              value={businessInput}
              onChange={(event) => setBusinessInput(event.target.value)}
              rows={3}
              required
              placeholder="Oak & Ember Grooming, Southlake, TX — https://example.com"
              className="w-full resize-y rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10"
            />
          </label>
          {showObservation ? (
            <label className="block space-y-2">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                Private Mountline observation
                <StatusBadge>Never treated as a public fact</StatusBadge>
              </span>
              <textarea
                value={observation}
                onChange={(event) => setObservation(event.target.value)}
                rows={3}
                placeholder="Context from a visit, conversation, or team observation."
                className="w-full resize-y rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10"
              />
            </label>
          ) : (
            <button
              type="button"
              onClick={() => setShowObservation(true)}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
              <Plus className="h-4 w-4" /> Add a private observation
            </button>
          )}
          {error && (
            <div className="flex items-start gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <div className="flex flex-wrap items-center gap-3">
            <PrimaryAction type="submit" disabled={submitting} icon={submitting ? Loader2 : ArrowRight}>
              {submitting && submissionMode === "analyze" ? "Opening workspace…" : "Analyze in Signal"}
            </PrimaryAction>
            <button
              type="button"
              disabled={submitting || !businessInput.trim()}
              onClick={() => void createLead(false)}
              className="inline-flex h-10 items-center justify-center rounded-md border border-border px-3.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting && submissionMode === "manual" ? "Saving…" : "Add manually"}
            </button>
            <p className="text-xs text-muted-foreground">
              The lead is saved before research starts, so the workspace can be reopened safely.
            </p>
          </div>
        </form>
      </SectionPanel>

      <SectionPanel
        title="Signal inbox"
        description="Operational leads from focused analysis. Scout suggestions only appear here after Analyze in Signal is chosen."
      >
        {storageError && (
          <div className="mb-4 rounded-lg border border-yellow-500/25 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-100">
            Signal storage is not ready: {storageError}
          </div>
        )}
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2" role="tablist" aria-label="Signal inbox views">
            {views.map((item) => (
              <button
                key={item.key}
                type="button"
                role="tab"
                aria-selected={view === item.key}
                onClick={() => setView(item.key)}
                className={cn(
                  "rounded-md border px-3 py-2 text-xs font-medium transition-colors",
                  view === item.key
                    ? "border-foreground/25 bg-foreground text-background"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                {item.label} <span className="ml-1 font-mono opacity-70">{counts[item.key]}</span>
              </button>
            ))}
          </div>
          <label className="relative block w-full lg:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <span className="sr-only">Search Signal leads</span>
            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search business or city"
              className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:border-foreground/30"
            />
          </label>
        </div>

        {filtered.length > 0 ? (
          <CompactTable minWidth="980px">
            <thead>
              <tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-3 font-medium">Business</th>
                <th className="px-3 py-3 font-medium">Decision</th>
                <th className="px-3 py-3 font-medium">Opportunity</th>
                <th className="px-3 py-3 font-medium">Confidence</th>
                <th className="px-3 py-3 font-medium">Next action</th>
                <th className="px-3 py-3 font-medium">Due</th>
                <th className="px-3 py-3 text-right font-medium">Workspace</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((prospect) => (
                <tr key={prospect.id} className="align-top transition-colors hover:bg-muted/25">
                  <td className="px-3 py-4">
                    <p className="font-medium text-foreground">{prospect.business_name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {[prospect.city, prospect.state].filter(Boolean).join(", ") || prospect.industry || "Location needs review"}
                    </p>
                  </td>
                  <td className="px-3 py-4"><StatusBadge tone={statusTone(prospect)}>{statusLabel(prospect)}</StatusBadge></td>
                  <td className="px-3 py-4 text-sm capitalize text-muted-foreground">{prospect.opportunity_label || "unknown"}</td>
                  <td className="px-3 py-4 text-sm capitalize text-muted-foreground">{prospect.confidence_label || "unknown"}</td>
                  <td className="max-w-[280px] px-3 py-4 text-sm text-muted-foreground">{prospect.next_action || "Complete focused analysis"}</td>
                  <td className="px-3 py-4 text-sm text-muted-foreground">{formatDate(prospect.next_action_due_at || prospect.follow_up_date)}</td>
                  <td className="px-3 py-4 text-right">
                    <Link href={`/dashboard/signal/${prospect.id}`} className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground hover:underline">
                      Open <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </CompactTable>
        ) : (
          <EmptyState
            title={initialProspects.length ? "No leads match this view" : "No focused analyses yet"}
            icon={view === "pursue" ? CheckCircle2 : view === "followups" ? Clock3 : ShieldQuestion}
          >
            {initialProspects.length
              ? "Choose another view or clear the search."
              : "Submit one known business above. Signal will save it before analysis begins."}
          </EmptyState>
        )}
      </SectionPanel>
    </div>
  )
}
