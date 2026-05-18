import type { ScoutProspect } from "@/lib/supabase/types"

export type WebsiteSnapshot = {
  url: string | null
  title: string | null
  metaDescription: string | null
  headings: string[]
  bodyText: string
  contactSignals: string[]
  notes: string
  error?: string
}

export type ScoutScore = {
  website_score: number
  opportunity_score: number
  estimated_project_fit: string
  reasons: string[]
  ai_summary: string
  outreach_angle: string
  red_flags: string[]
  website_notes: string
}

export type ScoutProspectInput = Pick<
  ScoutProspect,
  | "business_name"
  | "industry"
  | "city"
  | "state"
  | "website"
  | "phone"
  | "email"
  | "google_rating"
  | "google_review_count"
  | "notes"
>
