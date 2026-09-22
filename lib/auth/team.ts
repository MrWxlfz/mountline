import "server-only"

import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { getServerIdentity, type AuthenticatedIdentity } from "@/lib/auth/identity"
import { normalizeEmail } from "@/lib/auth/identity-rules"

export type NorthlineTeamAccess =
  | {
      status: "unauthenticated"
      isSignedIn: false
      isTeamMember: false
      userId: null
      emails: string[]
    }
  | {
      status: "authorized"
      isSignedIn: true
      isTeamMember: true
      userId: string
      emails: string[]
      teamMemberId: string
    }
  | {
      status: "forbidden"
      isSignedIn: true
      isTeamMember: false
      userId: string
      emails: string[]
    }
  | {
      status: "error"
      isSignedIn: true
      isTeamMember: false
      userId: string
      emails: string[]
    }

export async function getNorthlineTeamAccess(
  providedIdentity?: AuthenticatedIdentity | null,
): Promise<NorthlineTeamAccess> {
  const identity = providedIdentity === undefined
    ? await getServerIdentity()
    : providedIdentity

  if (!identity) {
    return {
      status: "unauthenticated",
      isSignedIn: false,
      isTeamMember: false,
      userId: null,
      emails: [],
    }
  }

  const { userId, verifiedEmails: emails } = identity

  const supabase = createAdminClient()

  const { data: clerkMatches, error: clerkError } = await supabase
    .from("team_members")
    .select("id")
    .eq("status", "active")
    .eq("clerk_user_id", userId)
    .limit(1)

  if (clerkError) {
    console.error("[auth] Team member Clerk ID lookup failed:", clerkError.message)
    return {
      status: "error",
      isSignedIn: true,
      isTeamMember: false,
      userId,
      emails,
    }
  }

  const clerkMatch = clerkMatches?.[0]
  if (clerkMatch) {
    return {
      status: "authorized",
      isSignedIn: true,
      isTeamMember: true,
      userId,
      emails,
      teamMemberId: clerkMatch.id,
    }
  }

  if (emails.length > 0) {
    const { data: emailMatches, error: emailError } = await supabase
      .from("team_members")
      .select("id, email")
      .eq("status", "active")
      .is("clerk_user_id", null)

    if (emailError) {
      console.error("[auth] Team member email lookup failed:", emailError.message)
      return {
        status: "error",
        isSignedIn: true,
        isTeamMember: false,
        userId,
        emails,
      }
    }

    const emailMatch = emailMatches?.find((item) => {
      const email = normalizeEmail(item.email)
      return Boolean(email && emails.includes(email))
    })
    if (emailMatch) {
      return {
        status: "authorized",
        isSignedIn: true,
        isTeamMember: true,
        userId,
        emails,
        teamMemberId: emailMatch.id,
      }
    }
  }

  return {
    status: "forbidden",
    isSignedIn: true,
    isTeamMember: false,
    userId,
    emails,
  }
}

export async function isNorthlineTeamMember(): Promise<boolean> {
  const access = await getNorthlineTeamAccess()
  return access.isTeamMember
}

export async function requireNorthlineTeamMember() {
  const access = await getNorthlineTeamAccess()

  if (access.status === "unauthenticated") {
    redirect("/id")
  }

  if (access.status === "forbidden" || access.status === "error") {
    redirect("/access-restricted")
  }

  return access
}

export async function requireNorthlineTeamMemberApi() {
  const access = await getNorthlineTeamAccess()

  if (access.status === "unauthenticated") {
    return {
      access,
      response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
    }
  }

  if (access.status === "error") {
    return {
      access,
      response: NextResponse.json(
        { error: "Authorization could not be verified" },
        { status: 503 },
      ),
    }
  }

  if (access.status === "forbidden") {
      return {
      access,
      response: NextResponse.json(
        { error: "Forbidden: Mountline team members only" },
        { status: 403 },
      ),
    }
  }

  return { access, response: null }
}
