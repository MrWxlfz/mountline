import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { signalConceptUpdateSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ conceptId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const body = await request.json().catch(() => null)
  const parsed = signalConceptUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid concept update." },
      { status: 400 },
    )
  }
  const { conceptId } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_concepts")
    .update(parsed.data)
    .eq("id", conceptId)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const prospectUpdate: Record<string, unknown> = { concept_status: parsed.data.status }
  if (parsed.data.status === "ready") prospectUpdate.pipeline_stage = "concept_ready"
  await supabase.from("signal_prospects").update(prospectUpdate).eq("id", data.prospect_id)
  return NextResponse.json({ concept: data })
}
