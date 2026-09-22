import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { getNorthlineTeamAccess } from "@/lib/auth/team"
import { getServerIdentity } from "@/lib/auth/identity"
import { identityMatchesAssignment, isValidPortalId } from "@/lib/auth/identity-rules"

export type PortalProjectRecord = {
  id: string
  project_name: string
  package_type: string | null
  status: string
  start_date: string | null
  target_launch_date: string | null
  live_url: string | null
  preview_url: string | null
  payment_link: string | null
  payment_status: string
  accepted_payment_methods: string[] | null
  manual_payment_instructions: string | null
  invoice_amount: number | null
  invoice_label: string | null
  next_step: string | null
  clients: { business_name: string; contact_name: string } | null
}

type InaccessiblePortalAccess = {
  userId: string
  email: string | null
  project: null
  isTeamMember: false
}

export type PortalAccessResult =
  | {
      status: "unauthenticated"
      userId: null
      email: null
      project: null
      isTeamMember: false
    }
  | ({ status: "not_found" | "forbidden" | "error" } & InaccessiblePortalAccess)
  | {
      status: "authorized"
      userId: string
      email: string | null
      verifiedEmails: string[]
      project: PortalProjectRecord
      isTeamMember: boolean
    }

type PortalProjectQuery = Omit<PortalProjectRecord, "clients"> & {
  clients:
    | Array<{ business_name: string; contact_name: string }>
    | { business_name: string; contact_name: string }
    | null
}

function toPortalProject(project: PortalProjectQuery): PortalProjectRecord {
  const client = Array.isArray(project.clients) ? project.clients[0] || null : project.clients
  return {
    id: project.id,
    project_name: project.project_name,
    package_type: project.package_type,
    status: project.status,
    start_date: project.start_date,
    target_launch_date: project.target_launch_date,
    live_url: project.live_url,
    preview_url: project.preview_url,
    payment_link: project.payment_link,
    payment_status: project.payment_status,
    accepted_payment_methods: project.accepted_payment_methods,
    manual_payment_instructions: project.manual_payment_instructions,
    invoice_amount: project.invoice_amount,
    invoice_label: project.invoice_label,
    next_step: project.next_step,
    clients: client
      ? { business_name: client.business_name, contact_name: client.contact_name }
      : null,
  }
}

export async function getPortalAccess(portalId: string): Promise<PortalAccessResult> {
  const identity = await getServerIdentity()
  if (!identity) {
    return {
      status: "unauthenticated",
      userId: null,
      email: null,
      project: null,
      isTeamMember: false,
    }
  }

  const inaccessible = {
    userId: identity.userId,
    email: identity.primaryEmail,
    project: null,
    isTeamMember: false,
  } as const

  if (!isValidPortalId(portalId)) return { status: "not_found", ...inaccessible }

  const supabase = createAdminClient()
  const teamAccess = await getNorthlineTeamAccess(identity)
  if (teamAccess.status === "error") return { status: "error", ...inaccessible }

  const { data, error: projectError } = await supabase
    .from("projects")
    .select(`
      id,
      project_name,
      package_type,
      status,
      start_date,
      target_launch_date,
      live_url,
      preview_url,
      payment_link,
      payment_status,
      accepted_payment_methods,
      manual_payment_instructions,
      invoice_amount,
      invoice_label,
      next_step,
      clients (
        business_name,
        contact_name
      )
    `)
    .eq("portal_id", portalId)
    .maybeSingle()

  if (projectError) {
    console.error("[portal] Project lookup failed:", projectError.message)
    return { status: "error", ...inaccessible }
  }
  if (!data) return { status: "not_found", ...inaccessible }

  const project = toPortalProject(data as PortalProjectQuery)
  if (teamAccess.status === "authorized") {
    return {
      status: "authorized",
      userId: identity.userId,
      email: identity.primaryEmail,
      verifiedEmails: identity.verifiedEmails,
      project,
      isTeamMember: true,
    }
  }

  const { data: idAssignments, error: idError } = await supabase
    .from("client_portal_access")
    .select("client_email, clerk_user_id")
    .eq("project_id", project.id)
    .eq("clerk_user_id", identity.userId)
    .in("access_status", ["active", "invited"])

  if (idError) {
    console.error("[portal] Clerk assignment lookup failed:", idError.message)
    return { status: "error", ...inaccessible }
  }

  let assigned = (idAssignments || []).some((item) =>
    identityMatchesAssignment(item, identity),
  )

  if (!assigned && identity.verifiedEmails.length > 0) {
    const { data: emailAssignments, error: emailError } = await supabase
      .from("client_portal_access")
      .select("client_email, clerk_user_id")
      .eq("project_id", project.id)
      .is("clerk_user_id", null)
      .in("access_status", ["active", "invited"])

    if (emailError) {
      console.error("[portal] Email assignment lookup failed:", emailError.message)
      return { status: "error", ...inaccessible }
    }

    assigned = (emailAssignments || []).some((item) =>
      identityMatchesAssignment(item, identity),
    )
  }

  if (!assigned) return { status: "forbidden", ...inaccessible }

  return {
    status: "authorized",
    userId: identity.userId,
    email: identity.primaryEmail,
    verifiedEmails: identity.verifiedEmails,
    project,
    isTeamMember: false,
  }
}

export async function getOrCreateSupportThread(projectId: string) {
  const supabase = createAdminClient()
  const { data: existingThread, error: lookupError } = await supabase
    .from("support_threads")
    .select("id, status")
    .eq("project_id", projectId)
    .eq("status", "open")
    .maybeSingle()

  if (lookupError) throw lookupError
  if (existingThread) return existingThread

  const { data: thread, error } = await supabase
    .from("support_threads")
    .insert({ project_id: projectId, status: "open" })
    .select("id, status")
    .single()

  if (!error && thread) return thread
  if (error?.code !== "23505") throw error

  const { data: racedThread, error: racedError } = await supabase
    .from("support_threads")
    .select("id, status")
    .eq("project_id", projectId)
    .eq("status", "open")
    .single()

  if (racedError) throw racedError
  return racedThread
}
