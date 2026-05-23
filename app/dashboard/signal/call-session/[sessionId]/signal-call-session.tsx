"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clipboard,
  ExternalLink,
  Loader2,
  PhoneCall,
} from "lucide-react"
import type {
  SignalAnalysis,
  SignalCallSession,
  SignalCallSessionItem,
  SignalOutreachDraft,
  SignalProspect,
} from "@/lib/supabase/types"

type ScriptStudio = {
  conversation_style_label: string
  conversation_style_reason: string
  first_call_opener: string
  receptionist_script: string
  voicemail_script: string
  sure_send_it_response: string
  how_much_response: string
  already_use_booking_response: string
  already_have_website_response: string
  discovery_call_questions: string[]
  proposal_angle: string
  evidence_citations: string[]
  compliance_warning: string | null
}

export type SignalCallSessionRow = {
  item: SignalCallSessionItem
  prospect: SignalProspect
  analysis: SignalAnalysis | null
  draft: SignalOutreachDraft | null
  script_studio: ScriptStudio
  suppressed: boolean
}

const outcomeLabels: Record<string, string> = {
  no_answer: "No answer",
  voicemail_left: "Voicemail left",
  permission_to_send_demo: "Permission to send demo",
  interested: "Interested",
  follow_up_later: "Follow up later",
  not_interested: "Not interested",
  do_not_contact: "Do not contact",
}

const statusLabels: Record<string, string> = {
  researched: "Researched",
  needs_review: "Needs review",
  ready_to_contact: "Ready",
  contacted: "Contacted",
  awaiting_reply: "Awaiting reply",
  permission_to_send_demo: "Permission to send",
  demo_sent: "Demo sent",
  interested: "Interested",
  discovery_call: "Discovery call",
  proposal_sent: "Proposal sent",
  won: "Won",
  lost: "Lost",
  no_response: "No response",
  do_not_contact: "Do not contact",
}

function demoHref(analysis: SignalAnalysis | null) {
  if (analysis?.recommended_demo === "auto-detailing") return "/work/auto-detailing"
  if (analysis?.recommended_demo === "barber-shop") return "/work/barber-shop"
  return null
}

export function SignalCallSessionView({
  rows: initialRows,
  session,
}: {
  rows: SignalCallSessionRow[]
  session: SignalCallSession
}) {
  const router = useRouter()
  const [rows, setRows] = useState(initialRows)
  const [working, setWorking] = useState<string | null>(null)
  const [followUpDates, setFollowUpDates] = useState<Record<string, string>>({})
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const saveOutcome = async (row: SignalCallSessionRow, outcome: string) => {
    setWorking(`${row.item.id}:${outcome}`)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/call-sessions/${session.id}/outcome`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: row.item.id,
          outcome,
          follow_up_date: followUpDates[row.item.id] || null,
          notes: `Saved from Signal call session: ${outcomeLabels[outcome] || outcome}`,
        }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || "Outcome could not be saved.")
        return
      }

      setRows((current) =>
        current.map((item) =>
          item.item.id === row.item.id
            ? { ...item, item: data.item, prospect: data.prospect }
            : item,
        ),
      )
      setMessage(`${outcomeLabels[outcome] || "Outcome"} saved.`)
      router.refresh()
    } catch {
      setError("Outcome could not be saved.")
    } finally {
      setWorking(null)
    }
  }

  const copy = async (value: string, label: string) => {
    await navigator.clipboard.writeText(value)
    setMessage(`${label} copied.`)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/signal" className="rounded-lg p-2 transition-colors hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Mountline Signal
          </p>
          <h1 className="text-2xl font-bold tracking-tight">{session.title}</h1>
          <p className="text-sm text-muted-foreground">
            Manual call prep queue. Signal does not call, text, or email prospects.
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

      <div className="grid gap-4">
        {rows.map((row, index) => {
          const demo = demoHref(row.analysis)
          const blocked = row.suppressed || row.prospect.outreach_status === "do_not_contact"
          const contacted = [
            "contacted",
            "awaiting_reply",
            "permission_to_send_demo",
            "demo_sent",
            "interested",
            "discovery_call",
            "proposal_sent",
            "won",
            "lost",
            "no_response",
          ].includes(row.prospect.outreach_status)

          return (
            <section key={row.item.id} className="rounded-xl border border-border bg-card p-5">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-mono text-xs text-muted-foreground">CALL {index + 1}</p>
                  <h2 className="mt-1 text-xl font-semibold">{row.prospect.business_name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {[row.prospect.city, row.prospect.state].filter(Boolean).join(", ") || "Location unknown"} - {row.prospect.public_phone || "No public phone"}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge label={`Score ${row.analysis?.overall_opportunity_score ?? "-"}`} />
                  <Badge label={`Priority ${row.analysis?.priority || "-"}`} />
                  <Badge label={statusLabels[row.prospect.outreach_status] || row.prospect.outreach_status} />
                  <Badge label={row.script_studio.conversation_style_label} />
                </div>
              </div>

              {(blocked || contacted || row.script_studio.compliance_warning) && (
                <div className="mt-4 space-y-2">
                  {blocked && <Warning text="This prospect is suppressed or marked do-not-contact." />}
                  {contacted && <Warning text="This prospect already has outreach history. Avoid resetting status without a real outcome." />}
                  {row.script_studio.compliance_warning && <Warning text={row.script_studio.compliance_warning} />}
                </div>
              )}

              <div className="mt-5 grid gap-4 xl:grid-cols-2">
                <ScriptBlock
                  title="Opening line"
                  value={row.script_studio.first_call_opener}
                  onCopy={() => copy(row.script_studio.first_call_opener, "Opening line")}
                />
                <ScriptBlock
                  title="If employee answers"
                  value={row.script_studio.receptionist_script}
                  onCopy={() => copy(row.script_studio.receptionist_script, "Receptionist line")}
                />
                <ScriptBlock
                  title="Voicemail"
                  value={row.script_studio.voicemail_script}
                  onCopy={() => copy(row.script_studio.voicemail_script, "Voicemail")}
                />
                <ScriptBlock
                  title="If they say sure, send it"
                  value={row.script_studio.sure_send_it_response}
                  onCopy={() => copy(row.script_studio.sure_send_it_response, "Send-it response")}
                />
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-3">
                <MiniBlock title="If they ask how much" value={row.script_studio.how_much_response} />
                <MiniBlock title="Already use booking" value={row.script_studio.already_use_booking_response} />
                <MiniBlock title="Already have a website" value={row.script_studio.already_have_website_response} />
              </div>

              <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr_0.8fr]">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="mb-2 text-sm font-medium">Key discovery questions</p>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {row.script_studio.discovery_call_questions.slice(0, 6).map((question) => (
                      <li key={question}>{question}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="mb-2 text-sm font-medium">Reason worth calling</p>
                  <p className="text-sm text-muted-foreground">
                    {row.analysis?.recommended_primary_offer || row.script_studio.proposal_angle}
                  </p>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {row.script_studio.evidence_citations[0] || "Evidence is limited. Confirm fit before pitching."}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="mb-2 text-sm font-medium">Demo link</p>
                  {demo ? (
                    <Link
                      href={demo}
                      target="_blank"
                      className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
                    >
                      {demo}
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  ) : (
                    <p className="text-sm text-muted-foreground">No demo selected.</p>
                  )}
                </div>
              </div>

              <div className="mt-5 rounded-lg border border-border bg-muted/30 p-3">
                <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-medium">Save outcome</p>
                  <input
                    type="date"
                    value={followUpDates[row.item.id] || row.prospect.follow_up_date || ""}
                    onChange={(event) =>
                      setFollowUpDates((current) => ({
                        ...current,
                        [row.item.id]: event.target.value,
                      }))
                    }
                    className="h-9 rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                  />
                </div>
                <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-7">
                  {Object.entries(outcomeLabels).map(([outcome, label]) => (
                    <button
                      key={outcome}
                      type="button"
                      disabled={blocked || working === `${row.item.id}:${outcome}`}
                      onClick={() => saveOutcome(row, outcome)}
                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-border px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    >
                      {working === `${row.item.id}:${outcome}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : outcome === row.item.outcome ? (
                        <CheckCircle2 className="h-4 w-4 text-green-400" />
                      ) : (
                        <PhoneCall className="h-4 w-4" />
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}

function Badge({ label }: { label: string }) {
  return (
    <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-muted-foreground">
      {label}
    </span>
  )
}

function Warning({ text }: { text: string }) {
  return (
    <div className="flex gap-2 rounded-lg border border-yellow-500/25 bg-yellow-500/10 p-3 text-sm text-yellow-100">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
      <p>{text}</p>
    </div>
  )
}

function ScriptBlock({
  onCopy,
  title,
  value,
}: {
  onCopy: () => void
  title: string
  value: string
}) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-sm font-medium">{title}</p>
        <button
          type="button"
          onClick={onCopy}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Clipboard className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{value}</p>
    </div>
  )
}

function MiniBlock({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-2 text-sm text-muted-foreground">{value}</p>
    </div>
  )
}
