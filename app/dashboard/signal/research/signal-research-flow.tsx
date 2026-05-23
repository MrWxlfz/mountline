"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RadioTower,
  Search,
  Sparkles,
} from "lucide-react"

type Candidate = {
  title: string
  url: string
  source_type: string
  evidence: string
  confidence: string
}

type Duplicate = {
  prospect_id: string
  business_name: string
  website_url?: string | null
  outreach_status?: string | null
  reasons: string[]
}

type Result = {
  prospect: { id: string; business_name: string }
  analysis: {
    overall_opportunity_score: number | null
    priority: string | null
    recommended_primary_offer: string | null
    potential_project_value_band: string | null
    suggested_channel: string | null
    suggested_conversation_style?: string | null
  }
  merged: boolean
  ai_unavailable: boolean
}

const progressSteps = [
  "Searching public web",
  "Confirming official source",
  "Reading public pages",
  "Scoring opportunity",
  "Preparing strategy",
]

export function SignalResearchFlow() {
  const [businessName, setBusinessName] = useState("")
  const [location, setLocation] = useState("")
  const [industryHint, setIndustryHint] = useState("")
  const [knownContext, setKnownContext] = useState("")
  const [initialNote, setInitialNote] = useState("")
  const [researchRunId, setResearchRunId] = useState<string | null>(null)
  const [candidates, setCandidates] = useState<Candidate[]>([])
  const [duplicates, setDuplicates] = useState<Duplicate[]>([])
  const [mergeProspectId, setMergeProspectId] = useState("")
  const [selectedUrl, setSelectedUrl] = useState("")
  const [result, setResult] = useState<Result | null>(null)
  const [working, setWorking] = useState<"resolve" | "confirm" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  const resolve = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setWorking("resolve")
    setError(null)
    setMessage(null)
    setResult(null)
    setCandidates([])
    setDuplicates([])
    setSelectedUrl("")

    try {
      const response = await fetch("/api/signal/research/resolve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          business_name: businessName,
          location,
          industry_hint: industryHint || null,
          known_context: knownContext || null,
          initial_note: initialNote || null,
        }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || "Research could not complete.")
        if (data.candidates) setCandidates(data.candidates)
        if (data.duplicates) setDuplicates(data.duplicates)
        if (data.research_run?.id) setResearchRunId(data.research_run.id)
        return
      }

      setResearchRunId(data.research_run.id)
      setCandidates(data.candidates || [])
      setDuplicates(data.duplicates || [])
      setMessage("Choose the official public website before Signal creates or merges a prospect.")
    } catch {
      setError("Research could not complete.")
    } finally {
      setWorking(null)
    }
  }

  const confirm = async (candidate: Candidate) => {
    if (!researchRunId) return
    setWorking("confirm")
    setError(null)
    setMessage(null)
    setSelectedUrl(candidate.url)

    try {
      const response = await fetch("/api/signal/research/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          research_run_id: researchRunId,
          candidate_url: candidate.url,
          candidate_title: candidate.title,
          merge_prospect_id: mergeProspectId || null,
        }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || "Official site could not be confirmed.")
        if (data.duplicates) setDuplicates(data.duplicates)
        return
      }

      setResult(data)
      setMessage(
        data.ai_unavailable
          ? "Research complete. AI unavailable; rule-based score created."
          : "Research complete.",
      )
    } catch {
      setError("Official site could not be confirmed.")
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/signal" className="rounded-lg p-2 transition-colors hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Mountline Signal
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Research Business</h1>
          <p className="text-sm text-muted-foreground">
            Type a business and location, confirm the official source, then create the game plan.
          </p>
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

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="grid gap-3 md:grid-cols-5">
          {progressSteps.map((step, index) => (
            <div key={step} className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="font-mono text-xs text-muted-foreground">0{index + 1}</p>
              <p className="mt-1 text-sm font-medium">{step}</p>
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={resolve} className="rounded-xl border border-border bg-card p-6">
        <div className="grid gap-4 lg:grid-cols-2">
          <Field label="Business name" required value={businessName} onChange={setBusinessName} placeholder="Grumpy's Auto Detailing" />
          <Field label="City/state or location" required value={location} onChange={setLocation} placeholder="Keller, TX" />
          <Field label="Industry hint" value={industryHint} onChange={setIndustryHint} placeholder="Auto detailing" />
          <Field label="Known connection/context" value={knownContext} onChange={setKnownContext} placeholder="Keller local, already emailed, active local business" />
        </div>
        <label className="mt-4 block space-y-2">
          <span className="text-sm font-medium">Initial note</span>
          <textarea
            value={initialNote}
            onChange={(event) => setInitialNote(event.target.value)}
            rows={4}
            className="w-full resize-none rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </label>
        <div className="mt-5 flex justify-end">
          <button
            type="submit"
            disabled={working === "resolve" || !businessName || !location}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {working === "resolve" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Research Business
          </button>
        </div>
      </form>

      {(duplicates.length > 0 || candidates.length > 0) && (
        <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">Existing Signal Matches</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Merge when the research appears to belong to an existing prospect.
            </p>
            <div className="mt-4 space-y-2">
              <label className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-3 text-sm">
                <input
                  type="radio"
                  checked={!mergeProspectId}
                  onChange={() => setMergeProspectId("")}
                />
                Create a new prospect
              </label>
              {duplicates.map((duplicate) => (
                <label key={duplicate.prospect_id} className="block rounded-lg border border-border bg-muted/30 p-3 text-sm">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      checked={mergeProspectId === duplicate.prospect_id}
                      onChange={() => setMergeProspectId(duplicate.prospect_id)}
                    />
                    <span className="font-medium">{duplicate.business_name}</span>
                  </span>
                  <span className="mt-1 block text-xs text-muted-foreground">
                    {duplicate.reasons.join(", ") || "possible duplicate"}
                  </span>
                </label>
              ))}
              {duplicates.length === 0 && (
                <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
                  No likely duplicate found.
                </p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <h2 className="font-semibold">Candidate Official Sources</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Confirm only the business official website. Directories and social pages stay unscanned.
            </p>
            <div className="mt-4 space-y-3">
              {candidates.map((candidate) => (
                <div key={candidate.url} className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-medium">{candidate.title}</p>
                        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                          {candidate.source_type.replace(/_/g, " ")}
                        </span>
                        <span className="rounded-full border border-border px-2 py-0.5 text-xs text-muted-foreground">
                          {candidate.confidence}
                        </span>
                      </div>
                      <a
                        href={candidate.url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-1 inline-flex max-w-full items-center gap-1 truncate text-xs text-muted-foreground hover:text-foreground"
                      >
                        {candidate.url}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                      <p className="mt-2 text-sm text-muted-foreground">{candidate.evidence}</p>
                    </div>
                    <button
                      type="button"
                      disabled={working === "confirm" && selectedUrl === candidate.url}
                      onClick={() => confirm(candidate)}
                      className="inline-flex h-9 shrink-0 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    >
                      {working === "confirm" && selectedUrl === candidate.url ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-4 w-4" />
                      )}
                      Confirm
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {result && (
        <div className="rounded-xl border border-green-500/25 bg-green-500/10 p-5 text-green-100">
          <div className="flex items-start gap-3">
            <RadioTower className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-semibold">
                {result.merged ? "Research merged" : "Prospect created"}: {result.prospect.business_name}
              </p>
              <div className="mt-3 grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-4">
                <Meta label="Score" value={String(result.analysis.overall_opportunity_score ?? "-")} />
                <Meta label="Priority" value={result.analysis.priority || "-"} />
                <Meta label="Best offer" value={result.analysis.recommended_primary_offer || "-"} />
                <Meta label="Value band" value={result.analysis.potential_project_value_band || "-"} />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/signal/${result.prospect.id}`}
                  className="inline-flex h-9 items-center gap-2 rounded-lg bg-foreground px-3 text-sm font-medium text-background"
                >
                  <Sparkles className="h-4 w-4" />
                  Open Strategy
                </Link>
                <Link
                  href={`/dashboard/signal/${result.prospect.id}`}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-green-500/30 px-3 text-sm font-medium text-green-100 hover:bg-green-500/10"
                >
                  Prepare Scripts
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  onChange,
  required,
  value,
  ...props
}: {
  label: string
  onChange: (value: string) => void
  required?: boolean
  value: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value">) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">
        {label}
        {required ? " *" : ""}
      </span>
      <input
        {...props}
        required={required}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
      />
    </label>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-green-100/70">{label}</p>
      <p className="mt-1 text-sm text-green-50">{value}</p>
    </div>
  )
}
