import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { 
  MessageSquare, 
  FolderKanban, 
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from "lucide-react"
import Link from "next/link"

async function getStats(userId: string) {
  const supabase = await createClient()
  
  // Get leads count
  const { count: leadsCount } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true })
  
  // Get projects count
  const { count: projectsCount } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("clerk_user_id", userId)
  
  // Get recent leads
  const { data: recentLeads } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)
  
  // Get recent activities
  const { data: recentActivities } = await supabase
    .from("activities")
    .select("*")
    .eq("clerk_user_id", userId)
    .order("created_at", { ascending: false })
    .limit(5)

  return {
    leadsCount: leadsCount || 0,
    projectsCount: projectsCount || 0,
    recentLeads: recentLeads || [],
    recentActivities: recentActivities || []
  }
}

export default async function DashboardPage() {
  const { userId } = await auth()
  
  if (!userId) {
    return null
  }

  const stats = await getStats(userId)

  const statCards = [
    {
      label: "Total Leads",
      value: stats.leadsCount,
      change: "+12%",
      changeType: "positive" as const,
      icon: MessageSquare,
      href: "/dashboard/leads"
    },
    {
      label: "Active Projects",
      value: stats.projectsCount,
      change: "+3",
      changeType: "positive" as const,
      icon: FolderKanban,
      href: "/dashboard/projects"
    },
    {
      label: "Conversion Rate",
      value: "24%",
      change: "+2.4%",
      changeType: "positive" as const,
      icon: TrendingUp,
      href: "/dashboard/leads"
    },
    {
      label: "Avg Response Time",
      value: "2.4h",
      change: "-18min",
      changeType: "positive" as const,
      icon: Clock,
      href: "/dashboard/leads"
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back. Here&apos;s an overview of your business.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group p-6 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-muted">
                <stat.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.changeType === "positive" ? "text-green-500" : "text-red-500"
              }`}>
                {stat.changeType === "positive" ? (
                  <ArrowUpRight className="w-3 h-3" />
                ) : (
                  <ArrowDownRight className="w-3 h-3" />
                )}
                {stat.change}
              </div>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Two column layout */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="font-semibold">Recent Leads</h2>
            <Link 
              href="/dashboard/leads"
              className="text-sm text-primary hover:underline"
            >
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {stats.recentLeads.length > 0 ? (
              stats.recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex items-center gap-4 p-4">
                  <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-sm font-medium">
                      {lead.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{lead.name}</p>
                    <p className="text-sm text-muted-foreground truncate">
                      {lead.email}
                    </p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(lead.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No leads yet</p>
                <p className="text-sm">Leads from your contact form will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-6 border-b border-border">
            <h2 className="font-semibold">Recent Activity</h2>
          </div>
          <div className="divide-y divide-border">
            {stats.recentActivities.length > 0 ? (
              stats.recentActivities.map((activity: any) => (
                <div key={activity.id} className="flex items-start gap-4 p-4">
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No activity yet</p>
                <p className="text-sm">Your recent actions will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-card rounded-xl border border-border p-6">
        <h2 className="font-semibold mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Link
            href="/dashboard/projects/new"
            className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <FolderKanban className="w-5 h-5 text-primary" />
            <span className="font-medium">New Project</span>
          </Link>
          <Link
            href="/dashboard/leads"
            className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <MessageSquare className="w-5 h-5 text-primary" />
            <span className="font-medium">View Leads</span>
          </Link>
          <Link
            href="/dashboard/team"
            className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <TrendingUp className="w-5 h-5 text-primary" />
            <span className="font-medium">Team Settings</span>
          </Link>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 p-4 rounded-lg bg-muted hover:bg-muted/80 transition-colors"
          >
            <Clock className="w-5 h-5 text-primary" />
            <span className="font-medium">Settings</span>
          </Link>
        </div>
      </div>
    </div>
  )
}
