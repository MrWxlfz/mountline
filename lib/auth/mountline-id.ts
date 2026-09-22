import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import { identityMatchesAssignment, type AuthenticatedIdentity } from "@/lib/auth/identity-rules"

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

function getProjectRecord(projects: unknown) {
  if (Array.isArray(projects)) return projects[0]
  return projects as { portal_id?: string | null; project_name?: string | null; status?: string | null } | null
}

export async function getAccessiblePortalDestinations({
  identity,
}: {
  identity: AuthenticatedIdentity
}) {
  const supabase = createAdminClient()
  const results: MountlinePortalDestination[] = []

  const { data: clerkData, error: clerkError } = await supabase
    .from("client_portal_access")
    .select("id, client_email, clerk_user_id, projects(portal_id, project_name, status)")
    .eq("clerk_user_id", identity.userId)
    .in("access_status", ["active", "invited"])
    .order("created_at", { ascending: false })

  if (clerkError) {
    console.error("[auth] Portal access Clerk lookup failed:", clerkError.message)
    return { status: "error" as const, destinations: [] }
  }

  for (const item of clerkData || []) {
    if (!identityMatchesAssignment(item, identity)) continue
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

  if (identity.verifiedEmails.length > 0) {
    const { data, error } = await supabase
      .from("client_portal_access")
      .select("id, client_email, clerk_user_id, projects(portal_id, project_name, status)")
      .is("clerk_user_id", null)
      .in("access_status", ["active", "invited"])
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[auth] Portal access email lookup failed:", error.message)
      return { status: "error" as const, destinations: [] }
    }

    for (const item of data || []) {
      if (!identityMatchesAssignment(item, identity)) continue
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

  return {
    status: "ok" as const,
    destinations: results.filter(
      (item, index, all) => all.findIndex((candidate) => candidate.portalId === item.portalId) === index,
    ),
  }
}

export function getPortalIdFromRedirect(redirectPath: string | null) {
  if (!redirectPath) return null
  const [pathname] = redirectPath.split(/[?#]/)
  const segments = pathname.split("/").filter(Boolean)

  if (segments[0] !== "portal" || !segments[1]) return null
  return segments[1]
}
