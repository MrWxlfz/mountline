"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clipboard,
  ExternalLink,
  FileText,
  Globe2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  formatBusinessCategory,
  formatConfidence,
  formatOnlinePresence,
  formatQualificationStatus,
  formatRunStage,
  formatRunStatus,
  formatScoreReason,
  formatSignalLabel,
} from "@/lib/signal/presentation"
import type {
  SignalRun,
  SignalRunEvent,
  SignalRunLead,
  SignalRunLeadCorrection,
  SignalRunLeadObservation,
} from "@/lib/supabase/types"

type JsonRecord = Record<string, unknown>

type LeadFeedbackInput =
  | { action: "correction"; correction_type: SignalRunLeadCorrection["correction_type"]; value?: string; note?: string }
  | { action: "observation"; category: SignalRunLeadObservation["category"]; note: string }

type SerializedLeadEvidence = {
  id?: string
  evidence_type?: string
  source_url?: string | null
  source_title?: string | null
  excerpt?: string | null
  confidence?: string | null
}

type RunApiPayload = {
  run?: SignalRun
  leads?: SignalRunLead[]
  events?: SignalRunEvent[]
  lead?: SignalRunLead
  evidence?: SerializedLeadEvidence[]
  observations?: SignalRunLeadObservation[]
  corrections?: SignalRunLeadCorrection[]
}

export type SignalRunDetailProps = {
  initialRun: SignalRun
  initialLeads: SignalRunLead[]
  initialEvents: SignalRunEvent[]
}

const activeStatuses = new Set([
  "queued", "discovering", "enriching", "analyzing", "selecting", "generating",
  "checking", "scoring", "writing_packs", "ranking",
])

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as JsonRecord
    : null
}

function asRun(value: unknown): SignalRun | null {
  const record = asRecord(value)
  return record && typeof record.id === "string" && typeof record.status === "string"
    ? value as SignalRun
    : null
}

function asLead(value: unknown): SignalRunLead | null {
  const record = asRecord(value)
  return record && typeof record.id === "string" && typeof record.business_name === "string"
    ? value as SignalRunLead
    : null
}

function asRunEvents(value: unknown): SignalRunEvent[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter((item) => {
    const record = asRecord(item)
    return Boolean(record && typeof record.id === "string" && typeof record.message === "string")
  }) as SignalRunEvent[]
}

function asRunLeads(value: unknown): SignalRunLead[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.map(asLead).filter((item): item is SignalRunLead => Boolean(item))
}

function asEvidence(value: unknown): SerializedLeadEvidence[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter((item) => Boolean(asRecord(item))) as SerializedLeadEvidence[]
}

function asObservations(value: unknown): SignalRunLeadObservation[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter((item) => {
    const record = asRecord(item)
    return Boolean(record && typeof record.id === "string" && typeof record.note === "string")
  }) as SignalRunLeadObservation[]
}

function asCorrections(value: unknown): SignalRunLeadCorrection[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter((item) => {
    const record = asRecord(item)
    return Boolean(record && typeof record.id === "string" && typeof record.correction_type === "string")
  }) as SignalRunLeadCorrection[]
}

function parsePayload(value: unknown): RunApiPayload {
  const record = asRecord(value)
  if (!record) return {}

  const directRun = asRun(value)
  const directLead = asLead(value)

  return {
    run: asRun(record.run) || directRun || undefined,
    leads: asRunLeads(record.leads),
    events: asRunEvents(record.events),
    lead: asLead(record.lead) || directLead || undefined,
    evidence: asEvidence(record.evidence),
    observations: asObservations(record.observations),
    corrections: asCorrections(record.corrections),
  }
}

function displayStage(stage: string | null | undefined) {
  return formatRunStage(stage)
}

function statusTone(status: SignalRun["status"]) {
  if (status === "completed") return "border-success-border bg-success-soft text-success-foreground"
  if (status === "partial" || status === "completed_with_limits") return "border-warning-border bg-warning-soft text-warning-foreground"
  if (status === "failed") return "border-error-border bg-error-soft text-error-foreground"
  return "border-border bg-muted/50 text-muted-foreground"
}

function websiteTone(status: string) {
  if (["no_site", "weak_site", "social_only", "no_website_found", "directory_only", "website_unreachable", "website_broken", "website_weak"].includes(status)) {
    return "border-warning-border bg-warning-soft text-warning-foreground"
  }
  if (status === "strong_site" || status === "website_strong") return "border-success-border bg-success-soft text-success-foreground"
  return "border-border bg-muted/50 text-muted-foreground"
}

function onlinePresence(lead: SignalRunLead) {
  return lead.online_presence_classification || lead.website_status
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Just now"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Recently"
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function formatTime(value: string | null | undefined) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })
}

function stringsFrom(value: unknown): string[] {
  if (typeof value === "string") return value.trim() ? [value.trim()] : []
  if (typeof value === "number" || typeof value === "boolean") return [String(value)]
  if (Array.isArray(value)) return value.flatMap(stringsFrom).filter(Boolean)
  return []
}

function textFrom(value: unknown, keys: string[]): string | null {
  const record = asRecord(value)
  if (!record) return typeof value === "string" ? value : null

  for (const key of keys) {
    const candidate = record[key]
    if (typeof candidate === "string" && candidate.trim()) return candidate.trim()
    const lines = stringsFrom(candidate)
    if (lines.length > 0) return lines.join(" ")
  }

  return null
}

function listFrom(value: unknown, keys: string[] = []): string[] {
  const record = asRecord(value)
  if (!record) return stringsFrom(value)
  if (keys.length === 0) {
    return Object.entries(record).flatMap(([key, item]) => {
      if (typeof item === "string" && item.trim()) return [`${labelize(key)}: ${item.trim()}`]
      return stringsFrom(item)
    })
  }
  return keys.flatMap((key) => stringsFrom(record[key]))
}

function numberEntries(value: unknown): Array<{ label: string; value: number }> {
  const record = asRecord(value)
  if (!record) return []
  return Object.entries(record)
    .filter(([, item]) => typeof item === "number" && Number.isFinite(item))
    .map(([label, value]) => ({ label: labelize(label), value: Math.max(0, Math.min(100, value as number)) }))
}

function scoreEntries(value: unknown): Array<{
  label: string
  value: number
  max: number
  rationale: string | null
  evidence: string[]
  unknowns: string[]
}> {
  const record = asRecord(value)
  if (!record) return []
  const maximums: Record<string, number> = {
    leadViability: 15,
    digitalOpportunity: 20,
    customerFlowFriction: 20,
    trustReputationGap: 15,
    salesAccessibility: 10,
    conceptPotential: 10,
    commercialFit: 10,
  }

  return Object.entries(record)
    .flatMap(([key, item]) => {
      const dimension = asRecord(item)
      const score = dimension?.score
      return typeof score === "number" && Number.isFinite(score)
        ? [{
          label: key === "final" ? "Final score" : labelize(key),
          value: Math.max(0, Math.min(maximums[key] || 100, score)),
          max: maximums[key] || 100,
          rationale: typeof dimension?.rationale === "string" ? dimension.rationale : null,
          evidence: stringsFrom(dimension?.evidence).map((item) => formatScoreReason(item)).slice(0, 3),
          unknowns: stringsFrom(dimension?.unknowns).map((item) => formatScoreReason(item)).slice(0, 2),
        }]
        : []
    })
    .filter((item) => item.label !== "Final score")
}

function profileLabels(value: unknown) {
  const record = asRecord(value)
  if (!record) return []
  const tags = Array.isArray(record.tags)
    ? record.tags.flatMap((item) => {
      const tag = asRecord(item)
      const label = typeof tag?.label === "string" ? tag.label : typeof tag?.tag === "string" ? labelize(tag.tag) : null
      return label ? [label] : []
    })
    : []
  const guidance = typeof record.guidance === "string" ? [record.guidance] : []
  return [...tags, ...guidance].slice(0, 8)
}

function objectionHandlingText(value: unknown) {
  if (!Array.isArray(value)) return textFrom(value, ["response", "text"])
  return value
    .flatMap((item) => {
      const record = asRecord(item)
      const objection = typeof record?.objection === "string" ? record.objection : null
      const response = typeof record?.response === "string" ? record.response : null
      return objection && response ? [`${objection}\n${response}`] : []
    })
    .join("\n\n") || null
}

function labelize(value: string) {
  return formatSignalLabel(value)
}

function leadName(lead: SignalRunLead) {
  return lead.display_name || lead.canonical_name || lead.business_name
}

function isActive(run: SignalRun) {
  return activeStatuses.has(run.status)
}

function rankedLeads(leads: SignalRunLead[]) {
  return [...leads]
    .filter((lead) => !["ignored", "excluded", "failed"].includes(lead.status) && (lead.qualification_status === "qualified" || (lead.qualification_status == null && lead.rank != null)))
    .sort((left, right) => {
      const rank = (left.rank ?? Number.MAX_SAFE_INTEGER) - (right.rank ?? Number.MAX_SAFE_INTEGER)
      if (rank !== 0) return rank
      return (right.final_score ?? -1) - (left.final_score ?? -1)
    })
}

export function SignalRunDetail({
  initialEvents,
  initialLeads,
  initialRun,
}: SignalRunDetailProps) {
  const searchParams = useSearchParams()
  const [run, setRun] = useState(initialRun)
  const [leads, setLeads] = useState(initialLeads)
  const [events, setEvents] = useState(initialEvents)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [advancing, setAdvancing] = useState(false)
  const advancingRef = useRef(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState<SignalRunLead | null>(null)
  const [selectedEvidence, setSelectedEvidence] = useState<SerializedLeadEvidence[]>([])
  const [selectedObservations, setSelectedObservations] = useState<SignalRunLeadObservation[]>([])
  const [selectedCorrections, setSelectedCorrections] = useState<SignalRunLeadCorrection[]>([])
  const [loadingLead, setLoadingLead] = useState(false)
  const [leadError, setLeadError] = useState<string | null>(null)
  const [leadWorking, setLeadWorking] = useState<"saved" | "ignored" | "scripts" | "lovable" | null>(null)
  const [feedbackWorking, setFeedbackWorking] = useState<"correction" | "observation" | null>(null)
  const openedFromQuery = useRef<string | null>(null)

  const applyPayload = useCallback((payload: RunApiPayload) => {
    if (payload.run) setRun(payload.run)
    if (payload.leads) setLeads(payload.leads)
    if (payload.events) setEvents(payload.events)
    if (payload.lead) {
      setSelectedLead(payload.lead)
      setLeads((current) => current.map((lead) => lead.id === payload.lead?.id ? payload.lead : lead))
    }
  }, [])

  const refreshRun = useCallback(async (silent = false) => {
    if (!silent) {
      setRefreshing(true)
      setError(null)
    }

    try {
      const response = await fetch(`/api/signal/runs/${run.id}`, { cache: "no-store" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Run could not be refreshed.")
      applyPayload(parsePayload(data))
    } catch (cause) {
      if (!silent) setError(cause instanceof Error ? cause.message : "Run could not be refreshed.")
    } finally {
      if (!silent) setRefreshing(false)
    }
  }, [applyPayload, run.id])

  const advanceRun = useCallback(async (silent = false) => {
    if (advancingRef.current || (!isActive(run) && run.status !== "failed")) return
    advancingRef.current = true
    if (!silent) {
      setAdvancing(true)
      setError(null)
    }

    try {
      const response = await fetch(`/api/signal/runs/${run.id}/advance`, { method: "POST" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Signal could not continue this run.")
      applyPayload(parsePayload(data))
    } catch (cause) {
      if (!silent) setError(cause instanceof Error ? cause.message : "Signal could not continue this run.")
    } finally {
      advancingRef.current = false
      if (!silent) setAdvancing(false)
    }
  }, [applyPayload, run])

  useEffect(() => {
    if (!isActive(run)) return

    let cancelled = false
    const tick = async () => {
      await advanceRun(true)
      if (!cancelled) await refreshRun(true)
    }

    void tick()
    const interval = window.setInterval(() => void tick(), 3500)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [advanceRun, refreshRun, run.status])

  const openLead = useCallback(async (lead: SignalRunLead) => {
    setDrawerOpen(true)
    setSelectedLead(lead)
    setSelectedEvidence([])
    setSelectedObservations([])
    setSelectedCorrections([])
    setLeadError(null)
    setLoadingLead(true)

    try {
      const response = await fetch(`/api/signal/runs/${run.id}/leads/${lead.id}`, { cache: "no-store" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Lead details could not be loaded.")
      const payload = parsePayload(data)
      if (payload.lead) {
        setSelectedLead(payload.lead)
        setLeads((current) => current.map((item) => item.id === payload.lead?.id ? payload.lead : item))
      }
      setSelectedEvidence(payload.evidence || [])
      setSelectedObservations(payload.observations || [])
      setSelectedCorrections(payload.corrections || [])
    } catch (cause) {
      setLeadError(cause instanceof Error ? cause.message : "Lead details could not be loaded.")
    } finally {
      setLoadingLead(false)
    }
  }, [run.id])

  useEffect(() => {
    const requestedLeadId = searchParams.get("lead")
    if (!requestedLeadId || openedFromQuery.current === requestedLeadId) return
    const requestedLead = leads.find((lead) => lead.id === requestedLeadId)
    if (!requestedLead) return
    openedFromQuery.current = requestedLeadId
    void openLead(requestedLead)
  }, [leads, openLead, searchParams])

  const updateLeadStatus = async (lead: SignalRunLead, status: "saved" | "ignored") => {
    setLeadWorking(status)
    setLeadError(null)
    try {
      const response = await fetch(`/api/signal/runs/${run.id}/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Lead status could not be saved.")
      const payload = parsePayload(data)
      const nextLead = payload.lead || { ...lead, status }
      setSelectedLead(nextLead)
      setLeads((current) => current.map((item) => item.id === lead.id ? nextLead : item))
      setMessage(status === "saved" ? `${leadName(lead)} saved.` : `${leadName(lead)} removed from this run.`)
    } catch (cause) {
      setLeadError(cause instanceof Error ? cause.message : "Lead status could not be saved.")
    } finally {
      setLeadWorking(null)
    }
  }

  const generateLeadAsset = async (lead: SignalRunLead, kind: "scripts" | "lovable", notes?: string) => {
    setLeadWorking(kind)
    setLeadError(null)
    try {
      const response = await fetch(`/api/signal/runs/${run.id}/leads/${lead.id}/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, notes: notes?.trim() || undefined }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Signal could not generate that asset.")
      const payload = parsePayload(data)
      if (payload.lead) {
        setSelectedLead(payload.lead)
        setLeads((current) => current.map((item) => item.id === lead.id ? payload.lead! : item))
      }
      setMessage(kind === "lovable" ? "Concept prompt ready." : "Sales scripts ready.")
    } catch (cause) {
      setLeadError(cause instanceof Error ? cause.message : "Signal could not generate that asset.")
    } finally {
      setLeadWorking(null)
    }
  }

  const saveLeadFeedback = async (
    lead: SignalRunLead,
    input: LeadFeedbackInput,
  ) => {
    setFeedbackWorking(input.action)
    setLeadError(null)
    try {
      const response = await fetch(`/api/signal/runs/${run.id}/leads/${lead.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Signal could not save that update.")
      const payload = parsePayload(data)
      if (payload.lead) {
        setSelectedLead(payload.lead)
        setLeads((current) => current.map((item) => item.id === lead.id ? payload.lead! : item))
      }
      const detailResponse = await fetch(`/api/signal/runs/${run.id}/leads/${lead.id}`, { cache: "no-store" })
      const detailData = await detailResponse.json().catch(() => ({}))
      if (detailResponse.ok) {
        const detailPayload = parsePayload(detailData)
        setSelectedObservations(detailPayload.observations || [])
        setSelectedCorrections(detailPayload.corrections || [])
      }
      setMessage(typeof data?.message === "string" ? data.message : "Signal saved the update.")
      return true
    } catch (cause) {
      setLeadError(cause instanceof Error ? cause.message : "Signal could not save that update.")
      return false
    } finally {
      setFeedbackWorking(null)
    }
  }

  const visibleLeads = useMemo(() => rankedLeads(leads).slice(0, run.lead_limit), [leads, run.lead_limit])
  const watchlistLeads = useMemo(
    () => [...leads]
      .filter((lead) => !["ignored", "excluded", "failed"].includes(lead.status) && ["watchlist", "research_needed"].includes(lead.qualification_status || ""))
      .sort((left, right) => (right.ranking_score ?? -1) - (left.ranking_score ?? -1))
      .slice(0, run.lead_limit),
    [leads, run.lead_limit],
  )
  const latestEvents = useMemo(
    () => [...events].sort((left, right) => right.created_at.localeCompare(left.created_at)).slice(0, 12),
    [events],
  )
  const progress = Math.max(0, Math.min(100, run.progress_percent || 0))
  const completed = run.status === "completed" || run.status === "partial" || run.status === "completed_with_limits"
  const active = isActive(run)
  const providerErrors = stringsFrom(run.provider_errors)
  const runSummary = asRecord(run.summary)
  const candidatesChecked = typeof runSummary?.candidates_checked === "number" ? runSummary.candidates_checked : leads.length
  const candidatesRejected = typeof runSummary?.candidates_rejected === "number"
    ? runSummary.candidates_rejected
    : leads.filter((lead) => lead.status === "excluded" || lead.status === "failed").length
  const runFacts = [
    ["Businesses found", runSummary?.candidates_discovered],
    ["Duplicates removed", runSummary?.excluded_duplicates || runSummary?.merged_duplicate_sources],
    ["Chains rejected", runSummary?.excluded_chains],
    ["Finalists analyzed", runSummary?.finalists_analyzed],
    ["Packs prepared", runSummary?.returned_leads],
  ].filter((item): item is [string, number] => typeof item[1] === "number" && item[1] > 0)

  return (
    <div className="space-y-7 pb-10">
      <header className="relative overflow-hidden rounded-xl border border-border bg-card px-5 py-6 sm:px-7">
        <div aria-hidden className="bg-dot-grid absolute inset-0 opacity-35" />
        <div className="relative flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0">
            <Link
              href="/dashboard/signal"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Signal
            </Link>
            <div className="mt-5 flex flex-wrap items-center gap-2">
              <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone(run.status)}`}>
                {formatRunStatus(run.status)}
              </span>
              <span className="font-mono text-xs text-muted-foreground">RUN {run.id.slice(0, 8)}</span>
            </div>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              {completed ? "Signal found the opportunities worth reviewing." : `Running ${run.location}.`}
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
              {completed
                ? visibleLeads.length < run.lead_limit
                  ? `Signal found ${visibleLeads.length} qualified business${visibleLeads.length === 1 ? "" : "es"}${watchlistLeads.length ? ` and preserved ${watchlistLeads.length} promising watchlist/research candidate${watchlistLeads.length === 1 ? "" : "s"}` : ""}. It did not fabricate a full list.`
                  : `Signal ranked the best independent opportunities from this ${run.market_type === "metro" ? "area" : "city"} search.`
                : "Signal is working through structured local listings, verifying web and social presence, and writing the sales angle for each viable lead."}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void refreshRun()}
              disabled={refreshing}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border bg-background/70 px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              {refreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
              Refresh
            </button>
            {(run.status === "failed" || run.status === "queued") && (
              <button
                type="button"
                onClick={() => void advanceRun()}
                disabled={advancing}
                className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
              >
                {advancing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                {run.status === "failed" ? "Try again" : "Start research"}
              </button>
            )}
          </div>
        </div>
      </header>

      {(message || error || run.error_message) && (
        <div
          role="status"
          className={`rounded-lg border px-4 py-3 text-sm ${error || run.error_message ? "border-error-border bg-error-soft text-error-foreground" : "border-success-border bg-success-soft text-success-foreground"}`}
        >
          {error || run.error_message || message}
        </div>
      )}

      {providerErrors.length > 0 && (
        <div className="rounded-lg border border-warning-border bg-warning-soft px-4 py-3 text-sm text-warning-foreground">
          <p className="font-medium">Some website details could not be verified.</p>
          <p className="mt-1 leading-5 text-warning-foreground/80">Signal kept identity and location checks intact and relied more heavily on verified listings and public profiles. {providerErrors.slice(0, 2).map((item) => formatScoreReason(item)).join(" ")}</p>
        </div>
      )}

      {active && (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_minmax(300px,0.7fr)]">
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Live research</p>
                <h2 className="mt-2 text-xl font-semibold text-foreground">{displayStage(run.current_stage || run.status)}</h2>
                <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
                  Leave Signal open or come back later. The run state and every progress event are saved.
                </p>
              </div>
              <span className="font-mono text-2xl font-semibold text-foreground">{progress}%</span>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-foreground transition-all duration-700" style={{ width: `${progress}%` }} />
            </div>
            <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
              <span>{run.location}</span>
              <span>{run.radius_miles} mi discovery preference</span>
              <span>{run.lead_limit} leads requested</span>
            </div>
          </div>

          <EventFeed events={latestEvents} compact />
        </section>
      )}

      {completed && (
        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Ranked opportunities</p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">The leads worth your time.</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                Scores are evidence-based and confidence-adjusted. Open a lead for the full sales pack and source trail.
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2 text-sm text-muted-foreground">
              <span className="font-mono text-foreground">{candidatesChecked}</span> checked
              <span className="mx-2 text-border">/</span>
              <span className="font-mono text-foreground">{candidatesRejected}</span> rejected
              <span className="mx-2 text-border">/</span>
              <span className="font-mono text-foreground">{visibleLeads.length}</span> qualified
              {watchlistLeads.length > 0 && <><span className="mx-2 text-border">/</span><span className="font-mono text-foreground">{watchlistLeads.length}</span> watchlist</>}
            </div>
          </div>

          {runFacts.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {runFacts.map(([label, value]) => <span key={label} className="rounded-md border border-border bg-muted/20 px-2.5 py-1.5 text-xs text-muted-foreground"><span className="mr-1 font-mono text-foreground">{value}</span>{label.toLowerCase()}</span>)}
            </div>
          )}

          {visibleLeads.length > 0 ? (
            <div className="mt-6 grid gap-4 xl:grid-cols-2">
              {visibleLeads.map((lead, index) => (
                <RunLeadCard
                  key={lead.id}
                  lead={lead}
                  rank={lead.rank || index + 1}
                  onOpen={() => void openLead(lead)}
                  onGenerate={(kind) => void generateLeadAsset(lead, kind)}
                  onStatus={(status) => void updateLeadStatus(lead, status)}
                  working={leadWorking}
                />
              ))}
            </div>
          ) : (
            <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/20 p-8 text-center">
              <Target className="mx-auto h-6 w-6 text-muted-foreground" />
              <p className="mt-3 font-medium text-foreground">No qualified leads are ready yet.</p>
              <p className="mx-auto mt-2 max-w-md text-sm text-muted-foreground">Open the event feed to see what Signal found and whether a partial provider result needs a retry.</p>
            </div>
          )}

          {watchlistLeads.length > 0 && (
            <div className="mt-7 border-t border-border pt-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Watchlist and research needed</p>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">These are real local businesses with a promising map or reputation signal, but one or two facts still need verification before outreach.</p>
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {watchlistLeads.map((lead) => (
                  <WatchlistLeadCard key={lead.id} lead={lead} onOpen={() => void openLead(lead)} />
                ))}
              </div>
            </div>
          )}
        </section>
      )}

      {!active && !completed && (
        <section className="rounded-xl border border-border bg-card p-6 text-center">
          <CircleAlert className="mx-auto h-7 w-7 text-muted-foreground" />
          <h2 className="mt-3 text-lg font-semibold text-foreground">This run needs a quick check.</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
            {run.error_message || "Signal saved the run safely. Review the event feed, then retry when the missing research step is available."}
          </p>
        </section>
      )}

      {!active && latestEvents.length > 0 && (
        <EventFeed events={latestEvents} />
      )}

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full overflow-y-auto p-0 sm:max-w-3xl">
          {selectedLead && (
            <LeadDrawer
              evidence={selectedEvidence}
              observations={selectedObservations}
              corrections={selectedCorrections}
              lead={selectedLead}
              loading={loadingLead}
              error={leadError}
              working={leadWorking}
              feedbackWorking={feedbackWorking}
              onGenerate={(kind, notes) => void generateLeadAsset(selectedLead, kind, notes)}
              onFeedback={(input) => saveLeadFeedback(selectedLead, input)}
              onStatus={(status) => void updateLeadStatus(selectedLead, status)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function EventFeed({ events, compact = false }: { events: SignalRunEvent[]; compact?: boolean }) {
  return (
    <section className={`rounded-xl border border-border bg-card ${compact ? "p-5" : "p-5 sm:p-6"}`}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Run activity</p>
          {!compact && <h2 className="mt-2 text-xl font-semibold text-foreground">What Signal checked</h2>}
        </div>
        <RefreshCw className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className={`mt-5 space-y-4 ${compact ? "max-h-[330px] overflow-y-auto pr-1" : ""}`}>
        {events.length > 0 ? events.map((event) => (
          <div key={event.id} className="grid grid-cols-[58px_minmax(0,1fr)] gap-3">
            <span className="pt-0.5 font-mono text-[11px] text-muted-foreground">{formatTime(event.created_at)}</span>
            <div className="min-w-0 border-l border-border pl-3">
              <p className="text-xs font-medium text-foreground">{displayStage(event.stage)}</p>
              <p className="mt-1 text-sm leading-5 text-muted-foreground">{formatScoreReason(event.message)}</p>
              {typeof event.progress_percent === "number" && (
                <p className="mt-1 font-mono text-[11px] text-muted-foreground">{event.progress_percent}%</p>
              )}
            </div>
          </div>
        )) : (
          <p className="text-sm text-muted-foreground">Signal will add real progress updates here as it works.</p>
        )}
      </div>
    </section>
  )
}

function RunLeadCard({
  lead,
  onGenerate,
  onOpen,
  onStatus,
  rank,
  working,
}: {
  lead: SignalRunLead
  rank: number
  onOpen: () => void
  onGenerate: (kind: "scripts" | "lovable", notes?: string) => void
  onStatus: (status: "saved" | "ignored") => void
  working: "saved" | "ignored" | "scripts" | "lovable" | null
}) {
  const reasons = listFrom(lead.key_reasons).map((item) => formatScoreReason(item)).slice(0, 3)
  const salesPack = asRecord(lead.sales_pack)
  const pitch = textFrom(salesPack, ["best_angle", "strongest_honest_angle", "best_pitch_angle", "pitch_angle"])
  const action = textFrom(salesPack, ["best_first_action", "recommended_first_action", "next_action"])
  const location = [lead.city, lead.state].filter(Boolean).join(", ") || lead.address || "Location to verify"
  const presence = onlinePresence(lead)

  return (
    <article className="group rounded-xl border border-border bg-background/40 p-4 transition-colors hover:border-foreground/25 hover:bg-muted/20 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex h-7 min-w-7 items-center justify-center rounded-md border border-border bg-card px-1 font-mono text-xs text-muted-foreground">{rank}</span>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${websiteTone(presence)}`}>
              {formatOnlinePresence(presence)}
            </span>
            {lead.lead_quality_status && <span className="rounded-full border border-border bg-card px-2.5 py-1 text-xs font-medium text-muted-foreground">{formatQualificationStatus(lead.lead_quality_status)}</span>}
          </div>
          <h3 className="mt-3 truncate text-lg font-semibold text-foreground">{leadName(lead)}</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span>{formatBusinessCategory(lead.primary_category || lead.industry)}</span>
            <span className="text-border">/</span>
            <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span>
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="font-mono text-2xl font-semibold text-foreground">{lead.final_score ?? "—"}</p>
          <p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">Score</p>
          <p className="mt-2 text-xs text-muted-foreground">{formatConfidence(lead.confidence_score)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto]">
        <div className="rounded-lg border border-border bg-card/50 p-3">
          <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Why it stands out</p>
          <p className="mt-2 text-sm leading-5 text-foreground">{pitch || reasons[0] || "Open the lead to review the evidence-backed opportunity."}</p>
        </div>
        {action && (
          <div className="rounded-lg border border-border bg-card/50 p-3 sm:max-w-40">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Best move</p>
            <p className="mt-2 text-sm leading-5 text-foreground">{action}</p>
          </div>
        )}
      </div>

      {reasons.length > 0 && (
        <ul className="mt-4 space-y-2">
          {reasons.map((reason, index) => (
            <li key={`${reason}-${index}`} className="flex gap-2 text-sm leading-5 text-muted-foreground">
              <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-foreground" />
              {reason}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
        <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
          {lead.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{lead.phone}</span>}
          {lead.is_independent_likely && <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />Independent likely</span>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button type="button" disabled={Boolean(working)} onClick={() => onGenerate("scripts")} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50">
            {working === "scripts" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <FileText className="h-3.5 w-3.5" />} Sales pack
          </button>
          <button type="button" disabled={Boolean(working)} onClick={() => onGenerate("lovable")} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50">
            {working === "lovable" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />} Concept
          </button>
          <button type="button" disabled={Boolean(working) || lead.status === "saved"} onClick={() => onStatus("saved")} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50">
            <Bookmark className="h-3.5 w-3.5" /> {lead.status === "saved" ? "Saved" : "Save"}
          </button>
          <button type="button" disabled={Boolean(working)} onClick={() => onStatus("ignored")} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50">
            <X className="h-3.5 w-3.5" /> Reject
          </button>
          <button type="button" onClick={onOpen} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-2.5 text-xs font-medium text-background transition-colors hover:bg-foreground/90">
            Open <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </article>
  )
}

function WatchlistLeadCard({ lead, onOpen }: { lead: SignalRunLead; onOpen: () => void }) {
  const reasons = listFrom(lead.key_reasons).map((item) => formatScoreReason(item)).slice(0, 2)
  const presence = onlinePresence(lead)
  const tier = lead.qualification_status === "research_needed" ? "Research needed" : "Watchlist"
  return (
    <article className="rounded-lg border border-border bg-background/40 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-warning-border bg-warning-soft px-2.5 py-1 text-xs font-medium text-warning-foreground">{tier}</span>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${websiteTone(presence)}`}>{formatOnlinePresence(presence)}</span>
          </div>
          <h3 className="mt-3 truncate font-medium text-foreground">{leadName(lead)}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{[formatBusinessCategory(lead.primary_category || lead.industry), lead.city, lead.state].filter(Boolean).join(" · ")}</p>
        </div>
        <span className="font-mono text-lg font-semibold text-foreground">{lead.opportunity_score ?? "—"}</span>
      </div>
      {reasons.length > 0 && <p className="mt-3 text-sm leading-5 text-muted-foreground">{reasons.join(" ")}</p>}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">{lead.phone || lead.provider_listing_url || "Specific fact to verify"}</span>
        <button type="button" onClick={onOpen} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Review evidence <ChevronRight className="h-3.5 w-3.5" /></button>
      </div>
    </article>
  )
}

function LeadDrawer({
  corrections,
  evidence,
  error,
  feedbackWorking,
  lead,
  loading,
  observations,
  onFeedback,
  onGenerate,
  onStatus,
  working,
}: {
  corrections: SignalRunLeadCorrection[]
  evidence: SerializedLeadEvidence[]
  error: string | null
  feedbackWorking: "correction" | "observation" | null
  lead: SignalRunLead
  loading: boolean
  observations: SignalRunLeadObservation[]
  onFeedback: (input: LeadFeedbackInput) => Promise<boolean>
  onGenerate: (kind: "scripts" | "lovable", notes?: string) => void
  onStatus: (status: "saved" | "ignored") => void
  working: "saved" | "ignored" | "scripts" | "lovable" | null
}) {
  const presence = onlinePresence(lead)
  const canGenerate = lead.qualification_status === "qualified" || (lead.qualification_status == null && lead.rank != null)
  const scores = scoreEntries(lead.score_breakdown)
  const profile = profileLabels(lead.communication_profile)
  const salesPack = asRecord(lead.sales_pack)
  const strategy = asRecord(lead.sales_strategy)
  const websiteAnalysis = asRecord(lead.website_analysis)
  const websiteSummary = textFrom(websiteAnalysis, ["summary"])
  const websiteEvidence = listFrom(websiteAnalysis, ["evidence"]).slice(0, 5)
  const websiteGaps = listFrom(websiteAnalysis, ["gaps"]).slice(0, 5)
  const summary = textFrom(salesPack, ["one_minute_briefing", "lead_briefing", "summary", "why_this_fits"])
  const offer = textFrom(strategy, ["recommended_offer"]) || textFrom(salesPack, ["recommended_offer", "best_offer_angle", "offer_angle"])
  const pitch = textFrom(salesPack, ["best_angle", "strongest_honest_angle", "best_pitch_angle", "pitch_angle"]) || textFrom(strategy, ["strongest_angle"])
  const pricing = textFrom(salesPack, ["pricing_angle", "recommended_pricing_angle"])
  const firstAction = textFrom(salesPack, ["best_first_action", "recommended_first_action", "next_action"])
  const generatedBy = textFrom(salesPack, ["generated_by"])
  const avoid = listFrom(salesPack, ["do_not_say", "what_to_avoid", "what_to_avoid_saying", "avoid"]).slice(0, 6)
  const scripts = [
    ["One-minute briefing", textFrom(salesPack, ["one_minute_briefing", "lead_briefing"])],
    ["Best angle", textFrom(salesPack, ["best_angle", "strongest_honest_angle"])],
    ["Walk-in opener", textFrom(salesPack, ["walk_in_opener", "walk_in_script", "walkin_script"])],
    ["If they are busy", textFrom(salesPack, ["busy_response"])],
    ["Concept transition", textFrom(salesPack, ["concept_transition"])],
    ["Call script", textFrom(salesPack, ["call_script", "call_opener", "phone_script"])],
    ["Discovery questions", listFrom(salesPack, ["discovery_questions"]).join("\n") || null],
    ["Price transition", textFrom(salesPack, ["price_transition", "pricing_angle"])],
    ["Follow-up text", textFrom(salesPack, ["follow_up_text", "follow_up_message"])],
    ["Objection handling", objectionHandlingText(salesPack?.objections || salesPack?.objection_handling)],
  ].filter((item): item is [string, string] => Boolean(item[1]))
  const risks = listFrom(lead.risks).slice(0, 8)
  const checklist = listFrom(lead.next_steps).slice(0, 8)
  const selectionReasons = listFrom(lead.key_reasons).map((item) => formatScoreReason(item)).slice(0, 5)
  const opportunitySignals = Array.isArray(lead.opportunity_signals)
    ? lead.opportunity_signals.flatMap((item) => {
      const record = asRecord(item)
      const evidenceText = typeof record?.supportingEvidence === "string" ? record.supportingEvidence : typeof record?.supporting_evidence === "string" ? record.supporting_evidence : null
      return evidenceText ? [formatScoreReason(evidenceText)] : []
    }).slice(0, 5)
    : []
  const sourceUrls = Array.from(new Set([
    ...evidence.map((item) => item.source_url).filter((item): item is string => Boolean(item)),
    ...stringsFrom(lead.source_urls).filter((item) => /^https?:\/\//i.test(item)),
  ]))
  const socialLinks = stringsFrom(lead.social_links).filter((item) => /^https?:\/\//i.test(item))
  const [conceptNotes, setConceptNotes] = useState("")

  return (
    <div className="min-h-full bg-background">
      <SheetHeader className="border-b border-border px-5 py-5 sm:px-7">
        <div className="flex flex-wrap items-center gap-2 pr-8">
          <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${websiteTone(presence)}`}>
            {formatOnlinePresence(presence)}
          </span>
          {(lead.lead_quality_status || lead.qualification_status) && <span className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs font-medium text-muted-foreground">{formatQualificationStatus(lead.lead_quality_status || lead.qualification_status)}</span>}
          {lead.is_independent_likely && <span className="rounded-full border border-success-border bg-success-soft px-2.5 py-1 text-xs font-medium text-success-foreground">Independent likely</span>}
        </div>
        <SheetTitle className="mt-3 text-2xl tracking-tight">{leadName(lead)}</SheetTitle>
        <SheetDescription className="mt-1">
          {[formatBusinessCategory(lead.primary_category || lead.industry), lead.city, lead.state].filter(Boolean).join(" · ")}
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-6 px-5 py-6 sm:px-7">
        <div className="grid gap-3 sm:grid-cols-3">
          <DrawerMetric label="Opportunity" value={lead.opportunity_score === null ? "—" : String(lead.opportunity_score)} />
          <DrawerMetric label="Confidence" value={formatConfidence(lead.confidence_score)} />
          <DrawerMetric label="Ranking score" value={lead.ranking_score === null ? (lead.final_score === null ? "—" : String(lead.final_score)) : String(lead.ranking_score)} />
          <DrawerMetric label="Chain check" value={formatSignalLabel(lead.chain_classification, "Needs verification")} />
          {lead.rating != null && <DrawerMetric label="Listing reputation" value={`${lead.rating.toFixed(1)}${lead.review_count != null ? ` · ${lead.review_count} reviews` : ""}`} />}
        </div>

        {error && (
          <div className="rounded-lg border border-error-border bg-error-soft px-3 py-2 text-sm text-error-foreground">{error}</div>
        )}

        {loading ? (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-4 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading source evidence and sales pack…
          </div>
        ) : null}

        <section className="rounded-xl border border-border bg-card p-4">
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">Why this business is a fit</p>
          <p className="mt-3 text-sm leading-6 text-foreground">
            {summary || "Signal has kept this lead because its public presence suggests a practical, evidence-backed opportunity. Confirm the details before pitching."}
          </p>
        </section>

        <DrawerSection title="Why Signal selected it" icon={CheckCircle2}>
          <BulletList items={selectionReasons.length ? selectionReasons : ["The available public evidence supports a practical local-business opportunity."]} />
        </DrawerSection>

        <section className="grid gap-4 lg:grid-cols-2">
          <DrawerSection title="Contact and public presence" icon={Building2}>
            <div className="space-y-3 text-sm">
              {lead.address && <DetailLine icon={MapPin} label="Address" value={lead.address} />}
              {lead.phone && <DetailLine icon={Phone} label="Phone" value={lead.phone} href={`tel:${lead.phone}`} />}
              {lead.public_email && <DetailLine icon={Mail} label="Email" value={lead.public_email} href={`mailto:${lead.public_email}`} />}
              {lead.website_url && <DetailLine icon={Globe2} label="Website" value={lead.website_url} href={normalizeUrl(lead.website_url)} external />}
              {lead.provider_listing_url && <DetailLine icon={MapPin} label="Map listing" value={lead.listing_attribution || "Structured listing"} href={normalizeUrl(lead.provider_listing_url)} external />}
              {socialLinks.slice(0, 2).map((url) => <DetailLine key={url} icon={Globe2} label="Social" value={domain(url)} href={normalizeUrl(url)} external />)}
              {!lead.address && !lead.phone && !lead.public_email && !lead.website_url && <p className="text-sm text-muted-foreground">Contact details still need verification.</p>}
            </div>
          </DrawerSection>

          <DrawerSection title="Communication profile" icon={Target}>
            {profile.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.map((item, index) => <span key={`${item}-${index}`} className="rounded-full border border-border bg-muted/40 px-2.5 py-1 text-xs text-muted-foreground">{item}</span>)}
              </div>
            ) : (
              <p className="text-sm leading-6 text-muted-foreground">No communication profile is ready yet. Keep the first conversation practical and based on public facts.</p>
            )}
          </DrawerSection>
        </section>

        <LeadKnowledgeEditor
          corrections={corrections}
          observations={observations}
          working={feedbackWorking}
          onSubmit={onFeedback}
        />

        <DrawerSection title="Evidence links" icon={ShieldCheck}>
          {sourceUrls.length > 0 ? (
            <details>
              <summary className="cursor-pointer text-sm font-medium text-foreground">Show {sourceUrls.length} public source{sourceUrls.length === 1 ? "" : "s"}</summary>
              <div className="mt-3 space-y-3">
                {sourceUrls.slice(0, 8).map((url) => {
                  const source = evidence.find((item) => item.source_url === url)
                  return (
                    <a key={url} href={normalizeUrl(url)} target="_blank" rel="noreferrer" className="block rounded-lg border border-border bg-muted/20 p-3 transition-colors hover:bg-muted/40">
                      <span className="flex items-center gap-2 text-sm font-medium text-foreground"><ExternalLink className="h-3.5 w-3.5" />{source?.source_title || domain(url)}</span>
                      {source?.excerpt && <span className="mt-2 block text-sm leading-5 text-muted-foreground">{formatScoreReason(source.excerpt)}</span>}
                    </a>
                  )
                })}
              </div>
            </details>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">No source links were returned. Treat the lead as low-confidence until public evidence is checked.</p>
          )}
        </DrawerSection>

        <DrawerSection title="Website analysis" icon={Globe2}>
          {websiteSummary && <p className="text-sm leading-6 text-foreground">{websiteSummary}</p>}
          {websiteEvidence.length > 0 && <BulletList title="What Signal could verify" items={websiteEvidence} />}
          {websiteGaps.length > 0 && <div className={websiteEvidence.length > 0 ? "mt-4" : ""}><BulletList title="Gaps / verify" items={websiteGaps} tone="warning" /></div>}
          {!websiteSummary && websiteEvidence.length === 0 && websiteGaps.length === 0 && <p className="text-sm leading-6 text-muted-foreground">Website analysis is not ready yet. Signal will keep unknown items labeled rather than infer them.</p>}
        </DrawerSection>

        <DrawerSection title="Opportunity" icon={Target}>
          <MiniText label="Primary opportunity" value={pitch} />
          {opportunitySignals.length > 0 && <div className="mt-3"><BulletList title="Evidence-backed signals" items={opportunitySignals} /></div>}
          <div className="mt-3"><MiniText label="Best first move" value={firstAction} /></div>
        </DrawerSection>

        <DrawerSection title="Score breakdown" icon={Target}>
          {scores.length > 0 ? (
            <div className="space-y-4">
              {scores.map((score) => <ScoreBar key={score.label} label={score.label} value={score.value} max={score.max} rationale={score.rationale} evidence={score.evidence} unknowns={score.unknowns} />)}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">The score breakdown will appear after the evidence pass completes.</p>
          )}
        </DrawerSection>

        <DrawerSection title="Sales plan" icon={Sparkles}>
          <div className="grid gap-3">
            <MiniText label="Recommended offer" value={offer} />
            <MiniText label="Best pitch angle" value={pitch} />
            <MiniText label="Pricing angle" value={pricing} />
            <MiniText label="Best first action" value={firstAction} />
            {avoid.length > 0 && <BulletList title="What to avoid saying" items={avoid} tone="warning" />}
          </div>
        </DrawerSection>

        <DrawerSection title="Script pack" icon={FileText}>
          <div className="mb-4 flex flex-wrap gap-2">
            <button type="button" disabled={Boolean(working) || !canGenerate} onClick={() => onGenerate("scripts")} className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50">
              {working === "scripts" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate scripts
            </button>
            {generatedBy && <span className="inline-flex h-9 items-center rounded-md border border-border px-3 text-xs text-muted-foreground">{formatSignalLabel(generatedBy)}</span>}
            {lead.script_quality_score != null && <span className="inline-flex h-9 items-center rounded-md border border-border px-3 text-xs text-muted-foreground">Quality {lead.script_quality_score}/100</span>}
          </div>
          {scripts.length > 0 ? (
            <div className="space-y-3">
              {scripts.map(([title, value]) => <CopyBlock key={title} title={title} value={value} />)}
            </div>
          ) : (
            <p className="text-sm leading-6 text-muted-foreground">{canGenerate ? "Generate the pack to get a walk-in opener, call script, follow-up, and honest objection handling." : "Verify the missing watchlist/research facts before generating outreach."}</p>
          )}
        </DrawerSection>

        <DrawerSection title="Lovable concept prompt" icon={Sparkles}>
          <div className="mb-4 space-y-3">
            <textarea value={conceptNotes} onChange={(event) => setConceptNotes(event.target.value)} rows={2} placeholder="Optional concept direction for this regeneration" aria-label="Concept regeneration notes" className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
            <button type="button" disabled={Boolean(working) || !canGenerate} onClick={() => onGenerate("lovable", conceptNotes)} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50">
              {working === "lovable" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />} Generate concept prompt
            </button>
          </div>
          {lead.lovable_prompt ? <CopyBlock title="Concept preview prompt" value={lead.lovable_prompt} /> : <p className="text-sm leading-6 text-muted-foreground">Signal will write a custom concept prompt that uses verified details and labels unknown facts as placeholders.</p>}
        </DrawerSection>

        <section className="grid gap-4 lg:grid-cols-2">
          <DrawerSection title="Risks / verify" icon={AlertTriangle}>
            <BulletList items={risks.length ? risks : [lead.chain_reason || "Confirm the public contact and website details before outreach."]} tone="warning" />
          </DrawerSection>
          <DrawerSection title="Next step checklist" icon={CheckCircle2}>
            <BulletList items={checklist.length ? checklist : ["Open the source evidence", "Confirm the contact route", "Use the sales pack for the first conversation"]} />
          </DrawerSection>
        </section>

        <div className="flex flex-col gap-3 border-t border-border pt-5 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-md text-xs leading-5 text-muted-foreground">Public-source research only. Verify claims before outreach and never present a concept preview as the official business site.</p>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" disabled={Boolean(working) || lead.status === "saved"} onClick={() => onStatus("saved")} className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50">
              {working === "saved" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bookmark className="h-4 w-4" />} {lead.status === "saved" ? "Saved" : "Save"}
            </button>
            <button type="button" disabled={Boolean(working) || lead.status === "ignored"} onClick={() => onStatus("ignored")} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50">
              {working === "ignored" ? <Loader2 className="h-4 w-4 animate-spin" /> : <X className="h-4 w-4" />} Ignore
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const correctionOptions: Array<{ value: SignalRunLeadCorrection["correction_type"]; label: string }> = [
  { value: "canonical_name", label: "Correct business name" },
  { value: "official_website", label: "Set official website" },
  { value: "official_facebook", label: "Set official Facebook" },
  { value: "official_instagram", label: "Set official Instagram" },
  { value: "category", label: "Correct category" },
  { value: "city", label: "Correct city" },
  { value: "no_website_verified", label: "Confirm no official website" },
  { value: "chain", label: "Mark as chain" },
  { value: "duplicate", label: "Mark as duplicate" },
  { value: "not_a_business", label: "Mark as not a business" },
  { value: "reject", label: "Reject this lead" },
]

const observationOptions: Array<{ value: SignalRunLeadObservation["category"]; label: string }> = [
  { value: "storefront", label: "Storefront" },
  { value: "owner_availability", label: "Owner availability" },
  { value: "interest", label: "Interest" },
  { value: "follow_up", label: "Follow-up" },
  { value: "availability", label: "Availability" },
  { value: "contact_preference", label: "Contact preference" },
  { value: "existing_provider", label: "Existing provider" },
  { value: "operations", label: "Operations" },
  { value: "payment", label: "Payment" },
  { value: "other", label: "Other" },
]

function LeadKnowledgeEditor({
  corrections,
  observations,
  onSubmit,
  working,
}: {
  corrections: SignalRunLeadCorrection[]
  observations: SignalRunLeadObservation[]
  onSubmit: (input: LeadFeedbackInput) => Promise<boolean>
  working: "correction" | "observation" | null
}) {
  const [correctionType, setCorrectionType] = useState<SignalRunLeadCorrection["correction_type"]>("canonical_name")
  const [correctionValue, setCorrectionValue] = useState("")
  const [correctionNote, setCorrectionNote] = useState("")
  const [observationCategory, setObservationCategory] = useState<SignalRunLeadObservation["category"]>("storefront")
  const [observationNote, setObservationNote] = useState("")
  const correctionNeedsValue = ["canonical_name", "official_website", "official_facebook", "official_instagram", "category", "city"].includes(correctionType)

  const submitCorrection = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (correctionNeedsValue && !correctionValue.trim()) return
    const saved = await onSubmit({
      action: "correction",
      correction_type: correctionType,
      value: correctionValue.trim() || undefined,
      note: correctionNote.trim() || undefined,
    })
    if (saved) {
      setCorrectionValue("")
      setCorrectionNote("")
    }
  }

  const submitObservation = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (observationNote.trim().length < 2) return
    const saved = await onSubmit({ action: "observation", category: observationCategory, note: observationNote.trim() })
    if (saved) setObservationNote("")
  }

  return (
    <DrawerSection title="Corrections and field notes" icon={FileText}>
      <p className="text-sm leading-6 text-muted-foreground">Corrections persist by business identity. Field notes stay private to the Mountline team and are labeled as observations when used in a regenerated sales pack.</p>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <form onSubmit={submitCorrection} className="space-y-3 rounded-lg border border-border bg-muted/15 p-3">
          <label className="block text-xs font-medium text-muted-foreground" htmlFor="signal-correction-type">Correct research</label>
          <select id="signal-correction-type" value={correctionType} onChange={(event) => setCorrectionType(event.target.value as SignalRunLeadCorrection["correction_type"])} className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground">
            {correctionOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          {correctionNeedsValue && <input aria-label="Correct value" value={correctionValue} onChange={(event) => setCorrectionValue(event.target.value)} placeholder="Correct value" className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground" />}
          <input aria-label="Correction note" value={correctionNote} onChange={(event) => setCorrectionNote(event.target.value)} placeholder="Optional reason or source" className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground placeholder:text-muted-foreground" />
          <button type="submit" disabled={Boolean(working) || (correctionNeedsValue && !correctionValue.trim())} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50">
            {working === "correction" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save correction
          </button>
        </form>

        <form onSubmit={submitObservation} className="space-y-3 rounded-lg border border-border bg-muted/15 p-3">
          <label className="block text-xs font-medium text-muted-foreground" htmlFor="signal-observation-type">Add private observation</label>
          <select id="signal-observation-type" value={observationCategory} onChange={(event) => setObservationCategory(event.target.value as SignalRunLeadObservation["category"])} className="h-9 w-full rounded-md border border-border bg-background px-2.5 text-sm text-foreground">
            {observationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <textarea aria-label="Observation" value={observationNote} onChange={(event) => setObservationNote(event.target.value)} placeholder="What was observed directly?" rows={3} className="w-full rounded-md border border-border bg-background px-2.5 py-2 text-sm text-foreground placeholder:text-muted-foreground" />
          <button type="submit" disabled={Boolean(working) || observationNote.trim().length < 2} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-foreground transition-colors hover:bg-muted disabled:opacity-50">
            {working === "observation" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />} Save observation
          </button>
        </form>
      </div>

      {(corrections.length > 0 || observations.length > 0) && (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {corrections.length > 0 && <div><p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Active corrections</p><ul className="space-y-2">{corrections.slice(0, 5).map((item) => <li key={item.id} className="rounded-md border border-border bg-background/40 p-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">{formatSignalLabel(item.correction_type)}</span>{typeof item.corrected_value === "string" && item.corrected_value ? ` · ${item.corrected_value}` : ""}{item.note ? ` — ${item.note}` : ""}</li>)}</ul></div>}
          {observations.length > 0 && <div><p className="mb-2 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Private observations</p><ul className="space-y-2">{observations.slice(0, 5).map((item) => <li key={item.id} className="rounded-md border border-border bg-background/40 p-2 text-sm text-muted-foreground"><span className="font-medium text-foreground">{formatSignalLabel(item.category)}</span> · {item.note}</li>)}</ul></div>}
        </div>
      )}
    </DrawerSection>
  )
}

function DrawerSection({ children, icon: Icon, title }: { children: React.ReactNode; icon: typeof Building2; title: string }) {
  return (
    <section className="rounded-xl border border-border bg-card p-4">
      <div className="mb-4 flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <h3 className="font-semibold text-foreground">{title}</h3>
      </div>
      {children}
    </section>
  )
}

function DrawerMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold text-foreground">{value}</p>
    </div>
  )
}

function DetailLine({ external, href, icon: Icon, label, value }: { external?: boolean; href?: string; icon: typeof MapPin; label: string; value: string }) {
  const content = <><Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" /><span className="min-w-0"><span className="mr-1 text-muted-foreground">{label}:</span><span className="break-all text-foreground">{value}</span></span>{external && <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0" />}</>
  return href ? <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className="flex gap-2 text-muted-foreground transition-colors hover:text-foreground">{content}</a> : <div className="flex gap-2 text-muted-foreground">{content}</div>
}

function ScoreBar({
  evidence = [],
  label,
  max = 100,
  rationale,
  unknowns = [],
  value,
}: {
  evidence?: string[]
  label: string
  max?: number
  rationale?: string | null
  unknowns?: string[]
  value: number
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/15 p-3">
      <div className="mb-1.5 flex items-center justify-between gap-3 text-sm"><span className="text-muted-foreground">{label}</span><span className="font-mono text-foreground">{value}/{max}</span></div>
      <div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground" style={{ width: `${Math.max(0, Math.min(100, (value / Math.max(1, max)) * 100))}%` }} /></div>
      {rationale && <p className="mt-2 text-xs leading-5 text-muted-foreground">{rationale}</p>}
      {evidence.length > 0 && <p className="mt-2 text-xs leading-5 text-foreground/85"><span className="mr-1 font-medium text-muted-foreground">Evidence:</span>{evidence.join(" · ")}</p>}
      {unknowns.length > 0 && <p className="mt-1 text-xs leading-5 text-warning-foreground/80"><span className="mr-1 font-medium text-warning-foreground">Verify:</span>{unknowns.join(" · ")}</p>}
    </div>
  )
}

function MiniText({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return <div className="rounded-lg border border-border bg-muted/20 p-3"><p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{label}</p><p className="mt-2 text-sm leading-6 text-foreground">{value}</p></div>
}

function BulletList({ items, title, tone = "default" }: { items: string[]; title?: string; tone?: "default" | "warning" }) {
  return (
    <div>{title && <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">{title}</p>}<ul className="space-y-2">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2 text-sm leading-5 text-muted-foreground"><span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${tone === "warning" ? "bg-warning" : "bg-foreground"}`} />{item}</li>)}</ul></div>
  )
}

function CopyBlock({ title, value }: { title: string; value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1600)
    } catch {
      setCopied(false)
    }
  }
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3">
      <div className="mb-2 flex items-center justify-between gap-3"><p className="text-sm font-medium text-foreground">{title}</p><button type="button" onClick={() => void copy()} className="inline-flex h-7 items-center gap-1.5 rounded-md border border-border px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Clipboard className="h-3.5 w-3.5" />{copied ? "Copied" : "Copy"}</button></div>
      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  )
}

function normalizeUrl(value: string) {
  return /^https?:\/\//i.test(value) || /^mailto:|^tel:/i.test(value) ? value : `https://${value}`
}

function domain(value: string) {
  try { return new URL(normalizeUrl(value)).hostname.replace(/^www\./, "") } catch { return value }
}
