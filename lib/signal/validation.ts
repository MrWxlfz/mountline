import { z } from "zod"
import type {
  SignalCommercialFit,
  SignalConfidence,
  SignalConversationStyle,
  SignalLocalityScope,
  SignalOutreachMode,
  SignalPriority,
  SignalRelationshipType,
  SignalRelevantDemo,
  SignalOutreachHistory,
  SignalSuggestedChannel,
} from "@/lib/supabase/types"
import {
  getComplianceTierForPlaybook,
  getSignalPlaybook,
  inferSignalPlaybook,
  type SignalPlaybookKey,
} from "./playbooks"

export const signalPlaybookSchema = z.enum([
  "auto_detailing",
  "barber_salon",
  "hvac",
  "roofing_contractors_home_services",
  "medical_dental",
  "general_local_business",
])

export const signalOutreachModeSchema = z.enum([
  "local_student",
  "professional_studio",
  "warm_connection",
])

export const signalLocalityScopeSchema = z.enum([
  "keller_local",
  "dfw_nearby",
  "remote",
  "unknown",
])

export const signalRelationshipTypeSchema = z.enum([
  "none",
  "personally_visited",
  "knows_owner",
  "family_referral",
  "customer",
  "referred",
])

export const signalOutreachHistorySchema = z.enum([
  "never_contacted",
  "emailed",
  "called",
  "dm_attempted",
  "awaiting_reply",
  "follow_up_due",
])

export const signalConversationStyleSchema = z.enum([
  "friendly_local",
  "traditional_owner_operator",
  "modern_casual_brand",
  "formal_business",
  "clinical_professional",
  "concise_busy_owner",
])

export const signalOutreachStatusSchema = z.enum([
  "researched",
  "needs_review",
  "ready_to_contact",
  "contacted",
  "awaiting_reply",
  "permission_to_send_demo",
  "demo_sent",
  "interested",
  "discovery_call",
  "proposal_sent",
  "won",
  "lost",
  "no_response",
  "do_not_contact",
])

export const signalRelevantDemoSchema = z.enum([
  "auto-detailing",
  "barber-shop",
  "none",
])

export const signalSuggestedChannelSchema = z.enum([
  "call",
  "email",
  "instagram",
  "contact_form",
  "warm_intro",
  "research_more",
])

const scoreSchema = z.coerce.number().int().min(0).max(100)
const nullableText = z.string().trim().max(3000).optional().nullable()
const shortNullableText = z.string().trim().max(300).optional().nullable()

export function blankToNull(value: unknown) {
  return typeof value === "string" && value.trim() === "" ? null : value
}

export function cleanOptionalText(value: unknown) {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function normalizeEmail(value: unknown) {
  const email = cleanOptionalText(value)
  return email ? email.toLowerCase() : null
}

export const signalProspectCreateSchema = z.object({
  business_name: z.string().trim().min(1, "Business name is required").max(180),
  contact_name: shortNullableText,
  industry: z.string().trim().min(1, "Industry is required").max(140),
  industry_playbook: signalPlaybookSchema.optional().nullable(),
  city: shortNullableText,
  state: z.string().trim().max(60).optional().nullable(),
  locality_relationship: shortNullableText,
  website_url: z.string().trim().max(500).optional().nullable(),
  public_email: z.string().trim().email("Use a valid public email").max(240).optional().or(z.literal("")).nullable(),
  public_phone: z.string().trim().max(80).optional().nullable(),
  public_contact_form_url: z.string().trim().max(500).optional().nullable(),
  instagram_url: z.string().trim().max(500).optional().nullable(),
  source: z.enum(["manual", "csv_import", "referral", "public_web_research"]).optional(),
  existing_website_platform: shortNullableText,
  existing_booking_platform: shortNullableText,
  human_notes: nullableText,
  what_looks_good: nullableText,
  visible_problem: nullableText,
  relevant_demo: signalRelevantDemoSchema.optional().nullable(),
  outreach_mode: signalOutreachModeSchema.optional(),
  locality_scope: signalLocalityScopeSchema.optional().nullable(),
  relationship_type: signalRelationshipTypeSchema.optional(),
  outreach_history: signalOutreachHistorySchema.optional(),
  conversation_style: signalConversationStyleSchema.optional(),
  conversation_style_reason: shortNullableText,
  outreach_status: signalOutreachStatusSchema.optional(),
  follow_up_date: z.string().trim().max(20).optional().nullable(),
  assigned_to: shortNullableText,
})

export const signalProspectPatchSchema = signalProspectCreateSchema
  .partial()
  .extend({
    outreach_status: signalOutreachStatusSchema.optional(),
    contacted_at: z.string().datetime().optional().nullable(),
  })

export const signalImportSchema = z.object({
  prospects: z.array(signalProspectCreateSchema).min(1).max(100),
})

export const signalStatusSchema = z.object({
  outreach_status: signalOutreachStatusSchema,
})

export const signalFollowUpSchema = z.object({
  follow_up_date: z.string().trim().max(20).nullable(),
})

export const signalSuppressionSchema = z.object({
  reason: z.string().trim().max(600).optional().nullable(),
})

const valueBandSchema = z.enum([
  "$500-$1,250",
  "$1,250-$3,500",
  "$3,500-$10,000+",
  "unknown",
])

export const signalInitialAnalysisSchema = z.object({
  website_quality_score: scoreSchema,
  business_viability_score: scoreSchema,
  operational_opportunity_score: scoreSchema,
  website_service_fit_score: scoreSchema,
  ai_workflow_fit_score: scoreSchema,
  reachability_score: scoreSchema,
  compliance_risk_score: scoreSchema,
  overall_opportunity_score: scoreSchema,
  priority: z.enum(["A", "B", "C", "skip"]),
  commercial_fit: z.enum(["unknown", "starter", "business", "systems", "high_value"]),
  potential_project_value_band: valueBandSchema,
  potential_project_value_reason: z.string().trim().min(1).max(1000),
  recommended_primary_offer: z.string().trim().min(1).max(500),
  recommended_secondary_offer: z.string().trim().min(1).max(500),
  recommended_demo: signalRelevantDemoSchema,
  suggested_channel: signalSuggestedChannelSchema,
  suggested_outreach_mode: signalOutreachModeSchema,
  executive_summary: z.string().trim().min(1).max(1200),
  reasons_to_contact: z.array(z.string().trim().min(1).max(260)).max(8),
  red_flags: z.array(z.string().trim().min(1).max(260)).max(8),
  compliance_warning: z.string().trim().max(1200).nullable(),
  confidence: z.enum(["low", "medium", "high"]),
})

export const signalOpportunityTypeSchema = z.enum([
  "website_redesign",
  "photo_gallery_or_portfolio",
  "service_or_pricing_clarity",
  "booking_or_quote_flow",
  "preserve_existing_booking_integration",
  "client_portal",
  "support_messaging",
  "payment_link_workflow",
  "missed_call_followup_discovery",
  "lead_organization",
  "estimate_request_routing",
  "appointment_routing_discovery",
  "faq_knowledge_base",
  "review_request_workflow_discovery",
  "internal_task_summary",
  "compliance_review_required",
  "no_recommended_offer",
])

export const signalDeepAnalysisSchema = z.object({
  what_looks_good: z.string().trim().min(1).max(1200),
  visible_problem: z.string().trim().min(1).max(1200),
  evidence_based_opportunities: z
    .array(
      z.object({
        opportunity_type: signalOpportunityTypeSchema,
        evidence: z.array(z.string().trim().min(1).max(260)).min(1).max(6),
        why_it_matters: z.string().trim().min(1).max(700),
        honest_offer_language: z.string().trim().min(1).max(700),
        do_not_promise: z.array(z.string().trim().min(1).max(220)).max(6),
      }),
    )
    .min(1)
    .max(6),
  recommended_primary_offer: z.string().trim().min(1).max(500),
  recommended_secondary_offer: z.string().trim().min(1).max(500),
  project_value_band: valueBandSchema,
  project_value_reason: z.string().trim().min(1).max(1000),
  suggested_channel: signalSuggestedChannelSchema,
  suggested_outreach_mode: signalOutreachModeSchema,
  first_contact_subject: z.string().trim().min(1).max(120),
  first_contact_email: z.string().trim().min(1).max(2400),
  permission_based_dm: z.string().trim().min(1).max(900),
  owner_call_opener: z.string().trim().min(1).max(900),
  gatekeeper_script: z.string().trim().min(1).max(900),
  voicemail_script: z.string().trim().min(1).max(700),
  demo_send_followup: z.string().trim().min(1).max(1200),
  discovery_call_questions: z.array(z.string().trim().min(1).max(240)).min(3).max(10),
  proposal_angle: z.string().trim().min(1).max(1000),
  red_flags: z.array(z.string().trim().min(1).max(260)).max(8),
  compliance_warning: z.string().trim().max(1200).nullable(),
  confidence: z.enum(["low", "medium", "high"]),
})

export type SignalInitialAnalysisOutput = z.infer<typeof signalInitialAnalysisSchema>
export type SignalDeepAnalysisOutput = z.infer<typeof signalDeepAnalysisSchema>

export const signalResearchResolveSchema = z.object({
  business_name: z.string().trim().min(1, "Business name is required").max(180),
  location: z.string().trim().min(1, "Location is required").max(160),
  industry_hint: shortNullableText,
  known_context: shortNullableText,
  initial_note: nullableText,
})

export const signalResearchConfirmSchema = z.object({
  research_run_id: z.string().uuid(),
  candidate_url: z.string().trim().url(),
  candidate_title: z.string().trim().max(300).optional().nullable(),
  merge_prospect_id: z.string().uuid().optional().nullable(),
})

export const signalScriptStudioSchema = z.object({
  conversation_style: signalConversationStyleSchema.optional(),
})

export const signalImportPreviewSchema = z.object({
  sheet_name: z.string().trim().max(180).optional().nullable(),
})

export const signalImportCommitSchema = z.object({
  batch_id: z.string().uuid(),
})

export const signalCallSessionCreateSchema = z.object({
  prospect_ids: z.array(z.string().uuid()).min(1).max(5),
})

export const signalCallOutcomeSchema = z.object({
  item_id: z.string().uuid(),
  outcome: z.enum([
    "no_answer",
    "voicemail_left",
    "permission_to_send_demo",
    "interested",
    "follow_up_later",
    "not_interested",
    "do_not_contact",
  ]),
  follow_up_date: z.string().trim().max(20).optional().nullable(),
  notes: z.string().trim().max(1200).optional().nullable(),
})

export function normalizeProspectInput(
  data: z.infer<typeof signalProspectCreateSchema>,
) {
  const deterministicPlaybook = inferSignalPlaybook(
    [
      data.industry,
      data.business_name,
      data.human_notes,
      data.what_looks_good,
      data.visible_problem,
    ]
      .filter(Boolean)
      .join(" "),
  )
  const industryPlaybook =
    deterministicPlaybook !== "general_local_business"
      ? deterministicPlaybook
      : data.industry_playbook || deterministicPlaybook
  const complianceTier = getComplianceTierForPlaybook(industryPlaybook)
  const playbook = getSignalPlaybook(industryPlaybook)

  return {
    business_name: data.business_name.trim(),
    contact_name: cleanOptionalText(data.contact_name),
    industry: data.industry.trim(),
    industry_playbook: industryPlaybook as SignalPlaybookKey,
    compliance_tier: complianceTier,
    city: cleanOptionalText(data.city),
    state: cleanOptionalText(data.state),
    locality_relationship: cleanOptionalText(data.locality_relationship),
    website_url: cleanOptionalText(data.website_url),
    public_email: normalizeEmail(data.public_email),
    public_phone: cleanOptionalText(data.public_phone),
    public_contact_form_url: cleanOptionalText(data.public_contact_form_url),
    instagram_url: cleanOptionalText(data.instagram_url),
    source: data.source || "manual",
    existing_website_platform: cleanOptionalText(data.existing_website_platform),
    existing_booking_platform: cleanOptionalText(data.existing_booking_platform),
    human_notes: cleanOptionalText(data.human_notes),
    what_looks_good: cleanOptionalText(data.what_looks_good),
    visible_problem: cleanOptionalText(data.visible_problem),
    relevant_demo:
      playbook.relevantDemo !== "none"
        ? playbook.relevantDemo
        : data.relevant_demo || null,
    outreach_mode: data.outreach_mode || "professional_studio",
    locality_scope: data.locality_scope || null,
    relationship_type: data.relationship_type || "none",
    outreach_history: data.outreach_history || "never_contacted",
    conversation_style: data.conversation_style || "friendly_local",
    conversation_style_reason: cleanOptionalText(data.conversation_style_reason),
    outreach_status: data.outreach_status || "researched",
    follow_up_date: cleanOptionalText(data.follow_up_date),
    assigned_to: cleanOptionalText(data.assigned_to),
  }
}

export function forceComplianceForIndustry(
  industry: string,
  playbook: string | null | undefined,
) {
  const inferred = playbook || inferSignalPlaybook(industry)
  return {
    industry_playbook: inferred,
    compliance_tier: getComplianceTierForPlaybook(inferred),
  }
}

export function coercePriority(score: number): SignalPriority {
  if (score >= 85) return "A"
  if (score >= 70) return "B"
  if (score >= 50) return "C"
  return "skip"
}

export function coerceConfidence(
  evidenceCount: number,
  hasWebsiteScan: boolean,
): SignalConfidence {
  if (hasWebsiteScan && evidenceCount >= 5) return "high"
  if (hasWebsiteScan || evidenceCount >= 3) return "medium"
  return "low"
}

export function coerceCommercialFit(score: number): SignalCommercialFit {
  if (score >= 90) return "high_value"
  if (score >= 80) return "systems"
  if (score >= 65) return "business"
  if (score >= 45) return "starter"
  return "unknown"
}

export function coerceChannel(
  value: string | null | undefined,
): SignalSuggestedChannel {
  const parsed = signalSuggestedChannelSchema.safeParse(value)
  return parsed.success ? parsed.data : "research_more"
}

export function coerceOutreachMode(
  value: string | null | undefined,
): SignalOutreachMode {
  const parsed = signalOutreachModeSchema.safeParse(value)
  return parsed.success ? parsed.data : "professional_studio"
}

export function coerceConversationStyle(
  value: string | null | undefined,
): SignalConversationStyle {
  const parsed = signalConversationStyleSchema.safeParse(value)
  return parsed.success ? parsed.data : "friendly_local"
}

export function coerceLocalityScope(
  value: string | null | undefined,
): SignalLocalityScope {
  const parsed = signalLocalityScopeSchema.safeParse(value)
  return parsed.success ? parsed.data : "unknown"
}

export function coerceRelationshipType(
  value: string | null | undefined,
): SignalRelationshipType {
  const parsed = signalRelationshipTypeSchema.safeParse(value)
  return parsed.success ? parsed.data : "none"
}

export function coerceOutreachHistory(
  value: string | null | undefined,
): SignalOutreachHistory {
  const parsed = signalOutreachHistorySchema.safeParse(value)
  return parsed.success ? parsed.data : "never_contacted"
}
