import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getOrCreateSupportThread, getPortalAccess } from "@/lib/portal/access"

export async function POST(
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

  const body = await request.json()
  const message = typeof body.message === "string" ? body.message.trim() : ""

  if (!message) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 })
  }

  if (message.length > 4000) {
    return NextResponse.json(
      { error: "Message must be 4,000 characters or fewer" },
      { status: 400 },
    )
  }

  const supabase = createAdminClient()
  const thread = await getOrCreateSupportThread(access.project.id)

  const { data, error } = await supabase
    .from("support_messages")
    .insert({
      thread_id: thread.id,
      project_id: access.project.id,
      sender_type: access.isTeamMember ? "team" : "client",
      sender_email: access.email || "unknown",
      message,
    })
    .select("id, created_at, thread_id, project_id, sender_type, sender_email, message")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: data })
}
