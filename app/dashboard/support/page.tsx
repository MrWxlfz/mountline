import Link from "next/link"
import { MessageSquare, ArrowUpRight, Circle } from "lucide-react"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import { EmptyState, PageHeader, SectionPanel, StatusBadge } from "@/components/dashboard/dashboard-ui"

function formatDateTime(date: string | null) {
  if (!date) return "No messages yet"
  return new Date(date).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export default async function SupportInboxPage() {
  await requireNorthlineTeamMember()

  const supabase = createAdminClient()
  const { data: threads, error } = await supabase
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
    .eq("status", "open")
    .order("created_at", { ascending: false })

  const threadIds = threads?.map((thread: any) => thread.id) || []
  const { data: messages } = threadIds.length
    ? await supabase
        .from("support_messages")
        .select("id, created_at, thread_id, sender_type, sender_email, sender_name, read_at, message")
        .in("thread_id", threadIds)
        .order("created_at", { ascending: false })
    : { data: [] }

  const latestByThread = new Map<string, any>()
  const unreadByThread = new Map<string, number>()

  ;(messages || []).forEach((message: any) => {
    if (!latestByThread.has(message.thread_id)) {
      latestByThread.set(message.thread_id, message)
    }

    if (message.sender_type === "client" && !message.read_at) {
      unreadByThread.set(message.thread_id, (unreadByThread.get(message.thread_id) || 0) + 1)
    }
  })

  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Support" title="Support inbox" subtitle="Open client messages from assigned project portals. Reading this inbox never creates a support thread." />

      {error ? (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 p-4 text-sm text-red-400">
          Support threads could not be loaded: {error.message}
        </div>
      ) : threads && threads.length > 0 ? (
        <SectionPanel title="Open threads" description="Unread counts include client messages that have not been opened by the Mountline team."><div className="grid gap-3">
          {threads.map((thread: any) => {
            const project = Array.isArray(thread.projects) ? thread.projects[0] : thread.projects
            const client = Array.isArray(project?.clients) ? project.clients[0] : project?.clients
            const latest = latestByThread.get(thread.id)
            const unreadCount = unreadByThread.get(thread.id) || 0

            return (
              <Link
                key={thread.id}
                href={`/dashboard/support/${thread.id}`}
                className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-foreground/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-foreground/5">
                      <MessageSquare className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2 className="font-semibold truncate">
                          {client?.business_name || project?.project_name || "Support thread"}
                        </h2>
                        {unreadCount > 0 && (
                          <StatusBadge tone="blue"><Circle className="mr-1 h-2 w-2 fill-current" />{unreadCount} unread</StatusBadge>
                        )}
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {project?.project_name || "No project"} &middot; {project?.status || "unknown"}
                      </p>
                      <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                        {latest
                          ? `${latest.sender_type === "team" ? "Mountline" : latest.sender_name || "Client"}: ${latest.message}`
                          : "No support messages yet."}
                      </p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-xs text-muted-foreground">
                      {formatDateTime(latest?.created_at || thread.created_at)}
                    </p>
                    <ArrowUpRight className="ml-auto mt-3 h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                  </div>
                </div>
              </Link>
            )
          })}
        </div></SectionPanel>
      ) : (
        <EmptyState title="No open support threads" icon={MessageSquare}>Client portal messages appear here only after an assigned client starts or replies to a project support thread.</EmptyState>
      )}
    </div>
  )
}
