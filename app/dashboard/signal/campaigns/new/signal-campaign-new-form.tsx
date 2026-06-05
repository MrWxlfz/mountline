"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, RadioTower } from "lucide-react"
import { SIGNAL_PLAYBOOKS } from "@/lib/signal/playbooks"

const defaultPlaybooks = ["auto_detailing", "barber_salon", "hvac"]

export function SignalCampaignNewForm() {
  const router = useRouter()
  const [name, setName] = useState("Keller Local Services Pilot")
  const [city, setCity] = useState("Keller")
  const [state, setState] = useState("TX")
  const [radius, setRadius] = useState("")
  const [maxCandidates, setMaxCandidates] = useState("25")
  const [notes, setNotes] = useState("")
  const [selectedPlaybooks, setSelectedPlaybooks] = useState<string[]>(defaultPlaybooks)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const selectedLabel = useMemo(
    () =>
      selectedPlaybooks
        .map((key) => SIGNAL_PLAYBOOKS[key as keyof typeof SIGNAL_PLAYBOOKS]?.name)
        .filter(Boolean)
        .join(", "),
    [selectedPlaybooks],
  )

  const togglePlaybook = (key: string) => {
    setSelectedPlaybooks((current) =>
      current.includes(key)
        ? current.filter((item) => item !== key)
        : [...current, key],
    )
  }

  const createCampaign = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/signal/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          target_city: city,
          target_state: state || null,
          target_radius_miles: radius ? Number(radius) : null,
          selected_playbooks: selectedPlaybooks,
          max_candidates: Number(maxCandidates) || 25,
          notes: notes || null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Campaign could not be created.")
        return
      }
      router.push(`/dashboard/signal/campaigns/${data.campaign.id}`)
      router.refresh()
    } catch {
      setError("Campaign could not be created.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/signal/campaigns" className="rounded-lg p-2 transition-colors hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Mountline Signal
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Build Campaign</h1>
          <p className="text-sm text-muted-foreground">
            Choose a market and verticals. Signal discovers candidates, then waits for human review.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      <form onSubmit={createCampaign} className="rounded-xl border border-border bg-card p-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Campaign name" required value={name} onChange={setName} />
          <Field label="Maximum candidates" required type="number" min={1} max={50} value={maxCandidates} onChange={setMaxCandidates} />
          <Field label="City" required value={city} onChange={setCity} />
          <Field label="State" value={state} onChange={setState} placeholder="TX" />
          <Field label="Optional radius" type="number" min={1} max={100} value={radius} onChange={setRadius} placeholder="Miles" />
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-sm font-medium">Selected verticals</p>
            <p className="mt-1 text-sm text-muted-foreground">{selectedLabel || "Choose at least one vertical"}</p>
          </div>
        </div>

        <div className="mt-5">
          <p className="text-sm font-medium">Verticals / playbooks</p>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {Object.values(SIGNAL_PLAYBOOKS).map((playbook) => (
              <label
                key={playbook.key}
                className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3 text-sm transition-colors hover:bg-muted/50"
              >
                <input
                  type="checkbox"
                  checked={selectedPlaybooks.includes(playbook.key)}
                  onChange={() => togglePlaybook(playbook.key)}
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
            className="w-full resize-none rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
        </label>

        <div className="mt-6 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          Signal uses permitted public web search only. It does not scrape Google Maps, Yelp, social platforms, or automatically contact prospects.
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link href="/dashboard/signal/campaigns" className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || selectedPlaybooks.length === 0}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RadioTower className="h-4 w-4" />}
            Create Campaign
          </button>
        </div>
      </form>
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
        className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
      />
    </label>
  )
}
