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
