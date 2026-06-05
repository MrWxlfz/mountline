import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { addSignalCandidateSuppression } from "@/lib/signal/alerts"
import { classifySignalCampaignCandidate } from "@/lib/signal/classification"
import { isClearlyNonOfficialSignalSource } from "@/lib/signal/research"
import { signalCampaignCandidatePatchSchema } from "@/lib/signal/validation"
import { normalizeSignalUrl } from "@/lib/signal/website"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ campaignId: string; candidateId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalCampaignCandidatePatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid candidate update." },
      { status: 400 },
    )
  }

  const update: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.likely_official_url) {
    const normalized = normalizeSignalUrl(parsed.data.likely_official_url)
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
    update.official_source_confidence = "medium"
  }

  if (parsed.data.candidate_status === "approved" && !parsed.data.likely_official_url) {
    update.official_source_confidence = "medium"
  }

  if (parsed.data.classified_playbook) {
    update.classified_playbook = parsed.data.classified_playbook
    update.classified_category = parsed.data.classified_playbook
    update.classification_source = "manual_override"
    update.classification_confidence = "high"
    update.classification_evidence = [
      `Manual correction set ${parsed.data.classified_playbook}.`,
    ]
    update.classified_at = new Date().toISOString()
  }

  const { campaignId, candidateId } = await params
  const supabase = createAdminClient()
  const { data: existing } = await supabase
    .from("signal_campaign_candidates")
    .select("*")
    .eq("id", candidateId)
    .eq("campaign_id", campaignId)
    .maybeSingle()

  if (!existing) return NextResponse.json({ error: "Candidate not found." }, { status: 404 })

  if (!parsed.data.classified_playbook) {
    Object.assign(
      update,
      await classifySignalCampaignCandidate({
        ...existing,
        ...update,
      }),
    )
  }

  const { data, error } = await supabase
    .from("signal_campaign_candidates")
    .update(update)
    .eq("id", candidateId)
    .eq("campaign_id", campaignId)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Candidate not found." }, { status: 404 })

  if (parsed.data.candidate_status === "rejected") {
    await addSignalCandidateSuppression({
      businessName: data.business_name,
      city: data.city,
      hostname: data.likely_official_url || data.candidate_url,
      reason: data.reason || "Rejected during campaign review.",
      sourceCampaignId: campaignId,
      suppressionType: "rejected",
    })
  }
  if (parsed.data.candidate_status === "duplicate") {
    await addSignalCandidateSuppression({
      businessName: data.business_name,
      city: data.city,
      hostname: data.likely_official_url || data.candidate_url,
      reason: data.reason || "Marked duplicate during campaign review.",
      sourceCampaignId: campaignId,
      suppressionType: "duplicate",
    })
  }

  return NextResponse.json({ candidate: data })
}
