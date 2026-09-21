import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import { uuidSchema } from "@/lib/projects/validation"

function getTeamSender(user: Awaited<ReturnType<typeof currentUser>>, userId: string, verifiedEmails: string[]) {
  const email = verifiedEmails[0] || `clerk-${userId}@identity.invalid`
  const name = user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(" ")

  return {
    email,
    name: name || "Mountline",
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ threadId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) {
    return authCheck.response
  }

  const { threadId } = await params
  if (!uuidSchema.safeParse(threadId).success) return NextResponse.json({ error: "Invalid support thread identifier." }, { status: 400 })
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
  const { data: thread, error: threadError } = await supabase
    .from("support_threads")
    .select("id, project_id")
    .eq("id", threadId)
    .maybeSingle()

  if (threadError) {
    console.error("[mountline] Support thread lookup failed", { code: threadError.code, message: threadError.message })
    return NextResponse.json({ error: "Support thread could not be loaded." }, { status: 500 })
  }

  if (!thread) {
    return NextResponse.json({ error: "Support thread not found" }, { status: 404 })
  }

  const user = await currentUser()
  const sender = getTeamSender(user, authCheck.access.userId, authCheck.access.emails)

  const { data, error } = await supabase
    .from("support_messages")
    .insert({
      thread_id: thread.id,
      project_id: thread.project_id,
      sender_type: "team",
      sender_email: sender.email,
      sender_clerk_user_id: authCheck.access.userId,
      sender_name: sender.name,
      read_at: new Date().toISOString(),
      message,
    })
    .select("id, created_at, thread_id, project_id, sender_type, sender_email, sender_name, read_at, message")
    .single()

  if (error) {
    console.error("[mountline] Team support reply failed", { code: error.code, message: error.message })
    return NextResponse.json({ error: "Reply could not be saved." }, { status: 500 })
  }

  await supabase
    .from("support_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("thread_id", thread.id)
    .eq("sender_type", "client")
    .is("read_at", null)

  return NextResponse.json({ message: data })
}
