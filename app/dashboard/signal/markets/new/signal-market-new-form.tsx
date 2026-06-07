"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, RadioTower } from "lucide-react"
import { PrimaryAction, SectionPanel, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { SIGNAL_PLAYBOOKS } from "@/lib/signal/playbooks"

const defaultIndustries = ["auto_detailing"]

const depthLabels: Record<string, string> = {
  quick: "Quick",
  balanced: "Balanced",
  deep: "Deep",
}

function estimateUsage({
  depth,
  industries,
  maxCandidates,
}: {
  depth: string
  industries: string[]
  maxCandidates: string
}) {
  const candidateLimit = Math.max(1, Math.min(50, Number(maxCandidates) || 20))
  const pagesPerCandidate = depth === "quick" ? 1 : depth === "deep" ? 3 : 3
  return {
    tavilySearches: Math.max(1, industries.length * 2),
    firecrawlPages: candidateLimit * pagesPerCandidate,
    screenshots: Math.min(8, Math.ceil(candidateLimit * 0.35)),
    aiAnalyses: candidateLimit,
    estimatedBudget: candidateLimit * pagesPerCandidate + Math.max(1, industries.length * 2),
  }
}

export function SignalMarketNewForm() {
  const router = useRouter()
  const [name, setName] = useState("Keller Detailers Pilot")
  const [city, setCity] = useState("Keller")
  const [state, setState] = useState("TX")
  const [radius, setRadius] = useState("")
  const [maxCandidates, setMaxCandidates] = useState("15")
  const [depth, setDepth] = useState("balanced")
  const [notes, setNotes] = useState("")
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(defaultIndustries)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const usage = useMemo(
    () => estimateUsage({ depth, industries: selectedIndustries, maxCandidates }),
    [depth, maxCandidates, selectedIndustries],
  )

  const selectedLabel = useMemo(
    () =>
      selectedIndustries
        .map((key) => SIGNAL_PLAYBOOKS[key as keyof typeof SIGNAL_PLAYBOOKS]?.name)
        .filter(Boolean)
        .join(", "),
    [selectedIndustries],
  )

  const toggleIndustry = (key: string) => {
    setSelectedIndustries((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    )
  }

  const createMarket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/signal/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          city,
          state: state || null,
          radius_miles: radius ? Number(radius) : null,
          industries: selectedIndustries,
          max_candidates: Number(maxCandidates) || 20,
          research_depth: depth,
          notes: notes || null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Market could not be created.")
        return
      }
      router.push(`/dashboard/signal/markets/${data.market.id}`)
      router.refresh()
    } catch {
      setError("Market could not be created.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/signal/markets" className="rounded-md p-2 transition-colors hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Mountline Signal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Build Market</h1>
          <p className="text-sm text-muted-foreground">
            Create a controlled market scan. Signal discovers and ranks prospects, then waits for human approval.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={createMarket} className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <SectionPanel>
          <div className="grid gap-5 lg:grid-cols-2">
            <Field label="Market name" required value={name} onChange={setName} />
            <Field label="Candidate limit" required type="number" min={1} max={50} value={maxCandidates} onChange={setMaxCandidates} />
            <Field label="City" required value={city} onChange={setCity} />
            <Field label="State" value={state} onChange={setState} placeholder="TX" />
            <Field label="Radius" type="number" min={1} max={100} value={radius} onChange={setRadius} placeholder="Miles" />
            <label className="block space-y-2">
              <span className="text-sm font-medium">Research depth</span>
              <select
                value={depth}
                onChange={(event) => setDepth(event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
              >
                <option value="quick">Quick</option>
                <option value="balanced">Balanced</option>
                <option value="deep">Deep</option>
              </select>
            </label>
          </div>

          <div className="mt-5">
            <p className="text-sm font-medium">Industries</p>
            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              {Object.values(SIGNAL_PLAYBOOKS).map((playbook) => (
                <label
                  key={playbook.key}
                  className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm transition-colors hover:bg-muted/50"
                >
                  <input
                    type="checkbox"
                    checked={selectedIndustries.includes(playbook.key)}
                    onChange={() => toggleIndustry(playbook.key)}
                    className="mt-1 h-4 w-4 rounded border-border bg-background"
                  />
                  <span>
                    <span className="block font-medium">{playbook.name}</span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {playbook.idealSignals[0]}
                    </span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          <label className="mt-5 block space-y-2">
            <span className="text-sm font-medium">Optional notes</span>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full resize-none rounded-md border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </label>

          <div className="mt-6 flex justify-end gap-3">
            <Link href="/dashboard/signal/markets" className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || selectedIndustries.length === 0}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RadioTower className="h-4 w-4" />}
              Build Market
            </button>
          </div>
        </SectionPanel>

        <div className="space-y-4">
          <SectionPanel title="Estimate" description="The scan asks for confirmation on the market page before it runs.">
            <div className="space-y-3 text-sm">
              <EstimateRow label="Industries" value={selectedLabel || "Choose at least one"} />
              <EstimateRow label="Depth" value={depthLabels[depth]} />
              <EstimateRow label="Tavily operations" value={usage.tavilySearches} />
              <EstimateRow label="Firecrawl pages" value={usage.firecrawlPages} />
              <EstimateRow label="Screenshot shortlist" value={usage.screenshots} />
              <EstimateRow label="Fast analyses" value={usage.aiAnalyses} />
              <EstimateRow label="Estimated credit budget" value={usage.estimatedBudget} />
            </div>
            <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
              Signal reads only confirmed official public sites, stops at configured limits, and never contacts a business automatically.
            </div>
          </SectionPanel>

          <StatusBadge tone="amber">Human approval required before outreach</StatusBadge>
          <PrimaryAction href="/dashboard/signal/markets" icon={ArrowLeft}>View Markets</PrimaryAction>
        </div>
      </form>
    </div>
  )
}

function EstimateRow({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-border/70 pb-2 last:border-0 last:pb-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-mono text-foreground">{value}</span>
    </div>
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
        className="h-10 w-full rounded-md border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
      />
    </label>
  )
}
