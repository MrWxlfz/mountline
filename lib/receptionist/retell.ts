import "server-only"
import { receptionistDemo } from "./demo.ts"

/**
 * Retell, for the team-only live-demo portal at /receptionist. Server-only: the API key never reaches
 * the browser. Endpoints follow https://docs.retellai.com/api-references (checked October 2026).
 *
 * Env: RETELL_API_KEY (required) and RETELL_DEMO_PHONE_NUMBER (E.164; defaults to the public demo
 * line in lib/receptionist/demo.ts). The agent is whichever one answers that number in Retell.
 */

// RETELL_API_BASE exists only to point local QA at a mock server; anything but localhost is ignored,
// so the API key can never be sent to another host by mistake.
const LOCAL_BASE = /^http:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?$/
const BASE = LOCAL_BASE.test(process.env.RETELL_API_BASE ?? "") ? process.env.RETELL_API_BASE! : "https://api.retellai.com"
const TIMEOUT_MS = 10_000
/** Written into the metadata of every call the portal places, so they're recognizable in Retell. */
export const PORTAL_CALL_SOURCE = "mountline-live-demo"
/** Outbound calls the portal will place per rolling 24 hours, so a mistake can't run up the bill. */
export const OUTBOUND_DAILY_LIMIT = 30

export class RetellError extends Error {
  readonly status: number | null
  constructor(message: string, status: number | null = null) {
    super(message)
    this.status = status
  }
}

export function retellConfig() {
  const apiKey = process.env.RETELL_API_KEY ?? ""
  const phoneNumber = process.env.RETELL_DEMO_PHONE_NUMBER || receptionistDemo.phoneHref.replace("tel:", "")
  return { apiKey, phoneNumber, ready: Boolean(apiKey) }
}

async function retell<T>(path: string, init: { method?: string; body?: unknown } = {}): Promise<T> {
  const { apiKey } = retellConfig()
  if (!apiKey) throw new RetellError("RETELL_API_KEY isn't set.")
  let response: Response
  try {
    response = await fetch(`${BASE}${path}`, {
      method: init.method ?? "GET",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: init.body === undefined ? undefined : JSON.stringify(init.body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
      cache: "no-store",
    })
  } catch {
    throw new RetellError("Couldn't reach Retell. Check the connection and try again.")
  }
  if (!response.ok) {
    let detail = ""
    try {
      const data = (await response.json()) as { message?: string; error_message?: string }
      detail = data.message ?? data.error_message ?? ""
    } catch {}
    throw new RetellError(detail || `Retell answered ${response.status}.`, response.status)
  }
  if (response.status === 204) return undefined as T
  const text = await response.text()
  return (text ? JSON.parse(text) : undefined) as T
}

/** The same authenticated request, for Receptionist Studio (lib/receptionist/studio/service.ts). */
export const retellApi = retell

/* Types: only the fields the portal uses. */

type AgentRef = { agent_id: string; agent_version?: number | string | null; weight?: number }

export type DemoLine = {
  number: string
  pretty: string
  inbound: AgentRef[]
  outbound: AgentRef[]
}

export type CollectedField = { name: string; type: string; description: string }

export type Agent = {
  id: string
  name: string
  version: number | null
  published: boolean
  llmId: string | null
  engine: string
  collects: CollectedField[]
}

export type Llm = { id: string; version: number | null; published: boolean; prompt: string; greeting: string; model: string }

export type Turn = { role: "agent" | "user" | "other"; text: string }

export type CallSummary = {
  id: string
  status: string
  direction: string
  number: string
  startedAt: number | null
  durationMs: number | null
}

export type CallDetail = CallSummary & {
  endedAt: number | null
  turns: Turn[]
  recordingUrl: string | null
  summary: string | null
  sentiment: string | null
  successful: boolean | null
  collected: Array<{ key: string; value: string }>
  analyzed: boolean
  disconnection: string | null
  costCents: number | null
}

/* Demo line and agent ------------------------------------------------------ */

export async function getDemoLine(): Promise<DemoLine> {
  const { phoneNumber } = retellConfig()
  const data = await retell<{
    phone_number: string
    phone_number_pretty?: string
    inbound_agents?: AgentRef[] | null
    outbound_agents?: AgentRef[] | null
  }>(`/get-phone-number/${encodeURIComponent(phoneNumber)}`)
  return {
    number: data.phone_number,
    pretty: data.phone_number_pretty ?? data.phone_number,
    inbound: data.inbound_agents ?? [],
    outbound: data.outbound_agents ?? [],
  }
}

export async function getAgent(agentId: string): Promise<Agent> {
  const data = await retell<{
    agent_id: string
    agent_name?: string | null
    version?: number
    is_published?: boolean
    response_engine?: { type?: string; llm_id?: string }
    post_call_analysis_data?: Array<{ type: string; name: string; description?: string }> | null
  }>(`/get-agent/${encodeURIComponent(agentId)}`)
  return {
    id: data.agent_id,
    name: data.agent_name || "Demo receptionist",
    version: data.version ?? null,
    published: Boolean(data.is_published),
    engine: data.response_engine?.type ?? "unknown",
    llmId: data.response_engine?.type === "retell-llm" ? data.response_engine.llm_id ?? null : null,
    collects: (data.post_call_analysis_data ?? []).map((field) => ({
      name: field.name,
      type: field.type,
      description: field.description ?? "",
    })),
  }
}

export async function getLlm(llmId: string): Promise<Llm> {
  const data = await retell<{
    llm_id: string
    version?: number
    is_published?: boolean
    general_prompt?: string | null
    begin_message?: string | null
    model?: string | null
  }>(`/get-retell-llm/${encodeURIComponent(llmId)}`)
  return {
    id: data.llm_id,
    version: data.version ?? null,
    published: Boolean(data.is_published),
    prompt: data.general_prompt ?? "",
    greeting: data.begin_message ?? "",
    model: data.model ?? "",
  }
}

/** Saves the receptionist's instructions and first line to the agent's language model. */
export async function updateLlm(llmId: string, changes: { prompt: string; greeting: string }) {
  await retell(`/update-retell-llm/${encodeURIComponent(llmId)}`, {
    method: "PATCH",
    body: { general_prompt: changes.prompt, begin_message: changes.greeting },
  })
}

/** Points the demo number (inbound and outbound) at the agent's latest version, so edits take effect. */
export async function pointLineAtLatest(agentId: string) {
  const { phoneNumber } = retellConfig()
  const binding = [{ agent_id: agentId, agent_version: "latest", weight: 1 }]
  await retell(`/update-phone-number/${encodeURIComponent(phoneNumber)}`, {
    method: "PATCH",
    body: { inbound_agents: binding, outbound_agents: binding },
  })
}

/* Calls --------------------------------------------------------------------- */

function summarize(call: {
  call_id: string
  call_status: string
  direction?: string
  from_number?: string
  to_number?: string
  start_timestamp?: number
  duration_ms?: number
}): CallSummary {
  const outbound = call.direction === "outbound"
  return {
    id: call.call_id,
    status: call.call_status,
    direction: call.direction ?? "web",
    number: (outbound ? call.to_number : call.from_number) ?? "",
    startedAt: call.start_timestamp ?? null,
    durationMs: call.duration_ms ?? null,
  }
}

export async function listCalls(agentId: string, limit = 15): Promise<CallSummary[]> {
  const data = await retell<{ items: Parameters<typeof summarize>[0][] }>("/v3/list-calls", {
    method: "POST",
    body: { filter_criteria: { agent: [{ agent_id: agentId }] }, sort_order: "descending", limit },
  })
  return (data.items ?? []).map(summarize)
}

export async function outboundCallsToday(agentId: string): Promise<number> {
  const since = Date.now() - 24 * 60 * 60 * 1000
  const data = await retell<{ items: unknown[] }>("/v3/list-calls", {
    method: "POST",
    body: {
      filter_criteria: {
        agent: [{ agent_id: agentId }],
        direction: { type: "enum", op: "in", value: ["outbound"] },
        start_timestamp: { op: "ge", value: since },
      },
      limit: OUTBOUND_DAILY_LIMIT + 1,
    },
  })
  return (data.items ?? []).length
}

export async function createCall(input: { to: string; agentId: string; startedBy: string }) {
  const { phoneNumber } = retellConfig()
  const data = await retell<{ call_id: string; call_status: string }>("/v2/create-phone-call", {
    method: "POST",
    body: {
      from_number: phoneNumber,
      to_number: input.to,
      override_agent_id: input.agentId,
      metadata: { source: PORTAL_CALL_SOURCE, started_by: input.startedBy },
    },
  })
  return { id: data.call_id, status: data.call_status }
}

export async function getCall(callId: string): Promise<CallDetail> {
  const data = await retell<{
    call_id: string
    call_status: string
    direction?: string
    from_number?: string
    to_number?: string
    start_timestamp?: number
    end_timestamp?: number
    duration_ms?: number
    transcript_object?: Array<{ role: string; content: string }> | null
    recording_url?: string | null
    disconnection_reason?: string | null
    call_cost?: { combined_cost?: number } | null
    call_analysis?: {
      call_summary?: string
      user_sentiment?: string
      call_successful?: boolean
      custom_analysis_data?: Record<string, unknown>
    } | null
  }>(`/v2/get-call/${encodeURIComponent(callId)}`)
  const analysis = data.call_analysis ?? null
  return {
    ...summarize(data),
    endedAt: data.end_timestamp ?? null,
    turns: (data.transcript_object ?? []).map((turn) => ({
      role: turn.role === "agent" ? "agent" : turn.role === "user" ? "user" : "other",
      text: turn.content,
    })),
    recordingUrl: data.recording_url ?? null,
    summary: analysis?.call_summary ?? null,
    sentiment: analysis?.user_sentiment ?? null,
    successful: analysis?.call_successful ?? null,
    collected: Object.entries(analysis?.custom_analysis_data ?? {}).map(([key, value]) => ({
      key,
      value: typeof value === "string" ? value : JSON.stringify(value),
    })),
    analyzed: Boolean(analysis),
    disconnection: data.disconnection_reason ?? null,
    costCents: typeof data.call_cost?.combined_cost === "number" ? data.call_cost.combined_cost : null,
  }
}

export async function endCall(callId: string) {
  await retell(`/v2/stop-call/${encodeURIComponent(callId)}`, { method: "POST" })
}

/** US numbers only, normalized to E.164 (+1XXXXXXXXXX). Returns null for anything else. */
export function normalizeUsNumber(input: string) {
  const digits = input.replace(/\D/g, "")
  const national = digits.length === 11 && digits.startsWith("1") ? digits.slice(1) : digits
  if (!/^[2-9]\d{2}[2-9]\d{6}$/.test(national)) return null
  return `+1${national}`
}
