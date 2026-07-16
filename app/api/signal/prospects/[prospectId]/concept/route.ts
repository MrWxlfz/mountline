import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { buildSignalConceptPrompt } from "@/lib/signal/analysis-model"
import { signalConceptCreateSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalEvidenceLedgerItem, SignalProspect } from "@/lib/supabase/types"

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function record(value: unknown) {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {}
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
    supabase.from("signal_analyses").select("id").eq("prospect_id", prospectId).eq("is_current", true).is("stale_at", null).order("created_at", { ascending: false }).limit(1).maybeSingle(),
  ])
  if (prospectError) return NextResponse.json({ error: prospectError.message }, { status: 500 })
  if (!prospectData) return NextResponse.json({ error: "Signal lead not found." }, { status: 404 })
  const prospect = prospectData as SignalProspect
  const sufficiency = prospect.research_sufficiency && typeof prospect.research_sufficiency === "object" && !Array.isArray(prospect.research_sufficiency)
    ? prospect.research_sufficiency as Record<string, unknown>
    : {}
  const opportunity = sufficiency.opportunity && typeof sufficiency.opportunity === "object" && !Array.isArray(sufficiency.opportunity)
    ? sufficiency.opportunity as Record<string, unknown>
    : {}
  const identityReady = ["exact_match", "user_confirmed", "verified"].includes(prospect.identity_resolution_state || "unresolved")
  const conceptAvailability = record(record(prospect.action_availability).concept)
  const conceptAllowed = conceptAvailability.enabled === true
    || (identityReady && ["verification_outreach", "opportunity_outreach", "active_deal_support"].includes(prospect.assistance_mode || "") && prospect.verdict !== "skip")
    || (identityReady && prospect.verdict === "pursue" && opportunity.status === "sufficient")
  if (!conceptAllowed) {
    return NextResponse.json({ error: typeof conceptAvailability.reason === "string" ? conceptAvailability.reason : "Confirm the exact business before building a concept." }, { status: 409 })
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
  const generatedAt = new Date().toISOString()
  await supabase.from("signal_concepts").update({ status: "archived", is_current: false, stale_at: generatedAt, stale_reason: "Replaced by a newer concept prompt." }).eq("prospect_id", prospectId).eq("is_current", true)
  const { data: concept, error: conceptError } = await supabase.from("signal_concepts").insert({
    prospect_id: prospectId,
    analysis_id: analysisData?.id || null,
    status: "prompt_ready",
    generation_prompt: prompt,
    verified_facts: verifiedFacts,
    notes: parsed.data.instructions || null,
    created_by: authCheck.access.userId,
    identity_version: prospect.identity_version || 1,
    evidence_version: prospect.evidence_version || 1,
    website_version: prospect.website_version || 1,
    category_version: prospect.category_version || 1,
    prompt_version: "signal-concept-v4",
    input_snapshot: {
      canonical_name: prospect.canonical_name || prospect.business_name,
      public_address: prospect.public_address,
      public_phone: prospect.public_phone,
      industry: prospect.industry,
      website_url: prospect.website_url,
      instagram_url: prospect.instagram_url,
      facebook_url: prospect.facebook_url,
      provider_place_id: prospect.provider_place_id,
      chain_status: prospect.chain_status,
    },
    is_current: true,
  }).select().single()
  if (conceptError) return NextResponse.json({ error: conceptError.message }, { status: 500 })
  const nextPipelineStage = prospect.assistance_mode !== "verification_outreach" && ["found", "analyzed", "concept_ready"].includes(prospect.pipeline_stage || "found")
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
