import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getOrCreateSupportThread, getPortalAccess } from "@/lib/portal/access"

function getDisplayName(user: Awaited<ReturnType<typeof currentUser>>, fallback: string, isTeamMember: boolean) {
  const name = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ")
  if (name) return name
  if (isTeamMember) return "Mountline"
  if (fallback && fallback !== "unknown" && !fallback.endsWith("@identity.invalid")) return fallback
  return "Client"
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

  if (access.status === "not_found" || access.status === "forbidden") {
    return NextResponse.json({ error: "Portal unavailable" }, { status: 404 })
  }

  if (access.status === "error") {
    return NextResponse.json({ error: "Portal access could not be verified" }, { status: 503 })
  }

  if (access.status !== "authorized") {
    return NextResponse.json({ error: "Portal unavailable" }, { status: 404 })
  }

  const body = await request.json().catch(() => null)
  const message = body && typeof body.message === "string" ? body.message.trim() : ""

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
  let thread
  try {
    thread = await getOrCreateSupportThread(access.project.id)
  } catch (error) {
    console.error("[portal] Support thread creation failed:", error)
    return NextResponse.json({ error: "Message could not be saved" }, { status: 500 })
  }
  const user = await currentUser()
  const senderEmail = access.email || `clerk-${access.userId}@identity.invalid`
  const senderName = getDisplayName(user, senderEmail, access.isTeamMember)

  const { data, error } = await supabase
    .from("support_messages")
    .insert({
      thread_id: thread.id,
      project_id: access.project.id,
      sender_type: access.isTeamMember ? "team" : "client",
      sender_email: senderEmail.toLowerCase(),
      sender_clerk_user_id: access.userId,
      sender_name: senderName,
      read_at: access.isTeamMember ? new Date().toISOString() : null,
      message,
    })
    .select("id, created_at, sender_type, sender_name, message")
    .single()

  if (error) {
    console.error("[portal] Support message insert failed:", error.message)
    return NextResponse.json({ error: "Message could not be saved" }, { status: 500 })
  }

  return NextResponse.json({
    message: {
      id: data.id,
      created_at: data.created_at,
      sender_type: data.sender_type,
      sender_name: data.sender_type === "team" ? "Mountline" : data.sender_name,
      is_own: data.sender_type === "client",
      message: data.message,
    },
  })
}
