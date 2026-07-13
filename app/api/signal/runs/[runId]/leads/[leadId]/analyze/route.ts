import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { queueSignalBusinessAnalysis } from "@/lib/signal/analyze-business"
import { createAdminClient } from "@/lib/supabase/admin"

function firstUrl(...values: unknown[]) {
  for (const value of values) {
    if (typeof value === "string" && /^https?:\/\//i.test(value)) return value
    if (Array.isArray(value)) {
      const found = value.find((item) => typeof item === "string" && /^https?:\/\//i.test(item))
      if (typeof found === "string") return found
    }
  }
  return null
}

function summary(value: unknown) {
  if (!Array.isArray(value)) return null
  const item = value.find((entry) => typeof entry === "string" || (entry && typeof entry === "object"))
  if (typeof item === "string") return item
  if (item && typeof item === "object") {
    const record = item as Record<string, unknown>
    return [record.signal, record.supportingEvidence, record.suggestedMountlineSolution].filter(Boolean).join(": ") || null
  }
  return null
}

function pitchAngle(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  for (const key of ["best_angle", "strongest_honest_angle", "best_pitch_angle", "pitch_angle"]) {
    if (typeof record[key] === "string") return record[key] as string
  }
  return null
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ runId: string; leadId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response
  const { runId, leadId } = await params
  const supabase = createAdminClient()
  const { data: lead, error } = await supabase
    .from("signal_run_leads")
    .select("*")
    .eq("id", leadId)
    .eq("run_id", runId)
    .maybeSingle()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  if (!lead) return NextResponse.json({ error: "Scout suggestion not found." }, { status: 404 })

  const businessInput = [
    lead.canonical_name || lead.business_name,
    [lead.city, lead.state].filter(Boolean).join(", "),
    lead.website_url || lead.provider_listing_url || firstUrl(lead.social_profiles, lead.social_links, lead.source_urls),
    lead.phone,
  ].filter(Boolean).join(" — ")
  const observation = [
    "Moved from an experimental Scout discovery run. Re-verify all public claims before outreach.",
    summary(lead.opportunity_signals) ? `Scout opportunity summary: ${summary(lead.opportunity_signals)}` : null,
    pitchAngle(lead.sales_pack) ? `Scout suggested angle: ${pitchAngle(lead.sales_pack)}` : null,
  ].filter(Boolean).join("\n\n")

  try {
    const queued = await queueSignalBusinessAnalysis({
      businessInput,
      observation,
      createdBy: authCheck.access.userId,
      source: "scout_suggestion",
    })
    await supabase.from("signal_run_leads").update({ status: "saved" }).eq("id", leadId)
    return NextResponse.json({
      signal_prospect: queued.prospect,
      workspace_url: `/dashboard/signal/${queued.prospect.id}`,
    })
  } catch (caught) {
    return NextResponse.json(
      { error: caught instanceof Error ? caught.message : "Suggestion could not be opened in Signal." },
      { status: 500 },
    )
  }
}
