import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalAlert,
  SignalAnalysis,
  SignalCampaign,
  SignalCampaignCandidate,
  SignalOutreachEvent,
  SignalProspect,
} from "@/lib/supabase/types"
import { SignalDashboard } from "./signal-dashboard"

export type SignalProspectRow = SignalProspect & {
  latest_analysis: SignalAnalysis | null
  unread_alert: SignalAlert | null
}

export type SignalCampaignRow = SignalCampaign & {
  candidates: SignalCampaignCandidate[]
}

async function getSignalData(): Promise<{
  campaigns: SignalCampaignRow[]
  events: SignalOutreachEvent[]
  rows: SignalProspectRow[]
}> {
  const supabase = createAdminClient()
  const [
    { data: prospects, error: prospectError },
    { data: analyses },
    { data: alerts },
    { data: campaigns },
    { data: candidates },
    { data: events },
  ] =
    await Promise.all([
      supabase
        .from("signal_prospects")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("signal_analyses")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("signal_alerts")
        .select("*")
        .is("read_at", null)
        .order("created_at", { ascending: false }),
      supabase
        .from("signal_campaigns")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("signal_campaign_candidates")
        .select("*")
        .order("created_at", { ascending: false }),
      supabase
        .from("signal_outreach_events")
        .select("*")
        .order("created_at", { ascending: false }),
    ])

  if (prospectError) {
    console.error("[signal] Prospect fetch failed:", prospectError.message)
    return { campaigns: [], events: [], rows: [] }
  }

  const latestAnalysisByProspect = new Map<string, SignalAnalysis>()
  ;((analyses || []) as SignalAnalysis[]).forEach((analysis) => {
    if (!latestAnalysisByProspect.has(analysis.prospect_id)) {
      latestAnalysisByProspect.set(analysis.prospect_id, analysis)
    }
  })

  const unreadAlertByProspect = new Map<string, SignalAlert>()
  ;((alerts || []) as SignalAlert[]).forEach((alert) => {
    if (!unreadAlertByProspect.has(alert.prospect_id)) {
      unreadAlertByProspect.set(alert.prospect_id, alert)
    }
  })

  const rows = ((prospects || []) as SignalProspect[]).map((prospect) => ({
    ...prospect,
    latest_analysis: latestAnalysisByProspect.get(prospect.id) || null,
    unread_alert: unreadAlertByProspect.get(prospect.id) || null,
  }))

  const candidatesByCampaign = new Map<string, SignalCampaignCandidate[]>()
  ;((candidates || []) as SignalCampaignCandidate[]).forEach((candidate) => {
    candidatesByCampaign.set(candidate.campaign_id, [
      ...(candidatesByCampaign.get(candidate.campaign_id) || []),
      candidate,
    ])
  })

  const campaignRows = ((campaigns || []) as SignalCampaign[]).map((campaign) => ({
    ...campaign,
    candidates: candidatesByCampaign.get(campaign.id) || [],
  }))

  return {
    campaigns: campaignRows,
    events: (events || []) as SignalOutreachEvent[],
    rows,
  }
}

export default async function SignalPage() {
  await requireNorthlineTeamMember()
  const data = await getSignalData()

  return (
    <SignalDashboard
      campaigns={data.campaigns}
      events={data.events}
      initialRows={data.rows}
    />
  )
}
