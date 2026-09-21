import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import { leadIdSchema } from "@/lib/leads/validation"
import { updateLeadReview } from "@/lib/leads/review"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ leadId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) {
    return authCheck.response
  }

  const { leadId } = await params
  if (!leadIdSchema.safeParse(leadId).success) return NextResponse.json({ error: "Invalid inquiry identifier." }, { status: 400 })
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .maybeSingle()

  if (error) {
    console.error("[mountline] Inquiry lookup failed", { code: error.code })
    return NextResponse.json({ error: "Inquiry could not be loaded." }, { status: 500 })
  }

  if (!data) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 })
  }

  return NextResponse.json({ lead: data })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ leadId: string }> }) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { leadId } = await params
  const result = await updateLeadReview(leadId, await request.json().catch(() => null), async (id, status) => {
    const supabase = createAdminClient()
    const { data, error } = await supabase.from("leads").update({ status }).eq("id", id).select("id,status").maybeSingle()
    if (error) {
      console.error("[mountline] Inquiry review update failed", { code: error.code })
      throw error
    }
    return data
  })
  return NextResponse.json(result.body, { status: result.status })
}
