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
  ImageIcon,
  Loader2,
  Mail,
  Phone,
  RadioTower,
  ShieldAlert,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react"
import { getSignalPlaybook, MEDICAL_COMPLIANCE_WARNING } from "@/lib/signal/playbooks"
import type {
  SignalAlert,
  SignalAnalysis,
  SignalFeedback,
  SignalCommunicationProfile,
  SignalOutreachDraft,
  SignalOutreachEvent,
  SignalProspect,
  SignalVerifiedObservation,
  SignalVisualEvidence,
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
  | "scripts"
  | "session"
  | "visual_upload"
  | "visual_analyze"
  | "visual_capture"
  | "visual_remove"
  | "observation"
  | "focus"
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
  local_student: "Warm local",
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

const conversationStyleLabels: Record<string, string> = {
  friendly_local: "Friendly local",
  traditional_owner_operator: "Traditional owner-operator",
  modern_casual_brand: "Modern casual brand",
  formal_business: "Formal business",
  clinical_professional: "Clinical professional",
  concise_busy_owner: "Concise busy owner",
}

const communicationProfileLabels: Record<SignalCommunicationProfile, string> = {
  plainspoken_owner_operator: "Plainspoken owner-operator",
  friendly_local: "Friendly local business",
  modern_casual_brand: "Modern casual brand",
  busy_operations_manager: "Busy operations manager",
  formal_business: "Formal business",
  clinical_professional: "Clinical professional",
  warm_existing_connection: "Warm existing connection",
}

const contactReadinessLabels: Record<string, string> = {
  verified_email_available: "Verified email available",
  verified_phone_available: "Verified phone available",
  verified_contact_form_available: "Verified contact form available",
  verified_social_contact_available: "Verified social contact available",
  contact_missing: "Contact missing",
  contact_history_only: "Contact history only",
  suppressed: "Suppressed",
}

const laneLabels: Record<string, string> = {
  website_first: "Website First",
  systems_discovery: "Systems Discovery",
  do_not_pursue: "Do Not Pursue",
  compliance_gated: "Compliance-Gated",
}

const localityLabels: Record<string, string> = {
  keller_local: "Keller local",
  dfw_nearby: "DFW nearby",
  remote: "Remote",
  unknown: "Unknown",
}

const relationshipLabels: Record<string, string> = {
  none: "None",
  personally_visited: "Personally visited",
  knows_owner: "Knows owner",
  family_referral: "Family referral",
  customer: "Customer",
  referred: "Referred",
}

const outreachHistoryLabels: Record<string, string> = {
  never_contacted: "Never contacted",
  emailed: "Emailed",
  called: "Called",
  dm_attempted: "DM attempted",
  awaiting_reply: "Awaiting reply",
  follow_up_due: "Follow-up due",
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

function scriptStudioFromDraft(draft: SignalOutreachDraft | null) {
  const value = draft?.script_studio
  if (!value || typeof value !== "object") return null
  return value as Record<string, unknown>
}

function demoRoute(value: string | null | undefined) {
  if (value === "auto-detailing") return "/work/auto-detailing"
  if (value === "barber-shop") return "/work/barber-shop"
  return null
}

function evidenceWeighting(analysis: SignalAnalysis | null) {
  const weighting = analysis?.evidence_weighting
  return weighting && typeof weighting === "object" ? (weighting as Record<string, unknown>) : null
}

function stringList(value: unknown) {
  if (!Array.isArray(value)) return []
  return value.filter((item) => item !== null && item !== undefined).map((item) => {
    if (typeof item === "string") return item
    if (item && typeof item === "object") {
      const record = item as Record<string, unknown>
      return [record.signal, record.snippet, record.url].filter(Boolean).join(": ")
    }
    return String(item)
  }).filter(Boolean)
}

function visualAnalysisFromEvidence(evidence: SignalVisualEvidence[]) {
  const latest = evidence.find((item) => item.analysis && typeof item.analysis === "object")
  return latest?.analysis && typeof latest.analysis === "object"
    ? (latest.analysis as Record<string, unknown>)
    : null
}

function stringsFromRecordArray(value: unknown, keys: string[]) {
  if (!Array.isArray(value)) return []
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null
      const record = item as Record<string, unknown>
      return keys.map((key) => record[key]).filter(Boolean).join(": ")
    })
    .filter((item): item is string => Boolean(item))
}

function buildStrategyBoxes({
  analysis,
  playbookQuestions,
  prospect,
  scan,
  verifiedObservations,
  visualEvidence,
}: {
  analysis: SignalAnalysis | null
  playbookQuestions: string[]
  prospect: SignalProspect
  scan: Record<string, unknown> | null
  verifiedObservations: SignalVerifiedObservation[]
  visualEvidence: SignalVisualEvidence[]
}) {
  const facts = [
    prospect.website_url && `Official website saved: ${prospect.website_url}`,
    prospect.city && `Location saved: ${[prospect.city, prospect.state].filter(Boolean).join(", ")}`,
    scan?.page_title && `Official homepage title: ${String(scan.page_title)}`,
    ...stringsFromRecordArray(scan?.evidence, ["signal", "snippet"]).slice(0, 4),
    ...verifiedObservations.slice(0, 4).map((item) =>
      `${item.category.replace(/_/g, " ")}: ${item.note}${item.url ? ` (${item.url})` : ""}`,
    ),
    visualEvidence.some((item) => item.screenshot_type === "desktop") && "Desktop public-site screenshot is stored.",
    visualEvidence.some((item) => item.screenshot_type === "mobile") && "Mobile public-site screenshot is stored.",
  ].filter(Boolean) as string[]

  const inferences = [
    analysis?.recommended_lane && `Recommended lane: ${laneLabels[analysis.recommended_lane] || analysis.recommended_lane}.`,
    analysis?.recommended_primary_offer && `A practical first offer may be: ${analysis.recommended_primary_offer}.`,
    analysis?.recommended_secondary_offer && `Secondary opportunity to confirm later: ${analysis.recommended_secondary_offer}.`,
    analysis?.systems_opportunity_score !== null &&
      analysis?.systems_opportunity_score !== undefined &&
      "Systems/workflow ideas should stay discovery-led unless confirmed by the business.",
    prospect.existing_booking_platform && `Existing ${prospect.existing_booking_platform} booking can likely remain in place unless the team says otherwise.`,
  ].filter(Boolean) as string[]

  const questions = [
    ...(arrayFromJson(analysis?.discovery_confirmation_needed).length
      ? arrayFromJson(analysis?.discovery_confirmation_needed)
      : []),
    ...playbookQuestions,
  ].slice(0, 8)

  return {
    facts,
    inferences,
    questions,
  }
}

function buildTimeline({
  alerts,
  analyses,
  drafts,
  feedback,
  outreachEvents,
  prospect,
  verifiedObservations,
  visualEvidence,
}: {
  alerts: SignalAlert[]
  analyses: SignalAnalysis[]
  drafts: SignalOutreachDraft[]
  feedback: SignalFeedback[]
  outreachEvents: SignalOutreachEvent[]
  prospect: SignalProspect
  verifiedObservations: SignalVerifiedObservation[]
  visualEvidence: SignalVisualEvidence[]
}) {
  const timeline = [
    {
      date: prospect.created_at,
      category: "research",
      title: "Prospect created",
      detail: prospect.source.replace(/_/g, " "),
    },
    ...analyses.map((analysis) => ({
      date: analysis.created_at,
      category: analysis.analysis_type === "deep_dive" ? "analysis" : "research",
      title: analysis.analysis_type.replace(/_/g, " "),
      detail: analysis.recommended_primary_offer || analysis.executive_summary || analysis.model_provider || "Analysis saved",
    })),
    ...drafts.map((draft) => ({
      date: draft.created_at,
      category: "outreach",
      title: "Draft prepared",
      detail: draft.first_contact_subject || draft.outreach_mode,
    })),
    ...outreachEvents.map((event) => ({
      date: event.event_date || event.created_at,
      category:
        event.event_type === "demo_sent"
          ? "demo"
          : event.event_type === "replied"
            ? "reply"
            : event.follow_up_date
              ? "follow_up"
              : "outreach",
      title: event.event_type.replace(/_/g, " "),
      detail: [event.channel, event.summary].filter(Boolean).join(": "),
    })),
    ...visualEvidence.map((item) => ({
      date: item.analyzed_at || item.created_at,
      category: item.analyzed_at ? "analysis" : "research",
      title: `${item.screenshot_type} screenshot`,
      detail: item.analyzed_at ? "Visual analysis saved" : "Visual evidence uploaded",
    })),
    ...verifiedObservations.map((item) => ({
      date: item.created_at,
      category: "note",
      title: item.category.replace(/_/g, " "),
      detail: item.note,
    })),
    ...feedback.map((item) => ({
      date: item.created_at,
      category: "correction",
      title: item.feedback_type.replace(/_/g, " "),
      detail: item.corrected_value || item.note || item.original_value || "Correction saved",
    })),
    ...alerts.map((alert) => ({
      date: alert.created_at,
      category: "status",
      title: alert.title,
      detail: alert.message,
    })),
  ]

  return timeline
    .filter((item) => item.date)
    .sort((a, b) => String(b.date).localeCompare(String(a.date)))
    .slice(0, 40)
}

function gradeForScore(value: number | null | undefined) {
  if (typeof value !== "number") return "-"
  if (value >= 85) return "A"
  if (value >= 70) return "B"
  if (value >= 50) return "C"
  return "skip"
}

function scoreColor(value: number | null | undefined, inverse = false) {
  if (typeof value !== "number") return "bg-muted"
  const good = inverse ? value <= 30 : value >= 75
  const medium = inverse ? value <= 60 : value >= 55
  if (good) return "bg-green-400"
  if (medium) return "bg-yellow-400"
  return "bg-red-400"
}

function notesSuggestPriorOutreach(prospect: SignalProspect) {
  const text = [
    prospect.human_notes,
    prospect.locality_relationship,
    prospect.what_looks_good,
    prospect.visible_problem,
  ].filter(Boolean).join(" ")
  return /already\s+(sent\s+an\s+)?email|emailed\s+(and\s+)?(waiting|awaiting)|waiting\s+for\s+(a\s+)?response|awaiting\s+reply|dm\s+(sent|attempted)|called\s+(already|before)?/i.test(text)
}

function hasRecordedPriorOutreach(events: SignalOutreachEvent[]) {
  return events.some((event) => event.direction === "outbound")
}

function hasIgnoredOutreachNote(feedback: SignalFeedback[]) {
  return feedback.some((item) => item.feedback_type === "contact_history_note_ignored")
}

function deriveContactReadiness(prospect: SignalProspect, events: SignalOutreachEvent[], suppressed: boolean) {
  if (suppressed || prospect.outreach_status === "do_not_contact") return "suppressed"
  if (prospect.public_email) return "verified_email_available"
  if (prospect.public_phone) return "verified_phone_available"
  if (prospect.public_contact_form_url) return "verified_contact_form_available"
  if (prospect.instagram_url) return "verified_social_contact_available"
  if (hasRecordedPriorOutreach(events)) return "contact_history_only"
  return prospect.contact_readiness || "contact_missing"
}

function recommendedActionForUi(
  prospect: SignalProspect,
  events: SignalOutreachEvent[],
  contactReadiness: string,
  mismatch: boolean,
  analysisAction: string | null | undefined,
) {
  if (mismatch) return "Confirm prior outreach before preparing scripts. Record the email sent or ignore the note."
  if (prospect.outreach_status === "do_not_contact") return "Block outreach drafting and contact actions."
  const hasOutbound = hasRecordedPriorOutreach(events)
  const hasReply = events.some((event) =>
    ["replied", "permission_to_send_demo", "discovery_call_booked", "interested", "declined"].includes(event.event_type),
  )
  const followUp = events.find((event) => event.follow_up_date)?.follow_up_date || prospect.follow_up_date
  if (hasOutbound && !hasReply) {
    if (followUp) return `Wait for a response. If no reply by ${followUp}, send one short follow-up.`
    return "Wait for a response. If no reply by the follow-up date, send one short follow-up."
  }
  if (contactReadiness === "contact_missing" && ["researched", "needs_review"].includes(prospect.outreach_status)) {
    return "Research contact route before outreach."
  }
  if (contactReadiness === "contact_history_only") {
    return "Add the contact route used for prior outreach so follow-ups can be tracked accurately."
  }
  return analysisAction || "Review latest evidence and prepare the next manual step."
}

export function SignalProspectDetail({
  alerts,
  analyses,
  drafts,
  feedback,
  outreachEvents,
  prospect,
  suppressed,
  verifiedObservations,
  visualEvidence,
}: {
  alerts: SignalAlert[]
  analyses: SignalAnalysis[]
  drafts: SignalOutreachDraft[]
  feedback: SignalFeedback[]
  outreachEvents: SignalOutreachEvent[]
  prospect: SignalProspect
  suppressed: boolean
  verifiedObservations: SignalVerifiedObservation[]
  visualEvidence: SignalVisualEvidence[]
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
  const scriptStudio = scriptStudioFromDraft(latestDraft)
  const unreadAlert = alerts.find((alert) => !alert.read_at)
  const playbook = getSignalPlaybook(prospect.industry_playbook)
  const scan = getScan(latestScanAnalysis)
  const evidence = evidenceFromAnalysis(latestScanAnalysis)
  const weighting = evidenceWeighting(latestAnalysis)
  const visualAnalysis = visualAnalysisFromEvidence(visualEvidence)
  const desktopEvidence = visualEvidence.find((item) => item.screenshot_type === "desktop")
  const mobileEvidence = visualEvidence.find((item) => item.screenshot_type === "mobile")
  const selectedDemoRoute = demoRoute(latestAnalysis?.recommended_demo || prospect.relevant_demo)
  const externalReadiness =
    scriptStudio?.external_readiness && typeof scriptStudio.external_readiness === "object"
        ? (scriptStudio.external_readiness as Record<string, unknown>)
        : latestAnalysis?.external_readiness && typeof latestAnalysis.external_readiness === "object"
          ? (latestAnalysis.external_readiness as Record<string, unknown>)
        : null
  const externalReady = externalReadiness?.passed !== false
  const readinessWarning = String(externalReadiness?.warning || "")
  const contactReadiness = deriveContactReadiness(prospect, outreachEvents, suppressed)
  const followUpMode =
    ["contacted", "awaiting_reply"].includes(prospect.outreach_status) ||
    hasRecordedPriorOutreach(outreachEvents)
  const contactHistoryMismatch =
    notesSuggestPriorOutreach(prospect) &&
    !hasRecordedPriorOutreach(outreachEvents) &&
    !hasIgnoredOutreachNote(feedback)
  const displayedNextAction = recommendedActionForUi(
    prospect,
    outreachEvents,
    contactReadiness,
    contactHistoryMismatch,
    latestAnalysis?.recommended_next_action,
  )
  const communicationProfile =
    prospect.suggested_communication_profile ||
    latestAnalysis?.communication_profile ||
    (prospect.compliance_tier === "compliance_gated" ? "clinical_professional" : "friendly_local")
  const [working, setWorking] = useState<WorkingAction>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [followUpDate, setFollowUpDate] = useState(prospect.follow_up_date || "")
  const conversationStyle =
    prospect.conversation_style || latestAnalysis?.suggested_conversation_style || "friendly_local"
  const [profile, setProfile] = useState<string>(communicationProfile)
  const [scriptGuidance, setScriptGuidance] = useState(prospect.script_guidance || "")
  const [recordChannel, setRecordChannel] = useState("email")
  const [recordEventType, setRecordEventType] = useState("delivered")
  const [recordDate, setRecordDate] = useState(new Date().toISOString().slice(0, 10))
  const [recordContact, setRecordContact] = useState("")
  const [recordSummary, setRecordSummary] = useState("")
  const [screenshotType, setScreenshotType] = useState("desktop")
  const [screenshotFile, setScreenshotFile] = useState<File | null>(null)
  const [observationCategory, setObservationCategory] = useState("site_design")
  const [observationSource, setObservationSource] = useState("manual_public_site_review")
  const [observationNote, setObservationNote] = useState("")
  const [observationUrl, setObservationUrl] = useState("")
  const guidanceHistoryConflict =
    /already\s+(sent\s+an\s+)?email|already\s+emailed|generate follow-up only|follow-up only|already called/i.test(scriptGuidance) &&
    !hasRecordedPriorOutreach(outreachEvents)
  const strategyBoxes = buildStrategyBoxes({
    analysis: latestAnalysis,
    playbookQuestions: playbook.discoveryQuestions,
    prospect,
    scan,
    verifiedObservations,
    visualEvidence,
  })
  const timeline = buildTimeline({
    alerts,
    analyses,
    drafts,
    feedback,
    outreachEvents,
    prospect,
    verifiedObservations,
    visualEvidence,
  })

  const doNotContact = prospect.outreach_status === "do_not_contact" || suppressed
  const permissionMode = prospect.outreach_status === "permission_to_send_demo"
  const demoSentMode = prospect.outreach_status === "demo_sent"
  const discoveryMode = prospect.outreach_status === "interested" || prospect.outreach_status === "discovery_call"
  const firstContactMode =
    ["researched", "needs_review", "ready_to_contact"].includes(prospect.outreach_status) &&
    !followUpMode

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

  const prepareScriptsWithGuidance = async () => {
    setWorking("scripts")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/prepare-scripts`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversation_style: conversationStyle,
          communication_profile: profile,
          guidance: scriptGuidance,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Scripts could not be prepared.")
        return
      }
      setMessage(data.needs_manual_review ? "Script Studio prepared, but draft needs manual review." : "Script Studio prepared.")
      router.refresh()
    } catch {
      setError("Scripts could not be prepared.")
    } finally {
      setWorking(null)
    }
  }

  const uploadScreenshot = async () => {
    if (!screenshotFile) {
      setError("Choose a screenshot file first.")
      return
    }
    setWorking("visual_upload")
    setError(null)
    setMessage(null)
    try {
      const formData = new FormData()
      formData.set("screenshot_type", screenshotType)
      formData.set("file", screenshotFile)
      const response = await fetch(`/api/signal/prospects/${prospect.id}/visual-evidence`, {
        method: "POST",
        body: formData,
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.setup_needed || data.error || "Screenshot upload failed.")
        return
      }
      setScreenshotFile(null)
      setMessage("Screenshot uploaded.")
      router.refresh()
    } catch {
      setError("Screenshot upload failed.")
    } finally {
      setWorking(null)
    }
  }

  const captureScreenshot = async () => {
    setWorking("visual_capture")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/visual-evidence/capture`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ screenshot_type: screenshotType }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Automated screenshot capture is unavailable. Manual upload remains available.")
        return
      }
      setMessage("Public homepage screenshot captured.")
      router.refresh()
    } catch {
      setError("Automated screenshot capture is unavailable. Manual upload remains available.")
    } finally {
      setWorking(null)
    }
  }

  const analyzeVisualDesign = async () => {
    setWorking("visual_analyze")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/visual-evidence`, {
        method: "PATCH",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Visual analysis failed.")
        return
      }
      setMessage("Visual design analysis saved. Run Initial Analysis or Deep Dive to refresh scores.")
      router.refresh()
    } catch {
      setError("Visual analysis failed.")
    } finally {
      setWorking(null)
    }
  }

  const removeScreenshot = async (evidenceId: string) => {
    setWorking("visual_remove")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/visual-evidence`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ evidence_id: evidenceId }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Screenshot could not be removed.")
        return
      }
      setMessage("Screenshot removed.")
      router.refresh()
    } catch {
      setError("Screenshot could not be removed.")
    } finally {
      setWorking(null)
    }
  }

  const addObservation = async () => {
    setWorking("observation")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/observations`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: observationCategory,
          source: observationSource,
          note: observationNote,
          url: observationUrl || null,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Observation could not be saved.")
        return
      }
      setObservationNote("")
      setObservationUrl("")
      setMessage("Verified observation saved.")
      router.refresh()
    } catch {
      setError("Observation could not be saved.")
    } finally {
      setWorking(null)
    }
  }

  const recordPriorOutreach = async (quickEmail = false) => {
    setWorking("contacted")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/outreach-events`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: quickEmail ? "email" : recordChannel,
          event_type: quickEmail ? "delivered" : recordEventType,
          direction: "outbound",
          event_date: recordDate,
          follow_up_date: followUpDate || null,
          contact_value: quickEmail ? recordContact : recordContact,
          summary: quickEmail
            ? "Prior email recorded from prospect notes."
            : recordSummary || "Prior outreach recorded from Signal detail.",
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Could not record outreach.")
        return
      }
      setMessage("Prior outreach recorded.")
      router.refresh()
    } catch {
      setError("Could not record outreach.")
    } finally {
      setWorking(null)
    }
  }

  const ignoreOutreachNote = async () => {
    setWorking("contacted")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feedback_type: "contact_history_note_ignored",
          original_value: prospect.human_notes,
          note: "Team ignored prior-outreach inference from notes.",
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Could not save feedback.")
        return
      }
      setMessage("Outreach note ignored for this prospect.")
      router.refresh()
    } catch {
      setError("Could not save feedback.")
    } finally {
      setWorking(null)
    }
  }

  const submitCorrection = async (feedbackType: string, originalValue?: string | null) => {
    const corrected = window.prompt("Corrected value or short guidance?")
    if (corrected === null) return
    setWorking("scripts")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          analysis_id: latestAnalysis?.id || null,
          feedback_type: feedbackType,
          original_value: originalValue || null,
          corrected_value: corrected,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Could not save feedback.")
        return
      }
      setMessage("Signal correction saved for this prospect.")
      router.refresh()
    } catch {
      setError("Could not save feedback.")
    } finally {
      setWorking(null)
    }
  }

  const findContactRoute = async () => {
    setWorking("scan")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/prospects/${prospect.id}/scan`, { method: "POST" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Contact route research failed.")
        return
      }
      const scan = data.scan || {}
      const email = Array.isArray(scan.visible_emails) ? scan.visible_emails[0] : null
      const phone = Array.isArray(scan.visible_phones) ? scan.visible_phones[0] : null
      const contactForm = Array.isArray(scan.booking_links) ? scan.booking_links[0] : null
      if (!email && !phone && !contactForm) {
        setMessage("Scan complete. No public contact route found on scanned official pages.")
        router.refresh()
        return
      }
      const confirmed = window.confirm(
        `Use found contact route?\n${email ? `Email: ${email}\n` : ""}${phone ? `Phone: ${phone}\n` : ""}${contactForm ? `Contact/booking: ${contactForm}` : ""}`,
      )
      if (!confirmed) return
      await fetch(`/api/signal/prospects/${prospect.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          public_email: email || prospect.public_email,
          public_phone: phone || prospect.public_phone,
          public_contact_form_url: contactForm || prospect.public_contact_form_url,
          contact_readiness: email
            ? "verified_email_available"
            : phone
              ? "verified_phone_available"
              : "verified_contact_form_available",
          contact_readiness_reason: "Confirmed from official-site scan on Signal detail.",
        }),
      })
      setMessage("Contact route saved.")
      router.refresh()
    } catch {
      setError("Contact route research failed.")
    } finally {
      setWorking(null)
    }
  }

  const createCallSession = async () => {
    setWorking("session")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch("/api/signal/call-sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prospect_ids: [prospect.id] }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Call session could not be created.")
        return
      }
      router.push(`/dashboard/signal/call-session/${data.session.id}`)
    } catch {
      setError("Call session could not be created.")
    } finally {
      setWorking(null)
    }
  }

  const addToFocusMode = async () => {
    setWorking("focus")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch("/api/signal/focus/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect_id: prospect.id,
          focus_reason:
            latestAnalysis?.executive_summary ||
            latestAnalysis?.recommended_primary_offer ||
            "Added from Signal prospect detail.",
          recommended_action: displayedNextAction,
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Could not add to Focus Mode.")
        return
      }
      setMessage(data.existing ? "Prospect is already in Focus Mode." : "Prospect added to Focus Mode.")
      router.refresh()
    } catch {
      setError("Could not add to Focus Mode.")
    } finally {
      setWorking(null)
    }
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

      {contactHistoryMismatch && (
        <div className="rounded-xl border border-yellow-500/25 bg-yellow-500/10 p-4 text-sm text-yellow-100">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-medium">Outreach history needs confirmation</p>
              <p className="mt-1 text-yellow-100/80">
                Your notes indicate an email was already sent, but no outreach event is recorded.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => recordPriorOutreach(true)}
                className="rounded-lg bg-yellow-100 px-3 py-2 text-xs font-medium text-black transition-colors hover:bg-yellow-50"
              >
                Record email sent
              </button>
              <button
                type="button"
                onClick={ignoreOutreachNote}
                className="rounded-lg border border-yellow-400/40 px-3 py-2 text-xs font-medium text-yellow-100 transition-colors hover:bg-yellow-400/10"
              >
                Ignore note
              </button>
            </div>
          </div>
        </div>
      )}

      <section className="grid gap-4 lg:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recommended Lane</p>
          <p className="mt-2 text-lg font-semibold">
            {latestAnalysis?.recommended_lane
              ? laneLabels[latestAnalysis.recommended_lane] || latestAnalysis.recommended_lane
              : "-"}
          </p>
          {selectedDemoRoute && (
            <Link
              href={selectedDemoRoute}
              target="_blank"
              className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Relevant demo: {selectedDemoRoute}
            </Link>
          )}
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Recommended Next Action</p>
          <p className="mt-2 text-sm text-foreground">
            {displayedNextAction}
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Pursuit Priority</p>
          <p className="mt-2 text-lg font-semibold">
            {latestAnalysis?.priority || "-"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Based on the strongest grounded lane, not an average of unrelated fit.
          </p>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">External Readiness</p>
          <p className="mt-2 text-lg font-semibold">
            {externalReady ? "Ready to Review" : "Needs Manual Review"}
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {externalReady ? "Copy actions are enabled for ready drafts." : "Copy is disabled until drafts pass validation."}
          </p>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-4">
        <MetricCard
          label="Website Opportunity"
          value={`${latestAnalysis?.website_opportunity_score ?? "-"} / ${gradeForScore(latestAnalysis?.website_opportunity_score)}`}
        />
        <MetricCard
          label="Systems / AI Opportunity"
          value={`${latestAnalysis?.systems_opportunity_score ?? "-"} / ${gradeForScore(latestAnalysis?.systems_opportunity_score)}`}
        />
        <MetricCard
          label="Outreach Readiness"
          value={contactReadinessLabels[contactReadiness] || contactReadiness}
          note={contactReadiness === "contact_history_only" ? "Add the contact route used for prior outreach." : undefined}
        />
        <MetricCard
          label="Communication Profile"
          value={communicationProfileLabels[communicationProfile as SignalCommunicationProfile] || communicationProfile}
          note={prospect.follow_up_date ? `Follow-up date: ${prospect.follow_up_date}` : undefined}
        />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Panel title="Prospect Summary">
          <div className="grid gap-4 sm:grid-cols-2">
            <Meta label="Industry" value={prospect.industry} />
            <Meta label="Playbook" value={playbook.name} />
            <Meta label="Location" value={[prospect.city, prospect.state].filter(Boolean).join(", ") || "-"} />
            <Meta label="Locality" value={localityLabels[prospect.locality_scope || "unknown"] || prospect.locality_scope || "-"} />
            <Meta label="Relationship" value={relationshipLabels[prospect.relationship_type || "none"] || prospect.relationship_type || "-"} />
            <Meta label="Outreach History" value={outreachHistoryLabels[prospect.outreach_history || "never_contacted"] || prospect.outreach_history || "-"} />
            <Meta label="Context Notes" value={prospect.locality_relationship || "-"} />
            <Meta label="Priority" value={latestAnalysis?.priority || "-"} />
            <Meta label="Overall Score" value={latestAnalysis?.overall_opportunity_score?.toString() || "-"} />
            <Meta label="Value Band" value={latestAnalysis?.potential_project_value_band || "-"} />
            <Meta label="Confidence" value={latestAnalysis?.confidence || "-"} />
            <Meta label="Conversation Style" value={conversationStyleLabels[prospect.conversation_style] || prospect.conversation_style} />
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
            <ActionButton disabled={doNotContact} working={working === "scripts"} onClick={prepareScriptsWithGuidance}>
              <Sparkles className="h-4 w-4" />
              Prepare Scripts
            </ActionButton>
            <ActionButton disabled={doNotContact} working={working === "scan"} onClick={findContactRoute}>
              <RadioTower className="h-4 w-4" />
              Find Contact Route
            </ActionButton>
            <ActionButton disabled={doNotContact} working={working === "session"} onClick={createCallSession}>
              <Phone className="h-4 w-4" />
              Prepare Call Session
            </ActionButton>
            <ActionButton disabled={doNotContact} working={working === "focus"} onClick={addToFocusMode}>
              <RadioTower className="h-4 w-4" />
              Add to Focus Mode
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
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-sm font-medium">Record Prior Outreach</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <select value={recordChannel} onChange={(event) => setRecordChannel(event.target.value)} className="h-9 rounded-lg border border-border bg-background px-3 text-sm">
                {["email", "call", "voicemail", "instagram", "contact_form", "text", "in_person", "other"].map((value) => (
                  <option key={value} value={value}>{value.replace(/_/g, " ")}</option>
                ))}
              </select>
              <select value={recordEventType} onChange={(event) => setRecordEventType(event.target.value)} className="h-9 rounded-lg border border-border bg-background px-3 text-sm">
                {["attempted", "delivered", "voicemail_left", "replied", "permission_to_send_demo", "demo_sent", "follow_up_sent", "interested", "declined"].map((value) => (
                  <option key={value} value={value}>{value.replace(/_/g, " ")}</option>
                ))}
              </select>
              <input type="date" value={recordDate} onChange={(event) => setRecordDate(event.target.value)} className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
              <input value={recordContact} onChange={(event) => setRecordContact(event.target.value)} placeholder="Email, phone, or URL used" className="h-9 rounded-lg border border-border bg-background px-3 text-sm" />
            </div>
            <textarea value={recordSummary} onChange={(event) => setRecordSummary(event.target.value)} placeholder="Short note about what happened" className="mt-2 min-h-16 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <button type="button" onClick={() => recordPriorOutreach(false)} className="mt-2 inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              Save Outreach Event
            </button>
          </div>
        </Panel>
      </section>

      <Panel title="Visual Website Evidence">
        <div className="mb-4 rounded-lg border border-border bg-muted/30 p-3 text-sm text-muted-foreground">
          Visual evidence from uploaded public-site screenshot. Do not upload customer portals, private dashboards, credentials, PHI, or sensitive content.
        </div>
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <div className="grid gap-2 sm:grid-cols-[140px_1fr]">
              <select
                value={screenshotType}
                onChange={(event) => setScreenshotType(event.target.value)}
                className="h-10 rounded-lg border border-border bg-background px-3 text-sm"
              >
                <option value="desktop">Desktop</option>
                <option value="mobile">Mobile</option>
              </select>
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={(event) => setScreenshotFile(event.target.files?.[0] || null)}
                className="h-10 rounded-lg border border-border bg-background px-3 py-2 text-sm"
              />
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <ActionButton disabled={doNotContact} working={working === "visual_upload"} onClick={uploadScreenshot}>
                <Upload className="h-4 w-4" />
                Upload Screenshot
              </ActionButton>
              <ActionButton disabled={doNotContact} working={working === "visual_capture"} onClick={captureScreenshot}>
                <ImageIcon className="h-4 w-4" />
                Capture Homepage
              </ActionButton>
              <ActionButton disabled={visualEvidence.length === 0} working={working === "visual_analyze"} onClick={analyzeVisualDesign}>
                <ImageIcon className="h-4 w-4" />
                Analyze Visual Design
              </ActionButton>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              PNG, JPG/JPEG, or WEBP. Maximum 5 MB. One desktop and one mobile screenshot are stored per prospect.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {[
              { label: "desktop", item: desktopEvidence },
              { label: "mobile", item: mobileEvidence },
            ].map(({ label, item }) => (
              <div key={label} className="rounded-lg border border-border bg-muted/30 p-3">
                <div className="mb-2 flex items-center justify-between gap-2">
                  <p className="text-sm font-medium capitalize">{item?.screenshot_type || label} screenshot</p>
                  {item && (
                    <button
                      type="button"
                      disabled={working === "visual_remove"}
                      onClick={() => removeScreenshot(item.id)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Remove
                    </button>
                  )}
                </div>
                {item ? (
                  <>
                    <img
                      src={`/api/signal/prospects/${prospect.id}/visual-evidence/${item.id}/image`}
                      alt={`${item.screenshot_type} screenshot evidence`}
                      className="aspect-video w-full rounded-md border border-border object-cover"
                    />
                    <p className="mt-2 text-xs text-muted-foreground">
                      Uploaded {formatDateTime(item.created_at)} · {item.confidence || "not analyzed"}
                    </p>
                  </>
                ) : (
                  <div className="flex aspect-video items-center justify-center rounded-md border border-dashed border-border text-xs text-muted-foreground">
                    Visual design not assessed.
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Visual Analysis</p>
            {visualAnalysis ? (
              <div className="mt-3 space-y-3">
                <div className="grid gap-2 sm:grid-cols-2">
                  <Meta label="Visual quality" value={String(visualAnalysis.visual_quality_score ?? "-")} />
                  <Meta label="Hero clarity" value={String(visualAnalysis.hero_clarity_score ?? "-")} />
                  <Meta label="CTA visibility" value={String(visualAnalysis.cta_visibility_score ?? "-")} />
                  <Meta label="Service clarity" value={String(visualAnalysis.service_clarity_score ?? "-")} />
                  <Meta label="Gallery/proof" value={String(visualAnalysis.gallery_or_proof_score ?? "-")} />
                  <Meta label="Mobile readability" value={String(visualAnalysis.mobile_readability_score ?? "-")} />
                </div>
                <TextBlock label="Evidence-grounded summary" value={String(visualAnalysis.evidence_grounded_summary || "")} />
              </div>
            ) : (
              <p className="mt-2 text-sm text-muted-foreground">Visual design not assessed.</p>
            )}
          </div>
          <div className="rounded-lg border border-border bg-muted/30 p-3">
            <EvidenceGroup title="Visible Improvement Opportunities" items={stringList(visualAnalysis?.visible_improvement_opportunities)} />
            <div className="mt-3">
              <EvidenceGroup title="What Looks Good" items={stringList(visualAnalysis?.what_looks_good)} />
            </div>
          </div>
        </div>
      </Panel>

      <section className="grid gap-4 xl:grid-cols-2">
        <Panel title="Research and Evidence">
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Official Website Evidence</p>
            <div className="mt-2 grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
              <Meta label="Title" value={String(scan?.page_title || "-")} />
              <Meta label="Platform" value={String(scan?.detected_website_platform || prospect.existing_website_platform || "-")} />
              <Meta label="Booking" value={String(scan?.detected_booking_platform || prospect.existing_booking_platform || "-")} />
              <Meta label="Scanned" value={formatDateTime(String(scan?.scanned_at || latestScanAnalysis?.created_at || ""))} />
              <Meta label="Research provider" value={latestAnalysis?.research_provider || "-"} />
              <Meta label="Official source" value={latestAnalysis?.confirmed_official_url || prospect.website_url || "-"} />
              <Meta label="Scan coverage" value={latestAnalysis?.scan_coverage_confidence || "-"} />
              <Meta label="Coverage note" value={latestAnalysis?.scan_coverage_note || "-"} />
            </div>
            {latestAnalysis?.scan_coverage_confidence === "low" && (
              <p className="mt-3 rounded-md border border-yellow-500/25 bg-yellow-500/10 p-2 text-xs text-yellow-100">
                Official scan coverage is weak. Signal should not make confident visual/site-quality claims from HTML alone; upload a screenshot or add verified observations.
              </p>
            )}
            {weighting && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                <EvidenceGroup title="Official Website Evidence" items={stringList(weighting.official_website_evidence)} />
                <EvidenceGroup title="Visual Screenshot Evidence" items={stringList((weighting.visual_screenshot_evidence as Record<string, unknown> | undefined)?.analysis ? [JSON.stringify((weighting.visual_screenshot_evidence as Record<string, unknown>).analysis)] : [])} />
                <EvidenceGroup title="Human-Entered Observations" items={stringList(weighting.user_research_observations)} />
                <EvidenceGroup title="System-Derived Classification" items={[JSON.stringify(weighting.system_derived_classification || {})]} />
                <EvidenceGroup title="AI Interpretation" items={stringList([weighting.ai_interpretation])} />
              </div>
            )}
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
          <div className="mt-4 grid gap-3">
            <TextBlock label="Human notes" value={prospect.human_notes} />
            <TextBlock label="What looks good" value={prospect.what_looks_good} />
            <TextBlock label="Visible problem" value={prospect.visible_problem} />
          </div>
          <div className="mt-4 rounded-lg border border-border bg-muted/30 p-3">
            <p className="text-sm font-medium">Add Verified Observation</p>
            <div className="mt-3 grid gap-2 sm:grid-cols-2">
              <select value={observationCategory} onChange={(event) => setObservationCategory(event.target.value)} className="h-9 rounded-lg border border-border bg-background px-3 text-sm">
                {["site_design", "services", "booking", "gallery", "public_contact", "reputation", "platform", "business_context"].map((value) => (
                  <option key={value} value={value}>{value.replace(/_/g, " ")}</option>
                ))}
              </select>
              <select value={observationSource} onChange={(event) => setObservationSource(event.target.value)} className="h-9 rounded-lg border border-border bg-background px-3 text-sm">
                {["manual_public_site_review", "official_public_site", "existing_conversation", "personal_relationship"].map((value) => (
                  <option key={value} value={value}>{value.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
            <textarea value={observationNote} onChange={(event) => setObservationNote(event.target.value)} placeholder="Verified public observation" className="mt-2 min-h-16 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm" />
            <input value={observationUrl} onChange={(event) => setObservationUrl(event.target.value)} placeholder="Optional source URL" className="mt-2 h-9 w-full rounded-lg border border-border bg-background px-3 text-sm" />
            <button type="button" disabled={!observationNote.trim() || working === "observation"} onClick={addObservation} className="mt-2 inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50">
              {working === "observation" ? "Saving..." : "Save Observation"}
            </button>
            {verifiedObservations.length > 0 && (
              <div className="mt-4 space-y-2">
                {verifiedObservations.slice(0, 6).map((item) => (
                  <div key={item.id} className="rounded-md border border-border bg-background/50 p-2 text-xs text-muted-foreground">
                    <span className="text-foreground">{item.category.replace(/_/g, " ")}</span>
                    {" "}· {item.source.replace(/_/g, " ")} · {formatDateTime(item.created_at)}
                    <p className="mt-1 text-sm text-foreground">{item.note}</p>
                    {item.url && <p className="mt-1 break-all">{item.url}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Score Breakdown">
          <Score label="Website opportunity" value={latestAnalysis?.website_opportunity_score} />
          <Score label="Systems/AI opportunity" value={latestAnalysis?.systems_opportunity_score} />
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
          <TextBlock label="Recommended lane" value={latestAnalysis?.recommended_lane ? laneLabels[latestAnalysis.recommended_lane] || latestAnalysis.recommended_lane : null} />
          <TextBlock label="Relevant demo" value={selectedDemoRoute || latestAnalysis?.recommended_demo || prospect.relevant_demo} />
          <TextBlock label="Commercial fit" value={latestAnalysis?.commercial_fit} />
          <TextBlock label="Evidence supporting value band" value={arrayFromJson(latestAnalysis?.evidence_supporting_value_band).join("\n")} />
          <TextBlock label="What requires discovery confirmation" value={arrayFromJson(latestAnalysis?.discovery_confirmation_needed).join("\n")} />
          <TextBlock label="Public customer positioning" value={latestAnalysis?.public_customer_positioning} />
          <TextBlock label="Brand voice summary" value={latestAnalysis?.brand_voice_summary} />
          <TextBlock label="Conversation style reason" value={prospect.conversation_style_reason || latestAnalysis?.conversation_style_reason} />
          <TextBlock label="Value reasoning" value={latestAnalysis?.potential_project_value_reason} />
          <TextBlock label="What not to pitch" value={arrayFromJson(latestAnalysis?.red_flags).join("\n") || latestAnalysis?.compliance_warning} />
        </div>
      </Panel>

      <Panel title="Facts, Inferences, Discovery Questions">
        <div className="grid gap-4 lg:grid-cols-3">
          <EvidenceGroup title="Verified Facts" items={strategyBoxes.facts} />
          <EvidenceGroup title="Reasonable Inferences" items={strategyBoxes.inferences} />
          <EvidenceGroup title="Discovery Questions" items={strategyBoxes.questions} />
        </div>
      </Panel>

      <Panel title="Outreach Cockpit">
        <div className="mb-4 grid gap-3 sm:grid-cols-3">
          <Meta label="Selected mode" value={modeLabels[prospect.outreach_mode] || prospect.outreach_mode} />
          <Meta label="Recommended channel" value={latestAnalysis?.suggested_channel ? channelLabels[latestAnalysis.suggested_channel] : "-"} />
          <Meta label="Draft created" value={formatDateTime(latestDraft?.created_at)} />
        </div>
        {!externalReady && (
          <div className="mb-4 rounded-lg border border-yellow-500/25 bg-yellow-500/10 p-3 text-sm text-yellow-100">
            {readinessWarning || "This script has not passed external-readiness checks. Review before using."}
          </div>
        )}
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-border bg-muted/30 p-3 sm:flex-row sm:items-end">
          <label className="block flex-1 space-y-2">
            <span className="text-sm font-medium">Conversation style</span>
            <select
              value={profile}
              onChange={(event) => setProfile(event.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
            >
              {Object.entries(communicationProfileLabels).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            disabled={doNotContact || working === "scripts"}
            onClick={prepareScriptsWithGuidance}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            {working === "scripts" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Prepare Scripts
          </button>
        </div>
        <label className="mb-4 block space-y-2">
          <span className="text-sm font-medium">Guidance for this Prospect</span>
          <textarea
            value={scriptGuidance}
            onChange={(event) => setScriptGuidance(event.target.value)}
            placeholder="Private guidance, e.g. already emailed them; generate only a follow-up, keep it simple, avoid AI."
            className="min-h-20 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
          />
          <span className="text-xs text-muted-foreground">Private guidance affects tone only and is never sent to the prospect.</span>
        </label>
        {guidanceHistoryConflict && (
          <div className="mb-4 rounded-lg border border-yellow-500/25 bg-yellow-500/10 p-3 text-sm text-yellow-100">
            Guidance mentions prior outreach, but no outreach event is recorded. Record prior outreach before relying on follow-up-only drafts.
          </div>
        )}
        {latestDraft ? (
          <div className="space-y-4">
            {followUpMode && (
              <div className="rounded-lg border border-yellow-500/25 bg-yellow-500/10 p-3 text-sm text-yellow-100">
                Do not contact through a second channel unless manually chosen.
              </div>
            )}
            {doNotContact ? (
              <div className="rounded-lg border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-200">
                Outreach scripts are disabled for do-not-contact prospects.
              </div>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {followUpMode && (
                  <DraftBlock
                    copyDisabled={!externalReady}
                    title="Follow-Up Draft"
                    value={latestDraft.follow_up_email || String(scriptStudio?.follow_up_draft || latestDraft.first_contact_email || "")}
                    onCopy={() => copyText(latestDraft.follow_up_email || String(scriptStudio?.follow_up_draft || latestDraft.first_contact_email || ""), "Follow-up draft")}
                  />
                )}
                {permissionMode && (
                  <DraftBlock
                    copyDisabled={!externalReady}
                    title="Demo-Send Response"
                    value={latestDraft.demo_send_followup}
                    onCopy={() => copyText(latestDraft.demo_send_followup, "Demo response")}
                  />
                )}
                {demoSentMode && (
                  <DraftBlock
                    copyDisabled={!externalReady}
                    title="Post-Demo Check-In"
                    value={latestDraft.follow_up_email || String(scriptStudio?.follow_up_draft || "")}
                    onCopy={() => copyText(latestDraft.follow_up_email || String(scriptStudio?.follow_up_draft || ""), "Post-demo check-in")}
                  />
                )}
                {discoveryMode && (
                  <DraftBlock
                    copyDisabled={!externalReady}
                    title="Proposal Angle"
                    value={latestDraft.proposal_angle}
                    onCopy={() => copyText(latestDraft.proposal_angle, "Proposal angle")}
                  />
                )}
                {firstContactMode && (
                  <>
                    <DraftBlock copyDisabled={!externalReady} title="Email Draft" value={latestDraft.first_contact_email} onCopy={() => copyText(latestDraft.first_contact_email, "Email draft")} />
                    <DraftBlock copyDisabled={!externalReady} title="Call Opener" value={latestDraft.owner_call_opener} onCopy={() => copyText(latestDraft.owner_call_opener, "Call opener")} />
                    <DraftBlock copyDisabled={!externalReady} title="Gatekeeper Script" value={latestDraft.gatekeeper_script} onCopy={() => copyText(latestDraft.gatekeeper_script, "Gatekeeper script")} />
                    <DraftBlock copyDisabled={!externalReady} title="Voicemail" value={latestDraft.voicemail_script} onCopy={() => copyText(latestDraft.voicemail_script, "Voicemail script")} />
                    {latestDraft.permission_based_dm && (
                      <DraftBlock copyDisabled={!externalReady} title="Permission-Based DM" value={latestDraft.permission_based_dm} onCopy={() => copyText(latestDraft.permission_based_dm, "DM draft")} />
                    )}
                  </>
                )}
                {scriptStudio && (
                  <>
                    <DraftBlock copyDisabled={!externalReady} title="If They Ask How Much" value={String(scriptStudio.how_much_response || "")} onCopy={() => copyText(String(scriptStudio.how_much_response || ""), "Price response")} />
                    <DraftBlock copyDisabled={!externalReady} title="Already Use Booking Software" value={String(scriptStudio.already_use_booking_response || "")} onCopy={() => copyText(String(scriptStudio.already_use_booking_response || ""), "Booking response")} />
                    <DraftBlock copyDisabled={!externalReady} title="Already Have a Website" value={String(scriptStudio.already_have_website_response || "")} onCopy={() => copyText(String(scriptStudio.already_have_website_response || ""), "Website response")} />
                  </>
                )}
              </div>
            )}
            {!doNotContact && !firstContactMode && (
              <details className="rounded-lg border border-border bg-muted/30 p-3">
                <summary className="cursor-pointer text-sm font-medium">View archived / alternate scripts</summary>
                <div className="mt-3 grid gap-4 xl:grid-cols-2">
                  <DraftBlock copyDisabled={!externalReady} title="Email Draft" value={latestDraft.first_contact_email} onCopy={() => copyText(latestDraft.first_contact_email, "Email draft")} />
                  <DraftBlock copyDisabled={!externalReady} title="DM Draft" value={latestDraft.permission_based_dm} onCopy={() => copyText(latestDraft.permission_based_dm, "DM draft")} />
                  <DraftBlock copyDisabled={!externalReady} title="Call Opener" value={latestDraft.owner_call_opener} onCopy={() => copyText(latestDraft.owner_call_opener, "Call opener")} />
                  <DraftBlock copyDisabled={!externalReady} title="Gatekeeper Script" value={latestDraft.gatekeeper_script} onCopy={() => copyText(latestDraft.gatekeeper_script, "Gatekeeper script")} />
                  <DraftBlock copyDisabled={!externalReady} title="Voicemail" value={latestDraft.voicemail_script} onCopy={() => copyText(latestDraft.voicemail_script, "Voicemail script")} />
                </div>
              </details>
            )}
            <div className="rounded-lg border border-border bg-muted/30 p-3">
              <p className="mb-2 text-sm font-medium">Discovery Questions</p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                {arrayFromJson(latestDraft.discovery_call_questions).map((question) => (
                  <li key={question}>• {question}</li>
                ))}
              </ul>
            </div>
            {scriptStudio && Array.isArray(scriptStudio.evidence_citations) && (
              <div className="rounded-lg border border-border bg-muted/30 p-3">
                <p className="mb-2 text-sm font-medium">Source Evidence</p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  {(scriptStudio.evidence_citations as string[]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Run a deep dive to generate draft-only outreach scripts for manual review.
          </p>
        )}
      </Panel>

      <Panel title="Correct Signal">
        <div className="flex flex-wrap gap-2">
          <CorrectionButton onClick={() => submitCorrection("wrong_playbook", prospect.industry_playbook)}>Wrong playbook</CorrectionButton>
          <CorrectionButton onClick={() => submitCorrection("wrong_demo", latestAnalysis?.recommended_demo || prospect.relevant_demo)}>Wrong demo</CorrectionButton>
          <CorrectionButton onClick={() => submitCorrection("wrong_channel", latestAnalysis?.suggested_channel)}>Wrong channel</CorrectionButton>
          <CorrectionButton onClick={() => submitCorrection("wrong_communication_profile", communicationProfile)}>Wrong communication profile</CorrectionButton>
          <CorrectionButton onClick={() => submitCorrection("wrong_score_lane", latestAnalysis?.recommended_lane)}>Wrong score/lane</CorrectionButton>
          <CorrectionButton onClick={() => submitCorrection("draft_sounds_unnatural", latestDraft?.id)}>Draft sounds unnatural</CorrectionButton>
          <CorrectionButton onClick={() => submitCorrection("contact_history_incorrect", prospect.outreach_history)}>Contact/history incorrect</CorrectionButton>
        </div>
      </Panel>

      <Panel title="Timeline">
        <div className="space-y-2">
          {timeline.map((item, index) => (
            <div key={`${item.date}-${item.title}-${index}`} className="rounded-lg border border-border bg-muted/30 p-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="font-medium">{item.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border bg-background px-2 py-0.5">
                    {item.category}
                  </span>
                  <span>{formatDateTime(item.date)}</span>
                </div>
              </div>
            </div>
          ))}
          {timeline.length === 0 && (
            <p className="text-sm text-muted-foreground">No timeline events stored yet.</p>
          )}
        </div>
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

function MetricCard({ label, note, value }: { label: string; note?: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-2 break-words text-lg font-semibold">{value}</p>
      {note && <p className="mt-2 text-xs text-muted-foreground">{note}</p>}
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

function EvidenceGroup({ items, title }: { items: string[]; title: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/50 p-3">
      <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      {items.length > 0 ? (
        <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
          {items.slice(0, 5).map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-muted-foreground">No stored evidence in this category yet.</p>
      )}
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

function CorrectionButton({ children, onClick }: { children: React.ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex h-9 items-center justify-center rounded-lg border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
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
  copyDisabled,
  onCopy,
  title,
  value,
}: {
  copyDisabled?: boolean
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
          disabled={!value || copyDisabled}
          onClick={onCopy}
          className="inline-flex h-8 items-center gap-1.5 rounded-md border border-border px-2 text-xs text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40"
        >
          <Clipboard className="h-3.5 w-3.5" />
          Copy
        </button>
      </div>
      {copyDisabled && (
        <p className="mb-2 text-xs text-yellow-200">Needs Manual Review before copy is enabled.</p>
      )}
      <p className="whitespace-pre-wrap text-sm text-muted-foreground">{value || "No draft yet."}</p>
    </div>
  )
}
