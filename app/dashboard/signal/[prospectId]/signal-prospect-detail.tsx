"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Loader2,
  Mail,
  Phone,
  RadioTower,
  ShieldAlert,
  Sparkles,
} from "lucide-react"
import { getSignalPlaybook, MEDICAL_COMPLIANCE_WARNING } from "@/lib/signal/playbooks"
import type {
  SignalAlert,
  SignalAnalysis,
  SignalOutreachDraft,
  SignalProspect,
} from "@/lib/supabase/types"

type WorkingAction =
  | "scan"
  | "initial"
  | "deep"
  | "contacted"
  | "awaiting"
  | "demo"
  | "interested"
  | "followup"
  | "suppress"
  | "convert"
  | null

const statusLabels: Record<string, string> = {
  researched: "Researched",
  needs_review: "Needs review",
  ready_to_contact: "Ready to contact",
  contacted: "Contacted",
  awaiting_reply: "Awaiting reply",
  permission_to_send_demo: "Permission to send demo",
  demo_sent: "Demo sent",
  interested: "Interested",
  discovery_call: "Discovery call",
  proposal_sent: "Proposal sent",
  won: "Won",
  lost: "Lost",
  no_response: "No response",
  do_not_contact: "Do not contact",
}

const modeLabels: Record<string, string> = {
  local_student: "Local student",
  professional_studio: "Professional studio",
  warm_connection: "Warm connection",
}

const channelLabels: Record<string, string> = {
  call: "Call",
  email: "Email",
  instagram: "Instagram",
  contact_form: "Contact form",
  warm_intro: "Warm intro",
  research_more: "Research more",
}

function arrayFromJson(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function formatDateTime(value: string | null | undefined) {
  if (!value) return "-"
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

function getScan(analysis: SignalAnalysis | null) {
  const signals = analysis?.website_signals
  if (!signals || typeof signals !== "object") return null
  if ("scan" in signals && signals.scan && typeof signals.scan === "object") {
    return signals.scan as Record<string, unknown>
  }
  return signals as Record<string, unknown>
}

function evidenceFromAnalysis(analysis: SignalAnalysis | null) {
  const evidence = analysis?.evidence
  if (Array.isArray(evidence)) return evidence as Array<Record<string, unknown>>
  if (evidence && typeof evidence === "object" && "website" in evidence && Array.isArray(evidence.website)) {
    return evidence.website as Array<Record<string, unknown>>
  }
  return []
}

function scoreColor(value: number | null | undefined, inverse = false) {
  if (typeof value !== "number") return "bg-muted"
  const good = inverse ? value <= 30 : value >= 75
  const medium = inverse ? value <= 60 : value >= 55
  if (good) return "bg-green-400"
  if (medium) return "bg-yellow-400"
  return "bg-red-400"
}

export function SignalProspectDetail({
  alerts,
  analyses,
  drafts,
  prospect,
  suppressed,
}: {
  alerts: SignalAlert[]
  analyses: SignalAnalysis[]
  drafts: SignalOutreachDraft[]
  prospect: SignalProspect
  suppressed: boolean
}) {
  const router = useRouter()
  const latestAnalysis = useMemo(
    () => analyses.find((analysis) => analysis.overall_opportunity_score !== null) || analyses[0] || null,
    [analyses],
  )
  const latestScanAnalysis = useMemo(
    () => analyses.find((analysis) => analysis.website_signals) || latestAnalysis,
    [analyses, latestAnalysis],
  )
  const latestDraft = drafts[0] || null
  const unreadAlert = alerts.find((alert) => !alert.read_at)
  const playbook = getSignalPlaybook(prospect.industry_playbook)
  const scan = getScan(latestScanAnalysis)
  const evidence = evidenceFromAnalysis(latestScanAnalysis)
  const [working, setWorking] = useState<WorkingAction>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [followUpDate, setFollowUpDate] = useState(prospect.follow_up_date || "")

  const doNotContact = prospect.outreach_status === "do_not_contact" || suppressed

  const runAction = async (action: WorkingAction, path: string, body?: Record<string, unknown>) => {
    setWorking(action)
    setError(null)
    setMessage(null)

    try {
      const response = await fetch(path, {
        method: body ? "PATCH" : "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body: body ? JSON.stringify(body) : undefined,
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || "Signal action failed.")
        return
      }

      setMessage(
        data.ai_unavailable
          ? "Action complete. AI analysis unavailable; rule-based score shown."
          : "Action complete.",
      )
      router.refresh()
    } catch {
      setError("Signal action failed.")
    } finally {
      setWorking(null)
    }
  }

  const updateStatus = (status: string, action: WorkingAction) => {
    runAction(action, `/api/signal/prospects/${prospect.id}`, { outreach_status: status })
  }

  const copyText = async (text: string | null | undefined, label: string) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setMessage(`${label} copied.`)
  }

  const suppress = async () => {
    if (!window.confirm("Add this business to Signal do-not-contact?")) return
    setWorking("suppress")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/suppress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: "Marked from Signal prospect detail" }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Could not add to do-not-contact.")
        return
      }
      setMessage("Prospect added to do-not-contact.")
      router.refresh()
    } catch {
      setError("Could not add to do-not-contact.")
    } finally {
      setWorking(null)
    }
  }

  const convert = async () => {
    if (!window.confirm("Create an existing lead from this Signal prospect?")) return
    setWorking("convert")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/convert`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirm: true }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Lead could not be created.")
        return
      }
      setMessage("Existing lead created from Signal prospect.")
      router.refresh()
    } catch {
      setError("Lead could not be created.")
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/signal" className="rounded-lg p-2 transition-colors hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Mountline Signal
          </p>
          <h1 className="truncate text-2xl font-bold tracking-tight">{prospect.business_name}</h1>
          <p className="text-sm text-muted-foreground">
            {playbook.name} · {statusLabels[prospect.outreach_status] || prospect.outreach_status}
          </p>
        </div>
      </div>

      {(message || error) && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            error
              ? "border-red-500/25 bg-red-500/10 text-red-300"
              : "border-green-500/25 bg-green-500/10 text-green-300"
          }`}
        >
          {error || message}
        </div>
      )}

      {unreadAlert && (
        <div className="rounded-xl border border-green-500/25 bg-green-500/10 p-4 text-sm text-green-200">
          <div className="flex items-start gap-3">
            <RadioTower className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">High-Fit Prospect</p>
              <p className="mt-1 text-green-200/80">{unreadAlert.message}</p>
            </div>
          </div>
        </div>
      )}

      {(prospect.compliance_tier === "compliance_gated" || latestAnalysis?.compliance_warning) && (
        <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/10 p-4 text-sm text-yellow-100">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <p>{latestAnalysis?.compliance_warning || MEDICAL_COMPLIANCE_WARNING}</p>
          </div>
        </div>
      )}

      {doNotContact && (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-200">
          This prospect is on the Signal do-not-contact list. Outreach drafts and contact-ready actions should stay disabled unless the team intentionally re-enables the record.
        </div>
      )}

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Prospect Summary">
          <div className="grid gap-4 sm:grid-cols-2">
            <Meta label="Industry" value={prospect.industry} />
            <Meta label="Playbook" value={playbook.name} />
            <Meta label="Location" value={[prospect.city, prospect.state].filter(Boolean).join(", ") || "-"} />
            <Meta label="Locality" value={prospect.locality_relationship || "-"} />
            <Meta label="Priority" value={latestAnalysis?.priority || "-"} />
            <Meta label="Overall Score" value={latestAnalysis?.overall_opportunity_score?.toString() || "-"} />
            <Meta label="Value Band" value={latestAnalysis?.potential_project_value_band || "-"} />
            <Meta label="Confidence" value={latestAnalysis?.confidence || "-"} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2 text-sm">
            {prospect.website_url && <ContactLink href={prospect.website_url} icon="site" label="Website" />}
            {prospect.public_email && <ContactLink href={`mailto:${prospect.public_email}`} icon="mail" label={prospect.public_email} />}
            {prospect.public_phone && <ContactLink href={`tel:${prospect.public_phone}`} icon="phone" label={prospect.public_phone} />}
            {prospect.public_contact_form_url && <ContactLink href={prospect.public_contact_form_url} icon="site" label="Contact form" />}
          </div>
        </Panel>

        <Panel title="Actions">
          <div className="grid gap-2 sm:grid-cols-2">
            <ActionButton working={working === "scan"} onClick={() => runAction("scan", `/api/signal/prospects/${prospect.id}/scan`)}>
              <RadioTower className="h-4 w-4" />
              Scan Website
            </ActionButton>
            <ActionButton disabled={doNotContact} working={working === "initial"} onClick={() => runAction("initial", `/api/signal/prospects/${prospect.id}/initial`)}>
              <Sparkles className="h-4 w-4" />
              Run Initial Analysis
            </ActionButton>
            <ActionButton disabled={doNotContact} working={working === "deep"} onClick={() => runAction("deep", `/api/signal/prospects/${prospect.id}/deep-dive`)}>
              <Sparkles className="h-4 w-4" />
              Run Deep Dive
            </ActionButton>
            <ActionButton disabled={doNotContact} working={working === "contacted"} onClick={() => updateStatus("contacted", "contacted")}>
              <CheckCircle2 className="h-4 w-4" />
              Mark Contacted
            </ActionButton>
            <ActionButton disabled={doNotContact} working={working === "awaiting"} onClick={() => updateStatus("awaiting_reply", "awaiting")}>
              <Mail className="h-4 w-4" />
              Awaiting Reply
            </ActionButton>
            <ActionButton disabled={doNotContact} working={working === "demo"} onClick={() => updateStatus("demo_sent", "demo")}>
              <ExternalLink className="h-4 w-4" />
              Mark Demo Sent
            </ActionButton>
            <ActionButton disabled={doNotContact} working={working === "interested"} onClick={() => updateStatus("interested", "interested")}>
              <CheckCircle2 className="h-4 w-4" />
              Mark Interested
            </ActionButton>
            <ActionButton disabled={doNotContact} working={working === "convert"} onClick={convert}>
              <CheckCircle2 className="h-4 w-4" />
              Convert to Lead
            </ActionButton>
          </div>
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              type="date"
              value={followUpDate}
              onChange={(event) => setFollowUpDate(event.target.value)}
              className="h-9 rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
            />
            <button
              type="button"
              disabled={working === "followup"}
              onClick={() => runAction("followup", `/api/signal/prospects/${prospect.id}`, { follow_up_date: followUpDate || null })}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              {working === "followup" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Calendar className="h-4 w-4" />}
              Set Follow-Up
            </button>
          </div>
          <button
            type="button"
            disabled={working === "suppress"}
            onClick={suppress}
            className="mt-3 inline-flex h-9 w-full items-center justify-center gap-2 rounded-lg border border-red-500/25 px-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
          >
            {working === "suppress" ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertTriangle className="h-4 w-4" />}
            Add to Do Not Contact
          </button>
        </Panel>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Research and Evidence">
          <TextBlock label="Human notes" value={prospect.human_notes} />
          <TextBlock label="What looks good" value={prospect.what_looks_good} />
          <TextBlock label="Visible problem" value={prospect.visible_problem} />
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Website scan</p>
            <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <Meta label="Title" value={String(scan?.page_title || "-")} />
              <Meta label="Platform" value={String(scan?.detected_website_platform || prospect.existing_website_platform || "-")} />
              <Meta label="Booking" value={String(scan?.detected_booking_platform || prospect.existing_booking_platform || "-")} />
              <Meta label="Scanned" value={formatDateTime(String(scan?.scanned_at || latestScanAnalysis?.created_at || ""))} />
            </div>
            <div className="mt-3 space-y-2">
              {evidence.slice(0, 8).map((item, index) => (
                <div key={index} className="rounded-md border border-border bg-background/50 p-2 text-xs text-muted-foreground">
                  <span className="text-foreground">{String(item.signal || "Evidence")}:</span>{" "}
                  {String(item.snippet || "")}
                </div>
              ))}
              {evidence.length === 0 && (
                <p className="text-sm text-muted-foreground">No website evidence stored yet.</p>
              )}
            </div>
          </div>
        </Panel>

        <Panel title="Score Breakdown">
          <Score label="Website quality" value={latestAnalysis?.website_quality_score} />
          <Score label="Business viability" value={latestAnalysis?.business_viability_score} />
          <Score label="Operational opportunity" value={latestAnalysis?.operational_opportunity_score} />
          <Score label="Website service fit" value={latestAnalysis?.website_service_fit_score} />
          <Score label="AI workflow fit" value={latestAnalysis?.ai_workflow_fit_score} />
          <Score label="Reachability" value={latestAnalysis?.reachability_score} />
          <Score label="Compliance risk" value={latestAnalysis?.compliance_risk_score} inverse />
          <Score label="Total opportunity" value={latestAnalysis?.overall_opportunity_score} />
        </Panel>
      </section>

      <Panel title="Offer Strategy">
        <div className="grid gap-4 lg:grid-cols-2">
          <TextBlock label="Recommended primary offer" value={latestAnalysis?.recommended_primary_offer} />
          <TextBlock label="Recommended secondary offer" value={latestAnalysis?.recommended_secondary_offer} />
          <TextBlock label="Relevant demo" value={latestAnalysis?.recommended_demo || prospect.relevant_demo} />
          <TextBlock label="Commercial fit" value={latestAnalysis?.commercial_fit} />
          <TextBlock label="Value reasoning" value={latestAnalysis?.potential_project_value_reason} />
          <TextBlock label="What not to pitch" value={arrayFromJson(latestAnalysis?.red_flags).join("\n") || latestAnalysis?.compliance_warning} />
        </div>
      </Panel>

      <Panel title="Outreach Cockpit">
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Meta label="Selected mode" value={modeLabels[prospect.outreach_mode] || prospect.outreach_mode} />
          <Meta label="Recommended channel" value={latestAnalysis?.suggested_channel ? channelLabels[latestAnalysis.suggested_channel] : "-"} />
          <Meta label="Draft created" value={formatDateTime(latestDraft?.created_at)} />
        </div>
        {latestDraft ? (
          <div className="grid gap-4 xl:grid-cols-2">
            <DraftBlock title="Email Draft" value={latestDraft.first_contact_email} onCopy={() => copyText(latestDraft.first_contact_email, "Email draft")} />
            <DraftBlock title="DM Draft" value={latestDraft.permission_based_dm} onCopy={() => copyText(latestDraft.permission_based_dm, "DM draft")} />
            <DraftBlock title="Call Opener" value={latestDraft.owner_call_opener} onCopy={() => copyText(latestDraft.owner_call_opener, "Call opener")} />
            <DraftBlock title="Gatekeeper Script" value={latestDraft.gatekeeper_script} onCopy={() => copyText(latestDraft.gatekeeper_script, "Gatekeeper script")} />
            <DraftBlock title="Voicemail" value={latestDraft.voicemail_script} onCopy={() => copyText(latestDraft.voicemail_script, "Voicemail script")} />
            <DraftBlock title="Demo Follow-Up" value={latestDraft.demo_send_followup} onCopy={() => copyText(latestDraft.demo_send_followup, "Demo follow-up")} />
            <DraftBlock title="Proposal Angle" value={latestDraft.proposal_angle} onCopy={() => copyText(latestDraft.proposal_angle, "Proposal angle")} />
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="mb-2 text-sm font-medium">Discovery Questions</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {arrayFromJson(latestDraft.discovery_call_questions).map((question) => (
                  <li key={question}>• {question}</li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Run a deep dive to generate draft-only outreach scripts for manual review.
          </p>
        )}
      </Panel>
    </div>
  )
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="mb-4 font-semibold">{title}</h2>
      {children}
    </section>
  )
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm text-foreground">{value || "-"}</p>
    </div>
  )
}

function TextBlock({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 whitespace-pre-wrap text-sm text-foreground">{value}</p>
    </div>
  )
}

function ContactLink({ href, icon, label }: { href: string; icon: "site" | "mail" | "phone"; label: string }) {
  const normalizedHref = href.startsWith("http") || href.startsWith("mailto:") || href.startsWith("tel:")
    ? href
    : `https://${href}`
  const Icon = icon === "mail" ? Mail : icon === "phone" ? Phone : ExternalLink

  return (
    <a
      href={normalizedHref}
      target={normalizedHref.startsWith("http") ? "_blank" : undefined}
      rel={normalizedHref.startsWith("http") ? "noreferrer" : undefined}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </a>
  )
}

function ActionButton({
  children,
  disabled,
  onClick,
  working,
}: {
  children: React.ReactNode
  disabled?: boolean
  onClick: () => void
  working: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled || working}
      onClick={onClick}
      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:cursor-not-allowed disabled:opacity-50"
    >
      {working ? <Loader2 className="h-4 w-4 animate-spin" /> : children}
    </button>
  )
}

function Score({ inverse, label, value }: { inverse?: boolean; label: string; value: number | null | undefined }) {
  const width = typeof value === "number" ? `${Math.max(0, Math.min(100, value))}%` : "0%"
  return (
    <div className="mb-4 last:mb-0">
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span className="font-mono">{value ?? "-"}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className={`h-full ${scoreColor(value, inverse)}`} style={{ width }} />
      </div>
    </div>
  )
}

function DraftBlock({
  onCopy,
  title,
  value,
}: {
  onCopy: () => void
  title: string
  value: string | null | undefined
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{title}</p>
        <button
          type="button"
          disabled={!value}
          onClick={onCopy}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Clipboard className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{value || "No draft yet."}</p>
    </div>
  )
}
