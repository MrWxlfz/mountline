"use client"

import { useMemo, useState } from "react"
import {
  CheckCircle2,
  Loader2,
  MailPlus,
  Plus,
  Radar,
  Search,
  Sparkles,
  ThumbsDown,
} from "lucide-react"
import type { ScoutOutreachStatus, ScoutProspect } from "@/lib/supabase/types"
import { cn } from "@/lib/utils"

type ProspectForm = {
  business_name: string
  industry: string
  city: string
  state: string
  website: string
  phone: string
  email: string
  google_rating: string
  google_review_count: string
  notes: string
}

const emptyForm: ProspectForm = {
  business_name: "",
  industry: "",
  city: "",
  state: "",
  website: "",
  phone: "",
  email: "",
  google_rating: "",
  google_review_count: "",
  notes: "",
}

const statusLabels: Record<ScoutOutreachStatus, string> = {
  not_contacted: "Not contacted",
  reviewed: "Reviewed",
  contacted: "Contacted",
  not_fit: "Not a fit",
  lead_created: "Lead created",
}

const statusStyles: Record<ScoutOutreachStatus, string> = {
  not_contacted: "bg-muted text-muted-foreground border-border",
  reviewed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  contacted: "bg-green-500/10 text-green-400 border-green-500/20",
  not_fit: "bg-red-500/10 text-red-400 border-red-500/20",
  lead_created: "bg-purple-500/10 text-purple-400 border-purple-500/20",
}

function normalizeArray(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function formatDate(value: string | null) {
  if (!value) return "Not checked"
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function scoreClass(score: number | null) {
  if (score === null) return "text-muted-foreground"
  if (score >= 85) return "text-green-400"
  if (score >= 65) return "text-blue-400"
  if (score >= 40) return "text-yellow-400"
  return "text-red-400"
}

export function ScoutDashboard({
  initialProspects,
}: {
  initialProspects: ScoutProspect[]
}) {
  const [prospects, setProspects] = useState(initialProspects)
  const [form, setForm] = useState(emptyForm)
  const [search, setSearch] = useState("")
  const [saving, setSaving] = useState(false)
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const filteredProspects = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return prospects

    return prospects.filter((prospect) =>
      [
        prospect.business_name,
        prospect.industry,
        prospect.city,
        prospect.state,
        prospect.website,
        prospect.outreach_status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    )
  }, [prospects, search])

  const updateProspect = (prospect: ScoutProspect) => {
    setProspects((current) =>
      current.map((item) => (item.id === prospect.id ? prospect : item)),
    )
  }

  const handleCreate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/scout/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          google_rating: form.google_rating || null,
          google_review_count: form.google_review_count || null,
        }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Prospect could not be saved.")
        return
      }

      setProspects((current) => [data.prospect, ...current])
      setForm(emptyForm)
      setMessage("Prospect added. Score it when ready.")
    } catch {
      setError("Prospect could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  const handleScore = async (prospectId: string) => {
    setWorkingId(prospectId)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`/api/scout/prospects/${prospectId}/score`, {
        method: "POST",
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Prospect could not be scored.")
        return
      }

      updateProspect(data.prospect)
      setMessage(
        data.alert
          ? "Prospect scored. A team alert was recorded for this opportunity."
          : "Prospect scored.",
      )
    } catch {
      setError("Prospect could not be scored.")
    } finally {
      setWorkingId(null)
    }
  }

  const handleStatus = async (prospectId: string, outreachStatus: ScoutOutreachStatus) => {
    setWorkingId(prospectId)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`/api/scout/prospects/${prospectId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ outreach_status: outreachStatus }),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Status could not be updated.")
        return
      }

      updateProspect(data.prospect)
      setMessage("Prospect status updated.")
    } catch {
      setError("Status could not be updated.")
    } finally {
      setWorkingId(null)
    }
  }

  const handleConvert = async (prospectId: string) => {
    setWorkingId(prospectId)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(`/api/scout/prospects/${prospectId}/convert`, {
        method: "POST",
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Lead could not be created.")
        return
      }

      updateProspect(data.prospect)
      setMessage("Lead created from Scout prospect.")
    } catch {
      setError("Lead could not be created.")
    } finally {
      setWorkingId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Mountline Scout
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Scout Prospects</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Score public business opportunities without automatic prospect outreach.
            High-fit finds only alert the Mountline team.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-card px-4 py-3 text-sm text-muted-foreground">
          <span className="font-mono text-foreground">{prospects.length}</span> tracked prospects
        </div>
      </div>

      {(error || message) && (
        <div
          className={cn(
            "rounded-lg border px-3 py-2 text-sm",
            error
              ? "border-red-500/25 bg-red-500/10 text-red-300"
              : "border-green-500/25 bg-green-500/10 text-green-300",
          )}
        >
          {error || message}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <form
          onSubmit={handleCreate}
          className="h-fit rounded-xl border border-border bg-card p-5"
        >
          <div className="mb-5 flex items-center gap-2">
            <Plus className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-semibold">Add Prospect</h2>
          </div>

          <div className="space-y-4">
            <Field
              label="Business name"
              required
              value={form.business_name}
              onChange={(value) => setForm({ ...form, business_name: value })}
              placeholder="Brightline Dental"
            />
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <Field
                label="Industry"
                value={form.industry}
                onChange={(value) => setForm({ ...form, industry: value })}
                placeholder="Dental"
              />
              <Field
                label="City"
                value={form.city}
                onChange={(value) => setForm({ ...form, city: value })}
                placeholder="Austin"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <Field
                label="State"
                value={form.state}
                onChange={(value) => setForm({ ...form, state: value })}
                placeholder="TX"
              />
              <Field
                label="Website"
                inputMode="url"
                value={form.website}
                onChange={(value) => setForm({ ...form, website: value })}
                placeholder="https://example.com"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <Field
                label="Phone"
                type="tel"
                value={form.phone}
                onChange={(value) => setForm({ ...form, phone: value })}
                placeholder="(555) 123-4567"
              />
              <Field
                label="Email"
                type="email"
                value={form.email}
                onChange={(value) => setForm({ ...form, email: value })}
                placeholder="hello@example.com"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
              <Field
                label="Google rating"
                type="number"
                min="0"
                max="5"
                step="0.1"
                value={form.google_rating}
                onChange={(value) => setForm({ ...form, google_rating: value })}
                placeholder="4.7"
              />
              <Field
                label="Review count"
                type="number"
                min="0"
                step="1"
                value={form.google_review_count}
                onChange={(value) =>
                  setForm({ ...form, google_review_count: value })
                }
                placeholder="86"
              />
            </div>
            <label className="block space-y-2">
              <span className="text-sm font-medium">Notes</span>
              <textarea
                value={form.notes}
                onChange={(event) => setForm({ ...form, notes: event.target.value })}
                rows={4}
                className="w-full resize-none rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                placeholder="Public business context, visible website issue, or local opportunity."
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            {saving ? "Saving..." : "Add prospect"}
          </button>
        </form>

        <section className="min-w-0 space-y-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                placeholder="Search prospects..."
              />
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px]">
                <thead>
                  <tr className="border-b border-border bg-muted/50">
                    {[
                      "Business",
                      "Industry",
                      "City",
                      "Website",
                      "Opportunity",
                      "Website",
                      "Fit",
                      "Status",
                      "Last checked",
                      "Actions",
                    ].map((heading) => (
                      <th
                        key={heading}
                        className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground"
                      >
                        {heading}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredProspects.length > 0 ? (
                    filteredProspects.map((prospect) => (
                      <ProspectRow
                        key={prospect.id}
                        prospect={prospect}
                        working={workingId === prospect.id}
                        onScore={() => handleScore(prospect.id)}
                        onStatus={(status) => handleStatus(prospect.id, status)}
                        onConvert={() => handleConvert(prospect.id)}
                      />
                    ))
                  ) : (
                    <tr>
                      <td colSpan={10} className="px-4 py-12 text-center">
                        <Radar className="mx-auto mb-3 h-8 w-8 text-muted-foreground opacity-50" />
                        <p className="font-medium">No Scout prospects yet</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          Add a public business prospect to start scoring.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

function ProspectRow({
  prospect,
  working,
  onScore,
  onStatus,
  onConvert,
}: {
  prospect: ScoutProspect
  working: boolean
  onScore: () => void
  onStatus: (status: ScoutOutreachStatus) => void
  onConvert: () => void
}) {
  const reasons = normalizeArray(prospect.reasons)
  const redFlags = normalizeArray(prospect.red_flags)

  return (
    <tr className="align-top transition-colors hover:bg-muted/30">
      <td className="px-4 py-4">
        <div className="max-w-[230px]">
          <p className="font-medium text-foreground">{prospect.business_name}</p>
          {prospect.ai_summary && (
            <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
              {prospect.ai_summary}
            </p>
          )}
          {reasons.length > 0 && (
            <p className="mt-2 line-clamp-2 text-xs text-muted-foreground">
              {reasons[0]}
            </p>
          )}
          {redFlags.length > 0 && (
            <p className="mt-1 text-xs text-red-300">{redFlags[0]}</p>
          )}
        </div>
      </td>
      <td className="px-4 py-4 text-sm text-muted-foreground">
        {prospect.industry || "Not set"}
      </td>
      <td className="px-4 py-4 text-sm text-muted-foreground">
        {[prospect.city, prospect.state].filter(Boolean).join(", ") || "Not set"}
      </td>
      <td className="px-4 py-4 text-sm">
        {prospect.website ? (
          <a
            href={prospect.website.startsWith("http") ? prospect.website : `https://${prospect.website}`}
            target="_blank"
            rel="noreferrer"
            className="inline-block max-w-[180px] truncate text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
          >
            {prospect.website}
          </a>
        ) : (
          <span className="text-muted-foreground">No website</span>
        )}
      </td>
      <td className={cn("px-4 py-4 font-mono text-lg font-semibold", scoreClass(prospect.opportunity_score))}>
        {prospect.opportunity_score ?? "-"}
      </td>
      <td className={cn("px-4 py-4 font-mono text-lg font-semibold", scoreClass(prospect.website_score))}>
        {prospect.website_score ?? "-"}
      </td>
      <td className="px-4 py-4 text-sm capitalize text-muted-foreground">
        {prospect.estimated_project_fit || "Unscored"}
      </td>
      <td className="px-4 py-4">
        <span
          className={cn(
            "inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium",
            statusStyles[prospect.outreach_status],
          )}
        >
          {statusLabels[prospect.outreach_status]}
        </span>
      </td>
      <td className="px-4 py-4 text-sm text-muted-foreground">
        {formatDate(prospect.last_checked_at)}
      </td>
      <td className="px-4 py-4">
        <div className="flex flex-wrap gap-2">
          <ActionButton onClick={onScore} disabled={working} label="Score">
            {working ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          </ActionButton>
          <ActionButton onClick={() => onStatus("reviewed")} disabled={working} label="Reviewed">
            <CheckCircle2 className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton onClick={() => onStatus("contacted")} disabled={working} label="Contacted">
            <MailPlus className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton onClick={() => onStatus("not_fit")} disabled={working} label="Not fit">
            <ThumbsDown className="h-3.5 w-3.5" />
          </ActionButton>
          <ActionButton onClick={onConvert} disabled={working} label="Create lead">
            <Plus className="h-3.5 w-3.5" />
          </ActionButton>
        </div>
      </td>
    </tr>
  )
}

function ActionButton({
  children,
  disabled,
  label,
  onClick,
}: {
  children: React.ReactNode
  disabled: boolean
  label: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="inline-flex min-h-8 items-center gap-1.5 rounded-lg border border-border px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
    >
      {children}
      {label}
    </button>
  )
}

function Field({
  label,
  onChange,
  required,
  type = "text",
  value,
  ...props
}: {
  label: string
  onChange: (value: string) => void
  required?: boolean
  type?: string
  value: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type">) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        {...props}
        required={required}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
      />
    </label>
  )
}
