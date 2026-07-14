import Link from "next/link"
import { ArrowRight, Mail, Plus, Users } from "lucide-react"
import { EmptyState, MetricStrip, PageHeader, PrimaryAction, SectionPanel, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"

export default async function ClientsPage() {
  await requireNorthlineTeamMember()
  const supabase = createAdminClient()
  const { data: clients, error } = await supabase.from("clients").select("*, projects(id, project_name, status, portal_id)").order("created_at", { ascending: false })
  const rows = clients || []
  const active = rows.filter((client: any) => client.status === "active").length
  const withProjects = rows.filter((client: any) => client.projects?.length).length
  const withPortals = rows.filter((client: any) => client.projects?.some((project: any) => project.portal_id)).length
  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Clients" title="Client records" subtitle="Account context, current projects, and portal readiness in one operating view." actions={<PrimaryAction href="/dashboard/clients/new" icon={Plus}>Add client</PrimaryAction>} />
      {error && <div className="rounded-lg border border-error-border bg-error-soft px-3 py-2 text-sm text-error-foreground">Clients could not be loaded: {error.message}</div>}
      <MetricStrip items={[{ label: "Total clients", value: rows.length }, { label: "Active", value: active, tone: "green" }, { label: "With projects", value: withProjects, tone: "blue" }, { label: "With portals", value: withPortals }]} />
      <SectionPanel title="Client directory" description="Project counts are live from the current client relationships.">
        {rows.length ? <div className="grid gap-3 lg:grid-cols-2">{rows.map((client: any) => <article key={client.id} className="rounded-lg border border-border bg-muted/15 p-4"><div className="flex items-start justify-between gap-3"><div><h2 className="font-semibold">{client.business_name}</h2><p className="mt-1 text-sm text-muted-foreground">{client.contact_name || "Contact name not set"}</p></div><StatusBadge tone={client.status === "active" ? "green" : "default"}>{client.status || "unknown"}</StatusBadge></div><div className="mt-4 grid gap-2 text-sm sm:grid-cols-2"><a href={`mailto:${client.email}`} className="flex items-center gap-2 truncate text-muted-foreground hover:text-foreground"><Mail className="h-3.5 w-3.5" />{client.email}</a><p className="text-muted-foreground">{client.phone || "Phone not set"}</p></div><div className="mt-4 border-t border-border pt-3"><div className="flex items-center justify-between"><p className="text-xs uppercase tracking-wider text-muted-foreground">Projects</p><Link href="/dashboard/projects" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground">View projects <ArrowRight className="h-3 w-3" /></Link></div>{client.projects?.length ? <div className="mt-2 flex flex-wrap gap-2">{client.projects.map((project: any) => <Link key={project.id} href={`/dashboard/projects/${project.id}/edit`} className="rounded-md border border-border px-2.5 py-1.5 text-xs hover:bg-muted">{project.project_name} · {project.status}</Link>)}</div> : <p className="mt-2 text-sm text-muted-foreground">No project assigned.</p>}</div></article>)}</div> : <EmptyState title="No client records" icon={Users} action={<PrimaryAction href="/dashboard/clients/new" icon={Plus}>Add client</PrimaryAction>}>Create a client after a lead is qualified, or add an existing relationship directly.</EmptyState>}
      </SectionPanel>
    </div>
  )
}
