"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"

type ClientForm = {
  business_name: string
  contact_name: string
  email: string
  phone: string
  website: string
  notes: string
}

type LeadRecord = {
  id: string
  name: string | null
  business_name: string | null
  email: string | null
  phone: string | null
  current_website: string | null
  service_needed: string | null
  budget_range: string | null
  message: string | null
}

type SignalRecord = {
  id: string
  business_name: string
  contact_name: string | null
  public_email: string | null
  public_phone: string | null
  website_url: string | null
  primary_opportunity: string | null
  why_it_matters: string | null
}

const emptyForm: ClientForm = {
  business_name: "",
  contact_name: "",
  email: "",
  phone: "",
  website: "",
  notes: "",
}

export default function NewClientPage() {
  return (
    <Suspense fallback={<NewClientFormFallback />}>
      <NewClientForm />
    </Suspense>
  )
}

function NewClientForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const leadId = searchParams.get("leadId")
  const signalId = searchParams.get("signalId")
  const [saving, setSaving] = useState(false)
  const [loadingLead, setLoadingLead] = useState(Boolean(leadId || signalId))
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<ClientForm>(emptyForm)

  useEffect(() => {
    if (!leadId && !signalId) return

    async function loadLead() {
      setLoadingLead(true)
      setError(null)

      try {
        const res = await fetch(leadId ? `/api/leads/${leadId}` : `/api/signal/prospects/${signalId}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Lead details could not be loaded.")
          return
        }

        setForm(leadId ? prefillFromLead(data.lead) : prefillFromSignal(data.prospect))
      } catch {
        setError("Lead details could not be loaded.")
      } finally {
        setLoadingLead(false)
      }
    }

    loadLead()
  }, [leadId, signalId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)

    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, lead_id: leadId, signal_id: signalId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Client could not be saved.")
        return
      }

      router.push("/dashboard/clients")
      router.refresh()
    } catch {
      setError("Client could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/clients"
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Add Client</h1>
          <p className="text-muted-foreground">
            {leadId
              ? "Create a client record from an inquiry."
              : signalId
                ? "Create a client record from the Signal workspace. Verify contact details before saving."
                : "Create a new client record."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
        {loadingLead && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading lead details...
          </div>
        )}

        {error && (
          <div className="rounded-lg border border-error-border bg-error-soft px-3 py-2 text-sm text-error-foreground">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Business Name *</label>
            <input
              required
              type="text"
              value={form.business_name}
              onChange={(e) => setForm({ ...form, business_name: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="Acme Corp"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Contact Name *</label>
            <input
              required
              type="text"
              value={form.contact_name}
              onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="John Smith"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="john@acme.com"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone</label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="(555) 123-4567"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Website</label>
          <input
            type="url"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="https://acme.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={5}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
            placeholder="Any additional notes..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/dashboard/clients"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving || loadingLead}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Client"}
          </button>
        </div>
      </form>
    </div>
  )
}

function NewClientFormFallback() {
  return (
    <div className="max-w-2xl rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
      Loading client form...
    </div>
  )
}

function prefillFromLead(lead: LeadRecord): ClientForm {
  const notes = [
    lead.service_needed ? `Service needed: ${lead.service_needed}` : null,
    lead.budget_range ? `Budget range: ${lead.budget_range}` : null,
    lead.message ? `Message: ${lead.message}` : null,
  ].filter(Boolean)

  return {
    business_name: lead.business_name || "",
    contact_name: lead.name || "",
    email: lead.email || "",
    phone: lead.phone || "",
    website: lead.current_website || "",
    notes: notes.join("\n"),
  }
}

function prefillFromSignal(prospect: SignalRecord): ClientForm {
  return {
    business_name: prospect.business_name || "",
    contact_name: prospect.contact_name || "",
    email: prospect.public_email || "",
    phone: prospect.public_phone || "",
    website: prospect.website_url || "",
    notes: [
      prospect.primary_opportunity ? `Signal opportunity: ${prospect.primary_opportunity}` : null,
      prospect.why_it_matters ? `Signal summary: ${prospect.why_it_matters}` : null,
    ].filter(Boolean).join("\n\n"),
  }
}
