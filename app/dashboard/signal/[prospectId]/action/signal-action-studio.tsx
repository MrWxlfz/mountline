"use client"

import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clipboard,
  ExternalLink,
  Eye,
  Lightbulb,
  LockKeyhole,
  MessageCircleMore,
  MoonStar,
  Phone,
  Play,
  RotateCcw,
  Send,
  Smartphone,
  Target,
} from "lucide-react"
import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatSignalLabel } from "@/lib/signal/presentation"
import type {
  SignalAnalysis,
  SignalConcept,
  SignalEvidenceLedgerItem,
  SignalOutreachDraft,
  SignalProspect,
} from "@/lib/supabase/types"

type Mode = "focus" | "practice" | "teleprompter"

type PracticeScenario =
  | "friendly_busy"
  | "skeptical"
  | "facebook"
  | "enough_business"
  | "price"
  | "owner_unavailable"
  | "send_information"
  | "think_about_it"

const scenarios: Array<{ value: PracticeScenario; label: string }> = [
  { value: "friendly_busy", label: "Friendly but busy" },
  { value: "skeptical", label: "Skeptical owner" },
  { value: "facebook", label: "Already has Facebook" },
  { value: "enough_business", label: "Gets enough business" },
  { value: "price", label: "Asks price immediately" },
  { value: "owner_unavailable", label: "Owner is unavailable" },
  { value: "send_information", label: "Asks to send information" },
  { value: "think_about_it", label: "Will think about it" },
]

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function strings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function firstString(...values: unknown[]) {
  return values.find((value): value is string => typeof value === "string" && value.trim().length > 0) || ""
}

function initialOwnerLine(scenario: PracticeScenario, businessName: string) {
  const lines: Record<PracticeScenario, string> = {
    friendly_busy: "You caught me at a busy time, but you have about a minute. What did you notice?",
    skeptical: `We get a lot of website pitches. What is actually specific to ${businessName}?`,
    facebook: "We already keep everything on Facebook. Why would we need something else?",
    enough_business: "We are already busy enough. More customers are not really the problem.",
    price: "Before we go any further, what does something like this cost?",
    owner_unavailable: "The owner is not here. What is this regarding?",
    send_information: "Sure, just send the information over.",
    think_about_it: "The idea looks fine, but we need to think about it.",
  }
  return lines[scenario]
}

function ownerFollowUp(scenario: PracticeScenario, reply: string) {
  const askedQuestion = reply.includes("?")
  if (scenario === "owner_unavailable") return askedQuestion ? "The owner is usually here Wednesday morning. What should we tell them to expect?" : "You can leave the information, but the owner decides."
  if (scenario === "send_information") return /when|follow|tuesday|wednesday|tomorrow/i.test(reply) ? "Wednesday works. Keep it short." : "Okay. What exactly are you sending?"
  if (scenario === "price") return /scope|depends|range|start|small/i.test(reply) ? "What would the smallest useful version include?" : "That does not really answer the price question."
  if (scenario === "think_about_it") return askedQuestion ? "The main question is whether this is worth doing right now." : "Right, we just are not ready to decide."
  if (scenario === "facebook") return askedQuestion ? "People do ask where to find hours and service details sometimes." : "Facebook has worked well enough so far."
  if (scenario === "enough_business") return askedQuestion ? "The repetitive calls are probably the bigger issue." : "Exactly—we do not need more demand."
  if (scenario === "skeptical") return askedQuestion ? "The quote process is the part that gets messy." : "That still sounds like a general website pitch."
  return askedQuestion ? "Making the customer path clearer could help. What would you suggest as the next step?" : "Okay—what would you need from us?"
}

function practiceFeedback(reply: string, ownerLine: string, strongestAngle: string) {
  const words = reply.trim().split(/\s+/).filter(Boolean)
  const lower = reply.toLowerCase()
  const ownerKeywords = ownerLine.toLowerCase().split(/[^a-z0-9]+/).filter((word) => word.length >= 5)
  const dimensions = {
    clarity: words.length >= 8 && words.length <= 55 ? 5 : words.length < 8 ? 3 : 2,
    confidence: /\b(?:recommend|focus|start|would|can|next)\b/i.test(reply) && !/\b(?:maybe just|kind of|sort of|i guess)\b/i.test(reply) ? 5 : 3,
    discovery: reply.includes("?") ? 5 : 2,
    listening: ownerKeywords.some((word) => lower.includes(word)) ? 5 : 3,
    nextStep: /\b(?:show|send|look|call|check back|follow up|tuesday|wednesday|schedule|number|email)\b/i.test(reply) ? 5 : 2,
  }
  const suggestions: string[] = []
  if (dimensions.clarity < 4) suggestions.push(words.length > 55 ? "Trim the response to one acknowledgment, one useful point, and one question." : "Add one concrete sentence before asking for the next step.")
  if (dimensions.discovery < 4) suggestions.push("Ask one short question that isolates the real concern before explaining more.")
  if (dimensions.listening < 4) suggestions.push("Reflect the owner’s exact concern before reframing it.")
  if (dimensions.nextStep < 4) suggestions.push("End with a small, time-specific next step instead of leaving the conversation open-ended.")
  if (suggestions.length === 0) suggestions.push(`Keep the next sentence anchored to the verified angle: ${strongestAngle}`)
  return { dimensions, suggestions: suggestions.slice(0, 2) }
}

function CopyControl({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }
  return (
    <button type="button" onClick={copy} className="inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground-subtle hover:bg-hover hover:text-foreground">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  )
}

export function SignalActionStudio({
  initialMode,
  prospect,
  analysis,
  draft,
  concept,
  evidence,
}: {
  initialMode: Mode
  prospect: SignalProspect
  analysis: SignalAnalysis | null
  draft: SignalOutreachDraft | null
  concept: SignalConcept | null
  evidence: SignalEvidenceLedgerItem[]
}) {
  const studio = record(draft?.script_studio)
  const [mode, setMode] = useState<Mode>(initialMode)
  const [focusIndex, setFocusIndex] = useState(0)
  const [teleprompterIndex, setTeleprompterIndex] = useState(0)
  const [practiced, setPracticed] = useState<number[]>([])
  const [scenario, setScenario] = useState<PracticeScenario>("friendly_busy")
  const [reply, setReply] = useState("")
  const [practiceTurns, setPracticeTurns] = useState<Array<{ role: "owner" | "mountline"; text: string }>>([
    { role: "owner", text: initialOwnerLine("friendly_busy", prospect.business_name) },
  ])
  const [feedback, setFeedback] = useState<ReturnType<typeof practiceFeedback> | null>(null)
  const wakeLock = useRef<{ release: () => Promise<void> } | null>(null)
  const [screenAwake, setScreenAwake] = useState(false)

  const strongestAngle = firstString(
    studio.best_angle,
    prospect.primary_opportunity,
    analysis?.recommended_primary_offer,
    "Verify the customer path before recommending a narrow improvement.",
  )
  const opener = firstString(
    studio.walk_in_opener,
    studio.first_call_opener,
    draft?.owner_call_opener,
    `Hi, Luke with Mountline. ${prospect.business_name} stood out during local research, and we had one specific idea worth showing. Would you be open to a quick look?`,
  )
  const followUp = firstString(
    studio.follow_up_text,
    draft?.follow_up_email,
    draft?.demo_send_followup,
    `Quick follow-up on the idea for ${prospect.business_name}. Would it be useful to take a short look this week?`,
  )
  const questions = strings(studio.discovery_questions).length
    ? strings(studio.discovery_questions).slice(0, 3)
    : strings(studio.discovery_call_questions).length
      ? strings(studio.discovery_call_questions).slice(0, 3)
      : strings(draft?.discovery_call_questions).slice(0, 3)
  const discoveryQuestions = [...questions]
  while (discoveryQuestions.length < 3) {
    const fallbacks = [
      "When a new customer reaches out, what normally happens from there?",
      "Which part of the current process creates the most repetitive work?",
      "Besides you, would anyone else need to weigh in on a change like this?",
    ]
    discoveryQuestions.push(fallbacks[discoveryQuestions.length])
  }
  const nextAction = firstString(
    prospect.next_action,
    analysis?.recommended_next_action,
    "Ask permission for one clear next step and record the outcome.",
  )
  const verifiedFact = evidence[0]?.claim_text || "the verified customer path"
  const valueBridge = firstString(
    studio.value_bridge,
    `That makes sense. Based on what you said, we would not try to build something huge. We would focus on ${prospect.smallest_offer || strongestAngle.toLowerCase()}, so customers can move through ${verifiedFact.toLowerCase()} with less friction.`,
  )
  const conceptReveal = firstString(
    studio.concept_reveal,
    concept
      ? `We kept this focused on ${strongestAngle.toLowerCase()}. Take a look at the customer path first—what feels useful, and what would you change?`
      : "There is no finished concept yet. Ask permission to prepare one focused example using the business’s verified information.",
  )
  const close = firstString(
    studio.recommended_close,
    stageClose(prospect),
  )
  const objections = record(studio.objection_responses)
  const deliveryNotes = strings(studio.delivery_notes).length
    ? strings(studio.delivery_notes)
    : [
      "Start warm and slow down the first sentence.",
      "Pause after the business-specific observation.",
      "Ask one question at a time and do not fill the silence.",
      "Sound certain about the process, not about an unknown outcome.",
    ]

  const focusSections = [
    { title: "Business", text: `${prospect.business_name}\n${[prospect.city, prospect.state].filter(Boolean).join(", ") || formatSignalLabel(prospect.industry)}` },
    { title: "Strongest angle", text: strongestAngle },
    { title: "Opener", text: opener },
    { title: "Three questions", text: discoveryQuestions.map((item, index) => `${index + 1}. ${item}`).join("\n\n") },
    { title: "Next action", text: nextAction },
  ]

  const teleprompterSteps = [
    { title: "Opener", text: opener, note: "Aim for under 25 seconds. Stop after the permission question." },
    { title: "Discovery", text: discoveryQuestions.map((item, index) => `${index + 1}. ${item}`).join("\n\n"), note: "Choose the question that fits the answer; do not fire all three without listening." },
    { title: "Value bridge", text: valueBridge, note: "Use this as a branch after the owner confirms the problem. Do not present it as something already said." },
    { title: "Concept reveal", text: conceptReveal, note: "Show the strongest screen first, then stop talking and ask for a reaction." },
    { title: "Close", text: close, note: "Use the smallest commitment supported by the current stage." },
    { title: "Objections", text: Object.entries(objections).length ? Object.entries(objections).map(([key, value]) => `${formatSignalLabel(key)}\n${String(value)}`).join("\n\n") : "Acknowledge the concern. Clarify the real issue. Reframe using verified relevance. Ask for one small next step.", note: "After one or two genuine objections without progress, exit respectfully." },
    { title: "Delivery notes", text: deliveryNotes.map((item) => `• ${item}`).join("\n\n"), note: "These are practical reminders, not performance theater." },
  ]

  useEffect(() => {
    return () => {
      const currentWakeLock = wakeLock.current
      wakeLock.current = null
      if (currentWakeLock) void currentWakeLock.release()
    }
  }, [])

  async function markContacted() {
    const response = await fetch(`/api/signal/prospects/${prospect.id}/pipeline`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pipeline_stage: "contacted" }),
    })
    if (response.ok) toast.success("First contact recorded.")
    else toast.error("Contact status could not be saved.")
  }

  async function toggleWakeLock() {
    if (screenAwake && wakeLock.current) {
      await wakeLock.current.release()
      wakeLock.current = null
      setScreenAwake(false)
      return
    }
    if (!("wakeLock" in navigator)) {
      toast.info("Keep-awake is not supported by this browser.")
      return
    }
    try {
      wakeLock.current = await (navigator as Navigator & { wakeLock: { request: (type: "screen") => Promise<{ release: () => Promise<void> }> } }).wakeLock.request("screen")
      setScreenAwake(true)
      toast.success("Screen will stay awake during this view.")
    } catch {
      toast.info("The browser did not allow keep-awake.")
    }
  }

  function chooseScenario(next: PracticeScenario) {
    setScenario(next)
    setReply("")
    setFeedback(null)
    setPracticeTurns([{ role: "owner", text: initialOwnerLine(next, prospect.business_name) }])
  }

  function sendPracticeReply() {
    const nextReply = reply.trim()
    if (!nextReply) return
    const ownerLine = practiceTurns.filter((turn) => turn.role === "owner").at(-1)?.text || ""
    const ownerResponse = ownerFollowUp(scenario, nextReply)
    setPracticeTurns((turns) => [...turns, { role: "mountline", text: nextReply }, { role: "owner", text: ownerResponse }])
    setFeedback(practiceFeedback(nextReply, ownerLine, strongestAngle))
    setReply("")
  }

  const activeFocus = focusSections[focusIndex]
  const activeTeleprompter = teleprompterSteps[teleprompterIndex]

  return (
    <div className="fixed inset-0 z-[80] overflow-y-auto bg-background text-foreground">
      <header className="sticky top-0 z-10 border-b border-border bg-background/92 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Link href={`/dashboard/signal/${prospect.id}`} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-foreground-subtle hover:bg-hover hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" /> Workspace
          </Link>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{prospect.business_name}</p>
            <p className="truncate text-xs text-muted-foreground">Lead action studio · {formatSignalLabel(prospect.pipeline_stage || "found")}</p>
          </div>
          <button type="button" onClick={toggleWakeLock} className={cn("hidden h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium sm:inline-flex", screenAwake ? "border-success-border bg-success-soft text-success-foreground" : "border-border text-foreground-subtle hover:bg-hover hover:text-foreground")}>
            {screenAwake ? <MoonStar className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            {screenAwake ? "Awake" : "Keep awake"}
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-5 sm:px-6 sm:py-8">
        <div className="mb-6 grid grid-cols-3 rounded-lg border border-border bg-surface-muted p-1" role="tablist" aria-label="Lead action mode">
          {([
            ["focus", "Focus", Target],
            ["practice", "Practice", MessageCircleMore],
            ["teleprompter", "Teleprompter", Play],
          ] as const).map(([value, label, Icon]) => (
            <button key={value} id={`signal-action-${value}-tab`} type="button" role="tab" aria-controls={`signal-action-${value}-panel`} aria-selected={mode === value} onClick={() => setMode(value)} className={cn("inline-flex min-h-10 items-center justify-center gap-2 rounded-md px-2 text-xs font-medium transition-colors sm:text-sm", mode === value ? "bg-surface-elevated text-foreground shadow-sm" : "text-foreground-subtle hover:bg-hover hover:text-foreground")}>
              <Icon className="h-4 w-4" /> {label}
            </button>
          ))}
        </div>

        {mode === "focus" && (
          <section id="signal-action-focus-panel" role="tabpanel" aria-labelledby="signal-action-focus-tab" className="mx-auto max-w-4xl">
            <div className="mb-4 flex items-center justify-between gap-3 text-xs text-muted-foreground">
              <span>{focusIndex + 1} of {focusSections.length}</span>
              <span>{activeFocus.title}</span>
            </div>
            <div className="min-h-[420px] rounded-2xl border border-border bg-surface-elevated p-6 shadow-[0_18px_60px_var(--shadow-color)] sm:p-10">
              <p className="font-mono text-xs uppercase tracking-[0.18em] text-muted-foreground">{activeFocus.title}</p>
              <p className="mt-6 whitespace-pre-wrap text-2xl font-medium leading-relaxed tracking-tight sm:text-4xl sm:leading-snug">{activeFocus.text}</p>
              <div className="mt-8 flex flex-wrap gap-2">
                <CopyControl value={activeFocus.text} />
                {prospect.public_phone && <a href={`tel:${prospect.public_phone}`} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-foreground-subtle hover:bg-hover hover:text-foreground"><Phone className="h-3.5 w-3.5" /> Call</a>}
                {prospect.public_phone && <a href={`sms:${prospect.public_phone}`} className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-foreground-subtle hover:bg-hover hover:text-foreground"><Smartphone className="h-3.5 w-3.5" /> Text</a>}
                {prospect.website_url && <a href={prospect.website_url} target="_blank" rel="noreferrer" className="inline-flex h-9 items-center gap-2 rounded-md border border-border px-3 text-xs font-medium text-foreground-subtle hover:bg-hover hover:text-foreground"><ExternalLink className="h-3.5 w-3.5" /> Website</a>}
                <button type="button" onClick={markContacted} className="inline-flex h-9 items-center gap-2 rounded-md bg-foreground px-3 text-xs font-medium text-background hover:bg-foreground/90"><Check className="h-3.5 w-3.5" /> Mark contacted</button>
              </div>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <button type="button" disabled={focusIndex === 0} onClick={() => setFocusIndex((index) => Math.max(0, index - 1))} className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Previous</button>
              <div className="flex gap-1.5">{focusSections.map((section, index) => <button key={section.title} type="button" aria-label={`Open ${section.title}`} onClick={() => setFocusIndex(index)} className={cn("h-1.5 rounded-full transition-all", index === focusIndex ? "w-7 bg-foreground" : "w-2 bg-border-strong")} />)}</div>
              <button type="button" disabled={focusIndex === focusSections.length - 1} onClick={() => setFocusIndex((index) => Math.min(focusSections.length - 1, index + 1))} className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium disabled:opacity-40">Next <ArrowRight className="h-4 w-4" /></button>
            </div>
          </section>
        )}

        {mode === "practice" && (
          <section id="signal-action-practice-panel" role="tabpanel" aria-labelledby="signal-action-practice-tab" className="grid gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="rounded-xl border border-border bg-surface p-3">
              <p className="px-2 pb-2 text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">Scenario</p>
              <div className="space-y-1">
                {scenarios.map((item) => <button key={item.value} type="button" onClick={() => chooseScenario(item.value)} className={cn("w-full rounded-md px-3 py-2.5 text-left text-sm transition-colors", scenario === item.value ? "bg-selected text-foreground" : "text-foreground-subtle hover:bg-hover hover:text-foreground")}>{item.label}</button>)}
              </div>
              <div className="mt-4 rounded-lg border border-information-border bg-information-soft p-3 text-xs leading-5 text-information-foreground"><LockKeyhole className="mb-2 h-4 w-4" />This rehearsal uses stored lead context. It does not predict how the real owner will respond.</div>
            </aside>
            <div className="rounded-xl border border-border bg-surface-elevated p-4 sm:p-6">
              <div className="mb-5 flex items-start justify-between gap-3">
                <div><p className="text-sm font-semibold">Practice with {prospect.business_name}</p><p className="mt-1 text-xs text-muted-foreground">Respond naturally. One concise answer is more useful than a polished speech.</p></div>
                <button type="button" onClick={() => chooseScenario(scenario)} className="rounded-md p-2 text-muted-foreground hover:bg-hover hover:text-foreground" aria-label="Restart practice"><RotateCcw className="h-4 w-4" /></button>
              </div>
              <div className="max-h-[420px] space-y-3 overflow-y-auto pr-1">
                {practiceTurns.map((turn, index) => <div key={`${turn.role}-${index}`} className={cn("max-w-[88%] rounded-xl border p-3 text-sm leading-6", turn.role === "owner" ? "border-border bg-surface-muted text-foreground" : "ml-auto border-information-border bg-information-soft text-information-foreground")}><p className="mb-1 text-[10px] font-semibold uppercase tracking-wider opacity-65">{turn.role === "owner" ? "Owner" : "Mountline"}</p>{turn.text}</div>)}
              </div>
              <div className="mt-5 flex gap-2 border-t border-border pt-4">
                <textarea value={reply} onChange={(event) => setReply(event.target.value)} rows={3} placeholder="Reply as Mountline…" className="min-h-20 flex-1 resize-none rounded-lg border border-border bg-input-background px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:border-focus-ring" />
                <button type="button" disabled={!reply.trim()} onClick={sendPracticeReply} className="inline-flex w-11 items-center justify-center rounded-lg bg-foreground text-background disabled:opacity-40" aria-label="Send practice reply"><Send className="h-4 w-4" /></button>
              </div>
              {feedback && <div className="mt-5 rounded-xl border border-border bg-surface-muted p-4"><div className="flex flex-wrap gap-2">{Object.entries(feedback.dimensions).map(([key, value]) => <span key={key} className={cn("rounded-full border px-2.5 py-1 text-xs font-medium", value >= 4 ? "border-success-border bg-success-soft text-success-foreground" : "border-warning-border bg-warning-soft text-warning-foreground")}>{formatSignalLabel(key)} {value}/5</span>)}</div><div className="mt-4 space-y-2">{feedback.suggestions.map((item) => <p key={item} className="flex gap-2 text-sm leading-6 text-foreground-subtle"><Lightbulb className="mt-1 h-4 w-4 shrink-0 text-warning" />{item}</p>)}</div></div>}
            </div>
          </section>
        )}

        {mode === "teleprompter" && (
          <section id="signal-action-teleprompter-panel" role="tabpanel" aria-labelledby="signal-action-teleprompter-tab" className="mx-auto max-w-4xl">
            <div className="rounded-2xl border border-border bg-code-background p-5 sm:p-9">
              <div className="flex items-center justify-between gap-3">
                <div><p className="font-mono text-xs uppercase tracking-[0.16em] text-muted-foreground">{teleprompterIndex + 1} / {teleprompterSteps.length}</p><h2 className="mt-2 text-2xl font-semibold">{activeTeleprompter.title}</h2></div>
                <CopyControl value={activeTeleprompter.text} />
              </div>
              <p className="mt-8 whitespace-pre-wrap text-xl leading-relaxed sm:text-3xl sm:leading-relaxed">{activeTeleprompter.text}</p>
              <div className="mt-8 rounded-lg border border-border bg-surface p-3 text-sm leading-6 text-foreground-subtle">{activeTeleprompter.note}</div>
              <button type="button" onClick={() => setPracticed((items) => items.includes(teleprompterIndex) ? items.filter((item) => item !== teleprompterIndex) : [...items, teleprompterIndex])} className={cn("mt-4 inline-flex h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium", practiced.includes(teleprompterIndex) ? "border-success-border bg-success-soft text-success-foreground" : "border-border text-foreground-subtle hover:bg-hover hover:text-foreground")}><Check className="h-3.5 w-3.5" />{practiced.includes(teleprompterIndex) ? "Practiced" : "Mark practiced"}</button>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3"><button type="button" disabled={teleprompterIndex === 0} onClick={() => setTeleprompterIndex((index) => Math.max(0, index - 1))} className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium disabled:opacity-40"><ArrowLeft className="h-4 w-4" /> Previous</button><span className="text-xs text-muted-foreground">{practiced.length} of {teleprompterSteps.length} practiced</span><button type="button" disabled={teleprompterIndex === teleprompterSteps.length - 1} onClick={() => setTeleprompterIndex((index) => Math.min(teleprompterSteps.length - 1, index + 1))} className="inline-flex h-10 items-center gap-2 rounded-md border border-border px-4 text-sm font-medium disabled:opacity-40">Next <ArrowRight className="h-4 w-4" /></button></div>
          </section>
        )}
      </main>
    </div>
  )
}

function stageClose(prospect: SignalProspect) {
  const stage = prospect.pipeline_stage || "found"
  if (stage === "proposal") return "Would it be useful to review the scope together for ten minutes and resolve the remaining decision point?"
  if (stage === "interested") return "Would Tuesday or Wednesday be better for a short review of the adjusted concept and a simple scope?"
  if (stage === "contacted" || stage === "concept_ready") return "Would it be useful if we adjusted this around your actual services, then checked back on a specific day?"
  if (stage === "lost" || prospect.outreach_status === "do_not_contact") return "Do not continue the pitch. Thank them for the clarity and preserve the relationship."
  return "Would you be open to a quick look, or is there a better person and time for this conversation?"
}
