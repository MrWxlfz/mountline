"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Loader2,
  PhoneCall,
  RadioTower,
} from "lucide-react"
import { getSignalPlaybook } from "@/lib/signal/playbooks"
import type {
  SignalAnalysis,
  SignalCampaign,
  SignalOutreachEvent,
} from "@/lib/supabase/types"
import type { SignalFocusProspectRow } from "./page"

type FocusLane =
  | "follow_up"
  | "awaiting_reply"
  | "new_call"
  | "demo_send"
  | "discovery"
  | "research"
  | "missing_contact"
  | "focus_queue"

type FocusItem = SignalFocusProspectRow & {
  lane: FocusLane
  lane_label: string
  why: string
  next_action: string
}

const laneLabels: Record<string, string> = {
  website_first: "Website First",
  systems_discovery: "Systems Discovery",
  do_not_pursue: "Do Not Pursue",
  compliance_gated: "Compliance-Gated",
}

const outcomeLabels: Record<string, string> = {
  no_answer: "No answer",
  voicemail_left: "Voicemail left",
  permission_to_send_demo: "Permission to send demo",
  demo_sent: "Demo sent",
  follow_up_later: "Follow up later",
  interested: "Interested",
  not_interested: "Not interested",
  do_not_contact: "Do not contact",
  needs_more_research: "Needs more research",
}

function todayDate() {
  return new Date().toISOString().slice(0, 10)
}

function isDue(value: string | null) {
  if (!value) return false
  return value <= todayDate()
}

function scriptStudio(draft: SignalFocusProspectRow["draft"]) {
  const value = draft?.script_studio
  return value && typeof value === "object" ? (value as Record<string, unknown>) : null
}

function arrayFromUnknown(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function demoPath(value: string | null | undefined) {
  if (value === "auto-detailing") return "/work/auto-detailing"
  if (value === "barber-shop") return "/work/barber-shop"
  return null
}

function buildFocusItems(rows: SignalFocusProspectRow[]): FocusItem[] {
  const items: FocusItem[] = []
  const seen = new Set<string>()

  const add = (
    row: SignalFocusProspectRow,
    lane: FocusLane,
    laneLabel: string,
    why: string,
    nextAction: string,
  ) => {
    if (seen.has(row.prospect.id)) return
    if (row.prospect.outreach_status === "do_not_contact") return
    seen.add(row.prospect.id)
    items.push({
      ...row,
      lane,
      lane_label: laneLabel,
      why,
      next_action: nextAction,
    })
  }

  rows
    .filter((row) => row.focus_item)
    .forEach((row) =>
      add(
        row,
        "focus_queue",
        "Focus queue",
        row.focus_item?.focus_reason || "Manually added to Focus Mode.",
        row.focus_item?.recommended_action || row.analysis?.recommended_next_action || "Review and choose the next manual step.",
      ),
    )

  rows
    .filter((row) => isDue(row.prospect.follow_up_date))
    .forEach((row) =>
      add(
        row,
        "follow_up",
        "Follow-up due",
        `Follow-up date is ${row.prospect.follow_up_date}.`,
        "Send one respectful follow-up through the same approved channel.",
      ),
    )

  rows
    .filter((row) => row.prospect.outreach_status === "permission_to_send_demo")
    .forEach((row) =>
      add(
        row,
        "demo_send",
        "Demo send",
        "The prospect gave permission to send a demo or concept.",
        demoPath(row.analysis?.recommended_demo || row.prospect.relevant_demo)
          ? "Send the relevant demo, then record demo sent."
          : "Send a short written review or concept, then record demo sent.",
      ),
    )

  rows
    .filter((row) => row.prospect.outreach_status === "awaiting_reply")
    .forEach((row) =>
      add(
        row,
        "awaiting_reply",
        "Awaiting reply",
        "Prior outreach is recorded and no reply is stored yet.",
        row.prospect.follow_up_date
          ? `Wait until ${row.prospect.follow_up_date}, then send one short follow-up.`
          : "Set a follow-up date before taking another action.",
      ),
    )

  rows
    .filter((row) => ["ready_to_contact", "needs_review"].includes(row.prospect.outreach_status))
    .filter((row) => ["A", "B"].includes(row.analysis?.priority || ""))
    .forEach((row) =>
      add(
        row,
        "new_call",
        "Approved new call",
        row.analysis?.executive_summary || "High-priority prospect needs manual attention.",
        row.analysis?.recommended_next_action || "Prepare first contact after confirming contact route.",
      ),
    )

  rows
    .filter((row) => ["interested", "discovery_call"].includes(row.prospect.outreach_status))
    .forEach((row) =>
      add(
        row,
        "discovery",
        "Discovery prep",
        "The prospect has shown interest or needs discovery-call preparation.",
        "Prepare discovery questions and confirm scope before proposing.",
      ),
    )

  rows
    .filter((row) => row.prospect.contact_readiness === "contact_missing")
    .filter((row) => ["A", "B"].includes(row.analysis?.priority || ""))
    .forEach((row) =>
      add(
        row,
        "missing_contact",
        "Missing contact",
        "This looks promising, but no verified public contact route is saved.",
        "Find and confirm a public email, phone, or contact form before outreach.",
      ),
    )

  rows
    .filter((row) => row.prospect.outreach_status === "researched")
    .filter((row) => ["A", "B"].includes(row.analysis?.priority || ""))
    .forEach((row) =>
      add(
        row,
        "research",
        "Needs research",
        "High-fit lead needs human review before outreach.",
        row.analysis?.recommended_next_action || "Review evidence, confirm official source, then prepare scripts.",
      ),
    )

  return items.sort((a, b) => {
    const rank: Record<FocusLane, number> = {
      follow_up: 0,
      focus_queue: 1,
      demo_send: 2,
      new_call: 3,
      discovery: 4,
      missing_contact: 5,
      awaiting_reply: 6,
      research: 7,
    }
    const priorityRank: Record<string, number> = { A: 0, B: 1, C: 2, skip: 3 }
    return (
      rank[a.lane] - rank[b.lane] ||
      (priorityRank[a.analysis?.priority || "skip"] ?? 3) -
        (priorityRank[b.analysis?.priority || "skip"] ?? 3)
    )
  })
}

export function SignalFocusMode({
  analyses,
  campaigns,
  events,
  rows,
}: {
  analyses: SignalAnalysis[]
  campaigns: SignalCampaign[]
  events: SignalOutreachEvent[]
  rows: SignalFocusProspectRow[]
}) {
  const router = useRouter()
  const [callCount, setCallCount] = useState("3")
  const [followUpCount, setFollowUpCount] = useState("2")
  const [verticalFocus, setVerticalFocus] = useState("")
  const [campaignId, setCampaignId] = useState("")
  const [sessionLength, setSessionLength] = useState("45")
  const [followUpDates, setFollowUpDates] = useState<Record<string, string>>({})
  const [working, setWorking] = useState<string | null>(null)
  const [completed, setCompleted] = useState<string[]>([])
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const focusItems = useMemo(() => {
    let items = buildFocusItems(rows).filter((item) => !completed.includes(item.prospect.id))
    if (verticalFocus) {
      items = items.filter((item) => item.prospect.industry_playbook === verticalFocus)
    }
    if (campaignId) {
      items = items.filter((item) => item.campaign?.id === campaignId || item.focus_item?.campaign_id === campaignId)
    }

    const calls = Number(callCount) || 0
    const followups = Number(followUpCount) || 0
    const followUpItems = items.filter((item) => item.lane === "follow_up").slice(0, followups)
    const callItems = items.filter((item) => item.lane !== "follow_up").slice(0, calls + 4)
    return [...followUpItems, ...callItems]
  }, [callCount, campaignId, completed, followUpCount, rows, verticalFocus])

  const weekly = useMemo(() => {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 7)
    const recentEvents = events.filter((event) => new Date(event.created_at) >= cutoff)
    const recentAnalyses = analyses.filter((analysis) => new Date(analysis.created_at) >= cutoff)
    return {
      researched: recentAnalyses.length,
      qualified: rows.filter((row) => ["A", "B"].includes(row.analysis?.priority || "")).length,
      calls: recentEvents.filter((event) => ["call", "voicemail"].includes(event.channel)).length,
      replies: recentEvents.filter((event) => ["replied", "permission_to_send_demo", "interested"].includes(event.event_type)).length,
      demos: recentEvents.filter((event) => event.event_type === "demo_sent").length,
      discovery: rows.filter((row) => row.prospect.outreach_status === "discovery_call").length,
      proposals: rows.filter((row) => row.prospect.outreach_status === "proposal_sent").length,
      won: rows.filter((row) => row.prospect.outreach_status === "won").length,
    }
  }, [analyses, events, rows])

  const saveOutcome = async (item: FocusItem, outcome: string) => {
    setWorking(`${item.prospect.id}:${outcome}`)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch("/api/signal/focus/outcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect_id: item.prospect.id,
          focus_item_id: item.focus_item?.id || null,
          outcome,
          follow_up_date: followUpDates[item.prospect.id] || null,
          notes: `Saved from Focus Mode: ${outcomeLabels[outcome] || outcome}`,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Outcome could not be saved.")
        return
      }
      setCompleted((current) => [...current, item.prospect.id])
      setMessage(`${outcomeLabels[outcome] || "Outcome"} saved.`)
      router.refresh()
    } catch {
      setError("Outcome could not be saved.")
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/signal" className="rounded-lg p-2 transition-colors hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Mountline Signal
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Focus Mode</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Decide what deserves attention today. Signal does not call, text, email, DM, or submit forms.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/signal/campaigns/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <RadioTower className="h-4 w-4" />
          Build Campaign
        </Link>
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

      <section className="rounded-xl border border-border bg-card p-4">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <Field label="Calls to prepare" type="number" value={callCount} onChange={setCallCount} />
          <Field label="Follow-ups to handle" type="number" value={followUpCount} onChange={setFollowUpCount} />
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Vertical focus</span>
            <select value={verticalFocus} onChange={(event) => setVerticalFocus(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm">
              <option value="">Any vertical</option>
              {Array.from(new Set(rows.map((row) => row.prospect.industry_playbook).filter(Boolean))).map((key) => (
                <option key={key || ""} value={key || ""}>{getSignalPlaybook(key).name}</option>
              ))}
            </select>
          </label>
          <label className="block space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Campaign</span>
            <select value={campaignId} onChange={(event) => setCampaignId(event.target.value)} className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm">
              <option value="">Any campaign</option>
              {campaigns.map((campaign) => (
                <option key={campaign.id} value={campaign.id}>{campaign.name}</option>
              ))}
            </select>
          </label>
          <Field label="Session length" type="number" value={sessionLength} onChange={setSessionLength} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Current plan: {focusItems.length} item{focusItems.length === 1 ? "" : "s"} for about {sessionLength || "45"} minutes.
        </p>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-8">
        <Score label="Researched" value={weekly.researched} />
        <Score label="Qualified" value={weekly.qualified} />
        <Score label="Calls made" value={weekly.calls} />
        <Score label="Replies" value={weekly.replies} />
        <Score label="Demos sent" value={weekly.demos} />
        <Score label="Discovery calls" value={weekly.discovery} />
        <Score label="Proposals" value={weekly.proposals} />
        <Score label="Won" value={weekly.won} />
      </section>

      {focusItems.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <Calendar className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No Focus Mode items match the current filters</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add prospects from campaign review, set follow-up dates, or clear the filters.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {focusItems.map((item) => {
            const playbook = getSignalPlaybook(item.prospect.industry_playbook)
            const studio = scriptStudio(item.draft)
            const demo = demoPath(item.analysis?.recommended_demo || item.prospect.relevant_demo)
            const questions = arrayFromUnknown(studio?.discovery_call_questions).slice(0, 5)
            const opener =
              String(studio?.first_call_opener || "") ||
              item.draft?.owner_call_opener ||
              item.analysis?.recommended_primary_offer ||
              "Review evidence and keep the first step permission-based."
            const objection =
              String(studio?.already_have_website_response || studio?.how_much_response || "") ||
              "Keep the conversation specific and avoid unsupported claims."

            return (
              <section key={`${item.prospect.id}:${item.lane}`} className="rounded-xl border border-border bg-card p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                      {item.lane_label}
                    </p>
                    <h2 className="mt-1 text-xl font-semibold">{item.prospect.business_name}</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[item.prospect.city, item.prospect.state].filter(Boolean).join(", ") || "Location unknown"} · {playbook.name}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <Badge value={`Priority ${item.analysis?.priority || "-"}`} />
                    <Badge value={item.analysis?.recommended_lane ? laneLabels[item.analysis.recommended_lane] || item.analysis.recommended_lane : "Lane unknown"} />
                    <Badge value={`Confidence ${item.analysis?.confidence || "-"}`} />
                  </div>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-[1fr_1fr_0.8fr]">
                  <Panel title="Why this deserves attention">
                    <p>{item.why}</p>
                    <p className="mt-3 text-foreground">{item.next_action}</p>
                  </Panel>
                  <Panel title="Contact and demo">
                    <p>{item.prospect.public_phone || item.prospect.public_email || item.prospect.public_contact_form_url || "Contact route not confirmed."}</p>
                    {demo ? (
                      <Link href={demo} target="_blank" className="mt-3 inline-flex items-center gap-2 text-foreground hover:text-muted-foreground">
                        {demo}
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    ) : (
                      <p className="mt-3">No relevant demo selected yet.</p>
                    )}
                  </Panel>
                  <Panel title="Outcome">
                    <input
                      type="date"
                      value={followUpDates[item.prospect.id] || item.prospect.follow_up_date || ""}
                      onChange={(event) =>
                        setFollowUpDates((current) => ({
                          ...current,
                          [item.prospect.id]: event.target.value,
                        }))
                      }
                      className="h-9 w-full rounded-lg border border-border bg-background px-3 text-sm"
                    />
                  </Panel>
                </div>

                <div className="mt-4 grid gap-4 xl:grid-cols-3">
                  <Panel title="Short script">
                    <p>{opener}</p>
                  </Panel>
                  <Panel title="Objections">
                    <p>{objection}</p>
                  </Panel>
                  <Panel title="Discovery questions">
                    {questions.length > 0 ? (
                      <ul className="space-y-2">
                        {questions.map((question) => (
                          <li key={question}>{question}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{playbook.discoveryQuestions[0] || "Confirm what actually matters before proposing scope."}</p>
                    )}
                  </Panel>
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-5 xl:grid-cols-9">
                  {Object.entries(outcomeLabels).map(([outcome, label]) => (
                    <button
                      key={outcome}
                      type="button"
                      disabled={working === `${item.prospect.id}:${outcome}`}
                      onClick={() => saveOutcome(item, outcome)}
                      className="inline-flex min-h-9 items-center justify-center gap-2 rounded-lg border border-border px-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                    >
                      {working === `${item.prospect.id}:${outcome}` ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : outcome === "interested" ? (
                        <CheckCircle2 className="h-4 w-4" />
                      ) : (
                        <PhoneCall className="h-4 w-4" />
                      )}
                      {label}
                    </button>
                  ))}
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Field({
  label,
  onChange,
  type,
  value,
}: {
  label: string
  onChange: (value: string) => void
  type?: string
  value: string
}) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type || "text"}
        min={0}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm"
      />
    </label>
  )
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold">{value}</p>
    </div>
  )
}

function Badge({ value }: { value: string }) {
  return (
    <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-muted-foreground">
      {value}
    </span>
  )
}

function Panel({ children, title }: { children: React.ReactNode; title: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-foreground">{title}</p>
      {children}
    </div>
  )
}
