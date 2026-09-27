"use client"

import Link from "next/link"
import type { FormEvent, ReactNode } from "react"
import { ArrowRight, ArrowUpRight, Check, Loader2 } from "lucide-react"
import { Wordmark } from "@/components/brand/wordmark"
import { cn } from "@/lib/utils"

export type ProjectStatus =
  | "discovery"
  | "design"
  | "build"
  | "review"
  | "launch"
  | "support"
  | "completed"

export interface PortalProject {
  project_name: string
  package_type: string | null
  status: ProjectStatus
  start_date: string | null
  target_launch_date: string | null
  live_url: string | null
  preview_url: string | null
  payment_link: string | null
  billing_state: "not_sent" | "pending" | "waived" | "legacy_unverified"
  receipt_summary: {
    totals: Array<{ currency: string; amount_minor: number }>
    fully_paid: boolean
    partially_paid: boolean
  }
  accepted_payment_methods: string[] | null
  manual_payment_instructions: string | null
  invoice_amount: number | null
  invoice_label: string | null
  next_step: string | null
  client: {
    business_name: string
    contact_name: string
  } | null
}

export type PortalSupportMessage = {
  id: string
  created_at: string
  sender_type: "client" | "team" | "system"
  sender_name: string | null
  is_own: boolean
  message: string
}

export type PortalPayload = {
  project: PortalProject
  supportMessages: PortalSupportMessage[]
  viewer: {
    email: string | null
    isTeamMember: boolean
  }
}

const STAGES: { key: ProjectStatus; label: string }[] = [
  { key: "discovery", label: "Discovery" },
  { key: "design", label: "Design" },
  { key: "build", label: "Build" },
  { key: "review", label: "Review" },
  { key: "launch", label: "Launch" },
  { key: "support", label: "Support" },
]

function getStageIndex(status: ProjectStatus) {
  if (status === "completed") return STAGES.length - 1
  const index = STAGES.findIndex((stage) => stage.key === status)
  return index >= 0 ? index : 0
}

function formatDate(date: string | null) {
  if (!date) return null
  // A bare YYYY-MM-DD is a calendar date; parse it locally so it doesn't shift a day in US time zones.
  const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  const value = dateOnly ? new Date(Number(dateOnly[1]), Number(dateOnly[2]) - 1, Number(dateOnly[3])) : new Date(date)
  return value.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  })
}

function formatDateTime(date: string | null) {
  if (!date) return null
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function formatMoney(amount: number | null) {
  if (amount === null || amount === undefined) return null
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount)
}

function formatMoneyMinor(amountMinor: number, currency: string) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amountMinor / 100)
}

function getPaymentMethodLabel(method: string) {
  const labels: Record<string, string> = {
    stripe_card: "Stripe/card",
    crypto: "Crypto",
    cash: "Cash",
    check: "Check",
    bank_transfer: "Bank transfer",
    other: "Other",
  }

  return labels[method] || method
}

function getMessageLabel(item: PortalSupportMessage) {
  if (item.sender_type === "team") return "Mountline"
  if (item.sender_type === "system") return "System"
  if (item.is_own) return "You"
  return item.sender_name || "Client"
}

export function PortalView({
  payload,
  displayName,
  message,
  messageState,
  messageError,
  onMessageChange,
  onSubmit,
}: {
  payload: PortalPayload
  displayName: string
  message: string
  messageState: "idle" | "sending" | "sent" | "error"
  messageError: string | null
  onMessageChange: (value: string) => void
  onSubmit: (event: FormEvent) => void
}) {
  const project = payload.project
  const currentStage = getStageIndex(project.status)

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1120px] items-center justify-between gap-4 px-5 sm:px-8">
          <div className="flex min-w-0 items-center gap-4">
            <Link href="/" aria-label="Mountline home" className="shrink-0 text-foreground transition-opacity hover:opacity-75">
              <Wordmark size={17} />
            </Link>
            <span className="hidden h-4 w-px bg-border sm:block" aria-hidden="true" />
            <span className="ml-eyebrow hidden sm:block">Client portal</span>
          </div>
          <div className="min-w-0 text-right">
            <p className="truncate text-[13px] font-medium">{project.client?.business_name || project.project_name}</p>
            <p className="truncate text-xs text-muted-foreground">{displayName}</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1120px] px-5 pb-20 sm:px-8">
        <section className="pt-12 sm:pt-16 motion-safe:animate-[fade-up_700ms_cubic-bezier(0.16,1,0.3,1)_both]">
          <div className="flex flex-wrap items-center gap-3">
            <p className="ml-eyebrow">Project</p>
            <StatusBadge status={project.status} />
          </div>
          <h1 className="font-display mt-4 max-w-3xl text-balance text-[2.5rem] leading-[1.05] sm:text-[3.5rem]">
            {project.project_name}
          </h1>
          <p className="mt-4 max-w-xl text-[15px] leading-6 text-muted-foreground">
            A private view of progress, links, payments, and messages for this project.
          </p>
          <dl className="mt-10 grid grid-cols-1 border-y border-border sm:grid-cols-3">
            <InfoCell label="Package" value={project.package_type || "Custom"} />
            <InfoCell label="Started" value={formatDate(project.start_date) || "Not set"} />
            <InfoCell label="Target launch" value={formatDate(project.target_launch_date) || "Not set"} />
          </dl>
        </section>

        <PortalSection title="Progress" description="Where the project is right now.">
          <ol className="grid gap-0 sm:grid-cols-6">
            {STAGES.map((stage, index) => {
              const active = index === currentStage && project.status !== "completed"
              const complete = index < currentStage || project.status === "completed"
              return (
                <li key={stage.key} className="relative flex items-center gap-4 py-2.5 sm:block sm:py-0">
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute left-[5px] top-0 h-full w-px sm:left-0 sm:top-[5px] sm:h-px sm:w-full",
                      index === 0 && "top-1/2 h-1/2 sm:left-1/2 sm:top-[5px] sm:h-px sm:w-1/2",
                      index === STAGES.length - 1 && "h-1/2 sm:h-px sm:w-1/2",
                      complete || active ? "bg-foreground/60" : "bg-border",
                    )}
                  />
                  <span
                    aria-hidden="true"
                    className={cn(
                      "relative z-10 block size-[11px] shrink-0 rounded-full border sm:mx-auto",
                      complete && "border-foreground bg-foreground",
                      active && "border-mountline-amber bg-mountline-amber shadow-[0_0_0_4px_rgb(228_168_83/0.18)]",
                      !complete && !active && "border-border-strong bg-background",
                    )}
                  />
                  <span className="sm:mt-4 sm:block sm:text-center">
                    <span className={cn("block text-sm", active ? "font-medium text-foreground" : complete ? "text-foreground" : "text-muted-foreground")}>
                      {stage.label}
                    </span>
                    <span className="ml-eyebrow mt-0.5 block sm:mt-1">
                      {complete ? "Done" : active ? "Current" : String(index + 1).padStart(2, "0")}
                    </span>
                  </span>
                </li>
              )
            })}
          </ol>
        </PortalSection>

        <div className="grid gap-x-12 lg:grid-cols-2">
          <PortalSection title="Next step">
            <p className="font-display text-[1.45rem] leading-[1.35]">
              {project.next_step || "Nothing is needed from you right now. We’ll post the next confirmed step here."}
            </p>
          </PortalSection>

          <PortalSection title="Payment">
            <PaymentPanel project={project} />
          </PortalSection>
        </div>

        <PortalSection title="Links">
          <div className="border-b border-border">
            <ProjectLinkRow title="Preview" href={project.preview_url} emptyText="No preview link yet" />
            <ProjectLinkRow title="Live site" href={project.live_url} emptyText="Not live yet" />
          </div>
        </PortalSection>

        <PortalSection title="Messages" description="Send a note to Mountline about this project.">
          <div className="space-y-3">
            {payload.supportMessages.length > 0 ? (
              payload.supportMessages.map((item) => {
                const ownMessage = item.sender_type === "client" && item.is_own
                const teamMessage = item.sender_type === "team"

                return (
                  <div key={item.id} className={cn("flex", ownMessage ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[88%] rounded-lg border px-4 py-3.5 sm:max-w-[72%]",
                        ownMessage ? "border-border bg-surface-muted" : "border-border bg-card",
                        teamMessage && "border-l-2 border-l-mountline-amber",
                      )}
                    >
                      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                        <p className="ml-eyebrow text-foreground">{getMessageLabel(item)}</p>
                        <p className="text-xs text-muted-foreground">{formatDateTime(item.created_at)}</p>
                      </div>
                      <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/85">{item.message}</p>
                    </div>
                  </div>
                )
              })
            ) : (
              <p className="rounded-lg border border-dashed border-border px-4 py-8 text-center text-sm text-muted-foreground">
                No messages yet.
              </p>
            )}
          </div>

          <form onSubmit={onSubmit} className="mt-6">
            <label htmlFor="portal-message" className="sr-only">Message</label>
            <textarea
              id="portal-message"
              value={message}
              onChange={(e) => onMessageChange(e.target.value)}
              rows={4}
              className="ml-field-input resize-y"
              placeholder="Write a project question or support request…"
            />
            <div className="mt-3 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div aria-live="polite" className="min-h-5 text-sm">
                {messageState === "error" && messageError && <p className="text-error-foreground">{messageError}</p>}
                {messageState === "sent" && (
                  <p className="text-muted-foreground">Message saved. This doesn’t confirm an email or notification was delivered.</p>
                )}
              </div>
              <button
                type="submit"
                disabled={messageState === "sending" || !message.trim()}
                className="ml-pill ml-pill-solid shrink-0"
              >
                {messageState === "sending" ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
                {messageState === "sending" ? "Sending" : "Send message"}
                {messageState === "sending" ? null : <ArrowRight aria-hidden="true" />}
              </button>
            </div>
          </form>
        </PortalSection>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-[1120px] items-center justify-between gap-4 px-5 py-5 text-[13px] text-muted-foreground sm:px-8">
          <span>Mountline · Client portal</span>
          <a href="mailto:hello@mountline.dev" className="transition-colors hover:text-foreground">hello@mountline.dev</a>
        </div>
      </footer>
    </div>
  )
}


function PortalSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="mt-14 border-t border-border pt-6 sm:mt-16">
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <h2 className="ml-eyebrow text-foreground">{title}</h2>
        {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      </div>
      {children}
    </section>
  )
}

function PaymentPanel({ project }: { project: PortalProject }) {
  const methods = Array.isArray(project.accepted_payment_methods)
    ? project.accepted_payment_methods
    : []
  const manualMethods = methods.filter((method) => method !== "stripe_card")
  const hasCardPayment = methods.includes("stripe_card") && Boolean(project.payment_link)
  const hasManualPayment = manualMethods.length > 0
  const amount = formatMoney(project.invoice_amount)

  if (project.receipt_summary.fully_paid) {
    return (
      <div className="space-y-3">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-success-foreground">
          <Check className="size-4" aria-hidden="true" />
          Verified receipts cover the invoice
        </p>
        <p className="text-sm text-muted-foreground">
          {project.invoice_label || "This project invoice"} is supported by recorded receipt evidence.
        </p>
      </div>
    )
  }

  if (project.receipt_summary.totals.length > 0) {
    return (
      <div className="space-y-3">
        <p className="inline-flex items-center gap-2 text-sm font-medium text-information-foreground">
          <Check className="size-4" aria-hidden="true" />
          {project.receipt_summary.partially_paid ? "Partial receipt recorded" : "Receipt recorded"}
        </p>
        <p className="text-sm text-muted-foreground">
          {project.receipt_summary.totals.map((total) => formatMoneyMinor(total.amount_minor, total.currency)).join(" · ")}
        </p>
      </div>
    )
  }

  if (project.billing_state === "legacy_unverified") {
    return <p className="text-sm text-muted-foreground">A legacy payment status needs receipt reconciliation before it can be shown as paid.</p>
  }

  if (project.billing_state === "waived") {
    return <p className="text-sm text-muted-foreground">No payment due right now.</p>
  }

  if (project.billing_state === "not_sent" && !hasCardPayment && !hasManualPayment && !amount) {
    return <p className="text-sm text-muted-foreground">No payment due right now.</p>
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-1 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="ml-eyebrow">{project.billing_state === "pending" ? "Payment pending" : "Payment"}</p>
          <p className="mt-1.5 text-[15px] font-medium">{project.invoice_label || "Project invoice"}</p>
        </div>
        {amount && <p className="font-display text-[2rem] leading-none tabular-nums">{amount}</p>}
      </div>

      {hasCardPayment && (
        <a
          href={project.payment_link!}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-pill ml-pill-solid"
        >
          Pay by card
          <ArrowUpRight aria-hidden="true" />
        </a>
      )}

      {hasManualPayment && (
        <div className="space-y-3">
          <p className="ml-eyebrow">Other ways to pay</p>
          <div className="flex flex-wrap gap-2">
            {manualMethods.map((method) => (
              <span
                key={method}
                className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground"
              >
                {getPaymentMethodLabel(method)}
              </span>
            ))}
          </div>
          {project.manual_payment_instructions && (
            <p className="whitespace-pre-wrap rounded-lg border border-border bg-surface-muted p-4 text-sm leading-6 text-muted-foreground">
              {project.manual_payment_instructions}
            </p>
          )}
        </div>
      )}

      {!hasCardPayment && !hasManualPayment && (
        <p className="text-sm text-muted-foreground">No payment due right now.</p>
      )}
    </div>
  )
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 font-mono text-[11px] uppercase tracking-[0.08em] text-foreground">
      <span className="size-1.5 rounded-full bg-mountline-amber" aria-hidden="true" />
      {status}
    </span>
  )
}

function InfoCell({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-t border-border py-4 first:border-t-0 sm:block sm:border-l sm:border-t-0 sm:px-6 sm:first:border-l-0 sm:first:pl-0">
      <dt className="ml-eyebrow">{label}</dt>
      <dd className="text-[15px] sm:mt-2">{value}</dd>
    </div>
  )
}

function ProjectLinkRow({ title, href, emptyText }: { title: string; href: string | null; emptyText: string }) {
  if (!href) {
    return (
      <div className="flex items-center justify-between gap-4 border-t border-border py-4">
        <span className="text-[15px]">{title}</span>
        <span className="text-sm text-muted-foreground">{emptyText}</span>
      </div>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-center justify-between gap-4 border-t border-border py-4"
    >
      <span className="text-[15px]">{title}</span>
      <span className="inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors group-hover:text-foreground">
        Open
        <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" aria-hidden="true" />
      </span>
    </a>
  )
}
