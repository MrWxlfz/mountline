"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Building2,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Clock3,
  FileText,
  Globe2,
  Loader2,
  MapPin,
  Phone,
  RadioTower,
  RefreshCw,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
} from "lucide-react"
import {
  formatBusinessCategory,
  formatConfidence,
  formatOnlinePresence,
  formatRunStage,
  formatRunStatus,
  formatScoreReason,
} from "@/lib/signal/presentation"
import type { SignalRun, SignalRunEvent, SignalRunLead } from "@/lib/supabase/types"

type JsonRecord = Record<string, unknown>

export type SignalProviderSetup = {
  places?: boolean
  tavily?: boolean
  firecrawl?: boolean
  ai?: boolean
  missing?: string[]
  warnings?: string[]
}

export type SignalLeadEngineProps = {
  initialRuns?: SignalRun[]
  initialSavedLeads?: SignalRunLead[]
  initialActiveRun?: SignalRun | null
  initialActiveEvents?: SignalRunEvent[]
  initialActiveLeads?: SignalRunLead[]
  providerSetup?: SignalProviderSetup | null
  storageMessage?: string | null
  userName?: string
}

type RunPayload = {
  run?: SignalRun
  runs?: SignalRun[]
  leads?: SignalRunLead[]
  events?: SignalRunEvent[]
  savedLeads?: SignalRunLead[]
  activeRun?: SignalRun | null
  activeLeads?: SignalRunLead[]
  activeEvents?: SignalRunEvent[]
  providerSetup?: SignalProviderSetup
}

const activeStatuses = new Set([
  "queued", "discovering", "enriching", "analyzing", "selecting", "generating",
  "checking", "scoring", "writing_packs", "ranking",
])

const industryOptions = [
  ["best_opportunities", "Best opportunities"],
  ["barbers_salons", "Barbers / salons"],
  ["groomers_pet_services", "Groomers / pet services"],
  ["auto_detailing", "Auto detailing"],
  ["contractors_home_services", "Contractors / home services"],
  ["med_spas_wellness", "Med spas / wellness"],
  ["restaurants_local_food", "Restaurants / local food"],
  ["churches_nonprofits", "Churches / nonprofits"],
  ["commercial_cleaning", "Commercial cleaning"],
  ["custom", "Custom"],
] as const

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

function asRuns(value: unknown): SignalRun[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.map(asRun).filter((item): item is SignalRun => Boolean(item))
}

function asLeads(value: unknown): SignalRunLead[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.map(asLead).filter((item): item is SignalRunLead => Boolean(item))
}

function asEvents(value: unknown): SignalRunEvent[] | undefined {
  if (!Array.isArray(value)) return undefined
  return value.filter((item) => {
    const record = asRecord(item)
    return Boolean(record && typeof record.id === "string" && typeof record.message === "string")
  }) as SignalRunEvent[]
}

function asProviderSetup(value: unknown): SignalProviderSetup | undefined {
  const record = asRecord(value)
  if (!record) return undefined
  return {
    places: typeof record.places === "boolean" ? record.places : undefined,
    tavily: typeof record.tavily === "boolean" ? record.tavily : undefined,
    firecrawl: typeof record.firecrawl === "boolean" ? record.firecrawl : undefined,
    ai: typeof record.ai === "boolean" ? record.ai : undefined,
    missing: Array.isArray(record.missing)
      ? record.missing.filter((item): item is string => typeof item === "string")
      : undefined,
    warnings: Array.isArray(record.warnings)
      ? record.warnings.filter((item): item is string => typeof item === "string")
      : undefined,
  }
}

function parsePayload(value: unknown): RunPayload {
  const record = asRecord(value)
  if (!record) return {}
  const activeRecord = asRecord(record.active)
  const directRun = asRun(value)

  return {
    run: asRun(record.run) || directRun || undefined,
    runs: asRuns(record.runs),
    leads: asLeads(record.leads),
    events: asEvents(record.events),
    savedLeads: asLeads(record.saved_leads) || asLeads(record.savedLeads),
    activeRun: asRun(record.active_run) || asRun(record.activeRun) || asRun(activeRecord?.run) || undefined,
    activeLeads: asLeads(record.active_leads) || asLeads(record.activeLeads) || asLeads(activeRecord?.leads),
    activeEvents: asEvents(record.active_events) || asEvents(record.activeEvents) || asEvents(activeRecord?.events),
    providerSetup: asProviderSetup(record.provider_setup) || asProviderSetup(record.providerSetup),
  }
}

function stageLabel(value: string | null | undefined) {
  return formatRunStage(value)
}

function activeRun(run: SignalRun | null | undefined) {
  return Boolean(run && activeStatuses.has(run.status))
}

function dateLabel(value: string | null | undefined) {
  if (!value) return "Just now"
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return "Recently"
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

function timeLabel(value: string | null | undefined) {
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
    const words = stringsFrom(candidate)
    if (words.length > 0) return words.join(" ")
  }
  return null
}

function sortedRuns(runs: SignalRun[]) {
  return [...runs].sort((left, right) => right.created_at.localeCompare(left.created_at))
}

function sortedLeads(leads: SignalRunLead[]) {
  return [...leads]
    .filter((lead) => !["ignored", "excluded", "failed"].includes(lead.status) && (lead.qualification_status === "qualified" || (lead.qualification_status == null && lead.rank != null)))
    .sort((left, right) => {
      const rank = (left.rank ?? Number.MAX_SAFE_INTEGER) - (right.rank ?? Number.MAX_SAFE_INTEGER)
      if (rank !== 0) return rank
      return (right.final_score ?? -1) - (left.final_score ?? -1)
    })
}

function providerMissing(providerSetup: SignalProviderSetup | null | undefined) {
  if (!providerSetup) return []
  if (providerSetup.places === false && providerSetup.tavily === false) {
    return ["GOOGLE_PLACES_API_KEY or TAVILY_API_KEY"]
  }
  return []
}

function onlinePresence(lead: SignalRunLead) {
  return lead.online_presence_classification || lead.website_status
}

function leadName(lead: SignalRunLead) {
  return lead.display_name || lead.canonical_name || lead.business_name
}

export function SignalLeadEngine({
  initialActiveEvents = [],
  initialActiveLeads = [],
  initialActiveRun = null,
  initialRuns = [],
  initialSavedLeads = [],
  providerSetup = null,
  storageMessage = null,
  userName = "Luke",
}: SignalLeadEngineProps) {
  const firstActiveRun = initialActiveRun || initialRuns.find((run) => activeRun(run)) || null
  const [runs, setRuns] = useState(initialRuns)
  const [savedLeads, setSavedLeads] = useState(initialSavedLeads)
  const [currentRun, setCurrentRun] = useState<SignalRun | null>(firstActiveRun)
  const [currentEvents, setCurrentEvents] = useState(initialActiveEvents)
  const [currentLeads, setCurrentLeads] = useState(initialActiveLeads)
  const [setup, setSetup] = useState<SignalProviderSetup | null>(providerSetup)
  const [marketType, setMarketType] = useState<"city" | "metro">("city")
  const [location, setLocation] = useState("")
  const [radius, setRadius] = useState("10")
  const [leadLimit, setLeadLimit] = useState(5)
  const [industry, setIndustry] = useState("best_opportunities")
  const [customIndustry, setCustomIndustry] = useState("")
  const [notes, setNotes] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const advancingRef = useRef(false)

  const applyPayload = useCallback((payload: RunPayload) => {
    if (payload.runs) setRuns(payload.runs)
    if (payload.savedLeads) setSavedLeads(payload.savedLeads)
    if (payload.providerSetup) setSetup(payload.providerSetup)

    const nextRun = payload.activeRun || payload.run || payload.runs?.find((item) => activeRun(item))
    if (nextRun) {
      setCurrentRun(nextRun)
      setRuns((current) => {
        const withoutRun = current.filter((item) => item.id !== nextRun.id)
        return sortedRuns([nextRun, ...withoutRun])
      })
    }
    if (payload.activeLeads || payload.leads) setCurrentLeads(payload.activeLeads || payload.leads || [])
    if (payload.activeEvents || payload.events) setCurrentEvents(payload.activeEvents || payload.events || [])
  }, [])

  const refreshOverview = useCallback(async (silent = false) => {
    if (!silent) {
      setRefreshing(true)
      setError(null)
    }
    try {
      const response = await fetch("/api/signal/runs", { cache: "no-store" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Scout could not refresh the discovery runs.")
      applyPayload(parsePayload(data))
    } catch (cause) {
      if (!silent) setError(cause instanceof Error ? cause.message : "Scout could not refresh the discovery runs.")
    } finally {
      if (!silent) setRefreshing(false)
    }
  }, [applyPayload])

  const refreshCurrentRun = useCallback(async (silent = false) => {
    if (!currentRun) return
    try {
      const response = await fetch(`/api/signal/runs/${currentRun.id}`, { cache: "no-store" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Scout could not refresh this run.")
      applyPayload(parsePayload(data))
    } catch (cause) {
      if (!silent) setError(cause instanceof Error ? cause.message : "Scout could not refresh this run.")
    }
  }, [applyPayload, currentRun])

  const advanceCurrentRun = useCallback(async (silent = false) => {
    if (!currentRun || (!activeRun(currentRun) && currentRun.status !== "failed") || advancingRef.current) return
    advancingRef.current = true
    try {
      const response = await fetch(`/api/signal/runs/${currentRun.id}/advance`, { method: "POST" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Scout could not continue this run.")
      applyPayload(parsePayload(data))
    } catch (cause) {
      if (!silent) setError(cause instanceof Error ? cause.message : "Scout could not continue this run.")
    } finally {
      advancingRef.current = false
    }
  }, [applyPayload, currentRun])

  useEffect(() => {
    void refreshOverview(true)
  }, [refreshOverview])

  useEffect(() => {
    if (!currentRun || !activeRun(currentRun)) return
    let cancelled = false
    const tick = async () => {
      await advanceCurrentRun(true)
      if (!cancelled) await refreshCurrentRun(true)
    }
    void tick()
    const interval = window.setInterval(() => void tick(), 3500)
    return () => {
      cancelled = true
      window.clearInterval(interval)
    }
  }, [advanceCurrentRun, currentRun?.status, refreshCurrentRun])

  const changeMarketType = (next: "city" | "metro") => {
    setMarketType(next)
    setRadius(next === "city" ? "10" : "25")
  }

  const createRun = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/signal/runs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          market_type: marketType,
          location: location.trim(),
          radius_miles: Number(radius) || (marketType === "city" ? 10 : 25),
          lead_limit: leadLimit,
          industry_focus: industry,
          custom_industry: industry === "custom" ? customIndustry.trim() || null : null,
          notes: notes.trim() || null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(typeof data?.error === "string" ? data.error : "Scout could not start this run.")
      const payload = parsePayload(data)
      const createdRun = payload.run || payload.activeRun
      if (!createdRun) throw new Error("Scout created the request but did not return a run.")

      applyPayload({ ...payload, activeRun: createdRun })
      setMessage(`Searching ${createdRun.location} for independent local businesses…`)
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Scout could not start this run.")
    } finally {
      setSubmitting(false)
    }
  }

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  const missingProviders = providerMissing(setup)
  const providerWarnings = setup?.warnings || []
  const currentIsActive = activeRun(currentRun)
  const progress = Math.max(0, Math.min(100, currentRun?.progress_percent || 0))
  const currentResults = useMemo(() => sortedLeads(currentLeads), [currentLeads])
  const recentRuns = useMemo(() => sortedRuns(runs).filter((run) => run.id !== currentRun?.id).slice(0, 4), [currentRun?.id, runs])
  const recentEvents = useMemo(() => [...currentEvents].sort((left, right) => right.created_at.localeCompare(left.created_at)).slice(0, 7), [currentEvents])

  return (
    <div className="space-y-7 pb-10">
      <section className="relative overflow-hidden rounded-xl border border-border bg-card px-5 py-7 sm:px-7 sm:py-9">
        <div aria-hidden className="bg-dot-grid absolute inset-0 opacity-35" />
        <div className="relative grid gap-7 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">Mountline Scout</p>
            <h1 className="mt-4 text-4xl font-semibold tracking-[-0.045em] text-foreground sm:text-5xl">Welcome back, {userName}.</h1>
            <p className="mt-2 text-2xl font-medium tracking-tight text-muted-foreground sm:text-3xl">Let’s run up these leads.</p>
            <p className="mt-5 max-w-2xl text-sm leading-6 text-muted-foreground">
              Explore a market for possible businesses to review. Discovery results are suggestions until they are moved into Signal and re-analyzed.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 xl:justify-end">
            <button type="button" onClick={() => scrollTo("recent-runs")} className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background/70 px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Clock3 className="h-4 w-4" />View recent runs</button>
            <button type="button" onClick={() => scrollTo("saved-leads")} className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background/70 px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Bookmark className="h-4 w-4" />Open saved leads</button>
            <button type="button" onClick={() => scrollTo("run-results")} className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-background/70 px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><Sparkles className="h-4 w-4" />Concepts</button>
          </div>
        </div>
      </section>

      {missingProviders.length > 0 && (
        <div role="alert" className="flex flex-col gap-3 rounded-xl border border-warning-border bg-warning-soft p-4 text-sm text-warning-foreground sm:flex-row sm:items-start sm:justify-between">
          <div className="flex gap-3"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" /><div><p className="font-medium">Scout needs a research connection.</p><p className="mt-1 leading-5 text-warning-foreground/80">Configure at least one local discovery connection to start live research. Existing runs remain safe to review.</p></div></div>
        </div>
      )}

      {storageMessage && (
        <div role="alert" className="flex gap-3 rounded-xl border border-warning-border bg-warning-soft p-4 text-sm text-warning-foreground">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Scout needs its run storage.</p>
            <p className="mt-1 leading-5 text-warning-foreground/80">{storageMessage}</p>
          </div>
        </div>
      )}

      {missingProviders.length === 0 && providerWarnings.length > 0 && (
        <div role="status" className="flex gap-3 rounded-xl border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium text-foreground">Website analysis is limited right now.</p>
            <p className="mt-1 leading-5">Scout is relying more heavily on verified listing and public-profile data. {providerWarnings.map((warning) => formatScoreReason(warning)).join(" ")}</p>
          </div>
        </div>
      )}

      {(message || error) && (
        <div role="status" className={`rounded-lg border px-4 py-3 text-sm ${error ? "border-error-border bg-error-soft text-error-foreground" : "border-success-border bg-success-soft text-success-foreground"}`}>{error || message}</div>
      )}

      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border px-5 py-5 sm:px-6">
          <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">New lead run</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Pick a market. Scout assembles suggestions.</h2>
        </div>
        <form onSubmit={createRun} className="p-5 sm:p-6">
          <div className="grid gap-5 xl:grid-cols-[1.1fr_1.35fr_0.8fr_1fr_auto] xl:items-end">
            <fieldset className="space-y-2">
              <legend className="text-sm font-medium text-foreground">Market type</legend>
              <div className="grid grid-cols-2 gap-2 rounded-lg border border-border bg-muted/20 p-1">
                {(["city", "metro"] as const).map((type) => (
                  <button key={type} type="button" onClick={() => changeMarketType(type)} className={`h-9 rounded-md px-3 text-sm font-medium transition-colors ${marketType === type ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}>
                    {type === "city" ? "City" : "Metro / area"}
                  </button>
                ))}
              </div>
            </fieldset>
            <Field label={marketType === "city" ? "City" : "Metroplex / area"}>
              <div className="relative"><MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" /><input required value={location} onChange={(event) => setLocation(event.target.value)} placeholder={marketType === "city" ? "Keller, TX" : "Dallas–Fort Worth"} className="h-10 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40" /></div>
            </Field>
            <Field label="Radius"><div className="relative"><input type="number" min={1} max={100} value={radius} onChange={(event) => setRadius(event.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 pr-12 text-sm text-foreground outline-none transition-colors focus:border-foreground/40" /><span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">miles</span></div></Field>
            <Field label="Industry focus"><select value={industry} onChange={(event) => setIndustry(event.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors focus:border-foreground/40">{industryOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></Field>
            <button type="submit" disabled={submitting || currentIsActive || !location.trim() || (industry === "custom" && !customIndustry.trim()) || missingProviders.length > 0} className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-45">
              {submitting || currentIsActive ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />} {currentIsActive ? "Run in progress" : "Find leads"}
            </button>
          </div>

          <div className="mt-5 grid gap-5 border-t border-border pt-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <div className="space-y-2"><span className="text-sm font-medium text-foreground">How many leads?</span><div className="flex flex-wrap gap-2">{[5, 10, 15, 25].map((count) => <button key={count} type="button" onClick={() => setLeadLimit(count)} className={`inline-flex h-9 min-w-11 items-center justify-center rounded-md border px-3 text-sm font-medium transition-colors ${leadLimit === count ? "border-foreground bg-foreground text-background" : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"}`}>{count}</button>)}</div></div>
            <Field label="Optional notes"><textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows={2} placeholder="Prioritize businesses that welcome walk-in conversations" className="min-h-18 w-full resize-y rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40" /></Field>
          </div>
          {industry === "custom" && <Field label="Custom industry"><input value={customIndustry} onChange={(event) => setCustomIndustry(event.target.value)} placeholder="Example: independent landscapers" className="mt-2 h-10 w-full rounded-md border border-border bg-background px-3 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-foreground/40" /></Field>}
          <p className="mt-4 text-xs leading-5 text-muted-foreground">Scout starts with structured local listings, filters chains by default, checks public pages, and labels uncertainty. Results remain suggestions until focused Signal analysis.</p>
        </form>
      </section>

      {currentRun && currentIsActive && (
        <section className="grid gap-4 xl:grid-cols-[minmax(0,1.25fr)_minmax(310px,0.75fr)]">
          <div className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Active run</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{stageLabel(currentRun.current_stage || currentRun.status)}</h2><p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">Searching {currentRun.location} for independent businesses with a real reason to care about their online presence.</p></div>
              <Link href={`/dashboard/signal/runs/${currentRun.id}`} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Open run <ArrowRight className="h-4 w-4" /></Link>
            </div>
            <div className="mt-6 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground transition-all duration-700" style={{ width: `${progress}%` }} /></div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground"><span>{progress}% complete</span><span>{currentRun.lead_limit} leads requested · {currentRun.radius_miles} mi discovery preference</span></div>
          </div>
          <RunEventFeed events={recentEvents} />
        </section>
      )}

      {currentRun && !currentIsActive && (["completed", "partial", "completed_with_limits"] as string[]).includes(currentRun.status) && (
        <section id="run-results" className="scroll-mt-20 rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Latest suggestions</p><h2 className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{userName}, Scout found businesses worth reviewing.</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">Treat every result as a suggestion. Move a business into Signal to resolve identity, evidence, verdict, concept, and outreach.</p></div><Link href={`/dashboard/signal/runs/${currentRun.id}`} className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Open full run <ArrowRight className="h-4 w-4" /></Link></div>
          {currentResults.length > 0 ? <div className="mt-6 grid gap-4 xl:grid-cols-2">{currentResults.slice(0, 5).map((lead, index) => <ResultLeadCard key={lead.id} lead={lead} rank={lead.rank || index + 1} />)}</div> : <div className="mt-6 rounded-lg border border-dashed border-border bg-muted/20 p-7 text-center"><Target className="mx-auto h-6 w-6 text-muted-foreground" /><p className="mt-3 font-medium text-foreground">No leads are ready to rank yet.</p><p className="mt-2 text-sm text-muted-foreground">Open the run to review the partial evidence and retry any failed provider step.</p></div>}
        </section>
      )}

      {currentRun?.status === "failed" && (
        <section className="flex flex-col gap-4 rounded-xl border border-warning-border bg-warning-soft p-5 sm:flex-row sm:items-end sm:justify-between sm:p-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.18em] text-warning-foreground/70">Run paused safely</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Scout kept the checkpoint. Retry when ready.</h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">{currentRun.error_message || "A public research step did not finish. No completed evidence was discarded."}</p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button type="button" onClick={() => { setMessage("Retrying the last safe Scout stage…"); void advanceCurrentRun() }} className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"><RefreshCw className="h-4 w-4" />Try again</button>
            <Link href={`/dashboard/signal/runs/${currentRun.id}`} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">Open run <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </section>
      )}

      <section id="recent-runs" className="scroll-mt-20 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div className="flex items-end justify-between gap-4"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Recent runs</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">Pick up where you left off.</h2></div><button type="button" onClick={() => void refreshOverview()} disabled={refreshing} className="inline-flex h-8 items-center gap-2 rounded-md border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50">{refreshing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}Refresh</button></div>
        {recentRuns.length > 0 ? <div className="mt-5 grid gap-3 lg:grid-cols-2">{recentRuns.map((run) => <RecentRunCard key={run.id} run={run} />)}</div> : <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">Your finished and previous runs will appear here.</div>}
      </section>

      <section id="saved-leads" className="scroll-mt-20 rounded-xl border border-border bg-card p-5 sm:p-6">
        <div><p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Saved leads</p><h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">The businesses you want to keep close.</h2></div>
        {savedLeads.length > 0 ? <div className="mt-5 grid gap-3 lg:grid-cols-2">{savedLeads.slice(0, 6).map((lead) => <SavedLeadCard key={lead.id} lead={lead} />)}</div> : <div className="mt-5 rounded-lg border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">Save a strong lead from a completed run and it will stay here for walk-ins, calls, and follow-up.</div>}
      </section>
    </div>
  )
}

function Field({ children, label }: { children: React.ReactNode; label: string }) {
  return <label className="block space-y-2"><span className="text-sm font-medium text-foreground">{label}</span>{children}</label>
}

function RunEventFeed({ events }: { events: SignalRunEvent[] }) {
  return <section className="rounded-xl border border-border bg-card p-5"><div className="flex items-center justify-between gap-3"><div><p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">Progress</p><h2 className="mt-2 text-lg font-semibold text-foreground">What Scout is doing</h2></div><RadioTower className="h-4 w-4 text-muted-foreground" /></div><div className="mt-5 max-h-[268px] space-y-4 overflow-y-auto pr-1">{events.length > 0 ? events.map((event) => <div key={event.id} className="grid grid-cols-[54px_minmax(0,1fr)] gap-3"><span className="pt-0.5 font-mono text-[11px] text-muted-foreground">{timeLabel(event.created_at)}</span><div className="border-l border-border pl-3"><p className="text-xs font-medium text-foreground">{stageLabel(event.stage)}</p><p className="mt-1 text-sm leading-5 text-muted-foreground">{formatScoreReason(event.message)}</p></div></div>) : <p className="text-sm leading-6 text-muted-foreground">Scout will add persisted progress events as soon as research starts.</p>}</div></section>
}

function RecentRunCard({ run }: { run: SignalRun }) {
  const active = activeRun(run)
  const statusClass = run.status === "completed"
    ? "border-success-border bg-success-soft text-success-foreground"
    : run.status === "failed"
      ? "border-error-border bg-error-soft text-error-foreground"
      : "border-border bg-muted/50 text-muted-foreground"
  return (
    <Link href={`/dashboard/signal/runs/${run.id}`} className="group rounded-lg border border-border bg-background/40 p-4 transition-colors hover:border-foreground/25 hover:bg-muted/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0"><p className="truncate font-medium text-foreground">{run.location}</p><p className="mt-1 text-sm text-muted-foreground">{run.market_type === "metro" ? "Metro / area" : "City"} · {run.lead_limit} leads · {dateLabel(run.created_at)}</p></div>
        <span className={`shrink-0 rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass}`}>{formatRunStatus(run.status)}</span>
      </div>
      {active && <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-foreground" style={{ width: `${Math.max(0, Math.min(100, run.progress_percent))}%` }} /></div>}
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>{active ? stageLabel(run.current_stage) : "Open results"}</span><span className="inline-flex items-center gap-1 group-hover:text-foreground">Open <ChevronRight className="h-3.5 w-3.5" /></span></div>
    </Link>
  )
}

function ResultLeadCard({ lead, rank }: { lead: SignalRunLead; rank: number }) {
  const reasons = stringsFrom(lead.key_reasons).map((reason) => formatScoreReason(reason)).slice(0, 3)
  const salesPack = asRecord(lead.sales_pack)
  const pitch = textFrom(salesPack, ["best_angle", "strongest_honest_angle", "best_pitch_angle", "pitch_angle"])
  const action = textFrom(salesPack, ["best_first_action", "recommended_first_action", "next_action"])
  const location = [lead.city, lead.state].filter(Boolean).join(", ") || lead.address || "Location to verify"
  const presence = onlinePresence(lead)
  const statusTone = ["no_site", "weak_site", "social_only", "no_website_found", "directory_only", "website_unreachable", "website_broken", "website_weak"].includes(presence) ? "border-warning-border bg-warning-soft text-warning-foreground" : ["strong_site", "website_strong"].includes(presence) ? "border-success-border bg-success-soft text-success-foreground" : "border-border bg-muted/50 text-muted-foreground"
  const href = `/dashboard/signal/runs/${lead.run_id}?lead=${lead.id}`

  return <article className="rounded-xl border border-border bg-background/40 p-4 transition-colors hover:border-foreground/25 sm:p-5"><div className="flex items-start justify-between gap-4"><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><span className="flex h-7 min-w-7 items-center justify-center rounded-md border border-border bg-card px-1 font-mono text-xs text-muted-foreground">{rank}</span><span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${statusTone}`}>{formatOnlinePresence(presence)}</span></div><h3 className="mt-3 truncate text-lg font-semibold text-foreground">{leadName(lead)}</h3><p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground"><span>{formatBusinessCategory(lead.primary_category || lead.industry)}</span><span className="text-border">/</span><span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{location}</span></p></div><div className="shrink-0 text-right"><p className="font-mono text-2xl font-semibold text-foreground">{lead.final_score ?? "—"}</p><p className="mt-1 text-[11px] uppercase tracking-wider text-muted-foreground">Scout score</p><p className="mt-2 text-xs text-muted-foreground">{formatConfidence(lead.confidence_score)}</p></div></div><div className="mt-5 rounded-lg border border-border bg-card/50 p-3"><p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Why it may stand out</p><p className="mt-2 text-sm leading-5 text-foreground">{pitch || reasons[0] || "Open this suggestion to review its discovery evidence."}</p>{action && <p className="mt-2 text-xs leading-5 text-muted-foreground"><span className="text-foreground">Suggested move:</span> {action}</p>}</div>{reasons.length > 0 && <ul className="mt-4 space-y-2">{reasons.map((reason, index) => <li key={`${reason}-${index}`} className="flex gap-2 text-sm leading-5 text-muted-foreground"><Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success-foreground" />{reason}</li>)}</ul>}<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4"><div className="flex flex-wrap gap-3 text-xs text-muted-foreground">{lead.phone && <span className="inline-flex items-center gap-1"><Phone className="h-3.5 w-3.5" />{lead.phone}</span>}{lead.is_independent_likely && <span className="inline-flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" />Likely independent</span>}</div><div className="flex flex-wrap gap-2"><Link href={href} className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"><FileText className="h-3.5 w-3.5" />Review discovery</Link><AnalyzeRunLeadButton lead={lead} /></div></div></article>
}

function AnalyzeRunLeadButton({ lead }: { lead: SignalRunLead }) {
  const [working, setWorking] = useState(false)
  const [error, setError] = useState<string | null>(null)
  async function analyze() {
    setWorking(true)
    setError(null)
    try {
      const response = await fetch(`/api/signal/runs/${lead.run_id}/leads/${lead.id}/analyze`, { method: "POST" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Suggestion could not be opened in Signal.")
      window.location.assign(data.workspace_url)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Suggestion could not be opened in Signal.")
      setWorking(false)
    }
  }
  return <div className="flex flex-col items-end gap-1"><button type="button" onClick={analyze} disabled={working} className="inline-flex h-8 items-center gap-1.5 rounded-md bg-foreground px-3 text-xs font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50">{working ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}Analyze in Signal</button>{error && <span className="max-w-48 text-right text-[11px] text-error-foreground">{error}</span>}</div>
}

function SavedLeadCard({ lead }: { lead: SignalRunLead }) {
  const href = `/dashboard/signal/runs/${lead.run_id}?lead=${lead.id}`
  return <Link href={href} className="group rounded-lg border border-border bg-background/40 p-4 transition-colors hover:border-foreground/25 hover:bg-muted/20"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><div className="flex items-center gap-2"><Bookmark className="h-4 w-4 text-success-foreground" /><p className="truncate font-medium text-foreground">{leadName(lead)}</p></div><p className="mt-2 text-sm text-muted-foreground">{[formatBusinessCategory(lead.primary_category || lead.industry), lead.city, lead.state].filter(Boolean).join(" · ")}</p></div><span className="font-mono text-lg font-semibold text-foreground">{lead.final_score ?? "—"}</span></div><div className="mt-4 flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground"><span>{lead.phone || lead.website_url || "Open sales pack"}</span><span className="inline-flex items-center gap-1 group-hover:text-foreground">Open <ArrowUpRight className="h-3.5 w-3.5" /></span></div></Link>
}
