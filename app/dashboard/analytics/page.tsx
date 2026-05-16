import { createAdminClient } from "@/lib/supabase/admin"
import { auth } from "@clerk/nextjs/server"
import { TrendingUp, Users, Inbox, FolderKanban, Target } from "lucide-react"

export default async function AnalyticsPage() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminClient()

  const [
    { count: totalLeads },
    { count: newLeads },
    { count: activeProjects },
    { count: completedProjects },
    { count: totalClients },
    { count: outreachContacted },
    { data: leadsByService },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("projects").select("*", { count: "exact", head: true }).neq("status", "completed"),
    supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "completed"),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("potential_clients").select("*", { count: "exact", head: true }).neq("outreach_status", "not_contacted"),
    supabase.from("leads").select("service_needed"),
  ])

  // Group leads by service
  const serviceMap: Record<string, number> = {}
  leadsByService?.forEach((lead: any) => {
    const service = lead.service_needed || "Not specified"
    serviceMap[service] = (serviceMap[service] || 0) + 1
  })
  const serviceBreakdown = Object.entries(serviceMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)

  const metrics = [
    { label: "Total Leads", value: totalLeads || 0, icon: Inbox, sub: `${newLeads || 0} new` },
    { label: "Active Projects", value: activeProjects || 0, icon: FolderKanban, sub: `${completedProjects || 0} completed` },
    { label: "Total Clients", value: totalClients || 0, icon: Users, sub: "Active accounts" },
    { label: "Outreach Contacted", value: outreachContacted || 0, icon: Target, sub: "Responses pending" },
  ]

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Analytics</p>
        <h1 className="text-2xl font-bold tracking-tight">Performance</h1>
        <p className="text-sm text-muted-foreground mt-1">
          High-level metrics across all systems.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <div
            key={metric.label}
            className="p-5 bg-card rounded-xl border border-border"
          >
            <div className="flex items-center gap-2 mb-3">
              <metric.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{metric.label}</span>
            </div>
            <div className="text-3xl font-bold tracking-tight">{metric.value}</div>
            <p className="text-xs text-muted-foreground mt-1">{metric.sub}</p>
          </div>
        ))}
      </div>

      {/* Service breakdown */}
      <div className="bg-card rounded-xl border border-border">
        <div className="flex items-center gap-2 p-5 border-b border-border">
          <TrendingUp className="w-4 h-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm">Demand by Service</h2>
        </div>
        <div className="p-5">
          {serviceBreakdown.length > 0 ? (
            <div className="space-y-4">
              {serviceBreakdown.map(([service, count]) => {
                const percentage = Math.round((count / (totalLeads || 1)) * 100)
                return (
                  <div key={service}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium">{service}</span>
                      <span className="text-xs text-muted-foreground">{count} leads ({percentage}%)</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-foreground rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6">
              No lead data yet. Analytics will populate as leads come in.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
