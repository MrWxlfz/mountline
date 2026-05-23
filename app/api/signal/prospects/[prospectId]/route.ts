import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { isSignalProspectSuppressed } from "@/lib/signal/alerts"
import {
  blankToNull,
  cleanOptionalText,
  forceComplianceForIndustry,
  normalizeEmail,
  signalProspectPatchSchema,
} from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect } from "@/lib/supabase/types"

function normalizeBody(body: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(body).map(([key, value]) => [key, blankToNull(value)]),
  )
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Prospect not found" }, { status: 404 })

  return NextResponse.json({ prospect: data })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid prospect payload" }, { status: 400 })
  }

  const parsed = signalProspectPatchSchema.safeParse(
    normalizeBody(body as Record<string, unknown>),
  )
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid prospect update" },
      { status: 400 },
    )
  }

  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: existing, error: existingError } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()

  if (existingError) {
    return NextResponse.json({ error: existingError.message }, { status: 500 })
  }
  if (!existing) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 })
  }

  const prospect = existing as SignalProspect
  const update: Record<string, unknown> = {}

  const textFields = [
    "business_name",
    "contact_name",
    "industry",
    "industry_playbook",
    "city",
    "state",
    "locality_relationship",
    "website_url",
    "public_phone",
    "public_contact_form_url",
    "instagram_url",
    "existing_website_platform",
    "existing_booking_platform",
    "human_notes",
    "what_looks_good",
    "visible_problem",
    "relevant_demo",
    "conversation_style_reason",
    "follow_up_date",
    "assigned_to",
  ] as const

  for (const field of textFields) {
    if (field in parsed.data) {
      update[field] = cleanOptionalText(parsed.data[field])
    }
  }

  if ("public_email" in parsed.data) {
    update.public_email = normalizeEmail(parsed.data.public_email)
  }
  if (parsed.data.outreach_mode) update.outreach_mode = parsed.data.outreach_mode
  if (parsed.data.conversation_style) update.conversation_style = parsed.data.conversation_style
  if (parsed.data.outreach_status) update.outreach_status = parsed.data.outreach_status
  if (parsed.data.locality_scope) update.locality_scope = parsed.data.locality_scope
  if (parsed.data.relationship_type) update.relationship_type = parsed.data.relationship_type
  if (parsed.data.outreach_history) update.outreach_history = parsed.data.outreach_history
  if (parsed.data.source) update.source = parsed.data.source
  if ("contacted_at" in parsed.data) update.contacted_at = parsed.data.contacted_at || null

  const mergedIndustry = String(update.industry || prospect.industry)
  const mergedPlaybook = String(update.industry_playbook || prospect.industry_playbook || "")
  if ("industry" in update || "industry_playbook" in update) {
    Object.assign(update, forceComplianceForIndustry(mergedIndustry, mergedPlaybook))
  }

  const mergedProspect = { ...prospect, ...update } as SignalProspect
  if (
    update.outreach_status === "ready_to_contact" &&
    (await isSignalProspectSuppressed(mergedProspect))
  ) {
    return NextResponse.json(
      { error: "This prospect is on the Signal do-not-contact list." },
      { status: 409 },
    )
  }

  if (update.outreach_status === "contacted" && !prospect.contacted_at) {
    update.contacted_at = new Date().toISOString()
    update.outreach_history = update.outreach_history || "called"
  }
  if (update.outreach_status === "awaiting_reply") {
    update.outreach_history = update.outreach_history || "awaiting_reply"
  }

  const { data, error } = await supabase
    .from("signal_prospects")
    .update(update)
    .eq("id", prospectId)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ prospect: data })
}
