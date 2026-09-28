import { NextResponse } from "next/server"
import { readInquiryEmailSettings } from "@/lib/leads/email/config"
import { applyWebhook } from "@/lib/leads/email/server"
import { interpretWebhook, verifyWebhookSignature } from "@/lib/leads/email/webhook"

export const dynamic = "force-dynamic"

const MAX_BODY = 256 * 1024

// Resend delivery and inbound events. Nothing is read or written until the signature checks out.
export async function POST(request: Request) {
  const settings = readInquiryEmailSettings()
  if (!settings.webhookSecret) return NextResponse.json({ error: "Webhook is not configured." }, { status: 503 })

  const body = await request.text()
  if (body.length > MAX_BODY) return NextResponse.json({ error: "Payload too large." }, { status: 413 })

  const id = request.headers.get("svix-id")
  const valid = verifyWebhookSignature({
    secret: settings.webhookSecret,
    id,
    timestamp: request.headers.get("svix-timestamp"),
    signature: request.headers.get("svix-signature"),
    body,
  })
  if (!valid || !id) return NextResponse.json({ error: "Invalid signature." }, { status: 401 })

  let event: unknown
  try {
    event = JSON.parse(body)
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 })
  }

  try {
    const result = await applyWebhook(id.slice(0, 200), interpretWebhook(event as Parameters<typeof interpretWebhook>[0]), settings)
    return NextResponse.json({ ok: true, result })
  } catch {
    console.error("[mountline] Resend webhook could not be applied")
    // A 5xx asks Resend to deliver the event again later.
    return NextResponse.json({ error: "Event could not be saved." }, { status: 500 })
  }
}
