import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { OwnerView, type OwnerInitial } from "@/components/receptionist-portal/owner/owner-view"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { listCalls, retellApi, retellConfig, RetellError } from "@/lib/receptionist/retell"
import { loadStudioAgent, StudioError } from "@/lib/receptionist/studio/service"

export const metadata: Metadata = {
  title: { absolute: "Owner view · Mountline" },
  robots: { index: false, follow: false },
}

/**
 * What the business owner would see: their receptionist's calls, a notification for priority events,
 * and everything each call captured. Team-only, like the rest of /receptionist. Studio sends you here
 * the moment a test call ends (?call=…); phone calls to the receptionist's number show up here too.
 */
export default async function OwnerPage({ searchParams }: { searchParams: Promise<{ agent?: string; call?: string }> }) {
  const { agent, call } = await searchParams
  if (typeof agent !== "string" || !agent) redirect("/receptionist?view=studio")
  await requireNorthlineTeamMember(`/receptionist/owner?agent=${encodeURIComponent(agent)}`)
  return <OwnerView initial={await loadOwner(agent, call)} />
}

async function loadOwner(agent: string, call: string | undefined): Promise<OwnerInitial> {
  if (!retellConfig().ready) return { ok: false, error: "RETELL_API_KEY isn't set on the server." }
  try {
    const [detail, calls] = await Promise.all([loadStudioAgent(retellApi, agent), listCalls(agent, 25)])
    if (!detail.config) return { ok: false, error: "This receptionist's settings couldn't be read. Open it in Studio and save it again." }
    return {
      ok: true,
      agentId: detail.id,
      business: detail.config.businessName,
      industry: detail.config.industry,
      demo: detail.config.mode === "demo",
      calls,
      focusCallId: typeof call === "string" && /^[A-Za-z0-9_.:-]{1,200}$/.test(call) ? call : null,
      loadedAt: Date.now(),
    }
  } catch (error) {
    return { ok: false, error: error instanceof StudioError || error instanceof RetellError ? error.message : "Couldn't load this receptionist from Retell." }
  }
}
