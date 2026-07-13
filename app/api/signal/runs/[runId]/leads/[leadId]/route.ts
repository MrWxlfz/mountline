import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import {
  addSignalRunLeadObservation,
  correctSignalRunLead,
  signalRunLeadCorrectionSchema,
  signalRunLeadObservationSchema,
  updateSignalRunLeadDisposition,
} from "@/lib/signal/lead-runs"
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
  const [
    { data: lead, error: leadError },
    { data: evidence, error: evidenceError },
    { data: observations, error: observationsError },
    { data: corrections, error: correctionsError },
  ] =
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
      supabase
        .from("signal_run_lead_observations")
        .select("*")
        .eq("lead_id", leadId)
        .eq("run_id", runId)
        .order("created_at", { ascending: false })
        .limit(30),
      supabase
        .from("signal_run_lead_corrections")
        .select("*")
        .eq("lead_id", leadId)
        .eq("run_id", runId)
        .eq("active", true)
        .order("created_at", { ascending: false })
        .limit(30),
    ])

  if (leadError) return json({ error: leadError.message }, 500)
  if (evidenceError) return json({ error: evidenceError.message }, 500)
  if (observationsError) return json({ error: observationsError.message }, 500)
  if (correctionsError) return json({ error: correctionsError.message }, 500)
  if (!lead) return json({ error: "Lead not found." }, 404)

  return json({ lead, evidence: evidence || [], observations: observations || [], corrections: corrections || [] })
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ runId: string; leadId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const { leadId, runId } = await params
  const input = body && typeof body === "object" && !Array.isArray(body) ? body as Record<string, unknown> : {}
  try {
    if (input.action === "correction") {
      const parsed = signalRunLeadCorrectionSchema.safeParse(input)
      if (!parsed.success) return json({ error: parsed.error.issues[0]?.message || "Invalid correction." }, 400)
      const lead = await correctSignalRunLead({ runId, leadId, input: parsed.data, createdBy: authCheck.access.userId })
      return json({ lead, message: "Correction saved. Regenerate the sales pack to use it." })
    }
    if (input.action === "observation") {
      const parsed = signalRunLeadObservationSchema.safeParse(input)
      if (!parsed.success) return json({ error: parsed.error.issues[0]?.message || "Invalid observation." }, 400)
      const observation = await addSignalRunLeadObservation({ runId, leadId, input: parsed.data, createdBy: authCheck.access.userId })
      return json({ observation, message: "Private observation saved. Regenerate the sales pack to use it." })
    }
    const status = input.status
    if (status !== "saved" && status !== "ignored") return json({ error: "Lead status must be saved or rejected." }, 400)
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
