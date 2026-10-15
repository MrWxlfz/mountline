/*
 * The checks every Studio server action runs before touching Retell: Mountline team membership first,
 * then a per-person rate limit. Kept free of Next and Clerk imports so tests can drive it directly.
 */

export type Result<T> = { ok: true; data: T } | { ok: false; error: string }

export type TeamAccessLike = { isTeamMember: boolean; userId: string | null }

export const NOT_TEAM = "Sign in with your Mountline team account."

export async function asTeamMember<T>(
  getAccess: () => Promise<TeamAccessLike>,
  work: (userId: string) => Promise<T>,
  explain: (error: unknown) => string,
): Promise<Result<T>> {
  let access: TeamAccessLike
  try {
    access = await getAccess()
  } catch {
    return { ok: false, error: NOT_TEAM }
  }
  if (!access.isTeamMember || !access.userId) return { ok: false, error: NOT_TEAM }
  try {
    return { ok: true, data: await work(access.userId) }
  } catch (error) {
    return { ok: false, error: explain(error) }
  }
}

/**
 * A small sliding-window limit per person. In memory, so it's per server instance: it stops a stuck
 * button or a runaway script from creating paid agents or calls, not a determined attacker (team
 * sign-in already does that).
 */
export function createRateLimit(limit: number, windowMs: number, now: () => number = Date.now) {
  const hits = new Map<string, number[]>()
  return function take(key: string): { allowed: true } | { allowed: false; retryInSeconds: number } {
    const time = now()
    const recent = (hits.get(key) ?? []).filter((at) => time - at < windowMs)
    if (recent.length >= limit) {
      hits.set(key, recent)
      return { allowed: false, retryInSeconds: Math.max(1, Math.ceil((windowMs - (time - recent[0])) / 1000)) }
    }
    recent.push(time)
    hits.set(key, recent)
    return { allowed: true }
  }
}
