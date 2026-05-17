import { NextResponse } from "next/server"
import { currentUser } from "@clerk/nextjs/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"

function getTeamSender(user: Awaited<ReturnType<typeof currentUser>>) {
  const email = user?.emailAddresses?.[0]?.emailAddress?.trim().toLowerCase() || "unknown"
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
  const { data: thread, error: threadError } = await supabase
    .from("support_threads")
    .select("id, project_id")
    .eq("id", threadId)
    .maybeSingle()

  if (threadError) {
    return NextResponse.json({ error: threadError.message }, { status: 500 })
  }

  if (!thread) {
    return NextResponse.json({ error: "Support thread not found" }, { status: 404 })
  }

  const user = await currentUser()
  const sender = getTeamSender(user)

  const { data, error } = await supabase
    .from("support_messages")
    .insert({
      thread_id: thread.id,
      project_id: thread.project_id,
      sender_type: "team",
      sender_email: sender.email,
      sender_name: sender.name,
      read_at: new Date().toISOString(),
      message,
    })
    .select("id, created_at, thread_id, project_id, sender_type, sender_email, sender_name, read_at, message")
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  await supabase
    .from("support_messages")
    .update({ read_at: new Date().toISOString() })
    .eq("thread_id", thread.id)
    .eq("sender_type", "client")
    .is("read_at", null)

  return NextResponse.json({ message: data })
}
