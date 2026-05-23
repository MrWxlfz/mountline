import "server-only"

import type { SignalConversationStyle, SignalProspect } from "@/lib/supabase/types"
import { getSignalPlaybook } from "./playbooks"
import type { SignalWebsiteScan } from "./website"

export const SIGNAL_CONVERSATION_STYLE_LABELS: Record<SignalConversationStyle, string> = {
  friendly_local: "Friendly local",
  traditional_owner_operator: "Traditional owner-operator",
  modern_casual_brand: "Modern casual brand",
  formal_business: "Formal business",
  clinical_professional: "Clinical professional",
  concise_busy_owner: "Concise busy owner",
}

function textPool(prospect: SignalProspect, scan: SignalWebsiteScan | null) {
  return [
    prospect.business_name,
    prospect.industry,
    prospect.locality_relationship,
    prospect.human_notes,
    prospect.what_looks_good,
    prospect.visible_problem,
    scan?.page_title,
    scan?.meta_description,
    ...(scan?.headings || []),
    ...(scan?.service_language || []),
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase()
}

function includesAny(value: string, words: string[]) {
  return words.some((word) => value.includes(word))
}

export function summarizeSignalBrandVoice(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
) {
  const pool = textPool(prospect, scan)

  if (prospect.compliance_tier === "compliance_gated") {
    return "Public tone should stay professional and compliance-aware."
  }

  if (
    includesAny(pool, [
      "modern",
      "premium",
      "luxury",
      "style",
      "fresh",
      "vibe",
      "creative",
      "studio",
    ])
  ) {
    return "Public wording appears polished or brand-forward."
  }

  if (
    includesAny(pool, [
      "family",
      "locally owned",
      "owner operated",
      "trusted",
      "honest",
      "serving",
    ])
  ) {
    return "Public wording emphasizes local trust and practical service."
  }

  if (includesAny(pool, ["emergency", "estimate", "quote", "service area", "repair"])) {
    return "Public wording appears service-driven and practical."
  }

  return "Public brand voice is limited; keep the conversation simple and evidence-based."
}

export function suggestSignalConversationStyle(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
): {
  style: SignalConversationStyle
  reason: string
} {
  const playbook = getSignalPlaybook(prospect.industry_playbook)
  const pool = textPool(prospect, scan)

  if (prospect.compliance_tier === "compliance_gated" || playbook.key === "medical_dental") {
    return {
      style: "clinical_professional",
      reason:
        "Medical or dental context requires a professional tone and public-site-only framing.",
    }
  }

  if (["hvac", "roofing_contractors_home_services"].includes(playbook.key)) {
    return {
      style: "concise_busy_owner",
      reason:
        "Home-service prospects usually benefit from a direct, operationally useful opener.",
    }
  }

  if (
    includesAny(pool, [
      "modern",
      "style",
      "fresh",
      "vibe",
      "premium",
      "luxury",
      "studio",
      "barber",
      "salon",
    ])
  ) {
    return {
      style: "modern_casual_brand",
      reason:
        "The public business language appears brand-forward, so scripts can stay polished and casual.",
    }
  }

  if (
    includesAny(pool, ["family", "owner", "locally", "local", "trusted", "serving"]) ||
    includesAny(prospect.locality_relationship?.toLowerCase() || "", [
      "keller",
      "roanoke",
      "visited",
      "customer",
      "family",
      "referral",
      "local",
    ])
  ) {
    return {
      style: "traditional_owner_operator",
      reason:
        "Entered context or public language points to a local, trust-based business conversation.",
    }
  }

  if (playbook.key === "auto_detailing" || playbook.key === "general_local_business") {
    return {
      style: "friendly_local",
      reason:
        "The prospect looks local and practical, so a warm direct tone is the safest starting point.",
    }
  }

  return {
    style: "formal_business",
    reason:
      "Public evidence is limited or formal, so the safest script style is concise and professional.",
  }
}

export function buildPublicCustomerPositioning(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
) {
  const location = [prospect.city, prospect.state].filter(Boolean).join(", ")
  const services = scan?.service_language?.slice(0, 3) || []
  const playbook = getSignalPlaybook(prospect.industry_playbook)

  if (services.length > 0 && location) {
    return `Markets ${services.join(", ")} to customers around ${location} based on official public site language.`
  }

  if (services.length > 0) {
    return `Markets ${services.join(", ")} based on official public site language.`
  }

  if (location) {
    return `Markets ${playbook.name.toLowerCase()} services around ${location} based on entered business context.`
  }

  return `Markets ${playbook.name.toLowerCase()} services based on entered business context; public positioning needs more evidence.`
}
