import { redirect } from "next/navigation"
import { getNorthlineTeamAccess } from "@/lib/auth/team"
import { getServerIdentity } from "@/lib/auth/identity"
import {
  getAccessiblePortalDestinations,
  getPortalIdFromRedirect,
  getSafePortalRedirect,
} from "@/lib/auth/mountline-id"

type AuthRedirectPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function AuthRedirectPage({ searchParams }: AuthRedirectPageProps) {
  const params = searchParams ? await searchParams : {}
  const requestedPortalPath = getSafePortalRedirect(params.redirect_url)
  const identity = await getServerIdentity()

  if (!identity) {
    const loginPath = requestedPortalPath
      ? `/id?redirect_url=${encodeURIComponent(requestedPortalPath)}`
      : "/id"
    redirect(loginPath)
  }

  const teamAccess = await getNorthlineTeamAccess(identity)
  if (teamAccess.status === "error") {
    throw new Error("Mountline ID authorization could not be verified.")
  }
  if (teamAccess.isTeamMember) {
    redirect("/dashboard")
  }

  const portalResult = await getAccessiblePortalDestinations({ identity })
  if (portalResult.status === "error") {
    throw new Error("Portal assignments could not be verified.")
  }
  const portals = portalResult.destinations
  const requestedPortalId = getPortalIdFromRedirect(requestedPortalPath)

  if (requestedPortalId && portals.some((portal) => portal.portalId === requestedPortalId)) {
    redirect(requestedPortalPath!)
  }

  if (portals.length === 1) {
    redirect(`/portal/${portals[0].portalId}`)
  }

  if (portals.length > 1) {
    redirect("/portal")
  }

  redirect("/no-account")
}
