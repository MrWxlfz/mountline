"use client"

import { useState } from "react"
import { Loader2, Plus } from "lucide-react"
import type { Inquiry, InquiryEvent, InquiryEventType } from "@/lib/supabase/types"

type InquiryWithEvents = Inquiry & { events: InquiryEvent[] }

const eventOptions: Array<{ value: Exclude<InquiryEventType, "inquiry_received">; label: string }> = [
  { value: "handoff_pending", label: "Handoff pending" },
  { value: "handoff_attempted", label: "Handoff attempted" },
  { value: "handoff_accepted_by_provider", label: "Accepted by provider" },
  { value: "handoff_successful", label: "Handoff confirmed delivered" },
  { value: "handoff_failed", label: "Handoff failed" },
  { value: "customer_contacted", label: "Customer contacted" },
  { value: "quote_produced", label: "Quote produced" },
  { value: "job_won", label: "Job accepted" },
  { value: "payment_received", label: "Client-job payment received" },
]

const evidenceLabels: Record<Exclude<InquiryEventType, "inquiry_received" | "payment_received">, string> = {
  handoff_pending: "Pending reason (optional)",
  handoff_attempted: "Destination",
  handoff_accepted_by_provider: "Provider acceptance reference",
  handoff_successful: "Verified delivery reference",
  handoff_failed: "Failure reason",
  customer_contacted: "Contact method",
  quote_produced: "Quote reference",
  job_won: "Accepted job reference",
}

function localDateTimeValue() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

export function ProjectInquiries({ projectId, initialInquiries }: { projectId: string; initialInquiries: InquiryWithEvents[] }) {
  const [inquiries, setInquiries] = useState(initialInquiries)
  const [selectedId, setSelectedId] = useState(initialInquiries[0]?.id || "")
  const [captureKey, setCaptureKey] = useState(() => crypto.randomUUID())
  const [eventKey, setEventKey] = useState(() => crypto.randomUUID())
  const [capture, setCapture] = useState({ source: "manual", external_reference: "", received_at: localDateTimeValue(), contact_name: "", contact_phone: "", contact_email: "", service_requested: "", intake_details: "", is_test: false })
  const [eventForm, setEventForm] = useState({ event_type: "handoff_pending" as Exclude<InquiryEventType, "inquiry_received">, occurred_at: localDateTimeValue(), attempt_id: "", evidence: "", amount: "", currency: "USD" })
  const [working, setWorking] = useState<"capture" | "event" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function reload() {
    const response = await fetch(`/api/projects/${projectId}/inquiries`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || "Inquiries could not be refreshed.")
    setInquiries(data.inquiries)
    return data.inquiries as InquiryWithEvents[]
  }

  async function addInquiry(event: React.FormEvent) {
    event.preventDefault()
    setWorking("capture")
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`/api/projects/${projectId}/inquiries`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...capture, idempotency_key: captureKey, received_at: new Date(capture.received_at).toISOString() }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Inquiry could not be recorded.")
      const rows = await reload()
      setSelectedId(data.inquiry.id)
      setCaptureKey(crypto.randomUUID())
      setCapture({ source: "manual", external_reference: "", received_at: localDateTimeValue(), contact_name: "", contact_phone: "", contact_email: "", service_requested: "", intake_details: "", is_test: false })
      setSuccess(`Inquiry recorded${rows.find((row) => row.id === data.inquiry.id)?.is_test ? " as test data" : ""}. No qualification or handoff outcome was inferred.`)
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Inquiry could not be recorded.")
    } finally {
      setWorking(null)
    }
  }

  function buildEvidence() {
    const value = eventForm.evidence.trim()
    switch (eventForm.event_type) {
      case "handoff_pending": return value ? { reason: value } : {}
      case "handoff_attempted": return { destination: value }
      case "handoff_accepted_by_provider": return { provider_reference: value }
      case "handoff_successful": return { delivery_reference: value }
      case "handoff_failed": return { failure_reason: value }
      case "customer_contacted": return { contact_method: value }
      case "quote_produced": return { quote_reference: value }
      case "job_won": return { job_reference: value }
      case "payment_received": return { payment_context: "client_job", receipt_reference: value, amount_minor: Math.round(Number(eventForm.amount) * 100), currency: eventForm.currency, received_at: new Date(eventForm.occurred_at).toISOString() }
    }
  }

  async function addEvent(event: React.FormEvent) {
    event.preventDefault()
    if (!selectedId) return
    setWorking("event")
    setError(null)
    setSuccess(null)
    try {
      const handoffEvent = eventForm.event_type.startsWith("handoff_")
      const response = await fetch(`/api/projects/${projectId}/inquiries/${selectedId}/events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_type: eventForm.event_type,
          occurred_at: new Date(eventForm.occurred_at).toISOString(),
          actor_source: "manual_team",
          source_event_key: eventKey,
          attempt_id: handoffEvent ? eventForm.attempt_id : null,
          supersedes_event_id: null,
          evidence: buildEvidence(),
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Event could not be recorded.")
      await reload()
      setEventKey(crypto.randomUUID())
      setEventForm((current) => ({ ...current, occurred_at: localDateTimeValue(), attempt_id: "", evidence: "", amount: "" }))
      setSuccess(data.duplicate ? "This source event was already recorded; no duplicate was created." : "Event recorded without inferring later outcomes.")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Event could not be recorded.")
    } finally {
      setWorking(null)
    }
  }

  const isHandoff = eventForm.event_type.startsWith("handoff_")
  const isPayment = eventForm.event_type === "payment_received"

  return (
    <section className="max-w-3xl space-y-5 rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Cleaning inquiries</h2>
        <p className="mt-1 text-sm text-muted-foreground">Manual pilot records only. Each outcome requires its own evidence.</p>
      </div>
      {error ? <p className="rounded-lg border border-error-border bg-error-soft px-3 py-2 text-sm text-error-foreground">{error}</p> : null}
      {success ? <p className="rounded-lg border border-success-border bg-success-soft px-3 py-2 text-sm text-success-foreground">{success}</p> : null}

      <form onSubmit={addInquiry} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
        <input required type="datetime-local" value={capture.received_at} onChange={(e) => setCapture({ ...capture, received_at: e.target.value })} className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
        <select value={capture.source} onChange={(e) => setCapture({ ...capture, source: e.target.value })} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
          {["manual", "phone", "website", "email", "referral", "provider"].map((source) => <option key={source} value={source}>{source}</option>)}
        </select>
        <input value={capture.contact_name} onChange={(e) => setCapture({ ...capture, contact_name: e.target.value })} placeholder="Contact name" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
        <input value={capture.contact_phone} onChange={(e) => setCapture({ ...capture, contact_phone: e.target.value })} placeholder="Contact phone" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
        <input type="email" value={capture.contact_email} onChange={(e) => setCapture({ ...capture, contact_email: e.target.value })} placeholder="Contact email" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
        <input value={capture.external_reference} onChange={(e) => setCapture({ ...capture, external_reference: e.target.value })} placeholder="External call/reference ID" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
        <input value={capture.service_requested} onChange={(e) => setCapture({ ...capture, service_requested: e.target.value })} placeholder="Service requested" className="rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
        <textarea value={capture.intake_details} onChange={(e) => setCapture({ ...capture, intake_details: e.target.value })} placeholder="Necessary intake details" rows={2} className="rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={capture.is_test} onChange={(e) => setCapture({ ...capture, is_test: e.target.checked })} />Test record</label>
        <button disabled={working === "capture"} className="inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50">{working === "capture" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Record inquiry</button>
      </form>

      {inquiries.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="min-w-full text-left text-sm"><thead className="bg-muted/40 text-xs text-muted-foreground"><tr><th className="px-3 py-2">Inquiry</th><th className="px-3 py-2">Received</th><th className="px-3 py-2">Recorded events</th></tr></thead><tbody>{inquiries.map((item) => <tr key={item.id} className="border-t border-border"><td className="px-3 py-3"><button type="button" onClick={() => setSelectedId(item.id)} className="text-left font-medium hover:underline">{item.contact_name || item.contact_phone || item.contact_email || "Unnamed inquiry"}</button>{item.is_test ? <span className="ml-2 rounded bg-muted px-1.5 py-0.5 text-xs">test</span> : null}<p className="mt-1 text-xs text-muted-foreground">{item.service_requested || item.source}</p></td><td className="px-3 py-3 text-muted-foreground">{new Date(item.received_at).toLocaleString()}</td><td className="px-3 py-3 text-muted-foreground">{item.events.map((entry) => entry.event_type.replace(/_/g, " ")).join(" · ")}</td></tr>)}</tbody></table>
          </div>

          <form onSubmit={addEvent} className="grid gap-3 rounded-lg border border-border p-4 sm:grid-cols-2">
            <select required value={selectedId} onChange={(e) => setSelectedId(e.target.value)} className="rounded-md border border-border bg-background px-3 py-2 text-sm">{inquiries.map((item) => <option key={item.id} value={item.id}>{item.contact_name || item.external_reference || item.id}</option>)}</select>
            <select value={eventForm.event_type} onChange={(e) => setEventForm({ ...eventForm, event_type: e.target.value as typeof eventForm.event_type })} className="rounded-md border border-border bg-background px-3 py-2 text-sm">{eventOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>
            <input required type="datetime-local" value={eventForm.occurred_at} onChange={(e) => setEventForm({ ...eventForm, occurred_at: e.target.value })} className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
            {isHandoff ? <input required value={eventForm.attempt_id} onChange={(e) => setEventForm({ ...eventForm, attempt_id: e.target.value })} placeholder="Attempt ID" className="rounded-md border border-border bg-background px-3 py-2 text-sm" /> : null}
            <input required={eventForm.event_type !== "handoff_pending"} value={eventForm.evidence} onChange={(e) => setEventForm({ ...eventForm, evidence: e.target.value })} placeholder={isPayment ? "Client-job receipt reference" : evidenceLabels[eventForm.event_type as keyof typeof evidenceLabels]} className="rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
            {isPayment ? <><input required type="number" min="0.01" step="0.01" value={eventForm.amount} onChange={(e) => setEventForm({ ...eventForm, amount: e.target.value })} placeholder="Client-job amount" className="rounded-md border border-border bg-background px-3 py-2 text-sm" /><input required maxLength={3} value={eventForm.currency} onChange={(e) => setEventForm({ ...eventForm, currency: e.target.value.toUpperCase() })} aria-label="Client-job payment currency" className="rounded-md border border-border bg-background px-3 py-2 text-sm" /></> : null}
            <button disabled={working === "event"} className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium sm:col-span-2 disabled:opacity-50">{working === "event" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Record independent event</button>
          </form>
        </>
      ) : <p className="text-sm text-muted-foreground">No inquiries recorded for this project.</p>}
    </section>
  )
}
