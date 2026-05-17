import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getNorthlineTeamAccess } from "@/lib/auth/team"
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
  const { userId } = await auth()

  if (!userId) {
    const loginPath = requestedPortalPath
      ? `/id?redirect_url=${encodeURIComponent(requestedPortalPath)}`
      : "/id"
    redirect(loginPath)
  }

  const teamAccess = await getNorthlineTeamAccess()
  if (teamAccess.isTeamMember) {
    redirect("/dashboard")
  }

  const portals = await getAccessiblePortalDestinations({
    userId,
    emails: teamAccess.emails,
  })
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
