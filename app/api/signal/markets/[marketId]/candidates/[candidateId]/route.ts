import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { addSignalCandidateSuppression } from "@/lib/signal/alerts"
import { resolveSignalClassification } from "@/lib/signal/classification"
import { isClearlyNonOfficialSignalSource } from "@/lib/signal/research"
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
