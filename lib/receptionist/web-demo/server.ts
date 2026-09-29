import {
  DEMO_CALL_MESSAGES,
  type DemoCallErrorCode,
  type DemoCallErrorResponse,
  type DemoCallRecord,
  type DemoCallStartResponse,
  type RetellWebCall,
} from "./contract.ts"
import type { WebDemoConfig } from "./config.ts"
import { hashVisitor, signViewToken, verifyViewToken } from "./token.ts"

/*
 * Browser voice demo: request handling with every dependency injected (fetch, storage, clock),
 * so it runs the same under tests as in the route handlers. Demo sessions are kept apart from
 * real inquiries: nothing here touches leads or email, and no transcript is stored.
 */

export const RETELL_API_BASE = "https://api.retellai.com"
/** Written into every demo call's metadata; calls without it are never shown. */
export const DEMO_CALL_SOURCE = "mountline-site-demo"

const END_AFTER_SILENCE_MS = 20_000
const PROVIDER_TIMEOUT_MS = 10_000
// Retell adds the summary a little after the call ends; stop waiting for it after this.
const ANALYSIS_WAIT_MS = 4 * 60_000
const MAX_TURNS = 60
const MAX_TURN_CHARS = 600
const MAX_SUMMARY_CHARS = 1200
const MAX_DETAILS = 10
const MAX_DETAIL_CHARS = 300
const MAX_END_BODY_BYTES = 2048

export type StartOutcome = "allowed" | "visitor_limit" | "busy" | "daily_limit"

export type StartRequest = {
  visitorHash: string
  perVisitor: number
  visitorWindowMinutes: number
  dailyCap: number
  maxConcurrent: number
  maxSeconds: number
}

export type StartResult = { sessionId: string | null; outcome: StartOutcome; retryAfterSeconds: number | null }

export type FinishRequest = { callId: string; durationMs: number | null; disconnectionReason: string | null }

export type DemoStore = {
  /** Checks the limits and, when allowed, records a new session in one step. */
  start(request: StartRequest): Promise<StartResult>
  attach(sessionId: string, callId: string): Promise<void>
  /** The provider refused the call: the session stops counting as in progress. */
  fail(sessionId: string): Promise<void>
  /** Idempotent. */
  finish(request: FinishRequest): Promise<void>
}

export type DemoDeps = {
  config: WebDemoConfig
  fetch: typeof fetch
  store: DemoStore
  now?: () => Date
  /** MOUNTLINE_SITE_URL. Its host is accepted as an Origin alongside the request's own host. */
  siteUrl?: string | null
  log?: (message: string, detail?: Record<string, unknown>) => void
}

type ReadyConfig = Extract<WebDemoConfig, { ready: true }>

/* Responses ---------------------------------------------------------------------------- */

function json(body: unknown, status: number, headers: Record<string, string> = {}) {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store", ...headers } })
}

function errorResponse(code: DemoCallErrorCode, status: number, retryAfterSeconds?: number) {
  const body: DemoCallErrorResponse = { ok: false, code, message: DEMO_CALL_MESSAGES[code] }
  if (retryAfterSeconds && retryAfterSeconds > 0) {
    body.retryAfterSeconds = Math.ceil(retryAfterSeconds)
    return json(body, status, { "Retry-After": String(body.retryAfterSeconds) })
  }
  return json(body, status)
}

function logger(deps: DemoDeps) {
  return deps.log ?? ((message: string, detail?: Record<string, unknown>) => console.error(message, detail ?? {}))
}

/* Request checks ----------------------------------------------------------------------- */

function hostOf(value: string | null | undefined) {
  if (!value) return null
  try {
    return new URL(value).host.toLowerCase()
  } catch {
    return null
  }
}

/** True when the Origin header names this site. A missing or opaque ("null") Origin is not same-origin. */
export function isSameOrigin(request: Request, siteUrl?: string | null) {
  const originHost = hostOf(request.headers.get("origin"))
  if (!originHost) return false
  const allowed = new Set<string>()
  for (const host of [
    hostOf(request.url),
    request.headers.get("host"),
    request.headers.get("x-forwarded-host")?.split(",")[0],
    hostOf(siteUrl),
  ]) {
    if (host?.trim()) allowed.add(host.trim().toLowerCase())
  }
  return allowed.has(originHost)
}

function mediaType(request: Request) {
  return request.headers.get("content-type")?.split(";")[0]?.trim().toLowerCase() || null
}

export function visitorIp(headers: Headers) {
  return headers.get("x-real-ip")?.trim() || headers.get("x-forwarded-for")?.split(",")[0]?.trim() || null
}

export function isCallId(value: string) {
  return /^[A-Za-z0-9_-]{1,128}$/.test(value)
}

/* Retell ------------------------------------------------------------------------------- */

function retellHeaders(config: ReadyConfig) {
  return { Authorization: `Bearer ${config.apiKey}`, "Content-Type": "application/json" }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function isWebCall(value: unknown): value is RetellWebCall {
  return (
    isRecord(value) &&
    typeof value.call_id === "string" &&
    isCallId(value.call_id) &&
    typeof value.access_token === "string" &&
    value.access_token.length > 0
  )
}

/** The request Mountline sends to Retell. Nothing from the visitor's request is included. */
export function webCallRequestBody(config: ReadyConfig, sessionId: string) {
  const body: Record<string, unknown> = {
    agent_id: config.agentId,
    metadata: { source: DEMO_CALL_SOURCE, synthetic: true, session_id: sessionId },
    agent_override: {
      agent: { max_call_duration_ms: config.maxSeconds * 1000, end_call_after_silence_ms: END_AFTER_SILENCE_MS },
    },
  }
  if (config.agentVersion !== null) body.agent_version = config.agentVersion
  return body
}

async function createWebCall(config: ReadyConfig, deps: DemoDeps, sessionId: string) {
  try {
    const response = await deps.fetch(`${RETELL_API_BASE}/v3/create-web-call`, {
      method: "POST",
      headers: retellHeaders(config),
      body: JSON.stringify(webCallRequestBody(config, sessionId)),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    })
    if (!response.ok) return { ok: false as const, status: response.status }
    const call: unknown = await response.json().catch(() => null)
    if (!isWebCall(call)) return { ok: false as const, status: response.status }
    return { ok: true as const, call }
  } catch {
    return { ok: false as const, status: null }
  }
}

async function getCall(config: ReadyConfig, deps: DemoDeps, callId: string) {
  try {
    const response = await deps.fetch(`${RETELL_API_BASE}/v2/get-call/${encodeURIComponent(callId)}`, {
      method: "GET",
      headers: { Authorization: `Bearer ${config.apiKey}` },
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    })
    if (response.status === 404) return { kind: "missing" as const }
    if (!response.ok) return { kind: "failed" as const, status: response.status }
    const call: unknown = await response.json().catch(() => null)
    if (!isRecord(call)) return { kind: "failed" as const, status: response.status }
    return { kind: "found" as const, call }
  } catch {
    return { kind: "failed" as const, status: null }
  }
}

/** True when the call is over or gone. A call that has already ended is not an error. */
async function stopCall(config: ReadyConfig, deps: DemoDeps, callId: string) {
  try {
    const response = await deps.fetch(`${RETELL_API_BASE}/v2/stop-call/${encodeURIComponent(callId)}`, {
      method: "POST",
      headers: retellHeaders(config),
      signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS),
    })
    if (response.ok || [400, 404, 409, 422].includes(response.status)) return { ok: true as const }
    return { ok: false as const, status: response.status }
  } catch {
    return { ok: false as const, status: null }
  }
}

/* Call record -------------------------------------------------------------------------- */

const STATUSES = new Set(["registered", "not_connected", "ongoing", "ended", "error"])
const FINISHED = new Set<DemoCallRecord["status"]>(["ended", "error", "not_connected"])

export function isDemoCall(call: Record<string, unknown>, agentId: string) {
  return call.agent_id === agentId && isRecord(call.metadata) && call.metadata.source === DEMO_CALL_SOURCE
}

function clip(value: string, max: number) {
  return value.length > max ? `${value.slice(0, max - 1).trimEnd()}…` : value
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null
}

/** "caller_name" and "callerName" both become "Caller name". */
export function humanizeKey(key: string) {
  const words = key
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .replace(/[_\-\s]+/g, " ")
    .trim()
    .toLowerCase()
  return words ? words[0].toUpperCase() + words.slice(1) : ""
}

function detailValue(value: unknown) {
  if (typeof value === "string") return value.trim() ? clip(value.trim(), MAX_DETAIL_CHARS) : null
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : null
  if (typeof value === "boolean") return value ? "Yes" : "No"
  return null
}

function transcriptOf(call: Record<string, unknown>): DemoCallRecord["transcript"] {
  if (!Array.isArray(call.transcript_object)) return []
  const turns: DemoCallRecord["transcript"] = []
  for (const turn of call.transcript_object) {
    if (turns.length >= MAX_TURNS) break
    if (!isRecord(turn) || typeof turn.content !== "string") continue
    const role = turn.role === "agent" ? "agent" : turn.role === "user" ? "caller" : null
    const text = turn.content.trim()
    if (role && text) turns.push({ role, text: clip(text, MAX_TURN_CHARS) })
  }
  return turns
}

export function toDemoCallRecord(call: Record<string, unknown>, now: Date): DemoCallRecord {
  const status = typeof call.call_status === "string" && STATUSES.has(call.call_status) ? (call.call_status as DemoCallRecord["status"]) : "unknown"

  const start = finiteNumber(call.start_timestamp)
  const end = finiteNumber(call.end_timestamp)
  const reportedDuration = finiteNumber(call.duration_ms)
  const durationMs =
    reportedDuration !== null && reportedDuration >= 0
      ? Math.round(reportedDuration)
      : start !== null && end !== null && end >= start
        ? Math.round(end - start)
        : null

  const disconnectionReason = typeof call.disconnection_reason === "string" && call.disconnection_reason.trim() ? clip(call.disconnection_reason.trim(), 100) : null

  const analysis = isRecord(call.call_analysis) ? call.call_analysis : null
  const summary = analysis && typeof analysis.call_summary === "string" && analysis.call_summary.trim() ? clip(analysis.call_summary.trim(), MAX_SUMMARY_CHARS) : null
  const details: DemoCallRecord["analysis"]["details"] = []
  if (analysis && isRecord(analysis.custom_analysis_data)) {
    for (const [key, raw] of Object.entries(analysis.custom_analysis_data)) {
      if (details.length >= MAX_DETAILS) break
      const label = clip(humanizeKey(key), 60)
      const value = detailValue(raw)
      if (label && value) details.push({ label, value })
    }
  }

  let state: DemoCallRecord["analysis"]["state"] = "unavailable"
  if (summary || details.length > 0) state = "ready"
  else if ((status === "ended" || status === "ongoing") && (end === null || now.getTime() - end < ANALYSIS_WAIT_MS)) state = "pending"

  return {
    ok: true,
    status,
    durationMs,
    disconnectionReason,
    transcript: transcriptOf(call),
    analysis: { state, summary, details },
  }
}

/* Handlers ----------------------------------------------------------------------------- */

const FALLBACK_RETRY_SECONDS: Record<Exclude<StartOutcome, "allowed">, (config: ReadyConfig) => number> = {
  visitor_limit: (config) => config.visitorWindowMinutes * 60,
  busy: () => 60,
  daily_limit: () => 60 * 60,
}

/** POST /api/receptionist/demo-call */
export async function handleStartDemoCall(request: Request, deps: DemoDeps): Promise<Response> {
  if (mediaType(request) !== "application/json" || !isSameOrigin(request, deps.siteUrl)) return errorResponse("forbidden", 403)
  const { config } = deps
  if (!config.ready) return errorResponse("not_configured", 503)
  const log = logger(deps)

  // The request body is never read. Agent, metadata, and limits are fixed here on the server.
  // Visitors without a known address share one bucket, which only makes the limit stricter.
  const visitorHash = hashVisitor(visitorIp(request.headers) ?? "unknown", config.tokenSecret)

  let started: StartResult
  try {
    started = await deps.store.start({
      visitorHash,
      perVisitor: config.perVisitor,
      visitorWindowMinutes: config.visitorWindowMinutes,
      dailyCap: config.dailyCap,
      maxConcurrent: config.maxConcurrent,
      maxSeconds: config.maxSeconds,
    })
  } catch {
    log("[mountline] Demo call limits could not be checked")
    return errorResponse("storage_error", 503)
  }

  if (started.outcome !== "allowed") {
    return errorResponse(started.outcome, 429, started.retryAfterSeconds ?? FALLBACK_RETRY_SECONDS[started.outcome](config))
  }
  if (!started.sessionId) {
    log("[mountline] Demo call session was not recorded")
    return errorResponse("storage_error", 503)
  }

  const created = await createWebCall(config, deps, started.sessionId)
  if (!created.ok) {
    // Status code only: provider bodies can echo request details.
    log("[mountline] Retell did not create the demo web call", { status: created.status })
    try {
      await deps.store.fail(started.sessionId)
    } catch {
      log("[mountline] Demo call session could not be closed after a provider error")
    }
    return errorResponse("provider_error", 502)
  }

  try {
    await deps.store.attach(started.sessionId, created.call.call_id)
  } catch {
    // The session row already counts toward every limit and ages out on its own.
    log("[mountline] Demo call ID could not be saved to its session")
  }

  const body: DemoCallStartResponse = {
    ok: true,
    call: created.call,
    viewToken: signViewToken(created.call.call_id, config.tokenSecret),
    maxSeconds: config.maxSeconds,
  }
  return json(body, 200)
}

/** GET /api/receptionist/demo-call/[callId]?token=… */
export async function handleGetDemoCall(request: Request, callId: string, deps: DemoDeps): Promise<Response> {
  const { config } = deps
  if (!config.ready) return errorResponse("not_configured", 503)
  if (!isCallId(callId)) return errorResponse("bad_request", 400)
  const token = new URL(request.url).searchParams.get("token")
  if (!verifyViewToken(callId, token, config.tokenSecret)) return errorResponse("forbidden", 403)
  const log = logger(deps)

  const fetched = await getCall(config, deps, callId)
  if (fetched.kind === "missing") return errorResponse("not_found", 404)
  if (fetched.kind === "failed") {
    log("[mountline] Retell demo call could not be read", { status: fetched.status })
    return errorResponse("provider_error", 502)
  }
  if (!isDemoCall(fetched.call, config.agentId)) return errorResponse("not_found", 404)

  const record = toDemoCallRecord(fetched.call, (deps.now ?? (() => new Date()))())
  if (FINISHED.has(record.status)) {
    try {
      await deps.store.finish({ callId, durationMs: record.durationMs, disconnectionReason: record.disconnectionReason })
    } catch {
      log("[mountline] Demo call session could not be marked finished")
    }
  }
  return json(record, 200)
}

async function readEndToken(request: Request) {
  const type = mediaType(request)
  if (type !== "application/json" && type !== "text/plain") return undefined
  if (Number(request.headers.get("content-length") || 0) > MAX_END_BODY_BYTES) return undefined
  let raw: string
  try {
    raw = await request.text()
  } catch {
    return undefined
  }
  if (!raw || Buffer.byteLength(raw) > MAX_END_BODY_BYTES) return undefined
  try {
    const parsed: unknown = JSON.parse(raw)
    return isRecord(parsed) && typeof parsed.token === "string" ? parsed.token : undefined
  } catch {
    return undefined
  }
}

/** POST /api/receptionist/demo-call/[callId]/end with { token }, also sent by navigator.sendBeacon. */
export async function handleEndDemoCall(request: Request, callId: string, deps: DemoDeps): Promise<Response> {
  // sendBeacon may omit Origin; the signed token is still required either way.
  if (request.headers.has("origin") && !isSameOrigin(request, deps.siteUrl)) return errorResponse("forbidden", 403)
  const { config } = deps
  if (!config.ready) return errorResponse("not_configured", 503)
  if (!isCallId(callId)) return errorResponse("bad_request", 400)
  const token = await readEndToken(request)
  if (token === undefined) return errorResponse("bad_request", 400)
  if (!verifyViewToken(callId, token, config.tokenSecret)) return errorResponse("forbidden", 403)
  const log = logger(deps)

  const stopped = await stopCall(config, deps, callId)
  if (!stopped.ok) {
    // Left open on purpose: the call may still be live, and the session ages out on its own.
    log("[mountline] Retell did not stop the demo call", { status: stopped.status })
    return errorResponse("provider_error", 502)
  }
  try {
    await deps.store.finish({ callId, durationMs: null, disconnectionReason: null })
  } catch {
    log("[mountline] Demo call session could not be marked finished")
  }
  return json({ ok: true }, 200)
}
