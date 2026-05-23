import "server-only"

import type {
  SignalAnalysis,
  SignalConversationStyle,
  SignalProspect,
} from "@/lib/supabase/types"
import {
  SIGNAL_CONVERSATION_STYLE_LABELS,
  suggestSignalConversationStyle,
} from "./conversation"
import { getSignalPlaybook, MEDICAL_COMPLIANCE_WARNING } from "./playbooks"
import type { SignalWebsiteScan } from "./website"

export type SignalScriptStudio = {
  conversation_style: SignalConversationStyle
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
  first_email_draft: string
  follow_up_draft: string
  proposal_angle: string
  objection_responses: Record<string, string>
  evidence_citations: string[]
  compliance_warning: string | null
}

function compact(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || ""
}

function arrayFromJson(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function evidenceCitations(scan: SignalWebsiteScan | null, analysis: SignalAnalysis | null) {
  const citations: string[] = []

  if (scan?.headings[0]) citations.push(`Official homepage heading: ${scan.headings[0]}`)
  if (scan?.cta_words.length) {
    citations.push(`CTA language detected: ${scan.cta_words.slice(0, 4).join(", ")}`)
  }
  if (scan?.booking_links.length) citations.push("Booking or scheduling link detected on scanned official pages.")
  if (scan?.visible_phones.length) citations.push("Public phone route detected on scanned official pages.")
  if (scan?.visible_emails.length) citations.push("Public email route detected on scanned official pages.")
  if (analysis?.confirmed_official_url) {
    citations.push(`Confirmed official URL: ${analysis.confirmed_official_url}`)
  }
  if (analysis?.public_customer_positioning) {
    citations.push(`Public positioning: ${analysis.public_customer_positioning}`)
  }

  return citations.slice(0, 6)
}

function supportedObservation(
  prospect: SignalProspect,
  analysis: SignalAnalysis | null,
  scan: SignalWebsiteScan | null,
) {
  if (prospect.visible_problem) return prospect.visible_problem
  if (analysis?.recommended_primary_offer) return analysis.recommended_primary_offer
  if (scan?.cta_words.length) {
    return `the public site already asks visitors to ${scan.cta_words.slice(0, 3).join(", ")}`
  }
  if (scan?.headings[0]) return `the official site leads with "${scan.headings[0]}"`
  if (scan?.page_title) return `the official site is titled "${scan.page_title}"`
  return "there may be a public-site or workflow idea worth reviewing together"
}

function compliment(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  if (prospect.what_looks_good) return prospect.what_looks_good
  if (scan?.service_language.length) {
    return `the site makes ${scan.service_language.slice(0, 2).join(" and ")} visible`
  }
  if (scan?.visible_phones.length || prospect.public_phone) {
    return "the business gives customers a clear phone contact route"
  }
  if (scan?.headings[0]) return `the public site has a clear headline around "${scan.headings[0]}"`
  return "there is enough public information for a respectful review"
}

function demoLine(analysis: SignalAnalysis | null, prospect: SignalProspect) {
  const demo = analysis?.recommended_demo || prospect.relevant_demo
  if (demo === "auto-detailing") return "Relevant demo placeholder: /work/auto-detailing"
  if (demo === "barber-shop") return "Relevant demo placeholder: /work/barber-shop"
  return "Relevant demo placeholder: short written concept first"
}

function identityLine(prospect: SignalProspect) {
  if (prospect.outreach_mode === "warm_connection" && prospect.locality_relationship) {
    return `Luke with Mountline Studio. The connection noted internally is: ${prospect.locality_relationship}.`
  }
  if (prospect.outreach_mode === "local_student") {
    return "Luke with Mountline Studio here in the Keller area."
  }
  return "Luke with Mountline Studio."
}

function howMuchResponse(analysis: SignalAnalysis | null) {
  const band = analysis?.potential_project_value_band || "unknown"
  if (band === "unknown") {
    return "Totally fair question. Mountline would need to understand the scope first, then send a simple range instead of guessing on the call."
  }
  return `Totally fair question. For this kind of scope, Signal's current planning band is ${band}, but Mountline would confirm the real scope before quoting anything.`
}

function bookingResponse(prospect: SignalProspect) {
  const platform = prospect.existing_booking_platform || "the booking tool that already works"
  return `That is good to keep. Mountline would not replace ${platform} just to replace it. The useful angle is making the customer-facing site clearer around that tool and preserving the working booking or payment flow.`
}

function websiteResponse(
  prospect: SignalProspect,
  analysis: SignalAnalysis | null,
  scan: SignalWebsiteScan | null,
) {
  const observation = supportedObservation(prospect, analysis, scan)
  return `That makes sense. This would not be a "your site is bad" conversation. The only reason for reaching out is one specific improvement area from public evidence: ${observation}. If it is not useful, Mountline can leave it there.`
}

function followUpDraft(prospect: SignalProspect, analysis: SignalAnalysis | null) {
  return [
    `Hi${prospect.contact_name ? ` ${prospect.contact_name}` : ""},`,
    "",
    `Quick follow-up from Mountline on the ${analysis?.recommended_primary_offer?.toLowerCase() || "website idea"} for ${prospect.business_name}.`,
    "If it is useful, Mountline can send a short concept or compare notes on what would actually help. If not, no problem and Mountline will not keep following up.",
    "",
    "Luke",
    "Mountline Studio",
  ].join("\n")
}

export function buildSignalScriptStudio({
  analysis,
  conversationStyle,
  prospect,
  scan,
}: {
  analysis: SignalAnalysis | null
  conversationStyle?: SignalConversationStyle | null
  prospect: SignalProspect
  scan: SignalWebsiteScan | null
}): SignalScriptStudio {
  const suggested = suggestSignalConversationStyle(prospect, scan)
  const style = conversationStyle || prospect.conversation_style || suggested.style
  const styleReason =
    prospect.conversation_style_reason || analysis?.conversation_style_reason || suggested.reason
  const playbook = getSignalPlaybook(prospect.industry_playbook)
  const observation = supportedObservation(prospect, analysis, scan)
  const positive = compliment(prospect, scan)
  const offer = analysis?.recommended_primary_offer || "public website and workflow review"
  const channel = analysis?.suggested_channel || "call"
  const citations = evidenceCitations(scan, analysis)
  const complianceWarning =
    prospect.compliance_tier === "compliance_gated"
      ? analysis?.compliance_warning || MEDICAL_COMPLIANCE_WARNING
      : analysis?.compliance_warning
  const firstLine = identityLine(prospect)
  const location = [prospect.city, prospect.state].filter(Boolean).join(", ")

  const first_call_opener = `${firstLine} Is this the right person for ${prospect.business_name}'s website or customer inquiry process? Mountline noticed ${observation}. Could Mountline send a short, specific concept, or is there a better person to ask?`

  const receptionist_script = `Hi, Luke with Mountline Studio. Mountline had a short website or operations question for ${prospect.business_name}. Who usually handles the public website, marketing, or customer inquiry process?`

  const voicemail_script = `Hi, this is Luke with Mountline Studio calling about ${prospect.business_name}. Mountline noticed one specific public-site idea around ${offer.toLowerCase()}. The goal is just to ask permission to send a short concept. Mountline can be reached through the website or by email. Thanks.`

  const sure_send_it_response = `Great, thank you. Mountline will send a short note with the specific observation, why it may matter, and ${demoLine(analysis, prospect)}.`

  const already_use_booking_response = bookingResponse(prospect)
  const already_have_website_response = websiteResponse(prospect, analysis, scan)
  const how_much_response = howMuchResponse(analysis)

  const discovery_call_questions = playbook.discoveryQuestions.slice(0, 7)
  const safeQuestions =
    prospect.compliance_tier === "compliance_gated"
      ? discovery_call_questions.filter((question) => !/patient|records|symptoms|ehr/i.test(question))
      : discovery_call_questions

  const first_email_draft = [
    `Hi${prospect.contact_name ? ` ${prospect.contact_name}` : ""},`,
    "",
    `${firstLine} Mountline was reviewing ${prospect.business_name}${location ? ` in ${location}` : ""} and liked that ${positive}.`,
    "",
    `One practical idea stood out: ${observation}. The first thing Mountline would suggest is ${offer.toLowerCase()}, but only after confirming what is actually useful for the business.`,
    "",
    channel === "call"
      ? "Would it be alright to send a short concept, or is there a better person for website or workflow questions?"
      : "Would it be alright for Mountline to send a short concept or a few notes?",
    "",
    "If this is not useful, reply no and Mountline will not follow up.",
    "",
    "Luke",
    "Mountline Studio",
  ].join("\n")

  const proposal_angle =
    analysis?.potential_project_value_reason ||
    `Start with ${offer.toLowerCase()}, keep the pitch tied to public evidence, then use discovery to confirm scope before discussing workflow automation.`

  const objection_responses = {
    how_much: how_much_response,
    already_use_booking: already_use_booking_response,
    already_have_website: already_have_website_response,
  }

  return {
    conversation_style: style,
    conversation_style_label: SIGNAL_CONVERSATION_STYLE_LABELS[style],
    conversation_style_reason: styleReason,
    first_call_opener,
    receptionist_script,
    voicemail_script,
    sure_send_it_response,
    how_much_response,
    already_use_booking_response,
    already_have_website_response,
    discovery_call_questions: safeQuestions,
    first_email_draft,
    follow_up_draft: followUpDraft(prospect, analysis),
    proposal_angle,
    objection_responses,
    evidence_citations: citations,
    compliance_warning: complianceWarning || null,
  }
}

export function scriptStudioFromJson(value: unknown): SignalScriptStudio | null {
  if (!value || typeof value !== "object") return null
  const record = value as Partial<SignalScriptStudio>
  if (!record.first_call_opener || !record.first_email_draft) return null
  return {
    conversation_style:
      record.conversation_style || "friendly_local",
    conversation_style_label:
      record.conversation_style_label || SIGNAL_CONVERSATION_STYLE_LABELS[record.conversation_style || "friendly_local"],
    conversation_style_reason: compact(record.conversation_style_reason) || "Stored Script Studio draft.",
    first_call_opener: compact(record.first_call_opener),
    receptionist_script: compact(record.receptionist_script),
    voicemail_script: compact(record.voicemail_script),
    sure_send_it_response: compact(record.sure_send_it_response),
    how_much_response: compact(record.how_much_response),
    already_use_booking_response: compact(record.already_use_booking_response),
    already_have_website_response: compact(record.already_have_website_response),
    discovery_call_questions: arrayFromJson(record.discovery_call_questions),
    first_email_draft: compact(record.first_email_draft),
    follow_up_draft: compact(record.follow_up_draft),
    proposal_angle: compact(record.proposal_angle),
    objection_responses:
      record.objection_responses && typeof record.objection_responses === "object"
        ? (record.objection_responses as Record<string, string>)
        : {},
    evidence_citations: arrayFromJson(record.evidence_citations),
    compliance_warning: record.compliance_warning || null,
  }
}
