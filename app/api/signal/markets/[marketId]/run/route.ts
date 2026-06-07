import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { runSignalMarketBuild } from "@/lib/signal/markets"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ marketId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { marketId } = await params
  try {
    const result = await runSignalMarketBuild(marketId)
    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Market build failed." },
      { status: 500 },
    )
  }
}
