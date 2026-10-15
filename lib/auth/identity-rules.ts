export type AuthenticatedIdentity = {
  userId: string
  verifiedEmails: string[]
  primaryEmail: string | null
}

type ClerkEmailLike = {
  emailAddress?: string | null
  verification?: { status?: string | null } | null
}

export function normalizeEmail(value: string | null | undefined) {
  const normalized = value?.trim().toLowerCase()
  return normalized || null
}

export function getVerifiedEmails(emailAddresses: ClerkEmailLike[]) {
  return Array.from(
    new Set(
      emailAddresses
        .filter((item) => item.verification?.status === "verified")
        .map((item) => normalizeEmail(item.emailAddress))
        .filter((email): email is string => Boolean(email)),
    ),
  )
}

export function identityMatchesAssignment(
  assignment: { clerk_user_id: string | null; client_email: string },
  identity: AuthenticatedIdentity,
) {
  if (assignment.clerk_user_id) {
    return assignment.clerk_user_id === identity.userId
  }

  const email = normalizeEmail(assignment.client_email)
  return Boolean(email && identity.verifiedEmails.includes(email))
}

export function isValidPortalId(portalId: string) {
  return /^[a-z0-9][a-z0-9-]{0,119}$/i.test(portalId)
}

/** A team-only page to return to after sign-in: /receptionist and below, same site only. */
export function getSafeTeamRedirect(rawRedirect: string | string[] | undefined | null) {
  const value = Array.isArray(rawRedirect) ? rawRedirect[0] : rawRedirect
  if (!value || !value.startsWith("/") || value.startsWith("//")) return null
  try {
    const url = new URL(value, "https://mountline.local")
    if (url.origin !== "https://mountline.local") return null
    if (url.pathname === "/receptionist" || url.pathname.startsWith("/receptionist/")) return `${url.pathname}${url.search}`
  } catch {}
  return null
}
