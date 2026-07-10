import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { getSignalLeadRunSnapshot } from "@/lib/signal/lead-runs"

export const dynamic = "force-dynamic"
export const revalidate = 0

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
}

function json(payload: unknown, status = 200) {
  return NextResponse.json(payload, { status, headers: NO_STORE_HEADERS })
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ runId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { runId } = await params

  try {
    const snapshot = await getSignalLeadRunSnapshot(runId)
    if (!snapshot) return json({ error: "Lead run not found." }, 404)

    return json({
      run: snapshot.run,
      leads: snapshot.leads,
      events: snapshot.events,
    })
  } catch (error) {
    console.error("[signal] Lead run snapshot failed:", error)
    const message = errorMessage(error, "Signal could not load this lead run.")
    return json({ error: message }, /not found/i.test(message) ? 404 : 500)
  }
}
