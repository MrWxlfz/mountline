import type { OutgoingEmail } from "./templates.ts"

/**
 * Resend's send endpoint, called with fetch like the existing Scout and Signal alerts.
 * https://resend.com/docs/api-reference/emails/send-email
 *
 * "accepted" means Resend took the message for delivery. It is not proof of delivery.
 */

export type SendResult =
  | { outcome: "accepted"; providerMessageId: string | null; note?: string }
  | { outcome: "retry"; error: string; retryAfterSeconds?: number }
  | { outcome: "failed"; error: string }

export type EmailSender = (email: OutgoingEmail, options: { idempotencyKey: string; from: string }) => Promise<SendResult>

export function idempotencyKeyFor(jobId: string) {
  return `mountline-inquiry-email/${jobId}`
}

function brief(value: unknown) {
  const text = typeof value === "string" ? value : JSON.stringify(value ?? "")
  // Provider messages can quote request fields; keep them short and single-line.
  return text.replace(/\s+/g, " ").slice(0, 300)
}

export function classifyResendResponse(status: number, body: { id?: unknown; name?: unknown; message?: unknown } | null, retryAfter: string | null): SendResult {
  const name = typeof body?.name === "string" ? body.name : ""
  const message = brief(body?.message || name || `HTTP ${status}`)
  if (status >= 200 && status < 300) {
    return { outcome: "accepted", providerMessageId: typeof body?.id === "string" ? body.id : null }
  }
  if (status === 409 && name === "invalid_idempotent_request") {
    // Resend only remembers keys from accepted requests, so this job was already sent once.
    return { outcome: "accepted", providerMessageId: null, note: "Resend had already accepted this message under the same key." }
  }
  if (status === 409 || status === 429 || status >= 500) {
    const seconds = Number(retryAfter)
    return { outcome: "retry", error: `Resend ${status}: ${message}`, retryAfterSeconds: Number.isFinite(seconds) && seconds > 0 ? seconds : undefined }
  }
  if (status === 401 || status === 403) {
    // Usually an unverified domain or a bad key. Keep the message queued until settings are fixed.
    return { outcome: "retry", error: `Resend ${status}: ${message}. Check the API key and that mountline.dev is verified in Resend.` }
  }
  return { outcome: "failed", error: `Resend ${status}: ${message}` }
}

export function createResendSender(apiKey: string, fetchImpl: typeof fetch = fetch): EmailSender {
  return async (email, { idempotencyKey, from }) => {
    let response: Response
    try {
      response = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          from,
          to: [email.to],
          reply_to: email.replyTo,
          subject: email.subject,
          html: email.html,
          text: email.text,
          headers: email.headers,
          tags: email.tags,
        }),
        signal: AbortSignal.timeout(10_000),
      })
    } catch (error) {
      const reason = error instanceof Error && error.name === "TimeoutError" ? "timed out" : "could not be reached"
      return { outcome: "retry", error: `Resend ${reason}.` }
    }
    const body = await response.json().catch(() => null)
    return classifyResendResponse(response.status, body, response.headers.get("retry-after"))
  }
}
