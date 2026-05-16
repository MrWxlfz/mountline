import "server-only"

import { auth, currentUser } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

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

function normalizeEmails(emails: Array<string | undefined | null>) {
  return Array.from(
    new Set(
      emails
        .filter((email): email is string => Boolean(email))
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ),
  )
}

export async function getNorthlineTeamAccess(): Promise<NorthlineTeamAccess> {
  const { userId } = await auth()

  if (!userId) {
    return {
      status: "unauthenticated",
      isSignedIn: false,
      isTeamMember: false,
      userId: null,
      emails: [],
    }
  }

  const user = await currentUser()
  const emails = normalizeEmails(
    user?.emailAddresses?.map((email) => email.emailAddress) ?? [],
  )

  const supabase = createAdminClient()

  const { data: clerkMatches, error: clerkError } = await supabase
    .from("team_members")
    .select("id")
    .eq("status", "active")
    .eq("clerk_user_id", userId)
    .limit(1)

  if (clerkError) {
    console.error("[auth] Team member Clerk ID lookup failed:", clerkError.message)
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
      .select("id")
      .eq("status", "active")
      .in("email", emails)
      .limit(1)

    if (emailError) {
      console.error("[auth] Team member email lookup failed:", emailError.message)
    }

    const emailMatch = emailMatches?.[0]
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
    redirect("/client-login")
  }

  if (access.status === "forbidden") {
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

  if (access.status === "forbidden") {
    return {
      access,
      response: NextResponse.json(
        { error: "Forbidden: Northline team members only" },
        { status: 403 },
      ),
    }
  }

  return { access, response: null }
}
