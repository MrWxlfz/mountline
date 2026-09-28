import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect } from "@/lib/supabase/types"
import { canSendEmail, readInquiryEmailSettings } from "@/lib/leads/email/config"
import { LeadsDashboard, type InquiryLead } from "./leads-dashboard"
import type { EmailSetupStatus, InquiryEmailJob } from "./inquiry-inbox"

export const dynamic = "force-dynamic"

const JOB_COLUMNS = "id,lead_id,kind,status,send_after,attempts,provider_accepted_at,delivered_at,last_error,skip_reason,approved_at,updated_at"

export default async function LeadsPage({ searchParams }: { searchParams: Promise<{ inquiry?: string }> }) {
  await requireNorthlineTeamMember()
  const { inquiry: focusId } = await searchParams
  const supabase = createAdminClient()
  const [{ data: prospects, error: prospectError }, { data: inquiries, error: inquiryError }] = await Promise.all([
    supabase.from("signal_prospects").select("*").order("updated_at", { ascending: false }).limit(250),
    supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(250),
  ])

  const leadIds = (inquiries || []).map((lead) => lead.id as string)
  const { data: jobs, error: jobsError } = leadIds.length
    ? await supabase.from("inquiry_email_jobs").select(JOB_COLUMNS).in("lead_id", leadIds).order("created_at", { ascending: true })
    : { data: [], error: null }

  const settings = readInquiryEmailSettings()
  const emailStatus: EmailSetupStatus = {
    canSend: canSendEmail(settings),
    missing: settings.missing,
    problems: settings.problems,
    customerFollowup: settings.customerFollowup,
    requestedCustomerFollowup: settings.requestedCustomerFollowup,
    replyDetection: settings.replyDetection,
    timeZone: settings.timeZone,
    // The outbox table arrives with a migration; until it is applied, say so instead of failing.
    historyAvailable: !jobsError,
  }

  return (
    <LeadsDashboard
      prospects={(prospects || []) as SignalProspect[]}
      inquiries={(inquiries || []) as InquiryLead[]}
      emailJobs={(jobs || []) as InquiryEmailJob[]}
      emailStatus={emailStatus}
      focusId={focusId}
      storageError={prospectError?.message || inquiryError?.message || null}
    />
  )
}
