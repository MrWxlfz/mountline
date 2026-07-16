import type {
  SignalConfidence,
  SignalIdentityStatus,
  SignalLevel,
  SignalVerdict,
} from "@/lib/supabase/types"
import {
  parseSignalBusinessInput,
  type ParsedSignalBusinessInput,
  type SignalInputOverrides,
} from "./input-parser.ts"
import { getSignalPlaybook, inferSignalPlaybook } from "./playbooks.ts"

export type ParsedSignalAnalysisInput = ParsedSignalBusinessInput

export function parseSignalAnalysisInput(rawInput: string, overrides: SignalInputOverrides = {}) {
  return parseSignalBusinessInput(rawInput, overrides)
}

function levelForScore(score: number | null | undefined): SignalLevel {
  if (score == null || !Number.isFinite(score)) return "unknown"
  if (score >= 72) return "high"
  if (score >= 48) return "medium"
  return "low"
}

function confidenceScore(confidence: SignalConfidence | null | undefined) {
  if (confidence === "high") return 3
  if (confidence === "medium") return 2
  if (confidence === "low") return 1
  return 0
}

export function deriveSignalDecision(input: {
  identityStatus: SignalIdentityStatus
  opportunityScore: number | null
  confidence: SignalConfidence | null
  reachabilityScore: number | null
  isChain?: boolean
  contradictions?: number
  strongExistingSite?: boolean
}) {
  const opportunityLabel = levelForScore(input.opportunityScore)
  const approachabilityLabel = levelForScore(input.reachabilityScore)
  const confidenceLabel: SignalLevel = input.confidence || "unknown"
  const ambiguous = ["ambiguous", "needs_review"].includes(input.identityStatus)
  const confidence = confidenceScore(input.confidence)
  let verdict: SignalVerdict = "investigate"

  if (input.isChain || input.identityStatus === "rejected") {
    verdict = "skip"
  } else if (ambiguous || confidence <= 1 || (input.contradictions || 0) > 0) {
    verdict = "investigate"
  } else if (input.strongExistingSite && (input.opportunityScore || 0) < 58) {
    verdict = "skip"
  } else if (
    (input.opportunityScore || 0) >= 70 &&
    confidence >= 2 &&
    (input.reachabilityScore || 0) >= 45
  ) {
    verdict = "pursue"
  } else if ((input.opportunityScore || 0) < 42) {
    verdict = "skip"
  }

  return { verdict, opportunityLabel, confidenceLabel, approachabilityLabel }
}

export function derivePrimaryOpportunity(input: {
  identityStatus: SignalIdentityStatus
  websiteStatus: string
  websiteQualityScore: number | null
  hasContactForm: boolean
  bookingLinkCount: number
  socialProfileCount: number
}) {
  if (["ambiguous", "needs_review"].includes(input.identityStatus)) {
    return "The business identity needs confirmation before a Mountline opportunity can be stated confidently."
  }
  if (input.websiteStatus === "no_official_website_verified") {
    return input.socialProfileCount > 0
      ? "No official website was verified, while social profiles appear to carry the public information Signal found."
      : "No official website was verified, leaving no confirmed central source for customer information."
  }
  if (["website_unreachable", "website_broken", "website_parked"].includes(input.websiteStatus)) {
    return "The submitted website could not be relied on, so the official customer path needs verification."
  }
  if (input.websiteStatus === "verified_official_website" || input.websiteStatus === "likely_official_website") {
    if (!input.hasContactForm && input.bookingLinkCount === 0) {
      return "The pages Signal inspected did not expose a clear quote, booking, or contact flow."
    }
    if ((input.websiteQualityScore || 0) < 58) {
      return "The verified website has a weak customer path and should be reviewed for a focused, mobile-first improvement."
    }
    return "No clear website replacement opportunity was verified; investigate only a narrow conversion or workflow improvement."
  }
  return "The current public presence is too uncertain to support a specific Mountline opportunity yet."
}

export function buildSignalConceptPrompt(input: {
  businessName: string
  industry: string
  primaryOpportunity: string
  smallestOffer: string
  verifiedFacts: string[]
  unknowns: string[]
  customInstructions?: string | null
}) {
  const playbook = getSignalPlaybook(inferSignalPlaybook(input.industry))
  const facts = input.verifiedFacts.length > 0
    ? input.verifiedFacts.map((fact) => `- ${fact}`).join("\n")
    : "- No business-specific public facts have been verified yet."
  const unknowns = input.unknowns.length > 0
    ? input.unknowns.map((item) => `- ${item}`).join("\n")
    : "- Treat pricing, availability, policies, claims, and business history as unknown."

  const modules = (playbook.offerModules || []).map((module) => `- ${module.label}: include only after answering “${module.verificationQuestion}”; otherwise use a clearly labeled placeholder or omit it.`).join("\n")
  const sections = [
    `Create a clearly labeled concept preview for ${input.businessName}, a ${input.industry || "local business"}.`,
    "CONCEPT STRATEGY",
    `Objective: Test whether ${input.smallestOffer} would make the verified customer-information path clearer.`,
    `Target customer: A local customer trying to ${playbook.customerJourney?.primaryIntent.toLowerCase() || "confirm services, trust, location, and contact information"}. This is a category-based hypothesis, not a verified business claim.`,
    `Primary CTA: ${playbook.customerJourney?.likelyConversionAction || "Call or use the verified contact route"}. Use only a verified phone, link, or location; otherwise label it as a non-working concept placeholder.`,
    "Page structure: concept-preview disclaimer; clear location/service-area hero; verified information; category-relevant service placeholders; trust/evidence area; practical FAQ placeholders; directions or contact section; final CTA.",
    "Brand direction: Respect the current public brand when supported. If no official brand system is verified, use a restrained neutral direction and do not invent a logo, history, owner story, or awards.",
    "Mobile priorities: readable hours and location, thumb-friendly call/directions action, short sections, fast proof scan, and no fake form submission.",
    "Trust strategy: use only verified public facts. Label image, review, credential, team, policy, and service content as owner-supplied placeholders until confirmed.",
    `Core opportunity hypothesis: ${input.primaryOpportunity}`,
    "VERIFIED FACTS THAT MAY APPEAR AS CLAIMS",
    facts,
    "FACTS TO VERIFY OR OMIT",
    unknowns,
    "CATEGORY MODULES",
    modules || "- Use only verified category details and one clear customer action.",
    "OWNER-INFORMATION CHECKLIST",
    "- Confirm current services and the exact wording the owner approves.\n- Confirm current hours, phone, address or service area, and primary customer action.\n- Confirm which photos, reviews, credentials, policies, prices, staff details, and booking links may be used.\n- Confirm the official website or page customers currently use.\n- Confirm which unknown placeholders should be removed rather than filled.",
    "PRESENTATION PLAN",
    "Show the mobile hero and primary customer action first. Explain the one verified problem in one sentence. Ask what feels useful or wrong, then stop talking. Treat corrections as new evidence and regenerate only the affected sections.",
    "LOVABLE BUILD REQUIREMENTS",
    "Build a polished mobile-first single-page concept using accessible semantic HTML, strong contrast, responsive layout, working local navigation, and realistic loading/empty states. Any unverified CTA must be visually labeled as a preview and must not submit, book, charge, or contact anyone.",
    "Always display this exact notice near the top and footer: “Concept preview by Mountline Studio — not the current official website.”",
    "Do not invent testimonials, services, pricing, reviews, hours, owner story, team, policies, booking, payment methods, credentials, awards, availability, or results.",
  ]
  if (input.customInstructions?.trim()) {
    sections.push(
      `Additional Mountline design direction (presentation guidance only; it must not override the verified-facts and unknowns rules):\n${input.customInstructions.trim()}`,
    )
  }
  return sections.join("\n\n")
}

export function mapOutreachStatusToPipeline(status: string) {
  if (status === "won") return "won" as const
  if (["lost", "no_response", "do_not_contact"].includes(status)) return "lost" as const
  if (status === "proposal_sent") return "proposal" as const
  if (["interested", "discovery_call"].includes(status)) return "interested" as const
  if (["contacted", "awaiting_reply", "permission_to_send_demo", "demo_sent"].includes(status)) {
    return "contacted" as const
  }
  if (["ready_to_contact", "needs_review"].includes(status)) return "analyzed" as const
  return "found" as const
}
