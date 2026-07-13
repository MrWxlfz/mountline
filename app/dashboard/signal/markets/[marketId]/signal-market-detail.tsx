"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Globe2,
  Loader2,
  MoreHorizontal,
  Pause,
  Play,
  RadioTower,
  RefreshCcw,
  Search,
  SlidersHorizontal,
  Timer,
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
import { formatRunStage, formatSignalLabel } from "@/lib/signal/presentation"
import type { SignalMarketUsageEstimate } from "@/lib/signal/providers"
import type {
  SignalJson,
  SignalMarket,
  SignalMarketCandidate,
  SignalMarketEvent,
} from "@/lib/supabase/types"

type TabKey = "ranked" | "needs_confirmation" | "duplicates" | "suppressed" | "failed" | "all"

const tabs: Array<{ key: TabKey; label: string }> = [
  { key: "ranked", label: "Ranked" },
  { key: "needs_confirmation", label: "Needs confirmation" },
  { key: "duplicates", label: "Duplicates" },
  { key: "suppressed", label: "Suppressed" },
  { key: "failed", label: "Failed" },
  { key: "all", label: "All" },
]

const runningStatuses = new Set(["discovering", "deduplicating", "researching", "scoring"])
const terminalStatuses = new Set(["ready_for_review", "completed", "failed", "paused"])

function statusTone(status: string) {
  if (status === "ready_for_review" || status === "completed") return "green" as const
  if (runningStatuses.has(status)) return "blue" as const
  if (status === "failed") return "red" as const
  if (status === "paused") return "amber" as const
  return "default" as const
}

function eventTone(stage: string) {
  if (stage === "ready") return "green" as const
  if (stage === "failed") return "red" as const
  if (stage === "paused" || stage === "suppressing" || stage === "deduplicating") return "amber" as const
  if (["discovering", "scraping_sites", "quick_scoring", "visual_analysis"].includes(stage)) return "blue" as const
  return "default" as const
}

function jsonObject(value: SignalJson | null | undefined) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : null
}

function progressSnapshot(market: SignalMarket, candidates: SignalMarketCandidate[]) {
  const progress = jsonObject(market.progress)
  if (progress) {
    const percent = typeof progress.progress_percent === "number" ? progress.progress_percent : null
    const current = typeof progress.progress_current === "number" ? progress.progress_current : 0
    const total = typeof progress.progress_total === "number" ? progress.progress_total : 0
    return {
      current,
      percent: percent ?? (total > 0 ? Math.round((current / total) * 100) : 0),
      stage: typeof progress.stage_label === "string" ? progress.stage_label : String(progress.stage || market.status),
      total,
    }
  }

  const done = candidates.filter((candidate) =>
    ["quick_scored", "visual_shortlisted", "imported_to_signal", "approved"].includes(candidate.research_state),
  ).length
  return {
    current: done,
    percent: candidates.length ? Math.round((done / candidates.length) * 100) : 0,
    stage: formatSignalLabel(market.status),
    total: candidates.length,
  }
}

function actualUsage(market: SignalMarket) {
  return jsonObject(market.actual_credit_usage) || {}
}

function displayName(candidate: SignalMarketCandidate) {
  return candidate.canonical_business_name || candidate.business_name
}

function domain(value: string | null | undefined) {
  if (!value) return null
  try {
    return new URL(value).hostname.replace(/^www\./, "")
  } catch {
    return value.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0] || value
  }
}

function officialUrl(candidate: SignalMarketCandidate) {
  return candidate.confirmed_official_url || candidate.likely_official_url || candidate.candidate_url
}

function evidenceGraph(candidate: SignalMarketCandidate) {
  return jsonObject(candidate.evidence_graph)
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

function topFacts(candidate: SignalMarketCandidate) {
  return evidenceItems(evidenceGraph(candidate)?.verified_facts)
    .map(itemText)
    .filter(Boolean)
    .slice(0, 2)
}

function topInference(candidate: SignalMarketCandidate) {
  return evidenceItems(evidenceGraph(candidate)?.reasonable_inferences)
    .map(itemText)
    .find(Boolean)
}

function firstDiscoveryQuestion(candidate: SignalMarketCandidate) {
  return evidenceItems(evidenceGraph(candidate)?.discovery_questions)
    .map(itemText)
    .find(Boolean)
}

function formatElapsed(value: string | null) {
  if (!value) return "-"
  const seconds = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 1000))
  if (seconds < 60) return `${seconds}s`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m`
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`
}

function formatTime(value: string) {
  return new Date(value).toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  })
}

function sortCandidates(candidates: SignalMarketCandidate[]) {
  const priorityRank: Record<string, number> = { A: 4, B: 3, C: 2, skip: 1 }
  return [...candidates].sort((a, b) => (
    (priorityRank[b.preliminary_priority || ""] || 0) -
      (priorityRank[a.preliminary_priority || ""] || 0) ||
    (b.website_opportunity_score || 0) - (a.website_opportunity_score || 0)
  ))
}

export function SignalMarketDetail({
  estimate,
  initialCandidates,
  initialEvents,
  initialMarket,
}: {
  estimate: SignalMarketUsageEstimate
  initialCandidates: SignalMarketCandidate[]
  initialEvents: SignalMarketEvent[]
  initialMarket: SignalMarket
}) {
  const router = useRouter()
  const [market, setMarket] = useState(initialMarket)
  const [candidates, setCandidates] = useState(initialCandidates)
  const [events, setEvents] = useState(initialEvents)
  const [tab, setTab] = useState<TabKey>("ranked")
  const [working, setWorking] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [rawOpen, setRawOpen] = useState(false)
  const [removedOpen, setRemovedOpen] = useState(false)
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
      needsConfirmation: candidates.filter((candidate) =>
        candidate.requires_confirmation ||
        !candidate.confirmed_official_url ||
        ["needs_confirmation", "official_site_resolved"].includes(candidate.research_state),
      ).length,
      failed: countState("failed"),
      removed: candidates.filter((candidate) =>
        candidate.suppression_state === "suppressed" ||
        candidate.research_state === "suppressed" ||
        candidate.research_state === "duplicate" ||
        candidate.research_state === "rejected" ||
        (candidate.duplicate_state && candidate.duplicate_state !== "none"),
      ).length,
    }
  }, [candidates])

  const sorted = useMemo(() => sortCandidates(candidates), [candidates])
  const topProspects = useMemo(
    () =>
      sorted
        .filter((candidate) =>
          ["quick_scored", "visual_shortlisted", "imported_to_signal"].includes(candidate.research_state) &&
          ["A", "B"].includes(candidate.preliminary_priority || "") &&
          candidate.suppression_state !== "suppressed" &&
          candidate.duplicate_state !== "exact" &&
          !candidate.requires_confirmation,
        )
        .slice(0, 5),
    [sorted],
  )
  const quickLook = useMemo(
    () =>
      sorted
        .filter((candidate) =>
          ["quick_scored", "visual_shortlisted"].includes(candidate.research_state) &&
          !topProspects.some((top) => top.id === candidate.id) &&
          candidate.suppression_state !== "suppressed" &&
          candidate.duplicate_state !== "exact" &&
          !candidate.requires_confirmation,
        )
        .slice(0, 8),
    [sorted, topProspects],
  )
  const needsConfirmation = useMemo(
    () =>
      sorted.filter((candidate) =>
        candidate.requires_confirmation ||
        !candidate.confirmed_official_url ||
        ["needs_confirmation", "official_site_resolved"].includes(candidate.research_state),
      ).slice(0, 8),
    [sorted],
  )
  const removedCandidates = useMemo(
    () =>
      sorted.filter((candidate) =>
        candidate.suppression_state === "suppressed" ||
        candidate.research_state === "suppressed" ||
        candidate.research_state === "duplicate" ||
        candidate.research_state === "rejected" ||
        (candidate.duplicate_state && candidate.duplicate_state !== "none") ||
        candidate.research_state === "failed",
      ),
    [sorted],
  )
  const rawRows = useMemo(() => {
    if (tab === "ranked") {
      return sorted.filter((candidate) =>
        ["quick_scored", "visual_shortlisted", "imported_to_signal"].includes(candidate.research_state) &&
        candidate.suppression_state !== "suppressed" &&
        candidate.duplicate_state !== "exact",
      )
    }
    if (tab === "needs_confirmation") return needsConfirmation
    if (tab === "duplicates") {
      return sorted.filter((candidate) => candidate.duplicate_state && candidate.duplicate_state !== "none")
    }
    if (tab === "suppressed") {
      return sorted.filter((candidate) => candidate.suppression_state === "suppressed" || candidate.research_state === "suppressed")
    }
    if (tab === "failed") return sorted.filter((candidate) => candidate.research_state === "failed")
    return sorted
  }, [needsConfirmation, sorted, tab])

  const progress = progressSnapshot(market, candidates)
  const usage = actualUsage(market)
  const isRunning = runningStatuses.has(market.status) || working === "run"
  const isReady = market.status === "ready_for_review" || market.status === "completed"
  const industryLabel = market.industries.map((key) => getSignalPlaybook(key).name.toLowerCase()).join(", ")
  const evidenceCandidate = evidenceOpen
    ? candidates.find((candidate) => candidate.id === evidenceOpen) || null
    : null

  useEffect(() => {
    if (!isRunning || terminalStatuses.has(market.status)) return

    let cancelled = false
    const controller = new AbortController()

    const poll = async () => {
      try {
        const response = await fetch(`/api/signal/markets/${market.id}`, {
          cache: "no-store",
          signal: controller.signal,
        })
        const data = await response.json().catch(() => ({}))
        if (!response.ok || cancelled) return
        setMarket(data.market)
        setCandidates(data.candidates || [])
        setEvents(data.events || [])
      } catch {
        if (!cancelled) setError("Live market state could not be refreshed.")
      }
    }

    poll()
    const interval = window.setInterval(poll, 1500)
    return () => {
      cancelled = true
      controller.abort()
      window.clearInterval(interval)
    }
  }, [isRunning, market.id, market.status])

  const runMarket = async () => {
    setWorking("run")
    setError(null)
    setMessage(null)
    setMarket((current) => ({
      ...current,
      status: "discovering",
      next_action: "Starting research. Live progress will appear here.",
    }))
    try {
      const response = await fetch(`/api/signal/markets/${market.id}/run`, { method: "POST" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Market build failed.")
        return
      }
      setMarket(data.market)
      setCandidates(data.candidates || [])
      setEvents(data.events || [])
      setMessage("Research complete. Review ranked prospects before approving them.")
      router.refresh()
    } catch {
      setError("Market build failed.")
    } finally {
      setWorking(null)
    }
  }

  const refreshMarket = async () => {
    setWorking("refresh")
    setError(null)
    try {
      const response = await fetch(`/api/signal/markets/${market.id}`, { cache: "no-store" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Market could not be refreshed.")
        return
      }
      setMarket(data.market)
      setCandidates(data.candidates || [])
      setEvents(data.events || [])
    } catch {
      setError("Market could not be refreshed.")
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
      await refreshMarket()
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
      await refreshMarket()
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

  const editIdentity = (candidate: SignalMarketCandidate) => {
    const value = window.prompt("Canonical business name", displayName(candidate))
    if (!value) return
    updateCandidate(candidate, {
      canonical_business_name: value,
      reason: "Manual identity correction from market review.",
    })
  }

  const correctCategory = (candidate: SignalMarketCandidate) => {
    const value = window.prompt(
      "Correct category key",
      candidate.category || "general_local_business",
    )
    if (!value) return
    updateCandidate(candidate, { category: value })
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Mountline Signal"
        title={isRunning ? `Researching ${market.city} ${industryLabel}` : market.name}
        subtitle={
          isRunning
            ? "Signal is finding businesses, verifying official websites, and scoring public opportunities."
            : `${[market.city, market.state].filter(Boolean).join(", ")} · ${market.industries.map((key) => getSignalPlaybook(key).name).join(", ")}`
        }
        meta={<StatusBadge tone={statusTone(market.status)}>{formatSignalLabel(market.status)}</StatusBadge>}
        actions={
          <>
            <SecondaryAction href="/dashboard/signal/markets" icon={ArrowLeft}>Markets</SecondaryAction>
            <SecondaryAction href="/dashboard/signal" icon={RadioTower}>Continue in background</SecondaryAction>
            <PrimaryAction onClick={runMarket} icon={working === "run" ? Loader2 : market.status === "failed" ? RefreshCcw : Play} disabled={working === "run"}>
              {market.status === "draft" ? "Start research" : market.status === "failed" ? "Retry failed" : "Resume"}
            </PrimaryAction>
            {isRunning && (
              <SecondaryAction onClick={() => patchMarket({ status: "paused", next_action: "Market paused by Mountline team." })} icon={Pause} disabled={working === "market"}>
                Pause
              </SecondaryAction>
            )}
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

      <section className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <SectionPanel title="Live research" description={market.next_action || "Start research to begin discovery."}>
          <div className="space-y-5">
            <div>
              <div className="flex items-center justify-between gap-4 text-sm">
                <span className="font-medium text-foreground">{progress.stage}</span>
                <span className="text-muted-foreground">{progress.percent}%</span>
              </div>
              <div className="mt-2 h-2 rounded-full bg-muted">
                <div className="h-full rounded-full bg-blue-400 transition-all" style={{ width: `${Math.min(progress.percent, 100)}%` }} />
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span>{progress.total ? `${progress.current} of ${progress.total}` : "Waiting for persisted progress"}</span>
                <span className="inline-flex items-center gap-1">
                  <Timer className="h-3.5 w-3.5" />
                  {formatElapsed(market.last_run_at)}
                </span>
                <span>{usage.stopped_reason ? formatSignalLabel(String(usage.stopped_reason)) : "Safe official-site research only"}</span>
              </div>
            </div>

            <MetricStrip
              items={[
                { label: "Candidates discovered", value: counts.discovered, tone: counts.discovered ? "blue" : "default" },
                { label: "Official sites resolved", value: counts.official, tone: counts.official ? "green" : "default" },
                { label: "Removed", value: counts.removed, tone: counts.removed ? "amber" : "default" },
                { label: "Websites scanned", value: counts.scored, tone: counts.scored ? "blue" : "default" },
                { label: "Visual shortlist", value: counts.visual, tone: counts.visual ? "amber" : "default" },
              ]}
            />

            <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-2 xl:grid-cols-3">
              <UsagePill label="Research mode" value={formatSignalLabel(market.provider_mode || estimate.provider_mode)} />
              <UsagePill label="Official pages checked" value={String(usage.firecrawl_pages ?? 0)} />
              <UsagePill label="Site-analysis usage" value={String(usage.firecrawl_credits ?? 0)} />
              <UsagePill label="Search checks" value={String(usage.tavily_searches ?? 0)} />
              <UsagePill label="Fast analyses" value={String(usage.ai_fast_analyses ?? 0)} />
              <UsagePill label="Depth" value={market.research_depth} />
            </div>
          </div>
        </SectionPanel>

        <SectionPanel
          title="Activity"
          description="Persisted market events. This feed updates while the run is active."
          action={
            <button
              type="button"
              onClick={refreshMarket}
              disabled={working === "refresh"}
              className="inline-flex h-8 items-center gap-2 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              {working === "refresh" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCcw className="h-3.5 w-3.5" />}
              Refresh
            </button>
          }
        >
          <div className="max-h-[360px] space-y-3 overflow-auto pr-1">
            {events.length > 0 ? (
              events.slice(0, 18).map((event) => (
                <div key={event.id} className="grid grid-cols-[72px_1fr] gap-3 text-sm">
                  <span className="pt-0.5 font-mono text-xs text-muted-foreground">{formatTime(event.created_at)}</span>
                  <div className="min-w-0 border-l border-border pl-3">
                    <StatusBadge tone={eventTone(event.stage)}>{formatRunStage(event.stage)}</StatusBadge>
                    <p className="mt-1 leading-5 text-foreground">{event.message}</p>
                    {event.progress_total ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        {event.progress_current || 0} of {event.progress_total}
                      </p>
                    ) : null}
                  </div>
                </div>
              ))
            ) : (
              <EmptyState title="No persisted activity yet" icon={RadioTower}>
                Start research to create real progress events.
              </EmptyState>
            )}
          </div>
        </SectionPanel>
      </section>

      {isReady && (
        <section className="space-y-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Signal found {topProspects.length} prospect{topProspects.length === 1 ? "" : "s"} worth reviewing.
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Signal reviewed {counts.scored} public business website{counts.scored === 1 ? "" : "s"}, removed {counts.removed} duplicate or suppressed result{counts.removed === 1 ? "" : "s"}, and shortlisted the strongest opportunities.
            </p>
          </div>
        </section>
      )}

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="font-semibold tracking-tight text-foreground">Top prospects</h2>
            <p className="mt-1 text-sm text-muted-foreground">Best opportunities appear first. Approval creates or merges a Signal prospect; it does not contact the business.</p>
          </div>
          <StatusBadge tone={topProspects.length ? "blue" : "default"}>{topProspects.length} shown</StatusBadge>
        </div>

        {topProspects.length > 0 ? (
          <div className="grid gap-4 xl:grid-cols-2">
            {topProspects.map((candidate) => (
              <ProspectCard
                key={candidate.id}
                candidate={candidate}
                onApprove={() => approveCandidate(candidate, false)}
                onApproveFocus={() => approveCandidate(candidate, true)}
                onConfirmSite={() => confirmSite(candidate)}
                onCorrectCategory={() => correctCategory(candidate)}
                onEditIdentity={() => editIdentity(candidate)}
                onReject={() => updateCandidate(candidate, { research_state: "rejected", suppression_state: "suppressed", reason: "Rejected permanently from market review." })}
                working={Boolean(working && working.includes(candidate.id))}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            title={candidates.length ? "No strong prospects ready yet" : "No prospects discovered yet"}
            icon={RadioTower}
            action={candidates.length ? undefined : <PrimaryAction onClick={runMarket} icon={Play}>Start research</PrimaryAction>}
          >
            {candidates.length ? "Review candidates needing confirmation or retry failed items." : "Run the market to discover and rank prospects."}
          </EmptyState>
        )}
      </section>

      {quickLook.length > 0 && (
        <SectionPanel title="Worth a quick look" description="Lower-priority candidates that may still be useful after the top prospects.">
          <div className="divide-y divide-border">
            {quickLook.map((candidate) => (
              <CompactCandidateRow
                key={candidate.id}
                candidate={candidate}
                onApprove={() => approveCandidate(candidate, false)}
                onOpenEvidence={() => setEvidenceOpen((current) => current === candidate.id ? null : candidate.id)}
              />
            ))}
          </div>
        </SectionPanel>
      )}

      {needsConfirmation.length > 0 && (
        <SectionPanel title="Needs confirmation" description="Ambiguous identities or official domains stay out of the top queue until reviewed.">
          <div className="space-y-3">
            {needsConfirmation.map((candidate) => (
              <ConfirmationRow
                key={candidate.id}
                candidate={candidate}
                onConfirmSite={() => confirmSite(candidate)}
                onEditIdentity={() => editIdentity(candidate)}
                onReject={() => updateCandidate(candidate, { research_state: "rejected", suppression_state: "market_rejected", reason: "Rejected during identity review." })}
              />
            ))}
          </div>
        </SectionPanel>
      )}

      <SectionPanel
        title="Removed automatically"
        description={`${removedCandidates.length} duplicate, suppressed, rejected, or failed result${removedCandidates.length === 1 ? "" : "s"}.`}
        action={
          <button
            type="button"
            onClick={() => setRemovedOpen((value) => !value)}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ChevronDown className={`h-3.5 w-3.5 transition-transform ${removedOpen ? "rotate-180" : ""}`} />
            {removedOpen ? "Hide" : "View"}
          </button>
        }
      >
        {removedOpen ? (
          <div className="divide-y divide-border">
            {removedCandidates.length > 0 ? (
              removedCandidates.map((candidate) => (
                <CompactCandidateRow
                  key={candidate.id}
                  candidate={candidate}
                  onApprove={() => approveCandidate(candidate, false)}
                  onOpenEvidence={() => setEvidenceOpen((current) => current === candidate.id ? null : candidate.id)}
                />
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No removed results yet.</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Duplicates, suppressed records, failed candidates, and rejects are preserved here for review.</p>
        )}
      </SectionPanel>

      {evidenceCandidate && (
        <SectionPanel
          title={`Evidence for ${displayName(evidenceCandidate)}`}
          description="Verified facts, reasonable inferences, and discovery questions are separated."
          action={<SecondaryAction onClick={() => setEvidenceOpen(null)} icon={XCircle}>Close</SecondaryAction>}
        >
          <EvidenceGrid candidate={evidenceCandidate} />
        </SectionPanel>
      )}

      <SectionPanel
        title="Raw results"
        description="Advanced view for full candidate state, scores, and manual corrections."
        action={
          <button
            type="button"
            onClick={() => setRawOpen((value) => !value)}
            className="inline-flex h-8 items-center gap-2 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {rawOpen ? "Hide raw results" : "View all raw results"}
          </button>
        }
      >
        {rawOpen ? (
          <div className="space-y-4">
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
            <RawCandidateTable
              candidates={rawRows}
              onApprove={(candidate) => approveCandidate(candidate, false)}
              onApproveFocus={(candidate) => approveCandidate(candidate, true)}
              onConfirmSite={confirmSite}
              onCorrectCategory={correctCategory}
              onEditIdentity={editIdentity}
              onMarkDuplicate={(candidate) => updateCandidate(candidate, { duplicate_state: "possible", research_state: "duplicate" })}
              onRejectMarket={(candidate) => updateCandidate(candidate, { research_state: "rejected", suppression_state: "market_rejected", reason: "Rejected for this market." })}
              onRejectPermanent={(candidate) => updateCandidate(candidate, { research_state: "rejected", suppression_state: "suppressed", reason: "Rejected permanently from market review." })}
              onRestore={(candidate) => updateCandidate(candidate, { research_state: "discovered", suppression_state: "restored" })}
              onToggleEvidence={(candidate) => setEvidenceOpen((current) => current === candidate.id ? null : candidate.id)}
              workingId={working}
            />
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">The focused report hides raw scores until they are needed.</p>
        )}
      </SectionPanel>
    </div>
  )
}

function UsagePill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
      <span className="block">{label}</span>
      <span className="mt-1 block font-mono text-foreground">{value}</span>
    </div>
  )
}

function ProspectCard({
  candidate,
  onApprove,
  onApproveFocus,
  onConfirmSite,
  onCorrectCategory,
  onEditIdentity,
  onReject,
  working,
}: {
  candidate: SignalMarketCandidate
  onApprove: () => void
  onApproveFocus: () => void
  onConfirmSite: () => void
  onCorrectCategory: () => void
  onEditIdentity: () => void
  onReject: () => void
  working: boolean
}) {
  const facts = topFacts(candidate)
  const inference = topInference(candidate)
  const url = officialUrl(candidate)
  return (
    <article className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-foreground">{displayName(candidate)}</h3>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span>{[candidate.city, candidate.state].filter(Boolean).join(", ") || "Location unknown"}</span>
            <span>{candidate.category ? getSignalPlaybook(candidate.category).name : "Category pending"}</span>
            {url && (
              <a href={url} target="_blank" rel="noreferrer" className="inline-flex max-w-[240px] items-center gap-1 truncate hover:text-foreground">
                <Globe2 className="h-3.5 w-3.5 shrink-0" />
                {domain(url)}
              </a>
            )}
          </div>
        </div>
        <StatusBadge tone={priorityTone(candidate.preliminary_priority)}>
          Priority {candidate.preliminary_priority || "-"}
        </StatusBadge>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        <MiniScore label="Website opportunity" value={candidate.website_opportunity_score} tone="blue" />
        <MiniScore label="Systems opportunity" value={candidate.systems_opportunity_score} tone="amber" />
        <MiniScore label="Readiness" value={candidate.outreach_readiness_score} tone="green" />
      </div>

      <div className="mt-4 rounded-md border border-border bg-muted/20 p-3">
        <p className="text-xs font-medium uppercase text-muted-foreground">Visual anchor</p>
        <p className="mt-2 text-sm text-foreground">
          {candidate.visual_state
            ? formatSignalLabel(candidate.visual_state)
            : "No screenshot preview yet. Visual capture happens after prospect approval."}
        </p>
      </div>

      <div className="mt-4 grid gap-4 text-sm md:grid-cols-2">
        <EvidenceSnippet title="Verified facts" values={facts.length ? facts : ["Official-site evidence is still being collected."]} />
        <EvidenceSnippet title="Reasonable inference" values={[inference || "Opportunity still needs review."]} />
      </div>

      <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
        <span>Confidence: {candidate.resolution_confidence || candidate.confidence || "unknown"}</span>
        <span>Lane: {formatSignalLabel(candidate.recommended_lane || "review")}</span>
        <span>Demo: {candidate.relevant_demo || "none"}</span>
        <span>Next: {firstDiscoveryQuestion(candidate) || "Review evidence, then call manually."}</span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onApprove}
          disabled={working}
          className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
        >
          {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Approve prospect
        </button>
        <button
          type="button"
          onClick={onApproveFocus}
          disabled={working}
          className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
        >
          <UserPlus className="h-4 w-4" />
          Approve + Focus
        </button>
        {candidate.imported_prospect_id ? (
          <Link
            href={`/dashboard/signal/${candidate.imported_prospect_id}`}
            className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Search className="h-4 w-4" />
            Open deep dive
          </Link>
        ) : null}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              aria-label={`More actions for ${displayName(candidate)}`}
            >
              <MoreHorizontal className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuItem onSelect={onEditIdentity}>Edit identity</DropdownMenuItem>
            <DropdownMenuItem onSelect={onConfirmSite}>Confirm official site</DropdownMenuItem>
            <DropdownMenuItem onSelect={onCorrectCategory}>Correct category</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={onReject} className="text-red-300">
              <XCircle className="h-4 w-4" />Reject
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </article>
  )
}

function MiniScore({ label, tone, value }: { label: string; tone: "blue" | "green" | "amber"; value: number | null }) {
  const toneClass =
    tone === "blue"
      ? "text-blue-300"
      : tone === "green"
        ? "text-green-300"
        : "text-yellow-200"
  return (
    <div className="rounded-md border border-border bg-muted/20 px-3 py-2">
      <span className="block text-xs text-muted-foreground">{label}</span>
      <span className={`mt-1 block font-mono text-lg font-semibold ${toneClass}`}>{value ?? "-"}</span>
    </div>
  )
}

function EvidenceSnippet({ title, values }: { title: string; values: string[] }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase text-muted-foreground">{title}</p>
      <ul className="mt-2 space-y-1.5 text-muted-foreground">
        {values.slice(0, 2).map((value) => (
          <li key={value} className="leading-5">{value}</li>
        ))}
      </ul>
    </div>
  )
}

function ConfirmationRow({
  candidate,
  onConfirmSite,
  onEditIdentity,
  onReject,
}: {
  candidate: SignalMarketCandidate
  onConfirmSite: () => void
  onEditIdentity: () => void
  onReject: () => void
}) {
  const url = officialUrl(candidate)
  return (
    <div className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 text-sm lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium text-foreground">{displayName(candidate)}</p>
          <StatusBadge tone="amber">{candidate.resolution_confidence || "low"} identity</StatusBadge>
        </div>
        <p className="mt-1 text-muted-foreground">
          {candidate.search_result_title || candidate.error_message || "Signal needs stronger official evidence before this can become a prospect."}
        </p>
        {url && (
          <a href={url} target="_blank" rel="noreferrer" className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-xs text-muted-foreground hover:text-foreground">
            {domain(url)}
            <ExternalLink className="h-3.5 w-3.5 shrink-0" />
          </a>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        <SecondaryAction onClick={onEditIdentity}>Edit identity</SecondaryAction>
        <PrimaryAction onClick={onConfirmSite} icon={Globe2}>Confirm site</PrimaryAction>
        <SecondaryAction onClick={onReject} tone="danger" icon={XCircle}>Reject</SecondaryAction>
      </div>
    </div>
  )
}

function CompactCandidateRow({
  candidate,
  onApprove,
  onOpenEvidence,
}: {
  candidate: SignalMarketCandidate
  onApprove: () => void
  onOpenEvidence: () => void
}) {
  return (
    <div className="grid gap-3 py-3 text-sm lg:grid-cols-[1fr_120px_140px_120px_auto] lg:items-center">
      <div className="min-w-0">
        <p className="truncate font-medium text-foreground">{displayName(candidate)}</p>
        <p className="mt-1 truncate text-xs text-muted-foreground">
          {domain(officialUrl(candidate)) || "Domain pending"} · {candidate.category ? getSignalPlaybook(candidate.category).name : "Category pending"}
        </p>
      </div>
      <StatusBadge tone={priorityTone(candidate.preliminary_priority)}>{candidate.preliminary_priority || "-"}</StatusBadge>
      <span className="text-xs text-muted-foreground">{formatSignalLabel(candidate.recommended_lane || "review")}</span>
      <span className="font-mono text-xs text-muted-foreground">{candidate.website_opportunity_score ?? "-"}</span>
      <div className="flex gap-2">
        <button type="button" onClick={onOpenEvidence} className="text-xs text-muted-foreground hover:text-foreground">Evidence</button>
        <button type="button" onClick={onApprove} className="text-xs text-blue-300 hover:text-blue-200">Approve</button>
      </div>
    </div>
  )
}

function EvidenceGrid({ candidate }: { candidate: SignalMarketCandidate }) {
  const graph = evidenceGraph(candidate)
  const verified = evidenceItems(graph?.verified_facts)
  const inferences = evidenceItems(graph?.reasonable_inferences)
  const questions = evidenceItems(graph?.discovery_questions)
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <EvidenceList title="Verified facts" items={verified} />
      <EvidenceList title="Reasonable inferences" items={inferences} />
      <EvidenceList title="Discovery questions" items={questions} />
    </div>
  )
}

function EvidenceList({ items, title }: { items: Array<Record<string, unknown>>; title: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
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

function RawCandidateTable({
  candidates,
  onApprove,
  onApproveFocus,
  onConfirmSite,
  onCorrectCategory,
  onEditIdentity,
  onMarkDuplicate,
  onRejectMarket,
  onRejectPermanent,
  onRestore,
  onToggleEvidence,
  workingId,
}: {
  candidates: SignalMarketCandidate[]
  onApprove: (candidate: SignalMarketCandidate) => void
  onApproveFocus: (candidate: SignalMarketCandidate) => void
  onConfirmSite: (candidate: SignalMarketCandidate) => void
  onCorrectCategory: (candidate: SignalMarketCandidate) => void
  onEditIdentity: (candidate: SignalMarketCandidate) => void
  onMarkDuplicate: (candidate: SignalMarketCandidate) => void
  onRejectMarket: (candidate: SignalMarketCandidate) => void
  onRejectPermanent: (candidate: SignalMarketCandidate) => void
  onRestore: (candidate: SignalMarketCandidate) => void
  onToggleEvidence: (candidate: SignalMarketCandidate) => void
  workingId: string | null
}) {
  if (candidates.length === 0) {
    return (
      <EmptyState title="No candidates in this view" icon={RadioTower}>
        Switch filters or run the market again.
      </EmptyState>
    )
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border">
      <table className="w-full min-w-[980px] text-sm">
        <thead className="border-b border-border bg-muted/50 text-xs uppercase text-muted-foreground">
          <tr>
            {["Business", "Official site", "Identity", "Website", "Systems", "Priority", "Lane", "State", ""].map((heading) => (
              <th key={heading} className="px-3 py-3 text-left font-medium">{heading}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {candidates.map((candidate) => {
            const working = Boolean(workingId && workingId.includes(candidate.id))
            return (
              <tr key={candidate.id} className="align-top hover:bg-muted/20">
                <td className="px-3 py-3">
                  <p className="font-medium text-foreground">{displayName(candidate)}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{[candidate.city, candidate.state].filter(Boolean).join(", ") || "-"}</p>
                </td>
                <td className="px-3 py-3">
                  {officialUrl(candidate) ? (
                    <a href={officialUrl(candidate) || ""} target="_blank" rel="noreferrer" className="inline-flex max-w-[180px] items-center gap-1 truncate text-muted-foreground hover:text-foreground">
                      {domain(officialUrl(candidate))}
                      <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                    </a>
                  ) : (
                    <span className="text-muted-foreground">Needs confirmation</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <StatusBadge tone={candidate.requires_confirmation ? "amber" : "green"}>
                    {candidate.resolution_confidence || "unknown"}
                  </StatusBadge>
                </td>
                <td className="px-3 py-3 font-mono text-muted-foreground">{candidate.website_opportunity_score ?? "-"}</td>
                <td className="px-3 py-3 font-mono text-muted-foreground">{candidate.systems_opportunity_score ?? "-"}</td>
                <td className="px-3 py-3">
                  <StatusBadge tone={priorityTone(candidate.preliminary_priority)}>{candidate.preliminary_priority || "-"}</StatusBadge>
                </td>
                <td className="px-3 py-3 text-muted-foreground">{candidate.recommended_lane ? formatSignalLabel(candidate.recommended_lane) : "-"}</td>
                <td className="px-3 py-3">
                  <StatusBadge>{formatSignalLabel(candidate.research_state)}</StatusBadge>
                </td>
                <td className="px-3 py-3">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        disabled={working}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                        aria-label={`Actions for ${displayName(candidate)}`}
                      >
                        {working ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoreHorizontal className="h-4 w-4" />}
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
                      <DropdownMenuItem onSelect={() => onApprove(candidate)}>
                        <CheckCircle2 className="h-4 w-4" />Approve prospect
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onApproveFocus(candidate)}>
                        <UserPlus className="h-4 w-4" />Approve + Focus Mode
                      </DropdownMenuItem>
                      {candidate.imported_prospect_id && (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/signal/${candidate.imported_prospect_id}`}>
                            <Search className="h-4 w-4" />Open deep dive
                          </Link>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem onSelect={() => onToggleEvidence(candidate)}>
                        <ExternalLink className="h-4 w-4" />View evidence
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => onEditIdentity(candidate)}>Edit identity</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onConfirmSite(candidate)}>Confirm site</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onCorrectCategory(candidate)}>Correct category</DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onMarkDuplicate(candidate)}>Mark duplicate</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onSelect={() => onRejectMarket(candidate)}>
                        <XCircle className="h-4 w-4" />Reject this market
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onRejectPermanent(candidate)} className="text-red-300">
                        <XCircle className="h-4 w-4" />Reject permanently
                      </DropdownMenuItem>
                      <DropdownMenuItem onSelect={() => onRestore(candidate)}>Restore</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
