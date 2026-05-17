import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"

export type MountlinePortalDestination = {
  accessId: string
  portalId: string
  projectName: string | null
  status: string | null
}

export function getSafePortalRedirect(rawRedirect: string | string[] | undefined | null) {
  const value = Array.isArray(rawRedirect) ? rawRedirect[0] : rawRedirect
  if (!value) return null

  try {
    const url = value.startsWith("/")
      ? new URL(value, "https://mountline.local")
      : new URL(value)

    if (url.pathname === "/portal" || url.pathname.startsWith("/portal/")) {
      return `${url.pathname}${url.search}${url.hash}`
    }
  } catch {
    return null
  }

  return null
}

function normalizeEmails(emails: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      emails
        .filter((email): email is string => Boolean(email))
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  )
}

function getProjectRecord(projects: unknown) {
  if (Array.isArray(projects)) return projects[0]
  return projects as { portal_id?: string | null; project_name?: string | null; status?: string | null } | null
}

export async function getAccessiblePortalDestinations({
  userId,
  emails,
}: {
  userId: string
  emails: Array<string | null | undefined>
}) {
  const normalizedEmails = normalizeEmails(emails)
  const supabase = createAdminClient()
  const results: MountlinePortalDestination[] = []

  if (normalizedEmails.length > 0) {
    const { data, error } = await supabase
      .from("client_portal_access")
      .select("id, projects(portal_id, project_name, status)")
      .in("client_email", normalizedEmails)
      .in("access_status", ["active", "invited"])
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[auth] Portal access email lookup failed:", error.message)
    }

    for (const item of data || []) {
      const project = getProjectRecord(item.projects)
      if (project?.portal_id) {
        results.push({
          accessId: item.id,
          portalId: project.portal_id,
          projectName: project.project_name || null,
          status: project.status || null,
        })
      }
    }
  }

  const { data: clerkData, error: clerkError } = await supabase
    .from("client_portal_access")
    .select("id, projects(portal_id, project_name, status)")
    .eq("clerk_user_id", userId)
    .in("access_status", ["active", "invited"])
    .order("created_at", { ascending: false })

  if (clerkError) {
    console.error("[auth] Portal access Clerk lookup failed:", clerkError.message)
  }

  for (const item of clerkData || []) {
    const project = getProjectRecord(item.projects)
    if (project?.portal_id) {
      results.push({
        accessId: item.id,
        portalId: project.portal_id,
        projectName: project.project_name || null,
        status: project.status || null,
      })
    }
  }

  return results.filter(
    (item, index, all) => all.findIndex((candidate) => candidate.portalId === item.portalId) === index,
  )
}

export function getPortalIdFromRedirect(redirectPath: string | null) {
  if (!redirectPath) return null
  const [pathname] = redirectPath.split(/[?#]/)
  const segments = pathname.split("/").filter(Boolean)

  if (segments[0] !== "portal" || !segments[1]) return null
  return segments[1]
}
