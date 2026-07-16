"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  Check,
  Clipboard,
  Eye,
  ExternalLink,
  FileSearch,
  Loader2,
  Mail,
  MessageCircleMore,
  MessageSquare,
  Phone,
  Play,
  Plus,
  RefreshCw,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Smartphone,
  Target,
  X,
} from "lucide-react"
import { toast } from "sonner"
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
  SignalIdentityCandidateRecord,
  SignalIdentityCorrectionHistoryItem,
  SignalLeadActivity,
  SignalLeadStageHistory,
  SignalOutreachDraft,
  SignalOutreachEvent,
  SignalPipelineStage,
  SignalProspect,
  SignalVerificationItem,
} from "@/lib/supabase/types"
import { signalIdentityStateLabel } from "@/lib/signal/identity-resolution"
import { validateSignalArtifactCurrent } from "@/lib/signal/copilot"
import { formatSignalLabel } from "@/lib/signal/presentation"
import { cn } from "@/lib/utils"

const evidenceOrder: SignalEvidenceCategory[] = [
  "verified_public_fact",
  "likely_inference",
  "unverified_claim",
  "rejected_source",
  "mountline_observation",
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

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
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
  if (["skip", "wrong_match", "could_not_resolve"].includes(verdict || "")) return "red" as const
  return "default" as const
}

function confidenceExplanation(value: number | null | undefined) {
  if (value == null) return "Confidence not calibrated"
  if (value >= 78) return "Strong support from independent identity facts"
  if (value >= 55) return "Moderate support; one strong corroborating fact is still useful"
  return "Limited support; do not use this as a business fact yet"
}

function analysisStatusLabel(status: SignalProspect["analysis_status"]) {
  if (["resolving", "researching", "analyzing"].includes(status || "ready")) return "Analysis in progress"
  if (status === "queued") return "Analysis queued"
  if (status === "needs_review") return "Analysis needs review"
  if (status === "failed") return "Analysis failed"
  return status === "ready" ? "Analysis ready" : formatSignalLabel(status || "unknown")
}

function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1400)
  }
  return (
    <button type="button" onClick={copy} className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
      {copied ? <Check className="h-3.5 w-3.5" /> : <Clipboard className="h-3.5 w-3.5" />}
      {copied ? "Copied" : label}
    </button>
  )
}

function ScriptBlock({
  label,
  value,
  variants,
}: {
  label: string
  value: string | null | undefined
  variants?: Record<string, string>
}) {
  const [activeVariant, setActiveVariant] = useState("original")
  const [currentValue, setCurrentValue] = useState(value || "")
  useEffect(() => {
    setCurrentValue(value || "")
    setActiveVariant("original")
  }, [value])
  if (!value) return null
  const controls = [
    ["shorter", "Tighten"],
    ["natural", "Make more natural"],
    ["more_specific", "Make more specific"],
    ["remove_jargon", "Remove jargon"],
    ["higher_confidence", "Add confidence"],
    ["low_pressure", "Reduce pressure"],
  ] as const
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <h3 className="text-sm font-medium text-foreground">{label}</h3>
        <CopyButton value={currentValue} />
      </div>
      <p className="whitespace-pre-wrap text-sm leading-6 text-muted-foreground">{currentValue}</p>
      {variants && (
        <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border pt-3" aria-label={`${label} delivery controls`}>
          {controls.map(([key, controlLabel]) => variants[key] && (
            <button
              key={key}
              type="button"
              onClick={() => {
                setActiveVariant(key)
                setCurrentValue(variants[key])
              }}
              className={cn(
                "rounded-md border px-2 py-1 text-[11px] font-medium transition-colors",
                activeVariant === key
                  ? "border-foreground bg-foreground text-background"
                  : "border-border text-muted-foreground hover:bg-hover hover:text-foreground",
              )}
            >
              {controlLabel}
            </button>
          ))}
          {activeVariant !== "original" && <button type="button" onClick={() => { setActiveVariant("original"); setCurrentValue(value) }} className="rounded-md px-2 py-1 text-[11px] text-muted-foreground hover:text-foreground">Reset</button>}
        </div>
      )}
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
  identityCandidates,
  verificationItems,
  correctionHistory,
}: {
  prospect: SignalProspect
  analyses: SignalAnalysis[]
  drafts: SignalOutreachDraft[]
  outreachEvents: SignalOutreachEvent[]
  evidence: SignalEvidenceLedgerItem[]
  activities: SignalLeadActivity[]
  stageHistory: SignalLeadStageHistory[]
  concepts: SignalConcept[]
  identityCandidates: SignalIdentityCandidateRecord[]
  verificationItems: SignalVerificationItem[]
  correctionHistory: SignalIdentityCorrectionHistoryItem[]
}) {
  const router = useRouter()
  const started = useRef(false)
  const pipelineSection = useRef<HTMLDivElement>(null)
  const dueDateInput = useRef<HTMLInputElement>(null)
  const [working, setWorking] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(prospect.analysis_error || null)
  const [stage, setStage] = useState<SignalPipelineStage>(prospect.pipeline_stage || "found")
  const [activeTab, setActiveTab] = useState("decision")
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
    canonical_name: prospect.canonical_name || prospect.business_name,
    industry: prospect.industry,
    city: prospect.city || "",
    state: prospect.state || "",
    public_address: prospect.public_address || "",
    public_phone: prospect.public_phone || "",
    website_url: prospect.website_url || "",
    instagram_url: prospect.instagram_url || "",
    facebook_url: prospect.facebook_url || "",
    chain_status: prospect.chain_status || "uncertain",
    business_location_type: prospect.business_location_type || "unknown",
    maps_url: prospect.submitted_url?.includes("google") || prospect.submitted_url?.includes("goo.gl") ? prospect.submitted_url : "",
    verification_source: "personally_verified",
    note: "",
  })

  const activeVersions = {
    identity: prospect.identity_version || 1,
    evidence: prospect.evidence_version || 1,
  }
  const activeIdentity = {
    canonical_name: prospect.canonical_name || prospect.business_name,
    public_address: prospect.public_address,
    public_phone: prospect.public_phone,
    industry: prospect.industry,
    website_url: prospect.website_url,
    instagram_url: prospect.instagram_url,
    facebook_url: prospect.facebook_url,
    provider_place_id: prospect.provider_place_id,
    chain_status: prospect.chain_status,
  }
  function artifactIsCurrent(artifact: SignalAnalysis | SignalOutreachDraft | SignalConcept) {
    if (artifact.is_current === false) return false
    return validateSignalArtifactCurrent({
      artifactIdentityVersion: artifact.identity_version || 1,
      activeIdentityVersion: activeVersions.identity,
      artifactEvidenceVersion: artifact.evidence_version || 1,
      activeEvidenceVersion: activeVersions.evidence,
      artifactSnapshot: record(artifact.input_snapshot),
      activeIdentity,
      staleAt: artifact.stale_at,
    }).current
  }
  const latestAnalysis = analyses.find(artifactIsCurrent) || null
  const latestDraft = drafts.find(artifactIsCurrent) || null
  const latestStudio = record(latestDraft?.script_studio)
  const studioVariants = Object.fromEntries(
    Object.entries(record(latestStudio.variants)).filter((entry): entry is [string, string] => typeof entry[1] === "string"),
  )
  const latestConcept = concepts.find(artifactIsCurrent) || null
  const outdatedConcepts = concepts.filter((item) => !artifactIsCurrent(item))
  const outdatedDrafts = drafts.filter((item) => !artifactIsCurrent(item))
  const groupedEvidence = useMemo(() => Object.fromEntries(
    evidenceOrder.map((category) => [category, evidence.filter((item) => item.evidence_category === category)]),
  ) as Record<SignalEvidenceCategory, SignalEvidenceLedgerItem[]>, [evidence])
  const evidenceSections = useMemo(() => [
    { key: "verified", label: "Verified", items: evidence.filter((item) => item.evidence_category === "verified_public_fact") },
    { key: "needs-confirmation", label: "Needs confirmation", items: evidence.filter((item) => ["likely_inference", "unverified_claim"].includes(item.evidence_category)) },
    { key: "observations", label: "Luke’s observations", items: evidence.filter((item) => item.evidence_category === "mountline_observation") },
    { key: "unknown", label: "Unknown", items: evidence.filter((item) => item.evidence_category === "unknown") },
  ], [evidence])
  const identityState = prospect.identity_resolution_state || (prospect.identity_status === "verified" ? "verified" : "unresolved")
  const identityVerified = ["exact_match", "user_confirmed", "verified"].includes(identityState)
  const sufficiency = record(prospect.research_sufficiency)
  const opportunitySufficiency = record(sufficiency.opportunity).status
  const salesPackState = prospect.sales_pack_state || "not_ready"
  const confidenceDimensionValues = record(prospect.confidence_dimensions)
  const approachabilityPlan = record(prospect.approachability_plan)
  const actionAvailability = record(prospect.action_availability)
  const actionState = (key: string) => record(actionAvailability[key])
  const actionEnabled = (key: string, fallback = false) => actionState(key).enabled === true || (actionState(key).enabled === undefined && fallback)
  const actionReason = (key: string) => typeof actionState(key).reason === "string" ? String(actionState(key).reason) : undefined
  const canBuildConcept = actionEnabled("concept", identityVerified && prospect.verdict === "pursue" && opportunitySufficiency === "sufficient")
  const canPrepareSales = actionEnabled("sales_pack", ["draft_outreach", "fully_personalized"].includes(salesPackState))
  const canCreateClientProject = identityVerified && ["interested", "proposal", "won"].includes(stage) && record(sufficiency.sales).status !== "insufficient"
  const openVerificationItems = verificationItems.filter((item) => item.status === "unresolved")
  const executiveRecommendation = record(prospect.executive_recommendation)
  const opportunityBrief = record(prospect.opportunity_brief)
  const nextActionPlan = record(prospect.next_action_plan)
  const businessProfile = record(prospect.business_profile)
  const uncertaintyBudget = (Array.isArray(prospect.uncertainty_budget) ? prospect.uncertainty_budget : [])
    .map(record)
    .filter((item) => Object.keys(item).length > 0)
  const researchMissions = (Array.isArray(prospect.research_missions) ? prospect.research_missions : [])
    .map(record)
    .filter((item) => Object.keys(item).length > 0)
  const providerLimitations = (Array.isArray(prospect.provider_limitations) ? prospect.provider_limitations : [])
    .map(record)
    .filter((item) => Object.keys(item).length > 0)
  const providerLimitation = providerLimitations[0]
  const recommendationReasons = list(executiveRecommendation.why)
  const verificationQuestions = uncertaintyBudget
    .filter((item) => item.classification !== "non_blocking")
    .map((item) => String(item.question || ""))
    .filter(Boolean)

  async function runAnalysis(scope: "full" | "identity" | "website" | "social" | "opportunity" | "sales" = "full") {
    if (working) return
    setWorking("analysis")
    setError(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Analysis could not complete.")
      toast.success(scope === "full" ? "Signal analysis complete." : `${formatSignalLabel(scope)} resolution updated.`)
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
      if (nextStage === "won") toast.success("Lead won — nice work.")
      else if (nextStage === "contacted" && stage !== "contacted") toast.success("First contact recorded.")
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
      const response = await fetch(`/api/signal/prospects/${prospect.id}/identity`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...identityDraft,
          public_address: identityDraft.public_address || null,
          public_phone: identityDraft.public_phone || null,
          website_url: identityDraft.website_url || null,
          facebook_url: identityDraft.facebook_url || null,
          instagram_url: identityDraft.instagram_url || null,
          maps_url: identityDraft.maps_url || null,
          note: identityDraft.note || null,
        }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Identity corrections could not be saved.")
      toast.success(data.artifacts_invalidated ? "Identity corrected. Signal removed outdated work and is regenerating the affected analysis." : "Identity correction saved.")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Identity corrections could not be saved.")
    } finally {
      setWorking(null)
    }
  }

  async function updateCandidate(candidateId: string, action: "confirm" | "unrelated") {
    setWorking(`candidate:${candidateId}`)
    setError(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/identity/candidates/${candidateId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Identity candidate could not be updated.")
      toast.success(action === "confirm" ? "Business confirmed. Signal will continue from this identity." : "Candidate marked unrelated.")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Identity candidate could not be updated.")
    } finally {
      setWorking(null)
    }
  }

  async function rejectAllCandidates() {
    setWorking("none-candidates")
    setError(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/identity`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "none_of_these" }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Candidates could not be rejected.")
      toast.success("Suggested matches rejected. The submitted business name is preserved.")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Candidates could not be rejected.")
    } finally {
      setWorking(null)
    }
  }

  async function resolveVerification(itemId: string, status: "resolved" | "unrelated") {
    setWorking(`verification:${itemId}`)
    setError(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/verification/${itemId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      })
      const data = await response.json()
      if (!response.ok) throw new Error(data.error || "Verification item could not be updated.")
      toast.success(status === "resolved" ? "Verification item resolved." : "Source marked unrelated.")
      router.refresh()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Verification item could not be updated.")
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
      toast.success("Sales pack ready for review.")
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
      toast.success("Concept prompt ready.")
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
  const quickOpener = latestDraft?.owner_call_opener || null
  const quickFollowUp = latestDraft?.follow_up_email || latestDraft?.demo_send_followup || null

  function moveToPipeline() {
    pipelineSection.current?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  function scheduleFollowUp() {
    moveToPipeline()
    window.setTimeout(() => dueDateInput.current?.focus(), 350)
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/signal" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" /> Signal inbox
      </Link>
      <PageHeader
        eyebrow="Signal lead workspace"
        title={prospect.display_name || prospect.submitted_name || prospect.business_name}
        subtitle={[prospect.submitted_location || prospect.public_address || [prospect.city, prospect.state].filter(Boolean).join(", "), signalIdentityStateLabel(identityState)].filter(Boolean).join(" · ")}
        meta={<StatusBadge tone={verdictTone(prospect.verdict)}>{prospect.verdict === "pending" ? analysisStatusLabel(prospect.analysis_status) : formatSignalLabel(prospect.verdict)}</StatusBadge>}
        actions={
          <>
            {prospect.website_url && <SecondaryAction href={prospect.website_url} icon={ExternalLink}>Public site</SecondaryAction>}
            {canCreateClientProject && <SecondaryAction href={`/dashboard/clients/new?signalId=${prospect.id}`} icon={Plus}>Create client</SecondaryAction>}
            {canCreateClientProject && <SecondaryAction href={`/dashboard/projects/new?signalId=${prospect.id}`} icon={Plus}>Create project</SecondaryAction>}
            <PrimaryAction onClick={() => identityVerified ? void runAnalysis("full") : setActiveTab("identity")} disabled={working === "analysis"} icon={working === "analysis" ? Loader2 : identityVerified ? RefreshCw : ShieldCheck}>
              {statusInProgress ? "Analyzing…" : identityVerified ? "Re-run analysis" : "Confirm identity"}
            </PrimaryAction>
          </>
        }
      />

      <section className="rounded-xl border border-border bg-card p-5" aria-labelledby="signal-recommendation-title">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge tone={verdictTone(prospect.verdict)}>{formatSignalLabel(prospect.assistance_mode || "identity_resolution")}</StatusBadge>
              {prospect.artifacts_regenerating && <StatusBadge tone="amber">Regenerating affected work</StatusBadge>}
            </div>
            <h2 id="signal-recommendation-title" className="mt-4 text-2xl font-semibold tracking-tight text-foreground">
              {typeof executiveRecommendation.decision === "string" ? executiveRecommendation.decision : prospect.verdict === "pursue" ? "Pursue now" : prospect.verdict === "investigate" ? "Verify one detail, then pursue" : "Research further"}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              {recommendationReasons[0] || prospect.why_it_matters || "Signal is resolving the exact business and the safest useful next move."}
            </p>
            {recommendationReasons.length > 1 && <ul className="mt-3 grid gap-1.5 text-sm text-muted-foreground sm:grid-cols-2">{recommendationReasons.slice(1, 4).map((reason) => <li key={reason} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />{reason}</li>)}</ul>}
          </div>
          <div className="shrink-0">
            {actionEnabled("call", Boolean(prospect.public_phone)) && prospect.public_phone
              ? <PrimaryAction href={`tel:${prospect.public_phone}`} icon={Phone}>{prospect.assistance_mode === "verification_outreach" ? "Start verification call" : "Call now"}</PrimaryAction>
              : <PrimaryAction onClick={() => setActiveTab(identityVerified ? "sales" : "identity")} icon={identityVerified ? MessageSquare : ShieldCheck}>{identityVerified ? "Open prepared tools" : "Confirm identity"}</PrimaryAction>}
          </div>
        </div>
      </section>

      {providerLimitation && (
        <div className="rounded-lg border border-information-border bg-information-soft px-4 py-3 text-sm text-information-foreground">
          <p className="font-medium">Analysis completed with a provider limitation</p>
          <p className="mt-1 text-information-foreground/75">{String(providerLimitation.user_explanation || "One research provider was unavailable. Signal used the remaining public evidence.")}</p>
          <Link href="/dashboard/settings" className="mt-2 inline-flex text-xs font-medium underline underline-offset-4">Review integrations</Link>
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionPanel title="Next move" description={typeof nextActionPlan.reason === "string" ? nextActionPlan.reason : "One exact action based on the current lead state."}>
          <p className="text-lg font-medium leading-7 text-foreground">{typeof nextActionPlan.exact_instruction === "string" ? nextActionPlan.exact_instruction : prospect.next_action || "Finish the active analysis."}</p>
          {typeof nextActionPlan.completion_criteria === "string" && <p className="mt-3 text-sm text-muted-foreground"><span className="font-medium text-foreground">Done when:</span> {nextActionPlan.completion_criteria}</p>}
          {list(nextActionPlan.required_preparation).length > 0 && <details className="mt-4"><summary className="cursor-pointer text-xs font-medium text-muted-foreground">Preparation</summary><ul className="mt-2 space-y-1 text-sm text-muted-foreground">{list(nextActionPlan.required_preparation).map((item) => <li key={item}>• {item}</li>)}</ul></details>}
        </SectionPanel>
        <SectionPanel title="Opportunity" description="The customer situation, the narrow improvement, and the honest boundary.">
          <p className="text-sm leading-6 text-muted-foreground">{typeof opportunityBrief.current_situation === "string" ? opportunityBrief.current_situation : prospect.primary_opportunity || "Signal is still resolving the opportunity."}</p>
          <p className="mt-3 text-base font-medium leading-6 text-foreground">{typeof opportunityBrief.smallest_sensible_offer === "string" ? opportunityBrief.smallest_sensible_offer : prospect.smallest_offer || "No offer yet."}</p>
          {verificationQuestions[0] && <p className="mt-3 text-xs text-warning-foreground">Confirm: {verificationQuestions[0]}</p>}
        </SectionPanel>
        <SectionPanel title="Prepared tools" description={typeof executiveRecommendation.prepared_asset === "string" ? executiveRecommendation.prepared_asset : "Tools unlock according to readiness."}>
          <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
            <PreparedTool label="Verification call" ready={actionEnabled("verification_call", identityVerified && Boolean(prospect.public_phone))} reason={actionReason("verification_call")} />
            <PreparedTool label="Sales pack" ready={canPrepareSales} reason={actionReason("sales_pack")} />
            <PreparedTool label="Concept brief" ready={canBuildConcept} reason={actionReason("concept")} />
            <PreparedTool label="Practice and teleprompter" ready={actionEnabled("practice", canPrepareSales)} reason={actionReason("practice")} />
          </div>
        </SectionPanel>
      </div>

      <section className="rounded-lg border border-border bg-surface p-3" aria-label="Lead quick actions">
        <div className="mb-2 flex items-center justify-between gap-3 px-1">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">Quick actions</p>
          <p className="hidden text-xs text-muted-foreground sm:block">Only available actions use stored contact data.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <QuickAction href={`/dashboard/signal/${prospect.id}/action?mode=focus`} icon={Target} label="Focus" disabled={!actionEnabled("focus", identityVerified && prospect.verdict === "pursue")} reason={actionReason("focus")} />
          <QuickAction href={`/dashboard/signal/${prospect.id}/action?mode=practice`} icon={MessageCircleMore} label="Practice" disabled={!actionEnabled("practice", canPrepareSales)} reason={actionReason("practice")} />
          <QuickAction href={`/dashboard/signal/${prospect.id}/action?mode=teleprompter`} icon={Play} label="Teleprompter" disabled={!actionEnabled("teleprompter", canPrepareSales)} reason={actionReason("teleprompter")} />
          {quickOpener && canPrepareSales ? <CopyButton value={quickOpener} label="Copy opener" /> : <QuickAction icon={Clipboard} label="Copy opener" disabled />}
          {quickFollowUp && canPrepareSales ? <CopyButton value={quickFollowUp} label="Copy follow-up" /> : <QuickAction icon={Send} label="Copy follow-up" disabled />}
          <QuickAction href={prospect.website_url || undefined} icon={ExternalLink} label="Website" disabled={!identityVerified || !prospect.website_url} external />
          <QuickAction href={prospect.public_phone ? `tel:${prospect.public_phone}` : undefined} icon={Phone} label="Call" disabled={!actionEnabled("call", canPrepareSales && Boolean(prospect.public_phone)) || !prospect.public_phone} reason={actionReason("call")} />
          <QuickAction href={prospect.public_phone ? `sms:${prospect.public_phone}` : undefined} icon={Smartphone} label="Text" disabled={!actionEnabled("text", canPrepareSales && Boolean(prospect.public_phone)) || !prospect.public_phone} reason={actionReason("text")} />
          <QuickAction href={prospect.public_email ? `mailto:${prospect.public_email}` : undefined} icon={Mail} label="Email" disabled={!actionEnabled("email", canPrepareSales && Boolean(prospect.public_email)) || !prospect.public_email} reason={actionReason("email")} />
          <QuickAction onClick={() => setActiveTab("concept")} icon={Sparkles} label="Build concept" disabled={!canBuildConcept} reason={actionReason("concept")} />
          <QuickAction onClick={() => setActiveTab("notes")} icon={Plus} label="Add observation" />
          <QuickAction onClick={scheduleFollowUp} icon={CalendarClock} label="Schedule follow-up" disabled={!identityVerified} />
          <QuickAction onClick={() => updateStage("contacted")} icon={Check} label="Mark contacted" disabled={!actionEnabled("log_outreach", canPrepareSales) || stage === "contacted" || working === "stage"} reason={actionReason("log_outreach")} />
          <QuickAction onClick={moveToPipeline} icon={Eye} label="Move stage" disabled={!identityVerified} />
        </div>
      </section>

      {error && (
        <div className="flex items-start gap-2 rounded-lg border border-error-border bg-error-soft px-3 py-2 text-sm text-error-foreground">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" /> {error}
        </div>
      )}
      {statusInProgress && (
        <div className="flex items-center gap-3 rounded-lg border border-information-border bg-information-soft px-4 py-3 text-sm text-information-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          <div><p className="font-medium">{analysisStatusLabel(prospect.analysis_status)}</p><p className="mt-0.5 text-information-foreground/70">The record is already saved. This workspace can be reopened if the request is interrupted.</p></div>
        </div>
      )}
      {!identityVerified && !statusInProgress && (
        <div className="rounded-lg border border-warning-border bg-warning-soft p-4 text-sm text-warning-foreground">
          <div className="flex items-start gap-3">
            <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="flex-1">
              <p className="font-medium">Signal has not verified that the discovered sources belong to {prospect.submitted_name || prospect.business_name}.</p>
              <p className="mt-1 text-warning-foreground/75">The submitted name remains the workspace identity. Opportunity, concepts, outreach, and client/project creation stay gated.</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" onClick={() => setActiveTab("identity")} className="rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background">Review matches</button>
                <button type="button" onClick={() => { setActiveTab("identity"); window.setTimeout(() => document.getElementById("identity-correction")?.scrollIntoView({ behavior: "smooth" }), 100) }} className="rounded-md border border-warning-border px-3 py-2 text-xs font-medium">Correct identity</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div ref={pipelineSection}>
      <SectionPanel title="Pipeline" description={identityVerified ? "Choose a stage explicitly. Every change is recorded in stage history." : "Pipeline actions unlock after the exact business is confirmed."}>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto] lg:items-center">
          <div className="flex flex-wrap gap-2" aria-label="Pipeline stages">
            {pipelineStages.map((item) => (
              <button key={item.value} type="button" onClick={() => updateStage(item.value)} disabled={!identityVerified || working === "stage"} className={cn(
                "rounded-md border px-3 py-2 text-xs font-medium transition-colors disabled:opacity-50",
                stage === item.value ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:bg-muted hover:text-foreground",
              )}>{item.label}</button>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">Updated {dateTime(prospect.updated_at)}</p>
        </div>
        <form onSubmit={saveNextAction} className="mt-4 grid gap-3 border-t border-border pt-4 lg:grid-cols-[1fr_180px_auto]">
          <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Next action</span><input value={nextActionDraft} onChange={(event) => setNextActionDraft(event.target.value)} maxLength={1000} placeholder="Specific manual next step" className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" /></label>
          <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Due date</span><input ref={dueDateInput} type="date" value={nextActionDue} onChange={(event) => setNextActionDue(event.target.value)} className="h-10 w-full rounded-md border border-border bg-input-background px-3 text-sm outline-none focus:border-focus-ring" /></label>
          <PrimaryAction type="submit" disabled={!identityVerified || working === "next-action"} icon={working === "next-action" ? Loader2 : Check}>Save next action</PrimaryAction>
        </form>
      </SectionPanel>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
        <TabsList className="h-auto w-full justify-start gap-1 overflow-x-auto rounded-lg border border-border bg-card p-1">
          {[["decision", "Decision"], ["identity", "Identity"], ["opportunity", "Opportunity"], ["concept", "Concept"], ["sales", "Sales"], ["outreach", "Outreach"], ["notes", "Notes"], ["activity", "Activity"]].map(([tab, label]) => (
            <TabsTrigger key={tab} value={tab} className="shrink-0">{label}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="decision" className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {[
              ["Identity", identityVerified ? "Confirmed" : "Needs confirmation"],
              ["Contact", prospect.public_phone || prospect.public_email ? "Ready" : "Not ready"],
              ["Website", prospect.website_url ? "Confirmed" : "Unresolved"],
              ["Opportunity", prospect.verdict === "pursue" ? "Supported" : prospect.verdict === "investigate" ? "Plausible" : formatSignalLabel(prospect.verdict || "pending")],
              ["Outreach", formatSignalLabel(prospect.assistance_mode || "identity_resolution")],
            ].map(([label, value]) => (
              <div key={label} className="rounded-lg border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
                <p className="mt-2 text-base font-semibold text-foreground">{value || "Unknown"}</p>
              </div>
            ))}
          </div>
          <SectionPanel title="What Signal can safely do" description="Readiness is tied to a real action, not a decorative confidence label.">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              {["identity", "location", "contact", "website", "social_profiles", "opportunity", "approachability"].map((key) => {
                const value = record(confidenceDimensionValues[key])
                return <div key={key} className="rounded-md border border-border bg-muted/15 p-3"><p className="text-xs text-muted-foreground">{formatSignalLabel(key)}</p><p className="mt-1 font-medium capitalize text-foreground">{typeof value.label === "string" ? value.label : "Limited"}</p>{typeof value.explanation === "string" && <p className="mt-1 text-xs leading-5 text-muted-foreground">{value.explanation}</p>}</div>
              })}
            </div>
          </SectionPanel>
          <div className="grid gap-5 xl:grid-cols-2">
            <SectionPanel title="Current situation" description="Verified facts and clearly labeled inference.">
              <p className="text-lg font-medium text-foreground">{typeof opportunityBrief.current_situation === "string" ? opportunityBrief.current_situation : prospect.primary_opportunity || "Analysis has not identified a defensible opportunity yet."}</p>
              {typeof opportunityBrief.friction === "string" && <p className="mt-3 text-sm leading-6 text-muted-foreground">{opportunityBrief.friction}</p>}
            </SectionPanel>
            <SectionPanel title="Smallest sensible offer" description="The narrowest useful starting scope supported by current evidence.">
              <p className="text-lg font-medium text-foreground">{typeof opportunityBrief.smallest_sensible_offer === "string" ? opportunityBrief.smallest_sensible_offer : prospect.smallest_offer || "Verify the business before defining an offer."}</p>
              <p className="mt-3 text-sm text-muted-foreground">Next: {typeof nextActionPlan.exact_instruction === "string" ? nextActionPlan.exact_instruction : prospect.next_action || "Complete focused analysis."}</p>
            </SectionPanel>
          </div>
          <SectionPanel title="Best first move" description="Timing is only stated when supported by public evidence or Mountline observations.">
            <p className="text-lg font-medium text-foreground">{typeof approachabilityPlan.best_first_move === "string" ? approachabilityPlan.best_first_move : "Verify a reliable contact route first."}</p>
            {typeof approachabilityPlan.why === "string" && <p className="mt-2 text-sm text-muted-foreground">{approachabilityPlan.why}</p>}
            <div className="mt-4 grid gap-3 text-sm sm:grid-cols-3"><div><p className="text-xs text-muted-foreground">Timing</p><p className="mt-1">{typeof approachabilityPlan.best_likely_timing === "string" ? approachabilityPlan.best_likely_timing : "Unknown"}</p></div><div><p className="text-xs text-muted-foreground">Backup route</p><p className="mt-1">{typeof approachabilityPlan.backup_route === "string" ? approachabilityPlan.backup_route : "Not verified"}</p></div><div><p className="text-xs text-muted-foreground">Prepare</p><p className="mt-1">{typeof approachabilityPlan.prepare === "string" ? approachabilityPlan.prepare : "Evidence summary"}</p></div></div>
          </SectionPanel>
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
          </SectionPanel>
        </TabsContent>

        <TabsContent value="identity" className="space-y-5">
          <SectionPanel
            title={signalIdentityStateLabel(identityState)}
            description={typeof record(prospect.identity_resolution).explanation === "string" ? String(record(prospect.identity_resolution).explanation) : "Signal compares every source with the submitted business before accepting it."}
          >
            <div className="grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div><p className="text-xs text-muted-foreground">Submitted business</p><p className="mt-1 font-medium text-foreground">{prospect.submitted_name || prospect.business_name}</p></div>
              <div><p className="text-xs text-muted-foreground">Submitted location</p><p className="mt-1">{prospect.submitted_address || prospect.submitted_location || "Not supplied"}</p></div>
              <div><p className="text-xs text-muted-foreground">Anchor</p><p className="mt-1">{formatSignalLabel(prospect.identity_anchor_type || "unknown")} · {formatSignalLabel(prospect.identity_anchor_strength || "weak")}</p></div>
              <div><p className="text-xs text-muted-foreground">Canonical source</p><p className="mt-1">{formatSignalLabel(prospect.canonical_name_source || "submitted_input")}</p></div>
            </div>
          </SectionPanel>

          {!identityVerified && identityCandidates.filter((candidate) => ["possible", "selected", "user_confirmed"].includes(candidate.resolution_status)).length > 0 && (
            <SectionPanel title={`Possible matches for ${prospect.submitted_name || prospect.business_name}`} description="Choose only when the name and stable location or contact details describe the exact business.">
              <div className="grid gap-3 lg:grid-cols-2">
                {identityCandidates.filter((candidate) => ["possible", "selected", "user_confirmed"].includes(candidate.resolution_status)).map((candidate) => (
                  <div key={candidate.id} className="rounded-lg border border-border bg-muted/15 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{candidate.candidate_name || "Unnamed candidate"}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{candidate.address || [candidate.city, candidate.state].filter(Boolean).join(", ") || "Location not confirmed"}</p>
                      </div>
                      <StatusBadge tone={candidate.match_score >= 78 ? "green" : candidate.match_score >= 55 ? "amber" : "default"}>{candidate.match_score >= 78 ? "Strong match" : candidate.match_score >= 55 ? "Likely match" : "Possible"}</StatusBadge>
                    </div>
                    <div className="mt-3 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
                      <span>{candidate.phone || "Phone not matched"}</span>
                      <span className="break-all">{candidate.domain || formatSignalLabel(candidate.source_classification)}</span>
                    </div>
                    {list(candidate.match_reasons).length > 0 && <p className="mt-3 text-xs text-muted-foreground">Why it matched: {list(candidate.match_reasons).join(" · ")}</p>}
                    <div className="mt-4 flex flex-wrap gap-2">
                      <button type="button" onClick={() => void updateCandidate(candidate.id, "confirm")} disabled={working === `candidate:${candidate.id}`} className="rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background disabled:opacity-50">This is the business</button>
                      <button type="button" onClick={() => void updateCandidate(candidate.id, "unrelated")} disabled={working === `candidate:${candidate.id}`} className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground disabled:opacity-50">Mark unrelated</button>
                      {candidate.source_url && <a href={candidate.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Open source <ExternalLink className="h-3 w-3" /></a>}
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
                <button type="button" onClick={() => void rejectAllCandidates()} disabled={working === "none-candidates"} className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">None of these</button>
                <button type="button" onClick={() => document.getElementById("identity-correction")?.scrollIntoView({ behavior: "smooth" })} className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Edit submitted details</button>
              </div>
            </SectionPanel>
          )}

          <SectionPanel title="Verification checklist" description="Each open item explains why it affects the decision and the fastest way to resolve it.">
            {openVerificationItems.length ? (
              <div className="space-y-3">
                {openVerificationItems.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border bg-muted/15 p-4">
                    <div className="flex items-start gap-3">
                      <FileSearch className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2"><p className="font-medium text-foreground">{item.title}</p>{item.required && <StatusBadge tone="amber">Required</StatusBadge>}</div>
                        <p className="mt-2 text-sm text-muted-foreground"><span className="text-foreground">Why:</span> {item.why_it_matters}</p>
                        <p className="mt-1 text-sm text-muted-foreground"><span className="text-foreground">Current evidence:</span> {item.current_evidence}</p>
                        <p className="mt-1 text-sm text-muted-foreground"><span className="text-foreground">Fastest check:</span> {item.fastest_method}</p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          {item.action_url && <a href={item.action_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 rounded-md border border-border px-3 py-2 text-xs font-medium">{item.action_type === "search_phone" ? "Search exact phone" : item.action_type === "add_maps_url" ? "Check Places" : item.action_type === "confirm_website" && !item.action_url.includes(prospect.website_url || "__none__") ? "Search official site" : "Open source"} <ExternalLink className="h-3 w-3" /></a>}
                          <button type="button" onClick={() => void resolveVerification(item.id, "resolved")} disabled={working === `verification:${item.id}`} className="rounded-md bg-foreground px-3 py-2 text-xs font-medium text-background disabled:opacity-50">Mark verified</button>
                          {item.action_url && <button type="button" onClick={() => void resolveVerification(item.id, "unrelated")} disabled={working === `verification:${item.id}`} className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground disabled:opacity-50">Mark unrelated</button>}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-muted-foreground">No required verification items remain.</p>
                <PrimaryAction onClick={() => void runAnalysis("full")} disabled={working === "analysis"} icon={RefreshCw}>Continue analysis</PrimaryAction>
              </div>
            )}
            <div className="mt-4 flex flex-wrap gap-2 border-t border-border pt-4">
              <button type="button" onClick={() => void runAnalysis("website")} disabled={working === "analysis"} className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Re-run website only</button>
              <button type="button" onClick={() => void runAnalysis("social")} disabled={working === "analysis"} className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Re-run social only</button>
              <button type="button" onClick={() => void runAnalysis("identity")} disabled={working === "analysis"} className="rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground hover:text-foreground">Re-run identity only</button>
            </div>
          </SectionPanel>

          <SectionPanel title="Correct identity details" description="Verified corrections persist across re-analysis and outrank weaker public sources.">
            <form id="identity-correction" onSubmit={saveIdentity} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {([
                ["canonical_name", "Canonical business name"], ["industry", "Category"], ["city", "City"], ["state", "State"],
                ["public_phone", "Phone"], ["website_url", "Official website"], ["facebook_url", "Facebook"], ["instagram_url", "Instagram"], ["maps_url", "Places / Maps URL"],
              ] as const).map(([field, label]) => <label key={field} className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">{label}</span><input value={identityDraft[field]} onChange={(event) => setIdentityDraft((current) => ({ ...current, [field]: event.target.value }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" /></label>)}
              <label className="space-y-1.5 sm:col-span-2"><span className="text-xs font-medium text-muted-foreground">Address or service area</span><input value={identityDraft.public_address} onChange={(event) => setIdentityDraft((current) => ({ ...current, public_address: event.target.value }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" /></label>
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Ownership pattern</span><select value={identityDraft.chain_status} onChange={(event) => setIdentityDraft((current) => ({ ...current, chain_status: event.target.value as typeof current.chain_status }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"><option value="uncertain">Uncertain</option><option value="independent">Independent</option><option value="likely_independent">Likely independent</option><option value="local_multi_location">Local multi-location</option><option value="likely_franchise">Likely franchise</option><option value="chain">Chain</option></select></label>
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">Business location</span><select value={identityDraft.business_location_type} onChange={(event) => setIdentityDraft((current) => ({ ...current, business_location_type: event.target.value as typeof current.business_location_type }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"><option value="unknown">Unknown</option><option value="storefront">Storefront</option><option value="service_area">Service area</option><option value="hybrid">Hybrid</option></select></label>
              <label className="space-y-1.5"><span className="text-xs font-medium text-muted-foreground">How was this verified?</span><select value={identityDraft.verification_source} onChange={(event) => setIdentityDraft((current) => ({ ...current, verification_source: event.target.value }))} className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm"><option value="personally_verified">Verified personally</option><option value="provided_by_business">Provided by the business</option><option value="official_website">Official website</option><option value="official_social">Official social page</option><option value="places_listing">Places listing</option><option value="other">Other</option></select></label>
              <label className="space-y-1.5 sm:col-span-2 xl:col-span-3"><span className="text-xs font-medium text-muted-foreground">Correction note</span><input value={identityDraft.note} onChange={(event) => setIdentityDraft((current) => ({ ...current, note: event.target.value }))} placeholder="What confirmed this detail?" className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" /></label>
              <div className="sm:col-span-2 xl:col-span-3"><PrimaryAction type="submit" disabled={working === "identity"} icon={working === "identity" ? Loader2 : Check}>Save verified correction</PrimaryAction></div>
            </form>
            {correctionHistory.length > 0 && <details className="mt-5 border-t border-border pt-4"><summary className="cursor-pointer text-sm font-medium text-foreground">Correction history</summary><div className="mt-3 space-y-2">{correctionHistory.map((item) => <div key={item.id} className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground"><span className="font-medium text-foreground">{formatSignalLabel(item.field_name)}</span><span>{formatSignalLabel(item.verification_source)}</span><span>· {dateTime(item.created_at)}</span></div>)}</div></details>}
          </SectionPanel>

          <div className="rounded-lg border border-border bg-card p-4 text-sm text-muted-foreground">
            Evidence is organized by decision value. Publisher and business subject stay separate, and rejected sources are collapsed below.
          </div>
          {evidenceSections.filter((section) => section.items.length > 0 || section.key === "verified").map((section) => (
            <SectionPanel key={section.key} title={section.label}>
              {section.items.length > 0 ? (
                <div className="space-y-2">
                  {section.items.slice(0, 8).map((item) => (
                    <div key={item.id} className="rounded-lg border border-border bg-muted/15 p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div><p className="text-sm font-medium text-foreground">{formatSignalLabel(item.claim_type)}</p><p className="mt-1 text-sm leading-6 text-muted-foreground">{item.claim_text}</p></div>
                        <StatusBadge tone={item.verification_status === "verified" ? "green" : item.verification_status === "contradicted" ? "red" : "default"}>{formatSignalLabel(item.verification_status)}</StatusBadge>
                      </div>
                      <div className="mt-3 grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                        <span>Subject: {item.subject_name || prospect.display_name || prospect.business_name}</span>
                        <span>Publisher: {item.publisher_name || item.publisher_domain || formatSignalLabel(item.source_provider || item.evidence_tier)}</span>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">{item.decision_reason || confidenceExplanation(item.confidence)}</p>
                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>{formatSignalLabel(item.source_classification || item.evidence_tier)}</span>
                        <span>{confidenceExplanation(item.confidence)}</span>
                        {item.source_url && <a href={item.source_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground">Source <ExternalLink className="h-3 w-3" /></a>}
                      </div>
                    </div>
                  ))}
                  {section.items.length > 8 && <p className="text-xs text-muted-foreground">{section.items.length - 8} additional items are available in the raw evidence view.</p>}
                </div>
              ) : <p className="text-sm text-muted-foreground">No public facts are verified yet. Confirm the correct business before Signal prepares outreach.</p>}
            </SectionPanel>
          ))}
          {groupedEvidence.rejected_source.length > 0 && (
            <details className="rounded-lg border border-border bg-card p-4">
              <summary className="cursor-pointer text-sm font-medium text-foreground">Rejected sources <span className="ml-2 text-xs font-normal text-muted-foreground">{groupedEvidence.rejected_source.length}</span></summary>
              <div className="mt-4 space-y-2">{groupedEvidence.rejected_source.map((item) => <div key={item.id} className="rounded-md border border-border bg-muted/15 p-3"><div className="flex items-start gap-2"><X className="mt-0.5 h-4 w-4 shrink-0 text-error-foreground" /><div><p className="text-sm font-medium text-foreground">{item.source_title || item.claim_text}</p><p className="mt-1 text-xs text-muted-foreground">{item.decision_reason || "Signal rejected this source because it did not agree with the submitted identity."}</p><p className="mt-1 text-xs text-muted-foreground">Publisher: {item.publisher_name || item.publisher_domain || "Unknown"} · {formatSignalLabel(item.source_classification || item.evidence_tier)}</p></div></div></div>)}</div>
            </details>
          )}
          <details className="rounded-lg border border-border bg-card p-4">
            <summary className="cursor-pointer text-sm font-medium text-foreground">Debug / raw evidence</summary>
            <pre className="mt-4 max-h-[480px] overflow-auto whitespace-pre-wrap rounded-md bg-background p-3 text-xs text-muted-foreground">{JSON.stringify(evidence, null, 2)}</pre>
          </details>
        </TabsContent>

        <TabsContent value="opportunity" className="space-y-5">
          <SectionPanel title={typeof executiveRecommendation.decision === "string" ? executiveRecommendation.decision : `${formatSignalLabel(prospect.verdict)} verdict`} description="A sales decision, not a guarantee of fit or outcome.">
            <p className="text-lg font-medium text-foreground">{recommendationReasons.join(" ") || prospect.why_it_matters || "The recommendation will appear after analysis."}</p>
          </SectionPanel>
          <div className="grid gap-5 xl:grid-cols-2">
            <SectionPanel title="What still matters" description="Blocking, strategy-limiting, and optional unknowns are handled differently.">
              {uncertaintyBudget.length ? <div className="space-y-3">{uncertaintyBudget.map((item) => <div key={String(item.key)} className="rounded-md border border-border p-3"><div className="flex flex-wrap items-center gap-2"><StatusBadge tone={item.classification === "blocking" ? "red" : item.classification === "strategy_limiting" ? "amber" : "default"}>{formatSignalLabel(String(item.classification || "unknown"))}</StatusBadge><p className="text-sm font-medium text-foreground">{String(item.question || "Unknown fact")}</p></div>{Boolean(item.why_it_matters) && <p className="mt-2 text-xs leading-5 text-muted-foreground">{String(item.why_it_matters)}</p>}{Boolean(item.automatic_action) && <p className="mt-2 text-xs text-muted-foreground"><span className="font-medium text-foreground">Signal next:</span> {String(item.automatic_action)}</p>}</div>)}</div> : mustVerify.length ? <ul className="space-y-2 text-sm text-muted-foreground">{mustVerify.map((item) => <li key={item} className="flex gap-2"><FileSearch className="mt-0.5 h-4 w-4 shrink-0" />{item}</li>)}</ul> : <p className="text-sm text-muted-foreground">No material unknowns were recorded.</p>}
            </SectionPanel>
            <SectionPanel title="Do not pitch" description="Claims or angles that would overstate the current evidence.">
              {doNotPitch.length ? <ul className="space-y-2 text-sm text-muted-foreground">{doNotPitch.map((item) => <li key={item} className="flex gap-2"><ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-warning-foreground" />{item}</li>)}</ul> : <p className="text-sm text-muted-foreground">No pitch guardrails recorded yet.</p>}
            </SectionPanel>
          </div>
          <SectionPanel title="Business understanding" description="Verified facts stay separate from category-based hypotheses.">
            <div className="grid gap-4 text-sm sm:grid-cols-2 xl:grid-cols-4">
              <div><p className="text-xs text-muted-foreground">Category</p><p className="mt-1 font-medium text-foreground">{String(businessProfile.primary_category || prospect.industry || "Unknown")}</p></div>
              <div><p className="text-xs text-muted-foreground">Business model</p><p className="mt-1">{String(businessProfile.likely_business_model || "Still being resolved")}</p></div>
              <div><p className="text-xs text-muted-foreground">Customer intent</p><p className="mt-1">{String(businessProfile.likely_customer_intent || "Still being resolved")}</p></div>
              <div><p className="text-xs text-muted-foreground">Contact route</p><p className="mt-1">{String(businessProfile.dominant_contact_route || "Still being resolved")}</p></div>
            </div>
            {list(businessProfile.known_services).length > 0 && <p className="mt-4 text-sm text-muted-foreground"><span className="font-medium text-foreground">Verified services:</span> {list(businessProfile.known_services).join(" · ")}</p>}
            {typeof businessProfile.public_customer_journey === "string" && <p className="mt-4 rounded-md border border-border bg-muted/15 p-3 text-sm leading-6 text-muted-foreground">{businessProfile.public_customer_journey}</p>}
          </SectionPanel>
          {researchMissions.length > 0 && <SectionPanel title="Research missions" description="Signal checks these before asking Mountline to investigate manually."><div className="grid gap-3 lg:grid-cols-2">{researchMissions.map((mission) => <div key={String(mission.key)} className="rounded-md border border-border p-3"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-foreground">{String(mission.title || "Research mission")}</p><StatusBadge tone={mission.status === "complete" ? "green" : mission.status === "limited" ? "amber" : "default"}>{formatSignalLabel(String(mission.status || "in_progress"))}</StatusBadge></div><p className="mt-2 text-xs leading-5 text-muted-foreground">{String(mission.conclusion || "Signal is still checking public evidence.")}</p>{Boolean(mission.next_automatic_step) && <p className="mt-2 text-xs text-muted-foreground"><span className="font-medium text-foreground">Next automatic step:</span> {String(mission.next_automatic_step)}</p>}</div>)}</div></SectionPanel>}
        </TabsContent>

        <TabsContent value="concept" className="space-y-5">
          <SectionPanel title="Build concept" description="Optional direction changes the presentation, never the verified business facts.">
            <div className="space-y-3">
              <textarea value={conceptInstructions} onChange={(event) => setConceptInstructions(event.target.value)} rows={3} maxLength={1000} placeholder="Make it warmer, focus on catering, keep the phone button dominant…" className="w-full resize-y rounded-lg border border-border bg-background p-3 text-sm outline-none focus:border-foreground/30" />
              <PrimaryAction onClick={buildConcept} disabled={working === "concept" || !canBuildConcept} icon={working === "concept" ? Loader2 : Sparkles}>{latestConcept ? "Regenerate concept prompt" : "Build concept"}</PrimaryAction>
            </div>
          </SectionPanel>
          <SectionPanel title="Concept direction" description="The prompt uses verified public facts and labels every unknown as a placeholder.">
            {latestConcept ? (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3"><StatusBadge tone={latestConcept.status === "ready" ? "green" : "blue"}>{formatSignalLabel(latestConcept.status)}</StatusBadge><CopyButton value={latestConcept.generation_prompt} /></div>
                <pre className="max-h-[560px] overflow-auto whitespace-pre-wrap rounded-lg border border-border bg-background p-4 font-sans text-sm leading-6 text-muted-foreground">{latestConcept.generation_prompt}</pre>
                {latestConcept.concept_url && <a href={latestConcept.concept_url} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline">Open concept <ExternalLink className="h-4 w-4" /></a>}
              </div>
            ) : <p className="text-sm text-muted-foreground">A safe concept hypothesis becomes available after the identity is confirmed. Unknown services and details remain explicit placeholders.</p>}
          </SectionPanel>
          {outdatedConcepts.length > 0 && <details className="rounded-lg border border-border bg-card p-4"><summary className="cursor-pointer text-sm font-medium text-foreground">Outdated concept history · {outdatedConcepts.length}</summary><div className="mt-3 space-y-2">{outdatedConcepts.map((concept) => <div key={concept.id} className="rounded-md border border-border bg-muted/15 p-3"><p className="text-sm font-medium text-warning-foreground">Outdated — generated before identity or evidence changed</p><p className="mt-1 text-xs text-muted-foreground">{concept.stale_reason || "This concept does not match the active business versions and cannot be copied as current."}</p><p className="mt-1 text-xs text-muted-foreground">Generated {dateTime(concept.created_at)}</p></div>)}</div></details>}
        </TabsContent>

        <TabsContent value="sales" className="space-y-5">
          <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
              <div><p className="font-medium text-foreground">Evidence-grounded sales pack</p><p className="mt-1 text-sm text-muted-foreground">Signal prepares verification, opportunity, or active-deal scripts according to the current assistance mode.</p></div>
            <div className="flex flex-wrap gap-2">
              {latestDraft && <SecondaryAction href={`/dashboard/signal/${prospect.id}/action?mode=teleprompter`} icon={Play}>Rehearse</SecondaryAction>}
              <PrimaryAction onClick={generateSalesPack} disabled={working === "sales" || !canPrepareSales} icon={working === "sales" ? Loader2 : Sparkles}>{latestDraft ? "Regenerate sales pack" : "Prepare sales pack"}</PrimaryAction>
            </div>
          </div>
          {!canPrepareSales && (
            <SectionPanel title="Sales pack not ready" description={actionReason("sales_pack") || "Confirm the exact business before preparing spoken or written outreach."}>
              <div className="grid gap-4 lg:grid-cols-3">
                <div><p className="text-xs font-medium text-muted-foreground">What is known</p><ul className="mt-2 space-y-1 text-sm text-foreground">{groupedEvidence.verified_public_fact.slice(0, 4).map((item) => <li key={item.id}>{item.claim_text}</li>)}</ul>{!groupedEvidence.verified_public_fact.length && <p className="mt-2 text-sm text-muted-foreground">No business-specific public facts are verified.</p>}</div>
                <div><p className="text-xs font-medium text-muted-foreground">What to verify</p><ul className="mt-2 space-y-1 text-sm text-foreground">{openVerificationItems.slice(0, 4).map((item) => <li key={item.id}>{item.title}</li>)}</ul></div>
                <div><p className="text-xs font-medium text-muted-foreground">Safe discovery questions</p><ul className="mt-2 space-y-1 text-sm text-foreground"><li>Who handles your website and customer inquiries?</li><li>What do customers most often need to call about?</li><li>Is there anything in the current online information that is out of date?</li></ul></div>
              </div>
            </SectionPanel>
          )}
          {latestDraft && canPrepareSales ? (
            <div className="grid gap-4 xl:grid-cols-2">
              <ScriptBlock label="Call opener" value={latestDraft.owner_call_opener} variants={studioVariants} />
              <ScriptBlock label="Walk-in opener" value={typeof latestStudio.walk_in_opener === "string" ? latestStudio.walk_in_opener : null} variants={studioVariants} />
              <ScriptBlock label="Gatekeeper" value={latestDraft.gatekeeper_script} />
              <ScriptBlock label="Voicemail" value={latestDraft.voicemail_script} />
              <ScriptBlock label="First email" value={latestDraft.first_contact_email} />
              <ScriptBlock label="Social message" value={latestDraft.permission_based_dm} />
              <ScriptBlock label="Follow-up" value={latestDraft.follow_up_email || latestDraft.demo_send_followup} />
              <ScriptBlock label="Value bridge · use after discovery" value={typeof latestStudio.value_bridge === "string" ? latestStudio.value_bridge : null} />
              <ScriptBlock label="Concept reveal" value={typeof latestStudio.concept_reveal === "string" ? latestStudio.concept_reveal : null} />
              <ScriptBlock label="Recommended close" value={typeof latestStudio.recommended_close === "string" ? latestStudio.recommended_close : null} />
              <ScriptBlock label="Fallback close" value={typeof latestStudio.fallback_close === "string" ? latestStudio.fallback_close : null} />
              <ScriptBlock label="Graceful exit" value={typeof latestStudio.graceful_exit === "string" ? latestStudio.graceful_exit : null} />
              <ScriptBlock label="Proposal angle" value={latestDraft.proposal_angle} />
              {list(latestStudio.delivery_notes).length > 0 && <div className="rounded-lg border border-border bg-muted/20 p-4"><h3 className="text-sm font-medium text-foreground">Delivery notes</h3><ul className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">{list(latestStudio.delivery_notes).map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-foreground" />{item}</li>)}</ul></div>}
            </div>
          ) : <SectionPanel><p className="text-sm text-muted-foreground">No sales pack has been prepared. Review evidence first, then generate a draft for manual approval.</p></SectionPanel>}
          {outdatedDrafts.length > 0 && <details className="rounded-lg border border-border bg-card p-4"><summary className="cursor-pointer text-sm font-medium text-foreground">Outdated sales history · {outdatedDrafts.length}</summary><p className="mt-3 text-sm text-muted-foreground">These drafts are retained for history but do not match the active identity or evidence version. They are not copyable as current outreach.</p></details>}
        </TabsContent>

        <TabsContent value="outreach" className="space-y-5">
          <SectionPanel title="Log manual outreach" description="Signal prepares drafts; it does not send outreach automatically.">
            <form onSubmit={logOutreach} className="grid gap-3 lg:grid-cols-[180px_1fr_auto]">
              <select value={eventChannel} onChange={(event) => setEventChannel(event.target.value)} className="h-10 rounded-md border border-border bg-background px-3 text-sm">
                <option value="call">Call</option><option value="email">Email</option><option value="instagram">Instagram</option><option value="contact_form">Contact form</option><option value="in_person">In person</option>
              </select>
              <input value={eventSummary} onChange={(event) => setEventSummary(event.target.value)} placeholder="Short outcome or context" className="h-10 rounded-md border border-border bg-background px-3 text-sm outline-none focus:border-foreground/30" />
              <PrimaryAction type="submit" disabled={!actionEnabled("log_outreach", canPrepareSales) || working === "outreach"} icon={MessageSquare}>Log attempt</PrimaryAction>
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

function PreparedTool({ label, ready, reason }: { label: string; ready: boolean; reason?: string }) {
  return (
    <div className="flex items-start gap-2 rounded-md border border-border px-3 py-2">
      {ready ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-success-foreground" /> : <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />}
      <div><p className="text-sm font-medium text-foreground">{label}</p>{!ready && reason && <p className="mt-0.5 text-xs leading-5 text-muted-foreground">{reason}</p>}</div>
    </div>
  )
}

function QuickAction({
  disabled = false,
  external = false,
  href,
  icon: Icon,
  label,
  onClick,
  reason,
}: {
  disabled?: boolean
  external?: boolean
  href?: string
  icon: React.ComponentType<{ className?: string }>
  label: string
  onClick?: () => void
  reason?: string
}) {
  const className = cn(
    "inline-flex h-9 items-center gap-2 rounded-md border border-border bg-surface px-3 text-xs font-medium text-foreground-subtle transition-colors",
    disabled ? "cursor-not-allowed opacity-40" : "hover:bg-hover hover:text-foreground",
  )
  if (href && !disabled) {
    return <a href={href} target={external ? "_blank" : undefined} rel={external ? "noreferrer" : undefined} className={className}><Icon className="h-3.5 w-3.5" />{label}</a>
  }
  return <button type="button" disabled={disabled} onClick={onClick} className={className} title={disabled ? reason || `${label} is not available for the current lead state.` : undefined}><Icon className="h-3.5 w-3.5" />{label}</button>
}
