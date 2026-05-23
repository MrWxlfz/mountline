import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ alertId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { alertId } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_alerts")
    .update({ read_at: new Date().toISOString() })
    .eq("id", alertId)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Alert not found" }, { status: 404 })

  return NextResponse.json({ alert: data })
}
