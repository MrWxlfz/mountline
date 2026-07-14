import { notFound } from "next/navigation"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalAnalysis,
  SignalConcept,
  SignalEvidenceLedgerItem,
  SignalLeadActivity,
  SignalLeadStageHistory,
  SignalIdentityCandidateRecord,
  SignalIdentityCorrectionHistoryItem,
  SignalVerificationItem,
  SignalOutreachDraft,
  SignalOutreachEvent,
  SignalProspect,
} from "@/lib/supabase/types"
import { SignalLeadWorkspace } from "./signal-prospect-detail"

export const dynamic = "force-dynamic"

export default async function SignalProspectPage({
  params,
}: {
  params: Promise<{ prospectId: string }>
}) {
  await requireNorthlineTeamMember()
  const { prospectId } = await params
  const supabase = createAdminClient()
  const { data: prospectData, error } = await supabase
    .from("signal_prospects")
    .select("*")
    .eq("id", prospectId)
    .maybeSingle()
  if (error) console.error("[signal] Lead workspace fetch failed:", error.message)
  if (!prospectData) notFound()

  const [
    { data: analyses },
    { data: drafts },
    { data: outreachEvents },
    { data: evidence },
    { data: activities },
    { data: stageHistory },
    { data: concepts },
    { data: identityCandidates },
    { data: verificationItems },
    { data: correctionHistory },
  ] = await Promise.all([
    supabase.from("signal_analyses").select("*").eq("prospect_id", prospectId).order("created_at", { ascending: false }),
    supabase.from("signal_outreach_drafts").select("*").eq("prospect_id", prospectId).order("created_at", { ascending: false }),
    supabase.from("signal_outreach_events").select("*").eq("prospect_id", prospectId).order("created_at", { ascending: false }),
    supabase.from("signal_evidence_ledger").select("*").eq("prospect_id", prospectId).order("created_at", { ascending: false }),
    supabase.from("signal_lead_activities").select("*").eq("prospect_id", prospectId).order("occurred_at", { ascending: false }),
    supabase.from("signal_lead_stage_history").select("*").eq("prospect_id", prospectId).order("created_at", { ascending: false }),
    supabase.from("signal_concepts").select("*").eq("prospect_id", prospectId).order("created_at", { ascending: false }),
    supabase.from("signal_identity_candidates").select("*").eq("prospect_id", prospectId).order("match_score", { ascending: false }),
    supabase.from("signal_verification_items").select("*").eq("prospect_id", prospectId).order("required", { ascending: false }).order("created_at", { ascending: true }),
    supabase.from("signal_identity_correction_history").select("*").eq("prospect_id", prospectId).order("created_at", { ascending: false }).limit(30),
  ])

  return (
    <SignalLeadWorkspace
      prospect={prospectData as SignalProspect}
      analyses={(analyses || []) as SignalAnalysis[]}
      drafts={(drafts || []) as SignalOutreachDraft[]}
      outreachEvents={(outreachEvents || []) as SignalOutreachEvent[]}
      evidence={(evidence || []) as SignalEvidenceLedgerItem[]}
      activities={(activities || []) as SignalLeadActivity[]}
      stageHistory={(stageHistory || []) as SignalLeadStageHistory[]}
      concepts={(concepts || []) as SignalConcept[]}
      identityCandidates={(identityCandidates || []) as SignalIdentityCandidateRecord[]}
      verificationItems={(verificationItems || []) as SignalVerificationItem[]}
      correctionHistory={(correctionHistory || []) as SignalIdentityCorrectionHistoryItem[]}
    />
  )
}
