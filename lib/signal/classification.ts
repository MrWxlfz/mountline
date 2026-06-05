import "server-only"

import { runSignalClassificationAi } from "./ai"
import { getSignalPlaybook, type SignalPlaybookKey } from "./playbooks"
import {
  normalizeSignalBusinessName,
  normalizeSignalHostname,
  normalizeSignalPhone,
} from "./research"
import type {
  SignalCampaignCandidate,
  SignalClassificationAlias,
  SignalClassificationSource,
  SignalConfidence,
  SignalProspect,
  SignalProspectAliasType,
} from "@/lib/supabase/types"
import type { SignalWebsiteScan } from "./website"
import { createAdminClient } from "@/lib/supabase/admin"

type ClassificationEvidenceHit = {
  category: SignalPlaybookKey
  score: number
  snippet: string
}

type ClassificationSubject = {
  businessName: string
  city?: string | null
  state?: string | null
  industryHint?: string | null
  websiteUrl?: string | null
  manualOverride?: boolean
  selectedPlaybook?: string | null
  scan?: SignalWebsiteScan | null
  sourceSnippet?: string | null
  sourceTitle?: string | null
}

export type SignalClassificationResult = {
  playbook: SignalPlaybookKey
  source: SignalClassificationSource
  confidence: SignalConfidence
  evidence: string[]
  normalizedBusinessName: string
  normalizedHostname: string
  classifiedAt: string
  manualOverride: boolean
}

const CLASSIFICATION_KEYWORDS: Record<SignalPlaybookKey, string[]> = {
  auto_detailing: [
    "auto detail",
    "detailing",
    "ceramic coating",
    "paint correction",
    "car wash",
    "mobile detailing",
    "interior detail",
  ],
  barber_salon: [
    "barber",
    "barbershop",
    "salon",
    "haircut",
    "hair cut",
    "fade",
    "beard trim",
    "stylist",
    "blowout",
  ],
  hvac: [
    "hvac",
    "air conditioning",
    "heating",
    "cooling",
    "furnace",
    "air repair",
    "ac repair",
    "heat pump",
  ],
  roofing_contractors_home_services: [
    "roofing",
    "roofer",
    "contractor",
    "remodel",
    "construction",
    "plumbing",
    "electrician",
    "home services",
    "restoration",
  ],
  medical_dental: [
    "dental",
    "dentist",
    "orthodontist",
    "clinic",
    "medical",
    "physician",
    "doctor",
    "dermatology",
    "orthodontic",
    "oral surgery",
  ],
  restaurant_food: [
    "restaurant",
    "food truck",
    "catering",
    "cafe",
    "grill",
    "kitchen",
    "pizza",
    "coffee",
  ],
  beauty_wellness: [
    "beauty",
    "spa",
    "lashes",
    "nails",
    "esthetician",
    "facial",
    "wellness",
    "massage",
    "skincare",
    "med spa",
  ],
  general_local_business: [],
  unknown_needs_review: [],
}

const SOURCE_WEIGHTS = [
  { key: "businessName", label: "Business name", weight: 4 },
  { key: "industryHint", label: "Industry hint", weight: 3 },
  { key: "hostname", label: "Hostname", weight: 2 },
  { key: "pageTitle", label: "Homepage title", weight: 4 },
  { key: "metaDescription", label: "Meta description", weight: 3 },
  { key: "headings", label: "Headings", weight: 3 },
  { key: "serviceLanguage", label: "Service language", weight: 3 },
  { key: "sourceTitle", label: "Source title", weight: 2 },
  { key: "sourceSnippet", label: "Source snippet", weight: 2 },
] as const

function normalizeText(value: string | null | undefined) {
  return value?.replace(/\s+/g, " ").trim().toLowerCase() || ""
}

export function normalizeSignalCity(value: string | null | undefined) {
  return normalizeText(value).replace(/[^a-z0-9]+/g, " ").trim()
}

function normalizeSignalEmail(value: string | null | undefined) {
  const email = normalizeText(value)
  return email || ""
}

function compactEvidence(values: string[]) {
  return Array.from(new Set(values.filter(Boolean))).slice(0, 6)
}

function toKnownPlaybook(value: string | null | undefined): SignalPlaybookKey | null {
  if (!value) return null
  if (value in CLASSIFICATION_KEYWORDS) return value as SignalPlaybookKey
  return null
}

function buildSourcePool(subject: ClassificationSubject) {
  return {
    businessName: normalizeText(subject.businessName),
    industryHint: normalizeText(subject.industryHint),
    hostname: normalizeText(normalizeSignalHostname(subject.websiteUrl)),
    pageTitle: normalizeText(subject.scan?.page_title),
    metaDescription: normalizeText(subject.scan?.meta_description),
    headings: normalizeText(subject.scan?.headings.join(" ")),
    serviceLanguage: normalizeText(subject.scan?.service_language.join(" ")),
    sourceTitle: normalizeText(subject.sourceTitle),
    sourceSnippet: normalizeText(subject.sourceSnippet),
  }
}

function scoreDeterministicClassification(subject: ClassificationSubject) {
  const pool = buildSourcePool(subject)
  const hits: ClassificationEvidenceHit[] = []
  const scores = new Map<SignalPlaybookKey, number>()

  for (const [category, keywords] of Object.entries(CLASSIFICATION_KEYWORDS) as Array<
    [SignalPlaybookKey, string[]]
  >) {
    if (keywords.length === 0) continue

    for (const source of SOURCE_WEIGHTS) {
      const value = pool[source.key]
      if (!value) continue

      const matched = keywords.find((keyword) => value.includes(keyword))
      if (!matched) continue

      const bonus =
        category === "barber_salon" && ["businessName", "pageTitle"].includes(source.key)
          ? 1
          : category === "beauty_wellness" && matched === "med spa"
            ? 0
            : 0

      scores.set(category, (scores.get(category) || 0) + source.weight + bonus)
      hits.push({
        category,
        score: source.weight + bonus,
        snippet: `${source.label}: ${matched}`,
      })
    }
  }

  const ranked = Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([category, score]) => ({
      category,
      score,
      evidence: hits
        .filter((hit) => hit.category === category)
        .sort((a, b) => b.score - a.score)
        .map((hit) => hit.snippet),
    }))

  const top = ranked[0]
  const next = ranked[1]
  if (!top) {
    return {
      playbook: "unknown_needs_review" as SignalPlaybookKey,
      confidence: "low" as SignalConfidence,
      evidence: ["No strong deterministic category signals were found."],
      score: 0,
      margin: 0,
    }
  }

  const margin = top.score - (next?.score || 0)
  let confidence: SignalConfidence = "low"

  if (top.score >= 8 && margin >= 3) confidence = "high"
  else if (top.score >= 5 && margin >= 2) confidence = "medium"

  return {
    playbook: confidence === "low" ? top.category : top.category,
    confidence,
    evidence:
      compactEvidence(top.evidence).length > 0
        ? compactEvidence(top.evidence)
        : [`Deterministic signals favored ${getSignalPlaybook(top.category).name}.`],
    score: top.score,
    margin,
  }
}

async function findStoredAlias(subject: ClassificationSubject) {
  const normalizedHostname = normalizeSignalHostname(subject.websiteUrl)
  const normalizedBusinessName = normalizeSignalBusinessName(subject.businessName)
  const cityNormalized = normalizeSignalCity(subject.city)

  if (!normalizedHostname && !normalizedBusinessName) return null

  const supabase = createAdminClient()
  const clauses = []

  if (normalizedHostname) {
    clauses.push(
      supabase
        .from("signal_classification_aliases")
        .select("*")
        .eq("normalized_hostname", normalizedHostname)
        .eq("active", true)
        .limit(1)
        .maybeSingle(),
    )
  }

  if (normalizedBusinessName) {
    let query = supabase
      .from("signal_classification_aliases")
      .select("*")
      .eq("normalized_business_name", normalizedBusinessName)
      .eq("active", true)
      .limit(5)
    if (cityNormalized) query = query.eq("city_normalized", cityNormalized)
    clauses.push(query)
  }

  const results = await Promise.all(clauses)
  const exact = results.find((result) => Boolean((result as { data?: unknown }).data))
  if (!exact) return null

  const data = Array.isArray(exact.data)
    ? (exact.data[0] as SignalClassificationAlias | undefined)
    : (exact.data as SignalClassificationAlias | null)

  const playbook = toKnownPlaybook(data?.corrected_playbook || data?.corrected_category)
  if (!data || !playbook) return null

  return {
    playbook,
    evidence: compactEvidence([
      data.normalized_hostname ? `Stored alias matched hostname ${data.normalized_hostname}.` : "",
      data.normalized_business_name
        ? `Stored alias matched business name ${data.normalized_business_name}.`
        : "",
      data.note || "",
    ]),
  }
}

export async function resolveSignalClassification(
  subject: ClassificationSubject,
): Promise<SignalClassificationResult> {
  const classifiedAt = new Date().toISOString()
  const normalizedBusinessName = normalizeSignalBusinessName(subject.businessName)
  const normalizedHostname = normalizeSignalHostname(subject.websiteUrl)
  const manualPlaybook = toKnownPlaybook(subject.selectedPlaybook)

  if (subject.manualOverride && manualPlaybook) {
    return {
      playbook: manualPlaybook,
      source: "manual_override",
      confidence: "high",
      evidence: [`Manual override kept ${getSignalPlaybook(manualPlaybook).name}.`],
      normalizedBusinessName,
      normalizedHostname,
      classifiedAt,
      manualOverride: true,
    }
  }

  const alias = await findStoredAlias(subject)
  if (alias) {
    return {
      playbook: alias.playbook,
      source: "stored_alias",
      confidence: "high",
      evidence: alias.evidence,
      normalizedBusinessName,
      normalizedHostname,
      classifiedAt,
      manualOverride: false,
    }
  }

  const deterministic = scoreDeterministicClassification(subject)
  if (deterministic.confidence === "high" || deterministic.confidence === "medium") {
    return {
      playbook: deterministic.playbook,
      source: "deterministic",
      confidence: deterministic.confidence,
      evidence: deterministic.evidence,
      normalizedBusinessName,
      normalizedHostname,
      classifiedAt,
      manualOverride: false,
    }
  }

  const aiText = [
    subject.businessName,
    subject.industryHint,
    subject.scan?.page_title,
    subject.scan?.meta_description,
    subject.scan?.headings.join(" "),
    subject.scan?.service_language.join(" "),
    subject.sourceTitle,
    subject.sourceSnippet,
  ]
    .filter(Boolean)
    .join("\n")

  if (aiText.trim()) {
    const ai = await runSignalClassificationAi({
      businessName: subject.businessName,
      city: subject.city,
      state: subject.state,
      text: aiText,
    })
    const aiPlaybook = toKnownPlaybook(ai?.output.playbook)
    if (ai && aiPlaybook && aiPlaybook !== "unknown_needs_review") {
      return {
        playbook: aiPlaybook,
        source: "ai",
        confidence: ai.output.confidence,
        evidence: compactEvidence(ai.output.evidence),
        normalizedBusinessName,
        normalizedHostname,
        classifiedAt,
        manualOverride: false,
      }
    }
  }

  return {
    playbook:
      deterministic.playbook !== "unknown_needs_review"
        ? deterministic.playbook
        : "unknown_needs_review",
    source: "human_review",
    confidence: "low",
    evidence: compactEvidence([
      ...deterministic.evidence,
      "Human review is required because category confidence is still low.",
    ]),
    normalizedBusinessName,
    normalizedHostname,
    classifiedAt,
    manualOverride: false,
  }
}

export function buildSignalClassificationFields(result: SignalClassificationResult) {
  const playbook = getSignalPlaybook(result.playbook)
  return {
    industry_playbook: result.playbook,
    compliance_tier: playbook.complianceTier,
    relevant_demo: playbook.relevantDemo,
    classification_source: result.source,
    classification_confidence: result.confidence,
    classification_evidence: result.evidence,
    classification_manual_override: result.manualOverride,
    normalized_business_name: result.normalizedBusinessName || null,
    normalized_hostname: result.normalizedHostname || null,
    classified_at: result.classifiedAt,
  }
}

export function buildSignalProspectAliasSeeds(prospect: Pick<
  SignalProspect,
  "business_name" | "website_url" | "public_phone" | "public_email"
>) {
  const aliases: Array<{
    alias_type: SignalProspectAliasType
    alias_value: string
    normalized_value: string
  }> = []

  const businessName = prospect.business_name.trim()
  const normalizedBusinessName = normalizeSignalBusinessName(businessName)
  if (businessName && normalizedBusinessName) {
    aliases.push({
      alias_type: "business_name",
      alias_value: businessName,
      normalized_value: normalizedBusinessName,
    })
  }

  const hostname = normalizeSignalHostname(prospect.website_url)
  if (hostname) {
    aliases.push({
      alias_type: "hostname",
      alias_value: hostname,
      normalized_value: hostname,
    })
  }

  const phone = prospect.public_phone?.trim() || ""
  const normalizedPhone = normalizeSignalPhone(phone)
  if (phone && normalizedPhone) {
    aliases.push({
      alias_type: "phone",
      alias_value: phone,
      normalized_value: normalizedPhone,
    })
  }

  const email = prospect.public_email?.trim() || ""
  const normalizedEmail = normalizeSignalEmail(email)
  if (email && normalizedEmail) {
    aliases.push({
      alias_type: "email",
      alias_value: email,
      normalized_value: normalizedEmail,
    })
  }

  return aliases
}

export async function syncSignalProspectAliases(
  prospect: Pick<SignalProspect, "id" | "business_name" | "website_url" | "public_phone" | "public_email">,
  source: string,
) {
  const supabase = createAdminClient()
  const seeds = buildSignalProspectAliasSeeds(prospect)
  if (seeds.length === 0) return

  const { data: existingRows } = await supabase
    .from("signal_prospect_aliases")
    .select("alias_type, normalized_value")
    .eq("prospect_id", prospect.id)
    .eq("active", true)

  const existing = new Set(
    ((existingRows || []) as Array<{ alias_type: string; normalized_value: string }>).map(
      (row) => `${row.alias_type}:${row.normalized_value}`,
    ),
  )

  const missing = seeds
    .filter((seed) => !existing.has(`${seed.alias_type}:${seed.normalized_value}`))
    .map((seed) => ({
      prospect_id: prospect.id,
      ...seed,
      source,
      active: true,
    }))

  if (missing.length > 0) {
    await supabase.from("signal_prospect_aliases").insert(missing)
  }
}

export async function storeManualClassificationAlias({
  city,
  hostname,
  note,
  normalizedBusinessName,
  playbook,
}: {
  playbook: SignalPlaybookKey
  normalizedBusinessName: string
  hostname: string
  city?: string | null
  note?: string | null
}) {
  const supabase = createAdminClient()
  await supabase.from("signal_classification_aliases").insert({
    normalized_business_name: normalizedBusinessName || null,
    normalized_hostname: hostname || null,
    city_normalized: normalizeSignalCity(city) || null,
    corrected_category: playbook,
    corrected_playbook: playbook,
    source: "manual_correction",
    note: note || null,
    active: true,
  })
}

export async function classifySignalCampaignCandidate(
  candidate: Pick<
    SignalCampaignCandidate,
    "business_name" | "city" | "state" | "industry_hint" | "candidate_url" | "likely_official_url" | "source_snippet" | "source_title"
  > & {
    classified_playbook?: string | null
    classification_source?: string | null
  },
) {
  const result = await resolveSignalClassification({
    businessName: candidate.business_name,
    city: candidate.city,
    state: candidate.state,
    industryHint: candidate.industry_hint,
    websiteUrl: candidate.likely_official_url || candidate.candidate_url,
    sourceSnippet: candidate.source_snippet,
    sourceTitle: candidate.source_title,
    manualOverride:
      candidate.classification_source === "manual_override" && Boolean(candidate.classified_playbook),
    selectedPlaybook: candidate.classified_playbook,
  })

  return {
    classified_category: result.playbook,
    classified_playbook: result.playbook,
    classification_source: result.source,
    classification_confidence: result.confidence,
    classification_evidence: result.evidence,
    normalized_business_name: result.normalizedBusinessName || null,
    normalized_hostname: result.normalizedHostname || null,
    classified_at: result.classifiedAt,
  }
}
