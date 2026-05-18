import "server-only"

import type { ScoutProspect } from "@/lib/supabase/types"
import type { ScoutScore, WebsiteSnapshot } from "./types"
import { scoreWithOpenRouter } from "./openrouter"
import { fetchWebsiteSnapshot } from "./website"

const STRONG_FIT_INDUSTRIES = [
  "restaurant",
  "contractor",
  "construction",
  "roofing",
  "plumbing",
  "electrical",
  "landscaping",
  "gym",
  "fitness",
  "beauty",
  "salon",
  "spa",
  "auto",
  "detail",
  "detailing",
  "clinic",
  "dental",
  "med spa",
  "real estate",
  "law",
]

function clampScore(value: number) {
  return Math.max(0, Math.min(100, Math.round(value)))
}

function asLower(value: string | null | undefined) {
  return value?.toLowerCase() || ""
}

function getIndustryFit(industry: string | null) {
  const normalized = asLower(industry)
  if (!normalized) return 6
  return STRONG_FIT_INDUSTRIES.some((keyword) => normalized.includes(keyword)) ? 16 : 9
}

function scoreWebsite(prospect: ScoutProspect, website: WebsiteSnapshot) {
  if (!prospect.website) return 12
  if (website.error) return 26

  let score = 34
  if (website.title) score += 10
  if (website.metaDescription) score += 10
  if (website.headings.length > 0) score += 10
  if (website.contactSignals.includes("phone visible")) score += 8
  if (website.contactSignals.includes("email visible")) score += 6
  if (website.contactSignals.includes("booking signal")) score += 8
  if (website.contactSignals.includes("services described")) score += 8
  if (website.bodyText.length < 500) score -= 10
  if (!website.metaDescription) score -= 5

  return clampScore(score)
}

function buildFallbackScore(
  prospect: ScoutProspect,
  website: WebsiteSnapshot,
): ScoutScore {
  const websiteScore = scoreWebsite(prospect, website)
  const reasons: string[] = []
  const redFlags: string[] = []

  let opportunity = 30
  opportunity += getIndustryFit(prospect.industry)

  if (prospect.city || prospect.state) {
    opportunity += 8
    reasons.push("Clear local market signal.")
  }

  if (typeof prospect.google_review_count === "number") {
    if (prospect.google_review_count >= 75) {
      opportunity += 15
      reasons.push("Strong public review volume suggests active demand.")
    } else if (prospect.google_review_count >= 20) {
      opportunity += 10
      reasons.push("Review count suggests an established local business.")
    } else if (prospect.google_review_count > 0) {
      opportunity += 4
    } else {
      redFlags.push("No public review count entered.")
    }
  }

  if (typeof prospect.google_rating === "number") {
    if (prospect.google_rating >= 4.4) {
      opportunity += 8
      reasons.push("Public rating is healthy enough to support trust-building copy.")
    } else if (prospect.google_rating < 3.7) {
      opportunity -= 10
      redFlags.push("Low public rating could make acquisition harder.")
    }
  }

  if (!prospect.website) {
    opportunity += 22
    reasons.push("No website is listed, so a simple web presence could be useful.")
    redFlags.push("No website available to inspect.")
  } else if (website.error) {
    opportunity += 14
    reasons.push("Website could not be cleanly inspected, which may indicate a fixable web presence issue.")
    redFlags.push(`Website check issue: ${website.error}.`)
  } else if (websiteScore < 55) {
    opportunity += 18
    reasons.push("Homepage has visible gaps in structure, metadata, or contact clarity.")
  } else if (websiteScore < 75) {
    opportunity += 10
    reasons.push("Website has a foundation, but there is room to improve conversion clarity.")
  } else {
    opportunity += 2
    reasons.push("Website appears reasonably complete, so the fit may depend on systems or portal needs.")
  }

  if (website.contactSignals.includes("booking signal")) {
    opportunity += 4
    reasons.push("Booking or scheduling language points to a workflow Mountline could improve.")
  }

  if (prospect.email || prospect.phone) {
    reasons.push("Public business contact information was entered for team review.")
  } else {
    redFlags.push("No public business email or phone was entered.")
  }

  const opportunityScore = clampScore(opportunity)
  const fit =
    opportunityScore >= 85
      ? "high"
      : opportunityScore >= 65
        ? "medium"
        : "low"

  return {
    website_score: websiteScore,
    opportunity_score: opportunityScore,
    estimated_project_fit: fit,
    reasons: reasons.slice(0, 8),
    website_notes: website.notes,
    ai_summary:
      fit === "high"
        ? `${prospect.business_name} looks like a strong Scout prospect based on public business signals and website opportunity.`
        : `${prospect.business_name} has some useful signals, but the fit should be reviewed before outreach.`,
    outreach_angle:
      fit === "high"
        ? `Lead with a practical website or workflow improvement tied to ${prospect.industry || "their service business"} demand signals.`
        : "Review the business manually and keep any outreach specific to visible website gaps.",
    red_flags: redFlags.slice(0, 8),
  }
}

export async function scoreScoutProspect(prospect: ScoutProspect) {
  const website = await fetchWebsiteSnapshot(prospect.website)
  const aiScore = await scoreWithOpenRouter(prospect, website)

  return aiScore || buildFallbackScore(prospect, website)
}
