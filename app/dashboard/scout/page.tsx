import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type { ScoutProspect } from "@/lib/supabase/types"
import { ScoutDashboard } from "./scout-dashboard"

async function getScoutProspects() {
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("scout_prospects")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[scout] Prospect fetch failed:", error.message)
    return []
  }

  return (data || []) as ScoutProspect[]
}

export default async function ScoutPage() {
  await requireNorthlineTeamMember()
  const prospects = await getScoutProspects()

  return <ScoutDashboard initialProspects={prospects} />
}
