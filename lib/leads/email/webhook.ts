import { createHmac, timingSafeEqual } from "node:crypto"
import { addressOf } from "./config.ts"

/**
 * Resend webhooks are signed the Svix way: HMAC-SHA256 over "id.timestamp.body" with the
 * base64 secret that follows "whsec_". https://resend.com/docs/webhooks/verify-webhooks-requests
 */

export const WEBHOOK_TOLERANCE_SECONDS = 5 * 60

export function verifyWebhookSignature(input: {
  secret: string
  id: string | null
  timestamp: string | null
  signature: string | null
  body: string
  now?: Date
}) {
  const { secret, id, timestamp, signature, body } = input
  if (!secret.startsWith("whsec_") || !id || !timestamp || !signature) return false
  const seconds = Number(timestamp)
  const now = Math.floor((input.now || new Date()).getTime() / 1000)
  if (!Number.isInteger(seconds) || Math.abs(now - seconds) > WEBHOOK_TOLERANCE_SECONDS) return false

  let key: Buffer
  try {
    key = Buffer.from(secret.slice("whsec_".length), "base64")
  } catch {
    return false
  }
  if (!key.length) return false
  const expected = createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest()

  // The header can carry several space-separated "v1,<base64>" signatures during key rotation.
  return signature.split(" ").some((entry) => {
    const [version, value] = entry.split(",")
    if (version !== "v1" || !value) return false
    const received = Buffer.from(value, "base64")
    return received.length === expected.length && timingSafeEqual(received, expected)
  })
}

export function signWebhookForTest(secret: string, id: string, timestamp: string, body: string) {
  const key = Buffer.from(secret.slice("whsec_".length), "base64")
  return `v1,${createHmac("sha256", key).update(`${id}.${timestamp}.${body}`).digest("base64")}`
}

export type DeliveryStatus = "delayed" | "delivered" | "bounced" | "complained" | "failed"

export type WebhookEffect =
  | { kind: "ignore"; eventType: string }
  | {
      kind: "delivery"
      eventType: string
      providerMessageId: string
      jobId: string | null
      status: DeliveryStatus
      /** Set when the recipient address itself should not be emailed again. */
      suppress: "bounced" | "complained" | "provider_suppressed" | null
      detail: string | null
      occurredAt: string | null
    }
  | { kind: "reply"; eventType: string; from: string; providerMessageId: string | null; occurredAt: string | null }

type EventBody = {
  type?: unknown
  created_at?: unknown
  data?: {
    email_id?: unknown
    from?: unknown
    bounce?: { type?: unknown; subType?: unknown; message?: unknown }
    tags?: unknown
  }
}

function str(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null
}

function jobTag(tags: unknown) {
  // Resend sends tags as an object on events; accept the array form too.
  if (tags && typeof tags === "object" && !Array.isArray(tags)) return str((tags as Record<string, unknown>).inquiry_job)
  if (Array.isArray(tags)) return str(tags.find((tag) => tag?.name === "inquiry_job")?.value)
  return null
}

export function interpretWebhook(event: EventBody): WebhookEffect {
  const eventType = str(event.type) || "unknown"
  const data = event.data || {}
  const providerMessageId = str(data.email_id)
  const occurredAt = str(event.created_at)

  if (eventType === "email.received") {
    const from = addressOf(str(data.from))
    return from ? { kind: "reply", eventType, from, providerMessageId, occurredAt } : { kind: "ignore", eventType }
  }
  if (!providerMessageId) return { kind: "ignore", eventType }

  const base = { kind: "delivery" as const, eventType, providerMessageId, jobId: jobTag(data.tags), occurredAt }
  switch (eventType) {
    case "email.delivered":
      return { ...base, status: "delivered", suppress: null, detail: null }
    case "email.delivery_delayed":
      return { ...base, status: "delayed", suppress: null, detail: "Delivery delayed by the receiving server." }
    case "email.bounced": {
      const type = str(data.bounce?.type)
      const detail = [type, str(data.bounce?.subType), str(data.bounce?.message)].filter(Boolean).join(" · ").slice(0, 300) || null
      // A transient bounce may still be delivered; only a permanent one retires the address.
      if (type && type.toLowerCase() !== "permanent") return { ...base, status: "delayed", suppress: null, detail }
      return { ...base, status: "bounced", suppress: "bounced", detail }
    }
    case "email.complained":
      return { ...base, status: "complained", suppress: "complained", detail: "Marked as spam by the recipient." }
    case "email.suppressed":
      return { ...base, status: "failed", suppress: "provider_suppressed", detail: "Resend suppressed this address after earlier bounces or complaints." }
    case "email.failed":
      return { ...base, status: "failed", suppress: null, detail: "Resend could not send this message." }
    default:
      return { kind: "ignore", eventType }
  }
}

const rank: Record<string, number> = {
  queued: 0, sending: 0, retry: 0, awaiting_approval: 0,
  accepted: 1, delayed: 2, delivered: 3, bounced: 4, complained: 4, failed: 4,
}

/** Events arrive out of order; a status only moves forward. A complaint may follow delivery. */
export function shouldApplyDelivery(current: string, next: DeliveryStatus) {
  if (current === "skipped" || current === "cancelled") return false
  if (next === "complained") return current !== "complained"
  return (rank[next] ?? 0) > (rank[current] ?? 0)
}
