"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { motion } from "framer-motion"
import { NorthlineLogo } from "@/components/northline-logo"
import { 
  ExternalLink, Clock, CheckCircle2, Circle, ArrowRight,
  Eye, MessageSquare, FileText, Loader2
} from "lucide-react"

type ProjectStatus = "discovery" | "design" | "build" | "review" | "launch" | "support" | "completed"

interface PortalProject {
  id: string
  project_name: string
  package_type: string | null
  status: ProjectStatus
  start_date: string | null
  target_launch_date: string | null
  live_url: string | null
  preview_url: string | null
  notes: string | null
  client: {
    business_name: string
    contact_name: string
  } | null
}

const STAGES: { key: ProjectStatus; label: string }[] = [
  { key: "discovery", label: "Discovery" },
  { key: "design", label: "Design" },
  { key: "build", label: "Build" },
  { key: "review", label: "Review" },
  { key: "launch", label: "Launch" },
  { key: "support", label: "Support" },
]

function getStageIndex(status: ProjectStatus): number {
  const idx = STAGES.findIndex(s => s.key === status)
  return idx >= 0 ? idx : 0
}

export default function PortalPage() {
  const { portalId } = useParams<{ portalId: string }>()
  const { user, isLoaded } = useUser()
  const [project, setProject] = useState<PortalProject | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !portalId) return

    async function fetchProject() {
      try {
        const res = await fetch(`/api/portal/${portalId}`)
        if (!res.ok) {
          const data = await res.json()
          setError(data.error || "Project not found")
          return
        }
        const data = await res.json()
        setProject(data.project)
      } catch {
        setError("Failed to load project")
      } finally {
        setLoading(false)
      }
    }

    fetchProject()
  }, [isLoaded, portalId])

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <NorthlineLogo size="md" />
          <h1 className="text-2xl font-bold text-foreground">Project not found</h1>
          <p className="text-muted-foreground">{error || "This portal link may be invalid or expired."}</p>
        </div>
      </div>
    )
  }

  const currentStage = getStageIndex(project.status)
  const isCompleted = project.status === "completed"

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <NorthlineLogo size="sm" />
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {user?.firstName || user?.emailAddresses?.[0]?.emailAddress}
            </span>
            <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-medium text-foreground">
              {(user?.firstName?.[0] || user?.emailAddresses?.[0]?.emailAddress?.[0] || "?").toUpperCase()}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Project title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-2"
        >
          <p className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
            Client Portal
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            {project.project_name}
          </h1>
          {project.client && (
            <p className="text-muted-foreground">
              {project.client.business_name} &middot; {project.package_type || "Custom"}
            </p>
          )}
        </motion.div>

        {/* Progress tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-card border border-border rounded-xl p-6 sm:p-8"
        >
          <h2 className="text-lg font-semibold text-foreground mb-6">Project Progress</h2>
          <div className="relative">
            {/* Progress line */}
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-border" />
            <div 
              className="absolute top-4 left-4 h-0.5 bg-foreground transition-all duration-700"
              style={{ width: `${isCompleted ? 100 : (currentStage / (STAGES.length - 1)) * 100}%` }}
            />
            
            {/* Steps */}
            <div className="relative flex justify-between">
              {STAGES.map((stage, i) => {
                const isPast = i < currentStage
                const isCurrent = i === currentStage && !isCompleted
                const isFuture = i > currentStage && !isCompleted

                return (
                  <div key={stage.key} className="flex flex-col items-center gap-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium z-10 transition-colors
                      ${isPast || isCompleted ? "bg-foreground text-background" : ""}
                      ${isCurrent ? "bg-foreground text-background ring-4 ring-foreground/20" : ""}
                      ${isFuture ? "bg-card border-2 border-border text-muted-foreground" : ""}
                    `}>
                      {isPast || isCompleted ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : isCurrent ? (
                        <Circle className="w-4 h-4 fill-current" />
                      ) : (
                        <span>{i + 1}</span>
                      )}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${
                      isCurrent ? "text-foreground" : "text-muted-foreground"
                    }`}>
                      {stage.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Current status message */}
          <div className="mt-8 p-4 rounded-lg bg-foreground/5 flex items-start gap-3">
            <Clock className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-foreground text-sm">
                {isCompleted ? "Project completed" : `Currently in ${STAGES[currentStage]?.label}`}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {isCompleted 
                  ? "Your project has been delivered. Thank you for choosing northline."
                  : project.notes || "We're making progress on your project. Check back for updates."
                }
              </p>
            </div>
          </div>
        </motion.div>

        {/* Quick info cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid sm:grid-cols-3 gap-4"
        >
          {project.preview_url && (
            <a
              href={project.preview_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card border border-border rounded-xl p-5 hover:border-foreground/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <Eye className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Preview Site</span>
              </div>
              <p className="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors flex items-center gap-1">
                View your draft <ExternalLink className="w-3 h-3" />
              </p>
            </a>
          )}

          {project.live_url && (
            <a
              href={project.live_url}
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-card border border-border rounded-xl p-5 hover:border-foreground/30 transition-colors"
            >
              <div className="flex items-center gap-3 mb-2">
                <ExternalLink className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">Live Site</span>
              </div>
              <p className="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors flex items-center gap-1">
                Visit your website <ArrowRight className="w-3 h-3" />
              </p>
            </a>
          )}

          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center gap-3 mb-2">
              <FileText className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Details</span>
            </div>
            <div className="space-y-1">
              {project.start_date && (
                <p className="text-xs text-muted-foreground">
                  Started: {new Date(project.start_date).toLocaleDateString()}
                </p>
              )}
              {project.target_launch_date && (
                <p className="text-xs text-muted-foreground">
                  Target: {new Date(project.target_launch_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <a
            href="mailto:hello@northline.dev"
            className="group bg-card border border-border rounded-xl p-5 hover:border-foreground/30 transition-colors"
          >
            <div className="flex items-center gap-3 mb-2">
              <MessageSquare className="w-4 h-4 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Contact</span>
            </div>
            <p className="text-xs text-muted-foreground group-hover:text-foreground/60 transition-colors">
              Questions? Reach out anytime.
            </p>
          </a>
        </motion.div>

        {/* Footer */}
        <div className="pt-8 border-t border-border/50 text-center">
          <p className="text-xs text-muted-foreground">
            Powered by northline &middot; {new Date().getFullYear()}
          </p>
        </div>
      </main>
    </div>
  )
}
