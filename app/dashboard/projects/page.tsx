import { createAdminClient } from "@/lib/supabase/admin"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import type { ReactNode } from "react"
import { 
  Plus, FolderKanban, Calendar, CreditCard, FileText
} from "lucide-react"
import Link from "next/link"
import { ProjectLinkActions } from "./project-link-actions"

const statusColors: Record<string, string> = {
  discovery: "bg-muted text-muted-foreground",
  design: "bg-purple-500/10 text-purple-500",
  build: "bg-blue-500/10 text-blue-500",
  review: "bg-yellow-500/10 text-yellow-500",
  launch: "bg-orange-500/10 text-orange-500",
  support: "bg-green-500/10 text-green-500",
  completed: "bg-green-500/10 text-green-500",
}

export default async function ProjectsPage() {
  await requireNorthlineTeamMember()

  const supabase = createAdminClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("*, clients(business_name, contact_name)")
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage website projects and client portals.
          </p>
        </div>
        <Link
          href="/dashboard/projects/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Project
        </Link>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {projects.map((project: any) => {
            const portalPath = project.portal_id ? `/portal/${project.portal_id}` : null

            return (
              <div
                key={project.id}
                className="bg-card rounded-xl border border-border p-5 hover:border-foreground/20 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                    <FolderKanban className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${
                    statusColors[project.status] || statusColors.discovery
                  }`}>
                    {project.status}
                  </span>
                </div>

                <h3 className="font-semibold mb-1">{project.project_name}</h3>
                <p className="text-sm text-muted-foreground mb-3">
                  {project.clients?.business_name || "No client assigned"}
                </p>

                <div className="grid gap-2 sm:grid-cols-2 mb-4">
                  {project.package_type && (
                    <ProjectMeta icon={<FileText className="w-3 h-3" />} label="Package" value={project.package_type} />
                  )}
                  {project.target_launch_date && (
                    <ProjectMeta
                      icon={<Calendar className="w-3 h-3" />}
                      label="Target"
                      value={new Date(project.target_launch_date).toLocaleDateString()}
                    />
                  )}
                  {project.payment_link && (
                    <ProjectMeta icon={<CreditCard className="w-3 h-3" />} label="Payment" value="Link added" />
                  )}
                </div>

                {project.next_step && (
                  <div className="rounded-lg bg-muted/40 p-3 mb-4">
                    <p className="text-xs font-medium text-muted-foreground mb-1">Next step</p>
                    <p className="text-sm text-foreground line-clamp-2">{project.next_step}</p>
                  </div>
                )}

                <ProjectLinkActions
                  portalPath={portalPath}
                  previewUrl={project.preview_url}
                  liveUrl={project.live_url}
                  paymentLink={project.payment_link}
                />
              </div>
            )
          })}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FolderKanban className="w-10 h-10 mx-auto mb-3 text-muted-foreground opacity-40" />
          <h3 className="font-semibold mb-1">No projects yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create a project to start tracking progress and generate client portal links.
          </p>
          <Link
            href="/dashboard/projects/new"
            className="inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Project
          </Link>
        </div>
      )}

      <div className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">
        TODO: Add a focused project edit screen for status, payment link, next step, and portal access updates.
      </div>
    </div>
  )
}

function ProjectMeta({
  icon,
  label,
  value,
}: {
  icon: ReactNode
  label: string
  value: string
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      {icon}
      <span>{label}:</span>
      <span className="text-foreground truncate">{value}</span>
    </div>
  )
}
