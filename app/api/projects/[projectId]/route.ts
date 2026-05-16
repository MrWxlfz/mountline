import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"

const allowedStatuses = new Set([
  "discovery",
  "design",
  "build",
  "review",
  "launch",
  "support",
  "completed",
])

function nullableText(value: unknown) {
  if (typeof value !== "string") return null
  const trimmed = value.trim()
  return trimmed || null
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ projectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) {
    return authCheck.response
  }

  const { projectId } = await params
  const body = await request.json()
  const status = typeof body.status === "string" ? body.status : "discovery"

  if (!allowedStatuses.has(status)) {
    return NextResponse.json({ error: "Invalid project status" }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("projects")
    .update({
      status,
      preview_url: nullableText(body.preview_url),
      live_url: nullableText(body.live_url),
      payment_link: nullableText(body.payment_link),
      next_step: nullableText(body.next_step),
      target_launch_date: nullableText(body.target_launch_date),
      notes: nullableText(body.notes),
    })
    .eq("id", projectId)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ project: data })
}
