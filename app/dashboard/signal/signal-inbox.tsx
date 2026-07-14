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
import { parseSignalBusinessInput } from "@/lib/signal/input-parser"
import { signalIdentityStateLabel } from "@/lib/signal/identity-resolution"
import { cn } from "@/lib/utils"

type InboxView = "action" | "pursue" | "verify" | "followups" | "all"

const views: Array<{ key: InboxView; label: string }> = [
  { key: "action", label: "Action needed" },
  { key: "verify", label: "Finish verification" },
  { key: "pursue", label: "Ready to pursue" },
  { key: "followups", label: "Follow-ups due" },
  { key: "all", label: "All leads" },
]

function due(value: string | null | undefined) {
  return Boolean(value && new Date(value).getTime() <= Date.now())
}

function matchesView(prospect: SignalProspect, view: InboxView) {
  if (view === "pursue") return prospect.verdict === "pursue" && prospect.analysis_status === "ready" && prospect.lead_lifecycle === "operational"
  if (view === "verify") {
    return ["draft_input", "resolving", "needs_confirmation"].includes(prospect.lead_lifecycle || "needs_confirmation")
  }
  if (view === "followups") return due(prospect.next_action_due_at || prospect.follow_up_date)
  if (view === "action") {
    return !["draft_input", "resolving", "needs_confirmation", "archived", "rejected"].includes(prospect.lead_lifecycle || "needs_confirmation") && (
      prospect.analysis_status === "failed" || Boolean(prospect.next_action) || due(prospect.next_action_due_at || prospect.follow_up_date)
    )
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
  const [editingParse, setEditingParse] = useState(false)
  const [parsedOverrides, setParsedOverrides] = useState({ business_name: "", address: "", phone: "", website_url: "" })
  const parsedPreview = useMemo(() => parseSignalBusinessInput(businessInput, {
    businessName: parsedOverrides.business_name || undefined,
    address: parsedOverrides.address || undefined,
    phone: parsedOverrides.phone || undefined,
    websiteUrl: parsedOverrides.website_url || undefined,
  }), [businessInput, parsedOverrides])

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    return initialProspects.filter((prospect) => {
      const viewMatch = matchesView(prospect, view)
      const queryMatch = !query || [
        prospect.business_name,
        prospect.display_name,
        prospect.submitted_name,
        prospect.canonical_name,
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
          parsed_overrides: {
            business_name: parsedOverrides.business_name || null,
            address: parsedOverrides.address || null,
            phone: parsedOverrides.phone || null,
            website_url: parsedOverrides.website_url || null,
          },
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
              onChange={(event) => { setBusinessInput(event.target.value); setParsedOverrides({ business_name: "", address: "", phone: "", website_url: "" }); setEditingParse(false) }}
              rows={3}
              required
              placeholder="Oak & Ember Grooming, Southlake, TX — https://example.com"
              className="w-full resize-y rounded-lg border border-border bg-background px-3.5 py-3 text-sm outline-none transition focus:border-foreground/30 focus:ring-2 focus:ring-foreground/10"
            />
          </label>
          {businessInput.trim() && (
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="grid flex-1 gap-2 text-sm sm:grid-cols-2 xl:grid-cols-4">
                  <div><p className="text-xs text-muted-foreground">Business</p><p className="mt-1 font-medium text-foreground">{parsedPreview.submittedName || "Needs a business name"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Location</p><p className="mt-1 text-foreground">{parsedPreview.submittedAddress || parsedPreview.submittedLocation || "Not supplied"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Phone</p><p className="mt-1 text-foreground">{parsedPreview.phone || "Not supplied"}</p></div>
                  <div><p className="text-xs text-muted-foreground">Identity anchor</p><p className="mt-1 text-foreground">{parsedPreview.identityAnchorType.replace(/_/g, " ")} · {parsedPreview.identityAnchorStrength}</p></div>
                </div>
                <button type="button" onClick={() => { setEditingParse((value) => !value); if (!editingParse) setParsedOverrides({ business_name: parsedPreview.submittedName || "", address: parsedPreview.submittedAddress || "", phone: parsedPreview.phone || "", website_url: parsedPreview.officialWebsiteUrl || "" }) }} className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">{editingParse ? "Done" : "Correct parse"}</button>
              </div>
              {editingParse && <div className="mt-3 grid gap-3 border-t border-border pt-3 sm:grid-cols-2"><label className="space-y-1"><span className="text-xs text-muted-foreground">Business name</span><input value={parsedOverrides.business_name} onChange={(event) => setParsedOverrides((current) => ({ ...current, business_name: event.target.value }))} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" /></label><label className="space-y-1"><span className="text-xs text-muted-foreground">Full address</span><input value={parsedOverrides.address} onChange={(event) => setParsedOverrides((current) => ({ ...current, address: event.target.value }))} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" /></label><label className="space-y-1"><span className="text-xs text-muted-foreground">Phone</span><input value={parsedOverrides.phone} onChange={(event) => setParsedOverrides((current) => ({ ...current, phone: event.target.value }))} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" /></label><label className="space-y-1"><span className="text-xs text-muted-foreground">Official website</span><input value={parsedOverrides.website_url} onChange={(event) => setParsedOverrides((current) => ({ ...current, website_url: event.target.value }))} className="h-9 w-full rounded-md border border-border bg-background px-3 text-sm" /></label></div>}
            </div>
          )}
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
            <div className="flex items-start gap-2 rounded-lg border border-error-border bg-error-soft px-3 py-2 text-sm text-error-foreground">
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
              Signal saves a draft before research starts, then promotes it only after identity resolution.
            </p>
          </div>
        </form>
      </SectionPanel>

      <SectionPanel
        title="Signal inbox"
        description="Operational leads from focused analysis. Scout suggestions only appear here after Analyze in Signal is chosen."
      >
        {storageError && (
          <div className="mb-4 rounded-lg border border-warning-border bg-warning-soft px-3 py-2 text-sm text-warning-foreground">
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
                    {item.label} {counts[item.key] > 0 && <span className="ml-1 font-mono opacity-70">{counts[item.key]}</span>}
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
                    <p className="font-medium text-foreground">{prospect.display_name || prospect.submitted_name || prospect.canonical_name || prospect.business_name}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {prospect.submitted_location || prospect.public_address || [prospect.city, prospect.state].filter(Boolean).join(", ") || "Location needs review"}
                    </p>
                  </td>
                  <td className="px-3 py-4"><StatusBadge tone={statusTone(prospect)}>{statusLabel(prospect)}</StatusBadge><p className="mt-1 text-xs text-muted-foreground">{signalIdentityStateLabel(prospect.identity_resolution_state)}</p></td>
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
