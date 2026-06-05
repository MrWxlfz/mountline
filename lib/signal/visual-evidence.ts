import "server-only"

import type {
  SignalJson,
  SignalProspect,
  SignalVisualEvidence,
} from "@/lib/supabase/types"
import { getSignalPlaybook } from "./playbooks"
import {
  signalVisualAnalysisSchema,
  type SignalInitialAnalysisOutput,
} from "./validation"

export const SIGNAL_EVIDENCE_BUCKET = "signal-evidence"
export const SIGNAL_VISUAL_MAX_BYTES = 5 * 1024 * 1024

const ALLOWED_TYPES = new Set(["image/png", "image/jpeg", "image/webp"])
const EXTENSION_BY_TYPE: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
}

export type SignalVisualAnalysisOutput = NonNullable<
  SignalVisualEvidence["analysis"]
> & {
  visual_quality_score: number
  hero_clarity_score: number
  cta_visibility_score: number
  service_clarity_score: number
  gallery_or_proof_score: number | null
  mobile_readability_score: number | null
  what_looks_good: string[]
  visible_improvement_opportunities: string[]
  evidence_grounded_summary: string
  confidence: "low" | "medium" | "high"
}

export function validateSignalScreenshotFile(file: File) {
  const name = file.name.toLowerCase()
  const mime = file.type.toLowerCase()
  const extensionOk = /\.(png|jpe?g|webp)$/.test(name)

  if (!ALLOWED_TYPES.has(mime)) {
    return { ok: false as const, error: "Upload a PNG, JPEG, JPG, or WEBP screenshot." }
  }
  if (!extensionOk) {
    return { ok: false as const, error: "Screenshot filename must end in PNG, JPEG, JPG, or WEBP." }
  }
  if (file.size > SIGNAL_VISUAL_MAX_BYTES) {
    return { ok: false as const, error: "Screenshot must be 5 MB or smaller." }
  }
  if (file.size <= 0) {
    return { ok: false as const, error: "Screenshot file is empty." }
  }

  return {
    ok: true as const,
    extension: EXTENSION_BY_TYPE[mime],
    mimeType: mime,
    size: file.size,
  }
}

function visualPrompt(prospect: SignalProspect, evidence: SignalVisualEvidence[]) {
  const playbook = getSignalPlaybook(prospect.industry_playbook)
  const hasMobile = evidence.some((item) => item.screenshot_type === "mobile")

  return [
    "Analyze uploaded screenshots of a public business website for Mountline Signal.",
    "Evaluate only visible website presentation in the screenshot.",
    "Do not infer revenue loss, business performance, customer dissatisfaction, demographics, owner wealth, or personal traits.",
    "Do not claim poor mobile usability unless a mobile screenshot is supplied.",
    "Frame unconfirmed items as visible improvement opportunities, not proven business problems.",
    "Return only strict JSON matching the schema.",
    "",
    `Business: ${prospect.business_name}`,
    `Industry/playbook: ${playbook.name}`,
    `Website: ${prospect.website_url || "unknown"}`,
    `Screenshot types supplied: ${evidence.map((item) => item.screenshot_type).join(", ")}`,
    `Mobile screenshot supplied: ${hasMobile ? "yes" : "no"}`,
    "",
    "JSON keys: visual_quality_score, hero_clarity_score, cta_visibility_score, service_clarity_score, gallery_or_proof_score, mobile_readability_score, what_looks_good, visible_improvement_opportunities, evidence_grounded_summary, confidence.",
    "Use 0-100 integer scores. Use null for mobile_readability_score when no mobile screenshot exists. Use null for gallery_or_proof_score when no gallery/proof area is visible.",
  ].join("\n")
}

async function callGeminiVisualAnalysis({
  images,
  model,
  prompt,
}: {
  images: Array<{ mimeType: string; base64: string }>
  model: string
  prompt: string
}) {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              ...images.map((image) => ({
                inlineData: {
                  mimeType: image.mimeType,
                  data: image.base64,
                },
              })),
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: "application/json",
        },
      }),
      signal: AbortSignal.timeout(30_000),
    },
  )

  if (!response.ok) {
    console.error("[signal] Gemini visual analysis failed:", response.status, await response.text())
    return null
  }

  const data = await response.json()
  const content = data?.candidates?.[0]?.content?.parts
    ?.map((part: { text?: unknown }) => (typeof part.text === "string" ? part.text : ""))
    .join("")

  if (typeof content !== "string" || !content.trim()) return null
  let json: unknown
  try {
    json = JSON.parse(content)
  } catch (error) {
    console.error("[signal] Visual AI output JSON parse failed:", error)
    return null
  }
  const parsed = signalVisualAnalysisSchema.safeParse(json)
  if (!parsed.success) {
    console.error("[signal] Visual AI output invalid:", parsed.error.flatten())
    return null
  }

  return parsed.data
}

export async function runSignalVisualAnalysis({
  evidence,
  images,
  prospect,
}: {
  evidence: SignalVisualEvidence[]
  images: Array<{ mimeType: string; base64: string }>
  prospect: SignalProspect
}) {
  const provider = process.env.SIGNAL_AI_PROVIDER?.trim().toLowerCase()
  if (provider !== "gemini") return null

  const model =
    process.env.SIGNAL_VISUAL_MODEL?.trim() ||
    process.env.SIGNAL_DEEP_MODEL?.trim() ||
    "gemini-2.0-flash"

  const output = await callGeminiVisualAnalysis({
    images,
    model,
    prompt: visualPrompt(prospect, evidence),
  })

  if (!output) return null

  return {
    output,
    provider: "gemini" as const,
    model,
  }
}

export function getLatestVisualAnalysis(evidence: SignalVisualEvidence[]) {
  const analyzed = evidence
    .filter((item) => item.analysis && typeof item.analysis === "object")
    .sort((a, b) => {
      const left = a.analyzed_at || a.created_at
      const right = b.analyzed_at || b.created_at
      return right.localeCompare(left)
    })

  const analysis = analyzed[0]?.analysis
  const parsed = signalVisualAnalysisSchema.safeParse(analysis)
  return parsed.success ? parsed.data : null
}

export function isVisualIndustry(playbookKey: string | null | undefined) {
  return [
    "auto_detailing",
    "barber_salon",
    "beauty_wellness",
    "restaurant_food",
    "roofing_contractors_home_services",
  ].includes(playbookKey || "")
}

export function visualEvidenceSummary(evidence: SignalVisualEvidence[]) {
  const analysis = getLatestVisualAnalysis(evidence)
  return {
    hasDesktop: evidence.some((item) => item.screenshot_type === "desktop"),
    hasMobile: evidence.some((item) => item.screenshot_type === "mobile"),
    analysis,
    confidence: analysis?.confidence || "low",
  }
}

export function visualSignalsForScoring(evidence: SignalVisualEvidence[]) {
  const summary = visualEvidenceSummary(evidence)
  const visual = summary.analysis
  if (!visual) {
    return {
      assessed: false,
      confidence: "low" as const,
      score: null,
      opportunityBoost: 0,
      summary: "Visual design not assessed.",
    }
  }

  const opportunityBoost = Math.max(0, Math.round((72 - visual.visual_quality_score) * 0.45))
  return {
    assessed: true,
    confidence: visual.confidence,
    score: visual.visual_quality_score,
    opportunityBoost,
    summary: visual.evidence_grounded_summary,
  }
}

export function visualEvidenceForAnalysis(evidence: SignalVisualEvidence[]): SignalJson {
  const summary = visualEvidenceSummary(evidence)
  return {
    screenshots: evidence.map((item) => ({
      id: item.id,
      screenshot_type: item.screenshot_type,
      created_at: item.created_at,
      mime_type: item.mime_type,
      file_size_bytes: item.file_size_bytes,
      analyzed_at: item.analyzed_at,
      confidence: item.confidence,
    })),
    analysis: summary.analysis,
  }
}

export function visualValueReasons(evidence: SignalVisualEvidence[]) {
  const visual = getLatestVisualAnalysis(evidence)
  if (!visual) return []
  return [
    `Visual screenshot evidence confidence: ${visual.confidence}.`,
    `Visible presentation score: ${visual.visual_quality_score}.`,
    ...visual.visible_improvement_opportunities.slice(0, 3),
  ]
}

export function applyVisualSummaryToInitial(
  output: SignalInitialAnalysisOutput,
  evidence: SignalVisualEvidence[],
) {
  const visual = visualSignalsForScoring(evidence)
  if (!visual.assessed || typeof visual.score !== "number") return output

  return {
    ...output,
    website_quality_score: visual.score,
    confidence:
      output.confidence === "low" && visual.confidence !== "low"
        ? "medium"
        : output.confidence,
  }
}
