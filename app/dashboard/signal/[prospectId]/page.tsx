import { notFound } from "next/navigation"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { isSignalProspectSuppressed } from "@/lib/signal/alerts"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalAlert,
  SignalAnalysis,
  SignalOutreachDraft,
  SignalProspect,
} from "@/lib/supabase/types"
import { SignalProspectDetail } from "./signal-prospect-detail"

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

  if (error) {
    console.error("[signal] Prospect detail fetch failed:", error.message)
  }
  if (!prospectData) notFound()

  const prospect = prospectData as SignalProspect
  const [{ data: analyses }, { data: drafts }, { data: alerts }] = await Promise.all([
    supabase
      .from("signal_analyses")
      .select("*")
      .eq("prospect_id", prospect.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("signal_outreach_drafts")
      .select("*")
      .eq("prospect_id", prospect.id)
      .order("created_at", { ascending: false }),
    supabase
      .from("signal_alerts")
      .select("*")
      .eq("prospect_id", prospect.id)
      .order("created_at", { ascending: false }),
  ])

  return (
    <SignalProspectDetail
      prospect={prospect}
      analyses={(analyses || []) as SignalAnalysis[]}
      drafts={(drafts || []) as SignalOutreachDraft[]}
      alerts={(alerts || []) as SignalAlert[]}
      suppressed={await isSignalProspectSuppressed(prospect)}
    />
  )
}
