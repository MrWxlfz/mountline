import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { runInquiryEmails } from "@/lib/leads/email/server"

export const maxDuration = 60

// "Send due emails now" from the dashboard: the same run the scheduled job does.
export async function POST() {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  try {
    const summary = await runInquiryEmails({ scheduleFollowups: true })
    return NextResponse.json({ summary })
  } catch {
    return NextResponse.json({ error: "The email queue could not be processed. Please try again." }, { status: 500 })
  }
}
