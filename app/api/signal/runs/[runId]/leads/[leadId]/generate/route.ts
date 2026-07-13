import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { generateSignalRunLeadSalesPack } from "@/lib/signal/lead-runs"

export const dynamic = "force-dynamic"
export const revalidate = 0
export const maxDuration = 60

const NO_STORE_HEADERS = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
}

function json(payload: unknown, status = 200) {
  return NextResponse.json(payload, { status, headers: NO_STORE_HEADERS })
}

function errorMessage(error: unknown, fallback: string) {
  return error instanceof Error && error.message.trim() ? error.message : fallback
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string; leadId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const kind =
    body && typeof body === "object" && !Array.isArray(body)
      ? (body as Record<string, unknown>).kind
      : null
  const notes = body && typeof body === "object" && !Array.isArray(body) && typeof (body as Record<string, unknown>).notes === "string"
    ? String((body as Record<string, unknown>).notes).trim().slice(0, 600)
    : ""

  if (kind !== "scripts" && kind !== "lovable") {
    return json({ error: "Generation kind must be scripts or lovable." }, 400)
  }

  const { leadId, runId } = await params
  try {
    const result = await generateSignalRunLeadSalesPack({
      runId,
      leadId,
      kind,
      notes,
      createdBy: authCheck.access.userId,
    })

    return json({ lead: result.lead })
  } catch (error) {
    console.error("[signal] Lead pack generation failed:", error)
    const message = errorMessage(error, "Signal could not generate this lead pack.")
    return json({ error: message }, /not found/i.test(message) ? 404 : /qualified completed lead/i.test(message) ? 409 : 500)
  }
}
