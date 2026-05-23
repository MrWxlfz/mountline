import "server-only"

import type {
  SignalCommunicationProfile,
  SignalConversationStyle,
  SignalProspect,
  SignalRelationshipType,
} from "@/lib/supabase/types"
import { getSignalPlaybook } from "./playbooks"
import type { SignalWebsiteScan } from "./website"

export const SIGNAL_COMMUNICATION_PROFILE_LABELS: Record<SignalCommunicationProfile, string> = {
  plainspoken_owner_operator: "Plainspoken owner-operator",
  friendly_local: "Friendly local business",
  modern_casual_brand: "Modern casual brand",
  busy_operations_manager: "Busy operations manager",
  formal_business: "Formal business",
  clinical_professional: "Clinical professional",
  warm_existing_connection: "Warm existing connection",
}

function text(...values: Array<string | null | undefined>) {
  return values.filter(Boolean).join(" ").toLowerCase()
}

function includesAny(value: string, words: string[]) {
  return words.some((word) => value.includes(word))
}

export function profileToConversationStyle(profile: SignalCommunicationProfile): SignalConversationStyle {
  if (profile === "plainspoken_owner_operator") return "traditional_owner_operator"
  if (profile === "busy_operations_manager") return "concise_busy_owner"
  if (profile === "warm_existing_connection") return "friendly_local"
  return profile
}

export function hasRelationshipContext(relationship: SignalRelationshipType | null | undefined) {
  return Boolean(relationship && relationship !== "none")
}

export function suggestCommunicationProfile(
  prospect: SignalProspect,
  scan: SignalWebsiteScan | null,
): {
  profile: SignalCommunicationProfile
  reason: string
  publicBrandTone: string
} {
  const playbook = getSignalPlaybook(prospect.industry_playbook)
  const guidance = text(
    prospect.known_communication_context,
    prospect.script_guidance,
    prospect.locality_relationship,
    prospect.human_notes,
  )
  const publicTonePool = text(
    prospect.public_brand_tone,
    scan?.page_title,
    scan?.meta_description,
    ...(scan?.headings || []),
    ...(scan?.service_language || []),
  )

  if (prospect.communication_profile_confirmed && prospect.suggested_communication_profile) {
    return {
      profile: prospect.suggested_communication_profile,
      reason: prospect.communication_profile_reason || "Profile manually confirmed by Mountline.",
      publicBrandTone: prospect.public_brand_tone || "Manual profile confirmation is being used.",
    }
  }

  if (prospect.compliance_tier === "compliance_gated" || playbook.key === "medical_dental") {
    return {
      profile: "clinical_professional",
      reason: "Medical/dental prospects require formal, administrative, compliance-aware wording.",
      publicBrandTone: "Clinical or regulated public-service context.",
    }
  }

  if (hasRelationshipContext(prospect.relationship_type)) {
    return {
      profile: "warm_existing_connection",
      reason: "A real relationship context is recorded, so scripts can naturally acknowledge that connection.",
      publicBrandTone: prospect.public_brand_tone || "Relationship context is stronger than public brand tone.",
    }
  }

  if (
    includesAny(guidance, ["older", "simple", "plain", "phone", "slow", "friendly owner"]) ||
    includesAny(publicTonePool, ["family", "owner", "locally owned", "trusted", "serving"])
  ) {
    return {
      profile: "plainspoken_owner_operator",
      reason:
        "Manual context or public wording points to a direct small-business conversation. Use simple, patient language and avoid tech jargon.",
      publicBrandTone: "Trust-based local business tone.",
    }
  }

  if (
    includesAny(guidance, ["younger", "upbeat", "casual", "stylish", "modern", "active online"]) ||
    includesAny(publicTonePool, ["modern", "fresh", "style", "luxury", "premium", "studio", "brand"])
  ) {
    return {
      profile: "modern_casual_brand",
      reason:
        "Official/public brand language or private guidance points to a polished, casual brand. Keep scripts short and confident without forced slang.",
      publicBrandTone: "Brand-forward or modern public presentation.",
    }
  }

  if (["hvac", "roofing_contractors_home_services"].includes(playbook.key)) {
    return {
      profile: "busy_operations_manager",
      reason:
        "Home-service prospects usually need a brief, practical conversation around calls, estimates, scheduling, or lead flow.",
      publicBrandTone: "Service-driven operational business.",
    }
  }

  if (playbook.key === "barber_salon") {
    return {
      profile: "modern_casual_brand",
      reason:
        "Barber/salon prospects often benefit from a visual, brand-aware site conversation unless the team confirms a more formal decision-maker.",
      publicBrandTone: "Visual service business; public tone should guide how casual to be.",
    }
  }

  if (prospect.locality_scope === "keller_local" || prospect.locality_scope === "dfw_nearby") {
    return {
      profile: "friendly_local",
      reason: "Local context supports a warm, respectful opener without implying a personal relationship.",
      publicBrandTone: "Local business context.",
    }
  }

  return {
    profile: "formal_business",
    reason: "Public brand tone is limited or formal, so concise professional wording is safest.",
    publicBrandTone: "Limited public tone; keep copy evidence-based.",
  }
}

