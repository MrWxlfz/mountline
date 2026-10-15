import type { Metadata } from "next"
import { ReceptionistPortal } from "@/components/receptionist-portal/portal"
import { StaffApp, type StaffInitial } from "@/components/receptionist-portal/staff/staff-app"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { listCalls, retellApi, retellConfig, RetellError } from "@/lib/receptionist/retell"
import { listAgents, loadStudioAgent, StudioError } from "@/lib/receptionist/studio/service"

export const metadata: Metadata = {
  title: { absolute: "Staff app · Mountline" },
  robots: { index: false, follow: false },
}

/**
 * A web simulation of the staff app (the real one will be a native iPad/iPhone app): a receptionist's
 * calls as the business sees them, with notifications for priority events. Team-only. Studio opens it
 * the moment a test call ends (?call=…); phone calls to the receptionist's number show up here too.
 */
export default async function StaffPage({ searchParams }: { searchParams: Promise<{ agent?: string; call?: string }> }) {
  const { agent, call } = await searchParams
  const query = new URLSearchParams()
  if (typeof agent === "string" && agent) query.set("agent", agent)
  await requireNorthlineTeamMember(`/receptionist/staff${query.size ? `?${query}` : ""}`)
  return (
    <ReceptionistPortal view="staff">
      <StaffApp initial={await loadStaff(typeof agent === "string" ? agent : null, typeof call === "string" ? call : null)} />
    </ReceptionistPortal>
  )
}

async function loadStaff(agent: string | null, call: string | null): Promise<StaffInitial> {
  if (!retellConfig().ready) return { ok: false, error: "RETELL_API_KEY isn't set on the server." }
  try {
    const { studio } = await listAgents(retellApi)
    const agentId = agent ?? studio[0]?.id ?? null
    if (!agentId) return { ok: false, error: "There aren't any Studio receptionists yet. Create one in Studio, then come back." }
    const [detail, calls] = await Promise.all([loadStudioAgent(retellApi, agentId), listCalls(agentId, 25)])
    if (!detail.config) return { ok: false, error: "This receptionist's settings couldn't be read. Open it in Studio and save it again." }
    return {
      ok: true,
      agentId: detail.id,
      receptionists: studio.map((entry) => ({ id: entry.id, name: entry.businessName })),
      business: detail.config.businessName,
      industry: detail.config.industry,
      demo: detail.config.mode === "demo",
      calls,
      focusCallId: call && /^[A-Za-z0-9_.:-]{1,200}$/.test(call) ? call : null,
      loadedAt: Date.now(),
    }
  } catch (error) {
    return { ok: false, error: error instanceof StudioError || error instanceof RetellError ? error.message : "Couldn't load this receptionist from Retell." }
  }
}
