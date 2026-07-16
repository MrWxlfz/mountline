import { NextResponse } from "next/server"
import { z } from "zod"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { invalidateSignalArtifacts } from "@/lib/signal/artifacts"
import { changedSignalIdentityFields } from "@/lib/signal/copilot"
import { formatSignalPhone } from "@/lib/signal/input-parser"
import { normalizeSignalBusinessName, normalizeSignalHostname, normalizeSignalPhone } from "@/lib/signal/research"
import { signalIdentityCorrectionSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect } from "@/lib/supabase/types"

const identityActionSchema = z.object({ action: z.literal("none_of_these") })

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {}
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const parsed = signalIdentityCorrectionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid identity correction." }, { status: 400 })
  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: existingData, error: existingError } = await supabase.from("signal_prospects").select("*").eq("id", prospectId).maybeSingle()
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 })
  if (!existingData) return NextResponse.json({ error: "Signal lead not found." }, { status: 404 })
  const existing = existingData as SignalProspect
  const correction = parsed.data
  const canonicalName = correction.canonical_name || correction.business_name || existing.canonical_name || existing.business_name
  const phone = correction.public_phone === undefined ? existing.public_phone : formatSignalPhone(correction.public_phone)
  const override = {
    ...record(existing.manual_identity_override),
    ...correction,
    canonical_name: canonicalName,
    public_phone: phone,
  }
  const update = {
    business_name: canonicalName,
    canonical_name: canonicalName,
    canonical_name_status: "user_confirmed",
    canonical_name_source: `manual:${correction.verification_source}`,
    display_name: canonicalName,
    previous_names: Array.from(new Set([existing.business_name, ...(Array.isArray(existing.previous_names) ? existing.previous_names.filter((item): item is string => typeof item === "string") : [])])).filter((name) => name !== canonicalName),
    manual_identity_override: override,
    public_address: correction.public_address === undefined ? existing.public_address : correction.public_address,
    public_phone: phone,
    website_url: correction.website_url === undefined ? existing.website_url : correction.website_url,
    facebook_url: correction.facebook_url === undefined ? existing.facebook_url : correction.facebook_url,
    instagram_url: correction.instagram_url === undefined ? existing.instagram_url : correction.instagram_url,
    industry: correction.industry === undefined ? existing.industry : correction.industry || existing.industry,
    city: correction.city === undefined ? existing.city : correction.city,
    state: correction.state === undefined ? existing.state : correction.state,
    chain_status: correction.chain_status || existing.chain_status,
    business_location_type: correction.business_location_type || existing.business_location_type || "unknown",
    normalized_business_name: normalizeSignalBusinessName(canonicalName) || null,
    normalized_hostname: normalizeSignalHostname(correction.website_url === undefined ? existing.website_url : correction.website_url) || null,
    public_phone_normalized: normalizeSignalPhone(phone) || null,
    identity_resolution_state: "user_confirmed",
    identity_status: "verified",
    identity_resolution: {
      ...record(existing.identity_resolution),
      manual_confirmation: { source: correction.verification_source, at: new Date().toISOString() },
    },
    analysis_status: "queued",
    analysis_error: null,
    lead_lifecycle: "resolving",
    sales_pack_state: "not_ready",
    next_action: "Signal is regenerating the analysis for the corrected identity.",
  }
  const { data: updated, error: updateError } = await supabase.from("signal_prospects").update(update).eq("id", prospectId).select().single()
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  const tracked: Array<[string, unknown, unknown]> = [
    ["canonical_name", existing.canonical_name || existing.business_name, canonicalName],
    ["public_address", existing.public_address, update.public_address],
    ["public_phone", existing.public_phone, phone],
    ["website_url", existing.website_url, update.website_url],
    ["facebook_url", existing.facebook_url, update.facebook_url],
    ["instagram_url", existing.instagram_url, update.instagram_url],
    ["industry", existing.industry, update.industry],
    ["city", existing.city, update.city],
    ["state", existing.state, update.state],
    ["chain_status", existing.chain_status, update.chain_status],
    ["business_location_type", existing.business_location_type, update.business_location_type],
  ]
  const changed = tracked.filter(([, before, after]) => JSON.stringify(before ?? null) !== JSON.stringify(after ?? null))
  const changedIdentityFields = changedSignalIdentityFields(
    {
      canonical_name: existing.canonical_name || existing.business_name,
      public_address: existing.public_address,
      public_phone: existing.public_phone,
      industry: existing.industry,
      website_url: existing.website_url,
      instagram_url: existing.instagram_url,
      facebook_url: existing.facebook_url,
      provider_place_id: existing.provider_place_id,
      chain_status: existing.chain_status,
    },
    {
      canonical_name: canonicalName,
      public_address: update.public_address,
      public_phone: phone,
      industry: update.industry,
      website_url: update.website_url,
      instagram_url: update.instagram_url,
      facebook_url: update.facebook_url,
      provider_place_id: existing.provider_place_id,
      chain_status: update.chain_status,
    },
  )
  if (changedIdentityFields.length) {
    await invalidateSignalArtifacts({
      prospect: existing,
      changedFields: changedIdentityFields,
      createdBy: authCheck.access.userId,
    })
  }
  if (changed.length) {
    await supabase.from("signal_identity_correction_history").insert(changed.map(([field, before, after]) => ({
      prospect_id: prospectId,
      corrected_by: authCheck.access.userId,
      field_name: field,
      previous_value: before ?? null,
      corrected_value: after ?? null,
      verification_source: correction.verification_source,
      note: correction.note || null,
    })))
  }
  await Promise.all([
    supabase.from("signal_lead_activities").insert({
      prospect_id: prospectId,
      activity_type: "identity_corrected",
      summary: `Mountline corrected ${changed.map(([field]) => field.replace(/_/g, " ")).join(", ") || "identity details"}.`,
      metadata: { verification_source: correction.verification_source, fields: changed.map(([field]) => field) },
      created_by: authCheck.access.userId,
    }),
  ])
  return NextResponse.json({ prospect: updated, reanalysis_scope: changedIdentityFields.includes("website_url") ? "website" : changedIdentityFields.includes("industry") ? "opportunity" : "identity", artifacts_invalidated: changedIdentityFields.length > 0 })
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const parsed = identityActionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid identity action." }, { status: 400 })
  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: prospectData } = await supabase.from("signal_prospects").select("*").eq("id", prospectId).maybeSingle()
  if (!prospectData) return NextResponse.json({ error: "Signal lead not found." }, { status: 404 })
  const prospect = prospectData as SignalProspect
  const submittedName = prospect.submitted_name || prospect.business_name
  await invalidateSignalArtifacts({
    prospect,
    changedFields: ["canonical_name", "public_address", "public_phone", "industry", "website_url", "instagram_url", "facebook_url", "provider_place_id", "chain_status"],
    createdBy: authCheck.access.userId,
  })
  await Promise.all([
    supabase.from("signal_identity_candidates").update({ resolution_status: "unrelated", rejection_reason: "Mountline marked all suggested matches as unrelated." }).eq("prospect_id", prospectId),
    supabase.from("signal_prospects").update({
      business_name: submittedName,
      canonical_name: submittedName,
      canonical_name_status: "submitted",
      canonical_name_source: "submitted_input",
      display_name: submittedName,
      identity_resolution_state: "unresolved",
      identity_status: "needs_review",
      analysis_status: "needs_review",
      lead_lifecycle: "needs_confirmation",
      verdict: "could_not_resolve",
      sales_pack_state: "not_ready",
      next_action: "Add an exact Maps URL, official phone, or website.",
    }).eq("id", prospectId),
    supabase.from("signal_lead_activities").insert({
      prospect_id: prospectId,
      activity_type: "identity_candidates_rejected",
      summary: "Mountline marked all suggested identity matches as unrelated.",
      created_by: authCheck.access.userId,
    }),
  ])
  return NextResponse.json({ ok: true })
}
