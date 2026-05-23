import Link from "next/link"
import { ArrowLeft, Bell } from "lucide-react"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalAlert, SignalProspect } from "@/lib/supabase/types"
import { SignalAlertsList } from "./signal-alerts-list"

export type SignalAlertRow = SignalAlert & {
  prospect: SignalProspect | null
}

export default async function SignalAlertsPage() {
  await requireNorthlineTeamMember()
  const supabase = createAdminClient()
  const [{ data: alerts }, { data: prospects }] = await Promise.all([
    supabase.from("signal_alerts").select("*").order("created_at", { ascending: false }),
    supabase.from("signal_prospects").select("*"),
  ])

  const prospectsById = new Map(
    ((prospects || []) as SignalProspect[]).map((prospect) => [prospect.id, prospect]),
  )
  const rows: SignalAlertRow[] = ((alerts || []) as SignalAlert[]).map((alert) => ({
    ...alert,
    prospect: prospectsById.get(alert.prospect_id) || null,
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/signal" className="rounded-lg p-2 transition-colors hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Mountline Signal
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Alerts</h1>
          <p className="text-sm text-muted-foreground">
            Internal high-fit prospect alerts. These never send to prospects.
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5">
        <div className="mb-4 flex items-center gap-2">
          <Bell className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold">High-Fit Alerts</h2>
        </div>
        <SignalAlertsList initialRows={rows} />
      </div>
    </div>
  )
}
