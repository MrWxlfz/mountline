import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { isClearlyNonOfficialSignalSource } from "@/lib/signal/research"
import { signalCampaignCandidatePatchSchema } from "@/lib/signal/validation"
import { normalizeSignalUrl } from "@/lib/signal/website"
import { createAdminClient } from "@/lib/supabase/admin"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ campaignId: string; candidateId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalCampaignCandidatePatchSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid candidate update." },
      { status: 400 },
    )
  }

  const update: Record<string, unknown> = { ...parsed.data }
  if (parsed.data.likely_official_url) {
    const normalized = normalizeSignalUrl(parsed.data.likely_official_url)
    if (!normalized) {
      return NextResponse.json({ error: "Official URL could not be parsed." }, { status: 400 })
    }
    if (isClearlyNonOfficialSignalSource(normalized.toString())) {
      return NextResponse.json(
        { error: "Choose an official public website, not a social, search, or directory URL." },
        { status: 400 },
      )
    }
    update.likely_official_url = normalized.toString()
    update.official_source_confidence = "medium"
  }

  if (parsed.data.candidate_status === "approved" && !parsed.data.likely_official_url) {
    update.official_source_confidence = "medium"
  }

  const { campaignId, candidateId } = await params
  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from("signal_campaign_candidates")
    .update(update)
    .eq("id", candidateId)
    .eq("campaign_id", campaignId)
    .select()
    .maybeSingle()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!data) return NextResponse.json({ error: "Candidate not found." }, { status: 404 })

  return NextResponse.json({ candidate: data })
}
