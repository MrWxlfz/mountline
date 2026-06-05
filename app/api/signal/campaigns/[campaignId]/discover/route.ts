import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import {
  findLikelySignalDuplicates,
  runSignalCampaignDiscovery,
} from "@/lib/signal/research"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalCampaign,
  SignalCampaignCandidate,
  SignalProspect,
} from "@/lib/supabase/types"
import type { SignalPlaybookKey } from "@/lib/signal/playbooks"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { campaignId } = await params
  const supabase = createAdminClient()
  const { data: campaignData, error: campaignError } = await supabase
    .from("signal_campaigns")
    .select("*")
    .eq("id", campaignId)
    .maybeSingle()

  if (campaignError) return NextResponse.json({ error: campaignError.message }, { status: 500 })
  if (!campaignData) return NextResponse.json({ error: "Campaign not found." }, { status: 404 })

  const campaign = campaignData as SignalCampaign
  await supabase
    .from("signal_campaigns")
    .update({
      status: "discovering",
      discovery_provider: process.env.SIGNAL_RESEARCH_PROVIDER?.trim().toLowerCase() || "disabled",
      next_action: "Public discovery is running. Review sources before importing anything.",
      last_run_at: new Date().toISOString(),
    })
    .eq("id", campaign.id)

  const result = await runSignalCampaignDiscovery({
    city: campaign.target_city,
    state: campaign.target_state,
    playbooks: campaign.selected_playbooks as SignalPlaybookKey[],
    maxCandidates: campaign.max_candidates,
  })

  const { data: prospects } = await supabase.from("signal_prospects").select("*")
  const existingProspects = (prospects || []) as SignalProspect[]
  const candidateRows = result.candidates.map((candidate) => {
    const duplicate = findLikelySignalDuplicates(existingProspects, {
      businessName: candidate.business_name,
      websiteUrl: candidate.likely_official_url || candidate.candidate_url,
    })[0]

    return {
      ...candidate,
      campaign_id: campaign.id,
      candidate_status: duplicate ? "duplicate" : candidate.candidate_status,
      duplicate_prospect_id: duplicate?.prospect.id || null,
      reason: duplicate
        ? `Possible duplicate: ${duplicate.reasons.join(", ")}. Merge or reject before import.`
        : candidate.reason,
    }
  })

  await supabase
    .from("signal_campaign_candidates")
    .delete()
    .eq("campaign_id", campaign.id)
    .in("candidate_status", ["pending_review", "needs_confirmation", "duplicate", "rejected"])

  const { data: inserted, error: insertError } = candidateRows.length
    ? await supabase.from("signal_campaign_candidates").insert(candidateRows).select()
    : { data: [], error: null }

  if (insertError) {
    await supabase
      .from("signal_campaigns")
      .update({
        status: "failed",
        next_action: insertError.message,
      })
      .eq("id", campaign.id)
    return NextResponse.json({ error: insertError.message }, { status: 500 })
  }

  const nextStatus = result.ok && candidateRows.length > 0 ? "review_candidates" : "failed"
  const nextAction = result.ok
    ? "Review candidate sources. Approve only official public websites, reject directories, or merge duplicates."
    : result.setup_message

  const { data: updatedCampaign } = await supabase
    .from("signal_campaigns")
    .update({
      status: nextStatus,
      discovery_provider: result.provider,
      next_action: nextAction,
    })
    .eq("id", campaign.id)
    .select()
    .single()

  const payload = {
    campaign: updatedCampaign,
    candidates: (inserted || []) as SignalCampaignCandidate[],
    queries: result.queries,
    setup_message: result.setup_message,
  }

  if (!result.ok) {
    return NextResponse.json({ error: result.setup_message, ...payload }, { status: 503 })
  }

  return NextResponse.json(payload)
}
