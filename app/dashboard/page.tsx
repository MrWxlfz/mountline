import Link from "next/link"
import {
  ArrowUpRight,
  CalendarCheck,
  FolderKanban,
  Globe,
  Inbox,
  MessageSquare,
  RadioTower,
  Users,
} from "lucide-react"
import type { LucideIcon } from "lucide-react"
import {
  ActionRow,
  EmptyState,
  MetricStrip,
  PageHeader,
  PrimaryAction,
  SectionPanel,
  SecondaryAction,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"

async function getStats() {
  const supabase = createAdminClient()

  const today = new Date().toISOString().slice(0, 10)
  const [
    { count: leadsCount },
    { count: newLeadsCount },
    { count: projectsCount },
    { count: clientsCount },
    { count: portalsCount },
    { count: supportOpenCount },
    { count: signalFollowUpsDue },
    { count: signalReadyCount },
    { count: activeCampaignCount },
    { count: highFitAlertCount },
    { data: recentLeads },
    { data: recentProjects },
    { data: recentSupport },
  ] = await Promise.all([
    supabase.from("leads").select("*", { count: "exact", head: true }),
    supabase.from("leads").select("*", { count: "exact", head: true }).eq("status", "new"),
    supabase.from("projects").select("*", { count: "exact", head: true }),
    supabase.from("clients").select("*", { count: "exact", head: true }),
    supabase.from("projects").select("*", { count: "exact", head: true }).not("portal_id", "is", null),
    supabase.from("support_threads").select("*", { count: "exact", head: true }).eq("status", "open"),
    supabase
      .from("signal_prospects")
      .select("*", { count: "exact", head: true })
      .not("follow_up_date", "is", null)
      .lte("follow_up_date", today)
      .neq("outreach_status", "do_not_contact"),
    supabase
      .from("signal_prospects")
      .select("*", { count: "exact", head: true })
      .eq("outreach_status", "ready_to_contact"),
    supabase
      .from("signal_campaigns")
      .select("*", { count: "exact", head: true })
      .not("status", "in", "(complete,failed)"),
    supabase.from("signal_alerts").select("*", { count: "exact", head: true }).is("read_at", null),
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(5),
    supabase
      .from("projects")
      .select("*, clients(business_name)")
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("support_threads")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(3),
  ])

  return {
    activeCampaignCount: activeCampaignCount || 0,
    clientsCount: clientsCount || 0,
    highFitAlertCount: highFitAlertCount || 0,
    leadsCount: leadsCount || 0,
    newLeadsCount: newLeadsCount || 0,
    portalsCount: portalsCount || 0,
    projectsCount: projectsCount || 0,
    recentLeads: recentLeads || [],
    recentProjects: recentProjects || [],
    recentSupport: recentSupport || [],
    signalFollowUpsDue: signalFollowUpsDue || 0,
    signalReadyCount: signalReadyCount || 0,
    supportOpenCount: supportOpenCount || 0,
  }
}

function formatAge(value: string | null | undefined) {
  if (!value) return "unknown"
  const diff = Date.now() - new Date(value).getTime()
  const days = Math.max(0, Math.floor(diff / 86_400_000))
  if (days === 0) return "today"
  if (days === 1) return "1 day"
  return `${days} days`
}

function formatProjectDate(value: string | null | undefined) {
  if (!value) return "No target"
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" })
}

export default async function DashboardPage() {
  await requireNorthlineTeamMember()

  const stats = await getStats()
  const todayLabel = new Date().toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  })

  const attentionItems = [
    stats.newLeadsCount > 0 && {
      href: "/dashboard/leads",
      label: `${stats.newLeadsCount} new lead${stats.newLeadsCount === 1 ? "" : "s"} need review`,
      meta: "Qualify the request and decide whether to convert it into a project path.",
      tone: "blue" as const,
      action: "Review Leads",
    },
    stats.supportOpenCount > 0 && {
      href: "/dashboard/support",
      label: `${stats.supportOpenCount} support thread${stats.supportOpenCount === 1 ? "" : "s"} open`,
      meta: "Reply to client messages before opening new work.",
      tone: "amber" as const,
      action: "Open Support",
    },
    stats.signalFollowUpsDue > 0 && {
      href: "/dashboard/signal/focus",
      label: `${stats.signalFollowUpsDue} Signal follow-up${stats.signalFollowUpsDue === 1 ? "" : "s"} due`,
      meta: "Work through due follow-ups before starting new outreach.",
      tone: "green" as const,
      action: "Start Focus",
    },
    stats.highFitAlertCount > 0 && {
      href: "/dashboard/signal/alerts",
      label: `${stats.highFitAlertCount} high-fit Signal alert${stats.highFitAlertCount === 1 ? "" : "s"}`,
      meta: "Review the evidence and choose the next manual step.",
      tone: "blue" as const,
      action: "View Alerts",
    },
  ].filter(Boolean) as Array<{
    action: string
    href: string
    label: string
    meta: string
    tone: "blue" | "green" | "amber"
  }>

  const primaryHref =
    stats.newLeadsCount > 0
      ? "/dashboard/leads"
      : stats.signalFollowUpsDue > 0 || stats.signalReadyCount > 0
        ? "/dashboard/signal/focus"
        : stats.supportOpenCount > 0
          ? "/dashboard/support"
          : "/dashboard/signal"

  const primaryLabel =
    primaryHref === "/dashboard/leads"
      ? "Review Leads"
      : primaryHref === "/dashboard/signal/focus"
        ? "Start Focus Mode"
        : primaryHref === "/dashboard/support"
          ? "Open Support"
          : "Open Signal"

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Mountline OS"
        title="Command Center"
        subtitle="A focused operating view for leads, projects, portals, support, and Signal work that needs attention."
        meta={
          <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground">
            {todayLabel}
          </span>
        }
        actions={<PrimaryAction href={primaryHref} icon={ArrowUpRight}>{primaryLabel}</PrimaryAction>}
      />

      <SectionPanel
        title="Needs Attention"
        description="Actionable work across the business. Empty is good."
      >
        {attentionItems.length > 0 ? (
          <div className="space-y-2">
            {attentionItems.map((item) => (
              <ActionRow
                key={item.href}
                href={item.href}
                title={item.label}
                meta={
                  <span className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <StatusBadge tone={item.tone}>Priority</StatusBadge>
                    <span>{item.meta}</span>
                  </span>
                }
              >
                <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
                  {item.action}
                  <ArrowUpRight className="h-3.5 w-3.5" />
                </span>
              </ActionRow>
            ))}
          </div>
        ) : (
          <EmptyState title="Nothing urgent is waiting" icon={CalendarCheck}>
            New leads, open support, due follow-ups, and high-fit alerts will appear here when they need action.
          </EmptyState>
        )}
      </SectionPanel>

      <MetricStrip
        items={[
          { href: "/dashboard/leads", label: "Total leads", value: stats.leadsCount },
          { href: "/dashboard/projects", label: "Active projects", value: stats.projectsCount },
          { href: "/dashboard/clients", label: "Clients", value: stats.clientsCount },
          { href: "/dashboard/portals", label: "Portals", value: stats.portalsCount },
          { href: "/dashboard/support", label: "Open support", value: stats.supportOpenCount, tone: stats.supportOpenCount ? "amber" : "default" },
        ]}
      />

      <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
        <SectionPanel
          title="Active Projects"
          description="Current delivery work and its next visible milestone."
          action={<Link href="/dashboard/projects" className="text-sm text-muted-foreground hover:text-foreground">View all</Link>}
        >
          <div className="space-y-2">
            {stats.recentProjects.length > 0 ? (
              stats.recentProjects.map((project: any) => (
                <ActionRow
                  key={project.id}
                  href={`/dashboard/projects/${project.id}/edit`}
                  title={project.project_name}
                  meta={
                    <span className="grid gap-2 sm:grid-cols-4">
                      <span>{project.clients?.business_name || "No client"}</span>
                      <StatusBadge tone={project.status === "review" ? "amber" : project.status === "completed" ? "green" : "blue"}>
                        {project.status}
                      </StatusBadge>
                      <span>{project.next_step || "Update next step"}</span>
                      <span>{formatProjectDate(project.target_launch_date)}</span>
                    </span>
                  }
                >
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </ActionRow>
              ))
            ) : (
              <EmptyState title="No projects yet" icon={FolderKanban}>
                Create a project after a client is ready to begin.
              </EmptyState>
            )}
          </div>
        </SectionPanel>

        <SectionPanel
          title="Recent Leads"
          description="Newest form submissions and service requests."
          action={<Link href="/dashboard/leads" className="text-sm text-muted-foreground hover:text-foreground">View all</Link>}
        >
          <div className="space-y-2">
            {stats.recentLeads.length > 0 ? (
              stats.recentLeads.map((lead: any) => (
                <ActionRow
                  key={lead.id}
                  href="/dashboard/leads"
                  title={lead.business_name || lead.name || "Unnamed lead"}
                  meta={
                    <span className="flex flex-wrap items-center gap-2">
                      <span>{lead.service_needed || lead.email || "No service saved"}</span>
                      <StatusBadge tone={lead.status === "new" ? "blue" : lead.status === "contacted" ? "amber" : "default"}>
                        {lead.status || "new"}
                      </StatusBadge>
                      <span>{formatAge(lead.created_at)} old</span>
                    </span>
                  }
                >
                  <span className="text-sm text-muted-foreground">Review</span>
                </ActionRow>
              ))
            ) : (
              <EmptyState title="No leads yet" icon={Inbox}>
                New form submissions will appear here.
              </EmptyState>
            )}
          </div>
        </SectionPanel>
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        <SectionPanel
          title="Signal Snapshot"
          description="Manual prospecting work that is ready for review or follow-up."
          action={<SecondaryAction href="/dashboard/signal/focus" icon={RadioTower}>Start Focus Mode</SecondaryAction>}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <SnapshotLink href="/dashboard/signal/focus" label="Follow-ups due" value={stats.signalFollowUpsDue} />
            <SnapshotLink href="/dashboard/signal/focus" label="Ready-to-call prospects" value={stats.signalReadyCount} />
            <SnapshotLink href="/dashboard/signal/campaigns" label="Active campaigns" value={stats.activeCampaignCount} />
            <SnapshotLink href="/dashboard/signal/alerts" label="High-fit alerts" value={stats.highFitAlertCount} />
          </div>
        </SectionPanel>

        <SectionPanel
          title="Support Snapshot"
          description="Open client threads from the portal support foundation."
          action={<SecondaryAction href="/dashboard/support" icon={MessageSquare}>Open Inbox</SecondaryAction>}
        >
          {stats.recentSupport.length > 0 ? (
            <div className="space-y-2">
              {stats.recentSupport.map((thread: any) => (
                <ActionRow
                  key={thread.id}
                  href={`/dashboard/support/${thread.id}`}
                  title={`Support thread ${thread.id.slice(0, 8)}`}
                  meta={`Opened ${formatAge(thread.created_at)} ago`}
                />
              ))}
            </div>
          ) : (
            <EmptyState title="No open support threads" icon={MessageSquare}>
              Client support threads appear here when the inbox needs a response.
            </EmptyState>
          )}
        </SectionPanel>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <QuickLink href="/dashboard/clients" icon={Users} label="Clients" />
        <QuickLink href="/dashboard/projects" icon={FolderKanban} label="Projects" />
        <QuickLink href="/dashboard/portals" icon={Globe} label="Portals" />
        <QuickLink href="/dashboard/signal" icon={RadioTower} label="Signal" />
      </div>
    </div>
  )
}

function SnapshotLink({ href, label, value }: { href: string; label: string; value: number }) {
  return (
    <Link href={href} className="rounded-lg border border-border bg-muted/20 p-4 transition-colors hover:bg-muted/35">
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="mt-2 font-mono text-2xl font-semibold">{value}</p>
    </Link>
  )
}

function QuickLink({
  href,
  icon: Icon,
  label,
}: {
  href: string
  icon: LucideIcon
  label: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-3 text-sm font-medium transition-colors hover:border-foreground/20 hover:bg-muted/20"
    >
      <span className="inline-flex items-center gap-2">
        <Icon className="h-4 w-4 text-muted-foreground" />
        {label}
      </span>
      <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
    </Link>
  )
}
