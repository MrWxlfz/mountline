import { NextResponse } from "next/server"
import { optOutByToken } from "@/lib/leads/email/server"

export const dynamic = "force-dynamic"

// RFC 8058 one-click unsubscribe, used by mail apps from the List-Unsubscribe header.
// People clicking the link in the email land on /inquiry/stop/[token] instead, which asks first.
export async function POST(request: Request) {
  const token = new URL(request.url).searchParams.get("token") || ""
  try {
    const found = await optOutByToken(token)
    return NextResponse.json({ ok: found }, { status: found ? 200 : 404 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}
