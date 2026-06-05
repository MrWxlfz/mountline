"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowLeft, AlertTriangle, Loader2, Save } from "lucide-react"
import {
  getSignalPlaybook,
  inferSignalPlaybook,
  MEDICAL_COMPLIANCE_WARNING,
  SIGNAL_PLAYBOOKS,
} from "@/lib/signal/playbooks"

const emptyForm = {
  business_name: "",
  contact_name: "",
  industry: "",
  industry_playbook: "general_local_business",
  city: "",
  state: "",
  locality_relationship: "",
  website_url: "",
  public_email: "",
  public_phone: "",
  public_contact_form_url: "",
  instagram_url: "",
  existing_website_platform: "",
  existing_booking_platform: "",
  what_looks_good: "",
  visible_problem: "",
  human_notes: "",
  relevant_demo: "none",
  outreach_mode: "professional_studio",
}

type FormState = typeof emptyForm

export default function NewSignalProspectPage() {
  const router = useRouter()
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const inferredPlaybook = useMemo(
    () => form.industry_playbook || inferSignalPlaybook(form.industry),
    [form.industry, form.industry_playbook],
  )
  const playbook = getSignalPlaybook(inferredPlaybook)

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => {
      const next = { ...current, [field]: value }
      if (field === "industry" && current.industry_playbook === "general_local_business") {
        next.industry_playbook = inferSignalPlaybook(value)
      }
      if (field === "industry_playbook") {
        const selected = getSignalPlaybook(value)
        next.relevant_demo = selected.relevantDemo
        next.outreach_mode = selected.recommendedOutreachMode
      }
      return next
    })
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const response = await fetch("/api/signal/prospects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Prospect could not be created.")
        return
      }

      router.push(`/dashboard/signal/${data.prospect.id}`)
      router.refresh()
    } catch {
      setError("Prospect could not be created.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/signal" className="rounded-lg p-2 transition-colors hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Mountline Signal
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Add Prospect</h1>
          <p className="text-sm text-muted-foreground">
            Add manually researched public business information for team-only analysis.
          </p>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          {error}
        </div>
      )}

      {playbook.complianceTier === "compliance_gated" && (
        <div className="flex gap-3 rounded-xl border border-yellow-500/25 bg-yellow-500/10 p-4 text-sm text-yellow-100">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <p>{MEDICAL_COMPLIANCE_WARNING}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="rounded-xl border border-border bg-card p-6">
        <div className="grid gap-5 lg:grid-cols-2">
          <Field label="Business name" required value={form.business_name} onChange={(value) => updateField("business_name", value)} />
          <Field label="Contact name" value={form.contact_name} onChange={(value) => updateField("contact_name", value)} />
          <Field label="Industry" required value={form.industry} onChange={(value) => updateField("industry", value)} placeholder="HVAC, auto detailing, dental..." />
          <Select label="Industry playbook" value={form.industry_playbook} onChange={(value) => updateField("industry_playbook", value)}>
            {Object.values(SIGNAL_PLAYBOOKS).map((item) => (
              <option key={item.key} value={item.key}>{item.name}</option>
            ))}
          </Select>
          <Field label="City" value={form.city} onChange={(value) => updateField("city", value)} />
          <Field label="State" value={form.state} onChange={(value) => updateField("state", value)} placeholder="TX" />
          <Field label="Locality / relationship context" value={form.locality_relationship} onChange={(value) => updateField("locality_relationship", value)} placeholder="Keller local, personally visited, family referral..." />
          <Field label="Website URL" inputMode="url" value={form.website_url} onChange={(value) => updateField("website_url", value)} placeholder="https://example.com" />
          <Field label="Public email" type="email" value={form.public_email} onChange={(value) => updateField("public_email", value)} />
          <Field label="Public phone" type="tel" value={form.public_phone} onChange={(value) => updateField("public_phone", value)} />
          <Field label="Public contact form URL" inputMode="url" value={form.public_contact_form_url} onChange={(value) => updateField("public_contact_form_url", value)} />
          <Field label="Instagram URL" inputMode="url" value={form.instagram_url} onChange={(value) => updateField("instagram_url", value)} />
          <Field label="Existing website platform" value={form.existing_website_platform} onChange={(value) => updateField("existing_website_platform", value)} placeholder="square, wix, wordpress, custom, unknown" />
          <Field label="Existing booking platform" value={form.existing_booking_platform} onChange={(value) => updateField("existing_booking_platform", value)} placeholder="square, calendly, acuity, none, unknown" />
          <Select label="Relevant demo" value={form.relevant_demo} onChange={(value) => updateField("relevant_demo", value)}>
            <option value="auto-detailing">Auto detailing</option>
            <option value="barber-shop">Barber shop</option>
            <option value="none">None</option>
          </Select>
          <Select label="Outreach mode" value={form.outreach_mode} onChange={(value) => updateField("outreach_mode", value)}>
            <option value="local_student">Warm local</option>
            <option value="professional_studio">Professional studio</option>
            <option value="warm_connection">Warm connection</option>
          </Select>
        </div>

        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          <Textarea label="What looks good" value={form.what_looks_good} onChange={(value) => updateField("what_looks_good", value)} />
          <Textarea label="Visible problem" value={form.visible_problem} onChange={(value) => updateField("visible_problem", value)} />
          <Textarea label="Human notes" value={form.human_notes} onChange={(value) => updateField("human_notes", value)} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Link href="/dashboard/signal" className="px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? "Saving..." : "Create Prospect"}
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

function Select({
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
        className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
      >
        {children}
      </select>
    </label>
  )
}

function Textarea({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className="w-full resize-none rounded-lg border border-border bg-muted px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
      />
    </label>
  )
}
