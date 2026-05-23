import "server-only"

import type {
  SignalAnalysis,
  SignalCommunicationProfile,
  SignalConversationStyle,
  SignalProspect,
} from "@/lib/supabase/types"
import {
  profileToConversationStyle,
  SIGNAL_COMMUNICATION_PROFILE_LABELS,
  suggestCommunicationProfile,
} from "./communication-profile"
import {
  SIGNAL_CONVERSATION_STYLE_LABELS,
  suggestSignalConversationStyle,
} from "./conversation"
import {
  externalDraftReadiness,
  getRecommendedNextAction,
  hasExplicitWarmRelationship,
} from "./calibration"
import { getSignalPlaybook, MEDICAL_COMPLIANCE_WARNING } from "./playbooks"
import type { SignalWebsiteScan } from "./website"

export type SignalScriptStudio = {
  conversation_style: SignalConversationStyle
  conversation_style_label: string
  conversation_style_reason: string
  communication_profile: SignalCommunicationProfile
  communication_profile_label: string
  communication_profile_reason: string
  first_call_opener: string
  receptionist_script: string
  voicemail_script: string
  permission_based_dm: string
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
  external_readiness: {
    passed: boolean
    blocked_terms: string[]
    warning: string | null
  }
  recommended_next_action: string
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
  if (demo === "auto-detailing") return "https://mountline.dev/work/auto-detailing"
  if (demo === "barber-shop") return "https://mountline.dev/work/barber-shop"
  return "Relevant demo placeholder: short written concept first"
}

function identityLine(prospect: SignalProspect) {
  if (prospect.outreach_mode === "warm_connection" && hasExplicitWarmRelationship(prospect)) {
    return "Luke with Mountline Studio."
  }
  if (prospect.outreach_mode === "local_student") {
    return "I'm Luke - I'm a Keller High student building a small web studio called Mountline Studio."
  }
  return "I'm Luke with Mountline Studio."
}

function howMuchResponse(analysis: SignalAnalysis | null) {
  const band = analysis?.potential_project_value_band || "unknown"
  if (band === "unknown") {
    return "Totally fair question. I would want to understand the scope first, then send a clear range instead of guessing on the call."
  }
  return `Totally fair question. A project like this could land around ${band} depending on scope, but I would confirm what actually needs to be built before quoting anything.`
}

function bookingResponse(prospect: SignalProspect) {
  const platform = prospect.existing_booking_platform || "the booking tool that already works"
  return `That is good to keep. I would not replace ${platform} just to replace it. The useful angle would be making the customer-facing site clearer around that tool and preserving the booking or payment flow that already works.`
}

function websiteResponse(
  prospect: SignalProspect,
  analysis: SignalAnalysis | null,
  scan: SignalWebsiteScan | null,
) {
  const observation = supportedObservation(prospect, analysis, scan)
  return `That makes sense. This would not be a "your site is bad" conversation. The only reason for reaching out is one specific improvement area: ${observation}. If it is not useful, I can leave it there.`
}

function followUpDraft(prospect: SignalProspect, analysis: SignalAnalysis | null) {
  const demo = demoLine(analysis, prospect)
  return [
    `Hi${prospect.contact_name ? ` ${prospect.contact_name}` : ""},`,
    "",
    `Quick follow-up on the ${analysis?.recommended_primary_offer?.toLowerCase() || "website idea"} for ${prospect.business_name}.`,
    demo.startsWith("/")
      ? `If it is useful, I can send over the concept here: ${demo}.`
      : "If it is useful, I can send over a short written concept.",
    "If now is not a fit, no problem - I will not keep following up.",
    "",
    "Luke",
    "Mountline Studio",
  ].join("\n")
}

function firstEmailDraft({
  analysis,
  channel,
  firstLine,
  location,
  offer,
  positive,
  prospect,
  observation,
  profile,
}: {
  analysis: SignalAnalysis | null
  channel: string
  firstLine: string
  location: string
  offer: string
  positive: string
  prospect: SignalProspect
  observation: string
  profile: SignalCommunicationProfile
}) {
  if (prospect.outreach_status === "awaiting_reply" || prospect.outreach_status === "contacted") {
    return followUpDraft(prospect, analysis)
  }

  const ask =
    prospect.outreach_mode === "local_student"
      ? "Would you be open to me sending a quick concept site or a few notes?"
      : channel === "call"
        ? "Would it be alright to send a short concept, or is there a better person for website or workflow questions?"
        : "Would it be alright for Mountline to send a short concept or a few notes?"

  if (profile === "plainspoken_owner_operator") {
    return [
      `Hi${prospect.contact_name ? ` ${prospect.contact_name}` : ""},`,
      "",
      `My name is Luke. I'm local and I build websites for small businesses. I took a look at ${prospect.business_name}, and ${positive}.`,
      "",
      `I noticed the website could make it easier for customers to see what you offer and get in touch. I put together an example of what I mean. Would it be alright if I sent it over?`,
      "",
      "No pressure either way.",
      "",
      "Luke",
      "Mountline Studio",
    ].join("\n")
  }

  if (profile === "modern_casual_brand") {
    return [
      `Hey${prospect.contact_name ? ` ${prospect.contact_name}` : ""} -`,
      "",
      `I'm Luke, founder of Mountline Studio here locally. I came across ${prospect.business_name}${location ? ` in ${location}` : ""} and the brand/work looks sharp.`,
      "",
      `I had an idea for making the site feel just as polished and easier to book through. I built a concept in this space - cool if I send it over?`,
      "",
      "Luke",
      "Mountline Studio",
    ].join("\n")
  }

  if (prospect.outreach_mode === "local_student" || profile === "friendly_local") {
    return [
      `Hi${prospect.contact_name ? ` ${prospect.contact_name}` : ""},`,
      "",
      `${firstLine} I came across ${prospect.business_name}${location ? ` in ${location}` : ""} and was genuinely impressed by ${positive}.`,
      "",
      `I had one idea for how the site could make ${observation} easier for customers to see. I built a general concept for businesses like yours - would you be open to me sending it over?`,
      "",
      "If not, no problem at all.",
      "",
      "Luke",
      "Mountline Studio",
    ].join("\n")
  }

  return [
    `Hi${prospect.contact_name ? ` ${prospect.contact_name}` : ""},`,
    "",
    `${firstLine} I reviewed the public website for ${prospect.business_name}${location ? ` in ${location}` : ""} and noticed one practical opportunity.`,
    "",
    `It looks like ${observation}. I would be glad to share a brief concept or a few specific recommendations if that would be useful.`,
    "",
    ask,
    "",
    "If this is not useful, reply no and Mountline will not follow up.",
    "",
    "Luke",
    "Mountline Studio",
  ].join("\n")
}

function readinessForStudio(studio: Omit<SignalScriptStudio, "external_readiness">) {
  const texts = [
    studio.first_call_opener,
    studio.receptionist_script,
    studio.voicemail_script,
    studio.permission_based_dm,
    studio.sure_send_it_response,
    studio.how_much_response,
    studio.already_use_booking_response,
    studio.already_have_website_response,
    studio.first_email_draft,
    studio.follow_up_draft,
    studio.proposal_angle,
  ].join("\n")
  const readiness = externalDraftReadiness(texts)
  return {
    passed: readiness.passed,
    blocked_terms: readiness.blockedTerms,
    warning: readiness.passed
      ? null
      : `Draft needs review before use. Internal terms detected: ${readiness.blockedTerms.join(", ")}.`,
  }
}

export function buildSignalScriptStudio({
  analysis,
  communicationProfile,
  conversationStyle,
  guidance,
  prospect,
  scan,
}: {
  analysis: SignalAnalysis | null
  communicationProfile?: SignalCommunicationProfile | null
  conversationStyle?: SignalConversationStyle | null
  guidance?: string | null
  prospect: SignalProspect
  scan: SignalWebsiteScan | null
}): SignalScriptStudio {
  const suggested = suggestSignalConversationStyle(prospect, scan)
  const profileSuggestion = suggestCommunicationProfile(
    {
      ...prospect,
      script_guidance: guidance || prospect.script_guidance,
    },
    scan,
  )
  const profile =
    communicationProfile ||
    prospect.suggested_communication_profile ||
    analysis?.communication_profile ||
    profileSuggestion.profile
  const style = conversationStyle || profileToConversationStyle(profile) || prospect.conversation_style || suggested.style
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
  const recommendedNextAction = analysis?.recommended_next_action || getRecommendedNextAction(prospect, analysis)

  const localAsk = `I noticed ${observation}. Would you be open to me sending a quick concept site or a few notes?`
  const first_call_opener =
    prospect.outreach_status === "awaiting_reply" || prospect.outreach_status === "contacted"
      ? "Wait for the follow-up date before calling. If a call becomes appropriate later, keep it short and reference the previous note naturally."
      : profile === "plainspoken_owner_operator"
        ? `Hi, my name is Luke. I'm local and I build websites for small businesses. Is this the right person for ${prospect.business_name}'s website? I had one simple idea that could make services and contact info easier for customers to find.`
      : profile === "modern_casual_brand"
        ? `Hey, this is Luke with Mountline Studio. Is this the right person for ${prospect.business_name}'s website or booking setup? I had one quick idea for making the site feel more polished and easier to use.`
      : prospect.outreach_mode === "local_student"
        ? `${firstLine} Is this the right person for ${prospect.business_name}'s website? ${localAsk}`
        : `${firstLine} Is this the right person for ${prospect.business_name}'s website or customer inquiry process? I noticed ${observation}. Could I send a short, specific concept, or is there a better person to ask?`

  const receptionist_script =
    prospect.outreach_mode === "local_student"
      ? `Hi, this is Luke with Mountline Studio. I had a quick website question for ${prospect.business_name}. Who usually handles the website or customer inquiries?`
      : `Hi, this is Luke with Mountline Studio. I had a short website or operations question for ${prospect.business_name}. Who usually handles the public website, marketing, or customer inquiry process?`

  const voicemail_script =
    prospect.outreach_mode === "local_student"
      ? `Hi, this is Luke with Mountline Studio. I had one quick website idea for ${prospect.business_name} and wanted to ask if I could send it over. No pressure - thanks.`
      : `Hi, this is Luke with Mountline Studio calling about ${prospect.business_name}. I noticed one specific public-site idea around ${offer.toLowerCase()} and wanted to ask permission to send a short concept. Thanks.`

  const sure_send_it_response = `Great, thank you. I will send a short note with the specific observation, why it may matter, and the relevant concept link: ${demoLine(analysis, prospect)}.`
  const permission_based_dm =
    prospect.outreach_status === "awaiting_reply" || prospect.outreach_status === "contacted"
      ? `Quick follow-up on the ${offer.toLowerCase()} note I sent for ${prospect.business_name}. If it is useful, I can send the concept link. If not, no problem.`
      : prospect.outreach_mode === "local_student"
        ? `Hi, I'm Luke - I'm a Keller High student building Mountline Studio. I came across ${prospect.business_name} and had one respectful website idea. Would it be okay if I sent a quick concept?`
        : `Hi, this is Luke with Mountline Studio. I had one specific website idea for ${prospect.business_name}: ${observation}. Would it be alright to send a short concept?`

  const already_use_booking_response = bookingResponse(prospect)
  const already_have_website_response = websiteResponse(prospect, analysis, scan)
  const how_much_response = howMuchResponse(analysis)

  const discovery_call_questions = playbook.discoveryQuestions.slice(0, 7)
  const safeQuestions =
    prospect.compliance_tier === "compliance_gated"
      ? discovery_call_questions.filter((question) => !/patient|records|symptoms|ehr/i.test(question))
      : discovery_call_questions

  const first_email_draft = firstEmailDraft({
    analysis,
    channel,
    firstLine,
    location,
    offer,
    positive,
    prospect,
    observation,
    profile,
  })

  const proposal_angle =
    analysis?.potential_project_value_reason ||
    `Start with ${offer.toLowerCase()}, keep the pitch tied to public evidence, then use discovery to confirm scope before discussing any operational add-ons.`

  const objection_responses = {
    how_much: how_much_response,
    already_use_booking: already_use_booking_response,
    already_have_website: already_have_website_response,
  }

  const studioWithoutReadiness = {
    conversation_style: style,
    conversation_style_label: SIGNAL_CONVERSATION_STYLE_LABELS[style],
    conversation_style_reason: styleReason,
    communication_profile: profile,
    communication_profile_label: SIGNAL_COMMUNICATION_PROFILE_LABELS[profile],
    communication_profile_reason:
      prospect.communication_profile_reason ||
      analysis?.communication_profile_reason ||
      profileSuggestion.reason,
    first_call_opener,
    receptionist_script,
    voicemail_script,
    permission_based_dm,
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
    recommended_next_action: recommendedNextAction,
  }

  return {
    ...studioWithoutReadiness,
    external_readiness: readinessForStudio(studioWithoutReadiness),
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
    communication_profile: record.communication_profile || "friendly_local",
    communication_profile_label:
      record.communication_profile_label ||
      SIGNAL_COMMUNICATION_PROFILE_LABELS[record.communication_profile || "friendly_local"],
    communication_profile_reason:
      compact(record.communication_profile_reason) || "Stored communication profile.",
    first_call_opener: compact(record.first_call_opener),
    receptionist_script: compact(record.receptionist_script),
    voicemail_script: compact(record.voicemail_script),
    permission_based_dm: compact(record.permission_based_dm),
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
    external_readiness:
      record.external_readiness && typeof record.external_readiness === "object"
        ? (record.external_readiness as SignalScriptStudio["external_readiness"])
        : { passed: true, blocked_terms: [], warning: null },
    recommended_next_action: compact(record.recommended_next_action) || "Review the latest prospect status before outreach.",
  }
}
