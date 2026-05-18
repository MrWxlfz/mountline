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
