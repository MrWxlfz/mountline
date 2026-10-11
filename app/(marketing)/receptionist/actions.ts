"use server"

import { cookies } from "next/headers"
import { GATE_COOKIE, GATE_COOKIE_PATH, GATE_MAX_AGE, issueToken, passwordMatches } from "@/lib/receptionist-gate"

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

/** Checks the early-access password. On success, sets the signed cookie; on failure, answers slowly. */
export async function unlockReceptionist(password: string): Promise<{ ok: boolean }> {
  const token = typeof password === "string" && passwordMatches(password) ? issueToken() : null
  if (!token) {
    await sleep(400)
    return { ok: false }
  }
  const store = await cookies()
  store.set(GATE_COOKIE, token, {
    httpOnly: true,
    // Safari drops Secure cookies on http://localhost, so only local development relaxes this.
    secure: process.env.NODE_ENV !== "development",
    sameSite: "lax",
    path: GATE_COOKIE_PATH,
    maxAge: GATE_MAX_AGE,
  })
  return { ok: true }
}
