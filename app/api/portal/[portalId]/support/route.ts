import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getOrCreateSupportThread, getPortalAccess } from "@/lib/portal/access"

function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>, fallback: string, isTeamMember: boolean) {
  const name = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ")
  if (name) return name
  if (fallback && fallback !== "unknown") return fallback
  return isTeamMember ? "Northline" : "Client"
}

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
  const user = await currentUser()
  const senderEmail = access.email || user?.emailAddresses?.[0]?.emailAddress || "unknown"
  const senderName = getDisplayName(user, senderEmail, access.isTeamMember)

  const { data, error } = await supabase
    .from("support_messages")
    .insert({
      thread_id: thread.id,
      project_id: access.project.id,
      sender_type: access.isTeamMember ? "team" : "client",
      sender_email: senderEmail.toLowerCase(),
      sender_name: senderName,
      read_at: access.isTeamMember ? new Date().toISOString() : null,
      message,
    })
    .select("id, created_at, thread_id, project_id, sender_type, sender_email, sender_name, read_at, message")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ message: data })
}
