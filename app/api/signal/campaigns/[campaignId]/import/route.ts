import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { runAndStoreInitialSignalAnalysis } from "@/lib/signal/analysis"
import { isSignalProspectSuppressed } from "@/lib/signal/alerts"
import { getSignalPlaybook, inferSignalPlaybook } from "@/lib/signal/playbooks"
import {
  findLikelySignalDuplicates,
  isClearlyNonOfficialSignalSource,
} from "@/lib/signal/research"
import { normalizeProspectInput } from "@/lib/signal/validation"
import { normalizeSignalUrl, scanSignalWebsite, type SignalWebsiteScan } from "@/lib/signal/website"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalCampaign,
  SignalCampaignCandidate,
  SignalProspect,
} from "@/lib/supabase/types"

function mergeCandidateFields(
  existing: SignalProspect,
  candidate: SignalCampaignCandidate,
  scan: SignalWebsiteScan,
) {
  const update: Record<string, unknown> = {
    last_researched_at: new Date().toISOString(),
  }

  if (!existing.website_url) update.website_url = scan.scanned_urls[0] || candidate.likely_official_url
  if (!existing.public_email && scan.visible_emails[0]) update.public_email = scan.visible_emails[0]
  if (!existing.public_phone && scan.visible_phones[0]) update.public_phone = scan.visible_phones[0]
  if (!existing.public_contact_form_url && scan.booking_links[0]) update.public_contact_form_url = scan.booking_links[0]
  if (!existing.city && candidate.city) update.city = candidate.city
  if (!existing.state && candidate.state) update.state = candidate.state
  if (!existing.existing_website_platform && scan.detected_website_platform) {
    update.existing_website_platform = scan.detected_website_platform
  }
  if (!existing.existing_booking_platform && scan.detected_booking_platform) {
    update.existing_booking_platform = scan.detected_booking_platform
  }
  if (!existing.human_notes && candidate.source_snippet) {
    update.human_notes = `Campaign source: ${candidate.source_snippet}`
  }

  return update
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ campaignId: string }> },
) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const { campaignId } = await params
  const supabase = createAdminClient()
  const [{ data: campaignData }, { data: candidateData }] = await Promise.all([
    supabase
      .from("signal_campaigns")
      .select("*")
      .eq("id", campaignId)
      .maybeSingle(),
    supabase
      .from("signal_campaign_candidates")
      .select("*")
      .eq("campaign_id", campaignId)
      .eq("candidate_status", "approved")
      .order("created_at", { ascending: true }),
  ])

  if (!campaignData) return NextResponse.json({ error: "Campaign not found." }, { status: 404 })
  const campaign = campaignData as SignalCampaign
  const candidates = (candidateData || []) as SignalCampaignCandidate[]

  if (candidates.length === 0) {
    return NextResponse.json(
      { error: "Approve at least one candidate before importing." },
      { status: 400 },
    )
  }

  await supabase
    .from("signal_campaigns")
    .update({
      status: "researching",
      next_action: "Approved candidates are being imported and lightly scanned.",
    })
    .eq("id", campaign.id)

  const imported: Array<{ candidate_id: string; prospect_id: string; business_name: string }> = []
  const failed: Array<{ candidate_id: string; business_name: string; error: string }> = []

  for (const candidate of candidates.slice(0, campaign.max_candidates)) {
    const officialUrl = normalizeSignalUrl(candidate.likely_official_url || candidate.candidate_url)
    if (!officialUrl || isClearlyNonOfficialSignalSource(officialUrl.toString())) {
      const error = "Candidate needs a confirmed official public website before import."
      failed.push({ candidate_id: candidate.id, business_name: candidate.business_name, error })
      await supabase
        .from("signal_campaign_candidates")
        .update({ candidate_status: "needs_confirmation", reason: error })
        .eq("id", candidate.id)
      continue
    }

    const scan = await scanSignalWebsite(officialUrl.toString())
    if (scan.broken_response) {
      const error = scan.error || "Official public website scan failed."
      failed.push({ candidate_id: candidate.id, business_name: candidate.business_name, error })
      await supabase
        .from("signal_campaign_candidates")
        .update({ candidate_status: "research_failed", reason: error })
        .eq("id", candidate.id)
      continue
    }

    const { data: allProspects } = await supabase.from("signal_prospects").select("*")
    const duplicates = findLikelySignalDuplicates((allProspects || []) as SignalProspect[], {
      businessName: candidate.business_name,
      email: scan.visible_emails[0],
      phone: scan.visible_phones[0],
      websiteUrl: officialUrl.toString(),
    })
    const duplicateProspectId = candidate.duplicate_prospect_id || duplicates[0]?.prospect.id || null

    let prospect: SignalProspect | null = null
    if (duplicateProspectId) {
      const existing = ((allProspects || []) as SignalProspect[]).find(
        (item) => item.id === duplicateProspectId,
      )
      if (!existing) {
        const error = "Merge prospect was not found."
        failed.push({ candidate_id: candidate.id, business_name: candidate.business_name, error })
        await supabase
          .from("signal_campaign_candidates")
          .update({ candidate_status: "research_failed", reason: error })
          .eq("id", candidate.id)
        continue
      }

      const { data: updated, error: updateError } = await supabase
        .from("signal_prospects")
        .update(mergeCandidateFields(existing, candidate, scan))
        .eq("id", existing.id)
        .select()
        .single()

      if (updateError) {
        failed.push({
          candidate_id: candidate.id,
          business_name: candidate.business_name,
          error: updateError.message,
        })
        continue
      }
      prospect = updated as SignalProspect
    } else {
      const industry = candidate.industry_hint || "general local business"
      const playbook = getSignalPlaybook(inferSignalPlaybook(industry))
      const prospectInput = normalizeProspectInput({
        business_name: candidate.business_name,
        industry,
        industry_playbook: playbook.key,
        city: candidate.city || campaign.target_city,
        state: candidate.state || campaign.target_state,
        website_url: officialUrl.toString(),
        public_email: scan.visible_emails[0] || null,
        public_phone: scan.visible_phones[0] || null,
        public_contact_form_url: scan.booking_links[0] || null,
        source: "public_web_research",
        existing_website_platform: scan.detected_website_platform,
        existing_booking_platform: scan.detected_booking_platform,
        human_notes: [
          `Created from Signal campaign: ${campaign.name}.`,
          candidate.source_snippet ? `Source snippet: ${candidate.source_snippet}` : null,
        ].filter(Boolean).join("\n"),
        relevant_demo: playbook.relevantDemo,
        outreach_mode: playbook.recommendedOutreachMode,
        outreach_status: "needs_review",
      })

      const { data: created, error: createError } = await supabase
        .from("signal_prospects")
        .insert(prospectInput)
        .select()
        .single()

      if (createError) {
        failed.push({
          candidate_id: candidate.id,
          business_name: candidate.business_name,
          error: createError.message,
        })
        continue
      }
      prospect = created as SignalProspect
    }

    if (!prospect) continue

    if (await isSignalProspectSuppressed(prospect)) {
      const { data: suppressed } = await supabase
        .from("signal_prospects")
        .update({ outreach_status: "do_not_contact" })
        .eq("id", prospect.id)
        .select()
        .single()
      prospect = (suppressed as SignalProspect | null) || prospect
    }

    const result = await runAndStoreInitialSignalAnalysis({
      prospect,
      scan,
      researchContext: {
        research_provider: candidate.source_provider,
        research_query: `${candidate.industry_hint || "local business"} ${campaign.target_city} ${campaign.target_state || ""} official website`,
        confirmed_official_url: officialUrl.toString(),
        official_source_confidence: candidate.official_source_confidence || "medium",
        candidate_urls: [candidate.candidate_url, candidate.source_url].filter(Boolean) as string[],
      },
    })

    await supabase
      .from("signal_campaign_candidates")
      .update({
        candidate_status: "imported_to_signal",
        duplicate_prospect_id: result.prospect.id,
        likely_official_url: officialUrl.toString(),
        reason: duplicateProspectId
          ? "Merged into existing Signal prospect and refreshed lightweight analysis."
          : "Imported to Signal prospect and lightweight analysis completed.",
      })
      .eq("id", candidate.id)

    if (result.analysis.priority === "A" || result.analysis.priority === "B") {
      await supabase.from("signal_focus_items").insert({
        prospect_id: result.prospect.id,
        campaign_id: campaign.id,
        focus_reason:
          result.analysis.recommended_primary_offer ||
          "Imported from campaign and ranked as a strong prospect.",
        recommended_action:
          result.analysis.recommended_next_action ||
          "Review the imported campaign prospect before outreach.",
        due_date: new Date().toISOString().slice(0, 10),
        created_by: authCheck.access.emails[0] || authCheck.access.userId,
      })
    }

    imported.push({
      candidate_id: candidate.id,
      prospect_id: result.prospect.id,
      business_name: result.prospect.business_name,
    })
  }

  const nextAction =
    imported.length > 0
      ? "Review imported prospects, add promising records to Focus Mode, and prepare scripts manually."
      : "No candidates imported. Review failed candidates and confirm official websites."

  const { data: updatedCampaign } = await supabase
    .from("signal_campaigns")
    .update({
      status: imported.length > 0 ? "ready" : "review_candidates",
      next_action: nextAction,
    })
    .eq("id", campaign.id)
    .select()
    .single()

  return NextResponse.json({
    campaign: updatedCampaign,
    imported,
    failed,
  })
}
