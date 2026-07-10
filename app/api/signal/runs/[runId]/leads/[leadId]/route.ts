import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { updateSignalRunLeadDisposition } from "@/lib/signal/lead-runs"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic"
export const revalidate = 0

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
}

function json(payload: unknown, status = 200) {
  return NextResponse.json(payload, { status, headers: NO_STORE_HEADERS })
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string; leadId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { leadId, runId } = await params
  const supabase = createAdminClient()
  const [{ data: lead, error: leadError }, { data: evidence, error: evidenceError }] =
    await Promise.all([
      supabase
        .from("signal_run_leads")
        .select("*")
        .eq("id", leadId)
        .eq("run_id", runId)
        .maybeSingle(),
      supabase
        .from("signal_run_lead_evidence")
        .select("*")
        .eq("lead_id", leadId)
        .eq("run_id", runId)
        .order("created_at", { ascending: true })
        .limit(40),
    ])

  if (leadError) return json({ error: leadError.message }, 500)
  if (evidenceError) return json({ error: evidenceError.message }, 500)
  if (!lead) return json({ error: "Lead not found." }, 404)

  return json({ lead, evidence: evidence || [] })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ runId: string; leadId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const status =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>).status
      : null

  if (status !== "saved" && status !== "ignored") {
    return json({ error: "Lead status must be saved or ignored." }, 400)
  }

  const { leadId, runId } = await params
  try {
    const result = await updateSignalRunLeadDisposition({
      runId,
      leadId,
      status,
    })

    return json({ lead: result.lead })
  } catch (error) {
    console.error("[signal] Lead disposition update failed:", error)
    const message = errorMessage(error, "Signal could not update this lead.")
    return json({ error: message }, /not found/i.test(message) ? 404 : 500)
  }
}
