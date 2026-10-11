"use server"

import { getNorthlineTeamAccess } from "@/lib/auth/team"
import {
  OUTBOUND_DAILY_LIMIT,
  RetellError,
  createCall,
  endCall,
  getAgent,
  getCall,
  getDemoLine,
  getLlm,
  listCalls,
  normalizeUsNumber,
  outboundCallsToday,
  pointLineAtLatest,
  updateLlm,
  type CallDetail,
  type CallSummary,
} from "@/lib/receptionist/retell"

/*
 * Live-demo portal actions. Server actions are reachable endpoints on their own, so every one checks
 * Mountline team membership again instead of trusting the page that rendered it.
 */

type Result<T> = { ok: true; data: T } | { ok: false; error: string }

async function asTeam<T>(work: (userId: string) => Promise<T>): Promise<Result<T>> {
  const access = await getNorthlineTeamAccess()
  if (!access.isTeamMember || !access.userId) return { ok: false, error: "Sign in with your Mountline team account." }
  try {
    return { ok: true, data: await work(access.userId) }
  } catch (error) {
    return { ok: false, error: error instanceof RetellError ? error.message : "Something went wrong. Try again." }
  }
}

async function demoAgentId() {
  const line = await getDemoLine()
  const agentId = line.inbound[0]?.agent_id ?? line.outbound[0]?.agent_id
  if (!agentId) throw new RetellError("No agent answers the demo number yet. Assign one in Retell.")
  return agentId
}

/** Calls the prospect's phone from the demo line, with the demo receptionist on the other end. */
export async function placeDemoCall(rawNumber: string): Promise<Result<{ id: string }>> {
  return asTeam(async (userId) => {
    const to = normalizeUsNumber(typeof rawNumber === "string" ? rawNumber : "")
    if (!to) throw new RetellError("Enter a 10-digit US phone number.")
    const agentId = await demoAgentId()
    if ((await outboundCallsToday(agentId)) >= OUTBOUND_DAILY_LIMIT) {
      throw new RetellError(`That's ${OUTBOUND_DAILY_LIMIT} demo calls in the last 24 hours. Try again later.`)
    }
    const call = await createCall({ to, agentId, startedBy: userId })
    return { id: call.id }
  })
}

export async function readCall(callId: string): Promise<Result<CallDetail>> {
  return asTeam(() => getCall(String(callId)))
}

export async function hangUp(callId: string): Promise<Result<null>> {
  return asTeam(async () => {
    await endCall(String(callId))
    return null
  })
}

export async function recentCalls(): Promise<Result<CallSummary[]>> {
  return asTeam(async () => listCalls(await demoAgentId()))
}

/** Saves new instructions and a first line to the demo agent itself (it keeps them until changed). */
export async function publishToAgent(changes: { prompt: string; greeting: string }): Promise<Result<{ version: number | null }>> {
  return asTeam(async () => {
    const prompt = String(changes?.prompt ?? "").trim()
    const greeting = String(changes?.greeting ?? "").trim()
    if (prompt.length < 40) throw new RetellError("The instructions look empty. Write or generate them first.")
    if (prompt.length > 20000) throw new RetellError("The instructions are too long (20,000 characters max).")
    if (!greeting || greeting.length > 500) throw new RetellError("Add a first line under 500 characters.")
    const agent = await getAgent(await demoAgentId())
    if (!agent.llmId) throw new RetellError("This agent doesn't use a Retell LLM prompt, so it can't be tuned here.")
    await updateLlm(agent.llmId, { prompt, greeting })
    const llm = await getLlm(agent.llmId)
    return { version: llm.version }
  })
}

/** Makes the demo number answer with the agent's latest version, so published changes reach calls. */
export async function pointDemoLineAtLatest(): Promise<Result<null>> {
  return asTeam(async () => {
    await pointLineAtLatest(await demoAgentId())
    return null
  })
}
