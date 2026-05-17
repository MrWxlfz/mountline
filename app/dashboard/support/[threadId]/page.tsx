import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, MessageSquare } from "lucide-react"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import { SupportReplyForm } from "./support-reply-form"

function formatDateTime(date: string | null) {
  if (!date) return ""
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default async function SupportThreadPage({
  params,
}: {
  params: Promise<{ threadId: string }>
}) {
  await requireNorthlineTeamMember()

  const { threadId } = await params
  const supabase = createAdminClient()

  const { data: thread, error } = await supabase
    .from("support_threads")
    .select(`
      id,
      created_at,
      project_id,
      status,
      projects (
        id,
        project_name,
        status,
        portal_id,
        clients (
          business_name,
          contact_name,
          email
        )
      )
    `)
    .eq("id", threadId)
    .maybeSingle()

  if (error || !thread) {
    notFound()
  }

  const { data: messages } = await supabase
    .from("support_messages")
    .select("id, created_at, thread_id, project_id, sender_type, sender_email, sender_name, read_at, message")
    .eq("thread_id", thread.id)
    .order("created_at", { ascending: true })

  await supabase
    .from("support_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("thread_id", thread.id)
    .eq("sender_type", "client")
    .is("read_at", null)

  const project = Array.isArray(thread.projects) ? thread.projects[0] : thread.projects
  const client = Array.isArray(project?.clients) ? project.clients[0] : project?.clients

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/support"
          className="rounded-lg p-2 transition-colors hover:bg-muted"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div className="min-w-0">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Support thread
          </p>
          <h1 className="truncate text-2xl font-bold tracking-tight">
            {client?.business_name || project?.project_name || "Client support"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {project?.project_name || "No project"} &middot; {project?.status || "unknown"}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card">
        <div className="border-b border-border p-5">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-5 w-5 text-muted-foreground" />
            <div>
              <h2 className="font-semibold">Message history</h2>
              <p className="text-sm text-muted-foreground">
                Client messages and Mountline replies are separated by sender.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {messages && messages.length > 0 ? (
            messages.map((message: any) => {
              const isTeam = message.sender_type === "team"
              const isSystem = message.sender_type === "system"

              return (
                <div
                  key={message.id}
                  className={`flex ${isTeam ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl border p-4 ${
                      isTeam
                        ? "border-foreground/20 bg-foreground text-background"
                        : isSystem
                          ? "border-border bg-muted/50"
                          : "border-blue-500/25 bg-blue-500/10"
                    }`}
                  >
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-3">
                      <p className={`text-sm font-medium ${isTeam ? "text-background" : "text-foreground"}`}>
                        {isTeam ? "Mountline" : isSystem ? "System" : message.sender_name || "Client"}
                      </p>
                      <p className={`text-xs ${isTeam ? "text-background/70" : "text-muted-foreground"}`}>
                        {formatDateTime(message.created_at)}
                      </p>
                    </div>
                    <p className={`whitespace-pre-wrap text-sm leading-relaxed ${isTeam ? "text-background/85" : "text-muted-foreground"}`}>
                      {message.message}
                    </p>
                    {!isTeam && message.sender_email && (
                      <p className="mt-2 text-xs text-muted-foreground">
                        {message.sender_email}
                      </p>
                    )}
                  </div>
                </div>
              )
            })
          ) : (
            <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
              No messages in this thread yet.
            </div>
          )}
        </div>

        <div className="border-t border-border p-5">
          <SupportReplyForm threadId={thread.id} />
        </div>
      </section>
    </div>
  )
}
