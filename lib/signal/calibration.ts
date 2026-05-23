import "server-only"

import type {
  SignalAnalysis,
  SignalLocalityScope,
  SignalOutreachHistory,
  SignalOutreachMode,
  SignalProspect,
  SignalRecommendedLane,
  SignalRelationshipType,
  SignalSuggestedChannel,
} from "@/lib/supabase/types"
import { getSignalPlaybook, inferSignalPlaybook } from "./playbooks"
import type { SignalWebsiteScan } from "./website"

const FIRST_CONTACT_STATUSES = new Set(["researched", "needs_review", "ready_to_contact"])
const CONTACTED_STATUSES = new Set(["contacted", "awaiting_reply"])

function text(...values: Array<string | null | undefined>) {
  return values.filter(Boolean).join(" ").toLowerCase()
}

function includesAny(value: string, words: string[]) {
  return words.some((word) => value.includes(word))
}

export function classifySignalLocality(prospect: SignalProspect): SignalLocalityScope {
  const pool = text(prospect.locality_relationship, prospect.city, prospect.state, prospect.human_notes)
  if (includesAny(pool, ["keller", "roanoke"])) return "keller_local"
  if (includesAny(pool, ["dfw", "dallas", "fort worth", "nearby", "north texas"])) return "dfw_nearby"
  if (includesAny(pool, ["remote", "not local", "out of state"])) return "remote"
  return prospect.locality_scope || "unknown"
}

export function classifySignalRelationship(prospect: SignalProspect): SignalRelationshipType {
  if (prospect.relationship_type && prospect.relationship_type !== "none") {
    return prospect.relationship_type
  }

  const pool = text(prospect.locality_relationship, prospect.human_notes)
  if (includesAny(pool, ["knows owner", "owner knows", "know the owner"])) return "knows_owner"
  if (includesAny(pool, ["family referral", "family referred", "through family"])) return "family_referral"
  if (includesAny(pool, ["personally visited", "visited in person", "been there"])) return "personally_visited"
  if (includesAny(pool, ["customer", "bought from", "used them"])) return "customer"
  if (includesAny(pool, ["referral", "referred"])) return "referred"
  return "none"
}

export function classifySignalOutreachHistory(prospect: SignalProspect): SignalOutreachHistory {
  if (prospect.outreach_status === "awaiting_reply") return "awaiting_reply"
  if (prospect.follow_up_date) {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(`${prospect.follow_up_date}T00:00:00`)
    if (!Number.isNaN(due.getTime()) && due <= today) return "follow_up_due"
  }

  if (prospect.outreach_history && prospect.outreach_history !== "never_contacted") {
    return prospect.outreach_history
  }

  const pool = text(prospect.locality_relationship, prospect.human_notes)
  if (includesAny(pool, ["awaiting reply", "waiting for reply"])) return "awaiting_reply"
  if (includesAny(pool, ["already emailed", "emailed", "sent email"])) return "emailed"
  if (includesAny(pool, ["already called", "called"])) return "called"
  if (includesAny(pool, ["dm attempted", "sent dm", "messaged on instagram"])) return "dm_attempted"
  return "never_contacted"
}

export function hasExplicitWarmRelationship(prospect: SignalProspect) {
  return classifySignalRelationship(prospect) !== "none"
}

export function deterministicSignalPlaybook(prospect: SignalProspect) {
  const deterministic = inferSignalPlaybook(
    text(
      prospect.industry,
      prospect.business_name,
      prospect.human_notes,
      prospect.what_looks_good,
      prospect.visible_problem,
    ),
  )

  if (deterministic !== "general_local_business") return deterministic
  return getSignalPlaybook(prospect.industry_playbook).key
}

export function deterministicRelevantDemo(prospect: SignalProspect) {
  const playbook = getSignalPlaybook(deterministicSignalPlaybook(prospect))
  if (playbook.relevantDemo !== "none") return playbook.relevantDemo
  return prospect.relevant_demo || "none"
}

export function suggestedCalibratedOutreachMode(prospect: SignalProspect): SignalOutreachMode {
  if (hasExplicitWarmRelationship(prospect)) return "warm_connection"
  const playbook = getSignalPlaybook(deterministicSignalPlaybook(prospect))
  const locality = classifySignalLocality(prospect)

  if (
    ["auto_detailing", "barber_salon", "general_local_business"].includes(playbook.key) &&
    (locality === "keller_local" || locality === "dfw_nearby")
  ) {
    return "local_student"
  }

  return "professional_studio"
}

export function suggestedCalibratedChannel(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
): SignalSuggestedChannel {
  if (hasExplicitWarmRelationship(prospect)) return "warm_intro"
  if (prospect.public_email || scan?.visible_emails.length) return "email"
  if (prospect.public_phone || scan?.visible_phones.length) return "call"
  if (prospect.public_contact_form_url) return "contact_form"
  if (prospect.instagram_url) return "instagram"
  return "research_more"
}

export function getSignalDemoRoute(demo: string | null | undefined) {
  if (demo === "auto-detailing") return "/work/auto-detailing"
  if (demo === "barber-shop") return "/work/barber-shop"
  return null
}

export function getRecommendedLane({
  complianceTier,
  systemsScore,
  websiteScore,
}: {
  complianceTier: string
  systemsScore: number
  websiteScore: number
}): SignalRecommendedLane {
  if (complianceTier === "compliance_gated") return "compliance_gated"
  if (websiteScore < 45 && systemsScore < 45) return "do_not_pursue"
  if (websiteScore >= systemsScore || websiteScore >= 70) return "website_first"
  return "systems_discovery"
}

export function getRecommendedNextAction(prospect: SignalProspect, analysis?: SignalAnalysis | null) {
  const status = prospect.outreach_status
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const followUp = prospect.follow_up_date ? new Date(`${prospect.follow_up_date}T00:00:00`) : null
  const followUpDue = Boolean(followUp && !Number.isNaN(followUp.getTime()) && followUp <= today)
  const demoRoute = getSignalDemoRoute(analysis?.recommended_demo || prospect.relevant_demo)

  if (status === "do_not_contact") {
    return "Do not contact. Keep this record for history only unless the team intentionally re-enables it."
  }
  if (FIRST_CONTACT_STATUSES.has(status)) {
    return "Prepare first contact. Keep the message short, evidence-grounded, and permission-based."
  }
  if (CONTACTED_STATUSES.has(status)) {
    if (followUpDue) {
      return "Send one short respectful follow-up. Do not resend the first pitch."
    }
    return "Wait for reply. If no response by the follow-up date, send one short follow-up. Do not call or resend the first pitch today."
  }
  if (status === "permission_to_send_demo") {
    return demoRoute
      ? `Send the relevant demo: ${demoRoute}.`
      : "Send the promised concept or short written review."
  }
  if (status === "demo_sent") {
    return "Ask if they want a few specific recommendations. Do not keep pitching the same demo."
  }
  if (status === "interested" || status === "discovery_call") {
    return "Schedule or prepare a discovery conversation focused on their actual workflow and goals."
  }
  if (status === "proposal_sent") return "Wait for proposal response or follow up on the agreed date."
  if (status === "won") return "Won. Move work through the normal client/project process."
  if (status === "lost" || status === "no_response") return "Do not continue outreach unless the team intentionally reopens this prospect."
  return "Review the record and choose the next manual status."
}

export function externalDraftReadiness(textValue: string | null | undefined) {
  const value = textValue || ""
  const blocked = [
    "connection noted internally",
    "value band",
    "score",
    "user-entered note",
    "system detected",
    "playbook",
    "priority",
    "Signal's current",
    "internal",
  ]
  const hits = blocked.filter((phrase) => value.toLowerCase().includes(phrase.toLowerCase()))
  return {
    passed: hits.length === 0,
    blockedTerms: hits,
    warnings: hits.map((hit) => `External draft contains internal wording: ${hit}`),
  }
}
