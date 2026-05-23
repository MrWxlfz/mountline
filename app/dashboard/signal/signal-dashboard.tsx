"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  Bell,
  BookOpen,
  ExternalLink,
  Loader2,
  Plus,
  RadioTower,
  Search,
  Upload,
} from "lucide-react"
import { getSignalPlaybook, SIGNAL_PLAYBOOKS } from "@/lib/signal/playbooks"
import type { SignalProspectRow } from "./page"

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
  local_student: "Local student",
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

function scoreClass(score: number | null | undefined) {
  if (typeof score !== "number") return "text-muted-foreground"
  if (score >= 85) return "text-green-400"
  if (score >= 70) return "text-blue-400"
  if (score >= 50) return "text-yellow-400"
  return "text-red-400"
}

function priorityClass(priority: string | null | undefined) {
  if (priority === "A") return "border-green-500/30 bg-green-500/10 text-green-300"
  if (priority === "B") return "border-blue-500/30 bg-blue-500/10 text-blue-300"
  if (priority === "C") return "border-yellow-500/30 bg-yellow-500/10 text-yellow-300"
  if (priority === "skip") return "border-red-500/30 bg-red-500/10 text-red-300"
  return "border-border bg-muted text-muted-foreground"
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
  initialRows,
}: {
  initialRows: SignalProspectRow[]
}) {
  const [rows, setRows] = useState(initialRows)
  const [filters, setFilters] = useState(emptyFilters)
  const [importOpen, setImportOpen] = useState(false)
  const [csvText, setCsvText] = useState("")
  const [savingImport, setSavingImport] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Mountline Signal
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Signal</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Find high-fit businesses, identify real opportunities, and prepare credible outreach.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link className="signal-action" href="/dashboard/signal/new">
            <Plus className="h-4 w-4" />
            Add Prospect
          </Link>
          <button className="signal-action" type="button" onClick={() => setImportOpen((value) => !value)}>
            <Upload className="h-4 w-4" />
            Import CSV
          </button>
          <Link className="signal-action" href="/dashboard/signal/playbooks">
            <BookOpen className="h-4 w-4" />
            Playbooks
          </Link>
          <Link className="signal-action" href="/dashboard/signal/alerts">
            <Bell className="h-4 w-4" />
            Alerts
          </Link>
        </div>
      </div>

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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <Stat label="Total Prospects" value={stats.total} />
        <Stat label="A Leads" value={stats.aLeads} />
        <Stat label="Ready to Contact" value={stats.ready} />
        <Stat label="Awaiting Reply" value={stats.awaiting} />
        <Stat label="Discovery Calls" value={stats.discovery} />
        <Stat label="Won" value={stats.won} />
      </div>

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

      <div className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
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
                className="h-9 w-full rounded-md border border-border bg-muted pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                placeholder="Filter city or state"
              />
            </div>
          </label>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1320px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/50 text-xs uppercase tracking-wider text-muted-foreground">
                {[
                  "Business",
                  "Industry",
                  "City",
                  "Primary Opportunity",
                  "Score",
                  "Priority",
                  "Value Band",
                  "Suggested Channel",
                  "Outreach Mode",
                  "Status",
                  "Follow-up Date",
                  "Open",
                ].map((heading) => (
                  <th key={heading} className="px-4 py-3 text-left font-medium">{heading}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredRows.length > 0 ? (
                filteredRows.map((row) => <SignalRow key={row.id} row={row} />)
              ) : (
                <tr>
                  <td colSpan={12} className="px-4 py-12 text-center">
                    <RadioTower className="mx-auto mb-3 h-8 w-8 text-muted-foreground opacity-50" />
                    <p className="font-medium">No Signal prospects match the filters</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Add a prospect or clear filters to see the pipeline.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <style jsx>{`
        .signal-action {
          display: inline-flex;
          height: 2.25rem;
          align-items: center;
          gap: 0.5rem;
          border-radius: 0.5rem;
          border: 1px solid var(--border);
          padding: 0 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
          color: var(--foreground);
          transition: background-color 150ms ease, color 150ms ease;
        }
        .signal-action:hover {
          background: var(--muted);
        }
      `}</style>
    </div>
  )
}

function SignalRow({ row }: { row: SignalProspectRow }) {
  const analysis = row.latest_analysis
  const playbook = getSignalPlaybook(row.industry_playbook)

  return (
    <tr className="align-top transition-colors hover:bg-muted/30">
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
        <p className="max-w-[260px] line-clamp-2 text-muted-foreground">
          {analysis?.recommended_primary_offer || "Run analysis"}
        </p>
      </td>
      <td className={`px-4 py-4 font-mono text-lg font-semibold ${scoreClass(analysis?.overall_opportunity_score)}`}>
        {analysis?.overall_opportunity_score ?? "-"}
      </td>
      <td className="px-4 py-4">
        <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${priorityClass(analysis?.priority)}`}>
          {analysis?.priority || "-"}
        </span>
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        {analysis?.potential_project_value_band || "-"}
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        {analysis?.suggested_channel ? channelLabels[analysis.suggested_channel] : "-"}
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        {modeLabels[row.outreach_mode] || row.outreach_mode}
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {statusLabels[row.outreach_status] || row.outreach_status}
        </span>
      </td>
      <td className="px-4 py-4 text-muted-foreground">
        {formatDate(row.follow_up_date)}
      </td>
      <td className="px-4 py-4">
        <Link
          href={`/dashboard/signal/${row.id}`}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-3 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          Open
          <ExternalLink className="h-3.5 w-3.5" />
        </Link>
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
