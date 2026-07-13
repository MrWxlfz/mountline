import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect } from "@/lib/supabase/types"
import { LeadsDashboard, type InquiryLead } from "./leads-dashboard"

export const dynamic = "force-dynamic"

export default async function LeadsPage() {
  await requireNorthlineTeamMember()
  const supabase = createAdminClient()
  const [{ data: prospects, error: prospectError }, { data: inquiries, error: inquiryError }] = await Promise.all([
    supabase.from("signal_prospects").select("*").order("updated_at", { ascending: false }).limit(250),
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(250),
  ])
  return (
    <LeadsDashboard
      prospects={(prospects || []) as SignalProspect[]}
      inquiries={(inquiries || []) as InquiryLead[]}
      storageError={prospectError?.message || inquiryError?.message || null}
    />
  )
}
