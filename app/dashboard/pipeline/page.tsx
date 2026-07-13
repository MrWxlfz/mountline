import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect } from "@/lib/supabase/types"
import { PipelineBoard } from "./pipeline-board"

export const dynamic = "force-dynamic"

export default async function PipelinePage() {
  await requireNorthlineTeamMember()
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_prospects")
    .select("*")
    .order("updated_at", { ascending: false })
    .limit(300)
  return (
    <PipelineBoard
      initialProspects={(data || []) as SignalProspect[]}
      storageError={error?.message || null}
    />
  )
}

