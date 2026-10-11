import type { Metadata } from "next"
import { ReceptionistPortal, type PortalState } from "@/components/receptionist-portal/portal"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { getAgent, getDemoLine, getLlm, listCalls, retellConfig, RetellError } from "@/lib/receptionist/retell"

export const metadata: Metadata = {
  title: { absolute: "Receptionist demo · Mountline" },
  robots: { index: false, follow: false },
}

/**
 * The team-only live-demo portal for the AI receptionist (not a public page yet). Signed-out visitors
 * go to /id; signed-in non-team accounts go to /access-restricted.
 */
export default async function ReceptionistPortalPage() {
  await requireNorthlineTeamMember()
  return <ReceptionistPortal initial={await loadState()} />
}

async function loadState(): Promise<PortalState> {
  const config = retellConfig()
  if (!config.ready) return { status: "not-configured", phoneNumber: config.phoneNumber }
  try {
    const line = await getDemoLine()
    const agentId = line.inbound[0]?.agent_id ?? line.outbound[0]?.agent_id
    if (!agentId) return { status: "error", phoneNumber: config.phoneNumber, error: "No agent answers the demo number yet. Assign one in Retell." }
    const agent = await getAgent(agentId)
    const [llm, recent] = await Promise.all([agent.llmId ? getLlm(agent.llmId) : Promise.resolve(null), listCalls(agentId)])
    const binding = line.inbound.find((ref) => ref.agent_id === agentId) ?? line.inbound[0]
    return {
      status: "ready",
      phoneNumber: line.number,
      phonePretty: line.pretty,
      agent,
      llm,
      lineVersion: binding?.agent_version ?? null,
      recent,
    }
  } catch (error) {
    return {
      status: "error",
      phoneNumber: config.phoneNumber,
      error: error instanceof RetellError ? error.message : "Couldn't load the receptionist from Retell.",
    }
  }
}
