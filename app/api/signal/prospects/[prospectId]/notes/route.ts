import { NextResponse } from "next/server"
import { z } from "zod"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"

const noteSchema = z.object({ note: z.string().trim().min(1).max(3000) })

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const body = await request.json().catch(() => null)
  const parsed = noteSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Add a note under 3,000 characters." }, { status: 400 })
  }
  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: prospect, error: prospectError } = await supabase
    .from("signal_prospects")
    .select("id")
    .eq("id", prospectId)
    .maybeSingle()
  if (prospectError) return NextResponse.json({ error: prospectError.message }, { status: 500 })
  if (!prospect) return NextResponse.json({ error: "Signal lead not found." }, { status: 404 })
  const { data, error } = await supabase.from("signal_evidence_ledger").insert({
    prospect_id: prospectId,
    evidence_category: "mountline_observation",
    evidence_tier: "mountline_private",
    claim_type: "private_note",
    claim_text: parsed.data.note,
    source_provider: "team_note",
    verification_status: "unknown",
    created_by: authCheck.access.userId,
  }).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  await supabase.from("signal_lead_activities").insert({
    prospect_id: prospectId,
    activity_type: "private_note_added",
    summary: "A private Mountline note was added.",
    metadata: {},
    created_by: authCheck.access.userId,
  })
  return NextResponse.json({ note: data }, { status: 201 })
}

