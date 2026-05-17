"use client"

import { useEffect, useMemo, useState } from "react"
import type { FormEvent, ReactNode } from "react"
import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import {
  ArrowRight,
  CheckCircle2,
  Circle,
  CreditCard,
  ExternalLink,
  Eye,
  FileText,
  Loader2,
  Lock,
  MessageSquare,
  Send,
} from "lucide-react"
import { NorthlineLogo } from "@/components/northline-logo"
import type { SupportMessage } from "@/lib/supabase/types"

type ProjectStatus =
  | "discovery"
  | "design"
  | "build"
  | "review"
  | "launch"
  | "support"
  | "completed"

interface PortalProject {
  id: string
  project_name: string
  package_type: string | null
  status: ProjectStatus
  start_date: string | null
  target_launch_date: string | null
  live_url: string | null
  preview_url: string | null
  payment_link: string | null
  next_step: string | null
  notes: string | null
  client: {
    business_name: string
    contact_name: string
    email: string
  } | null
}

type PortalPayload = {
  project: PortalProject
  supportMessages: SupportMessage[]
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
  return new Date(date).toLocaleDateString(undefined, {
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

function getMessageLabel(item: SupportMessage, viewerEmail: string | null) {
  if (item.sender_type === "team") return "Mountline"
  if (item.sender_type === "system") return "System"
  if (viewerEmail && item.sender_email?.toLowerCase() === viewerEmail.toLowerCase()) {
    return "You"
  }
  return item.sender_name || "Client"
}

export default function PortalPage() {
  const { portalId } = useParams<{ portalId: string }>()
  const { user, isLoaded } = useUser()
  const [payload, setPayload] = useState<PortalPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [messageState, setMessageState] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [messageError, setMessageError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !portalId) return

    async function fetchPortal() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/portal/${portalId}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Unable to load this portal.")
          return
        }

        setPayload(data)
      } catch {
        setError("Unable to load this portal.")
      } finally {
        setLoading(false)
      }
    }

    fetchPortal()
  }, [isLoaded, portalId])

  const project = payload?.project
  const currentStage = useMemo(
    () => (project ? getStageIndex(project.status) : 0),
    [project],
  )

  async function handleSendMessage(e: FormEvent) {
    e.preventDefault()
    if (!message.trim() || !portalId) return

    setMessageState("sending")
    setMessageError(null)

    try {
      const res = await fetch(`/api/portal/${portalId}/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessageState("error")
        setMessageError(data.error || "Message could not be sent.")
        return
      }

      setPayload((current) =>
        current
          ? {
              ...current,
              supportMessages: [...current.supportMessages, data.message],
            }
          : current,
      )
      setMessage("")
      setMessageState("sent")
    } catch {
      setMessageState("error")
      setMessageError("Message could not be sent.")
    }
  }

  if (!isLoaded || loading) {
    return <PortalState icon={<Loader2 className="w-6 h-6 animate-spin" />} title="Loading portal" />
  }

  if (error || !project) {
    return (
      <PortalState
        icon={<Lock className="w-6 h-6" />}
        title={error?.includes("access") ? "Access denied" : "Portal unavailable"}
        body={error || "This portal link may be invalid or expired."}
      />
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 border-b border-border bg-background/85 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <NorthlineLogo size="sm" showWordmark />
          <div className="text-right min-w-0">
            <p className="text-sm font-medium truncate">
              {project.client?.business_name || project.project_name}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user?.firstName || payload.viewer.email || "Client portal"}
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-8">
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid gap-6 lg:grid-cols-[1.4fr_0.8fr]"
        >
          <div className="space-y-4">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Client portal
            </p>
            <div>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight">
                {project.project_name}
              </h1>
              <p className="text-base sm:text-lg text-muted-foreground mt-3 max-w-2xl">
                A private project view for progress, key links, payments, and support.
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 space-y-4">
            <StatusBadge status={project.status} />
            <InfoRow label="Package" value={project.package_type || "Custom"} />
            <InfoRow label="Started" value={formatDate(project.start_date) || "Not set"} />
            <InfoRow label="Target launch" value={formatDate(project.target_launch_date) || "Not set"} />
          </div>
        </motion.section>

        <section className="rounded-xl border border-border bg-card p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4 mb-7">
            <div>
              <h2 className="text-lg font-semibold">Timeline</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Current project phase and launch path.
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-6">
            {STAGES.map((stage, index) => {
              const active = index === currentStage && project.status !== "completed"
              const complete = index < currentStage || project.status === "completed"

              return (
                <div
                  key={stage.key}
                  className={`rounded-lg border p-4 ${
                    active
                      ? "border-blue-500/50 bg-blue-500/10"
                      : complete
                        ? "border-border bg-foreground/5"
                        : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {complete ? (
                      <CheckCircle2 className="w-4 h-4 text-blue-400" />
                    ) : active ? (
                      <Circle className="w-4 h-4 fill-blue-400 text-blue-400" />
                    ) : (
                      <Circle className="w-4 h-4 text-muted-foreground" />
                    )}
                    <span className="text-xs text-muted-foreground">{index + 1}</span>
                  </div>
                  <p className="text-sm font-medium">{stage.label}</p>
                </div>
              )
            })}
          </div>
        </section>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <FileText className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Next step</h2>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {project.next_step || project.notes || "No next step has been posted yet. Mountline will update this when there is a clear action or milestone."}
            </p>
          </section>

          <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-4">
              <CreditCard className="w-5 h-5 text-muted-foreground" />
              <h2 className="font-semibold">Payment</h2>
            </div>
            {project.payment_link ? (
              <a
                href={project.payment_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
              >
                Pay invoice
                <ArrowRight className="w-4 h-4" />
              </a>
            ) : (
              <p className="text-sm text-muted-foreground">
                No payment due right now.
              </p>
            )}
          </section>
        </div>

        <section className="grid gap-4 sm:grid-cols-2">
          <ProjectLinkCard
            icon={<Eye className="w-5 h-5" />}
            title="Preview"
            href={project.preview_url}
            emptyText="No preview link yet"
          />
          <ProjectLinkCard
            icon={<ExternalLink className="w-5 h-5" />}
            title="Live site"
            href={project.live_url}
            emptyText="No live site yet"
          />
        </section>

        <section className="rounded-xl border border-border bg-card p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <MessageSquare className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="font-semibold">Support messages</h2>
              <p className="text-sm text-muted-foreground">
                Send a simple note to Mountline about this project.
              </p>
            </div>
          </div>

          <div className="space-y-3 mb-5">
            {payload.supportMessages.length > 0 ? (
              payload.supportMessages.map((item) => {
                const ownMessage =
                  item.sender_type === "client" &&
                  payload.viewer.email &&
                  item.sender_email?.toLowerCase() === payload.viewer.email.toLowerCase()
                const teamMessage = item.sender_type === "team"

                return (
                  <div
                    key={item.id}
                    className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] rounded-2xl border p-4 ${
                        teamMessage
                          ? "border-blue-500/25 bg-blue-500/10"
                          : ownMessage
                            ? "border-foreground/20 bg-foreground text-background"
                            : "border-border bg-background"
                      }`}
                    >
                      <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                        <p className={`text-sm font-medium ${ownMessage ? "text-background" : "text-foreground"}`}>
                          {getMessageLabel(item, payload.viewer.email)}
                        </p>
                        <p className={`text-xs ${ownMessage ? "text-background/70" : "text-muted-foreground"}`}>
                          {formatDateTime(item.created_at)}
                        </p>
                      </div>
                      <p className={`whitespace-pre-wrap text-sm leading-relaxed ${ownMessage ? "text-background/85" : "text-muted-foreground"}`}>
                        {item.message}
                      </p>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="rounded-lg border border-dashed border-border p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No support messages yet.
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSendMessage} className="space-y-3">
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value)
                if (messageState !== "sending") {
                  setMessageState("idle")
                  setMessageError(null)
                }
              }}
              rows={4}
              className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              placeholder="Write a project question or support request..."
            />
            {messageState === "error" && messageError && (
              <p className="text-sm text-red-400">{messageError}</p>
            )}
            {messageState === "sent" && (
              <p className="text-sm text-green-400">Message sent.</p>
            )}
            <button
              type="submit"
              disabled={messageState === "sending" || !message.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
            >
              {messageState === "sending" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-4 h-4" />
              )}
              Send message
            </button>
          </form>
        </section>

        <footer className="pt-2 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by Mountline Studio
          </p>
        </footer>
      </main>
    </div>
  )
}

function PortalState({
  icon,
  title,
  body,
}: {
  icon: ReactNode
  title: string
  body?: string
}) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center space-y-5">
        <NorthlineLogo size="md" showWordmark className="justify-center" />
        <div className="mx-auto w-12 h-12 rounded-full border border-border bg-card flex items-center justify-center text-muted-foreground">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          {body && <p className="text-sm text-muted-foreground mt-2">{body}</p>}
        </div>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground mb-1">Current status</p>
      <span className="inline-flex rounded-full bg-blue-500/10 px-3 py-1 text-sm font-medium capitalize text-blue-300 ring-1 ring-blue-500/20">
        {status}
      </span>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 border-t border-border pt-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  )
}

function ProjectLinkCard({
  icon,
  title,
  href,
  emptyText,
}: {
  icon: ReactNode
  title: string
  href: string | null
  emptyText: string
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-3 mb-3 text-muted-foreground">
        {icon}
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline underline-offset-4"
        >
          Open link
          <ExternalLink className="w-4 h-4" />
        </a>
      ) : (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      )}
    </div>
  )
}
