import { getIndustry } from "./industries.ts"
import { personalities } from "./personalities.ts"
import { buildStudioReceptionist, type GeneratedReceptionist } from "./prompt.ts"
import { studioConfigSchema, validateStudioConfig, type StudioConfig } from "./schema.ts"

/*
 * Receptionist Studio's Retell operations. Every function takes the Retell request function as its
 * first argument, so the same code runs against the real API (lib/receptionist/retell.ts, server only)
 * and against a recording fake in tests. Request and response fields follow the Retell API reference
 * (docs.retellai.com/api-references, checked October 2026).
 *
 * Retell is the store: a Studio agent is any agent named "Studio · …", and its settings ride along in
 * its LLM's default_dynamic_variables (only substituted where {{studio_config}} appears, which it never
 * does). No database table is needed, and the list survives across devices.
 */

export type RetellApi = <T>(path: string, init?: { method?: string; body?: unknown }) => Promise<T>

export class StudioError extends Error {}

export const STUDIO_PREFIX = "Studio · "
export const STUDIO_CALL_SOURCE = "mountline-studio"
/** Keeps the Retell account tidy: edit or delete an old demo before making more. */
export const MAX_STUDIO_AGENTS = 40
const CONFIG_VARIABLE = "studio_config"
const MAX_TEST_CALL_MS = 15 * 60_000
const SILENCE_END_MS = 45_000

/* Request bodies (pure) ------------------------------------------------------------------- */

export type StudioVoice = { id: string; name: string; provider: string; gender: string; accent: string | null; age: string | null; previewUrl: string | null }

export function llmRequestBody(config: StudioConfig, generated: GeneratedReceptionist) {
  return {
    general_prompt: generated.prompt,
    begin_message: generated.firstMessage,
    start_speaker: "agent",
    model_temperature: personalities[config.personality].temperature,
    general_tools: [
      {
        type: "end_call",
        name: "end_call",
        description: "Hang up once the caller is done and you've said goodbye, or right after they say goodbye.",
      },
    ],
    default_dynamic_variables: { [CONFIG_VARIABLE]: JSON.stringify(config) },
  }
}

/**
 * The agent settings. `enhanced` adds Retell's newer voice features (expressive mode on platform voices
 * and the Agent Handbook tone presets); if Retell rejects them, the agent is rebuilt without.
 */
export function agentRequestBody(config: StudioConfig, generated: GeneratedReceptionist, llmId: string, voice: Pick<StudioVoice, "provider"> | null, enhanced = true) {
  const personality = personalities[config.personality]
  const industry = getIndustry(config.industry)
  const body: Record<string, unknown> = {
    agent_name: `${STUDIO_PREFIX}${config.businessName}`,
    response_engine: { type: "retell-llm", llm_id: llmId },
    voice_id: config.voiceId,
    ...personality.voice,
    language: "en-US",
    timezone: "America/Chicago",
    begin_message_delay_ms: 400,
    end_call_after_silence_ms: SILENCE_END_MS,
    max_call_duration_ms: MAX_TEST_CALL_MS,
    reminder_trigger_ms: 9000,
    reminder_max_count: 1,
    boosted_keywords: generated.boostedKeywords,
    post_call_analysis_data: generated.postCallFields,
  }
  if (industry.sensitive === "health") body.vocab_specialization = "medical"
  if (enhanced) {
    body.handbook_config = {
      default_personality: personality.handbookTone === "default_personality",
      conversational_personality: personality.handbookTone === "conversational_personality",
      ai_disclosure: true,
      natural_filler_words: false,
      high_empathy: industry.sensitive === "health" || config.personality === "warm",
      speech_normalization: true,
    }
    if (voice?.provider === "platform") {
      body.enable_expressive_mode = true
      body.expressive_emotion_tags = personality.expressiveTags
    } else {
      body.enable_expressive_mode = false
    }
  }
  return body
}

export function webCallRequestBody(agentId: string, startedBy: string) {
  return {
    agent_id: agentId,
    agent_version: "latest",
    metadata: { source: STUDIO_CALL_SOURCE, started_by: startedBy },
  }
}

/* Reading ---------------------------------------------------------------------------- */

type RawAgent = {
  agent_id: string
  agent_name?: string | null
  voice_id?: string
  last_modification_timestamp?: number
  user_modified_timestamp?: number
  response_engine?: { type?: string; llm_id?: string }
}

type RawLlm = {
  llm_id: string
  general_prompt?: string | null
  begin_message?: string | null
  default_dynamic_variables?: Record<string, string> | null
}

export type StudioAgentSummary = { id: string; businessName: string; updatedAt: number | null }

export type StudioAgentDetail = {
  id: string
  llmId: string
  businessName: string
  config: StudioConfig | null
  prompt: string
  firstMessage: string
}

export type AgentOption = { id: string; name: string; studio: boolean }

export const isStudioName = (name: string | null | undefined) => Boolean(name?.startsWith(STUDIO_PREFIX))

async function listRawAgents(api: RetellApi) {
  const items: RawAgent[] = []
  let key: string | undefined
  for (let page = 0; page < 5; page++) {
    const query = new URLSearchParams({ limit: "200" })
    if (key) query.set("pagination_key", key)
    const data = await api<{ items?: RawAgent[]; has_more?: boolean; pagination_key?: string }>(`/v2/list-agents?${query}`, { method: "POST", body: {} })
    items.push(...(data.items ?? []))
    if (!data.has_more || !data.pagination_key) break
    key = data.pagination_key
  }
  return items
}

const toOption = (agent: RawAgent): AgentOption => ({ id: agent.agent_id, name: agent.agent_name || agent.agent_id, studio: isStudioName(agent.agent_name) })

const toSummary = (agent: RawAgent): StudioAgentSummary => ({
  id: agent.agent_id,
  businessName: (agent.agent_name ?? "").slice(STUDIO_PREFIX.length),
  updatedAt: agent.user_modified_timestamp ?? agent.last_modification_timestamp ?? null,
})

/**
 * One pass over the account's agents: the Studio receptionists (newest first), and every agent as an
 * option for who answers a phone number (Studio ones first).
 */
export async function listAgents(api: RetellApi): Promise<{ studio: StudioAgentSummary[]; options: AgentOption[] }> {
  const agents = await listRawAgents(api)
  return {
    studio: agents.filter((agent) => isStudioName(agent.agent_name)).map(toSummary).sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)),
    options: agents.map(toOption).sort((a, b) => Number(b.studio) - Number(a.studio) || a.name.localeCompare(b.name)),
  }
}

/** Loads a Studio agent. Refuses agents Studio didn't make, so it can never edit the main demo agent. */
async function getStudioAgent(api: RetellApi, agentId: string) {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(agentId)) throw new StudioError("That agent ID doesn't look right.")
  const agent = await api<RawAgent>(`/get-agent/${encodeURIComponent(agentId)}`)
  if (!isStudioName(agent.agent_name)) throw new StudioError("That agent wasn't made in Studio, so Studio won't change it.")
  const llmId = agent.response_engine?.type === "retell-llm" ? agent.response_engine.llm_id : undefined
  if (!llmId) throw new StudioError("That Studio agent has no Retell LLM attached. Delete it and create it again.")
  return { agent, llmId }
}

export async function loadStudioAgent(api: RetellApi, agentId: string): Promise<StudioAgentDetail> {
  const { agent, llmId } = await getStudioAgent(api, agentId)
  const llm = await api<RawLlm>(`/get-retell-llm/${encodeURIComponent(llmId)}`)
  let config: StudioConfig | null = null
  try {
    const parsed = validateStudioConfig(JSON.parse(llm.default_dynamic_variables?.[CONFIG_VARIABLE] ?? "null"))
    config = parsed.success ? parsed.config : null
  } catch {}
  return {
    id: agent.agent_id,
    llmId,
    businessName: agent.agent_name!.slice(STUDIO_PREFIX.length),
    config,
    prompt: llm.general_prompt ?? "",
    firstMessage: llm.begin_message ?? "",
  }
}

/* Overview ----------------------------------------------------------------------------- */

export type StudioOverview = { agents: StudioAgentSummary[]; voices: StudioVoice[]; numbers: StudioNumber[]; agentOptions: AgentOption[] }

/** Everything the Studio shows on load: its receptionists, the voices, and the account's numbers. */
export async function loadOverview(api: RetellApi): Promise<StudioOverview> {
  const [voices, numbers, agents] = await Promise.all([listVoices(api), listNumbers(api), listAgents(api)])
  return { agents: agents.studio, voices, numbers, agentOptions: agents.options }
}

/* Voices ------------------------------------------------------------------------------- */

type RawVoice = { voice_id: string; voice_name: string; provider: string; gender: string; accent?: string | null; age?: string | null; preview_audio_url?: string | null }

const PROVIDER_ORDER = ["platform", "cartesia", "elevenlabs", "minimax", "openai", "inworld", "fish_audio"]

/** English-speaking voices worth demoing, platform voices first (they support expressive mode). */
export async function listVoices(api: RetellApi): Promise<StudioVoice[]> {
  const data = await api<RawVoice[]>("/list-voices")
  return (Array.isArray(data) ? data : [])
    .filter((voice) => typeof voice.voice_id === "string" && /^[A-Za-z0-9_.:-]{1,120}$/.test(voice.voice_id))
    .filter((voice) => !voice.accent || /american|us|neutral|southern|general/i.test(voice.accent))
    .map((voice) => ({
      id: voice.voice_id,
      name: voice.voice_name,
      provider: voice.provider,
      gender: voice.gender,
      accent: voice.accent ?? null,
      age: voice.age ?? null,
      previewUrl: voice.preview_audio_url && /^https:\/\//.test(voice.preview_audio_url) ? voice.preview_audio_url : null,
    }))
    .sort((a, b) => rank(a.provider) - rank(b.provider) || a.name.localeCompare(b.name))
    .slice(0, 150)
}

const rank = (provider: string) => {
  const index = PROVIDER_ORDER.indexOf(provider)
  return index === -1 ? PROVIDER_ORDER.length : index
}

/* Writing ------------------------------------------------------------------------------ */

export type SaveResult = { agentId: string; llmId: string; created: boolean; warning: string | null }

function parseConfig(input: unknown) {
  const result = studioConfigSchema.safeParse(input)
  if (!result.success) throw new StudioError(result.error.issues[0]?.message ?? "Check the builder fields.")
  return result.data
}

async function findVoice(api: RetellApi, voiceId: string) {
  try {
    return await api<RawVoice>(`/get-voice/${encodeURIComponent(voiceId)}`)
  } catch (error) {
    const status = (error as { status?: number | null }).status
    if (status === 400 || status === 404 || status === 422) return null
    throw error
  }
}

/** Creates the agent with the newer voice features; if Retell refuses them, once more without. */
async function writeAgent(api: RetellApi, path: string, method: string, bodies: [Record<string, unknown>, Record<string, unknown>]) {
  try {
    return { agent: await api<RawAgent>(path, { method, body: bodies[0] }), warning: null }
  } catch (error) {
    const status = (error as { status?: number | null }).status
    if (status !== 400 && status !== 422) throw error
    const agent = await api<RawAgent>(path, { method, body: bodies[1] })
    return { agent, warning: `Retell didn't accept the expressive voice settings (${(error as Error).message}), so it uses standard voice settings.` }
  }
}

export async function createStudioAgent(api: RetellApi, input: unknown, existingCount: number): Promise<SaveResult> {
  const config = parseConfig(input)
  if (existingCount >= MAX_STUDIO_AGENTS) {
    throw new StudioError(`There are already ${MAX_STUDIO_AGENTS} Studio receptionists. Reuse or delete one first.`)
  }
  const generated = buildStudioReceptionist(config)
  const voice = await findVoice(api, config.voiceId)
  if (!voice) throw new StudioError("Retell doesn't have that voice. Pick another one.")

  const llm = await api<RawLlm>("/create-retell-llm", { method: "POST", body: llmRequestBody(config, generated) })
  try {
    const { agent, warning } = await writeAgent(api, "/create-agent", "POST", [
      agentRequestBody(config, generated, llm.llm_id, voice, true),
      agentRequestBody(config, generated, llm.llm_id, voice, false),
    ])
    return { agentId: agent.agent_id, llmId: llm.llm_id, created: true, warning }
  } catch (error) {
    // Don't leave an orphaned LLM behind when the agent couldn't be made.
    await api(`/delete-retell-llm/${encodeURIComponent(llm.llm_id)}`, { method: "DELETE" }).catch(() => {})
    throw error
  }
}

/** Updates an existing Studio agent in place (its draft), so edits never pile up duplicate agents. */
export async function updateStudioAgent(api: RetellApi, agentId: string, input: unknown): Promise<SaveResult> {
  const config = parseConfig(input)
  const { llmId } = await getStudioAgent(api, agentId)
  const generated = buildStudioReceptionist(config)
  const voice = await findVoice(api, config.voiceId)
  if (!voice) throw new StudioError("Retell doesn't have that voice. Pick another one.")
  await api(`/update-retell-llm/${encodeURIComponent(llmId)}`, { method: "PATCH", body: llmRequestBody(config, generated) })
  const path = `/update-agent/${encodeURIComponent(agentId)}`
  const { warning } = await writeAgent(api, path, "PATCH", [
    agentRequestBody(config, generated, llmId, voice, true),
    agentRequestBody(config, generated, llmId, voice, false),
  ])
  return { agentId, llmId, created: false, warning }
}

export async function deleteStudioAgent(api: RetellApi, agentId: string) {
  const { llmId } = await getStudioAgent(api, agentId)
  const numbers = await listNumbers(api)
  const busy = numbers.find((line) => line.inboundAgentId === agentId || line.outboundAgentId === agentId)
  if (busy) throw new StudioError(`${busy.pretty} still uses this receptionist. Put another agent on that number first.`)
  await api(`/delete-agent/${encodeURIComponent(agentId)}`, { method: "DELETE" })
  await api(`/delete-retell-llm/${encodeURIComponent(llmId)}`, { method: "DELETE" }).catch(() => {})
}

/* Browser test calls -------------------------------------------------------------------- */

export type WebCallTicket = { callId: string; accessToken: string; transport: "gateway" | "livekit" | null; iceServers: RTCIceServerLike[]; expiresAt: number | null }
type RTCIceServerLike = { urls: string | string[]; username?: string; credential?: string }

export async function startStudioWebCall(api: RetellApi, agentId: string, startedBy: string): Promise<WebCallTicket> {
  await getStudioAgent(api, agentId)
  const data = await api<{ call_id?: string; access_token?: string; transport?: string; ice_servers?: RTCIceServerLike[]; expires_at?: number }>("/v3/create-web-call", {
    method: "POST",
    body: webCallRequestBody(agentId, startedBy),
  })
  if (!data?.call_id || !data.access_token) throw new StudioError("Retell didn't return a call. Try again.")
  return {
    callId: data.call_id,
    accessToken: data.access_token,
    transport: data.transport === "gateway" || data.transport === "livekit" ? data.transport : null,
    iceServers: Array.isArray(data.ice_servers) ? data.ice_servers : [],
    expiresAt: typeof data.expires_at === "number" ? data.expires_at : null,
  }
}

/* Phone numbers ------------------------------------------------------------------------- */

type RawNumber = {
  phone_number: string
  phone_number_pretty?: string | null
  nickname?: string | null
  inbound_agents?: Array<{ agent_id: string; agent_version?: number | string | null }> | null
  outbound_agents?: Array<{ agent_id: string; agent_version?: number | string | null }> | null
}

export type StudioNumber = {
  number: string
  pretty: string
  nickname: string
  inboundAgentId: string | null
  outboundAgentId: string | null
  inboundVersion: string | null
}

export async function listNumbers(api: RetellApi): Promise<StudioNumber[]> {
  const data = await api<{ items?: RawNumber[] } | RawNumber[]>("/v2/list-phone-numbers?limit=100")
  const items = Array.isArray(data) ? data : data.items ?? []
  return items.map((line) => ({
    number: line.phone_number,
    pretty: line.phone_number_pretty || line.phone_number,
    nickname: line.nickname ?? "",
    inboundAgentId: line.inbound_agents?.[0]?.agent_id ?? null,
    outboundAgentId: line.outbound_agents?.[0]?.agent_id ?? null,
    inboundVersion: line.inbound_agents?.[0]?.agent_version != null ? String(line.inbound_agents[0].agent_version) : null,
  }))
}

const E164 = /^\+1[2-9]\d{2}[2-9]\d{6}$|^\+[1-9]\d{7,14}$/

/**
 * Puts an agent on a number for inbound and outbound calls. Studio agents are never published, so they
 * answer with their latest draft; any other agent keeps answering with its latest published version
 * when it has one.
 */
export async function assignNumber(api: RetellApi, number: string, agentId: string) {
  if (!E164.test(number)) throw new StudioError("That phone number doesn't look right.")
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(agentId)) throw new StudioError("Pick an agent.")
  const numbers = await listNumbers(api)
  if (!numbers.some((line) => line.number === number)) throw new StudioError("That number isn't on the Retell account.")
  const agent = await api<RawAgent>(`/get-agent/${encodeURIComponent(agentId)}`)
  let version: string | number = "latest"
  if (!isStudioName(agent.agent_name)) {
    const published = await api<{ version?: number }>(`/get-agent/${encodeURIComponent(agentId)}?version=latest_published`).catch(() => null)
    if (published && typeof published.version === "number") version = "latest_published"
  }
  const binding = [{ agent_id: agentId, agent_version: version, weight: 1 }]
  await api(`/update-phone-number/${encodeURIComponent(number)}`, { method: "PATCH", body: { inbound_agents: binding, outbound_agents: binding } })
}

export async function renameNumber(api: RetellApi, number: string, nickname: string) {
  if (!E164.test(number)) throw new StudioError("That phone number doesn't look right.")
  const clean = nickname.replace(/[\u0000-\u001F\u007F]/g, "").trim().slice(0, 60)
  await api(`/update-phone-number/${encodeURIComponent(number)}`, { method: "PATCH", body: { nickname: clean || null } })
}
