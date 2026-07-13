import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { queueSignalBusinessAnalysis } from "@/lib/signal/analyze-business"
import { signalBusinessAnalysisRequestSchema } from "@/lib/signal/validation"

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalBusinessAnalysisRequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid analysis request." },
      { status: 400 },
    )
  }

  try {
    const result = await queueSignalBusinessAnalysis({
      businessInput: parsed.data.business_input,
      observation: parsed.data.observation,
      createdBy: authCheck.access.userId,
      analyzeNow: parsed.data.analyze_now,
    })
    return NextResponse.json({
      prospect: result.prospect,
      reused: result.reused,
      analysis_status: result.prospect.analysis_status,
      workspace_url: `/dashboard/signal/${result.prospect.id}`,
    }, { status: result.reused ? 200 : 201 })
  } catch (error) {
    console.error("[signal] Focused analysis queue failed:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Analysis could not be queued." },
      { status: 500 },
    )
  }
}
