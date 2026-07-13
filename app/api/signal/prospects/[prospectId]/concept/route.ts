import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { buildSignalConceptPrompt } from "@/lib/signal/analysis-model"
import { signalConceptCreateSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalEvidenceLedgerItem, SignalProspect } from "@/lib/supabase/types"

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ prospectId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const parsed = signalConceptCreateSchema.safeParse(await request.json().catch(() => ({})))
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid concept direction." }, { status: 400 })
  }
  const { prospectId } = await params
  const supabase = createAdminClient()
  const [{ data: prospectData, error: prospectError }, { data: evidenceData }, { data: analysisData }] = await Promise.all([
    supabase.from("signal_prospects").select("*").eq("id", prospectId).maybeSingle(),
    supabase.from("signal_evidence_ledger").select("*").eq("prospect_id", prospectId).eq("evidence_category", "verified_public_fact").order("confidence", { ascending: false }).limit(20),
    supabase.from("signal_analyses").select("id").eq("prospect_id", prospectId).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ])
  if (prospectError) return NextResponse.json({ error: prospectError.message }, { status: 500 })
  if (!prospectData) return NextResponse.json({ error: "Signal lead not found." }, { status: 404 })
  const prospect = prospectData as SignalProspect
  if (prospect.verdict === "skip") {
    return NextResponse.json({ error: "Skip verdicts cannot create a concept until the evidence or verdict changes." }, { status: 409 })
  }
  const verifiedFacts = ((evidenceData || []) as SignalEvidenceLedgerItem[])
    .map((item) => item.claim_text)
    .filter((value, index, values) => values.indexOf(value) === index)
  const prompt = buildSignalConceptPrompt({
    businessName: prospect.business_name,
    industry: prospect.industry,
    primaryOpportunity: prospect.primary_opportunity || "Clarify the business's public information and contact path",
    smallestOffer: prospect.smallest_offer || "A small verified-information concept",
    verifiedFacts,
    unknowns: stringList(prospect.must_verify),
    customInstructions: parsed.data.instructions,
  })
  const { data: concept, error: conceptError } = await supabase.from("signal_concepts").insert({
    prospect_id: prospectId,
    analysis_id: analysisData?.id || null,
    status: "prompt_ready",
    generation_prompt: prompt,
    verified_facts: verifiedFacts,
    notes: parsed.data.instructions || null,
    created_by: authCheck.access.userId,
  }).select().single()
  if (conceptError) return NextResponse.json({ error: conceptError.message }, { status: 500 })
  const nextPipelineStage = ["found", "analyzed", "concept_ready"].includes(prospect.pipeline_stage || "found")
    ? "concept_ready"
    : prospect.pipeline_stage
  await Promise.all([
    supabase.from("signal_prospects").update({ concept_status: "prompt_ready", pipeline_stage: nextPipelineStage }).eq("id", prospectId),
    nextPipelineStage === "concept_ready" && prospect.pipeline_stage !== "concept_ready"
      ? supabase.from("signal_lead_stage_history").insert({
          prospect_id: prospectId,
          from_stage: prospect.pipeline_stage || "found",
          to_stage: "concept_ready",
          reason: "Concept prompt prepared.",
          created_by: authCheck.access.userId,
        })
      : Promise.resolve(),
    supabase.from("signal_lead_activities").insert({
      prospect_id: prospectId,
      activity_type: "concept_prompt_created",
      summary: parsed.data.instructions ? "The concept prompt was regenerated with Mountline direction." : "The concept prompt was prepared.",
      created_by: authCheck.access.userId,
    }),
  ])
  return NextResponse.json({ concept, pipeline_stage: nextPipelineStage })
}
