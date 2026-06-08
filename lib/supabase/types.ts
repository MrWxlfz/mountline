export type ProjectStatus =
  | "discovery"
  | "design"
  | "build"
  | "review"
  | "launch"
  | "support"
  | "completed"

export type PaymentStatus =
  | "not_sent"
  | "pending"
  | "paid"
  | "waived"
  | "manual_received"

export type PaymentMethod =
  | "stripe_card"
  | "crypto"
  | "cash"
  | "check"
  | "bank_transfer"
  | "other"

export type Client = {
  id: string
  created_at: string
  business_name: string
  contact_name: string
  email: string
  phone: string | null
  website: string | null
  status: string
  notes: string | null
}

export type Project = {
  id: string
  created_at: string
  client_id: string | null
  project_name: string
  package_type: string | null
  status: ProjectStatus
  portal_id: string | null
  start_date: string | null
  target_launch_date: string | null
  live_url: string | null
  preview_url: string | null
  payment_link: string | null
  payment_status: PaymentStatus
  accepted_payment_methods: PaymentMethod[] | null
  manual_payment_instructions: string | null
  invoice_amount: number | null
  invoice_label: string | null
  next_step: string | null
  notes: string | null
}

export type ClientPortalAccess = {
  id: string
  created_at: string
  project_id: string
  client_email: string
  clerk_user_id: string | null
  access_status: string
}

export type SupportThread = {
  id: string
  created_at: string
  project_id: string
  status: string
}

export type SupportMessage = {
  id: string
  created_at: string
  thread_id: string
  project_id: string
  sender_type: "client" | "team" | "system"
  sender_email: string
  sender_name: string | null
  read_at: string | null
  message: string
}

export type ScoutOutreachStatus =
  | "not_contacted"
  | "reviewed"
  | "contacted"
  | "not_fit"
  | "lead_created"

export type ScoutProspect = {
  id: string
  created_at: string
  business_name: string
  industry: string | null
  city: string | null
  state: string | null
  website: string | null
  phone: string | null
  email: string | null
  google_rating: number | null
  google_review_count: number | null
  source: string
  website_score: number | null
  opportunity_score: number | null
  estimated_project_fit: string | null
  reasons: string[]
  website_notes: string | null
  ai_summary: string | null
  outreach_angle: string | null
  red_flags: string[]
  outreach_status: ScoutOutreachStatus
  last_checked_at: string | null
  notes: string | null
}

export type ScoutAlert = {
  id: string
  created_at: string
  prospect_id: string
  alert_type: string
  score: number
  payload: Record<string, unknown>
  delivery_channel: string
  status: string
  delivered_at: string | null
  delivery_error: string | null
}

export type SignalComplianceTier = "standard" | "sensitive" | "compliance_gated"

export type SignalSource =
  | "manual"
  | "csv_import"
  | "referral"
  | "public_web_research"

export type SignalRelevantDemo = "auto-detailing" | "barber-shop" | "none"

export type SignalOutreachMode =
  | "local_student"
  | "professional_studio"
  | "warm_connection"

export type SignalLocalityScope =
  | "keller_local"
  | "dfw_nearby"
  | "remote"
  | "unknown"

export type SignalRelationshipType =
  | "none"
  | "personally_visited"
  | "knows_owner"
  | "family_referral"
  | "customer"
  | "referred"

export type SignalOutreachHistory =
  | "never_contacted"
  | "emailed"
  | "called"
  | "dm_attempted"
  | "awaiting_reply"
  | "follow_up_due"

export type SignalConversationStyle =
  | "friendly_local"
  | "traditional_owner_operator"
  | "modern_casual_brand"
  | "formal_business"
  | "clinical_professional"
  | "concise_busy_owner"

export type SignalCommunicationProfile =
  | "plainspoken_owner_operator"
  | "friendly_local"
  | "modern_casual_brand"
  | "busy_operations_manager"
  | "formal_business"
  | "clinical_professional"
  | "warm_existing_connection"

export type SignalContactReadiness =
  | "verified_email_available"
  | "verified_phone_available"
  | "verified_contact_form_available"
  | "verified_social_contact_available"
  | "contact_missing"
  | "contact_history_only"
  | "suppressed"

export type SignalOutreachEventChannel =
  | "email"
  | "call"
  | "voicemail"
  | "instagram"
  | "contact_form"
  | "text"
  | "in_person"
  | "other"

export type SignalOutreachEventType =
  | "attempted"
  | "delivered"
  | "blocked"
  | "replied"
  | "voicemail_left"
  | "permission_to_send_demo"
  | "demo_sent"
  | "follow_up_sent"
  | "discovery_call_booked"
  | "interested"
  | "declined"
  | "do_not_contact"

export type SignalOutreachStatus =
  | "researched"
  | "needs_review"
  | "ready_to_contact"
  | "contacted"
  | "awaiting_reply"
  | "permission_to_send_demo"
  | "demo_sent"
  | "interested"
  | "discovery_call"
  | "proposal_sent"
  | "won"
  | "lost"
  | "no_response"
  | "do_not_contact"

export type SignalAnalysisType = "initial" | "deep_dive" | "regenerated"
export type SignalConfidence = "low" | "medium" | "high"
export type SignalPriority = "A" | "B" | "C" | "skip"
export type SignalCommercialFit =
  | "unknown"
  | "starter"
  | "business"
  | "systems"
  | "high_value"

export type SignalSuggestedChannel =
  | "call"
  | "email"
  | "instagram"
  | "contact_form"
  | "warm_intro"
  | "research_more"

export type SignalRecommendedLane =
  | "website_first"
  | "systems_discovery"
  | "do_not_pursue"
  | "compliance_gated"

export type SignalCampaignStatus =
  | "draft"
  | "discovering"
  | "review_candidates"
  | "researching"
  | "ready"
  | "paused"
  | "complete"
  | "failed"

export type SignalMarketStatus =
  | "draft"
  | "discovering"
  | "deduplicating"
  | "researching"
  | "scoring"
  | "ready_for_review"
  | "paused"
  | "completed"
  | "failed"

export type SignalMarketResearchDepth = "quick" | "balanced" | "deep"

export type SignalMarketEventStage =
  | "initializing"
  | "discovering"
  | "normalizing"
  | "suppressing"
  | "deduplicating"
  | "resolving_sites"
  | "scraping_sites"
  | "classifying"
  | "quick_scoring"
  | "screenshot_shortlist"
  | "visual_analysis"
  | "ranking"
  | "ready"
  | "failed"
  | "paused"

export type SignalResearchProviderMode =
  | "tavily"
  | "firecrawl"
  | "hybrid"
  | "disabled"

export type SignalScreenshotProviderMode =
  | "browserless"
  | "firecrawl"
  | "manual"
  | "disabled"

export type SignalAiProviderMode = "gemini" | "openai" | "disabled"

export type SignalMarketCandidateResearchState =
  | "discovered"
  | "suppressed"
  | "duplicate"
  | "needs_confirmation"
  | "official_site_resolved"
  | "researching"
  | "quick_scored"
  | "visual_shortlisted"
  | "approved"
  | "imported_to_signal"
  | "rejected"
  | "failed"

export type SignalMarketCandidateQuickScoreState =
  | "not_started"
  | "scored"
  | "ai_unavailable"
  | "failed"

export type SignalMarketCandidateSuppressionState =
  | "clear"
  | "suppressed"
  | "market_rejected"
  | "restored"

export type SignalCampaignCandidateStatus =
  | "pending_review"
  | "approved"
  | "rejected"
  | "duplicate"
  | "needs_confirmation"
  | "imported_to_signal"
  | "research_failed"

export type SignalFocusItemStatus = "pending" | "active" | "completed" | "archived"

export type SignalClassificationSource =
  | "manual_override"
  | "stored_alias"
  | "deterministic"
  | "ai"
  | "human_review"

export type SignalDuplicateConfidence = "exact" | "likely" | "possible"

export type SignalCandidateSuppressionType =
  | "rejected"
  | "do_not_contact"
  | "duplicate"
  | "irrelevant"
  | "bad_source"

export type SignalProspectAliasType =
  | "business_name"
  | "hostname"
  | "phone"
  | "email"

export type SignalScreenshotType = "desktop" | "mobile"

export type SignalVerifiedObservationCategory =
  | "site_design"
  | "services"
  | "booking"
  | "gallery"
  | "public_contact"
  | "reputation"
  | "platform"
  | "business_context"

export type SignalVerifiedObservationSource =
  | "manual_public_site_review"
  | "official_public_site"
  | "existing_conversation"
  | "personal_relationship"

export type SignalJson = string | number | boolean | null | SignalJson[] | {
  [key: string]: SignalJson
}

export type SignalProspect = {
  id: string
  created_at: string
  updated_at: string
  business_name: string
  contact_name: string | null
  industry: string
  industry_playbook: string | null
  compliance_tier: SignalComplianceTier
  city: string | null
  state: string | null
  locality_relationship: string | null
  website_url: string | null
  public_email: string | null
  public_phone: string | null
  public_contact_form_url: string | null
  instagram_url: string | null
  source: SignalSource
  existing_website_platform: string | null
  existing_booking_platform: string | null
  human_notes: string | null
  what_looks_good: string | null
  visible_problem: string | null
  relevant_demo: SignalRelevantDemo | null
  outreach_mode: SignalOutreachMode
  locality_scope: SignalLocalityScope | null
  relationship_type: SignalRelationshipType
  outreach_history: SignalOutreachHistory
  conversation_style: SignalConversationStyle
  conversation_style_reason: string | null
  known_communication_context: string | null
  public_brand_tone: string | null
  suggested_communication_profile: SignalCommunicationProfile | null
  communication_profile_reason: string | null
  communication_profile_confirmed: boolean
  script_guidance: string | null
  normalized_business_name: string | null
  normalized_hostname: string | null
  public_email_normalized: string | null
  public_phone_normalized: string | null
  classification_source: SignalClassificationSource | null
  classification_confidence: SignalConfidence | null
  classification_evidence: SignalJson | null
  classification_manual_override: boolean
  classified_at: string | null
  quick_score_updated_at: string | null
  contact_readiness: SignalContactReadiness
  contact_readiness_reason: string | null
  outreach_status: SignalOutreachStatus
  contacted_at: string | null
  follow_up_date: string | null
  assigned_to: string | null
  last_researched_at: string | null
}

export type SignalAnalysis = {
  id: string
  prospect_id: string
  created_at: string
  analysis_type: SignalAnalysisType
  model_provider: string | null
  model_name: string | null
  scanned_urls: SignalJson | null
  website_signals: SignalJson | null
  evidence: SignalJson | null
  confidence: SignalConfidence | null
  website_quality_score: number | null
  business_viability_score: number | null
  operational_opportunity_score: number | null
  website_service_fit_score: number | null
  ai_workflow_fit_score: number | null
  reachability_score: number | null
  compliance_risk_score: number | null
  overall_opportunity_score: number | null
  priority: SignalPriority | null
  commercial_fit: SignalCommercialFit | null
  potential_project_value_band: string | null
  potential_project_value_reason: string | null
  recommended_primary_offer: string | null
  recommended_secondary_offer: string | null
  recommended_demo: SignalRelevantDemo | null
  suggested_channel: SignalSuggestedChannel | null
  suggested_outreach_mode: SignalOutreachMode | null
  reasons_to_contact: SignalJson | null
  red_flags: SignalJson | null
  compliance_warning: string | null
  executive_summary: string | null
  research_provider: string | null
  research_query: string | null
  confirmed_official_url: string | null
  official_source_confidence: SignalConfidence | null
  public_customer_positioning: string | null
  brand_voice_summary: string | null
  suggested_conversation_style: SignalConversationStyle | null
  conversation_style_reason: string | null
  website_opportunity_score: number | null
  systems_opportunity_score: number | null
  recommended_lane: SignalRecommendedLane | null
  scan_coverage_confidence: SignalConfidence | null
  scan_coverage_note: string | null
  evidence_weighting: SignalJson | null
  recommended_next_action: string | null
  external_readiness: SignalJson | null
  contact_readiness: SignalContactReadiness | null
  communication_profile: SignalCommunicationProfile | null
  communication_profile_reason: string | null
  evidence_supporting_value_band: SignalJson | null
  discovery_confirmation_needed: SignalJson | null
}

export type SignalOutreachDraft = {
  id: string
  prospect_id: string
  analysis_id: string | null
  created_at: string
  outreach_mode: SignalOutreachMode
  first_contact_subject: string | null
  first_contact_email: string | null
  permission_based_dm: string | null
  owner_call_opener: string | null
  gatekeeper_script: string | null
  voicemail_script: string | null
  demo_send_followup: string | null
  discovery_call_questions: SignalJson | null
  proposal_angle: string | null
  conversation_style: SignalConversationStyle | null
  conversation_style_reason: string | null
  communication_profile: SignalCommunicationProfile | null
  communication_profile_reason: string | null
  script_studio: SignalJson | null
  follow_up_email: string | null
  objection_responses: SignalJson | null
  user_approved: boolean
  approved_at: string | null
}

export type SignalAlert = {
  id: string
  prospect_id: string
  analysis_id: string | null
  created_at: string
  alert_type: string
  title: string
  message: string
  read_at: string | null
  email_alert_sent_at: string | null
}

export type SignalSuppression = {
  id: string
  created_at: string
  email: string | null
  phone: string | null
  business_name: string | null
  reason: string | null
  source: string
}

export type SignalClassificationAlias = {
  id: string
  created_at: string
  normalized_business_name: string | null
  normalized_hostname: string | null
  city_normalized: string | null
  matched_term: string | null
  corrected_category: string
  corrected_playbook: string | null
  source: string
  note: string | null
  active: boolean
}

export type SignalCandidateSuppression = {
  id: string
  created_at: string
  normalized_business_name: string | null
  normalized_hostname: string | null
  phone_normalized: string | null
  public_email_normalized: string | null
  city_normalized: string | null
  suppression_type: SignalCandidateSuppressionType
  reason: string | null
  source_campaign_id: string | null
  source_market_id: string | null
  restored_at: string | null
  restored_by: string | null
}

export type SignalProspectAlias = {
  id: string
  prospect_id: string
  created_at: string
  alias_type: SignalProspectAliasType
  alias_value: string
  normalized_value: string
  source: string | null
  active: boolean
}

export type SignalOutreachEvent = {
  id: string
  prospect_id: string
  created_at: string
  event_date: string | null
  channel: SignalOutreachEventChannel
  direction: "outbound" | "inbound"
  event_type: SignalOutreachEventType
  summary: string | null
  follow_up_date: string | null
  created_by: string | null
}

export type SignalFeedback = {
  id: string
  prospect_id: string
  analysis_id: string | null
  created_at: string
  feedback_type: string
  original_value: string | null
  corrected_value: string | null
  note: string | null
}

export type SignalScriptFeedback = {
  id: string
  created_at: string
  prospect_id: string | null
  draft_id: string | null
  script_type: string | null
  feedback_type: string
  rating: number | null
  original_text: string | null
  edited_text: string | null
  note: string | null
  reusable_lesson: string | null
  active: boolean
  created_by: string | null
}

export type SignalPromptTemplate = {
  id: string
  created_at: string
  updated_at: string
  name: string
  prompt_type:
    | "quick_score"
    | "deep_analysis"
    | "category_classification"
    | "visual_analysis"
    | "first_call"
    | "gatekeeper"
    | "voicemail"
    | "follow_up"
    | "demo_send"
    | "objection_response"
    | "discovery_questions"
  version: number
  active: boolean
  content: string
  notes: string | null
  created_by: string | null
}

export type SignalVisualEvidence = {
  id: string
  prospect_id: string
  created_at: string
  screenshot_type: SignalScreenshotType
  storage_path: string | null
  mime_type: string | null
  file_size_bytes: number | null
  model_provider: string | null
  model_name: string | null
  analysis: SignalJson | null
  confidence: SignalConfidence | null
  analyzed_at: string | null
}

export type SignalVerifiedObservation = {
  id: string
  prospect_id: string
  created_at: string
  category: SignalVerifiedObservationCategory
  source: SignalVerifiedObservationSource
  note: string
  url: string | null
  created_by: string | null
}

export type SignalResearchRun = {
  id: string
  created_at: string
  prospect_id: string | null
  created_prospect_id: string | null
  business_name: string
  location: string
  industry_hint: string | null
  known_context: string | null
  initial_note: string | null
  provider: string
  query: string
  status: "needs_confirmation" | "confirmed" | "merged" | "created" | "failed"
  candidates: SignalJson
  selected_candidate: SignalJson | null
  confirmed_official_url: string | null
  official_source_confidence: SignalConfidence | null
  evidence: SignalJson
  error: string | null
}

export type SignalImportBatch = {
  id: string
  created_at: string
  source_filename: string
  file_type: "csv" | "xlsx" | "xls"
  sheet_name: string | null
  row_count: number
  headers: SignalJson
  mapping: SignalJson
  preview_rows: SignalJson
  duplicate_summary: SignalJson
  status: "previewed" | "imported" | "failed"
  imported_count: number
  error: string | null
}

export type SignalCallSession = {
  id: string
  created_at: string
  title: string
  status: "open" | "completed" | "archived"
  notes: string | null
}

export type SignalCallSessionItem = {
  id: string
  session_id: string
  prospect_id: string
  created_at: string
  position: number
  outcome:
    | "no_answer"
    | "voicemail_left"
    | "permission_to_send_demo"
    | "interested"
    | "follow_up_later"
    | "not_interested"
    | "do_not_contact"
    | null
  outcome_notes: string | null
  follow_up_date: string | null
  completed_at: string | null
}

export type SignalCampaign = {
  id: string
  created_at: string
  updated_at: string
  name: string
  target_city: string
  target_state: string | null
  target_radius_miles: number | null
  selected_playbooks: string[]
  max_candidates: number
  status: SignalCampaignStatus
  discovery_provider: string | null
  notes: string | null
  created_by: string | null
  last_run_at: string | null
  next_action: string | null
}

export type SignalMarket = {
  id: string
  created_at: string
  updated_at: string
  name: string
  city: string
  state: string | null
  radius_miles: number | null
  industries: string[]
  max_candidates: number
  research_depth: SignalMarketResearchDepth
  status: SignalMarketStatus
  provider_mode: SignalResearchProviderMode | null
  progress: SignalJson | null
  estimated_credit_budget: number | null
  actual_credit_usage: SignalJson | null
  notes: string | null
  created_by: string | null
  last_run_at: string | null
  next_action: string | null
}

export type SignalMarketEvent = {
  id: string
  market_id: string
  created_at: string
  event_type: string
  stage: SignalMarketEventStage
  message: string
  candidate_id: string | null
  progress_current: number | null
  progress_total: number | null
  metadata: SignalJson | null
}

export type SignalIdentityCorrection = {
  id: string
  created_at: string
  market_id: string | null
  candidate_id: string | null
  normalized_hostname: string | null
  previous_business_name: string | null
  corrected_business_name: string
  reason: string | null
  created_by: string | null
  active: boolean
}

export type SignalCampaignCandidate = {
  id: string
  campaign_id: string
  created_at: string
  business_name: string
  city: string | null
  state: string | null
  industry_hint: string | null
  candidate_url: string | null
  likely_official_url: string | null
  source_url: string | null
  source_title: string | null
  source_snippet: string | null
  source_provider: string | null
  official_source_confidence: SignalConfidence | null
  normalized_business_name: string | null
  normalized_hostname: string | null
  classified_category: string | null
  classified_playbook: string | null
  classification_source: SignalClassificationSource | null
  classification_confidence: SignalConfidence | null
  classification_evidence: SignalJson | null
  classified_at: string | null
  quick_score_summary: SignalJson | null
  quick_score_updated_at: string | null
  candidate_status: SignalCampaignCandidateStatus
  duplicate_prospect_id: string | null
  reason: string | null
}

export type SignalMarketCandidate = {
  id: string
  market_id: string
  created_at: string
  updated_at: string
  business_name: string
  city: string | null
  state: string | null
  industry_hint: string | null
  category: string | null
  category_confidence: SignalConfidence | null
  candidate_url: string | null
  likely_official_url: string | null
  confirmed_official_url: string | null
  search_result_title: string | null
  search_result_url: string | null
  normalized_hostname: string | null
  likely_official_site: boolean | null
  extracted_business_name: string | null
  canonical_business_name: string | null
  resolution_confidence: SignalConfidence | null
  resolution_evidence: SignalJson | null
  requires_confirmation: boolean
  identity_updated_at: string | null
  official_source_confidence: SignalConfidence | null
  source_urls: SignalJson | null
  provider_sources: SignalJson | null
  duplicate_state: SignalDuplicateConfidence | "none" | null
  duplicate_prospect_id: string | null
  suppression_state: SignalMarketCandidateSuppressionState | null
  suppression_id: string | null
  research_state: SignalMarketCandidateResearchState
  quick_score_state: SignalMarketCandidateQuickScoreState | null
  preliminary_priority: SignalPriority | null
  confidence: SignalConfidence | null
  imported_prospect_id: string | null
  website_opportunity_score: number | null
  systems_opportunity_score: number | null
  outreach_readiness_score: number | null
  pursuit_priority: string | null
  recommended_lane: SignalRecommendedLane | null
  relevant_demo: SignalRelevantDemo | null
  visual_state: string | null
  quick_score_summary: SignalJson | null
  evidence_graph: SignalJson | null
  website_scan: SignalJson | null
  firecrawl_evidence: SignalJson | null
  normalized_business_name: string | null
  classified_at: string | null
  error_message: string | null
  rejected_at: string | null
  restored_at: string | null
  approved_at: string | null
}

export type SignalFocusItem = {
  id: string
  created_at: string
  prospect_id: string
  campaign_id: string | null
  market_id: string | null
  status: SignalFocusItemStatus
  focus_reason: string | null
  recommended_action: string | null
  due_date: string | null
  completed_at: string | null
  created_by: string | null
}
