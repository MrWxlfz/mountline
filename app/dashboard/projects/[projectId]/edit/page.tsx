import { notFound } from "next/navigation"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import { ProjectEditForm } from "./project-edit-form"

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
    .select("id, project_name, status, portal_id, target_launch_date, preview_url, live_url, payment_link, payment_status, accepted_payment_methods, manual_payment_instructions, invoice_amount, invoice_label, next_step, notes, clients(business_name, contact_name, email)")
    .eq("id", projectId)
    .maybeSingle()

  if (error || !project) {
    notFound()
  }

  const { data: portalAccess } = await supabase
    .from("client_portal_access")
    .select("id, created_at, project_id, client_email, clerk_user_id, access_status")
    .eq("project_id", projectId)
    .order("created_at", { ascending: false })

  const projectForForm = {
    ...project,
    clients: Array.isArray(project.clients)
      ? project.clients[0] || null
      : project.clients || null,
  }

  return (
    <ProjectEditForm
      project={projectForForm}
      initialPortalAccess={portalAccess || []}
    />
  )
}
