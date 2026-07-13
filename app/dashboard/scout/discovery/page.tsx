import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { getSignalLeadRunProviderSetup } from "@/lib/signal/lead-runs"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalRun, SignalRunEvent, SignalRunLead } from "@/lib/supabase/types"
import { SignalLeadEngine } from "../../signal/signal-lead-engine"

export const dynamic = "force-dynamic"

const activeRunStatuses = new Set<SignalRun["status"]>([
  "queued",
  "discovering",
  "checking",
  "scoring",
  "writing_packs",
  "ranking",
])

async function getDiscoveryData() {
  const supabase = createAdminClient()
  const [{ data: runs, error: runsError }, { data: savedLeads, error: savedLeadsError }] = await Promise.all([
    supabase.from("signal_runs").select("*").order("created_at", { ascending: false }).limit(12),
    supabase.from("signal_run_leads").select("*").eq("status", "saved").order("updated_at", { ascending: false }).limit(5),
  ])
  if (runsError || savedLeadsError) {
    return {
      activeEvents: [] as SignalRunEvent[], activeLeads: [] as SignalRunLead[], activeRun: null,
      runs: [] as SignalRun[], savedLeads: [] as SignalRunLead[],
      storageMessage: "Scout discovery storage is not ready. Apply the Signal lead-run migrations, then refresh.",
    }
  }
  const typedRuns = (runs || []) as SignalRun[]
  const activeRun = typedRuns.find((run) => activeRunStatuses.has(run.status)) || null
  if (!activeRun) {
    return {
      activeEvents: [] as SignalRunEvent[], activeLeads: [] as SignalRunLead[], activeRun: null,
      runs: typedRuns, savedLeads: (savedLeads || []) as SignalRunLead[], storageMessage: null,
    }
  }
  const [{ data: activeEvents }, { data: activeLeads }] = await Promise.all([
    supabase.from("signal_run_events").select("*").eq("run_id", activeRun.id).order("created_at", { ascending: false }).limit(10),
    supabase.from("signal_run_leads").select("*").eq("run_id", activeRun.id).order("rank", { ascending: true, nullsFirst: false }).order("created_at", { ascending: true }).limit(25),
  ])
  return {
    activeEvents: (activeEvents || []) as SignalRunEvent[], activeLeads: (activeLeads || []) as SignalRunLead[],
    activeRun, runs: typedRuns, savedLeads: (savedLeads || []) as SignalRunLead[], storageMessage: null,
  }
}

export default async function ScoutDiscoveryPage() {
  await requireNorthlineTeamMember()
  const [data, providerSetup] = await Promise.all([
    getDiscoveryData(),
    Promise.resolve(getSignalLeadRunProviderSetup()),
  ])
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-yellow-500/25 bg-yellow-500/10 px-4 py-3 text-sm text-yellow-100">
        <p className="font-medium">Experimental Scout discovery</p>
        <p className="mt-1 text-yellow-100/75">City and map runs produce suggestions only. Open a suggestion in Signal before treating it as an operational lead.</p>
      </div>
      <SignalLeadEngine
        initialActiveEvents={data.activeEvents}
        initialActiveLeads={data.activeLeads}
        initialActiveRun={data.activeRun}
        initialRuns={data.runs}
        initialSavedLeads={data.savedLeads}
        providerSetup={providerSetup}
        storageMessage={data.storageMessage}
        userName="Mountline team"
      />
    </div>
  )
}

