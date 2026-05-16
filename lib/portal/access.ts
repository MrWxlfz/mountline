import "server-only"

import { auth, currentUser } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { isNorthlineTeamMember } from "@/lib/auth/team"

export type PortalAccessResult =
  | {
      status: "unauthenticated"
      userId: null
      email: null
      project: null
      isTeamMember: false
    }
  | {
      status: "not_found"
      userId: string
      email: string | null
      project: null
      isTeamMember: boolean
    }
  | {
      status: "forbidden"
      userId: string
      email: string | null
      project: PortalProjectRecord
      isTeamMember: false
    }
  | {
      status: "authorized"
      userId: string
      email: string | null
      project: PortalProjectRecord
      isTeamMember: boolean
    }

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
  next_step: string | null
  notes: string | null
  clients: {
    business_name: string
    contact_name: string
    email: string
  } | null
}

function normalizeEmail(email: string | undefined | null) {
  return email?.trim().toLowerCase() || null
}

export async function getPortalAccess(portalId: string): Promise<PortalAccessResult> {
  const { userId } = await auth()

  if (!userId) {
    return {
      status: "unauthenticated",
      userId: null,
      email: null,
      project: null,
      isTeamMember: false,
    }
  }

  const supabase = createAdminClient()
  const user = await currentUser()
  const email = normalizeEmail(user?.emailAddresses?.[0]?.emailAddress)
  const isTeamMember = await isNorthlineTeamMember()

  const { data: project, error: projectError } = await supabase
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
      next_step,
      notes,
      clients (
        business_name,
        contact_name,
        email
      )
    `)
    .eq("portal_id", portalId)
    .maybeSingle()

  if (projectError || !project) {
    return {
      status: "not_found",
      userId,
      email,
      project: null,
      isTeamMember,
    }
  }

  if (isTeamMember) {
    return {
      status: "authorized",
      userId,
      email,
      project: project as PortalProjectRecord,
      isTeamMember: true,
    }
  }

  if (!email) {
    return {
      status: "forbidden",
      userId,
      email,
      project: project as PortalProjectRecord,
      isTeamMember: false,
    }
  }

  const { data: emailPortalAccess } = await supabase
    .from("client_portal_access")
    .select("id")
    .eq("project_id", project.id)
    .eq("client_email", email)
    .in("access_status", ["active", "invited"])
    .maybeSingle()

  let portalAccess = emailPortalAccess

  if (!portalAccess) {
    const { data: clerkPortalAccess } = await supabase
      .from("client_portal_access")
      .select("id")
      .eq("project_id", project.id)
      .eq("clerk_user_id", userId)
      .in("access_status", ["active", "invited"])
      .maybeSingle()

    portalAccess = clerkPortalAccess
  }

  if (!portalAccess) {
    return {
      status: "forbidden",
      userId,
      email,
      project: project as PortalProjectRecord,
      isTeamMember: false,
    }
  }

  return {
    status: "authorized",
    userId,
    email,
    project: project as PortalProjectRecord,
    isTeamMember: false,
  }
}

export async function getOrCreateSupportThread(projectId: string) {
  const supabase = createAdminClient()

  const { data: existingThread } = await supabase
    .from("support_threads")
    .select("id, status")
    .eq("project_id", projectId)
    .eq("status", "open")
    .maybeSingle()

  if (existingThread) return existingThread

  const { data: thread, error } = await supabase
    .from("support_threads")
    .insert({ project_id: projectId, status: "open" })
    .select("id, status")
    .single()

  if (error) throw error
  return thread
}
