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

export type SignalConversationStyle =
  | "friendly_local"
  | "traditional_owner_operator"
  | "modern_casual_brand"
  | "formal_business"
  | "clinical_professional"
  | "concise_busy_owner"

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
  conversation_style: SignalConversationStyle
  conversation_style_reason: string | null
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
