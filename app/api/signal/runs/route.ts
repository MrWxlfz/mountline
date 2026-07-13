import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import {
  createSignalLeadRun,
  getSignalLeadRunProviderSetup,
  signalLeadRunCreateSchema,
} from "@/lib/signal/lead-runs"
import { createAdminClient } from "@/lib/supabase/admin"

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

export async function GET() {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const supabase = createAdminClient()
  const [{ data: runs, error: runsError }, { data: savedLeads, error: savedLeadsError }] =
    await Promise.all([
      supabase
        .from("signal_runs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(12),
      supabase
        .from("signal_run_leads")
        .select("*")
        .eq("status", "saved")
        .order("updated_at", { ascending: false })
        .limit(12),
    ])

  if (runsError) return json({ error: runsError.message }, 500)
  if (savedLeadsError) return json({ error: savedLeadsError.message }, 500)

  return json({
    runs: runs || [],
    savedLeads: savedLeads || [],
    providerSetup: getSignalLeadRunProviderSetup(),
  })
}

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalLeadRunCreateSchema.safeParse(body)
  if (!parsed.success) {
    return json(
      { error: parsed.error.issues[0]?.message || "Invalid lead run." },
      400,
    )
  }

  try {
    const result = await createSignalLeadRun({
      input: parsed.data,
      createdBy: authCheck.access.userId,
    })

    return json(
      {
        run: result.run,
        providerSetup: result.providerSetup,
      },
      201,
    )
  } catch (error) {
    console.error("[signal] Lead run creation failed:", error)
    const message = errorMessage(error, "Signal could not create this lead run.")
    const setupIssue = /GOOGLE_PLACES_API_KEY|TAVILY_API_KEY|public research enabled/i.test(message)
    return json({ error: message }, setupIssue ? 503 : 500)
  }
}
