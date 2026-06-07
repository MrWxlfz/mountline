"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  MoreHorizontal,
  Pause,
  Play,
  RadioTower,
  Search,
  UserPlus,
  XCircle,
} from "lucide-react"
import {
  EmptyState,
  MetricStrip,
  PageHeader,
  PrimaryAction,
  SecondaryAction,
  SectionPanel,
  StatusBadge,
  priorityTone,
} from "@/components/dashboard/dashboard-ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getSignalPlaybook } from "@/lib/signal/playbooks"
import type { SignalMarketUsageEstimate } from "@/lib/signal/providers"
import type {
  SignalMarket,
  SignalMarketCandidate,
} from "@/lib/supabase/types"

type TabKey = "ranked" | "needs_confirmation" | "duplicates" | "suppressed" | "failed" | "all"

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "ranked", label: "Ranked" },
  { key: "needs_confirmation", label: "Needs Confirmation" },
  { key: "duplicates", label: "Duplicates" },
  { key: "suppressed", label: "Suppressed" },
  { key: "failed", label: "Failed" },
  { key: "all", label: "All" },
]

function statusTone(status: string) {
  if (status === "ready_for_review" || status === "completed") return "green" as const
  if (status === "discovering" || status === "researching" || status === "scoring") return "blue" as const
  if (status === "failed") return "red" as const
  if (status === "paused") return "amber" as const
  return "default" as const
}

function progressValue(candidates: SignalMarketCandidate[]) {
  if (candidates.length === 0) return 0
  const done = candidates.filter((candidate) =>
    ["quick_scored", "visual_shortlisted", "imported_to_signal", "approved"].includes(candidate.research_state),
  ).length
  return Math.round((done / candidates.length) * 100)
}

function actualUsage(market: SignalMarket) {
  return market.actual_credit_usage && typeof market.actual_credit_usage === "object"
    ? market.actual_credit_usage as Record<string, unknown>
    : {}
}

function evidenceGraph(candidate: SignalMarketCandidate) {
  return candidate.evidence_graph && typeof candidate.evidence_graph === "object"
    ? candidate.evidence_graph as Record<string, unknown>
    : null
}

function evidenceItems(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object")
    : []
}

function itemText(item: Record<string, unknown>) {
  return typeof item.snippet === "string" ? item.snippet : ""
}

function itemUrl(item: Record<string, unknown>) {
  return typeof item.url === "string" ? item.url : null
}

export function SignalMarketDetail({
  estimate,
  initialCandidates,
  initialMarket,
}: {
  estimate: SignalMarketUsageEstimate
  initialCandidates: SignalMarketCandidate[]
  initialMarket: SignalMarket
}) {
  const router = useRouter()
  const [market, setMarket] = useState(initialMarket)
  const [candidates, setCandidates] = useState(initialCandidates)
  const [tab, setTab] = useState<TabKey>("ranked")
  const [working, setWorking] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [evidenceOpen, setEvidenceOpen] = useState<string | null>(null)

  const counts = useMemo(() => {
    const countState = (state: string) =>
      candidates.filter((candidate) => candidate.research_state === state).length
    return {
      discovered: candidates.length,
      suppressed: candidates.filter((candidate) => candidate.suppression_state === "suppressed" || candidate.research_state === "suppressed").length,
      duplicates: candidates.filter((candidate) => candidate.duplicate_state && candidate.duplicate_state !== "none").length,
      official: candidates.filter((candidate) => candidate.confirmed_official_url || candidate.likely_official_url).length,
      scored: candidates.filter((candidate) => candidate.quick_score_state && candidate.quick_score_state !== "not_started").length,
      visual: candidates.filter((candidate) => candidate.visual_state).length,
      aLeads: candidates.filter((candidate) => candidate.preliminary_priority === "A").length,
      bLeads: candidates.filter((candidate) => candidate.preliminary_priority === "B").length,
      needsReview: countState("needs_confirmation") + countState("official_site_resolved"),
      failed: countState("failed"),
    }
  }, [candidates])

  const rows = useMemo(() => {
    const sorted = [...candidates].sort((a, b) => {
      const priorityRank: Record<string, number> = { A: 4, B: 3, C: 2, skip: 1 }
      return (
        (priorityRank[b.preliminary_priority || ""] || 0) -
          (priorityRank[a.preliminary_priority || ""] || 0) ||
        (b.website_opportunity_score || 0) - (a.website_opportunity_score || 0)
      )
    })

    if (tab === "ranked") {
      return sorted.filter((candidate) =>
        ["quick_scored", "visual_shortlisted", "imported_to_signal"].includes(candidate.research_state) &&
        candidate.suppression_state !== "suppressed" &&
        candidate.duplicate_state !== "exact",
      )
    }
    if (tab === "needs_confirmation") {
      return sorted.filter((candidate) =>
        ["needs_confirmation", "official_site_resolved"].includes(candidate.research_state) &&
        !candidate.confirmed_official_url,
      )
    }
    if (tab === "duplicates") {
      return sorted.filter((candidate) => candidate.duplicate_state && candidate.duplicate_state !== "none")
    }
    if (tab === "suppressed") {
      return sorted.filter((candidate) => candidate.suppression_state === "suppressed" || candidate.research_state === "suppressed")
    }
    if (tab === "failed") {
      return sorted.filter((candidate) => candidate.research_state === "failed")
    }
    return sorted
  }, [candidates, tab])

  const runMarket = async () => {
    const confirmed = window.confirm(
      [
        `Run ${market.name}?`,
        "",
        `Tavily operations: ${estimate.tavily_searches}`,
        `Firecrawl pages: ${estimate.estimated_firecrawl_pages}`,
        `Screenshot shortlist: ${estimate.estimated_screenshots}`,
        `Fast analyses: ${estimate.estimated_fast_ai_analyses}`,
        `Estimated credit budget: ${estimate.estimated_credit_budget}`,
      ].join("\n"),
    )
    if (!confirmed) return

    setWorking("run")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/markets/${market.id}/run`, { method: "POST" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Market build failed.")
        return
      }
      setMarket(data.market)
      setCandidates(data.candidates || [])
      setMessage("Market build complete. Review ranked candidates before approving prospects.")
      router.refresh()
    } catch {
      setError("Market build failed.")
    } finally {
      setWorking(null)
    }
  }

  const patchMarket = async (body: Record<string, unknown>) => {
    setWorking("market")
    setError(null)
    try {
      const response = await fetch(`/api/signal/markets/${market.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Market could not be updated.")
        return
      }
      setMarket(data.market)
      router.refresh()
    } catch {
      setError("Market could not be updated.")
    } finally {
      setWorking(null)
    }
  }

  const updateCandidate = async (candidate: SignalMarketCandidate, body: Record<string, unknown>) => {
    setWorking(candidate.id)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/markets/${market.id}/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Candidate could not be updated.")
        return
      }
      setCandidates((current) =>
        current.map((item) => (item.id === candidate.id ? data.candidate : item)),
      )
      setMessage("Candidate updated.")
      router.refresh()
    } catch {
      setError("Candidate could not be updated.")
    } finally {
      setWorking(null)
    }
  }

  const approveCandidate = async (candidate: SignalMarketCandidate, addToFocus: boolean) => {
    setWorking(`approve:${candidate.id}`)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/markets/${market.id}/candidates/${candidate.id}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ add_to_focus: addToFocus }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Candidate could not be approved.")
        return
      }
      setCandidates((current) =>
        current.map((item) => (item.id === candidate.id ? data.candidate : item)),
      )
      setMessage(addToFocus ? "Prospect approved and added to Focus Mode." : "Prospect approved.")
      router.refresh()
    } catch {
      setError("Candidate could not be approved.")
    } finally {
      setWorking(null)
    }
  }

  const confirmSite = (candidate: SignalMarketCandidate) => {
    const value = window.prompt(
      "Confirm official public website",
      candidate.confirmed_official_url || candidate.likely_official_url || candidate.candidate_url || "",
    )
    if (!value) return
    updateCandidate(candidate, { confirmed_official_url: value })
  }

  const correctCategory = (candidate: SignalMarketCandidate) => {
    const value = window.prompt(
      "Correct category key",
      candidate.category || "general_local_business",
    )
    if (!value) return
    updateCandidate(candidate, { category: value })
  }

  const progress = progressValue(candidates)
  const usage = actualUsage(market)

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Mountline Signal"
        title={market.name}
        subtitle={`${[market.city, market.state].filter(Boolean).join(", ")} · ${market.industries.map((key) => getSignalPlaybook(key).name).join(", ")}`}
        meta={<StatusBadge tone={statusTone(market.status)}>{market.status.replace(/_/g, " ")}</StatusBadge>}
        actions={
          <>
            <SecondaryAction href="/dashboard/signal/markets" icon={ArrowLeft}>Markets</SecondaryAction>
            <PrimaryAction onClick={runMarket} icon={working === "run" ? Loader2 : Play} disabled={working === "run"}>
              {market.status === "draft" ? "Run Market" : "Resume"}
            </PrimaryAction>
            <SecondaryAction onClick={() => patchMarket({ status: "paused", next_action: "Market paused by Mountline team." })} icon={Pause} disabled={working === "market"}>
              Pause
            </SecondaryAction>
          </>
        }
      />

      {(message || error) && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            error
              ? "border-red-500/25 bg-red-500/10 text-red-300"
              : "border-green-500/25 bg-green-500/10 text-green-300"
          }`}
        >
          {error || message}
        </div>
      )}

      <SectionPanel title="Progress" description={market.next_action || "Run the market to begin discovery."}>
        <div className="h-1.5 rounded-full bg-muted">
          <div className="h-full rounded-full bg-blue-400" style={{ width: `${Math.min(progress, 100)}%` }} />
        </div>
        <div className="mt-4 grid gap-2 text-xs text-muted-foreground md:grid-cols-4 xl:grid-cols-7">
          {["Finding businesses", "Removing rejected matches", "Detecting duplicates", "Confirming official sites", "Reading public websites", "Calculating opportunity", "Preparing ranked review"].map((label, index) => (
            <div key={label} className="rounded-md border border-border bg-muted/20 px-3 py-2">
              <span className={index <= Math.round((progress / 100) * 6) ? "text-foreground" : ""}>{label}</span>
            </div>
          ))}
        </div>
      </SectionPanel>

      <MetricStrip
        items={[
          { label: "Discovered", value: counts.discovered },
          { label: "Suppressed", value: counts.suppressed, tone: counts.suppressed ? "red" : "default" },
          { label: "Duplicates", value: counts.duplicates, tone: counts.duplicates ? "amber" : "default" },
          { label: "A leads", value: counts.aLeads, tone: counts.aLeads ? "green" : "default" },
          { label: "B leads", value: counts.bLeads, tone: counts.bLeads ? "blue" : "default" },
        ]}
      />

      <section className="grid gap-5 lg:grid-cols-2">
        <SectionPanel title="Usage Estimate" description="Configured before the run.">
          <UsageRows
            rows={[
              ["Provider mode", estimate.provider_mode],
              ["Research depth", estimate.research_depth],
              ["Tavily operations", estimate.tavily_searches],
              ["Firecrawl pages", estimate.estimated_firecrawl_pages],
              ["Screenshot count", estimate.estimated_screenshots],
              ["Fast-analysis count", estimate.estimated_fast_ai_analyses],
              ["Credit budget", estimate.estimated_credit_budget],
            ]}
          />
        </SectionPanel>
        <SectionPanel title="Actual Usage" description="Recorded as the market runs.">
          <UsageRows
            rows={[
              ["Tavily searches", String(usage.tavily_searches ?? 0)],
              ["Firecrawl searches", String(usage.firecrawl_searches ?? 0)],
              ["Firecrawl pages", String(usage.firecrawl_pages ?? 0)],
              ["Firecrawl credits", String(usage.firecrawl_credits ?? 0)],
              ["Fast analyses", String(usage.ai_fast_analyses ?? 0)],
              ["Screenshot shortlist", String(usage.screenshots ?? 0)],
              ["Stop reason", String(usage.stopped_reason || "-")],
            ]}
          />
        </SectionPanel>
      </section>

      <SectionPanel
        title="Review Queue"
        description="Approve only prospects that should enter Signal. No outbound contact is sent."
        action={
          <div className="flex flex-wrap gap-2">
            {tabs.map((item) => (
              <button
                key={item.key}
                type="button"
                onClick={() => setTab(item.key)}
                className={`h-8 rounded-md border px-3 text-xs font-medium transition-colors ${
                  tab === item.key
                    ? "border-foreground bg-foreground text-background"
                    : "border-border text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        }
      >
        {rows.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1120px] text-sm">
              <thead className="border-b border-border bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  {[
                    "Business",
                    "City",
                    "Category",
                    "Official Site",
                    "Website",
                    "Systems",
                    "Readiness",
                    "Priority",
                    "Confidence",
                    "Lane",
                    "Demo",
                    "State",
                    "",
                  ].map((heading) => (
                    <th key={heading} className="px-3 py-3 text-left font-medium">{heading}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {rows.map((candidate) => (
                  <MarketCandidateRow
                    key={candidate.id}
                    candidate={candidate}
                    evidenceOpen={evidenceOpen === candidate.id}
                    onApprove={() => approveCandidate(candidate, false)}
                    onApproveFocus={() => approveCandidate(candidate, true)}
                    onConfirmSite={() => confirmSite(candidate)}
                    onCorrectCategory={() => correctCategory(candidate)}
                    onMarkDuplicate={() => updateCandidate(candidate, { duplicate_state: "possible", research_state: "duplicate" })}
                    onRejectMarket={() => updateCandidate(candidate, { research_state: "rejected", suppression_state: "market_rejected", reason: "Rejected for this market." })}
                    onRejectPermanent={() => updateCandidate(candidate, { research_state: "rejected", suppression_state: "suppressed", reason: "Rejected permanently from market review." })}
                    onRestore={() => updateCandidate(candidate, { research_state: "discovered", suppression_state: "restored" })}
                    onToggleEvidence={() => setEvidenceOpen((current) => current === candidate.id ? null : candidate.id)}
                    working={Boolean(working && working.includes(candidate.id))}
                  />
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState
            title={candidates.length ? "No candidates in this tab" : "No candidates yet"}
            icon={RadioTower}
            action={candidates.length ? undefined : <PrimaryAction onClick={runMarket} icon={Play}>Run Market</PrimaryAction>}
          >
            {candidates.length ? "Switch tabs or adjust candidate states from the action menu." : "Run the market to discover and rank prospects."}
          </EmptyState>
        )}
      </SectionPanel>
    </div>
  )
}

function UsageRows({ rows }: { rows: Array<[string, string | number]> }) {
  return (
    <div className="space-y-2 text-sm">
      {rows.map(([label, value]) => (
        <div key={label} className="flex items-center justify-between gap-4 border-b border-border/70 pb-2 last:border-0 last:pb-0">
          <span className="text-muted-foreground">{label}</span>
          <span className="text-right font-mono text-foreground">{value}</span>
        </div>
      ))}
    </div>
  )
}

function MarketCandidateRow({
  candidate,
  evidenceOpen,
  onApprove,
  onApproveFocus,
  onConfirmSite,
  onCorrectCategory,
  onMarkDuplicate,
  onRejectMarket,
  onRejectPermanent,
  onRestore,
  onToggleEvidence,
  working,
}: {
  candidate: SignalMarketCandidate
  evidenceOpen: boolean
  onApprove: () => void
  onApproveFocus: () => void
  onConfirmSite: () => void
  onCorrectCategory: () => void
  onMarkDuplicate: () => void
  onRejectMarket: () => void
  onRejectPermanent: () => void
  onRestore: () => void
  onToggleEvidence: () => void
  working: boolean
}) {
  const graph = evidenceGraph(candidate)
  const verified = evidenceItems(graph?.verified_facts)
  const inferences = evidenceItems(graph?.reasonable_inferences)
  const questions = evidenceItems(graph?.discovery_questions)
  const officialUrl = candidate.confirmed_official_url || candidate.likely_official_url || candidate.candidate_url

  return (
    <>
      <tr className="align-top transition-colors hover:bg-muted/30">
        <td className="px-3 py-3">
          <p className="font-medium text-foreground">{candidate.business_name}</p>
          {candidate.error_message && (
            <p className="mt-1 max-w-[240px] text-xs text-muted-foreground">{candidate.error_message}</p>
          )}
        </td>
        <td className="px-3 py-3 text-muted-foreground">{[candidate.city, candidate.state].filter(Boolean).join(", ") || "-"}</td>
        <td className="px-3 py-3 text-muted-foreground">
          <span>{candidate.category ? getSignalPlaybook(candidate.category).name : "-"}</span>
          <span className="block text-xs">{candidate.category_confidence || "unknown"}</span>
        </td>
        <td className="px-3 py-3">
          {officialUrl ? (
            <a href={officialUrl} target="_blank" rel="noreferrer" className="inline-flex max-w-[180px] items-center gap-1 truncate text-muted-foreground hover:text-foreground">
              {officialUrl}
              <ExternalLink className="h-3.5 w-3.5 shrink-0" />
            </a>
          ) : (
            <span className="text-muted-foreground">Needs confirmation</span>
          )}
        </td>
        <td className="px-3 py-3 font-mono text-muted-foreground">{candidate.website_opportunity_score ?? "-"}</td>
        <td className="px-3 py-3 font-mono text-muted-foreground">{candidate.systems_opportunity_score ?? "-"}</td>
        <td className="px-3 py-3 font-mono text-muted-foreground">{candidate.outreach_readiness_score ?? "-"}</td>
        <td className="px-3 py-3">
          <StatusBadge tone={priorityTone(candidate.preliminary_priority)}>{candidate.preliminary_priority || "-"}</StatusBadge>
        </td>
        <td className="px-3 py-3 text-muted-foreground">{candidate.confidence || "-"}</td>
        <td className="px-3 py-3 text-muted-foreground">{candidate.recommended_lane?.replace(/_/g, " ") || "-"}</td>
        <td className="px-3 py-3 text-muted-foreground">{candidate.relevant_demo || "-"}</td>
        <td className="px-3 py-3">
          <StatusBadge>{candidate.research_state.replace(/_/g, " ")}</StatusBadge>
        </td>
        <td className="px-3 py-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                type="button"
                disabled={working}
                className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                aria-label={`Actions for ${candidate.business_name}`}
              >
                {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onSelect={onApprove}>
                <CheckCircle2 className="h-4 w-4" />Approve Prospect
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onApproveFocus}>
                <UserPlus className="h-4 w-4" />Approve + Focus Mode
              </DropdownMenuItem>
              {candidate.imported_prospect_id && (
                <DropdownMenuItem asChild>
                  <Link href={`/dashboard/signal/${candidate.imported_prospect_id}`}>
                    <Search className="h-4 w-4" />Deep Dive
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onSelect={onToggleEvidence}>
                <ExternalLink className="h-4 w-4" />View Evidence
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onConfirmSite}>Confirm Site</DropdownMenuItem>
              <DropdownMenuItem onSelect={onCorrectCategory}>Correct Category</DropdownMenuItem>
              <DropdownMenuItem onSelect={onMarkDuplicate}>Mark Duplicate</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onSelect={onRejectMarket}>
                <XCircle className="h-4 w-4" />Reject This Market
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onRejectPermanent} className="text-red-300">
                <XCircle className="h-4 w-4" />Reject Permanently
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onRestore}>Restore</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </td>
      </tr>
      {evidenceOpen && (
        <tr>
          <td colSpan={13} className="bg-muted/20 px-3 py-4">
            <div className="grid gap-4 lg:grid-cols-3">
              <EvidenceList title="Verified Facts" items={verified} />
              <EvidenceList title="Reasonable Inferences" items={inferences} />
              <EvidenceList title="Discovery Questions" items={questions} />
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

function EvidenceList({ items, title }: { items: Array<Record<string, unknown>>; title: string }) {
  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <p className="text-sm font-medium text-foreground">{title}</p>
      <div className="mt-3 space-y-2">
        {items.length > 0 ? (
          items.slice(0, 6).map((item, index) => {
            const url = itemUrl(item)
            return (
              <div key={`${title}-${index}`} className="text-xs leading-5 text-muted-foreground">
                <p>{itemText(item)}</p>
                {url && (
                  <a href={url} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1 truncate hover:text-foreground">
                    {url}
                    <ExternalLink className="h-3 w-3 shrink-0" />
                  </a>
                )}
              </div>
            )
          })
        ) : (
          <p className="text-xs text-muted-foreground">No evidence stored yet.</p>
        )}
      </div>
    </div>
  )
}
