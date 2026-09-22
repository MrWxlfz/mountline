import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createProjectSchema, firstValidationError } from "@/lib/projects/validation"
import { createAdminClient } from "@/lib/supabase/admin"

function makePortalId(projectName: string) {
  const slug = projectName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "project"
  return `${slug}-${crypto.randomUUID().slice(0, 8)}`
}

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = createProjectSchema.safeParse(body)
  if (!parsed.success) return NextResponse.json({ error: firstValidationError(parsed.error) }, { status: 400 })

  const input = parsed.data
  const supabase = createAdminClient()
  const { data, error } = await supabase.rpc("create_project_for_pilot", {
    p_idempotency_key: input.idempotency_key,
    p_project_name: input.project_name,
    p_client_id: input.client_id,
    p_package_type: input.package_type,
    p_status: input.status,
    p_portal_id: makePortalId(input.project_name),
    p_start_date: input.start_date,
    p_target_launch_date: input.target_launch_date,
    p_live_url: input.live_url,
    p_preview_url: input.preview_url,
    p_payment_link: input.payment_link,
    p_next_step: input.next_step,
    p_notes: input.notes,
    p_signal_id: input.signal_id,
    p_created_by: authCheck.access.userId,
  })

  if (error) {
    console.error("[mountline] Atomic project creation failed", { code: error.code, message: error.message })
    return NextResponse.json({ error: "Project creation could not be completed. Nothing was confirmed; retry with the same form." }, { status: 500 })
  }

  const project = Array.isArray(data) ? data[0] : data
  if (!project) {
    console.error("[mountline] Atomic project creation returned no project")
    return NextResponse.json({ error: "Project creation could not be confirmed." }, { status: 500 })
  }

  return NextResponse.json({ project }, { status: 201 })
}

export async function GET() {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const supabase = createAdminClient()
  const { data, error } = await supabase.from("projects").select("*, clients(business_name, contact_name, email)").order("created_at", { ascending: false })
  if (error) {
    console.error("[mountline] Project list failed", { code: error.code, message: error.message })
    return NextResponse.json({ error: "Projects could not be loaded." }, { status: 500 })
  }
  return NextResponse.json({ projects: data })
}
