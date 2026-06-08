"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  BarChart3,
  Bell,
  BookOpen,
  CalendarCheck,
  ExternalLink,
  Loader2,
  MapPin,
  PhoneCall,
  Plus,
  RadioTower,
  Search,
  Upload,
  MoreHorizontal,
  SlidersHorizontal,
  X,
} from "lucide-react"
import {
  CompactTable,
  EmptyState,
  MetricStrip,
  PageHeader,
  PrimaryAction,
  SectionPanel,
  SecondaryAction,
  StatusBadge,
  priorityTone,
} from "@/components/dashboard/dashboard-ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getSignalPlaybook, SIGNAL_PLAYBOOKS } from "@/lib/signal/playbooks"
import type { SignalCampaignRow, SignalMarketRow, SignalProspectRow } from "./page"
import type { SignalOutreachEvent } from "@/lib/supabase/types"

type Filters = {
  playbook: string
  priority: string
  compliance: string
  status: string
  mode: string
  channel: string
  demo: string
  city: string
  valueBand: string
}

const emptyFilters: Filters = {
  playbook: "",
  priority: "",
  compliance: "",
  status: "",
  mode: "",
  channel: "",
  demo: "",
  city: "",
  valueBand: "",
}

const statusLabels: Record<string, string> = {
  researched: "Researched",
  needs_review: "Needs review",
  ready_to_contact: "Ready",
  contacted: "Contacted",
  awaiting_reply: "Awaiting reply",
  permission_to_send_demo: "Permission to send",
  demo_sent: "Demo sent",
  interested: "Interested",
  discovery_call: "Discovery call",
  proposal_sent: "Proposal sent",
  won: "Won",
  lost: "Lost",
  no_response: "No response",
  do_not_contact: "Do not contact",
}

const modeLabels: Record<string, string> = {
  local_student: "Warm local",
  professional_studio: "Professional",
  warm_connection: "Warm connection",
}

const channelLabels: Record<string, string> = {
  call: "Call",
  email: "Email",
  instagram: "Instagram",
  contact_form: "Contact form",
  warm_intro: "Warm intro",
  research_more: "Research more",
}

function formatDate(value: string | null) {
  if (!value) return "-"
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

function parseCsv(text: string) {
  const rows: string[][] = []
  let current = ""
  let row: string[] = []
  let quoted = false

  for (let index = 0; index < text.length; index += 1) {
    const char = text[index]
    const next = text[index + 1]

    if (char === '"' && quoted && next === '"') {
      current += '"'
      index += 1
    } else if (char === '"') {
      quoted = !quoted
    } else if (char === "," && !quoted) {
      row.push(current.trim())
      current = ""
    } else if ((char === "\n" || char === "\r") && !quoted) {
      if (char === "\r" && next === "\n") index += 1
      row.push(current.trim())
      if (row.some(Boolean)) rows.push(row)
      row = []
      current = ""
    } else {
      current += char
    }
  }

  row.push(current.trim())
  if (row.some(Boolean)) rows.push(row)
  return rows
}

function mapCsvToProspects(text: string) {
  const rows = parseCsv(text)
  const [headers, ...dataRows] = rows
  if (!headers || headers.length === 0) return []

  const normalizedHeaders = headers.map((header) =>
    header.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim(),
  )

  const get = (row: string[], names: string[]) => {
    const index = normalizedHeaders.findIndex((header) =>
      names.some((name) => header === name || header.includes(name)),
    )
    return index >= 0 ? row[index] || "" : ""
  }

  return dataRows
    .map((row) => ({
      business_name: get(row, ["business name", "business", "company", "name"]),
      industry: get(row, ["industry", "category", "playbook"]) || "general local business",
      city: get(row, ["city"]),
      website_url: get(row, ["website", "url", "site"]),
      public_email: get(row, ["email"]),
      public_phone: get(row, ["phone"]),
      human_notes: get(row, ["notes", "note"]),
      relevant_demo:
        get(row, ["relevant demo", "demo"]).toLowerCase().includes("auto")
          ? "auto-detailing"
          : get(row, ["relevant demo", "demo"]).toLowerCase().includes("barber")
            ? "barber-shop"
            : "none",
      existing_website_platform: get(row, ["platform", "website platform"]),
      outreach_status: get(row, ["status"]) || "researched",
      source: "csv_import",
    }))
    .filter((row) => row.business_name && row.industry)
}

export function SignalDashboard({
  campaigns,
  events,
  markets,
  initialRows,
}: {
  campaigns: SignalCampaignRow[]
  events: SignalOutreachEvent[]
  markets: SignalMarketRow[]
  initialRows: SignalProspectRow[]
}) {
  const [rows, setRows] = useState(initialRows)
  const [filters, setFilters] = useState(emptyFilters)
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [importOpen, setImportOpen] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [savingImport, setSavingImport] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [creatingSession, setCreatingSession] = useState(false)
  const [quickScoringId, setQuickScoringId] = useState<string | null>(null)
  const [showAllProspects, setShowAllProspects] = useState(false)

  const previewRows = useMemo(() => mapCsvToProspects(csvText).slice(0, 25), [csvText])

  const stats = useMemo(
    () => ({
      total: rows.length,
      aLeads: rows.filter((row) => row.latest_analysis?.priority === "A").length,
      ready: rows.filter((row) => row.outreach_status === "ready_to_contact").length,
      awaiting: rows.filter((row) => row.outreach_status === "awaiting_reply").length,
      discovery: rows.filter((row) => row.outreach_status === "discovery_call").length,
      won: rows.filter((row) => row.outreach_status === "won").length,
    }),
    [rows],
  )

  const today = new Date().toISOString().slice(0, 10)
  const todayStrip = useMemo(
    () => ({
      calls: rows.filter((row) =>
        ["ready_to_contact", "needs_review"].includes(row.outreach_status) &&
        row.contact_readiness !== "contact_missing" &&
        row.latest_analysis?.priority !== "skip",
      ).length,
      followUps: rows.filter((row) => row.follow_up_date && row.follow_up_date <= today).length,
      demoSends: rows.filter((row) => row.outreach_status === "permission_to_send_demo").length,
      alerts: rows.filter((row) => row.unread_alert).length,
      researchQueue:
        rows.filter((row) => ["researched", "needs_review"].includes(row.outreach_status)).length +
        campaigns.reduce(
          (sum, campaign) =>
            sum +
            campaign.candidates.filter((candidate) =>
              ["approved", "needs_confirmation"].includes(candidate.candidate_status),
            ).length,
          0,
        ) +
        markets.reduce(
          (sum, market) =>
            sum +
            market.candidates.filter((candidate) =>
              ["needs_confirmation", "official_site_resolved"].includes(candidate.research_state),
            ).length,
          0,
        ),
    }),
    [campaigns, markets, rows, today],
  )

  const priorityQueue = useMemo(
    () =>
      rows
        .filter((row) =>
          ["A", "B"].includes(row.latest_analysis?.priority || "") &&
          !["do_not_contact", "lost", "won"].includes(row.outreach_status),
        )
        .sort((a, b) => {
          const scoreA = a.latest_analysis?.overall_opportunity_score || 0
          const scoreB = b.latest_analysis?.overall_opportunity_score || 0
          return scoreB - scoreA
        })
        .slice(0, 8),
    [rows],
  )

  const recentMarkets = useMemo(
    () =>
      markets
        .filter((market) => !["completed", "failed"].includes(market.status))
        .slice(0, 4),
    [markets],
  )

  const weekly = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    const recentEvents = events.filter((event) => new Date(event.created_at) >= cutoff)
    return {
      researched: rows.filter((row) => row.last_researched_at && new Date(row.last_researched_at) >= cutoff).length,
      qualified: rows.filter((row) => ["A", "B"].includes(row.latest_analysis?.priority || "")).length,
      calls: recentEvents.filter((event) => ["call", "voicemail"].includes(event.channel)).length,
      replies: recentEvents.filter((event) => ["replied", "permission_to_send_demo", "interested"].includes(event.event_type)).length,
      demos: recentEvents.filter((event) => event.event_type === "demo_sent").length,
      discovery: rows.filter((row) => row.outreach_status === "discovery_call").length,
      proposals: rows.filter((row) => row.outreach_status === "proposal_sent").length,
      won: rows.filter((row) => row.outreach_status === "won").length,
    }
  }, [events, rows])

  const filteredRows = useMemo(() => {
    return rows.filter((row) => {
      const analysis = row.latest_analysis
      return (
        (!filters.playbook || row.industry_playbook === filters.playbook) &&
        (!filters.priority || analysis?.priority === filters.priority) &&
        (!filters.compliance || row.compliance_tier === filters.compliance) &&
        (!filters.status || row.outreach_status === filters.status) &&
        (!filters.mode || row.outreach_mode === filters.mode) &&
        (!filters.channel || analysis?.suggested_channel === filters.channel) &&
        (!filters.demo || row.relevant_demo === filters.demo || analysis?.recommended_demo === filters.demo) &&
        (!filters.valueBand || analysis?.potential_project_value_band === filters.valueBand) &&
        (!filters.city ||
          `${row.city || ""} ${row.state || ""}`.toLowerCase().includes(filters.city.toLowerCase()))
      )
    })
  }, [filters, rows])

  const activeFilters = useMemo(
    () =>
      Object.entries(filters)
        .filter(([, value]) => Boolean(value))
        .map(([key, value]) => ({ key, value })),
    [filters],
  )

  const saveImport = async () => {
    setSavingImport(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/signal/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospects: previewRows }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "CSV import failed.")
        return
      }

      setRows((current) => [
        ...data.prospects.map((prospect: SignalProspectRow) => ({
          ...prospect,
          latest_analysis: null,
          unread_alert: null,
        })),
        ...current,
      ])
      setCsvText("")
      setImportOpen(false)
      setMessage(
        `Imported ${data.prospects.length} prospect${data.prospects.length === 1 ? "" : "s"}.`,
      )
    } catch {
      setError("CSV import failed.")
    } finally {
      setSavingImport(false)
    }
  }

  const toggleSelected = (id: string) => {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length >= 5
          ? current
          : [...current, id],
    )
  }

  const createCallSession = async () => {
    setCreatingSession(true)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch("/api/signal/call-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospect_ids: selectedIds }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Call session could not be created.")
        return
      }
      window.location.href = `/dashboard/signal/call-session/${data.session.id}`
    } catch {
      setError("Call session could not be created.")
    } finally {
      setCreatingSession(false)
    }
  }

  const runQuickScore = async (prospectId: string) => {
    setQuickScoringId(prospectId)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospectId}/quick-score`, {
        method: "POST",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Quick score could not complete.")
        return
      }
      setMessage(
        data.ai_unavailable
          ? "Quick score complete. AI unavailable; rule-based score shown."
          : "Quick score complete.",
      )
      window.location.href = `/dashboard/signal/${prospectId}`
    } catch {
      setError("Quick score could not complete.")
    } finally {
      setQuickScoringId(null)
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Mountline Signal"
        title="Signal"
        subtitle="Build markets, review evidence, approve prospects, and prepare credible manual outreach."
        actions={
          <>
            <PrimaryAction href="/dashboard/signal/markets/new" icon={RadioTower}>
              Find Prospects
            </PrimaryAction>
            <SecondaryAction href="/dashboard/signal/focus" icon={CalendarCheck}>
              Start Focus Mode
            </SecondaryAction>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                  More
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/signal/research"><Search className="h-4 w-4" />Research a Business</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/signal/campaigns/new"><RadioTower className="h-4 w-4" />Build Campaign</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/signal/new"><Plus className="h-4 w-4" />Add Prospect</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/signal/import"><Upload className="h-4 w-4" />Import Existing Leads</Link>
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setImportOpen((value) => !value)}>
                  <Upload className="h-4 w-4" />Paste CSV
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/signal/playbooks"><BookOpen className="h-4 w-4" />Playbooks</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/signal/alerts"><Bell className="h-4 w-4" />Alerts</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/signal?status=do_not_contact"><AlertTriangle className="h-4 w-4" />Suppressed Prospects</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
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

      <SectionPanel
        title="Today"
        description="The queues that deserve attention before adding more prospects."
        action={<Link href="/dashboard/signal/focus" className="text-sm text-muted-foreground transition-colors hover:text-foreground">Open Focus Mode</Link>}
      >
        <MetricStrip
          items={[
            { href: "/dashboard/signal/focus", label: "Calls ready", value: todayStrip.calls, tone: todayStrip.calls ? "blue" : "default" },
            { href: "/dashboard/signal/focus", label: "Follow-ups due", value: todayStrip.followUps, tone: todayStrip.followUps ? "green" : "default" },
            { href: "/dashboard/signal", label: "Demos waiting", value: todayStrip.demoSends, tone: todayStrip.demoSends ? "amber" : "default" },
            { href: "/dashboard/signal", label: "Research review", value: todayStrip.researchQueue, tone: todayStrip.researchQueue ? "amber" : "default" },
            { href: "/dashboard/signal/alerts", label: "High-fit alerts", value: todayStrip.alerts, tone: todayStrip.alerts ? "blue" : "default" },
          ]}
        />
      </SectionPanel>

      <section className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionPanel
          title="Best Prospects"
          description="The strongest actionable prospects, capped to keep the queue readable."
          action={<BarChart3 className="h-4 w-4 text-muted-foreground" />}
        >
          <div className="space-y-3">
            {priorityQueue.length > 0 ? (
              priorityQueue.slice(0, 5).map((row) => (
                <Link
                  key={row.id}
                  href={`/dashboard/signal/${row.id}`}
                  className="grid gap-3 rounded-lg border border-border bg-muted/20 p-4 text-sm transition-colors hover:bg-muted/35 lg:grid-cols-[1fr_110px_140px_120px]"
                >
                  <span className="min-w-0">
                    <span className="block font-medium text-foreground">{row.business_name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {[row.city, row.state].filter(Boolean).join(", ") || "Location unknown"} · {getSignalPlaybook(row.industry_playbook).name}
                    </span>
                    <span className="mt-2 block line-clamp-2 text-sm text-muted-foreground">
                      {row.latest_analysis?.recommended_next_action || row.latest_analysis?.recommended_primary_offer || "Review next action"}
                    </span>
                  </span>
                  <span>
                    <StatusBadge tone={priorityTone(row.latest_analysis?.priority)}>
                      Priority {row.latest_analysis?.priority || "-"}
                    </StatusBadge>
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(row.latest_analysis?.recommended_lane || "review").replace(/_/g, " ")}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {row.latest_analysis?.confidence || "unknown"} confidence
                  </span>
                </Link>
              ))
            ) : (
              <EmptyState title="Nothing urgent is waiting" icon={RadioTower}>
                Review the research queue or build a market when the pipeline needs new prospects.
              </EmptyState>
            )}
          </div>
        </SectionPanel>

        <SectionPanel
          title="Recent Markets"
          description="Latest research runs with review status, progress, top opportunities, and usage."
          action={<Link href="/dashboard/signal/markets" className="text-sm text-muted-foreground transition-colors hover:text-foreground">View all markets</Link>}
        >
          <div className="space-y-3">
            {recentMarkets.length > 0 ? (
              recentMarkets.slice(0, 3).map((market) => {
                const scored = market.candidates.filter((candidate) => candidate.quick_score_state && candidate.quick_score_state !== "not_started").length
                const imported = market.candidates.filter((candidate) => candidate.imported_prospect_id).length
                const top = market.candidates.filter((candidate) => ["A", "B"].includes(candidate.preliminary_priority || "")).length
                const usage = market.actual_credit_usage && typeof market.actual_credit_usage === "object"
                  ? market.actual_credit_usage as Record<string, unknown>
                  : null
                const progress = market.candidates.length
                  ? Math.round(((scored + imported) / market.candidates.length) * 100)
                  : 0
                return (
                <Link
                  key={market.id}
                  href={`/dashboard/signal/markets/${market.id}`}
                  className="block rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/35"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-medium">{market.name}</p>
                      <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5" />
                        {[market.city, market.state].filter(Boolean).join(", ")}
                      </p>
                    </div>
                    <StatusBadge>{market.status.replace(/_/g, " ")}</StatusBadge>
                  </div>
                  <div className="mt-4 h-1.5 rounded-full bg-muted">
                    <div className="h-full rounded-full bg-blue-400" style={{ width: `${Math.min(progress, 100)}%` }} />
                  </div>
                  <div className="mt-3 grid grid-cols-4 gap-2 text-xs text-muted-foreground">
                    <MiniStat label="Discovered" value={market.candidates.length} />
                    <MiniStat label="Scored" value={scored} />
                    <MiniStat label="A/B" value={top} />
                    <MiniStat label="Usage" value={Number(usage?.firecrawl_credits || 0)} />
                  </div>
                  <p className="mt-3 line-clamp-2 text-xs text-muted-foreground">
                    {market.next_action || "Run or review this market."}
                  </p>
                </Link>
                )
              })
            ) : (
              <EmptyState
                title="No markets running"
                icon={RadioTower}
                action={<PrimaryAction href="/dashboard/signal/markets/new" icon={RadioTower}>Find Prospects</PrimaryAction>}
              >
                Build a market to discover and rank prospects with evidence.
              </EmptyState>
            )}
          </div>
        </SectionPanel>
      </section>

      <MetricStrip
        items={[
          { label: "Total prospects", value: stats.total },
          { label: "A leads", value: stats.aLeads, tone: stats.aLeads ? "green" : "default" },
          { label: "Ready", value: stats.ready, tone: stats.ready ? "blue" : "default" },
          { label: "Awaiting reply", value: stats.awaiting, tone: stats.awaiting ? "amber" : "default" },
          { label: "Discovery calls", value: stats.discovery },
        ]}
      />

      {importOpen && (
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-semibold">CSV Import</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Paste manually collected business research. Preview rows before saving.
              </p>
            </div>
            <button
              type="button"
              className="text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setImportOpen(false)}
            >
              Close
            </button>
          </div>
          <textarea
            value={csvText}
            onChange={(event) => setCsvText(event.target.value)}
            className="min-h-36 w-full resize-y rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="business name, industry, city, website, email, phone, notes, relevant demo, platform, status"
          />
          {previewRows.length > 0 && (
            <div className="mt-4 overflow-hidden rounded-lg border border-border">
              <div className="max-h-64 overflow-auto">
                <table className="w-full min-w-[760px] text-sm">
                  <thead className="bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                    <tr>
                      <th className="px-3 py-2 text-left">Business</th>
                      <th className="px-3 py-2 text-left">Industry</th>
                      <th className="px-3 py-2 text-left">City</th>
                      <th className="px-3 py-2 text-left">Website</th>
                      <th className="px-3 py-2 text-left">Email</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {previewRows.map((row, index) => (
                      <tr key={`${row.business_name}-${index}`}>
                        <td className="px-3 py-2">{row.business_name}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.industry}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.city || "-"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.website_url || "-"}</td>
                        <td className="px-3 py-2 text-muted-foreground">{row.public_email || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          <div className="mt-4 flex items-center justify-end gap-3">
            <span className="text-sm text-muted-foreground">{previewRows.length} rows ready</span>
            <button
              type="button"
              disabled={savingImport || previewRows.length === 0}
              onClick={saveImport}
              className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingImport ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Save Import
            </button>
          </div>
        </div>
      )}

      {!showAllProspects ? (
        <SectionPanel
          title="All Prospects"
          description={`${rows.length} prospects are stored in Signal. Keep the main screen focused and open the full table only when needed.`}
          action={
            <button
              type="button"
              onClick={() => setShowAllProspects(true)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="h-4 w-4" />
              View All Prospects
            </button>
          }
        >
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <span>{stats.total} total prospects</span>
            <span>{stats.ready} ready to contact</span>
            <span>{todayStrip.researchQueue} research items need review</span>
          </div>
        </SectionPanel>
      ) : (
        <>
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="font-semibold">All Prospects</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {filteredRows.length} of {rows.length} prospects shown.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setFiltersOpen((value) => !value)}
              className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilters.length > 0 && (
                <span className="rounded-full bg-blue-500/15 px-1.5 py-0.5 text-[10px] text-blue-300">
                  {activeFilters.length}
                </span>
              )}
            </button>
            {activeFilters.length > 0 && (
              <button
                type="button"
                onClick={() => setFilters(emptyFilters)}
                className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            )}
          </div>
        </div>
        {activeFilters.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {activeFilters.map((filter) => (
              <button
                key={filter.key}
                type="button"
                onClick={() => setFilters({ ...filters, [filter.key]: "" })}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground"
              >
                {filter.key}: {filter.value}
                <X className="h-3 w-3" />
              </button>
            ))}
          </div>
        )}
        {filtersOpen && (
          <div className="mt-4 grid gap-3 rounded-lg border border-border bg-muted/20 p-4 md:grid-cols-2 xl:grid-cols-5">
            <FilterSelect label="Playbook" value={filters.playbook} onChange={(value) => setFilters({ ...filters, playbook: value })}>
              <option value="">All playbooks</option>
              {Object.values(SIGNAL_PLAYBOOKS).map((playbook) => (
                <option key={playbook.key} value={playbook.key}>{playbook.name}</option>
              ))}
            </FilterSelect>
            <FilterSelect label="Priority" value={filters.priority} onChange={(value) => setFilters({ ...filters, priority: value })}>
              <option value="">Any priority</option>
              {["A", "B", "C", "skip"].map((priority) => <option key={priority} value={priority}>{priority}</option>)}
            </FilterSelect>
            <FilterSelect label="Compliance" value={filters.compliance} onChange={(value) => setFilters({ ...filters, compliance: value })}>
              <option value="">Any tier</option>
              <option value="standard">Standard</option>
              <option value="sensitive">Sensitive</option>
              <option value="compliance_gated">Compliance gated</option>
            </FilterSelect>
            <FilterSelect label="Status" value={filters.status} onChange={(value) => setFilters({ ...filters, status: value })}>
              <option value="">Any status</option>
              {Object.entries(statusLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </FilterSelect>
            <FilterSelect label="Outreach mode" value={filters.mode} onChange={(value) => setFilters({ ...filters, mode: value })}>
              <option value="">Any mode</option>
              {Object.entries(modeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </FilterSelect>
            <FilterSelect label="Channel" value={filters.channel} onChange={(value) => setFilters({ ...filters, channel: value })}>
              <option value="">Any channel</option>
              {Object.entries(channelLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </FilterSelect>
            <FilterSelect label="Demo" value={filters.demo} onChange={(value) => setFilters({ ...filters, demo: value })}>
              <option value="">Any demo</option>
              <option value="auto-detailing">Auto detailing</option>
              <option value="barber-shop">Barber shop</option>
              <option value="none">None</option>
            </FilterSelect>
            <FilterSelect label="Value band" value={filters.valueBand} onChange={(value) => setFilters({ ...filters, valueBand: value })}>
              <option value="">Any band</option>
              <option value="$500-$1,250">$500-$1,250</option>
              <option value="$1,250-$3,500">$1,250-$3,500</option>
              <option value="$3,500-$10,000+">$3,500-$10,000+</option>
              <option value="unknown">Unknown</option>
            </FilterSelect>
            <label className="block space-y-1 xl:col-span-2">
              <span className="text-xs font-medium text-muted-foreground">City</span>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={filters.city}
                  onChange={(event) => setFilters({ ...filters, city: event.target.value })}
                  className="h-9 w-full rounded-md border border-border bg-background pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                  placeholder="Filter city or state"
                />
              </div>
            </label>
          </div>
        )}
      </div>

      {selectedIds.length > 0 && (
        <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            {selectedIds.length} prospect{selectedIds.length === 1 ? "" : "s"} selected for manual call prep.
          </p>
          <button
            type="button"
            disabled={creatingSession}
            onClick={createCallSession}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            {creatingSession ? <Loader2 className="h-4 w-4 animate-spin" /> : <PhoneCall className="h-4 w-4" />}
            Prepare Call Session
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-border bg-card">
        <CompactTable minWidth="980px">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                {[
                  "",
                  "Business",
                  "Category",
                  "City",
                  "Priority",
                  "Lane",
                  "Contact Readiness",
                  "Status",
                  "Follow-Up",
                  "Open",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left font-medium">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => (
                  <SignalRow
                    key={row.id}
                    row={row}
                    selected={selectedIds.includes(row.id)}
                    onSelect={() => toggleSelected(row.id)}
                    onQuickScore={() => runQuickScore(row.id)}
                    quickScoring={quickScoringId === row.id}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <RadioTower className="mx-auto mb-3 h-8 w-8 text-muted-foreground opacity-50" />
                    <p className="font-medium">No Signal prospects match the filters</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Research a business, add a prospect, or clear filters to see the pipeline.
                    </p>
                    <Link
                      href="/dashboard/signal/research"
                      className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-3 text-sm font-medium text-background"
                    >
                      <Search className="h-4 w-4" />
                      Research a Business
                    </Link>
                  </td>
                </tr>
              )}
            </tbody>
          </CompactTable>
      </div>
        </>
      )}

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="mb-3">
          <h2 className="font-semibold">Weekly Scoreboard</h2>
          <p className="mt-1 text-sm text-muted-foreground">Based on records and outreach events stored in Signal.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-8">
          <Stat label="Researched" value={weekly.researched} />
          <Stat label="Qualified" value={weekly.qualified} />
          <Stat label="Calls made" value={weekly.calls} />
          <Stat label="Replies" value={weekly.replies} />
          <Stat label="Demos sent" value={weekly.demos} />
          <Stat label="Discovery calls" value={weekly.discovery} />
          <Stat label="Proposals" value={weekly.proposals} />
          <Stat label="Won" value={weekly.won} />
        </div>
      </section>
    </div>
  )
}

function SignalRow({
  onSelect,
  onQuickScore,
  quickScoring,
  row,
  selected,
}: {
  onSelect: () => void
  onQuickScore: () => void
  quickScoring: boolean
  row: SignalProspectRow
  selected: boolean
}) {
  const analysis = row.latest_analysis
  const playbook = getSignalPlaybook(row.industry_playbook)

  return (
    <tr className="align-top transition-colors hover:bg-muted/30">
      <td className="px-4 py-4">
        <input
          type="checkbox"
          checked={selected}
          onChange={onSelect}
          disabled={row.outreach_status === "do_not_contact"}
          className="h-4 w-4 rounded border-border bg-muted"
          aria-label={`Select ${row.business_name} for call session`}
        />
      </td>
      <td className="px-4 py-4">
        <div className="max-w-[240px]">
          <div className="flex items-center gap-2">
            <p className="font-medium text-foreground">{row.business_name}</p>
            {row.unread_alert && <AlertTriangle className="h-4 w-4 text-green-400" />}
            {row.compliance_tier === "compliance_gated" && <AlertTriangle className="h-4 w-4 text-yellow-400" />}
          </div>
          {row.website_url && (
            <a
              href={row.website_url.startsWith("http") ? row.website_url : `https://${row.website_url}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1 inline-flex max-w-[220px] items-center gap-1 truncate text-xs text-muted-foreground hover:text-foreground"
            >
              {row.website_url}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          )}
        </div>
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        <div>{row.industry}</div>
        <div className="text-xs">{playbook.name}</div>
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        {[row.city, row.state].filter(Boolean).join(", ") || "-"}
      </td>
      <td className="px-4 py-4">
        <StatusBadge tone={priorityTone(analysis?.priority)}>{analysis?.priority || "-"}</StatusBadge>
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        {analysis?.recommended_lane ? analysis.recommended_lane.replace(/_/g, " ") : "-"}
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        {row.contact_readiness.replace(/_/g, " ")}
      </td>
      <td className="px-4 py-4">
        <StatusBadge>{statusLabels[row.outreach_status] || row.outreach_status}</StatusBadge>
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        {formatDate(row.follow_up_date)}
      </td>
      <td className="px-4 py-4">
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={quickScoring || row.outreach_status === "do_not_contact" || !row.website_url}
            onClick={onQuickScore}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
          >
            {quickScoring ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
            Score
          </button>
          <Link
            href={`/dashboard/signal/${row.id}`}
            className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            Open
            <ExternalLink className="h-3.5 w-3.5" />
          </Link>
        </div>
      </td>
    </tr>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-2xl font-semibold">{value}</p>
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <span>
      <span className="block font-mono text-sm text-foreground">{value}</span>
      <span className="block">{label}</span>
    </span>
  )
}

function FilterSelect({
  children,
  label,
  onChange,
  value,
}: {
  children: React.ReactNode
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-md border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
      >
        {children}
      </select>
    </label>
  )
}
