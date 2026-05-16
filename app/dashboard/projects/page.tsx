"use client"

import { useState } from "react"
import { auth } from "@clerk/nextjs/server"
import { createClient } from "@/lib/supabase/server"
import { 
  Plus, 
  FolderKanban,
  ExternalLink,
  Calendar,
  MoreHorizontal,
  Grid,
  List
} from "lucide-react"
import Link from "next/link"

const statusColors: Record<string, string> = {
  active: "bg-green-500/10 text-green-500 border-green-500/20",
  completed: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  paused: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  archived: "bg-gray-500/10 text-gray-500 border-gray-500/20",
}

// Sample projects for demo
const sampleProjects = [
  {
    id: "1",
    name: "Apex Auto Detailing",
    description: "Full website redesign with booking system",
    status: "active",
    website_url: "https://apexauto.com",
    created_at: new Date().toISOString()
  },
  {
    id: "2",
    name: "Summit Contracting",
    description: "Landing page and quote system",
    status: "completed",
    website_url: "https://summitcontracting.com",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: "3",
    name: "FreshFit Gym",
    description: "Membership site with class scheduling",
    status: "active",
    website_url: null,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString()
  }
]

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const projects = sampleProjects // Using sample data for demo

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Projects</h1>
          <p className="text-muted-foreground">
            Manage your website projects and track progress.
          </p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* View toggle */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setViewMode("grid")}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === "grid" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          <Grid className="w-4 h-4" />
        </button>
        <button
          onClick={() => setViewMode("list")}
          className={`p-2 rounded-lg transition-colors ${
            viewMode === "list" 
              ? "bg-primary text-primary-foreground" 
              : "bg-muted hover:bg-muted/80"
          }`}
        >
          <List className="w-4 h-4" />
        </button>
      </div>

      {/* Projects grid/list */}
      {viewMode === "grid" ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <div
              key={project.id}
              className="bg-card rounded-xl border border-border p-6 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                  <FolderKanban className="w-5 h-5 text-primary" />
                </div>
                <button className="p-1.5 hover:bg-muted rounded-lg transition-colors">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </div>
              <h3 className="font-semibold mb-1">{project.name}</h3>
              <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                {project.description}
              </p>
              <div className="flex items-center justify-between">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[project.status]}`}>
                  {project.status}
                </span>
                {project.website_url && (
                  <a
                    href={project.website_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Visit
                  </a>
                )}
              </div>
            </div>
          ))}

          {/* Add new project card */}
          <button className="bg-card rounded-xl border border-dashed border-border p-6 hover:border-primary/50 hover:bg-muted/30 transition-colors flex flex-col items-center justify-center min-h-[200px]">
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center mb-3">
              <Plus className="w-5 h-5 text-muted-foreground" />
            </div>
            <span className="font-medium">Add New Project</span>
            <span className="text-sm text-muted-foreground">Start tracking a new website</span>
          </button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/50">
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                  Project
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                  Status
                </th>
                <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                  Created
                </th>
                <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-6 py-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {projects.map((project) => (
                <tr key={project.id} className="hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                        <FolderKanban className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-muted-foreground">{project.description}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${statusColors[project.status]}`}>
                      {project.status}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(project.created_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
