/**
 * Server-only settings for the browser voice demo. Nothing here is sent to the browser; pages
 * should call isWebDemoAvailable() on the server and pass only the boolean down.
 */

export type WebDemoConfig =
  | {
      ready: true
      apiKey: string
      agentId: string
      /** A published version number, a version tag, or null for Retell's default. */
      agentVersion: number | string | null
      maxSeconds: number
      perVisitor: number
      visitorWindowMinutes: number
      dailyCap: number
      maxConcurrent: number
      tokenSecret: string
    }
  | { ready: false; missing: string[] }

type Env = Record<string, string | undefined>

const MIN_SECRET_LENGTH = 16

function text(env: Env, name: string) {
  const value = env[name]?.trim()
  return value ? value : null
}

/** A whole number within [min, max]; anything unreadable uses the fallback, anything outside is clamped. */
function bounded(env: Env, name: string, fallback: number, min: number, max: number) {
  const raw = text(env, name)
  if (!raw) return fallback
  const value = Number(raw)
  if (!Number.isFinite(value)) return fallback
  return Math.min(max, Math.max(min, Math.round(value)))
}

function agentVersion(raw: string | null): number | string | null {
  if (!raw) return null
  return /^\d+$/.test(raw) ? Number(raw) : raw
}

export function readWebDemoConfig(env: Env = process.env): WebDemoConfig {
  const missing: string[] = []
  const apiKey = text(env, "RETELL_API_KEY")
  const agentId = text(env, "RETELL_DEMO_AGENT_ID")
  if (!apiKey) missing.push("RETELL_API_KEY")
  if (!agentId) missing.push("RETELL_DEMO_AGENT_ID")
  if (!text(env, "NEXT_PUBLIC_SUPABASE_URL")) missing.push("NEXT_PUBLIC_SUPABASE_URL")
  if (!text(env, "SUPABASE_SERVICE_ROLE_KEY")) missing.push("SUPABASE_SERVICE_ROLE_KEY")

  // The first one set is used, so a short dedicated secret is reported rather than silently skipped.
  const tokenSecret = text(env, "RECEPTIONIST_DEMO_TOKEN_SECRET") || text(env, "INQUIRY_HASH_SECRET") || text(env, "CRON_SECRET")
  if (!tokenSecret || tokenSecret.length < MIN_SECRET_LENGTH) missing.push("RECEPTIONIST_DEMO_TOKEN_SECRET")

  if (missing.length > 0 || !apiKey || !agentId || !tokenSecret) return { ready: false, missing }

  return {
    ready: true,
    apiKey,
    agentId,
    agentVersion: agentVersion(text(env, "RETELL_DEMO_AGENT_VERSION")),
    maxSeconds: bounded(env, "RECEPTIONIST_DEMO_MAX_SECONDS", 180, 60, 300),
    perVisitor: bounded(env, "RECEPTIONIST_DEMO_PER_VISITOR", 3, 1, 20),
    visitorWindowMinutes: bounded(env, "RECEPTIONIST_DEMO_VISITOR_WINDOW_MINUTES", 60, 5, 1440),
    dailyCap: bounded(env, "RECEPTIONIST_DEMO_DAILY_CAP", 40, 1, 1000),
    maxConcurrent: bounded(env, "RECEPTIONIST_DEMO_MAX_CONCURRENT", 2, 1, 20),
    tokenSecret,
  }
}

export function isWebDemoAvailable(env: Env = process.env): boolean {
  return readWebDemoConfig(env).ready
}
