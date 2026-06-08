"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, ChevronDown, Loader2, RadioTower } from "lucide-react"
import { PrimaryAction, SectionPanel, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { SIGNAL_PLAYBOOKS } from "@/lib/signal/playbooks"

const depthLabels: Record<string, string> = {
  quick: "Quick",
  balanced: "Balanced",
  deep: "Deep",
}

const depthDescriptions: Record<string, string> = {
  quick: "Homepage only",
  balanced: "Homepage plus up to 2 useful pages",
  deep: "Homepage plus up to 4 useful pages when budget allows",
}

function titleCase(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/\b([a-z])/g, (match) => match.toUpperCase())
}

function estimateUsage({
  depth,
  maxCandidates,
}: {
  depth: string
  maxCandidates: string
}) {
  const candidateLimit = Math.max(1, Math.min(50, Number(maxCandidates) || 10))
  const pagesPerCandidate = depth === "quick" ? 1 : depth === "deep" ? 5 : 3
  return {
    businesses: candidateLimit,
    publicPages: candidateLimit * pagesPerCandidate,
    screenshots: Math.min(5, Math.ceil(candidateLimit * 0.35)),
    estimatedBudget: candidateLimit * pagesPerCandidate + 2,
  }
}

export function SignalMarketNewForm() {
  const router = useRouter()
  const [city, setCity] = useState("Keller")
  const [state, setState] = useState("TX")
  const [radius, setRadius] = useState("15")
  const [maxCandidates, setMaxCandidates] = useState("10")
  const [depth, setDepth] = useState("balanced")
  const [industry, setIndustry] = useState("auto_detailing")
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [providerMode, setProviderMode] = useState("hybrid")
  const [firecrawlBudget, setFirecrawlBudget] = useState("default")
  const [screenshotLimit, setScreenshotLimit] = useState("default")
  const [excludeExisting, setExcludeExisting] = useState(true)
  const [excludeSuppressed, setExcludeSuppressed] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const usage = useMemo(
    () => estimateUsage({ depth, maxCandidates }),
    [depth, maxCandidates],
  )
  const playbook = SIGNAL_PLAYBOOKS[industry as keyof typeof SIGNAL_PLAYBOOKS]
  const marketName = `${titleCase(city || "Market")} ${playbook?.name || "Prospects"}`

  const createMarket = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/signal/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: marketName,
          city,
          state: state || null,
          radius_miles: radius ? Number(radius) : null,
          industries: [industry],
          max_candidates: Number(maxCandidates) || 10,
          research_depth: depth,
          notes: [
            providerMode !== "hybrid" ? `Preferred provider mode: ${providerMode}.` : null,
            firecrawlBudget !== "default" ? `Firecrawl page budget: ${firecrawlBudget}.` : null,
            screenshotLimit !== "default" ? `Screenshot limit: ${screenshotLimit}.` : null,
            excludeExisting ? "Exclude existing prospects." : "Allow existing prospect matches.",
            excludeSuppressed ? "Exclude suppressed results." : "Allow suppressed result review.",
          ].filter(Boolean).join("\n") || null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Research could not be created.")
        return
      }
      router.push(`/dashboard/signal/markets/${data.market.id}`)
      router.refresh()
    } catch {
      setError("Research could not be created.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/signal/markets" className="rounded-md p-2 transition-colors hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="mb-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Mountline Signal
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Find strong local prospects.</h1>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            Choose a market and Signal will research public business websites, rank the strongest opportunities, and prepare a review queue.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={createMarket} className="grid gap-5 lg:grid-cols-[1fr_340px]">
        <SectionPanel>
          <div className="grid gap-5 md:grid-cols-2">
            <Field label="City" required value={city} onChange={setCity} />
            <Field label="State" value={state} onChange={setState} placeholder="TX" />
            <Field label="Radius" type="number" min={1} max={100} value={radius} onChange={setRadius} suffix="miles" />
            <Field label="Number of businesses" required type="number" min={1} max={50} value={maxCandidates} onChange={setMaxCandidates} />
            <label className="block space-y-2">
              <span className="text-sm font-medium">Industry</span>
              <select
                value={industry}
                onChange={(event) => setIndustry(event.target.value)}
                className="h-10 w-full rounded-md border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
              >
                {Object.values(SIGNAL_PLAYBOOKS).map((item) => (
                  <option key={item.key} value={item.key}>{item.name}</option>
                ))}
              </select>
            </label>
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
              <span className="block text-xs text-muted-foreground">{depthDescriptions[depth]}</span>
            </label>
          </div>

          <button
            type="button"
            onClick={() => setAdvancedOpen((value) => !value)}
            className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${advancedOpen ? "rotate-180" : ""}`} />
            Advanced options
          </button>

          {advancedOpen && (
            <div className="mt-4 grid gap-4 rounded-lg border border-border bg-muted/20 p-4 md:grid-cols-2">
              <SelectField label="Provider mode" value={providerMode} onChange={setProviderMode}>
                <option value="hybrid">Hybrid</option>
                <option value="tavily">Tavily only</option>
                <option value="firecrawl">Firecrawl only</option>
              </SelectField>
              <SelectField label="Firecrawl page budget" value={firecrawlBudget} onChange={setFirecrawlBudget}>
                <option value="default">Use environment default</option>
                <option value="low">Low</option>
                <option value="standard">Standard</option>
                <option value="max">Maximum allowed</option>
              </SelectField>
              <SelectField label="Screenshot limit" value={screenshotLimit} onChange={setScreenshotLimit}>
                <option value="default">Use environment default</option>
                <option value="3">Top 3</option>
                <option value="5">Top 5</option>
                <option value="0">No automatic shortlist</option>
              </SelectField>
              <div className="space-y-3 pt-1">
                <Toggle label="Exclude existing prospects" checked={excludeExisting} onChange={setExcludeExisting} />
                <Toggle label="Exclude suppressed results" checked={excludeSuppressed} onChange={setExcludeSuppressed} />
              </div>
            </div>
          )}

          <div className="mt-6 flex justify-end gap-3">
            <Link href="/dashboard/signal" className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving || !city.trim() || !industry}
              className="inline-flex h-10 items-center gap-2 rounded-md bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:pointer-events-none disabled:opacity-50"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RadioTower className="h-4 w-4" />}
              Start research
            </button>
          </div>
        </SectionPanel>

        <div className="space-y-4">
          <SectionPanel title="Estimate" description="Actual provider usage is recorded while research runs.">
            <div className="space-y-3 text-sm">
              <EstimateRow label="Market" value={marketName} />
              <EstimateRow label="Businesses requested" value={usage.businesses} />
              <EstimateRow label="Depth" value={depthLabels[depth]} />
              <EstimateRow label="Expected public-site pages" value={usage.publicPages} />
              <EstimateRow label="Screenshot shortlist maximum" value={usage.screenshots} />
              <EstimateRow label="Estimated provider usage" value={usage.estimatedBudget} />
            </div>
            <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3 text-xs leading-5 text-muted-foreground">
              Signal reads public official sites, keeps provider keys server-side, and never contacts a business automatically.
            </div>
          </SectionPanel>

          <StatusBadge tone="amber">Human approval required before outreach</StatusBadge>
          <PrimaryAction href="/dashboard/signal/markets" icon={ArrowLeft}>View markets</PrimaryAction>
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
  suffix,
  type = "text",
  value,
  ...props
}: {
  label: string
  onChange: (value: string) => void
  required?: boolean
  suffix?: string
  type?: string
  value: string
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "type">) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">
        {label}
        {required ? " *" : ""}
      </span>
      <span className="flex items-center rounded-md border border-border bg-muted focus-within:ring-2 focus-within:ring-foreground/20">
        <input
          {...props}
          required={required}
          type={type}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 min-w-0 flex-1 bg-transparent px-3 text-sm outline-none"
        />
        {suffix && <span className="pr-3 text-xs text-muted-foreground">{suffix}</span>}
      </span>
    </label>
  )
}

function SelectField({
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
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
      >
        {children}
      </select>
    </label>
  )
}

function Toggle({
  checked,
  label,
  onChange,
}: {
  checked: boolean
  label: string
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex items-center justify-between gap-4 text-sm">
      <span>{label}</span>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-4 w-4 rounded border-border bg-background"
      />
    </label>
  )
}
