import { createAdminClient } from "@/lib/supabase/admin"
import { auth } from "@clerk/nextjs/server"
import { Sparkles, Lightbulb, TrendingUp, AlertCircle } from "lucide-react"

export default async function InsightsPage() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminClient()
  
  const [
    { data: insights },
    { count: leadsCount },
    { data: recentLeads }
  ] = await Promise.all([
    supabase.from("lead_insights").select("*, leads(name, email, service_needed)").order("created_at", { ascending: false }).limit(10),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("leads").select("service_needed").not("service_needed", "is", null),
  ])

  // Calculate service demand breakdown
  const serviceCounts: Record<string, number> = {}
  recentLeads?.forEach((lead: any) => {
    if (lead.service_needed) {
      serviceCounts[lead.service_needed] = (serviceCounts[lead.service_needed] || 0) + 1
    }
  })
  const topServices = Object.entries(serviceCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Insights</h1>
        <p className="text-muted-foreground">
          Automated analysis and recommendations for your pipeline.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-blue-500/10">
              <AlertCircle className="w-4 h-4 text-blue-500" />
            </div>
            <span className="text-sm font-medium">Unprocessed Leads</span>
          </div>
          <p className="text-2xl font-bold">{leadsCount || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Waiting for follow-up</p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <TrendingUp className="w-4 h-4 text-green-500" />
            </div>
            <span className="text-sm font-medium">Top Service</span>
          </div>
          <p className="text-2xl font-bold truncate">
            {topServices[0]?.[0] || "N/A"}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {topServices[0]?.[1] || 0} requests
          </p>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-lg bg-purple-500/10">
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <span className="text-sm font-medium">AI Analyses</span>
          </div>
          <p className="text-2xl font-bold">{insights?.length || 0}</p>
          <p className="text-xs text-muted-foreground mt-1">Generated insights</p>
        </div>
      </div>

      {/* Service demand */}
      {topServices.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h2 className="font-semibold mb-4">Service Demand</h2>
          <div className="space-y-3">
            {topServices.map(([service, count]) => {
              const max = topServices[0][1] as number
              const pct = Math.round((count / max) * 100)
              return (
                <div key={service} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium capitalize">{service.replace(/_/g, " ")}</span>
                    <span className="text-muted-foreground">{count}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full bg-foreground rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* AI Insights list */}
      <div className="bg-card border border-border rounded-xl">
        <div className="p-5 border-b border-border">
          <h2 className="font-semibold">Lead Insights</h2>
          <p className="text-sm text-muted-foreground">AI-generated analysis of incoming leads.</p>
        </div>
        <div className="divide-y divide-border">
          {insights && insights.length > 0 ? (
            insights.map((insight: any) => (
              <div key={insight.id} className="p-5 space-y-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-yellow-500" />
                    <span className="text-sm font-medium">
                      {insight.leads?.name || "Unknown Lead"}
                    </span>
                  </div>
                  {insight.urgency_score && (
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      insight.urgency_score >= 7 ? "bg-red-500/10 text-red-500" :
                      insight.urgency_score >= 4 ? "bg-yellow-500/10 text-yellow-500" :
                      "bg-muted text-muted-foreground"
                    }`}>
                      Urgency: {insight.urgency_score}/10
                    </span>
                  )}
                </div>
                {insight.summary && (
                  <p className="text-sm text-muted-foreground">{insight.summary}</p>
                )}
                {insight.suggested_offer && (
                  <div className="text-sm bg-foreground/5 rounded-lg p-3">
                    <span className="font-medium">Suggested offer: </span>
                    <span className="text-muted-foreground">{insight.suggested_offer}</span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-muted-foreground">
              <Sparkles className="w-10 h-10 mx-auto mb-3 opacity-40" />
              <h3 className="font-semibold mb-1 text-foreground">No insights yet</h3>
              <p className="text-sm">
                AI insights will be generated as leads come in. Connect an AI provider to enable automatic analysis.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
