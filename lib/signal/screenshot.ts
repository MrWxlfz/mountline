import "server-only"

import type { SignalProspect, SignalScreenshotType } from "@/lib/supabase/types"
import {
  SIGNAL_VISUAL_MAX_BYTES,
} from "./visual-evidence"
import { scanSignalWebsite } from "./website"

type ScreenshotProvider = "manual" | "browserless" | "disabled"

export type SignalScreenshotCaptureResult =
  | {
      ok: true
      provider: "browserless"
      final_url: string
      mime_type: "image/png" | "image/jpeg" | "image/webp"
      extension: "png" | "jpg" | "webp"
      bytes: ArrayBuffer
    }
  | {
      ok: false
      provider: ScreenshotProvider
      setup_message: string
    }

function getScreenshotProvider(): ScreenshotProvider {
  const provider = process.env.SIGNAL_SCREENSHOT_PROVIDER?.trim().toLowerCase()
  if (provider === "browserless" || provider === "disabled") return provider
  return "manual"
}

function buildBrowserlessEndpoint() {
  const apiKey = process.env.BROWSERLESS_API_KEY
  const rawBase = process.env.BROWSERLESS_BASE_URL?.trim() || "https://production-sfo.browserless.io"
  const base = rawBase.endsWith("/screenshot")
    ? rawBase
    : `${rawBase.replace(/\/$/, "")}/screenshot`
  const url = new URL(base)
  if (apiKey && !url.searchParams.has("token")) url.searchParams.set("token", apiKey)
  return url.toString()
}

function mimeToExtension(mime: string) {
  if (mime.includes("jpeg")) return "jpg" as const
  if (mime.includes("webp")) return "webp" as const
  return "png" as const
}

export async function captureSignalHomepageScreenshot({
  prospect,
  screenshotType = "desktop",
}: {
  prospect: SignalProspect
  screenshotType?: SignalScreenshotType
}): Promise<SignalScreenshotCaptureResult> {
  const provider = getScreenshotProvider()

  if (provider !== "browserless") {
    return {
      ok: false,
      provider,
      setup_message:
        provider === "manual"
          ? "Automated capture is set to manual. Upload a public homepage screenshot instead."
          : "Automated screenshot capture is disabled.",
    }
  }

  if (!process.env.BROWSERLESS_API_KEY) {
    return {
      ok: false,
      provider,
      setup_message: "Browserless is selected, but BROWSERLESS_API_KEY is missing.",
    }
  }

  if (!prospect.website_url) {
    return {
      ok: false,
      provider,
      setup_message: "Save a confirmed official website before capturing a screenshot.",
    }
  }

  const scan = await scanSignalWebsite(prospect.website_url)
  if (scan.broken_response || scan.scanned_urls.length === 0) {
    return {
      ok: false,
      provider,
      setup_message:
        scan.error || "Official public homepage could not be validated for screenshot capture.",
    }
  }

  const finalUrl = scan.scanned_urls[0]
  const viewport =
    screenshotType === "mobile"
      ? { width: 390, height: 844, deviceScaleFactor: 2, isMobile: true }
      : { width: 1440, height: 1100, deviceScaleFactor: 1, isMobile: false }

  const response = await fetch(buildBrowserlessEndpoint(), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: finalUrl,
      options: {
        type: "png",
        fullPage: false,
      },
      gotoOptions: {
        waitUntil: "networkidle2",
        timeout: 15_000,
      },
      viewport,
    }),
    signal: AbortSignal.timeout(25_000),
  })

  if (!response.ok) {
    return {
      ok: false,
      provider,
      setup_message: `Browserless screenshot failed with status ${response.status}.`,
    }
  }

  const contentType = response.headers.get("content-type")?.toLowerCase() || "image/png"
  if (!contentType.includes("image/")) {
    return {
      ok: false,
      provider,
      setup_message: "Browserless did not return an image response.",
    }
  }

  const bytes = await response.arrayBuffer()
  if (bytes.byteLength <= 0 || bytes.byteLength > SIGNAL_VISUAL_MAX_BYTES) {
    return {
      ok: false,
      provider,
      setup_message: "Captured screenshot was empty or larger than the 5 MB evidence limit.",
    }
  }

  const mimeType =
    contentType.includes("jpeg")
      ? "image/jpeg"
      : contentType.includes("webp")
        ? "image/webp"
        : "image/png"

  return {
    ok: true,
    provider,
    final_url: finalUrl,
    mime_type: mimeType,
    extension: mimeToExtension(mimeType),
    bytes,
  }
}
