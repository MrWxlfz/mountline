import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { buildSignalCopilotInputFromProspect } from "@/lib/signal/artifacts"
import { buildSignalCopilotState, type SignalProviderIssue } from "@/lib/signal/copilot"
import { signalPipelineUpdateSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalEvidenceLedgerItem, SignalProspect } from "@/lib/supabase/types"

const outreachStatusByStage = {
  found: "researched",
  analyzed: "needs_review",
  concept_ready: "ready_to_contact",
  contacted: "contacted",
  interested: "interested",
  proposal: "proposal_sent",
  won: "won",
  lost: "lost",
} as const

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const body = await request.json().catch(() => null)
  const parsed = signalPipelineUpdateSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid pipeline update." },
      { status: 400 },
    )
  }
  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: existing, error: existingError } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()
  if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 })
  if (!existing) return NextResponse.json({ error: "Signal lead not found." }, { status: 404 })
  const prospect = existing as SignalProspect
  const nextStage = parsed.data.pipeline_stage
  const nextAction = Object.prototype.hasOwnProperty.call(body, "next_action")
    ? parsed.data.next_action || null
    : prospect.next_action
  const nextActionDueAt = Object.prototype.hasOwnProperty.call(body, "next_action_due_at")
    ? parsed.data.next_action_due_at || null
    : prospect.next_action_due_at
  const { data, error } = await supabase
    .from("signal_prospects")
    .update({
      pipeline_stage: nextStage,
      outreach_status: outreachStatusByStage[nextStage],
      next_action: nextAction,
      next_action_due_at: nextActionDueAt,
      contacted_at: nextStage === "contacted" && !prospect.contacted_at
        ? new Date().toISOString()
        : prospect.contacted_at,
      concept_status: nextStage === "concept_ready" && prospect.concept_status === "prompt_ready"
        ? "ready"
        : prospect.concept_status,
    })
    .eq("id", prospectId)
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  const { data: evidenceData } = await supabase.from("signal_evidence_ledger").select("*").eq("prospect_id", prospectId).order("created_at", { ascending: false })
  const updatedProspect = data as SignalProspect
  const providerIssues = Array.isArray(updatedProspect.provider_limitations)
    ? updatedProspect.provider_limitations as unknown as SignalProviderIssue[]
    : []
  const copilotInput = {
    ...buildSignalCopilotInputFromProspect({
      prospect: updatedProspect,
      evidence: (evidenceData || []) as SignalEvidenceLedgerItem[],
      providerIssues,
    }),
    explicitDecline: nextStage === "lost",
  }
  const copilotState = buildSignalCopilotState(copilotInput)
  await supabase.from("signal_prospects").update({
    assistance_mode: copilotState.assistance_mode,
    executive_recommendation: copilotState.recommendation,
    next_action: Object.prototype.hasOwnProperty.call(body, "next_action") ? nextAction : copilotState.next_action.exact_instruction,
    next_action_plan: copilotState.next_action,
    action_availability: copilotState.action_availability,
  }).eq("id", prospectId)

  if (nextStage !== prospect.pipeline_stage) {
    await supabase.from("signal_lead_stage_history").insert({
      prospect_id: prospectId,
      from_stage: prospect.pipeline_stage,
      to_stage: nextStage,
      reason: parsed.data.reason || "Pipeline stage updated manually.",
      created_by: authCheck.access.userId,
    })
    await supabase.from("signal_lead_activities").insert({
      prospect_id: prospectId,
      activity_type: "stage_changed",
      summary: `Pipeline stage changed from ${prospect.pipeline_stage} to ${nextStage}.`,
      metadata: { from_stage: prospect.pipeline_stage, to_stage: nextStage },
      created_by: authCheck.access.userId,
    })
  }
  if (nextAction !== prospect.next_action || nextActionDueAt !== prospect.next_action_due_at) {
    await supabase.from("signal_lead_activities").insert({
      prospect_id: prospectId,
      activity_type: "next_action_updated",
      summary: nextAction ? `Next action updated: ${nextAction}` : "The next action was cleared.",
      metadata: { due_at: nextActionDueAt },
      created_by: authCheck.access.userId,
    })
  }
  return NextResponse.json({ prospect: { ...updatedProspect, assistance_mode: copilotState.assistance_mode, next_action: Object.prototype.hasOwnProperty.call(body, "next_action") ? nextAction : copilotState.next_action.exact_instruction } })
}
