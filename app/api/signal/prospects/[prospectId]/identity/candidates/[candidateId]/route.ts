import { NextResponse } from "next/server"
import { z } from "zod"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { invalidateSignalArtifacts } from "@/lib/signal/artifacts"
import { changedSignalIdentityFields } from "@/lib/signal/copilot"
import { formatSignalPhone } from "@/lib/signal/input-parser"
import { normalizeSignalBusinessName, normalizeSignalHostname, normalizeSignalPhone } from "@/lib/signal/research"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalIdentityCandidateRecord, SignalProspect } from "@/lib/supabase/types"

const actionSchema = z.object({ action: z.enum(["confirm", "unrelated"]) })

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string; candidateId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const parsed = actionSchema.safeParse(await request.json().catch(() => null))
  if (!parsed.success) return NextResponse.json({ error: "Invalid candidate action." }, { status: 400 })
  const { prospectId, candidateId } = await params
  const supabase = createAdminClient()
  const [{ data: candidateData, error: candidateError }, { data: prospectData }] = await Promise.all([
    supabase.from("signal_identity_candidates").select("*").eq("id", candidateId).eq("prospect_id", prospectId).maybeSingle(),
    supabase.from("signal_prospects").select("*").eq("id", prospectId).maybeSingle(),
  ])
  if (candidateError) return NextResponse.json({ error: candidateError.message }, { status: 500 })
  if (!candidateData || !prospectData) return NextResponse.json({ error: "Identity candidate not found." }, { status: 404 })
  const candidate = candidateData as SignalIdentityCandidateRecord
  const prospect = prospectData as SignalProspect

  if (parsed.data.action === "unrelated") {
    await Promise.all([
      supabase.from("signal_identity_candidates").update({ resolution_status: "unrelated", rejection_reason: "Mountline marked this candidate as unrelated." }).eq("id", candidateId),
      supabase.from("signal_lead_activities").insert({
        prospect_id: prospectId,
        activity_type: "identity_candidate_rejected",
        summary: `${candidate.candidate_name || candidate.source_title || "A candidate"} was marked unrelated.`,
        metadata: { candidate_id: candidateId },
        created_by: authCheck.access.userId,
      }),
    ])
    return NextResponse.json({ ok: true })
  }

  if (!candidate.canonical_eligible && ["directory", "aggregator", "marketplace", "review_platform", "booking_platform", "search_engine"].includes(candidate.source_classification)) {
    return NextResponse.json({ error: "This intermediary source cannot become the business identity. Add a Maps listing, official phone, or official website instead." }, { status: 409 })
  }

  const canonicalName = candidate.candidate_name || prospect.submitted_name || prospect.business_name
  const phone = formatSignalPhone(candidate.phone)
  const candidateSocialUrls = stringList(candidate.social_urls)
  const instagramUrl = candidateSocialUrls.find((url) => /instagram\.com/i.test(url)) || null
  const facebookUrl = candidateSocialUrls.find((url) => /facebook\.com/i.test(url)) || null
  // A newly confirmed identity must not inherit a domain from the previously
  // selected entity. If this candidate has no eligible official site, clear the
  // active URL and let focused website research establish it again.
  const websiteUrl = candidate.official_website_eligible ? candidate.website_url : null
  const override = {
    canonical_name: canonicalName,
    public_address: candidate.address,
    public_phone: phone,
    website_url: websiteUrl,
    maps_url: candidate.source_classification === "places_map_listing" ? candidate.source_url : null,
    verification_source: candidate.source_classification === "places_map_listing" ? "places_listing" : "other",
  }
  const { error: resetError } = await supabase
    .from("signal_identity_candidates")
    .update({ resolution_status: "possible", user_confirmed_at: null, user_confirmed_by: null })
    .eq("prospect_id", prospectId)
  if (resetError) return NextResponse.json({ error: resetError.message }, { status: 500 })
  const { error: candidateUpdateError } = await supabase
    .from("signal_identity_candidates")
    .update({ resolution_status: "user_confirmed", user_confirmed_at: new Date().toISOString(), user_confirmed_by: authCheck.access.userId })
    .eq("id", candidateId)
  if (candidateUpdateError) return NextResponse.json({ error: candidateUpdateError.message }, { status: 500 })
  const { error: historyError } = await supabase.from("signal_identity_correction_history").insert({
    prospect_id: prospectId,
    corrected_by: authCheck.access.userId,
    field_name: "selected_identity_candidate",
    previous_value: prospect.canonical_name || prospect.business_name,
    corrected_value: canonicalName,
    verification_source: override.verification_source,
    note: `Confirmed candidate ${candidateId}.`,
  })
  if (historyError) return NextResponse.json({ error: historyError.message }, { status: 500 })
  const { data: updated, error: updateError } = await supabase.from("signal_prospects").update({
    business_name: canonicalName,
    canonical_name: canonicalName,
    canonical_name_status: "user_confirmed",
    canonical_name_source: `candidate:${candidate.source_provider}`,
    display_name: canonicalName,
    manual_identity_override: override,
    public_address: candidate.address || prospect.public_address,
    public_phone: phone || prospect.public_phone,
    website_url: websiteUrl,
    instagram_url: instagramUrl,
    facebook_url: facebookUrl,
    provider_place_id: candidate.provider_place_id || prospect.provider_place_id,
    city: candidate.city || prospect.city,
    state: candidate.state || prospect.state,
    industry: candidate.category || prospect.industry,
    normalized_business_name: normalizeSignalBusinessName(canonicalName) || null,
    normalized_hostname: normalizeSignalHostname(websiteUrl) || null,
    public_phone_normalized: normalizeSignalPhone(phone) || null,
    identity_resolution_state: "user_confirmed",
    identity_status: "verified",
    analysis_status: "queued",
    analysis_error: null,
    lead_lifecycle: "resolving",
    verdict: "pending",
    sales_pack_state: "not_ready",
    next_action: "Continue analysis using the confirmed business.",
  }).eq("id", prospectId).select().single()
  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
  const changedFields = changedSignalIdentityFields(
    {
      canonical_name: prospect.canonical_name || prospect.business_name,
      public_address: prospect.public_address,
      public_phone: prospect.public_phone,
      industry: prospect.industry,
      website_url: prospect.website_url,
      instagram_url: prospect.instagram_url,
      facebook_url: prospect.facebook_url,
      provider_place_id: prospect.provider_place_id,
      chain_status: prospect.chain_status,
    },
    {
      canonical_name: canonicalName,
      public_address: candidate.address || prospect.public_address,
      public_phone: phone || prospect.public_phone,
      industry: candidate.category || prospect.industry,
      website_url: websiteUrl,
      instagram_url: instagramUrl,
      facebook_url: facebookUrl,
      provider_place_id: candidate.provider_place_id || prospect.provider_place_id,
      chain_status: prospect.chain_status,
    },
  )
  if (changedFields.length) {
    await invalidateSignalArtifacts({ prospect, changedFields, createdBy: authCheck.access.userId })
  }
  await supabase.from("signal_lead_activities").insert({
    prospect_id: prospectId,
    activity_type: "identity_candidate_confirmed",
    summary: `${canonicalName} was confirmed as the intended business.`,
    metadata: { candidate_id: candidateId },
    created_by: authCheck.access.userId,
  })
  return NextResponse.json({ prospect: updated })
}
