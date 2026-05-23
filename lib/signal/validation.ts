import { z } from "zod"
import type {
  SignalCommercialFit,
  SignalConfidence,
  SignalOutreachMode,
  SignalPriority,
  SignalRelevantDemo,
  SignalSuggestedChannel,
} from "@/lib/supabase/types"
import {
  getComplianceTierForPlaybook,
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
  "booking_or_quote_flow",
  "client_portal",
  "support_messaging",
  "payment_link_workflow",
  "missed_call_followup",
  "lead_organization",
  "email_followup_drafts",
  "appointment_routing",
  "faq_knowledge_base",
  "review_request_workflow",
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

export function normalizeProspectInput(
  data: z.infer<typeof signalProspectCreateSchema>,
) {
  const industryPlaybook =
    data.industry_playbook || inferSignalPlaybook(data.industry)
  const complianceTier = getComplianceTierForPlaybook(industryPlaybook)

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
    relevant_demo: data.relevant_demo || null,
    outreach_mode: data.outreach_mode || "professional_studio",
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
