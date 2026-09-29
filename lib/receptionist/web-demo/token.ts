import { createHmac, timingSafeEqual } from "node:crypto"

// The view token lets the browser that started a call read its record and end it, without
// storing anything per visitor. It is bound to one call ID and signed with a server secret.

export function signViewToken(callId: string, secret: string) {
  return createHmac("sha256", secret).update(`receptionist-demo-view:${callId}`).digest("base64url")
}

export function verifyViewToken(callId: string, token: unknown, secret: string) {
  if (typeof token !== "string" || token.length === 0 || token.length > 128) return false
  const expected = Buffer.from(signViewToken(callId, secret))
  const given = Buffer.from(token)
  return given.length === expected.length && timingSafeEqual(given, expected)
}

/** Rate-limit key for a visitor's IP address. Salted separately from inquiry hashes, so the two cannot be joined. */
export function hashVisitor(ip: string, secret: string) {
  return createHmac("sha256", secret).update(`receptionist-demo:${ip}`).digest("hex")
}
