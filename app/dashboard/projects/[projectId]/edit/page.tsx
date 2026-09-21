import { notFound } from "next/navigation"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import { ProjectEditForm } from "./project-edit-form"
import { ProjectCommercialRecords } from "@/components/dashboard/project-commercial-records"
import { ProjectInquiries } from "@/components/dashboard/project-inquiries"
import { listProjectInquiries } from "@/lib/inquiries/service"
import type { ProjectReceipt } from "@/lib/supabase/types"

export default async function ProjectEditPage({
  params,
}: {
  params: Promise<{ projectId: string }>
}) {
  await requireNorthlineTeamMember()

  const { projectId } = await params
  const supabase = createAdminClient()

  const { data: project, error } = await supabase
    .from("projects")
    .select("id, project_name, status, portal_id, target_launch_date, preview_url, live_url, payment_link, payment_status, accepted_payment_methods, manual_payment_instructions, invoice_amount, invoice_label, next_step, notes, sale_confirmed_at, sale_confirmed_by, sale_evidence_reference, clients(business_name, contact_name, email)")
    .eq("id", projectId)
    .maybeSingle()

  if (error || !project) {
    notFound()
  }

  const [{ data: portalAccess, error: portalAccessError }, { data: receipts, error: receiptsError }, inquiries] = await Promise.all([
    supabase.from("client_portal_access").select("id, created_at, project_id, client_email, clerk_user_id, access_status").eq("project_id", projectId).order("created_at", { ascending: false }),
    supabase.from("project_receipts").select("*").eq("project_id", projectId).order("received_at", { ascending: false }),
    listProjectInquiries(projectId),
  ])
  if (portalAccessError || receiptsError) throw portalAccessError || receiptsError

  const projectForForm = {
    ...project,
    clients: Array.isArray(project.clients)
      ? project.clients[0] || null
      : project.clients || null,
  }

  return <div className="space-y-6">
    <ProjectEditForm project={projectForForm} initialPortalAccess={portalAccess || []} />
    <ProjectCommercialRecords
      projectId={projectId}
      initialSale={{
        sale_confirmed_at: project.sale_confirmed_at,
        sale_confirmed_by: project.sale_confirmed_by,
        sale_evidence_reference: project.sale_evidence_reference,
      }}
      initialReceipts={(receipts || []) as ProjectReceipt[]}
    />
    <ProjectInquiries projectId={projectId} initialInquiries={inquiries} />
  </div>
}
