import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { approveSignalMarketCandidate } from "@/lib/signal/markets"
import { signalMarketCandidateApproveSchema } from "@/lib/signal/validation"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ marketId: string; candidateId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => ({}))
  const parsed = signalMarketCandidateApproveSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid approval request." },
      { status: 400 },
    )
  }

  const { marketId, candidateId } = await params
  try {
    const result = await approveSignalMarketCandidate({
      addToFocus: parsed.data.add_to_focus,
      candidateId,
      createdBy: authCheck.access.emails[0] || authCheck.access.userId,
      marketId,
      mergeProspectId: parsed.data.merge_prospect_id,
    })
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Candidate could not be approved." },
      { status: 500 },
    )
  }
}
