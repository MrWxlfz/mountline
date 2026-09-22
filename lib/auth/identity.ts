import "server-only"

import { auth, currentUser } from "@clerk/nextjs/server"
import {
  getVerifiedEmails,
  normalizeEmail,
  type AuthenticatedIdentity,
} from "@/lib/auth/identity-rules"

export type { AuthenticatedIdentity } from "@/lib/auth/identity-rules"

export async function getServerIdentity(): Promise<AuthenticatedIdentity | null> {
  const { userId } = await auth()
  if (!userId) return null

  const user = await currentUser()
  const verifiedEmails = getVerifiedEmails(user?.emailAddresses ?? [])
  const primary = user?.primaryEmailAddressId
    ? user.emailAddresses.find((item) => item.id === user.primaryEmailAddressId)
    : null
  const primaryEmail =
    primary?.verification?.status === "verified"
      ? normalizeEmail(primary.emailAddress)
      : verifiedEmails[0] || null

  return { userId, verifiedEmails, primaryEmail }
}
