import "server-only"

import type { WebsiteSnapshot } from "./types"

const MAX_HTML_BYTES = 250_000
const MAX_TEXT_CHARS = 12_000

function normalizeWebsiteUrl(website: string | null | undefined) {
  const raw = website?.trim()
  if (!raw) return null

  try {
    return new URL(raw.startsWith("http") ? raw : `https://${raw}`)
  } catch {
    return null
  }
}

function stripHtml(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim()
}

function extractFirst(html: string, pattern: RegExp) {
  return html.match(pattern)?.[1]?.replace(/\s+/g, " ").trim() || null
}

function extractHeadings(html: string) {
  const headings: string[] = []
  const pattern = /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi
  let match: RegExpExecArray | null

  while ((match = pattern.exec(html)) && headings.length < 12) {
    const text = stripHtml(match[1])
    if (text) headings.push(text)
  }

  return headings
}

function extractContactSignals(html: string, text: string) {
  const lowerHtml = html.toLowerCase()
  const lowerText = text.toLowerCase()
  const signals = new Set<string>()

  if (lowerHtml.includes("mailto:") || /[\w.-]+@[\w.-]+\.\w+/.test(text)) {
    signals.add("email visible")
  }
  if (lowerHtml.includes("tel:") || /\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}/.test(text)) {
    signals.add("phone visible")
  }
  if (lowerText.includes("contact")) signals.add("contact path or copy")
  if (lowerText.includes("book") || lowerText.includes("schedule")) signals.add("booking signal")
  if (lowerText.includes("quote") || lowerText.includes("estimate")) signals.add("quote/estimate signal")
  if (lowerText.includes("facebook") || lowerText.includes("instagram")) signals.add("social link signal")
  if (lowerText.includes("hours")) signals.add("business hours visible")
  if (lowerText.includes("service") || lowerText.includes("services")) signals.add("services described")

  return Array.from(signals)
}

function buildNotes(snapshot: Omit<WebsiteSnapshot, "notes">) {
  const pieces = [
    snapshot.title ? `Title: ${snapshot.title}` : "No clear title found",
    snapshot.metaDescription ? `Meta: ${snapshot.metaDescription}` : "No meta description found",
    snapshot.headings.length > 0
      ? `Headings: ${snapshot.headings.slice(0, 5).join(" | ")}`
      : "No H1-H3 headings found",
    snapshot.contactSignals.length > 0
      ? `Signals: ${snapshot.contactSignals.join(", ")}`
      : "No obvious homepage contact signals found",
  ]

  if (snapshot.error) pieces.push(`Fetch issue: ${snapshot.error}`)

  return pieces.join("\n")
}

export async function fetchWebsiteSnapshot(
  website: string | null | undefined,
): Promise<WebsiteSnapshot> {
  const url = normalizeWebsiteUrl(website)

  if (!url) {
    const snapshot = {
      url: null,
      title: null,
      metaDescription: null,
      headings: [],
      bodyText: "",
      contactSignals: [],
      error: website ? "Website URL could not be parsed" : "No website provided",
    }

    return { ...snapshot, notes: buildNotes(snapshot) }
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "MountlineScout/1.0 (+https://mountline.dev)",
        Accept: "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(8000),
    })

    const contentType = response.headers.get("content-type") || ""
    if (!response.ok) {
      throw new Error(`Homepage returned ${response.status}`)
    }
    if (!contentType.includes("text/html")) {
      throw new Error("Homepage did not return HTML")
    }

    const html = (await response.text()).slice(0, MAX_HTML_BYTES)
    const bodyText = stripHtml(html).slice(0, MAX_TEXT_CHARS)
    const snapshot = {
      url: response.url || url.toString(),
      title: extractFirst(html, /<title[^>]*>([\s\S]*?)<\/title>/i),
      metaDescription: extractFirst(
        html,
        /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["'][^>]*>/i,
      ),
      headings: extractHeadings(html),
      bodyText,
      contactSignals: extractContactSignals(html, bodyText),
    }

    return { ...snapshot, notes: buildNotes(snapshot) }
  } catch (error) {
    const snapshot = {
      url: url.toString(),
      title: null,
      metaDescription: null,
      headings: [],
      bodyText: "",
      contactSignals: [],
      error: error instanceof Error ? error.message : "Website fetch failed",
    }

    return { ...snapshot, notes: buildNotes(snapshot) }
  }
}
