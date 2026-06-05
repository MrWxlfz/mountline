import { notFound } from "next/navigation"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalCampaign,
  SignalCampaignCandidate,
  SignalProspect,
} from "@/lib/supabase/types"
import { SignalCampaignDetail } from "./signal-campaign-detail"

export default async function SignalCampaignDetailPage({
  params,
}: {
  params: Promise<{ campaignId: string }>
}) {
  await requireNorthlineTeamMember()
  const { campaignId } = await params
  const supabase = createAdminClient()

  const [{ data: campaign }, { data: candidates }, { data: prospects }] = await Promise.all([
    supabase
      .from("signal_campaigns")
      .select("*")
      .eq("id", campaignId)
      .maybeSingle(),
    supabase
      .from("signal_campaign_candidates")
      .select("*")
      .eq("campaign_id", campaignId)
      .order("created_at", { ascending: false }),
    supabase
      .from("signal_prospects")
      .select("*")
      .order("created_at", { ascending: false }),
  ])

  if (!campaign) notFound()

  return (
    <SignalCampaignDetail
      campaign={campaign as SignalCampaign}
      candidates={(candidates || []) as SignalCampaignCandidate[]}
      prospects={(prospects || []) as SignalProspect[]}
    />
  )
}
