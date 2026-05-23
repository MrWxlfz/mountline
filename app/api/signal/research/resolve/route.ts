import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import {
  findLikelySignalDuplicates,
  runSignalPublicResearch,
} from "@/lib/signal/research"
import { signalResearchResolveSchema } from "@/lib/signal/validation"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect } from "@/lib/supabase/types"

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalResearchResolveSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid research request" },
      { status: 400 },
    )
  }

  const input = parsed.data
  const result = await runSignalPublicResearch({
    businessName: input.business_name,
    industryHint: input.industry_hint,
    location: input.location,
  })

  const supabase = createAdminClient()
  const { data: prospects } = await supabase.from("signal_prospects").select("*")
  const duplicates = findLikelySignalDuplicates((prospects || []) as SignalProspect[], {
    businessName: input.business_name,
    websiteUrl: result.candidates[0]?.url,
  }).map((match) => ({
    prospect_id: match.prospect.id,
    business_name: match.prospect.business_name,
    website_url: match.prospect.website_url,
    outreach_status: match.prospect.outreach_status,
    reasons: match.reasons,
  }))

  const { data: researchRun, error } = await supabase
    .from("signal_research_runs")
    .insert({
      business_name: input.business_name,
      location: input.location,
      industry_hint: input.industry_hint || null,
      known_context: input.known_context || null,
      initial_note: input.initial_note || null,
      provider: result.provider,
      query: result.query,
      status: result.ok && result.candidates.length > 0 ? "needs_confirmation" : "failed",
      candidates: result.candidates,
      error: result.ok ? null : result.setup_message,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  if (!result.ok) {
    return NextResponse.json(
      {
        error: result.setup_message,
        research_run: researchRun,
        candidates: result.candidates,
        duplicates,
      },
      { status: 503 },
    )
  }

  if (result.candidates.length === 0) {
    return NextResponse.json(
      {
        error: "No likely public business match was found. Try a more exact business name or location.",
        research_run: researchRun,
        candidates: [],
        duplicates,
      },
      { status: 404 },
    )
  }

  return NextResponse.json({
    research_run: researchRun,
    candidates: result.candidates,
    duplicates,
  })
}
