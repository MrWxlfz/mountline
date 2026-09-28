"use client"

import { useEffect, useRef, useState, type FormEvent } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowUpRight, Inbox, Loader2, Mail, Phone, Send, UserPlus } from "lucide-react"
import { EmptyState, SectionPanel, StateNotice, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { leadReviewLabels, leadReviewSchema, leadReviewStatuses, safeBusinessWebsite } from "@/lib/leads/validation"
import { describeInterests } from "@/lib/leads/inquiry-schema"
import { emailKindLabels, skipReasonLabels, type EmailKind } from "@/lib/leads/email/kinds"

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
  interests?: string[] | null
  contacted_at?: string | null
  customer_replied_at?: string | null
  followup_paused_at?: string | null
  followup_opted_out_at?: string | null
  email_suppressed_at?: string | null
  email_suppressed_reason?: string | null
}

export type InquiryEmailJob = {
  id: string
  lead_id: string
  kind: EmailKind
  status: string
  send_after: string
  attempts: number
  provider_accepted_at: string | null
  delivered_at: string | null
  last_error: string | null
  skip_reason: string | null
  approved_at: string | null
  updated_at: string
}

export type EmailSetupStatus = {
  canSend: boolean
  missing: string[]
  problems: string[]
  customerFollowup: "off" | "approval" | "automatic"
  requestedCustomerFollowup: "off" | "approval" | "automatic"
  replyDetection: boolean
  timeZone: string
  historyAvailable: boolean
}

type Tone = "default" | "blue" | "green" | "amber" | "red"

function displayStatus(value: string | null) {
  const parsed = leadReviewSchema.safeParse({ status: value })
  return parsed.success ? leadReviewLabels[parsed.data.status] : (value || "Unknown").replace(/_/g, " ")
}

function when(value: string | null | undefined, timeZone: string) {
  if (!value) return ""
  return new Intl.DateTimeFormat("en-US", { timeZone, month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(value))
}

function describeJob(job: InquiryEmailJob, timeZone: string): { label: string; tone: Tone; detail?: string } {
  const reason = job.skip_reason ? skipReasonLabels[job.skip_reason] || job.skip_reason.replace(/_/g, " ") : undefined
  switch (job.status) {
    case "queued":
      return new Date(job.send_after).getTime() > Date.now()
        ? { label: `Scheduled · ${when(job.send_after, timeZone)}`, tone: "default" }
        : { label: "Queued", tone: "blue", detail: job.last_error || undefined }
    case "sending":
      return { label: "Sending", tone: "blue" }
    case "retry":
      return { label: `Retrying · next try ${when(job.send_after, timeZone)}`, tone: "amber", detail: job.last_error || undefined }
    case "awaiting_approval":
      return { label: "Waiting for your approval", tone: "amber" }
    case "accepted":
      return { label: `Accepted by Resend · ${when(job.provider_accepted_at, timeZone)}`, tone: "green", detail: job.last_error || "Delivery not confirmed yet." }
    case "delayed":
      return { label: "Delivery delayed", tone: "amber", detail: job.last_error || undefined }
    case "delivered":
      return { label: `Delivered · ${when(job.delivered_at, timeZone)}`, tone: "green", detail: "Reached the recipient’s mail server." }
    case "bounced":
      return { label: "Bounced", tone: "red", detail: job.last_error || undefined }
    case "complained":
      return { label: "Marked as spam", tone: "red" }
    case "failed":
      return { label: "Failed", tone: "red", detail: job.last_error || undefined }
    case "skipped":
      return { label: "Not sent", tone: "default", detail: reason }
    case "cancelled":
      return { label: "Cancelled", tone: "default", detail: reason }
    default:
      return { label: job.status, tone: "default" }
  }
}

function followupSummary(status: EmailSetupStatus) {
  if (status.customerFollowup === "off") return "Customer check-ins are off."
  if (status.customerFollowup === "automatic") return "Customer check-ins send automatically unless a reply, pause, opt-out, or bounce stops them."
  const why = status.requestedCustomerFollowup === "automatic" ? " Automatic sending stays off until reply detection is connected." : ""
  return `Customer check-ins wait for your approval, because replies to hello@mountline.dev aren’t visible here.${why}`
}

export function InquiryInbox({ inquiries, jobs, emailStatus, focusId }: { inquiries: InquiryLead[]; jobs: InquiryEmailJob[]; emailStatus: EmailSetupStatus; focusId?: string }) {
  const [filter, setFilter] = useState("all")
  const [query, setQuery] = useState("")
  const jobsByLead = new Map<string, InquiryEmailJob[]>()
  for (const job of jobs) jobsByLead.set(job.lead_id, [...(jobsByLead.get(job.lead_id) || []), job])
  const needsAttention = jobs.filter((job) => ["failed", "retry", "bounced", "complained"].includes(job.status)).length
  const awaitingApproval = jobs.filter((job) => job.status === "awaiting_approval").length

  const visible = inquiries.filter((inquiry) => {
    const matchesStatus = filter === "all" || inquiry.status === filter
    const matchesQuery = [inquiry.name, inquiry.business_name, inquiry.email, inquiry.phone, inquiry.message].some((value) => value?.toLowerCase().includes(query.trim().toLowerCase()))
    return matchesStatus && (!query.trim() || matchesQuery)
  })

  return (
    <SectionPanel title="Incoming inquiries" description="Business owners asking about Mountline. Read the request, reply, and record where it stands.">
      <div className="mb-4 space-y-3">
        {!emailStatus.historyAvailable ? (
          <StateNotice tone="warning" title="Email history isn’t available yet">
            Apply the migration <code>20260928120000_project_inquiry_email.sql</code> to Supabase. Until then, new inquiries can’t be saved from the website form.
          </StateNotice>
        ) : !emailStatus.canSend ? (
          <StateNotice tone="warning" title="Inquiries are being saved, but emails are not being sent">
            {emailStatus.missing.length ? <>Missing settings: {emailStatus.missing.join(", ")}. </> : null}
            {emailStatus.problems.length ? <>{emailStatus.problems.join(" ")} </> : null}
            Queued emails will send once this is fixed. See SETUP_FOR_LUKE.md.
          </StateNotice>
        ) : null}
        {emailStatus.canSend && emailStatus.problems.length ? <StateNotice tone="warning" title="Some email settings were ignored">{emailStatus.problems.join(" ")}</StateNotice> : null}
        <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/15 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
          <p className="text-muted-foreground">
            {needsAttention ? <strong className="font-medium text-foreground">{needsAttention} email{needsAttention === 1 ? "" : "s"} need attention. </strong> : null}
            {awaitingApproval ? <strong className="font-medium text-foreground">{awaitingApproval} check-in{awaitingApproval === 1 ? "" : "s"} waiting for approval. </strong> : null}
            {followupSummary(emailStatus)} Times are {emailStatus.timeZone}.
          </p>
          {emailStatus.historyAvailable ? <RunQueueButton disabled={!emailStatus.canSend} /> : null}
        </div>
      </div>
      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <label className="flex-1"><span className="sr-only">Search incoming inquiries</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search contact, business, or request" className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" /></label>
        <select aria-label="Filter inquiry review status" value={filter} onChange={(event) => setFilter(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm"><option value="all">All inquiry statuses</option>{leadReviewStatuses.map((status) => <option key={status} value={status}>{leadReviewLabels[status]}</option>)}</select>
      </div>
      <div className="space-y-3">{visible.map((inquiry) => <InquiryCard key={`${inquiry.id}:${inquiry.status}`} inquiry={inquiry} jobs={jobsByLead.get(inquiry.id) || []} emailStatus={emailStatus} focused={inquiry.id === focusId} />)}</div>
      {!visible.length ? <EmptyState title={inquiries.length ? "No inquiries match" : "No incoming inquiries"} icon={Inbox}>{inquiries.length ? "Try another search or review status." : "Project inquiries from the website form appear here."}</EmptyState> : null}
    </SectionPanel>
  )
}

function useAction() {
  const router = useRouter()
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState<string | null>(null)
  async function run(key: string, url: string, init: RequestInit, success: string) {
    if (pending) return
    setPending(key)
    setError(null)
    setDone(null)
    try {
      const response = await fetch(url, { ...init, headers: { "Content-Type": "application/json" } })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(data.error || "That didn’t save. Please try again.")
      setDone(success)
      router.refresh()
      return data
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "That didn’t save. Please try again.")
    } finally {
      setPending(null)
    }
  }
  return { pending, error, done, run }
}

function RunQueueButton({ disabled }: { disabled: boolean }) {
  const { pending, error, done, run } = useAction()
  return (
    <div className="flex shrink-0 flex-col items-start gap-1 sm:items-end">
      <button type="button" disabled={disabled || Boolean(pending)} onClick={() => run("queue", "/api/leads/email-queue", { method: "POST" }, "Due emails processed.")} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium hover:bg-muted disabled:opacity-50">
        {pending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
        {pending ? "Sending" : "Send due emails now"}
      </button>
      {error ? <p role="alert" className="text-xs text-error-foreground">{error}</p> : null}
      {done ? <p role="status" className="text-xs text-success-foreground">{done}</p> : null}
    </div>
  )
}

function InquiryCard({ inquiry, jobs, emailStatus, focused }: { inquiry: InquiryLead; jobs: InquiryEmailJob[]; emailStatus: EmailSetupStatus; focused: boolean }) {
  const router = useRouter()
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const [status, setStatus] = useState(inquiry.status || "new")
  const [savedStatus, setSavedStatus] = useState(inquiry.status || "new")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const website = safeBusinessWebsite(inquiry.current_website)
  const knownStatus = leadReviewSchema.safeParse({ status }).success
  const phoneHref = inquiry.phone?.replace(/[^+\d]/g, "")
  const interests = inquiry.interests?.length ? describeInterests(inquiry.interests) : inquiry.service_needed?.replace(/[-_]/g, " ") || "Not specified"
  const flagged = jobs.some((job) => ["failed", "retry", "bounced", "complained", "awaiting_approval"].includes(job.status))

  // Arriving from the owner email's link: open this inquiry and bring it into view.
  useEffect(() => {
    if (!focused || !detailsRef.current) return
    detailsRef.current.open = true
    detailsRef.current.scrollIntoView({ block: "start" })
  }, [focused])

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
    <details ref={detailsRef} id={`inquiry-${inquiry.id}`} className="group scroll-mt-24 rounded-lg border border-border bg-background/40">
      <summary className="cursor-pointer px-4 py-4 marker:text-muted-foreground">
        <span className="ml-1 inline-flex max-w-[90%] flex-wrap items-center gap-x-3 gap-y-2 align-middle"><strong className="break-words text-sm font-medium">{inquiry.business_name || inquiry.name || "Unnamed inquiry"}</strong><StatusBadge tone={savedStatus === "new" ? "blue" : savedStatus === "qualified" ? "green" : savedStatus === "closed" ? "default" : "amber"}>{displayStatus(savedStatus)}</StatusBadge>{flagged ? <StatusBadge tone="amber">Email needs a look</StatusBadge> : null}<span className="text-xs text-muted-foreground">{new Date(inquiry.created_at).toLocaleDateString()}</span><span className="text-xs text-muted-foreground group-open:hidden">Read request</span></span>
      </summary>
      <div className="space-y-5 border-t border-border p-4">
        <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm">
          <div><p className="mb-1 text-xs text-muted-foreground">Contact</p><p>{inquiry.name || "Name not supplied"}</p></div>
          <div><p className="mb-1 text-xs text-muted-foreground">Interested in</p><p>{interests}</p></div>
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
          <p className="text-xs text-muted-foreground">Choose “Contacted” after you reply; that starts the wait for the customer. “Closed” stops all follow-ups. Review status does not confirm a sale, payment, or client account.</p>
          {error ? <p role="alert" className="text-sm text-error-foreground">{error}</p> : null}
          {success ? <p role="status" className="text-sm text-success-foreground">Review status saved.</p> : null}
        </form>
        {emailStatus.historyAvailable ? <EmailPanel inquiry={inquiry} jobs={jobs} emailStatus={emailStatus} /> : null}
        <Link href={`/dashboard/clients/new?leadId=${inquiry.id}`} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs font-medium hover:bg-muted"><UserPlus className="size-3.5" /> Create client after qualification</Link>
      </div>
    </details>
  )
}

function EmailPanel({ inquiry, jobs, emailStatus }: { inquiry: InquiryLead; jobs: InquiryEmailJob[]; emailStatus: EmailSetupStatus }) {
  const { pending, error, done, run } = useAction()
  const tz = emailStatus.timeZone
  const paused = Boolean(inquiry.followup_paused_at)
  const repliedSinceContact = Boolean(inquiry.customer_replied_at && (!inquiry.contacted_at || inquiry.customer_replied_at >= inquiry.contacted_at))

  const jobAction = (job: InquiryEmailJob, action: "approve" | "skip" | "retry", label: string) =>
    run(`${job.id}:${action}`, `/api/leads/${inquiry.id}/emails/${job.id}`, { method: "POST", body: JSON.stringify({ action }) }, label)
  const followup = (action: "pause" | "resume" | "mark_replied", label: string) =>
    run(action, `/api/leads/${inquiry.id}/followup`, { method: "PATCH", body: JSON.stringify({ action }) }, label)

  const button = "inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2.5 text-xs font-medium hover:bg-muted disabled:opacity-50"
  const spinner = (key: string) => (pending === key ? <Loader2 className="size-3 animate-spin" /> : null)

  return (
    <section aria-label="Email" className="space-y-3">
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</h3>
      {jobs.length ? (
        <ul className="divide-y divide-border rounded-md border border-border">
          {jobs.map((job) => {
            const view = describeJob(job, tz)
            const canRetry = job.status === "failed" || job.status === "retry"
            const canSkip = job.status === "awaiting_approval" || (["queued", "retry"].includes(job.status) && job.kind !== "owner_notification" && job.kind !== "customer_acknowledgment")
            return (
              <li key={job.id} className="flex flex-col gap-2 px-3 py-2.5 text-sm sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <p className="font-medium">{emailKindLabels[job.kind] || job.kind}</p>
                  {view.detail ? <p className="mt-0.5 break-words text-xs text-muted-foreground">{view.detail}</p> : null}
                </div>
                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  <StatusBadge tone={view.tone}>{view.label}</StatusBadge>
                  {job.status === "awaiting_approval" ? <button type="button" className={button} disabled={Boolean(pending)} onClick={() => jobAction(job, "approve", "Check-in sent to the queue.")}>{spinner(`${job.id}:approve`)}Send check-in</button> : null}
                  {canSkip ? <button type="button" className={button} disabled={Boolean(pending)} onClick={() => jobAction(job, "skip", "Email cancelled.")}>{spinner(`${job.id}:skip`)}{job.status === "awaiting_approval" ? "Don’t send" : "Cancel"}</button> : null}
                  {canRetry ? <button type="button" className={button} disabled={Boolean(pending) || !emailStatus.canSend} onClick={() => jobAction(job, "retry", "Retry started.")}>{spinner(`${job.id}:retry`)}Retry now</button> : null}
                </div>
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">No emails recorded for this inquiry. Inquiries from before email was added have none.</p>
      )}
      <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
        {inquiry.email_suppressed_at ? <StatusBadge tone="red">{inquiry.email_suppressed_reason === "complained" ? "Marked us as spam" : "Address bounced"}</StatusBadge> : null}
        {inquiry.followup_opted_out_at ? <StatusBadge>Opted out of follow-ups</StatusBadge> : null}
        {repliedSinceContact ? <StatusBadge tone="green">Customer replied {when(inquiry.customer_replied_at, tz)}</StatusBadge> : null}
        <button type="button" className={button} disabled={Boolean(pending)} onClick={() => followup(paused ? "resume" : "pause", paused ? "Follow-ups resumed." : "Follow-ups paused.")}>{spinner(paused ? "resume" : "pause")}{paused ? "Resume follow-ups" : "Pause follow-ups"}</button>
        {inquiry.status === "contacted" && !repliedSinceContact ? <button type="button" className={button} disabled={Boolean(pending)} onClick={() => followup("mark_replied", "Recorded. No check-in will be sent.")}>{spinner("mark_replied")}Customer replied</button> : null}
        {paused ? <span>Reminders and check-ins are on hold.</span> : null}
      </div>
      {error ? <p role="alert" className="text-sm text-error-foreground">{error}</p> : null}
      {done ? <p role="status" className="text-sm text-success-foreground">{done}</p> : null}
    </section>
  )
}
