"use server"

import { getNorthlineTeamAccess } from "@/lib/auth/team"
import { RetellError, getCall, retellApi, retellConfig, type CallDetail } from "@/lib/receptionist/retell"
import { asTeamMember, createRateLimit, type Result } from "@/lib/receptionist/studio/guard"
import {
  StudioError,
  assignNumber,
  createStudioAgent,
  deleteStudioAgent,
  isCallId,
  listAgents,
  listNumbers,
  loadOverview,
  loadStudioAgent,
  renameNumber,
  startStudioWebCall,
  stopStudioWebCall,
  updateStudioAgent,
  type SaveResult,
  type StudioAgentDetail,
  type StudioNumber,
  type StudioOverview,
  type WebCallTicket,
} from "@/lib/receptionist/studio/service"

/*
 * Receptionist Studio actions. Server actions are public endpoints in their own right, so each one checks
 * Mountline team membership itself. The Retell key stays on the server; the browser only ever gets a
 * short-lived web-call access token for an agent Studio made.
 */

const saves = createRateLimit(12, 10 * 60_000)
const calls = createRateLimit(20, 60 * 60_000)
const lineChanges = createRateLimit(20, 10 * 60_000)

function explain(error: unknown) {
  if (error instanceof StudioError || error instanceof RetellError) return error.message
  console.error("[studio]", error)
  return "Something went wrong. Try again."
}

function team<T>(work: (userId: string) => Promise<T>): Promise<Result<T>> {
  return asTeamMember(getNorthlineTeamAccess, async (userId) => {
    if (!retellConfig().ready) throw new StudioError("RETELL_API_KEY isn't set on the server.")
    return work(userId)
  }, explain)
}

function limit(take: ReturnType<typeof createRateLimit>, userId: string, what: string) {
  const result = take(userId)
  if (!result.allowed) throw new StudioError(`That's a lot of ${what} in a short time. Try again in ${Math.ceil(result.retryInSeconds / 60)} min.`)
}

export async function loadStudio(): Promise<Result<StudioOverview>> {
  return team(() => loadOverview(retellApi))
}

export async function openStudioAgent(agentId: string): Promise<Result<StudioAgentDetail>> {
  return team(() => loadStudioAgent(retellApi, String(agentId)))
}

/** Creates a receptionist, or updates the given one in place. Only runs on an explicit click. */
export async function saveStudioAgent(config: unknown, agentId: string | null): Promise<Result<SaveResult>> {
  return team(async (userId) => {
    limit(saves, userId, "saves")
    if (agentId) return updateStudioAgent(retellApi, String(agentId), config)
    const { studio } = await listAgents(retellApi)
    return createStudioAgent(retellApi, config, studio.length)
  })
}

export async function removeStudioAgent(agentId: string): Promise<Result<null>> {
  return team(async () => {
    await deleteStudioAgent(retellApi, String(agentId))
    return null
  })
}

export async function startStudioTestCall(agentId: string): Promise<Result<WebCallTicket>> {
  return team(async (userId) => {
    limit(calls, userId, "test calls")
    return startStudioWebCall(retellApi, String(agentId), userId)
  })
}

export async function readStudioCall(callId: string): Promise<Result<CallDetail>> {
  return team(() => {
    if (!isCallId(String(callId))) throw new StudioError("That call ID doesn't look right.")
    return getCall(String(callId))
  })
}

/** Ends a browser test call on Retell's side too, so its post-call analysis can run. */
export async function stopStudioTestCall(callId: string): Promise<Result<null>> {
  return team(async () => {
    await stopStudioWebCall(retellApi, String(callId))
    return null
  })
}

export async function setNumberAgent(number: string, agentId: string): Promise<Result<StudioNumber[]>> {
  return team(async (userId) => {
    limit(lineChanges, userId, "number changes")
    await assignNumber(retellApi, String(number), String(agentId))
    return listNumbers(retellApi)
  })
}

export async function setNumberNickname(number: string, nickname: string): Promise<Result<StudioNumber[]>> {
  return team(async (userId) => {
    limit(lineChanges, userId, "number changes")
    await renameNumber(retellApi, String(number), String(nickname ?? ""))
    return listNumbers(retellApi)
  })
}
