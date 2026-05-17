import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getPortalAccess } from "@/lib/portal/access"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ portalId: string }> },
) {
  const { portalId } = await params
  const access = await getPortalAccess(portalId)

  if (access.status === "unauthenticated") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (access.status === "not_found") {
    return NextResponse.json({ error: "Project not found" }, { status: 404 })
  }

  if (access.status === "forbidden") {
    return NextResponse.json(
      { error: "You do not have access to this project portal." },
      { status: 403 },
    )
  }

  const supabase = createAdminClient()
  const { data: thread } = await supabase
    .from("support_threads")
    .select("id, status")
    .eq("project_id", access.project.id)
    .eq("status", "open")
    .maybeSingle()

  const { data: messages, error: messagesError } = await supabase
    .from("support_messages")
    .select("id, created_at, thread_id, project_id, sender_type, sender_email, sender_name, read_at, message")
    .eq("project_id", access.project.id)
    .order("created_at", { ascending: true })

  if (messagesError) {
    return NextResponse.json({ error: messagesError.message }, { status: 500 })
  }

  return NextResponse.json({
    project: {
      ...access.project,
      client: access.project.clients,
    },
    supportThread: thread,
    supportMessages: messages || [],
    viewer: {
      email: access.email,
      isTeamMember: access.isTeamMember,
    },
  })
}
