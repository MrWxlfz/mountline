import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { addSignalCandidateSuppression } from "@/lib/signal/alerts"
import { resolveSignalClassification } from "@/lib/signal/classification"
import { isClearlyNonOfficialSignalSource, normalizeSignalBusinessName, normalizeSignalHostname } from "@/lib/signal/research"
import { signalMarketCandidatePatchSchema } from "@/lib/signal/validation"
import { normalizeSignalUrl } from "@/lib/signal/website"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalMarketCandidate } from "@/lib/supabase/types"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ marketId: string; candidateId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalMarketCandidatePatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid candidate update." },
      { status: 400 },
    )
  }

  const { marketId, candidateId } = await params
  const supabase = createAdminClient()
  const { data: existingData } = await supabase
    .from("signal_market_candidates")
    .select("*")
    .eq("id", candidateId)
    .eq("market_id", marketId)
    .maybeSingle()

  if (!existingData) return NextResponse.json({ error: "Candidate not found." }, { status: 404 })
  const existing = existingData as SignalMarketCandidate

  const update: Record<string, unknown> = {}

  if (parsed.data.canonical_business_name) {
    const correctedName = parsed.data.canonical_business_name.trim()
    const hostname = normalizeSignalHostname(
      existing.confirmed_official_url || existing.likely_official_url || existing.candidate_url,
    )
    update.business_name = correctedName
    update.canonical_business_name = correctedName
    update.extracted_business_name = correctedName
    update.normalized_business_name = normalizeSignalBusinessName(correctedName) || null
    update.resolution_confidence = "high"
    update.requires_confirmation = false
    update.identity_updated_at = new Date().toISOString()
    update.resolution_evidence = [
      {
        source: "manual_correction",
        value: correctedName,
        confidence: "high",
        note: "Corrected by Mountline team during market review.",
      },
    ]
    await supabase.from("signal_identity_corrections").insert({
      market_id: marketId,
      candidate_id: candidateId,
      normalized_hostname: hostname || null,
      previous_business_name: existing.canonical_business_name || existing.business_name,
      corrected_business_name: correctedName,
      reason: parsed.data.reason || "Manual identity correction from market review.",
      created_by: authCheck.access.emails[0] || authCheck.access.userId,
      active: true,
    })
  }

  const officialUrl = parsed.data.confirmed_official_url || parsed.data.likely_official_url
  if (officialUrl) {
    const normalized = normalizeSignalUrl(officialUrl)
    if (!normalized) {
      return NextResponse.json({ error: "Official URL could not be parsed." }, { status: 400 })
    }
    if (isClearlyNonOfficialSignalSource(normalized.toString())) {
      return NextResponse.json(
        { error: "Choose an official public website, not a social, search, or directory URL." },
        { status: 400 },
      )
    }
    update.likely_official_url = normalized.toString()
    update.confirmed_official_url = normalized.toString()
    update.official_source_confidence = "medium"
    update.normalized_hostname = normalizeSignalHostname(normalized.toString()) || null
    update.research_state = "official_site_resolved"
  }

  if (parsed.data.duplicate_prospect_id !== undefined) {
    update.duplicate_prospect_id = parsed.data.duplicate_prospect_id || null
  }
  if (parsed.data.duplicate_state !== undefined) {
    update.duplicate_state = parsed.data.duplicate_state || "none"
    if (parsed.data.duplicate_state && parsed.data.duplicate_state !== "none") {
      update.research_state = "duplicate"
    }
  }
  if (parsed.data.suppression_state !== undefined) {
    update.suppression_state = parsed.data.suppression_state
  }
  if (parsed.data.research_state) {
    update.research_state = parsed.data.research_state
  }
  if (parsed.data.reason !== undefined) {
    update.error_message = parsed.data.reason || null
  }

  if (parsed.data.category) {
    const classification = await resolveSignalClassification({
      businessName: existing.business_name,
      city: existing.city,
      state: existing.state,
      industryHint: existing.industry_hint,
      websiteUrl:
        parsed.data.confirmed_official_url ||
        parsed.data.likely_official_url ||
        existing.confirmed_official_url ||
        existing.likely_official_url ||
        existing.candidate_url,
      selectedPlaybook: parsed.data.category,
      manualOverride: true,
    })
    update.category = classification.playbook
    update.category_confidence = "high"
    update.normalized_business_name = classification.normalizedBusinessName || null
    update.normalized_hostname = classification.normalizedHostname || null
    update.classified_at = classification.classifiedAt
  }

  if (parsed.data.research_state === "rejected") {
    update.rejected_at = new Date().toISOString()
    update.suppression_state = parsed.data.suppression_state || "market_rejected"
  }

  if (parsed.data.suppression_state === "restored") {
    update.restored_at = new Date().toISOString()
    if (existing.suppression_id) {
      await supabase
        .from("signal_candidate_suppressions")
        .update({
          restored_at: new Date().toISOString(),
          restored_by: authCheck.access.emails[0] || authCheck.access.userId,
        })
        .eq("id", existing.suppression_id)
    }
  }

  const { data, error } = await supabase
    .from("signal_market_candidates")
    .update(update)
    .eq("id", candidateId)
    .eq("market_id", marketId)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Candidate not found." }, { status: 404 })

  const eventStage =
    parsed.data.canonical_business_name || parsed.data.confirmed_official_url || parsed.data.likely_official_url
      ? "resolving_sites"
      : parsed.data.duplicate_state && parsed.data.duplicate_state !== "none"
        ? "deduplicating"
        : parsed.data.suppression_state === "suppressed" || parsed.data.research_state === "rejected"
          ? "suppressing"
          : parsed.data.suppression_state === "restored"
            ? "ranking"
            : "ranking"
  const eventMessage =
    parsed.data.canonical_business_name
      ? `Updated identity for ${parsed.data.canonical_business_name}.`
      : parsed.data.confirmed_official_url || parsed.data.likely_official_url
        ? `Confirmed official website for ${data.canonical_business_name || data.business_name}.`
        : parsed.data.duplicate_state && parsed.data.duplicate_state !== "none"
          ? `Marked ${data.canonical_business_name || data.business_name} as a duplicate.`
          : parsed.data.suppression_state === "suppressed"
            ? `Suppressed ${data.canonical_business_name || data.business_name}.`
            : parsed.data.suppression_state === "restored"
              ? `Restored ${data.canonical_business_name || data.business_name}.`
              : `Updated ${data.canonical_business_name || data.business_name}.`

  await supabase.from("signal_market_events").insert({
    market_id: marketId,
    candidate_id: candidateId,
    event_type: "manual_review_update",
    stage: eventStage,
    message: eventMessage,
    metadata: { update },
  })

  if (
    parsed.data.research_state === "rejected" &&
    parsed.data.suppression_state === "suppressed"
  ) {
    const suppression = await addSignalCandidateSuppression({
      businessName: existing.business_name,
      city: existing.city,
      hostname: existing.confirmed_official_url || existing.likely_official_url || existing.candidate_url,
      reason: parsed.data.reason || "Rejected permanently from market review.",
      sourceMarketId: marketId,
      suppressionType: "rejected",
    })
    const { data: suppressedCandidate } = await supabase
      .from("signal_market_candidates")
      .update({
        suppression_id: suppression.id,
        suppression_state: "suppressed",
      })
      .eq("id", candidateId)
      .eq("market_id", marketId)
      .select()
      .maybeSingle()
    return NextResponse.json({ candidate: suppressedCandidate || data })
  }

  return NextResponse.json({ candidate: data })
}
