"use server"

import { currentUser } from "@clerk/nextjs/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function isNorthlineTeamMember(): Promise<boolean> {
  const user = await currentUser()
  if (!user) return false

  const email = user.emailAddresses?.[0]?.emailAddress
  if (!email) return false

  const supabase = createAdminClient()
  const { data } = await supabase
    .from("team_members")
    .select("id")
    .eq("email", email)
    .eq("status", "active")
    .single()

  return !!data
}

export async function requireTeamMember() {
  const isTeam = await isNorthlineTeamMember()
  if (!isTeam) {
    throw new Error("Unauthorized: Not a Northline team member")
  }
  return true
}
