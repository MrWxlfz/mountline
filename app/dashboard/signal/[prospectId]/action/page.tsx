import { notFound } from "next/navigation"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalAnalysis,
  SignalConcept,
  SignalEvidenceLedgerItem,
  SignalOutreachDraft,
  SignalProspect,
} from "@/lib/supabase/types"
import { SignalActionStudio } from "./signal-action-studio"

export const dynamic = "force-dynamic"

export default async function SignalActionPage({
  params,
  searchParams,
}: {
  params: Promise<{ prospectId: string }>
  searchParams: Promise<{ mode?: string }>
}) {
  await requireNorthlineTeamMember()
  const { prospectId } = await params
  const { mode } = await searchParams
  const supabase = createAdminClient()

  const [
    { data: prospect },
    { data: analysis },
    { data: draft },
    { data: concept },
    { data: evidence },
  ] = await Promise.all([
    supabase.from("signal_prospects").select("*").eq("id", prospectId).maybeSingle(),
    supabase.from("signal_analyses").select("*").eq("prospect_id", prospectId).eq("is_current", true).is("stale_at", null).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("signal_outreach_drafts").select("*").eq("prospect_id", prospectId).eq("is_current", true).is("stale_at", null).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("signal_concepts").select("*").eq("prospect_id", prospectId).eq("is_current", true).is("stale_at", null).order("created_at", { ascending: false }).limit(1).maybeSingle(),
    supabase
      .from("signal_evidence_ledger")
      .select("*")
      .eq("prospect_id", prospectId)
      .in("verification_status", ["verified", "corroborated"])
      .order("confidence", { ascending: false, nullsFirst: false })
      .limit(8),
  ])

  if (!prospect) notFound()

  return (
    <SignalActionStudio
      initialMode={mode === "practice" || mode === "teleprompter" ? mode : "focus"}
      prospect={prospect as SignalProspect}
      analysis={(analysis as SignalAnalysis | null) || null}
      draft={(draft as SignalOutreachDraft | null) || null}
      concept={(concept as SignalConcept | null) || null}
      evidence={(evidence || []) as SignalEvidenceLedgerItem[]}
    />
  )
}
