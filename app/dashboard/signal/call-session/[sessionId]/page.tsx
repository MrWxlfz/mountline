import { notFound } from "next/navigation"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { isSignalProspectSuppressed } from "@/lib/signal/alerts"
import { buildSignalScriptStudio, scriptStudioFromJson } from "@/lib/signal/scripts"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalAnalysis,
  SignalCallSession,
  SignalCallSessionItem,
  SignalOutreachDraft,
  SignalProspect,
} from "@/lib/supabase/types"
import type { SignalWebsiteScan } from "@/lib/signal/website"
import { SignalCallSessionView, type SignalCallSessionRow } from "./signal-call-session"

function getScan(analysis: SignalAnalysis | null) {
  const signals = analysis?.website_signals
  if (!signals || typeof signals !== "object") return null
  if ("scan" in signals && signals.scan && typeof signals.scan === "object") {
    return signals.scan as SignalWebsiteScan
  }
  return signals as SignalWebsiteScan
}

export default async function SignalCallSessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>
}) {
  await requireNorthlineTeamMember()
  const { sessionId } = await params
  const supabase = createAdminClient()

  const [{ data: session }, { data: items }] = await Promise.all([
    supabase
      .from("signal_call_sessions")
      .select("*")
      .eq("id", sessionId)
      .maybeSingle(),
    supabase
      .from("signal_call_session_items")
      .select("*")
      .eq("session_id", sessionId)
      .order("position", { ascending: true }),
  ])

  if (!session) notFound()

  const prospectIds = ((items || []) as SignalCallSessionItem[]).map((item) => item.prospect_id)
  const [{ data: prospects }, { data: analyses }, { data: drafts }] = await Promise.all([
    prospectIds.length
      ? supabase.from("signal_prospects").select("*").in("id", prospectIds)
      : Promise.resolve({ data: [] }),
    prospectIds.length
      ? supabase
          .from("signal_analyses")
          .select("*")
          .in("prospect_id", prospectIds)
          .eq("is_current", true)
          .is("stale_at", null)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
    prospectIds.length
      ? supabase
          .from("signal_outreach_drafts")
          .select("*")
          .in("prospect_id", prospectIds)
          .eq("is_current", true)
          .is("stale_at", null)
          .order("created_at", { ascending: false })
      : Promise.resolve({ data: [] }),
  ])

  const prospectMap = new Map(((prospects || []) as SignalProspect[]).map((item) => [item.id, item]))
  const latestAnalysis = new Map<string, SignalAnalysis>()
  ;((analyses || []) as SignalAnalysis[]).forEach((analysis) => {
    if (!latestAnalysis.has(analysis.prospect_id)) latestAnalysis.set(analysis.prospect_id, analysis)
  })
  const latestDraft = new Map<string, SignalOutreachDraft>()
  ;((drafts || []) as SignalOutreachDraft[]).forEach((draft) => {
    if (!latestDraft.has(draft.prospect_id)) latestDraft.set(draft.prospect_id, draft)
  })

  const rows: SignalCallSessionRow[] = []
  for (const item of (items || []) as SignalCallSessionItem[]) {
    const prospect = prospectMap.get(item.prospect_id)
    if (!prospect) continue
    const analysis = latestAnalysis.get(prospect.id) || null
    const draft = latestDraft.get(prospect.id) || null
    const storedScript = scriptStudioFromJson(draft?.script_studio)
    const scriptStudio =
      storedScript ||
      buildSignalScriptStudio({
        analysis,
        prospect,
        scan: getScan(analysis),
      })

    rows.push({
      item,
      prospect,
      analysis,
      draft,
      script_studio: scriptStudio,
      suppressed: await isSignalProspectSuppressed(prospect),
    })
  }

  return <SignalCallSessionView rows={rows} session={session as SignalCallSession} />
}
