import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalAlert,
  SignalAnalysis,
  SignalCampaign,
  SignalCampaignCandidate,
  SignalMarket,
  SignalMarketCandidate,
  SignalProspect,
} from "@/lib/supabase/types"
import { SignalInbox } from "./signal-inbox"

export const dynamic = "force-dynamic"

// Compatibility types for the remaining legacy Signal subroutes while the
// operational landing screen uses the focused inbox.
export type SignalProspectRow = SignalProspect & {
  latest_analysis: SignalAnalysis | null
  unread_alert: SignalAlert | null
}
export type SignalCampaignRow = SignalCampaign & { candidates: SignalCampaignCandidate[] }
export type SignalMarketRow = SignalMarket & { candidates: SignalMarketCandidate[] }

async function getSignalInbox() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_prospects")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(150)

  if (error) {
    console.error("[signal] Inbox fetch failed:", error.message)
    return { prospects: [] as SignalProspect[], error: error.message }
  }
  return { prospects: (data || []) as SignalProspect[], error: null }
}

export default async function SignalPage() {
  await requireNorthlineTeamMember()
  const inbox = await getSignalInbox()
  return <SignalInbox initialProspects={inbox.prospects} storageError={inbox.error} />
}
