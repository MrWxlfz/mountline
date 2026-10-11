import "server-only"
import { createHash, createHmac, timingSafeEqual } from "node:crypto"

/**
 * The soft gate in front of /receptionist (a pre-launch page, not account security).
 *
 * The password and signing secret only ever come from the environment (RECEPTIONIST_PASSWORD,
 * RECEPTIONIST_COOKIE_SECRET) and never reach the browser. Unlocking sets an httpOnly cookie holding
 * `v1.<expiry>.<signature>`, where the signature covers the expiry and a hash of the current password,
 * so changing either the password or the secret signs everyone out. If either variable is missing,
 * the page stays locked.
 */

export const GATE_COOKIE = "ml_rx"
export const GATE_COOKIE_PATH = "/receptionist"
export const GATE_MAX_AGE = 60 * 60 * 24 * 30 // 30 days, in seconds

function settings() {
  const password = process.env.RECEPTIONIST_PASSWORD ?? ""
  const secret = process.env.RECEPTIONIST_COOKIE_SECRET ?? ""
  return password && secret ? { password, secret } : null
}

const sha256 = (value: string) => createHash("sha256").update(value).digest()

function sign(expiry: number, password: string, secret: string) {
  return createHmac("sha256", secret).update(`v1.${expiry}.${sha256(password).toString("hex")}`).digest("hex")
}

/** Constant-time comparison of what someone typed against the password (hashing first evens the lengths). */
export function passwordMatches(input: string) {
  const config = settings()
  if (!config) return false
  return timingSafeEqual(sha256(input), sha256(config.password))
}

/** A fresh cookie value, or null when the gate isn't configured. */
export function issueToken(now = Date.now()) {
  const config = settings()
  if (!config) return null
  const expiry = Math.floor(now / 1000) + GATE_MAX_AGE
  return `v1.${expiry}.${sign(expiry, config.password, config.secret)}`
}

/** True only for an unexpired cookie signed with the current password and secret. */
export function tokenIsValid(token: string | undefined, now = Date.now()) {
  const config = settings()
  if (!config || !token) return false
  const [version, expiryText, signature] = token.split(".")
  const expiry = Number(expiryText)
  if (version !== "v1" || !Number.isInteger(expiry) || !signature || expiry * 1000 <= now) return false
  const expected = Buffer.from(sign(expiry, config.password, config.secret), "hex")
  const given = Buffer.from(signature, "hex")
  return given.length === expected.length && timingSafeEqual(given, expected)
}
