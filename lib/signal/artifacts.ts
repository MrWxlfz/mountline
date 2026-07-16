import "server-only"

import {
  affectedSignalArtifacts,
  buildSignalCopilotState,
  signalIdentitySnapshot,
  staleReasonForSignalArtifacts,
  type SignalCopilotInput,
  type SignalIdentityField,
  type SignalProviderIssue,
} from "./copilot"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalEvidenceLedgerItem,
  SignalProspect,
} from "@/lib/supabase/types"

type SignalDatabaseResult = { error?: { message: string } | null } | null | undefined

function assertSignalDatabaseWrites(results: unknown[], operation: string) {
  const failed = results.find((result) => {
    const candidate = result as SignalDatabaseResult
    return Boolean(candidate && typeof candidate === "object" && candidate.error)
  }) as SignalDatabaseResult
  if (failed?.error) throw new Error(`${operation}: ${failed.error.message}`)
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

export function signalProspectVersions(prospect: SignalProspect) {
  return {
    identity_version: prospect.identity_version || 1,
    evidence_version: prospect.evidence_version || 1,
    website_version: prospect.website_version || 1,
    category_version: prospect.category_version || 1,
  }
}

export function providerIssueFromSignalWarning(warning: string | null | undefined): SignalProviderIssue | null {
  if (!warning) return null
  const lower = warning.toLowerCase()
  const provider = lower.includes("google") || lower.includes("places") || lower.includes("geocod")
    ? "Google Places"
    : lower.includes("firecrawl")
      ? "Firecrawl"
      : lower.includes("tavily")
        ? "Tavily"
        : lower.includes("browserless")
          ? "Browserless"
          : lower.includes("openai") || lower.includes("gemini") || lower.includes("ai ")
            ? "AI generation"
            : lower.includes("database") || lower.includes("supabase")
              ? "Database"
              : "Research provider"
  const errorCategory: SignalProviderIssue["error_category"] = /key|auth|credential|401|403/.test(lower)
    ? "authentication"
    : /disabled|configuration|configured|setup/.test(lower)
      ? "configuration"
      : /timeout|timed out/.test(lower)
        ? "timeout"
        : /rate|429/.test(lower)
          ? "rate_limit"
          : /network|dns|connect/.test(lower)
            ? "network"
            : provider === "Database"
              ? "database"
              : "provider"
  return {
    provider,
    operation: provider === "Google Places" ? "Business and website discovery" : "Public research",
    status: "degraded",
    error_category: errorCategory,
    user_explanation: `${provider} was unavailable for part of this analysis. Signal used the remaining matching identity, listing, phone, address, and public-source evidence.`,
    retryable: !["authentication", "configuration"].includes(errorCategory),
    effect_on_analysis: provider === "Google Places"
      ? "Website discovery, structured category, or listing confirmation may be less complete."
      : "One research source was unavailable; business uncertainty is tracked separately.",
    last_successful_use: null,
  }
}

export function buildSignalCopilotInputFromProspect(input: {
  prospect: SignalProspect
  evidence?: SignalEvidenceLedgerItem[]
  providerIssues?: SignalProviderIssue[]
  opportunityScore?: number | null
  strongExistingSite?: boolean
}) : SignalCopilotInput {
  const accepted = (input.evidence || []).filter((item) => item.decision_status !== "rejected" && item.evidence_category === "verified_public_fact")
  const rejected = (input.evidence || []).filter((item) => item.decision_status === "rejected" || item.evidence_category === "rejected_source")
  const verifiedServices = accepted
    .filter((item) => /service/i.test(item.claim_type))
    .map((item) => item.claim_text)
  return {
    businessName: input.prospect.display_name || input.prospect.canonical_name || input.prospect.business_name,
    address: input.prospect.public_address,
    phone: input.prospect.public_phone,
    email: input.prospect.public_email,
    contactFormUrl: input.prospect.public_contact_form_url,
    city: input.prospect.city,
    state: input.prospect.state,
    category: input.prospect.industry,
    identityState: input.prospect.identity_resolution_state,
    locationType: input.prospect.business_location_type,
    websiteStatus: input.prospect.website_url ? "verified_official_website" : "website_unknown",
    websiteUrl: input.prospect.website_url,
    socialUrls: [input.prospect.instagram_url, input.prospect.facebook_url].filter((value): value is string => Boolean(value)),
    providerPlaceId: input.prospect.provider_place_id,
    chainStatus: input.prospect.chain_status,
    openingHours: stringList(input.prospect.opening_hours),
    verifiedFacts: accepted.map((item) => item.claim_text),
    verifiedServices,
    rejectedSources: rejected.map((item) => item.publisher_name || item.publisher_domain || item.source_title || "Rejected source"),
    sourceClassifications: (input.evidence || []).map((item) => item.source_classification || item.evidence_tier),
    providerIssues: input.providerIssues || [],
    opportunityScore: input.opportunityScore,
    opportunityEvidenceCount: accepted.filter((item) => /website|service|customer|contact|review|hours|category/i.test(`${item.claim_type} ${item.claim_text}`)).length,
    strongExistingSite: input.strongExistingSite,
    pipelineStage: input.prospect.pipeline_stage,
    outreachStatus: input.prospect.outreach_status,
    nextActionDueAt: input.prospect.next_action_due_at,
    explicitDecline: input.prospect.outreach_status === "lost",
    doNotContact: input.prospect.outreach_status === "do_not_contact",
    artifactSafetyPassed: !input.prospect.artifacts_stale_reason,
  }
}

export async function invalidateSignalArtifacts(input: {
  prospect: SignalProspect
  changedFields: SignalIdentityField[]
  createdBy: string
}) {
  if (!input.changedFields.length) return {
    versions: signalProspectVersions(input.prospect),
    affectedArtifacts: [],
    staleReason: null,
  }
  const supabase = createAdminClient()
  const now = new Date().toISOString()
  const affectedArtifacts = affectedSignalArtifacts(input.changedFields)
  const staleReason = staleReasonForSignalArtifacts(input.changedFields)
  const versions = signalProspectVersions(input.prospect)
  const nextVersions = {
    identity_version: versions.identity_version + 1,
    evidence_version: versions.evidence_version + 1,
    website_version: versions.website_version + (input.changedFields.includes("website_url") ? 1 : 0),
    category_version: versions.category_version + (input.changedFields.includes("industry") ? 1 : 0),
  }
  const jobs: Array<PromiseLike<unknown>> = []
  if (affectedArtifacts.some((item) => ["verdict", "confidence_dimensions", "business_profile", "opportunity", "approachability", "offer", "supporting_claims", "evidence_summary"].includes(item))) {
    jobs.push(supabase.from("signal_analyses").update({ is_current: false, stale_at: now, stale_reason: staleReason }).eq("prospect_id", input.prospect.id).eq("is_current", true))
  }
  if (affectedArtifacts.some((item) => ["sales_strategy", "scripts", "next_action", "preferred_channel"].includes(item))) {
    jobs.push(supabase.from("signal_outreach_drafts").update({ is_current: false, stale_at: now, stale_reason: staleReason }).eq("prospect_id", input.prospect.id).eq("is_current", true))
  }
  if (affectedArtifacts.includes("concept")) {
    jobs.push(supabase.from("signal_concepts").update({ is_current: false, stale_at: now, stale_reason: staleReason, status: "archived" }).eq("prospect_id", input.prospect.id).eq("is_current", true))
  }
  jobs.push(
    supabase.from("signal_artifact_versions").update({ status: "stale", stale_at: now, stale_reason: staleReason }).eq("prospect_id", input.prospect.id).eq("status", "current"),
    supabase.from("signal_prospects").update({
      ...nextVersions,
      artifacts_regenerating: true,
      artifacts_stale_reason: staleReason,
      assistance_mode: "identity_resolution",
      executive_recommendation: {},
      opportunity_brief: {},
      business_profile: {},
      uncertainty_budget: [],
      research_missions: [],
      action_availability: {},
      analysis_quality: {},
      concept_status: "not_started",
      sales_pack_state: "not_ready",
      verdict: "pending",
    }).eq("id", input.prospect.id),
    supabase.from("signal_lead_activities").insert({
      prospect_id: input.prospect.id,
      activity_type: "generated_artifacts_invalidated",
      summary: `Signal removed outdated active material after ${input.changedFields.map((field) => field.replace(/_/g, " ")).join(", ")} changed.`,
      metadata: { changed_fields: input.changedFields, affected_artifacts: affectedArtifacts, stale_reason: staleReason, versions: nextVersions },
      created_by: input.createdBy,
    }),
  )
  const results = await Promise.all(jobs)
  assertSignalDatabaseWrites(results, "Signal artifact invalidation failed")
  return { versions: nextVersions, affectedArtifacts, staleReason }
}

export async function persistSignalCopilotState(input: {
  prospect: SignalProspect
  copilotInput: SignalCopilotInput
  createdBy: string
}) {
  const supabase = createAdminClient()
  const state = buildSignalCopilotState(input.copilotInput)
  const versions = signalProspectVersions(input.prospect)
  const snapshot = signalIdentitySnapshot(input.copilotInput)
  const artifactRows = [
    ["business_profile", state.business_profile],
    ["opportunity", state.opportunity],
    ["verdict", state.recommendation],
    ["next_action", state.next_action],
    ["confidence_dimensions", state.analysis_quality],
  ].map(([artifactType, payload]) => ({
    prospect_id: input.prospect.id,
    artifact_type: artifactType,
    ...versions,
    prompt_version: "signal-copilot-v4",
    input_snapshot: snapshot,
    payload,
    status: "current",
    generated_by: input.createdBy,
  }))
  const missionRows = state.research_missions.map((mission) => ({
    prospect_id: input.prospect.id,
    mission_key: mission.key,
    title: mission.title,
    status: mission.status,
    sources_checked: mission.sources_checked,
    conclusion: mission.conclusion,
    confidence: mission.confidence,
    failure_reason: mission.failure_reason,
    luke_intervention_required: mission.luke_intervention_required,
    next_automatic_step: mission.next_automatic_step,
    identity_version: versions.identity_version,
    evidence_version: versions.evidence_version,
    updated_at: new Date().toISOString(),
  }))
  const providerRows = state.provider_limitations.map((issue) => ({
    prospect_id: input.prospect.id,
    provider: issue.provider,
    operation: issue.operation,
    status: issue.status,
    error_category: issue.error_category,
    user_explanation: issue.user_explanation,
    retryable: issue.retryable,
    effect_on_analysis: issue.effect_on_analysis,
    last_successful_use: issue.last_successful_use,
    updated_at: new Date().toISOString(),
  }))
  const replacementResults = await Promise.all([
    supabase.from("signal_artifact_versions").update({ status: "stale", stale_at: new Date().toISOString(), stale_reason: "Replaced by a newer generated version." }).eq("prospect_id", input.prospect.id).eq("status", "current"),
    supabase.from("signal_research_missions").delete().eq("prospect_id", input.prospect.id).eq("identity_version", versions.identity_version).eq("evidence_version", versions.evidence_version),
  ])
  assertSignalDatabaseWrites(replacementResults, "Signal artifact version replacement failed")
  const writes: Array<PromiseLike<unknown>> = [
    supabase.from("signal_artifact_versions").insert(artifactRows),
    missionRows.length ? supabase.from("signal_research_missions").insert(missionRows) : Promise.resolve(),
    providerRows.length ? supabase.from("signal_provider_health").insert(providerRows) : Promise.resolve(),
    supabase.from("signal_prospects").update({
      business_profile: state.business_profile,
      uncertainty_budget: state.uncertainty_budget,
      research_missions: state.research_missions,
      assistance_mode: state.assistance_mode,
      executive_recommendation: state.recommendation,
      opportunity_brief: state.opportunity,
      next_action_plan: state.next_action,
      action_availability: state.action_availability,
      analysis_quality: state.analysis_quality,
      provider_limitations: state.provider_limitations,
      artifacts_regenerating: false,
      artifacts_stale_reason: null,
      next_action: state.next_action.exact_instruction,
    }).eq("id", input.prospect.id),
  ]
  const writeResults = await Promise.all(writes)
  assertSignalDatabaseWrites(writeResults, "Signal copilot persistence failed")
  return state
}
