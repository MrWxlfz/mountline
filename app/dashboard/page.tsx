import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import { 
  Inbox, FolderKanban, Users, Globe,
  ArrowUpRight, MessageSquare
} from "lucide-react"
import Link from "next/link"

async function getStats() {
  const supabase = createAdminClient()
  
  const [
    { count: leadsCount },
    { count: projectsCount },
    { count: clientsCount },
    { count: portalsCount },
    { count: supportOpenCount },
    { data: recentLeads },
    { data: recentProjects }
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }).not("portal_id", "is", null),
    supabase.from("support_threads").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
    supabase.from("projects").select("*, clients(business_name)").order("created_at", { ascending: false }).limit(5),
  ])

  return {
    leadsCount: leadsCount || 0,
    projectsCount: projectsCount || 0,
    clientsCount: clientsCount || 0,
    portalsCount: portalsCount || 0,
    supportOpenCount: supportOpenCount || 0,
    recentLeads: recentLeads || [],
    recentProjects: recentProjects || []
  }
}

export default async function DashboardPage() {
  await requireNorthlineTeamMember()

  const stats = await getStats()

  const statCards = [
    { label: "Total Leads", value: stats.leadsCount, icon: Inbox, href: "/dashboard/leads" },
    { label: "Active Projects", value: stats.projectsCount, icon: FolderKanban, href: "/dashboard/projects" },
    { label: "Clients", value: stats.clientsCount, icon: Users, href: "/dashboard/clients" },
    { label: "Portals", value: stats.portalsCount, icon: Globe, href: "/dashboard/portals" },
    { label: "Open Support", value: stats.supportOpenCount, icon: MessageSquare, href: "/dashboard/support" },
  ]

  return (
    <div className="space-y-8">
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Mountline OS</p>
        <h1 className="text-2xl font-bold tracking-tight">Command Center</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Live overview of leads, clients, projects, and portals.
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group p-5 bg-card rounded-xl border border-border hover:border-foreground/20 transition-colors"
          >
            <div className="flex items-center justify-between mb-3">
              <stat.icon className="w-5 h-5 text-muted-foreground" />
              <ArrowUpRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-muted-foreground">{stat.label}</div>
          </Link>
        ))}
      </div>

      {/* Two column */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Leads */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold">Recent Leads</h2>
            <Link href="/dashboard/leads" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {stats.recentLeads.length > 0 ? (
              stats.recentLeads.map((lead: any) => (
                <div key={lead.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-full bg-foreground/5 flex items-center justify-center shrink-0">
                    <span className="text-sm font-medium">
                      {lead.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{lead.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{lead.service_needed || lead.email}</p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    lead.status === "new" ? "bg-blue-500/10 text-blue-500" :
                    lead.status === "contacted" ? "bg-yellow-500/10 text-yellow-500" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {lead.status || "new"}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No leads yet. They&apos;ll show up here once your form gets submissions.</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-card rounded-xl border border-border">
          <div className="flex items-center justify-between p-5 border-b border-border">
            <h2 className="font-semibold">Active Projects</h2>
            <Link href="/dashboard/projects" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
              View all
            </Link>
          </div>
          <div className="divide-y divide-border">
            {stats.recentProjects.length > 0 ? (
              stats.recentProjects.map((project: any) => (
                <div key={project.id} className="flex items-center gap-4 px-5 py-3.5">
                  <div className="w-9 h-9 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                    <FolderKanban className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{project.project_name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {project.clients?.business_name || "No client"}
                    </p>
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    project.status === "build" ? "bg-blue-500/10 text-blue-500" :
                    project.status === "review" ? "bg-yellow-500/10 text-yellow-500" :
                    project.status === "completed" ? "bg-green-500/10 text-green-500" :
                    "bg-muted text-muted-foreground"
                  }`}>
                    {project.status}
                  </span>
                </div>
              ))
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <FolderKanban className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No projects yet. Create one to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <Link
          href="/dashboard/clients"
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors"
        >
          <Users className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">Add Client</span>
        </Link>
        <Link
          href="/dashboard/projects"
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors"
        >
          <FolderKanban className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">New Project</span>
        </Link>
        <Link
          href="/dashboard/portals"
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors"
        >
          <Globe className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">View Portals</span>
        </Link>
        <Link
          href="/dashboard/leads"
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors"
        >
          <Inbox className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">Review Leads</span>
        </Link>
        <Link
          href="/dashboard/support"
          className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors"
        >
          <MessageSquare className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm font-medium">Open Support</span>
        </Link>
      </div>
    </div>
  )
}
