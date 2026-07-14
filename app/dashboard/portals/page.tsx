import Link from "next/link"
import { ExternalLink, Globe, Plus } from "lucide-react"
import { EmptyState, PageHeader, PrimaryAction, SectionPanel, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import { PortalCopyButton } from "./portal-copy-button"

export default async function PortalsPage() {
  await requireNorthlineTeamMember()
  const productionBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || null
  const supabase = createAdminClient()
  const { data: projects, error } = await supabase.from("projects").select("*, clients(business_name, contact_name, email), client_portal_access(id, client_email, access_status, clerk_user_id)").not("portal_id", "is", null).order("created_at", { ascending: false })
  const rows = projects || []
  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Portals" title="Client portals" subtitle="Project-linked portal routes and assigned client access. Portal authorization remains separate from the employee dashboard." actions={<PrimaryAction href="/dashboard/projects/new" icon={Plus}>New project</PrimaryAction>} />
      {error && <div className="rounded-lg border border-error-border bg-error-soft px-3 py-2 text-sm text-error-foreground">Portals could not be loaded: {error.message}</div>}
      <SectionPanel title="Portal access" description="A portal is created with its project. Access is limited to assigned client email records.">
        {rows.length ? <div className="space-y-3">{rows.map((project: any) => { const path = `/portal/${project.portal_id}`; const access = project.client_portal_access || []; return <article key={project.id} className="grid gap-4 rounded-lg border border-border bg-muted/15 p-4 lg:grid-cols-[1fr_1fr_auto] lg:items-center"><div><p className="font-medium">{project.project_name}</p><p className="mt-1 text-sm text-muted-foreground">{project.clients?.business_name || "No client assigned"}</p></div><div><p className="text-xs text-muted-foreground">Assigned access</p><div className="mt-1 flex flex-wrap gap-2">{access.length ? access.map((item: any) => <StatusBadge key={item.id} tone={item.access_status === "active" ? "green" : "default"}>{item.client_email} · {item.access_status}</StatusBadge>) : <StatusBadge tone="amber">No assigned client access</StatusBadge>}</div></div><div className="flex items-center gap-2"><PortalCopyButton portalPath={path} productionBaseUrl={productionBaseUrl} /><Link href={path} target="_blank" aria-label={`Open ${project.project_name} portal`} className="rounded-md border border-border p-2 text-muted-foreground hover:bg-muted hover:text-foreground"><ExternalLink className="h-4 w-4" /></Link></div></article>})}</div> : <EmptyState title="No project portals" icon={Globe} action={<PrimaryAction href="/dashboard/projects/new" icon={Plus}>New project</PrimaryAction>}>Create a project to generate a unique portal route and assign client access.</EmptyState>}
      </SectionPanel>
    </div>
  )
}
