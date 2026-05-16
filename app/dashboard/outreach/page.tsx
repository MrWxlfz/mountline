import { createAdminClient } from "@/lib/supabase/admin"
import { auth } from "@clerk/nextjs/server"
import { Target, Plus, Globe, MapPin, ArrowRight } from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, string> = {
  not_contacted: "bg-muted text-muted-foreground",
  contacted: "bg-blue-500/10 text-blue-500",
  responded: "bg-yellow-500/10 text-yellow-500",
  meeting_scheduled: "bg-purple-500/10 text-purple-500",
  proposal_sent: "bg-orange-500/10 text-orange-500",
  won: "bg-green-500/10 text-green-500",
  lost: "bg-red-500/10 text-red-500",
}

export default async function OutreachPage() {
  const { userId } = await auth()
  if (!userId) return null

  const supabase = createAdminClient()
  const { data: prospects } = await supabase
    .from("potential_clients")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Outreach</h1>
          <p className="text-muted-foreground">Track potential clients and outreach efforts.</p>
        </div>
        <Link
          href="/dashboard/outreach/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Prospect
        </Link>
      </div>

      {/* Pipeline summary */}
      <div className="grid gap-3 sm:grid-cols-4">
        {["not_contacted", "contacted", "proposal_sent", "won"].map((status) => {
          const count = prospects?.filter((p: any) => p.outreach_status === status).length || 0
          return (
            <div key={status} className="bg-card border border-border rounded-lg p-4">
              <p className="text-xs text-muted-foreground capitalize mb-1">
                {status.replace(/_/g, " ")}
              </p>
              <p className="text-xl font-bold">{count}</p>
            </div>
          )
        })}
      </div>

      {prospects && prospects.length > 0 ? (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Business</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground hidden md:table-cell">Industry</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground hidden lg:table-cell">Location</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-left px-5 py-3 font-medium text-muted-foreground hidden sm:table-cell">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {prospects.map((prospect: any) => (
                <tr key={prospect.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                        <span className="text-xs font-bold">
                          {prospect.business_name?.charAt(0)?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium truncate">{prospect.business_name}</p>
                        {prospect.website && (
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Globe className="w-3 h-3" />
                            <span className="truncate">{prospect.website}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-muted-foreground">
                    {prospect.industry || "-"}
                  </td>
                  <td className="px-5 py-3.5 hidden lg:table-cell">
                    {(prospect.city || prospect.state) ? (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        <span>{[prospect.city, prospect.state].filter(Boolean).join(", ")}</span>
                      </div>
                    ) : "-"}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                      statusColors[prospect.outreach_status] || statusColors.not_contacted
                    }`}>
                      {prospect.outreach_status?.replace(/_/g, " ") || "not contacted"}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell text-muted-foreground">
                    {prospect.source || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Target className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <h3 className="font-semibold mb-1">No prospects yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Add businesses you want to reach out to and track your outreach pipeline.
          </p>
          <Link
            href="/dashboard/outreach/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Prospect
          </Link>
        </div>
      )}
    </div>
  )
}
