import { createAdminClient } from "@/lib/supabase/admin"
import { auth } from "@clerk/nextjs/server"
import { 
  Plus, FolderKanban, ExternalLink, Calendar,
  Link2, Copy
} from "lucide-react"
import Link from "next/link"

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
  const { userId } = await auth()
  if (!userId) return null

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
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project: any) => (
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

              {project.package_type && (
                <p className="text-xs text-muted-foreground mb-3">
                  Package: <span className="text-foreground">{project.package_type}</span>
                </p>
              )}

              <div className="flex items-center gap-3 pt-3 border-t border-border">
                {project.portal_id && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Link2 className="w-3 h-3" />
                    <span className="truncate max-w-[100px]">Portal link</span>
                  </div>
                )}
                {project.target_launch_date && (
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Calendar className="w-3 h-3" />
                    <span>{new Date(project.target_launch_date).toLocaleDateString()}</span>
                  </div>
                )}
                {project.live_url && (
                  <a
                    href={project.live_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground ml-auto"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Live
                  </a>
                )}
              </div>
            </div>
          ))}
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
    </div>
  )
}
