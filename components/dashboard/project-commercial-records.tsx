"use client"

import { useState } from "react"
import { Check, Loader2, Plus } from "lucide-react"
import type { PaymentMethod, ProjectReceipt } from "@/lib/supabase/types"

type SaleEvidence = {
  sale_confirmed_at: string | null
  sale_confirmed_by: string | null
  sale_evidence_reference: string | null
}

const methods: Array<{ value: PaymentMethod; label: string }> = [
  { value: "stripe_card", label: "Stripe/card" },
  { value: "crypto", label: "Crypto" },
  { value: "cash", label: "Cash" },
  { value: "check", label: "Check" },
  { value: "bank_transfer", label: "Bank transfer" },
  { value: "other", label: "Other" },
]

function localDateTimeValue() {
  const now = new Date()
  return new Date(now.getTime() - now.getTimezoneOffset() * 60_000).toISOString().slice(0, 16)
}

function formatMinor(amount: number, currency: string) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount / 100)
}

export function ProjectCommercialRecords({
  projectId,
  initialSale,
  initialReceipts,
}: {
  projectId: string
  initialSale: SaleEvidence
  initialReceipts: ProjectReceipt[]
}) {
  const [sale, setSale] = useState(initialSale)
  const [receipts, setReceipts] = useState(initialReceipts)
  const [evidenceReference, setEvidenceReference] = useState("")
  const [receipt, setReceipt] = useState({ amount: "", currency: "USD", received_at: localDateTimeValue(), payment_method: "stripe_card" as PaymentMethod, reference: "" })
  const [working, setWorking] = useState<"sale" | "receipt" | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  async function confirmSale(event: React.FormEvent) {
    event.preventDefault()
    setWorking("sale")
    setError(null)
    setSuccess(null)
    try {
      const response = await fetch(`/api/projects/${projectId}/sale-confirmation`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidence_reference: evidenceReference }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Sale evidence could not be recorded.")
      setSale(data.project)
      setEvidenceReference("")
      setSuccess("Scope acceptance recorded. This does not imply payment.")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sale evidence could not be recorded.")
    } finally {
      setWorking(null)
    }
  }

  async function addReceipt(event: React.FormEvent) {
    event.preventDefault()
    setWorking("receipt")
    setError(null)
    setSuccess(null)
    try {
      const amount = Number(receipt.amount)
      const response = await fetch(`/api/projects/${projectId}/receipts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount_minor: Math.round(amount * 100),
          currency: receipt.currency,
          received_at: new Date(receipt.received_at).toISOString(),
          payment_method: receipt.payment_method,
          reference: receipt.reference,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Receipt could not be recorded.")
      setReceipts((current) => [data.receipt, ...current])
      setReceipt((current) => ({ ...current, amount: "", reference: "", received_at: localDateTimeValue() }))
      setSuccess("Receipt recorded. Totals now use this evidence.")
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Receipt could not be recorded.")
    } finally {
      setWorking(null)
    }
  }

  return (
    <section className="max-w-3xl space-y-5 rounded-xl border border-border bg-card p-6">
      <div>
        <h2 className="text-lg font-semibold">Commercial evidence</h2>
        <p className="mt-1 text-sm text-muted-foreground">Scope acceptance and received money are independent records.</p>
      </div>

      {error ? <p className="rounded-lg border border-error-border bg-error-soft px-3 py-2 text-sm text-error-foreground">{error}</p> : null}
      {success ? <p className="flex items-center gap-2 rounded-lg border border-success-border bg-success-soft px-3 py-2 text-sm text-success-foreground"><Check className="h-4 w-4" />{success}</p> : null}

      <div className="rounded-lg border border-border p-4">
        <h3 className="font-medium">Accepted scope</h3>
        {sale.sale_confirmed_at ? (
          <div className="mt-2 text-sm text-muted-foreground">
            <p>Confirmed {new Date(sale.sale_confirmed_at).toLocaleString()}</p>
            <p className="mt-1 break-words">Evidence: {sale.sale_evidence_reference}</p>
          </div>
        ) : (
          <form onSubmit={confirmSale} className="mt-3 flex flex-col gap-3 sm:flex-row">
            <input required value={evidenceReference} onChange={(event) => setEvidenceReference(event.target.value)} placeholder="Accepted proposal, email, or signed-scope reference" className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 py-2 text-sm" />
            <button disabled={working === "sale"} className="inline-flex items-center justify-center gap-2 rounded-md bg-foreground px-4 py-2 text-sm font-medium text-background disabled:opacity-50">
              {working === "sale" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}Confirm accepted scope
            </button>
          </form>
        )}
      </div>

      <div className="rounded-lg border border-border p-4">
        <h3 className="font-medium">Mountline receipts</h3>
        <p className="mt-1 text-xs text-muted-foreground">Record money Mountline actually received for this project. Client-job payments belong in inquiry events.</p>
        <form onSubmit={addReceipt} className="mt-4 grid gap-3 sm:grid-cols-2">
          <input required type="number" min="0.01" step="0.01" value={receipt.amount} onChange={(event) => setReceipt({ ...receipt, amount: event.target.value })} placeholder="Amount received" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <input required maxLength={3} value={receipt.currency} onChange={(event) => setReceipt({ ...receipt, currency: event.target.value.toUpperCase() })} aria-label="Currency" className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <input required type="datetime-local" value={receipt.received_at} onChange={(event) => setReceipt({ ...receipt, received_at: event.target.value })} className="rounded-md border border-border bg-background px-3 py-2 text-sm" />
          <select value={receipt.payment_method} onChange={(event) => setReceipt({ ...receipt, payment_method: event.target.value as PaymentMethod })} className="rounded-md border border-border bg-background px-3 py-2 text-sm">
            {methods.map((method) => <option key={method.value} value={method.value}>{method.label}</option>)}
          </select>
          <input required value={receipt.reference} onChange={(event) => setReceipt({ ...receipt, reference: event.target.value })} placeholder="Receipt or transaction reference" className="rounded-md border border-border bg-background px-3 py-2 text-sm sm:col-span-2" />
          <button disabled={working === "receipt"} className="inline-flex items-center justify-center gap-2 rounded-md border border-border px-4 py-2 text-sm font-medium sm:col-span-2 disabled:opacity-50">
            {working === "receipt" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}Record receipt
          </button>
        </form>
        <div className="mt-4 space-y-2">
          {receipts.length > 0 ? receipts.map((item) => (
            <div key={item.id} className="flex flex-col justify-between gap-1 rounded-md bg-muted/40 px-3 py-2 text-sm sm:flex-row">
              <span>{formatMinor(item.amount_minor, item.currency)} · {item.payment_method.replace(/_/g, " ")}</span>
              <span className="text-muted-foreground">{item.reference} · {new Date(item.received_at).toLocaleDateString()}</span>
            </div>
          )) : <p className="text-sm text-muted-foreground">No verified receipts recorded.</p>}
        </div>
      </div>
    </section>
  )
}
