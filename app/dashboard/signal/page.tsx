import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalAlert, SignalAnalysis, SignalProspect } from "@/lib/supabase/types"
import { SignalDashboard } from "./signal-dashboard"

export type SignalProspectRow = SignalProspect & {
  latest_analysis: SignalAnalysis | null
  unread_alert: SignalAlert | null
}

async function getSignalRows(): Promise<SignalProspectRow[]> {
  const supabase = createAdminClient()
  const [{ data: prospects, error: prospectError }, { data: analyses }, { data: alerts }] =
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
    ])

  if (prospectError) {
    console.error("[signal] Prospect fetch failed:", prospectError.message)
    return []
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

  return ((prospects || []) as SignalProspect[]).map((prospect) => ({
    ...prospect,
    latest_analysis: latestAnalysisByProspect.get(prospect.id) || null,
    unread_alert: unreadAlertByProspect.get(prospect.id) || null,
  }))
}

export default async function SignalPage() {
  await requireNorthlineTeamMember()
  const rows = await getSignalRows()

  return <SignalDashboard initialRows={rows} />
}
