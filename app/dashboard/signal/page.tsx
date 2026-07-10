import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { getSignalLeadRunProviderSetup } from "@/lib/signal/lead-runs"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalAlert,
  SignalAnalysis,
  SignalCampaign,
  SignalCampaignCandidate,
  SignalMarket,
  SignalMarketCandidate,
  SignalRun,
  SignalRunEvent,
  SignalRunLead,
  SignalProspect,
} from "@/lib/supabase/types"
import { SignalLeadEngine } from "./signal-lead-engine"

export const dynamic = "force-dynamic"

const activeRunStatuses = new Set<SignalRun["status"]>([
  "queued",
  "discovering",
  "checking",
  "scoring",
  "writing_packs",
  "ranking",
])

// Kept as type-only compatibility exports for the legacy Signal dashboard.
// The rebuilt landing page no longer loads those unbounded datasets.
export type SignalProspectRow = SignalProspect & {
  latest_analysis: SignalAnalysis | null
  unread_alert: SignalAlert | null
}

export type SignalCampaignRow = SignalCampaign & {
  candidates: SignalCampaignCandidate[]
}

export type SignalMarketRow = SignalMarket & {
  candidates: SignalMarketCandidate[]
}

async function getLeadEngineData() {
  const supabase = createAdminClient()
  const [{ data: runs, error: runsError }, { data: savedLeads, error: savedLeadsError }] =
    await Promise.all([
      supabase.from("signal_runs").select("*").order("created_at", { ascending: false }).limit(12),
      supabase
        .from("signal_run_leads")
        .select("*")
        .eq("status", "saved")
        .order("updated_at", { ascending: false })
        .limit(5),
    ])

  if (runsError || savedLeadsError) {
    const error = runsError || savedLeadsError
    console.error("[signal] Lead-run summary fetch failed:", error?.message)
    return {
      activeEvents: [] as SignalRunEvent[],
      activeLeads: [] as SignalRunLead[],
      activeRun: null,
      runs: [] as SignalRun[],
      savedLeads: [] as SignalRunLead[],
      storageMessage: "Signal lead-run storage is not ready yet. Apply the Signal lead-run migrations, then refresh this page.",
    }
  }

  const typedRuns = (runs || []) as SignalRun[]
  const activeRun = typedRuns.find((run) => activeRunStatuses.has(run.status)) || null

  if (!activeRun) {
    return {
      activeEvents: [] as SignalRunEvent[],
      activeLeads: [] as SignalRunLead[],
      activeRun: null,
      runs: typedRuns,
      savedLeads: (savedLeads || []) as SignalRunLead[],
      storageMessage: null,
    }
  }

  const [{ data: activeEvents }, { data: activeLeads }] = await Promise.all([
    supabase
      .from("signal_run_events")
      .select("*")
      .eq("run_id", activeRun.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("signal_run_leads")
      .select("*")
      .eq("run_id", activeRun.id)
      .order("rank", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true })
      .limit(25),
  ])

  return {
    activeEvents: (activeEvents || []) as SignalRunEvent[],
    activeLeads: (activeLeads || []) as SignalRunLead[],
    activeRun,
    runs: typedRuns,
    savedLeads: (savedLeads || []) as SignalRunLead[],
    storageMessage: null,
  }
}

export default async function SignalPage() {
  await requireNorthlineTeamMember()
  const [data, providerSetup] = await Promise.all([
    getLeadEngineData(),
    Promise.resolve(getSignalLeadRunProviderSetup()),
  ])

  return (
    <SignalLeadEngine
      initialActiveEvents={data.activeEvents}
      initialActiveLeads={data.activeLeads}
      initialActiveRun={data.activeRun}
      initialRuns={data.runs}
      initialSavedLeads={data.savedLeads}
      providerSetup={providerSetup}
      storageMessage={data.storageMessage}
      userName="Luke"
    />
  )
}
