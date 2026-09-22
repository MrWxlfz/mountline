"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowUpRight, Inbox, Loader2, Mail, Phone, UserPlus } from "lucide-react"
import { EmptyState, SectionPanel, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { leadReviewLabels, leadReviewSchema, leadReviewStatuses, safeBusinessWebsite } from "@/lib/leads/validation"

export type InquiryLead = {
  id: string
  created_at: string
  name: string | null
  business_name: string | null
  email: string | null
  phone: string | null
  current_website: string | null
  service_needed: string | null
  budget_range: string | null
  message: string | null
  status: string | null
  source: string | null
}

function displayStatus(value: string | null) {
  const parsed = leadReviewSchema.safeParse({ status: value })
  return parsed.success ? leadReviewLabels[parsed.data.status] : (value || "Unknown").replace(/_/g, " ")
}

export function InquiryInbox({ inquiries }: { inquiries: InquiryLead[] }) {
  const [filter, setFilter] = useState("all")
  const [query, setQuery] = useState("")
  const visible = inquiries.filter((inquiry) => {
    const matchesStatus = filter === "all" || inquiry.status === filter
    const matchesQuery = [inquiry.name, inquiry.business_name, inquiry.email, inquiry.phone, inquiry.message].some((value) => value?.toLowerCase().includes(query.trim().toLowerCase()))
    return matchesStatus && (!query.trim() || matchesQuery)
  })

  return (
    <SectionPanel title="Incoming inquiries" description="Business owners asking about Mountline. Read the request, respond, and record the next review state.">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="flex-1"><span className="sr-only">Search incoming inquiries</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search contact, business, or request" className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" /></label>
        <select aria-label="Filter inquiry review status" value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm"><option value="all">All inquiry statuses</option>{leadReviewStatuses.map((status) => <option key={status} value={status}>{leadReviewLabels[status]}</option>)}</select>
      </div>
      <div className="space-y-3">{visible.map((inquiry) => <InquiryCard key={`${inquiry.id}:${inquiry.status}`} inquiry={inquiry} />)}</div>
      {!visible.length ? <EmptyState title={inquiries.length ? "No inquiries match" : "No incoming inquiries"} icon={Inbox}>{inquiries.length ? "Try another search or review status." : "Receptionist requests and other contact-form submissions appear here."}</EmptyState> : null}
    </SectionPanel>
  )
}

function InquiryCard({ inquiry }: { inquiry: InquiryLead }) {
  const router = useRouter()
  const [status, setStatus] = useState(inquiry.status || "new")
  const [savedStatus, setSavedStatus] = useState(inquiry.status || "new")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const website = safeBusinessWebsite(inquiry.current_website)
  const knownStatus = leadReviewSchema.safeParse({ status }).success
  const phoneHref = inquiry.phone?.replace(/[^+\d]/g, "")

  async function saveStatus(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (saving) return
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const response = await fetch(`/api/leads/${inquiry.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (!response.ok || data.lead?.id !== inquiry.id || data.lead?.status !== status) throw new Error(data.error || "Review status could not be confirmed.")
      setSavedStatus(data.lead.status)
      setSuccess(true)
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Review status could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <details className="group rounded-lg border border-border bg-background/40">
      <summary className="cursor-pointer px-4 py-4 marker:text-muted-foreground">
        <span className="ml-1 inline-flex max-w-[90%] flex-wrap items-center gap-x-3 gap-y-2 align-middle"><strong className="break-words text-sm font-medium">{inquiry.business_name || inquiry.name || "Unnamed inquiry"}</strong><StatusBadge tone={savedStatus === "new" ? "blue" : savedStatus === "qualified" ? "green" : savedStatus === "closed" ? "default" : "amber"}>{displayStatus(savedStatus)}</StatusBadge><span className="text-xs text-muted-foreground">{new Date(inquiry.created_at).toLocaleDateString()}</span><span className="text-xs text-muted-foreground group-open:hidden">Read request</span></span>
      </summary>
      <div className="space-y-5 border-t border-border p-4">
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div><p className="mb-1 text-xs text-muted-foreground">Contact</p><p>{inquiry.name || "Name not supplied"}</p></div>
          <div><p className="mb-1 text-xs text-muted-foreground">Interested in</p><p>{inquiry.service_needed?.replace(/[-_]/g, " ") || "Not specified"}</p></div>
          <div><p className="mb-1 text-xs text-muted-foreground">Source</p><p>{inquiry.source?.replace(/_/g, " ") || "Not supplied"}</p></div>
          {inquiry.budget_range ? <div><p className="mb-1 text-xs text-muted-foreground">Budget supplied</p><p>{inquiry.budget_range}</p></div> : null}
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          {inquiry.email ? <a href={`mailto:${encodeURIComponent(inquiry.email)}`} className="inline-flex max-w-full items-center gap-2 text-foreground underline underline-offset-4"><Mail className="size-4 shrink-0" /><span className="break-all">{inquiry.email}</span></a> : null}
          {inquiry.phone ? <a href={phoneHref ? `tel:${phoneHref}` : undefined} className="inline-flex items-center gap-2 text-foreground underline underline-offset-4"><Phone className="size-4 shrink-0" />{inquiry.phone}</a> : null}
          {website ? <a href={website} target="_blank" rel="noopener noreferrer" className="inline-flex max-w-full items-center gap-2 text-foreground underline underline-offset-4"><ArrowUpRight className="size-4 shrink-0" /><span className="break-all">{inquiry.current_website}</span></a> : inquiry.current_website ? <span className="break-all text-muted-foreground">Website supplied: {inquiry.current_website}</span> : null}
        </div>
        <div><h3 className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Full request</h3><p className="whitespace-pre-wrap break-words rounded-md border border-border bg-muted/25 p-4 text-sm leading-6">{inquiry.message || "No message supplied."}</p></div>
        <form onSubmit={saveStatus} className="space-y-3" aria-busy={saving}>
          <label htmlFor={`review-${inquiry.id}`} className="block text-sm font-medium">Review status</label>
          <div className="flex flex-col gap-2 sm:flex-row">
            <select id={`review-${inquiry.id}`} value={status} disabled={saving} onChange={(event) => { setStatus(event.target.value); setSuccess(false) }} className="h-10 min-w-0 rounded-md border border-border bg-background px-3 text-sm disabled:opacity-60">{!knownStatus ? <option value={status} disabled>{displayStatus(status)} (existing status)</option> : null}{leadReviewStatuses.map((value) => <option key={value} value={value}>{leadReviewLabels[value]}</option>)}</select>
            <button type="submit" disabled={saving || status === savedStatus || !knownStatus} className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm font-medium disabled:opacity-50">{saving ? <Loader2 className="size-4 animate-spin" /> : null}{saving ? "Saving" : "Save review status"}</button>
          </div>
          <p className="text-xs text-muted-foreground">Choose “Contacted” after reaching out. Review status does not confirm a sale, payment, or client account.</p>
          {error ? <p role="alert" className="text-sm text-error-foreground">{error}</p> : null}
          {success ? <p role="status" className="text-sm text-success-foreground">Review status saved.</p> : null}
        </form>
        <Link href={`/dashboard/clients/new?leadId=${inquiry.id}`} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-muted"><UserPlus className="size-3.5" /> Create client after qualification</Link>
      </div>
    </details>
  )
}
