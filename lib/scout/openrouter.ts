import "server-only"

import { z } from "zod"
import type { ScoutProspect } from "@/lib/supabase/types"
import type { ScoutScore, WebsiteSnapshot } from "./types"

const DEFAULT_MODEL = "mistralai/mistral-small-24b-instruct-2501"

const scoutScoreSchema = z.object({
  website_score: z.number().int().min(0).max(100),
  opportunity_score: z.number().int().min(0).max(100),
  estimated_project_fit: z.string().min(1).max(80),
  reasons: z.array(z.string().min(1).max(220)).max(8),
  ai_summary: z.string().min(1).max(900),
  outreach_angle: z.string().min(1).max(600),
  red_flags: z.array(z.string().min(1).max(220)).max(8),
})

function cleanJsonText(text: string) {
  const trimmed = text.trim()
  if (trimmed.startsWith("{") && trimmed.endsWith("}")) return trimmed

  const match = trimmed.match(/\{[\s\S]*\}/)
  return match?.[0] || trimmed
}

function buildPrompt(prospect: ScoutProspect, website: WebsiteSnapshot) {
  return [
    "Score this business as a possible Mountline website/client-portal/digital-systems lead.",
    "Use only the public business info and homepage notes provided. Do not infer personal income, sensitive demographics, or private personal details.",
    "Higher opportunity means the business appears legitimate, local/service-oriented, has visible demand signals, and has website or workflow gaps Mountline could help with.",
    "Return strict JSON with: website_score, opportunity_score, estimated_project_fit, reasons, ai_summary, outreach_angle, red_flags.",
    "",
    `Business: ${prospect.business_name}`,
    `Industry: ${prospect.industry || "unknown"}`,
    `Location: ${[prospect.city, prospect.state].filter(Boolean).join(", ") || "unknown"}`,
    `Website: ${prospect.website || "none"}`,
    `Google rating: ${prospect.google_rating ?? "unknown"}`,
    `Google review count: ${prospect.google_review_count ?? "unknown"}`,
    `Team notes: ${prospect.notes || "none"}`,
    "",
    "Homepage notes:",
    website.notes,
    "",
    "Homepage text excerpt:",
    website.bodyText.slice(0, 7000) || "No homepage text available.",
  ].join("\n")
}

export async function scoreWithOpenRouter(
  prospect: ScoutProspect,
  website: WebsiteSnapshot,
): Promise<ScoutScore | null> {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return null

  const model = process.env.OPENROUTER_MODEL || DEFAULT_MODEL

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_SITE_URL || "https://mountline.dev",
        "X-Title": "Mountline Scout",
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        max_tokens: 900,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a conservative B2B lead scorer. Return only valid JSON. Do not recommend spam, scraping, or contacting prospects automatically.",
          },
          { role: "user", content: buildPrompt(prospect, website) },
        ],
      }),
      signal: AbortSignal.timeout(15_000),
    })

    if (!response.ok) {
      console.error("[scout] OpenRouter scoring failed:", response.status, await response.text())
      return null
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content
    if (typeof content !== "string") return null

    const parsed = scoutScoreSchema.safeParse(JSON.parse(cleanJsonText(content)))
    if (!parsed.success) {
      console.error("[scout] OpenRouter returned invalid score JSON:", parsed.error.flatten())
      return null
    }

    return {
      ...parsed.data,
      website_notes: website.notes,
    }
  } catch (error) {
    console.error("[scout] OpenRouter scoring error:", error)
    return null
  }
}
