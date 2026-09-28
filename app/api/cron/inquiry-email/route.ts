import { timingSafeEqual } from "node:crypto"
import { NextResponse } from "next/server"
import { runInquiryEmails } from "@/lib/leads/email/server"

export const dynamic = "force-dynamic"
export const maxDuration = 60

function authorized(request: Request) {
  const secret = process.env.CRON_SECRET
  const header = request.headers.get("authorization") || ""
  if (!secret || secret.length < 16) return false
  const expected = Buffer.from(`Bearer ${secret}`)
  const received = Buffer.from(header)
  return received.length === expected.length && timingSafeEqual(received, expected)
}

// Vercel Cron calls this with "Authorization: Bearer $CRON_SECRET". It retries failed sends,
// schedules check-ins, and sends anything due. Safe to run twice: jobs are leased.
export async function GET(request: Request) {
  if (!authorized(request)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  try {
    const summary = await runInquiryEmails({ scheduleFollowups: true })
    return NextResponse.json({ ok: true, summary })
  } catch {
    console.error("[mountline] Scheduled inquiry email run failed")
    return NextResponse.json({ ok: false, error: "The email queue could not be processed." }, { status: 500 })
  }
}
