import { z } from "zod"
import type {
  SignalCommercialFit,
  SignalConfidence,
  SignalConversationStyle,
  SignalCommunicationProfile,
  SignalContactReadiness,
  SignalLocalityScope,
  SignalOutreachEventChannel,
  SignalOutreachEventType,
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
  "dry_cleaner_laundry",
  "pet_grooming",
  "bakery_donut",
  "spa_wellness",
  "hvac",
  "roofing_contractors_home_services",
  "medical_dental",
  "restaurant_food",
  "beauty_wellness",
  "general_local_business",
  "unknown_needs_review",
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

export const signalCommunicationProfileSchema = z.enum([
  "plainspoken_owner_operator",
  "friendly_local",
  "modern_casual_brand",
  "busy_operations_manager",
  "formal_business",
  "clinical_professional",
  "warm_existing_connection",
])

export const signalContactReadinessSchema = z.enum([
  "verified_email_available",
  "verified_phone_available",
  "verified_contact_form_available",
  "verified_social_contact_available",
  "contact_missing",
  "contact_history_only",
  "suppressed",
])

export const signalOutreachEventChannelSchema = z.enum([
  "email",
  "call",
  "voicemail",
  "instagram",
  "contact_form",
  "text",
  "in_person",
  "other",
])

export const signalOutreachEventTypeSchema = z.enum([
  "attempted",
  "delivered",
  "blocked",
  "replied",
  "voicemail_left",
  "permission_to_send_demo",
  "demo_sent",
  "follow_up_sent",
  "discovery_call_booked",
  "interested",
  "declined",
  "do_not_contact",
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

export const signalScreenshotTypeSchema = z.enum(["desktop", "mobile"])

export const signalVerifiedObservationCategorySchema = z.enum([
  "site_design",
  "services",
  "booking",
  "gallery",
  "public_contact",
  "reputation",
  "platform",
  "business_context",
])

export const signalVerifiedObservationSourceSchema = z.enum([
  "manual_public_site_review",
  "official_public_site",
  "existing_conversation",
  "personal_relationship",
])

export const signalSuggestedChannelSchema = z.enum([
  "call",
  "email",
  "instagram",
  "contact_form",
  "warm_intro",
  "research_more",
])

export const signalCampaignStatusSchema = z.enum([
  "draft",
  "discovering",
  "review_candidates",
  "researching",
  "ready",
  "paused",
  "complete",
  "failed",
])

export const signalMarketStatusSchema = z.enum([
  "draft",
  "discovering",
  "deduplicating",
  "researching",
  "scoring",
  "ready_for_review",
  "paused",
  "completed",
  "failed",
])

export const signalMarketResearchDepthSchema = z.enum(["quick", "balanced", "deep"])

export const signalResearchProviderModeSchema = z.enum([
  "tavily",
  "firecrawl",
  "hybrid",
  "disabled",
])

export const signalMarketCandidateResearchStateSchema = z.enum([
  "discovered",
  "suppressed",
  "duplicate",
  "needs_confirmation",
  "official_site_resolved",
  "researching",
  "quick_scored",
  "visual_shortlisted",
  "approved",
  "imported_to_signal",
  "rejected",
  "failed",
])

export const signalCampaignCandidateStatusSchema = z.enum([
  "pending_review",
  "approved",
  "rejected",
  "duplicate",
  "needs_confirmation",
  "imported_to_signal",
  "research_failed",
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
  facebook_url: z.string().trim().max(500).optional().nullable(),
  public_address: z.string().trim().max(500).optional().nullable(),
  chain_status: z.enum(["independent", "likely_independent", "local_multi_location", "likely_franchise", "chain", "uncertain"]).optional(),
  business_location_type: z.enum(["storefront", "service_area", "hybrid", "unknown"]).optional(),
  source: z.enum(["manual", "csv_import", "referral", "public_web_research", "scout_suggestion"]).optional(),
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
  known_communication_context: nullableText,
  public_brand_tone: shortNullableText,
  suggested_communication_profile: signalCommunicationProfileSchema.optional().nullable(),
  communication_profile_reason: shortNullableText,
  communication_profile_confirmed: z.boolean().optional(),
  script_guidance: nullableText,
  classification_manual_override: z.boolean().optional(),
  contact_readiness: signalContactReadinessSchema.optional(),
  contact_readiness_reason: shortNullableText,
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

export const signalBusinessAnalysisRequestSchema = z.object({
  business_input: z
    .string()
    .trim()
    .min(3, "Add a business name, public URL, or phone number.")
    .max(2000, "Keep the analysis input under 2,000 characters."),
  observation: z.string().trim().max(3000).optional().nullable(),
  analyze_now: z.boolean().optional().default(true),
  parsed_overrides: z.object({
    business_name: z.string().trim().max(180).optional().nullable(),
    address: z.string().trim().max(500).optional().nullable(),
    phone: z.string().trim().max(80).optional().nullable(),
    website_url: z.string().trim().url().max(1000).optional().nullable(),
  }).optional(),
})

export const signalReanalysisScopeSchema = z.object({
  scope: z.enum(["full", "identity", "website", "social", "opportunity", "sales"]).optional().default("full"),
})

export const signalIdentityCorrectionSchema = z.object({
  business_name: z.string().trim().min(2).max(180).optional(),
  canonical_name: z.string().trim().min(2).max(180).optional(),
  public_address: z.string().trim().max(500).optional().nullable(),
  public_phone: z.string().trim().max(80).optional().nullable(),
  industry: z.string().trim().max(160).optional().nullable(),
  website_url: z.string().trim().url().max(1000).optional().nullable(),
  facebook_url: z.string().trim().url().max(1000).optional().nullable(),
  instagram_url: z.string().trim().url().max(1000).optional().nullable(),
  maps_url: z.string().trim().url().max(1000).optional().nullable(),
  city: z.string().trim().max(120).optional().nullable(),
  state: z.string().trim().max(60).optional().nullable(),
  chain_status: z.enum(["independent", "likely_independent", "local_multi_location", "likely_franchise", "chain", "uncertain"]).optional(),
  business_location_type: z.enum(["storefront", "service_area", "hybrid", "unknown"]).optional(),
  verification_source: z.enum(["personally_verified", "provided_by_business", "official_website", "official_social", "places_listing", "other"]),
  note: z.string().trim().max(1000).optional().nullable(),
})

export const signalPipelineUpdateSchema = z.object({
  pipeline_stage: z.enum([
    "found",
    "analyzed",
    "concept_ready",
    "contacted",
    "interested",
    "proposal",
    "won",
    "lost",
  ]),
  reason: z.string().trim().max(500).optional().nullable(),
  next_action: z.string().trim().max(1000).optional().nullable(),
  next_action_due_at: z.string().datetime().optional().nullable(),
})

export const signalConceptUpdateSchema = z.object({
  status: z.enum(["prompt_ready", "in_progress", "ready", "archived"]),
  concept_url: z.string().trim().url().max(1000).optional().nullable(),
  screenshot_url: z.string().trim().url().max(1000).optional().nullable(),
  notes: z.string().trim().max(3000).optional().nullable(),
})

export const signalConceptCreateSchema = z.object({
  instructions: z.string().trim().max(1000).optional().nullable(),
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
  communication_profile: signalCommunicationProfileSchema.optional(),
  guidance: nullableText,
})

export const signalOutreachEventCreateSchema = z.object({
  channel: signalOutreachEventChannelSchema,
  direction: z.enum(["outbound", "inbound"]).optional(),
  event_type: signalOutreachEventTypeSchema,
  event_date: z.string().trim().max(20).optional().nullable(),
  summary: z.string().trim().max(1200).optional().nullable(),
  follow_up_date: z.string().trim().max(20).optional().nullable(),
  created_by: shortNullableText,
  contact_value: z.string().trim().max(500).optional().nullable(),
})

export const signalFeedbackCreateSchema = z.object({
  analysis_id: z.string().uuid().optional().nullable(),
  feedback_type: z.string().trim().min(1).max(80),
  original_value: z.string().trim().max(500).optional().nullable(),
  corrected_value: z.string().trim().max(500).optional().nullable(),
  note: z.string().trim().max(1200).optional().nullable(),
})

export const signalVerifiedObservationCreateSchema = z.object({
  category: signalVerifiedObservationCategorySchema,
  source: signalVerifiedObservationSourceSchema,
  note: z.string().trim().min(1).max(1200),
  url: z.string().trim().url().max(500).optional().or(z.literal("")).nullable(),
})

export const signalVisualAnalysisSchema = z.object({
  visual_quality_score: scoreSchema,
  hero_clarity_score: scoreSchema,
  cta_visibility_score: scoreSchema,
  service_clarity_score: scoreSchema,
  gallery_or_proof_score: scoreSchema.nullable(),
  mobile_readability_score: scoreSchema.nullable(),
  what_looks_good: z.array(z.string().trim().min(1).max(180)).max(8),
  visible_improvement_opportunities: z.array(z.string().trim().min(1).max(220)).max(8),
  evidence_grounded_summary: z.string().trim().min(1).max(900),
  confidence: z.enum(["low", "medium", "high"]),
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

export const signalCampaignCreateSchema = z.object({
  name: z.string().trim().min(1, "Campaign name is required").max(180),
  target_city: z.string().trim().min(1, "City is required").max(120),
  target_state: z.string().trim().max(60).optional().nullable(),
  target_radius_miles: z.coerce.number().int().min(1).max(100).optional().nullable(),
  selected_playbooks: z.array(signalPlaybookSchema).min(1, "Choose at least one vertical").max(6),
  max_candidates: z.coerce.number().int().min(1).max(50).optional(),
  notes: nullableText,
})

export const signalCampaignPatchSchema = z.object({
  name: z.string().trim().min(1).max(180).optional(),
  target_city: z.string().trim().min(1).max(120).optional(),
  target_state: z.string().trim().max(60).optional().nullable(),
  target_radius_miles: z.coerce.number().int().min(1).max(100).optional().nullable(),
  selected_playbooks: z.array(signalPlaybookSchema).min(1).max(6).optional(),
  max_candidates: z.coerce.number().int().min(1).max(50).optional(),
  status: signalCampaignStatusSchema.optional(),
  notes: nullableText,
  next_action: shortNullableText,
})

export const signalCampaignCandidatePatchSchema = z.object({
  candidate_status: signalCampaignCandidateStatusSchema.optional(),
  likely_official_url: z.string().trim().url().max(500).optional().nullable(),
  duplicate_prospect_id: z.string().uuid().optional().nullable(),
  classified_playbook: signalPlaybookSchema.optional().nullable(),
  reason: nullableText,
})

export const signalMarketCreateSchema = z.object({
  name: z.string().trim().min(1, "Market name is required").max(180),
  city: z.string().trim().min(1, "City is required").max(120),
  state: z.string().trim().max(60).optional().nullable(),
  radius_miles: z.coerce.number().int().min(1).max(100).optional().nullable(),
  industries: z.array(signalPlaybookSchema).min(1, "Choose at least one industry").max(8),
  max_candidates: z.coerce.number().int().min(1).max(50).optional(),
  research_depth: signalMarketResearchDepthSchema.optional(),
  notes: nullableText,
})

export const signalMarketPatchSchema = z.object({
  name: z.string().trim().min(1).max(180).optional(),
  city: z.string().trim().min(1).max(120).optional(),
  state: z.string().trim().max(60).optional().nullable(),
  radius_miles: z.coerce.number().int().min(1).max(100).optional().nullable(),
  industries: z.array(signalPlaybookSchema).min(1).max(8).optional(),
  max_candidates: z.coerce.number().int().min(1).max(50).optional(),
  research_depth: signalMarketResearchDepthSchema.optional(),
  status: signalMarketStatusSchema.optional(),
  notes: nullableText,
  next_action: shortNullableText,
})

export const signalMarketCandidatePatchSchema = z.object({
  canonical_business_name: z.string().trim().min(1).max(180).optional().nullable(),
  confirmed_official_url: z.string().trim().url().max(500).optional().nullable(),
  likely_official_url: z.string().trim().url().max(500).optional().nullable(),
  duplicate_prospect_id: z.string().uuid().optional().nullable(),
  duplicate_state: z.enum(["none", "exact", "likely", "possible"]).optional().nullable(),
  category: signalPlaybookSchema.optional().nullable(),
  research_state: signalMarketCandidateResearchStateSchema.optional(),
  suppression_state: z.enum(["clear", "suppressed", "market_rejected", "restored"]).optional().nullable(),
  reason: nullableText,
})

export const signalMarketCandidateApproveSchema = z.object({
  add_to_focus: z.boolean().optional(),
  merge_prospect_id: z.string().uuid().optional().nullable(),
})

export const signalScriptFeedbackCreateSchema = z.object({
  prospect_id: z.string().uuid().optional().nullable(),
  draft_id: z.string().uuid().optional().nullable(),
  script_type: z.string().trim().max(80).optional().nullable(),
  feedback_type: z.string().trim().min(1).max(80),
  rating: z.coerce.number().int().min(1).max(5).optional().nullable(),
  original_text: z.string().trim().max(5000).optional().nullable(),
  edited_text: z.string().trim().max(5000).optional().nullable(),
  note: z.string().trim().max(1200).optional().nullable(),
  reusable_lesson: z.string().trim().max(1200).optional().nullable(),
})

export const signalFocusItemCreateSchema = z.object({
  prospect_id: z.string().uuid(),
  campaign_id: z.string().uuid().optional().nullable(),
  market_id: z.string().uuid().optional().nullable(),
  focus_reason: z.string().trim().max(800).optional().nullable(),
  recommended_action: z.string().trim().max(800).optional().nullable(),
  due_date: z.string().trim().max(20).optional().nullable(),
})

export const signalFocusOutcomeSchema = z.object({
  prospect_id: z.string().uuid(),
  focus_item_id: z.string().uuid().optional().nullable(),
  outcome: z.enum([
    "no_answer",
    "voicemail_left",
    "permission_to_send_demo",
    "demo_sent",
    "follow_up_later",
    "interested",
    "not_interested",
    "do_not_contact",
    "needs_more_research",
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
    known_communication_context: cleanOptionalText(data.known_communication_context),
    public_brand_tone: cleanOptionalText(data.public_brand_tone),
    suggested_communication_profile: data.suggested_communication_profile || null,
    communication_profile_reason: cleanOptionalText(data.communication_profile_reason),
    communication_profile_confirmed: data.communication_profile_confirmed || false,
    script_guidance: cleanOptionalText(data.script_guidance),
    classification_manual_override: data.classification_manual_override || false,
    contact_readiness: data.contact_readiness || "contact_missing",
    contact_readiness_reason: cleanOptionalText(data.contact_readiness_reason),
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

export function coerceCommunicationProfile(
  value: string | null | undefined,
): SignalCommunicationProfile {
  const parsed = signalCommunicationProfileSchema.safeParse(value)
  return parsed.success ? parsed.data : "friendly_local"
}

export function coerceContactReadiness(
  value: string | null | undefined,
): SignalContactReadiness {
  const parsed = signalContactReadinessSchema.safeParse(value)
  return parsed.success ? parsed.data : "contact_missing"
}

export function coerceOutreachEventChannel(
  value: string | null | undefined,
): SignalOutreachEventChannel {
  const parsed = signalOutreachEventChannelSchema.safeParse(value)
  return parsed.success ? parsed.data : "other"
}

export function coerceOutreachEventType(
  value: string | null | undefined,
): SignalOutreachEventType {
  const parsed = signalOutreachEventTypeSchema.safeParse(value)
  return parsed.success ? parsed.data : "attempted"
}
