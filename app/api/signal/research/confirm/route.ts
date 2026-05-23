import { NextResponse } from "next/server"
import { requireNorthlineTeamMemberApi } from "@/lib/auth/team"
import { runAndStoreInitialSignalAnalysis } from "@/lib/signal/analysis"
import { isSignalProspectSuppressed } from "@/lib/signal/alerts"
import { getSignalPlaybook, inferSignalPlaybook } from "@/lib/signal/playbooks"
import {
  findLikelySignalDuplicates,
  normalizeSignalHostname,
  type SignalResearchCandidate,
} from "@/lib/signal/research"
import {
  normalizeProspectInput,
  signalResearchConfirmSchema,
} from "@/lib/signal/validation"
import { normalizeSignalUrl, scanSignalWebsite, type SignalWebsiteScan } from "@/lib/signal/website"
import { createAdminClient } from "@/lib/supabase/admin"
import type { SignalProspect, SignalResearchRun } from "@/lib/supabase/types"

const NON_OFFICIAL_HOST_PARTS = [
  "google.",
  "maps.google",
  "facebook.com",
  "instagram.com",
  "linkedin.com",
  "yelp",
  "yellowpages",
  "mapquest",
  "nextdoor",
]

function locationParts(location: string) {
  const [city, state] = location.split(",").map((part) => part.trim())
  return { city: city || null, state: state || null }
}

function firstContactLink(scan: SignalWebsiteScan) {
  const links = scan.pages.flatMap((page) => page.links)
  return links.find((link) => /contact|quote|estimate|request/i.test(link)) || null
}

function firstInstagramLink(scan: SignalWebsiteScan) {
  return scan.social_links.find((link) => link.toLowerCase().includes("instagram.com")) || null
}

function isClearlyNotOfficialSite(url: string) {
  const host = normalizeSignalHostname(url)
  return !host || NON_OFFICIAL_HOST_PARTS.some((part) => host.includes(part))
}

function candidateFromRun(run: SignalResearchRun, url: string) {
  return Array.isArray(run.candidates)
    ? (run.candidates as unknown[]).find(
        (candidate) =>
          candidate &&
          typeof candidate === "object" &&
          "url" in candidate &&
          normalizeSignalHostname(String((candidate as Record<string, unknown>).url)) ===
            normalizeSignalHostname(url),
      ) as SignalResearchCandidate | undefined
    : undefined
}

function mergeProspectFields(existing: SignalProspect, scan: SignalWebsiteScan, run: SignalResearchRun) {
  const update: Record<string, unknown> = {
    last_researched_at: new Date().toISOString(),
  }
  const { city, state } = locationParts(run.location)
  const contactForm = firstContactLink(scan)
  const instagram = firstInstagramLink(scan)

  if (!existing.website_url) update.website_url = scan.scanned_urls[0] || run.confirmed_official_url
  if (!existing.public_email && scan.visible_emails[0]) update.public_email = scan.visible_emails[0]
  if (!existing.public_phone && scan.visible_phones[0]) update.public_phone = scan.visible_phones[0]
  if (!existing.public_contact_form_url && contactForm) update.public_contact_form_url = contactForm
  if (!existing.instagram_url && instagram) update.instagram_url = instagram
  if (!existing.city && city) update.city = city
  if (!existing.state && state) update.state = state
  if (!existing.locality_relationship && run.known_context) update.locality_relationship = run.known_context
  if (!existing.existing_website_platform && scan.detected_website_platform) {
    update.existing_website_platform = scan.detected_website_platform
  }
  if (!existing.existing_booking_platform && scan.detected_booking_platform) {
    update.existing_booking_platform = scan.detected_booking_platform
  }
  if (!existing.human_notes && run.initial_note) update.human_notes = run.initial_note

  return update
}

export async function POST(request: Request) {
  const authCheck = await requireNorthlineTeamMemberApi()
  if (authCheck.response) return authCheck.response

  const body = await request.json().catch(() => null)
  const parsed = signalResearchConfirmSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid confirmation request" },
      { status: 400 },
    )
  }

  if (isClearlyNotOfficialSite(parsed.data.candidate_url)) {
    return NextResponse.json(
      { error: "Confirm a public official business website, not a social, search, or directory URL." },
      { status: 400 },
    )
  }

  const normalizedUrl = normalizeSignalUrl(parsed.data.candidate_url)
  if (!normalizedUrl) {
    return NextResponse.json({ error: "Official URL could not be parsed." }, { status: 400 })
  }

  const supabase = createAdminClient()
  const { data: runData, error: runError } = await supabase
    .from("signal_research_runs")
    .select("*")
    .eq("id", parsed.data.research_run_id)
    .maybeSingle()

  if (runError) return NextResponse.json({ error: runError.message }, { status: 500 })
  if (!runData) return NextResponse.json({ error: "Research run not found" }, { status: 404 })

  const researchRun = runData as SignalResearchRun
  const scan = await scanSignalWebsite(normalizedUrl.toString())
  const selectedCandidate = candidateFromRun(researchRun, normalizedUrl.toString()) || {
    title: parsed.data.candidate_title || normalizedUrl.hostname,
    url: normalizedUrl.toString(),
    source_type: "likely_official_site",
    evidence: "Manually confirmed by Mountline team.",
    confidence: scan.broken_response ? "low" : "medium",
  }

  if (scan.broken_response) {
    await supabase
      .from("signal_research_runs")
      .update({
        status: "failed",
        selected_candidate: selectedCandidate,
        confirmed_official_url: normalizedUrl.toString(),
        official_source_confidence: "low",
        evidence: scan.evidence,
        error: scan.error,
      })
      .eq("id", researchRun.id)

    return NextResponse.json(
      { error: scan.error || "Official site scan failed.", scan },
      { status: 422 },
    )
  }

  const { data: allProspects } = await supabase.from("signal_prospects").select("*")
  const duplicates = findLikelySignalDuplicates((allProspects || []) as SignalProspect[], {
    businessName: researchRun.business_name,
    email: scan.visible_emails[0],
    phone: scan.visible_phones[0],
    websiteUrl: normalizedUrl.toString(),
  })

  if (duplicates.length > 0 && !parsed.data.merge_prospect_id) {
    return NextResponse.json(
      {
        error: "A likely existing Signal prospect was found. Choose merge before importing.",
        duplicates: duplicates.map((match) => ({
          prospect_id: match.prospect.id,
          business_name: match.prospect.business_name,
          reasons: match.reasons,
        })),
      },
      { status: 409 },
    )
  }

  let prospect: SignalProspect
  let status: "created" | "merged" = "created"

  if (parsed.data.merge_prospect_id) {
    const { data: existingData, error: existingError } = await supabase
      .from("signal_prospects")
      .select("*")
      .eq("id", parsed.data.merge_prospect_id)
      .maybeSingle()

    if (existingError) return NextResponse.json({ error: existingError.message }, { status: 500 })
    if (!existingData) return NextResponse.json({ error: "Merge prospect not found" }, { status: 404 })

    const existing = existingData as SignalProspect
    const { data: updatedData, error: updateError } = await supabase
      .from("signal_prospects")
      .update(mergeProspectFields(existing, scan, researchRun))
      .eq("id", existing.id)
      .select()
      .single()

    if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })
    prospect = updatedData as SignalProspect
    status = "merged"
  } else {
    const { city, state } = locationParts(researchRun.location)
    const industry = researchRun.industry_hint || "general local business"
    const playbook = getSignalPlaybook(inferSignalPlaybook(industry))
    const prospectInput = normalizeProspectInput({
      business_name: researchRun.business_name,
      industry,
      industry_playbook: playbook.key,
      city,
      state,
      locality_relationship: researchRun.known_context,
      website_url: normalizedUrl.toString(),
      public_email: scan.visible_emails[0] || null,
      public_phone: scan.visible_phones[0] || null,
      public_contact_form_url: firstContactLink(scan),
      instagram_url: firstInstagramLink(scan),
      source: "public_web_research",
      existing_website_platform: scan.detected_website_platform,
      existing_booking_platform: scan.detected_booking_platform,
      human_notes: researchRun.initial_note,
      what_looks_good: null,
      visible_problem: null,
      relevant_demo: playbook.relevantDemo,
      outreach_mode: playbook.recommendedOutreachMode,
    })

    const { data: createdData, error: createError } = await supabase
      .from("signal_prospects")
      .insert(prospectInput)
      .select()
      .single()

    if (createError) return NextResponse.json({ error: createError.message }, { status: 500 })
    prospect = createdData as SignalProspect

    if (await isSignalProspectSuppressed(prospect)) {
      const { data: suppressedData } = await supabase
        .from("signal_prospects")
        .update({ outreach_status: "do_not_contact" })
        .eq("id", prospect.id)
        .select()
        .single()
      prospect = (suppressedData as SignalProspect | null) || prospect
    }
  }

  const initial = await runAndStoreInitialSignalAnalysis({
    prospect,
    scan,
    researchContext: {
      research_provider: researchRun.provider,
      research_query: researchRun.query,
      confirmed_official_url: normalizedUrl.toString(),
      official_source_confidence: selectedCandidate.confidence,
      candidate_urls: Array.isArray(researchRun.candidates)
        ? (researchRun.candidates as SignalResearchCandidate[]).map((candidate) => candidate.url)
        : [],
    },
  })

  await supabase
    .from("signal_research_runs")
    .update({
      status,
      prospect_id: prospect.id,
      created_prospect_id: prospect.id,
      selected_candidate: selectedCandidate,
      confirmed_official_url: normalizedUrl.toString(),
      official_source_confidence: selectedCandidate.confidence,
      evidence: {
        website: scan.evidence,
        contacts: {
          visible_emails: scan.visible_emails,
          visible_phones: scan.visible_phones,
          booking_links: scan.booking_links,
          social_links_found_on_official_site: scan.social_links,
        },
      },
      error: null,
    })
    .eq("id", researchRun.id)

  return NextResponse.json({
    prospect: initial.prospect,
    analysis: initial.analysis,
    scan,
    alert: initial.alert,
    merged: status === "merged",
    ai_unavailable: initial.ai_unavailable,
  })
}
