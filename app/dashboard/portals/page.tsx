import { createAdminClient } from "@/lib/supabase/admin"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import Link from "next/link"
import { Globe, ArrowUpRight, ExternalLink } from "lucide-react"
import { PortalCopyButton } from "./portal-copy-button"

export default async function PortalsPage() {
  await requireNorthlineTeamMember()
  const productionBaseUrl = process.env.NEXT_PUBLIC_SITE_URL || null

  const supabase = createAdminClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("*, clients(business_name, contact_name, email)")
    .not("portal_id", "is", null)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Client Portals</p>
          <h1 className="text-2xl font-bold tracking-tight">Portal Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Manage client-facing project portals. Each project gets a unique URL.
          </p>
        </div>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4">
          {projects.map((project: any) => {
            const portalUrl = `/portal/${project.portal_id}`
            return (
              <div
                key={project.id}
                className="flex items-center gap-4 p-5 bg-card rounded-xl border border-border hover:border-foreground/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center shrink-0">
                  <Globe className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{project.project_name}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {project.clients?.business_name || "No client"} &middot; {project.status}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <code className="hidden sm:block text-xs text-muted-foreground bg-muted px-2 py-1 rounded font-mono max-w-[200px] truncate">
                    {portalUrl}
                  </code>
                  <PortalCopyButton
                    portalPath={portalUrl}
                    productionBaseUrl={productionBaseUrl}
                  />
                  <Link
                    href={portalUrl}
                    target="_blank"
                    className="p-2 hover:bg-muted rounded-lg text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="p-12 text-center bg-card rounded-xl border border-border">
          <Globe className="w-10 h-10 mx-auto mb-3 text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground mb-4">
            No portals yet. Create a project to auto-generate a portal link.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 text-sm font-medium btn-primary !py-2.5 !px-4"
          >
            Create Project
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}
