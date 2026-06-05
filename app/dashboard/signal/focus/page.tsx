import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalAnalysis,
  SignalCampaign,
  SignalFocusItem,
  SignalOutreachDraft,
  SignalOutreachEvent,
  SignalProspect,
} from "@/lib/supabase/types"
import { SignalFocusMode } from "./signal-focus-mode"

export type SignalFocusProspectRow = {
  prospect: SignalProspect
  analysis: SignalAnalysis | null
  draft: SignalOutreachDraft | null
  focus_item: SignalFocusItem | null
  campaign: SignalCampaign | null
}

export default async function SignalFocusPage() {
  await requireNorthlineTeamMember()
  const supabase = createAdminClient()

  const [
    { data: prospects },
    { data: analyses },
    { data: drafts },
    { data: focusItems },
    { data: campaigns },
    { data: events },
  ] = await Promise.all([
    supabase.from("signal_prospects").select("*").order("created_at", { ascending: false }),
    supabase.from("signal_analyses").select("*").order("created_at", { ascending: false }),
    supabase.from("signal_outreach_drafts").select("*").order("created_at", { ascending: false }),
    supabase
      .from("signal_focus_items")
      .select("*")
      .in("status", ["pending", "active"])
      .order("due_date", { ascending: true, nullsFirst: true })
      .order("created_at", { ascending: false }),
    supabase.from("signal_campaigns").select("*").order("created_at", { ascending: false }),
    supabase.from("signal_outreach_events").select("*").order("created_at", { ascending: false }),
  ])

  const latestAnalysis = new Map<string, SignalAnalysis>()
  ;((analyses || []) as SignalAnalysis[]).forEach((analysis) => {
    if (!latestAnalysis.has(analysis.prospect_id)) latestAnalysis.set(analysis.prospect_id, analysis)
  })
  const latestDraft = new Map<string, SignalOutreachDraft>()
  ;((drafts || []) as SignalOutreachDraft[]).forEach((draft) => {
    if (!latestDraft.has(draft.prospect_id)) latestDraft.set(draft.prospect_id, draft)
  })
  const focusByProspect = new Map<string, SignalFocusItem>()
  ;((focusItems || []) as SignalFocusItem[]).forEach((item) => {
    if (!focusByProspect.has(item.prospect_id)) focusByProspect.set(item.prospect_id, item)
  })
  const campaignById = new Map(((campaigns || []) as SignalCampaign[]).map((campaign) => [campaign.id, campaign]))

  const rows: SignalFocusProspectRow[] = ((prospects || []) as SignalProspect[]).map((prospect) => {
    const focusItem = focusByProspect.get(prospect.id) || null
    return {
      prospect,
      analysis: latestAnalysis.get(prospect.id) || null,
      draft: latestDraft.get(prospect.id) || null,
      focus_item: focusItem,
      campaign: focusItem?.campaign_id ? campaignById.get(focusItem.campaign_id) || null : null,
    }
  })

  return (
    <SignalFocusMode
      campaigns={(campaigns || []) as SignalCampaign[]}
      events={(events || []) as SignalOutreachEvent[]}
      rows={rows}
      analyses={(analyses || []) as SignalAnalysis[]}
    />
  )
}
