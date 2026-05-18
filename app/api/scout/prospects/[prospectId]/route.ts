import { NextResponse } from "next/server"
import { z } from "zod"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"

const statusSchema = z.object({
  outreach_status: z.enum(["not_contacted", "reviewed", "contacted", "not_fit"]),
})

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json()
  const parsed = statusSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 })
  }

  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("scout_prospects")
    .update({ outreach_status: parsed.data.outreach_status })
    .eq("id", prospectId)
    .select()
    .maybeSingle()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: "Prospect not found" }, { status: 404 })
  }

  return NextResponse.json({ prospect: data })
}
