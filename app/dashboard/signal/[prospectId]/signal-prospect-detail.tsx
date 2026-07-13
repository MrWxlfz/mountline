"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  Clipboard,
  ExternalLink,
  FileSearch,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  Plus,
  RefreshCw,
  ShieldAlert,
  Sparkles,
} from "lucide-react"
import {
  PageHeader,
  PrimaryAction,
  SectionPanel,
  SecondaryAction,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  SignalAnalysis,
  SignalConcept,
  SignalEvidenceCategory,
  SignalEvidenceLedgerItem,
  SignalLeadActivity,
  SignalLeadStageHistory,
  SignalOutreachDraft,
  SignalOutreachEvent,
  SignalPipelineStage,
  SignalProspect,
} from "@/lib/supabase/types"
import { formatSignalLabel } from "@/lib/signal/presentation"
import { cn } from "@/lib/utils"

const evidenceLabels: Record<SignalEvidenceCategory, string> = {
  verified_public_fact: "Verified public facts",
  likely_inference: "Likely inferences",
  mountline_observation: "Private Mountline observations",
  unverified_claim: "Unverified claims",
  unknown: "Unknowns and limitations",
}

const evidenceOrder: SignalEvidenceCategory[] = [
  "verified_public_fact",
  "likely_inference",
  "mountline_observation",
  "unverified_claim",
  "unknown",
]

const pipelineStages: Array<{ value: SignalPipelineStage; label: string }> = [
  { value: "found", label: "Found" },
  { value: "analyzed", label: "Analyzed" },
  { value: "concept_ready", label: "Concept ready" },
  { value: "contacted", label: "Contacted" },
  { value: "interested", label: "Interested" },
  { value: "proposal", label: "Proposal" },
  { value: "won", label: "Won" },
  { value: "lost", label: "Lost" },
]

function list(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function dateTime(value: string | null | undefined) {
  if (!value) return "Not recorded"
  return new Date(value).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "numeric", minute: "2-digit",
  })
}

function verdictTone(verdict: SignalProspect["verdict"]) {
  if (verdict === "pursue") return "green" as const
  if (verdict === "investigate") return "amber" as const
  if (verdict === "skip") return "red" as const
  return "default" as const
}

function analysisStatusLabel(status: SignalProspect["analysis_status"]) {
  if (["resolving", "researching", "analyzing"].includes(status || "ready")) return "Analysis in progress"
  if (status === "queued") return "Analysis queued"
  if (status === "needs_review") return "Analysis needs review"
  if (status === "failed") return "Analysis failed"
  return status === "ready" ? "Analysis ready" : formatSignalLabel(status || "unknown")
}

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }
  return (
    <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}

function ScriptBlock({ label, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">{label}</h3>
        <CopyButton value={value} />
      </div>
      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{value}</p>
    </div>
  )
}

export function SignalLeadWorkspace({
  prospect,
  analyses,
  drafts,
  outreachEvents,
  evidence,
  activities,
  stageHistory,
  concepts,
}: {
  prospect: SignalProspect
  analyses: SignalAnalysis[]
  drafts: SignalOutreachDraft[]
  outreachEvents: SignalOutreachEvent[]
  evidence: SignalEvidenceLedgerItem[]
  activities: SignalLeadActivity[]
  stageHistory: SignalLeadStageHistory[]
  concepts: SignalConcept[]
}) {
  const router = useRouter()
  const started = useRef(false)
  const [working, setWorking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(prospect.analysis_error || null)
  const [stage, setStage] = useState<SignalPipelineStage>(prospect.pipeline_stage || "found")
  const [note, setNote] = useState("")
  const [eventSummary, setEventSummary] = useState("")
  const [eventChannel, setEventChannel] = useState("call")
  const [conceptInstructions, setConceptInstructions] = useState("")
  const [nextActionDraft, setNextActionDraft] = useState(prospect.next_action || "")
  const [nextActionDue, setNextActionDue] = useState(
    prospect.next_action_due_at ? new Date(prospect.next_action_due_at).toISOString().slice(0, 10) : "",
  )
  const [identityDraft, setIdentityDraft] = useState({
    business_name: prospect.business_name,
    industry: prospect.industry,
    city: prospect.city || "",
    state: prospect.state || "",
    public_address: prospect.public_address || "",
    public_phone: prospect.public_phone || "",
    website_url: prospect.website_url || "",
    instagram_url: prospect.instagram_url || "",
    facebook_url: prospect.facebook_url || "",
    chain_status: prospect.chain_status || "uncertain",
  })

  const latestAnalysis = analyses[0] || null
  const latestDraft = drafts[0] || null
  const latestConcept = concepts[0] || null
  const groupedEvidence = useMemo(() => Object.fromEntries(
    evidenceOrder.map((category) => [category, evidence.filter((item) => item.evidence_category === category)]),
  ) as Record<SignalEvidenceCategory, SignalEvidenceLedgerItem[]>, [evidence])

  async function runAnalysis() {
    if (working) return
    setWorking("analysis")
    setError(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/analyze`, { method: "POST" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Analysis could not complete.")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Analysis could not complete.")
    } finally {
      setWorking(null)
    }
  }

  useEffect(() => {
    if (prospect.analysis_status !== "queued" || started.current) return
    started.current = true
    void runAnalysis()
    // The queue state is the only trigger. The function is intentionally not
    // a dependency so a refresh cannot start duplicate work.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prospect.analysis_status])

  async function updateStage(nextStage: SignalPipelineStage) {
    setWorking("stage")
    setError(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/pipeline`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pipeline_stage: nextStage }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Stage could not be updated.")
      setStage(nextStage)
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Stage could not be updated.")
    } finally {
      setWorking(null)
    }
  }

  async function saveNextAction(event: React.FormEvent) {
    event.preventDefault()
    setWorking("next-action")
    setError(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/pipeline`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          pipeline_stage: stage,
          next_action: nextActionDraft.trim() || null,
          next_action_due_at: nextActionDue ? new Date(`${nextActionDue}T12:00:00`).toISOString() : null,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Next action could not be saved.")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Next action could not be saved.")
    } finally {
      setWorking(null)
    }
  }

  async function saveIdentity(event: React.FormEvent) {
    event.preventDefault()
    setWorking("identity")
    setError(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...identityDraft, classification_manual_override: true }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Identity corrections could not be saved.")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Identity corrections could not be saved.")
    } finally {
      setWorking(null)
    }
  }

  async function generateSalesPack() {
    setWorking("sales")
    setError(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/deep-dive`, { method: "POST" })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Sales pack could not be prepared.")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Sales pack could not be prepared.")
    } finally {
      setWorking(null)
    }
  }

  async function buildConcept() {
    setWorking("concept")
    setError(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/concept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instructions: conceptInstructions.trim() || null }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Concept prompt could not be prepared.")
      setConceptInstructions("")
      setStage(data.pipeline_stage || stage)
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Concept prompt could not be prepared.")
    } finally {
      setWorking(null)
    }
  }

  async function savePrivateNote(event: React.FormEvent) {
    event.preventDefault()
    if (!note.trim()) return
    setWorking("note")
    setError(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Note could not be saved.")
      setNote("")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Note could not be saved.")
    } finally {
      setWorking(null)
    }
  }

  async function logOutreach(event: React.FormEvent) {
    event.preventDefault()
    setWorking("outreach")
    setError(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/outreach-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: eventChannel,
          event_type: "attempted",
          summary: eventSummary.trim() || null,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Outreach could not be logged.")
      setEventSummary("")
      await updateStage("contacted")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Outreach could not be logged.")
    } finally {
      setWorking(null)
    }
  }

  const statusInProgress = ["queued", "resolving", "researching", "analyzing"].includes(prospect.analysis_status || "ready")
  const mustVerify = list(prospect.must_verify)
  const doNotPitch = list(prospect.do_not_pitch)

  return (
    <div className="space-y-6">
      <Link href="/dashboard/signal" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Signal inbox
      </Link>
      <PageHeader
        eyebrow="Signal lead workspace"
        title={prospect.business_name}
        subtitle={[prospect.industry, prospect.city, prospect.state].filter(Boolean).join(" · ") || "Business identity needs review"}
        meta={<StatusBadge tone={verdictTone(prospect.verdict)}>{prospect.verdict === "pending" ? analysisStatusLabel(prospect.analysis_status) : formatSignalLabel(prospect.verdict)}</StatusBadge>}
        actions={
          <>
            {prospect.website_url && <SecondaryAction href={prospect.website_url} icon={ExternalLink}>Public site</SecondaryAction>}
            <SecondaryAction href={`/dashboard/clients/new?signalId=${prospect.id}`} icon={Plus}>Create client</SecondaryAction>
            <SecondaryAction href={`/dashboard/projects/new?signalId=${prospect.id}`} icon={Plus}>Create project</SecondaryAction>
            <PrimaryAction onClick={runAnalysis} disabled={working === "analysis"} icon={working === "analysis" ? Loader2 : RefreshCw}>
              {statusInProgress ? "Analyzing…" : "Re-run analysis"}
            </PrimaryAction>
          </>
        }
      />

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {statusInProgress && (
        <div className="flex items-center gap-3 rounded-lg border border-blue-500/25 bg-blue-500/10 px-4 py-3 text-sm text-blue-100">
          <Loader2 className="h-4 w-4 animate-spin" />
          <div><p className="font-medium">{analysisStatusLabel(prospect.analysis_status)}</p><p className="mt-0.5 text-blue-100/70">The record is already saved. This workspace can be reopened if the request is interrupted.</p></div>
        </div>
      )}

      <SectionPanel title="Pipeline" description="Choose a stage explicitly. Every change is recorded in stage history.">
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-wrap gap-2" aria-label="Pipeline stages">
            {pipelineStages.map((item) => (
              <button key={item.value} type="button" onClick={() => updateStage(item.value)} disabled={working === "stage"} className={cn(
                "rounded-md border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50",
                stage === item.value ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
              )}>{item.label}</button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Updated {dateTime(prospect.updated_at)}</p>
        </div>
        <form onSubmit={saveNextAction} className="mt-4 grid gap-3 border-t border-border pt-4 lg:grid-cols-[1fr_180px_auto]">
          <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Next action</span><input value={nextActionDraft} onChange={(event) => setNextActionDraft(event.target.value)} maxLength={1000} placeholder="Specific manual next step" className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" /></label>
          <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Due date</span><input type="date" value={nextActionDue} onChange={(event) => setNextActionDue(event.target.value)} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" /></label>
          <PrimaryAction type="submit" disabled={working === "next-action"} icon={working === "next-action" ? Loader2 : Check}>Save next action</PrimaryAction>
        </form>
      </SectionPanel>

      <Tabs defaultValue="summary" className="space-y-5">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
          {["summary", "research", "verdict", "concept", "sales", "outreach", "notes", "activity"].map((tab) => (
            <TabsTrigger key={tab} value={tab} className="shrink-0 capitalize">{tab}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="summary" className="space-y-5">
          <div className="grid gap-3 md:grid-cols-3">
            {[
              ["Opportunity", prospect.opportunity_label],
              ["Confidence", prospect.confidence_label],
              ["Approachability", prospect.approachability_label],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-2 text-xl font-semibold capitalize text-foreground">{value || "Unknown"}</p>
              </div>
            ))}
          </div>
          <div className="grid gap-5 xl:grid-cols-2">
            <SectionPanel title="Primary opportunity" description="One focused problem, not a list of speculative services.">
              <p className="text-lg font-medium text-foreground">{prospect.primary_opportunity || "Analysis has not identified a defensible opportunity yet."}</p>
              {prospect.why_it_matters && <p className="mt-3 text-sm leading-6 text-muted-foreground">{prospect.why_it_matters}</p>}
            </SectionPanel>
            <SectionPanel title="Smallest sensible offer" description="The narrowest useful starting scope supported by current evidence.">
              <p className="text-lg font-medium text-foreground">{prospect.smallest_offer || "Verify the business before defining an offer."}</p>
              <p className="mt-3 text-sm text-muted-foreground">Next: {prospect.next_action || "Complete focused analysis."}</p>
            </SectionPanel>
          </div>
          <SectionPanel title="Identity and contact routes">
            <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div><p className="text-xs text-muted-foreground">Identity</p><p className="mt-1 capitalize">{formatSignalLabel(prospect.identity_status)}</p></div>
              <div><p className="text-xs text-muted-foreground">Phone</p><p className="mt-1">{prospect.public_phone || "Not verified"}</p></div>
              <div><p className="text-xs text-muted-foreground">Address or service area</p><p className="mt-1">{prospect.public_address || [prospect.city, prospect.state].filter(Boolean).join(", ") || "Not verified"}</p></div>
              <div><p className="text-xs text-muted-foreground">Preferred channel</p><p className="mt-1 capitalize">{latestAnalysis?.suggested_channel ? formatSignalLabel(latestAnalysis.suggested_channel) : "Needs research"}</p></div>
            </div>
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div><p className="text-xs text-muted-foreground">Business status</p><p className="mt-1">{formatSignalLabel(prospect.business_status || "unknown")}</p></div>
              <div><p className="text-xs text-muted-foreground">Ownership pattern</p><p className="mt-1">{formatSignalLabel(prospect.chain_status || "uncertain")}</p></div>
              <div><p className="text-xs text-muted-foreground">Instagram</p><p className="mt-1 break-all">{prospect.instagram_url || "Not verified"}</p></div>
              <div><p className="text-xs text-muted-foreground">Facebook</p><p className="mt-1 break-all">{prospect.facebook_url || "Not verified"}</p></div>
            </div>
            {list(prospect.opening_hours).length > 0 && <p className="mt-4 text-xs leading-5 text-muted-foreground">Verified listing hours: {list(prospect.opening_hours).join(" · ")}</p>}
            <details className="mt-4 border-t border-border pt-4">
              <summary className="cursor-pointer text-sm font-medium text-foreground">Correct identity details</summary>
              <form onSubmit={saveIdentity} className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {([
                  ["business_name", "Business name"], ["industry", "Category"], ["city", "City"], ["state", "State"],
                  ["public_phone", "Phone"], ["website_url", "Official website"], ["facebook_url", "Facebook"], ["instagram_url", "Instagram"],
                ] as const).map(([field, label]) => <label key={field} className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span><input value={identityDraft[field]} onChange={(event) => setIdentityDraft((current) => ({ ...current, [field]: event.target.value }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" /></label>)}
                <label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Address or service area</span><input value={identityDraft.public_address} onChange={(event) => setIdentityDraft((current) => ({ ...current, public_address: event.target.value }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" /></label>
                <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Ownership pattern</span><select value={identityDraft.chain_status} onChange={(event) => setIdentityDraft((current) => ({ ...current, chain_status: event.target.value as typeof current.chain_status }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"><option value="uncertain">Uncertain</option><option value="independent">Independent</option><option value="likely_independent">Likely independent</option><option value="local_multi_location">Local multi-location</option><option value="likely_franchise">Likely franchise</option><option value="chain">Chain</option></select></label>
                <div className="sm:col-span-2 xl:col-span-3"><PrimaryAction type="submit" disabled={working === "identity"} icon={working === "identity" ? Loader2 : Check}>Save identity corrections</PrimaryAction></div>
              </form>
            </details>
          </SectionPanel>
        </TabsContent>

        <TabsContent value="research" className="space-y-5">
          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Evidence categories are intentionally separate. Private observations can guide review, but only verified public facts may be used as public business claims.
          </div>
          {evidenceOrder.map((category) => (
            <SectionPanel key={category} title={evidenceLabels[category]} description={`${groupedEvidence[category].length} item${groupedEvidence[category].length === 1 ? "" : "s"}`}>
              {groupedEvidence[category].length > 0 ? (
                <div className="space-y-2">
                  {groupedEvidence[category].map((item) => (
                    <div key={item.id} className="rounded-lg border border-border bg-muted/15 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div><p className="text-sm font-medium text-foreground">{formatSignalLabel(item.claim_type)}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.claim_text}</p></div>
                        <StatusBadge tone={item.verification_status === "verified" ? "green" : item.verification_status === "contradicted" ? "red" : "default"}>{formatSignalLabel(item.verification_status)}</StatusBadge>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{formatSignalLabel(item.evidence_tier)}</span>
                        {item.confidence != null && <span>{item.confidence}% evidence confidence</span>}
                        {item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">Source <ExternalLink className="h-3 w-3" /></a>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : <p className="text-sm text-muted-foreground">No items in this category.</p>}
            </SectionPanel>
          ))}
        </TabsContent>

        <TabsContent value="verdict" className="space-y-5">
          <SectionPanel title={`${formatSignalLabel(prospect.verdict)} verdict`} description="A sales decision, not a guarantee of fit or outcome.">
            <p className="text-lg font-medium text-foreground">{prospect.why_it_matters || "The verdict will appear after analysis."}</p>
          </SectionPanel>
          <div className="grid gap-5 xl:grid-cols-2">
            <SectionPanel title="Must verify" description="Resolve these before first contact or concept publication.">
              {mustVerify.length ? <ul className="space-y-2 text-sm text-muted-foreground">{mustVerify.map((item) => <li key={item} className="flex gap-2"><FileSearch className="mt-0.5 h-4 w-4 shrink-0" />{item}</li>)}</ul> : <p className="text-sm text-muted-foreground">No unresolved items were recorded.</p>}
            </SectionPanel>
            <SectionPanel title="Do not pitch" description="Claims or angles that would overstate the current evidence.">
              {doNotPitch.length ? <ul className="space-y-2 text-sm text-muted-foreground">{doNotPitch.map((item) => <li key={item} className="flex gap-2"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-yellow-200" />{item}</li>)}</ul> : <p className="text-sm text-muted-foreground">No pitch guardrails recorded yet.</p>}
            </SectionPanel>
          </div>
        </TabsContent>

        <TabsContent value="concept" className="space-y-5">
          <SectionPanel title="Build concept" description="Optional direction changes the presentation, never the verified business facts.">
            <div className="space-y-3">
              <textarea value={conceptInstructions} onChange={(event) => setConceptInstructions(event.target.value)} rows={3} maxLength={1000} placeholder="Make it warmer, focus on catering, keep the phone button dominant…" className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-foreground/30" />
              <PrimaryAction onClick={buildConcept} disabled={working === "concept" || prospect.verdict === "skip"} icon={working === "concept" ? Loader2 : Sparkles}>{latestConcept ? "Regenerate concept prompt" : "Build concept"}</PrimaryAction>
            </div>
          </SectionPanel>
          <SectionPanel title="Concept direction" description="The prompt uses verified public facts and labels every unknown as a placeholder.">
            {latestConcept ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3"><StatusBadge tone={latestConcept.status === "ready" ? "green" : "blue"}>{formatSignalLabel(latestConcept.status)}</StatusBadge><CopyButton value={latestConcept.generation_prompt} /></div>
                <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-4 font-sans text-sm leading-6 text-muted-foreground">{latestConcept.generation_prompt}</pre>
                {latestConcept.concept_url && <a href={latestConcept.concept_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline">Open concept <ExternalLink className="h-4 w-4" /></a>}
              </div>
            ) : <p className="text-sm text-muted-foreground">A concept prompt appears after a Pursue or Investigate analysis. Skip verdicts do not generate one.</p>}
          </SectionPanel>
        </TabsContent>

        <TabsContent value="sales" className="space-y-5">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
            <div><p className="font-medium text-foreground">Evidence-grounded sales pack</p><p className="mt-1 text-sm text-muted-foreground">Generate only after reviewing the verdict and Must verify list. Scripts never promise results.</p></div>
            <PrimaryAction onClick={generateSalesPack} disabled={working === "sales" || prospect.verdict === "skip"} icon={working === "sales" ? Loader2 : Sparkles}>{latestDraft ? "Regenerate sales pack" : "Prepare sales pack"}</PrimaryAction>
          </div>
          {latestDraft ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <ScriptBlock label="Call opener" value={latestDraft.owner_call_opener} />
              <ScriptBlock label="Gatekeeper" value={latestDraft.gatekeeper_script} />
              <ScriptBlock label="Voicemail" value={latestDraft.voicemail_script} />
              <ScriptBlock label="First email" value={latestDraft.first_contact_email} />
              <ScriptBlock label="Social message" value={latestDraft.permission_based_dm} />
              <ScriptBlock label="Follow-up" value={latestDraft.follow_up_email || latestDraft.demo_send_followup} />
              <ScriptBlock label="Proposal angle" value={latestDraft.proposal_angle} />
            </div>
          ) : <SectionPanel><p className="text-sm text-muted-foreground">No sales pack has been prepared. Review evidence first, then generate a draft for manual approval.</p></SectionPanel>}
        </TabsContent>

        <TabsContent value="outreach" className="space-y-5">
          <SectionPanel title="Log manual outreach" description="Signal prepares drafts; it does not send outreach automatically.">
            <form onSubmit={logOutreach} className="grid gap-3 lg:grid-cols-[180px_1fr_auto]">
              <select value={eventChannel} onChange={(event) => setEventChannel(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm">
                <option value="call">Call</option><option value="email">Email</option><option value="instagram">Instagram</option><option value="contact_form">Contact form</option><option value="in_person">In person</option>
              </select>
              <input value={eventSummary} onChange={(event) => setEventSummary(event.target.value)} placeholder="Short outcome or context" className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" />
              <PrimaryAction type="submit" disabled={working === "outreach"} icon={MessageSquare}>Log attempt</PrimaryAction>
            </form>
          </SectionPanel>
          <SectionPanel title="Outreach history">
            {outreachEvents.length ? <div className="space-y-2">{outreachEvents.map((item) => <div key={item.id} className="rounded-lg border border-border bg-muted/15 p-3"><div className="flex flex-wrap items-center gap-2"><StatusBadge>{formatSignalLabel(item.channel)}</StatusBadge><p className="text-sm font-medium">{formatSignalLabel(item.event_type)}</p><span className="text-xs text-muted-foreground">{dateTime(item.event_date || item.created_at)}</span></div>{item.summary && <p className="mt-2 text-sm text-muted-foreground">{item.summary}</p>}</div>)}</div> : <p className="text-sm text-muted-foreground">No outreach has been logged.</p>}
          </SectionPanel>
        </TabsContent>

        <TabsContent value="notes" className="space-y-5">
          <SectionPanel title="Private Mountline notes" description="Notes stay separate from verified public facts and are not copied into public claims.">
            <form onSubmit={savePrivateNote} className="space-y-3"><textarea value={note} onChange={(event) => setNote(event.target.value)} rows={4} placeholder="Add context from a visit, call, or internal review." className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-foreground/30" /><PrimaryAction type="submit" disabled={!note.trim() || working === "note"} icon={Plus}>Add private note</PrimaryAction></form>
          </SectionPanel>
          {groupedEvidence.mountline_observation.map((item) => <div key={item.id} className="rounded-lg border border-border bg-card p-4"><p className="text-sm leading-6 text-muted-foreground">{item.claim_text}</p><p className="mt-2 text-xs text-muted-foreground">Added {dateTime(item.created_at)}</p></div>)}
        </TabsContent>

        <TabsContent value="activity" className="space-y-5">
          <SectionPanel title="Activity timeline" description="Research, stage changes, concept work, and manual actions.">
            <div className="space-y-4 border-l border-border pl-5">
              {activities.length ? activities.map((item) => <div key={item.id} className="relative"><span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-foreground" /><p className="text-sm font-medium text-foreground">{item.summary}</p><p className="mt-1 text-xs text-muted-foreground">{formatSignalLabel(item.activity_type)} · {dateTime(item.occurred_at)}</p></div>) : <p className="text-sm text-muted-foreground">No activity recorded.</p>}
            </div>
          </SectionPanel>
          <SectionPanel title="Stage history">
            <div className="space-y-2">{stageHistory.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm"><span className="text-muted-foreground">{item.from_stage ? formatSignalLabel(item.from_stage) : "Created"}</span><ArrowRight className="h-3.5 w-3.5" /><span className="font-medium">{formatSignalLabel(item.to_stage)}</span><span className="ml-auto text-xs text-muted-foreground">{dateTime(item.created_at)}</span></div>)}</div>
          </SectionPanel>
        </TabsContent>
      </Tabs>
    </div>
  )
}
