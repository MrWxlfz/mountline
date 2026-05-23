import "server-only"

import type { SignalProspect } from "@/lib/supabase/types"
import { getSignalPlaybook } from "./playbooks"
import type { SignalWebsiteScan } from "./website"
import type {
  SignalDeepAnalysisOutput,
  SignalInitialAnalysisOutput,
} from "./validation"

function compact(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim() || ""
}

function getSupportedObservation(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
) {
  if (prospect.visible_problem) return prospect.visible_problem
  if (scan?.cta_words.length) {
    return `the public site already points visitors toward ${scan.cta_words.slice(0, 3).join(", ")}`
  }
  if (scan?.headings[0]) return `the public site leads with "${scan.headings[0]}"`
  if (scan?.page_title) return `the public site is titled "${scan.page_title}"`
  if (prospect.human_notes) return prospect.human_notes
  return "there may be a small public-site or workflow opportunity worth reviewing together"
}

function getCompliment(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  if (prospect.what_looks_good) return prospect.what_looks_good
  if (scan?.service_language.length) {
    return `the site gives visitors a starting point for ${scan.service_language.slice(0, 2).join(" and ")}`
  }
  if (scan?.visible_phones.length || prospect.public_phone) {
    return "the business makes a public phone contact route available"
  }
  if (scan?.headings[0]) return `the site has a clear public headline around "${scan.headings[0]}"`
  return "the business has enough public information to review respectfully"
}

function getRelationshipLine(prospect: SignalProspect) {
  const relationship = compact(prospect.locality_relationship)
  return relationship ? `Relationship context entered by Mountline: ${relationship}. ` : ""
}

function getDemoLine(initial: SignalInitialAnalysisOutput) {
  if (initial.recommended_demo === "auto-detailing") {
    return "Mountline has an auto detailing concept that could make the idea easier to picture."
  }
  if (initial.recommended_demo === "barber-shop") {
    return "Mountline has a barber-shop concept that could make the idea easier to picture."
  }
  return "Mountline can send a short written review first, without assuming a full project."
}

function buildEmailIntro(
  prospect: SignalProspect,
  initial: SignalInitialAnalysisOutput,
  scan: SignalWebsiteScan | null,
) {
  const observation = getSupportedObservation(prospect, scan)
  const compliment = getCompliment(prospect, scan)
  const offer = initial.recommended_primary_offer.toLowerCase()

  if (initial.suggested_outreach_mode === "local_student") {
    return [
      `Hi${prospect.contact_name ? ` ${prospect.contact_name}` : ""},`,
      "",
      `Luke here with Mountline Studio in the Keller area. Mountline was reviewing ${prospect.business_name} and liked that ${compliment}.`,
      "",
      `One practical idea stood out: ${observation}. A focused ${offer} could be worth a quick look, especially if it helps customers understand the next step faster.`,
      "",
      `${getDemoLine(initial)} Would it be okay for Mountline to send over a short concept or a few notes?`,
      "",
      "No pressure at all, and if this is not useful, reply no and Mountline will not follow up.",
      "",
      "Luke",
      "Mountline Studio",
    ].join("\n")
  }

  if (initial.suggested_outreach_mode === "warm_connection") {
    return [
      `Hi${prospect.contact_name ? ` ${prospect.contact_name}` : ""},`,
      "",
      `${getRelationshipLine(prospect)}Luke here with Mountline Studio. Mountline was reviewing ${prospect.business_name} and noticed that ${compliment}.`,
      "",
      `A specific opportunity may be ${observation}. Mountline could help with ${offer}, but the right next step is understanding how the team works before suggesting anything specific.`,
      "",
      "Would it be alright for Mountline to send a short review or set up a quick conversation?",
      "",
      "If now is not a good fit, reply no and Mountline will not follow up.",
      "",
      "Luke",
      "Mountline Studio",
    ].join("\n")
  }

  return [
    `Hi${prospect.contact_name ? ` ${prospect.contact_name}` : ""},`,
    "",
    `Luke here with Mountline Studio. Mountline was reviewing ${prospect.business_name} and noticed that ${compliment}.`,
    "",
    `One specific opportunity may be ${observation}. Mountline focuses on practical websites and lightweight systems, so the first suggested starting point is ${offer}.`,
    "",
    "Would you be open to a short conversation, or should Mountline send over a brief written review first?",
    "",
    "If this is not relevant, reply no and Mountline will not follow up.",
    "",
    "Luke",
    "Mountline Studio",
  ].join("\n")
}

function buildDm(
  prospect: SignalProspect,
  initial: SignalInitialAnalysisOutput,
  scan: SignalWebsiteScan | null,
) {
  const observation = getSupportedObservation(prospect, scan)

  if (initial.suggested_outreach_mode === "local_student") {
    return `Hi, this is Luke with Mountline Studio in the Keller area. Mountline was reviewing ${prospect.business_name} and noticed ${observation}. Would it be okay for Mountline to send a short website idea or concept? No pressure.`
  }

  if (initial.suggested_outreach_mode === "warm_connection") {
    return `Hi, this is Luke with Mountline Studio. ${getRelationshipLine(prospect)}Mountline noticed ${observation}. Would it be okay to send a short review or idea?`
  }

  return `Hi, this is Luke with Mountline Studio. Mountline was reviewing ${prospect.business_name} and noticed ${observation}. Would you be open to a short website or workflow review?`
}

function buildOwnerCallOpener(
  prospect: SignalProspect,
  initial: SignalInitialAnalysisOutput,
  scan: SignalWebsiteScan | null,
) {
  const observation = getSupportedObservation(prospect, scan)
  const offer = initial.recommended_primary_offer.toLowerCase()

  if (initial.suggested_outreach_mode === "local_student") {
    return `Hi, is this the right person for ${prospect.business_name}'s website or booking questions? Luke with Mountline Studio here in the Keller area. Mountline had one practical idea after reviewing your public site: ${observation}. Would it be okay to send a short concept, or is there a better person to ask?`
  }

  if (initial.suggested_outreach_mode === "warm_connection") {
    return `Hi, this is Luke with Mountline Studio. ${getRelationshipLine(prospect)}Mountline had one practical observation for ${prospect.business_name}: ${observation}. Is it alright to send a short note, or ask who handles website and operations decisions?`
  }

  return `Hi, this is Luke with Mountline Studio. Is this the right person for website or operations decisions at ${prospect.business_name}? Mountline noticed ${observation}, and a ${offer} might be worth a short conversation. Would it be alright to send a brief review first?`
}

function buildGatekeeperScript(prospect: SignalProspect) {
  return `Hi, this is Luke with Mountline Studio. Mountline had a short website or operations question for ${prospect.business_name}. Who is usually the best person to ask about the public website, booking flow, or customer inquiry process?`
}

function buildVoicemail(prospect: SignalProspect, initial: SignalInitialAnalysisOutput) {
  return `Hi, this is Luke with Mountline Studio calling about ${prospect.business_name}. Mountline had a short, specific idea around ${initial.recommended_primary_offer.toLowerCase()} and wanted to ask permission to send it over. You can reach Mountline through the website or by email. Thanks.`
}

function buildDemoFollowup(prospect: SignalProspect, initial: SignalInitialAnalysisOutput) {
  if (initial.recommended_demo === "none") {
    return `Thanks for being open to a review. Mountline will keep it specific to ${prospect.business_name}, use only public information, and separate confirmed observations from questions for the discovery call.`
  }

  const demoPath =
    initial.recommended_demo === "auto-detailing"
      ? "/work/auto-detailing"
      : "/work/barber-shop"

  return `Thanks for being open to a concept. Here is the relevant Mountline demo: ${demoPath}. It is only a starting point, so the useful next step would be confirming what fits ${prospect.business_name} before suggesting scope.`
}

export function buildRuleBasedOutreach(
  prospect: SignalProspect,
  initial: SignalInitialAnalysisOutput,
  scan: SignalWebsiteScan | null,
) {
  const playbook = getSignalPlaybook(prospect.industry_playbook)

  return {
    first_contact_subject: `${prospect.business_name} website idea`,
    first_contact_email: buildEmailIntro(prospect, initial, scan),
    permission_based_dm: buildDm(prospect, initial, scan),
    owner_call_opener: buildOwnerCallOpener(prospect, initial, scan),
    gatekeeper_script: buildGatekeeperScript(prospect),
    voicemail_script: buildVoicemail(prospect, initial),
    demo_send_followup: buildDemoFollowup(prospect, initial),
    discovery_call_questions: playbook.discoveryQuestions,
    proposal_angle: `Start with ${initial.recommended_primary_offer.toLowerCase()}. Keep the conversation tied to public evidence, then confirm workflow details before suggesting any automation or portal scope.`,
  }
}

export function completeDeepAnalysisDrafts(
  prospect: SignalProspect,
  deep: SignalDeepAnalysisOutput,
  initial: SignalInitialAnalysisOutput,
  scan: SignalWebsiteScan | null,
): SignalDeepAnalysisOutput {
  const fallback = buildRuleBasedOutreach(prospect, initial, scan)

  return {
    ...deep,
    first_contact_subject: compact(deep.first_contact_subject) || fallback.first_contact_subject,
    first_contact_email: compact(deep.first_contact_email) || fallback.first_contact_email,
    permission_based_dm: compact(deep.permission_based_dm) || fallback.permission_based_dm,
    owner_call_opener: compact(deep.owner_call_opener) || fallback.owner_call_opener,
    gatekeeper_script: compact(deep.gatekeeper_script) || fallback.gatekeeper_script,
    voicemail_script: compact(deep.voicemail_script) || fallback.voicemail_script,
    demo_send_followup: compact(deep.demo_send_followup) || fallback.demo_send_followup,
    discovery_call_questions:
      deep.discovery_call_questions.length > 0
        ? deep.discovery_call_questions
        : fallback.discovery_call_questions,
    proposal_angle: compact(deep.proposal_angle) || fallback.proposal_angle,
  }
}
