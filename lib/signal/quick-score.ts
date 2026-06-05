import "server-only"

import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalProspect,
  SignalVisualEvidence,
} from "@/lib/supabase/types"
import { runAndStoreInitialSignalAnalysis } from "./analysis"
import { captureSignalHomepageScreenshot } from "./screenshot"
import { scanSignalWebsite } from "./website"
import {
  SIGNAL_EVIDENCE_BUCKET,
  runSignalVisualAnalysis,
} from "./visual-evidence"

type StageKey =
  | "confirming_site"
  | "reading_homepage"
  | "checking_pages"
  | "capturing_screenshot"
  | "analyzing_presentation"
  | "calculating_score"
  | "ready_for_review"

export type SignalQuickScoreStage = {
  key: StageKey
  label: string
  note?: string
  status: "done" | "skipped"
}

export type SignalQuickScoreResult = {
  ai_unavailable: boolean
  analysis: Awaited<ReturnType<typeof runAndStoreInitialSignalAnalysis>>["analysis"]
  prospect: SignalProspect
  scan: Awaited<ReturnType<typeof scanSignalWebsite>>
  stages: SignalQuickScoreStage[]
  visual_unavailable_message: string | null
}

async function replaceDesktopEvidence({
  prospectId,
  result,
}: {
  prospectId: string
  result: Extract<
    Awaited<ReturnType<typeof captureSignalHomepageScreenshot>>,
    { ok: true }
  >
}) {
  const supabase = createAdminClient()
  const { data: existingRows } = await supabase
    .from("signal_visual_evidence")
    .select("*")
    .eq("prospect_id", prospectId)
    .eq("screenshot_type", "desktop")

  const existing = (existingRows || []) as SignalVisualEvidence[]
  for (const row of existing) {
    if (row.storage_path) {
      await supabase.storage.from(SIGNAL_EVIDENCE_BUCKET).remove([row.storage_path])
    }
  }
  if (existing.length > 0) {
    await supabase
      .from("signal_visual_evidence")
      .delete()
      .eq("prospect_id", prospectId)
      .eq("screenshot_type", "desktop")
  }

  const path = `prospects/${prospectId}/desktop-browserless-${Date.now()}.${result.extension}`
  const { error: uploadError } = await supabase.storage
    .from(SIGNAL_EVIDENCE_BUCKET)
    .upload(path, result.bytes, {
      contentType: result.mime_type,
      upsert: false,
    })

  if (uploadError) {
    return {
      ok: false as const,
      message: uploadError.message,
    }
  }

  const { error: insertError } = await supabase
    .from("signal_visual_evidence")
    .insert({
      prospect_id: prospectId,
      screenshot_type: "desktop",
      storage_path: path,
      mime_type: result.mime_type,
      file_size_bytes: result.bytes.byteLength,
    })

  if (insertError) {
    return {
      ok: false as const,
      message: insertError.message,
    }
  }

  return { ok: true as const }
}

async function runVisualStep(prospect: SignalProspect) {
  const supabase = createAdminClient()
  const { data: rows, error } = await supabase
    .from("signal_visual_evidence")
    .select("*")
    .eq("prospect_id", prospect.id)
    .order("created_at", { ascending: false })

  if (error) {
    return {
      visual_unavailable_message: error.message,
    }
  }

  const evidence = (rows || []) as SignalVisualEvidence[]
  if (evidence.length === 0) {
    return {
      visual_unavailable_message:
        "Visual score unavailable — screenshot provider not configured. Manual upload remains available.",
    }
  }

  const images: Array<{ mimeType: string; base64: string }> = []
  for (const item of evidence) {
    if (!item.storage_path || !item.mime_type) continue
    const { data: blob, error: downloadError } = await supabase.storage
      .from(SIGNAL_EVIDENCE_BUCKET)
      .download(item.storage_path)

    if (downloadError) {
      return { visual_unavailable_message: downloadError.message }
    }

    images.push({
      mimeType: item.mime_type,
      base64: Buffer.from(await blob.arrayBuffer()).toString("base64"),
    })
  }

  if (images.length === 0) {
    return {
      visual_unavailable_message:
        "Visual score unavailable — screenshot files could not be read.",
    }
  }

  const result = await runSignalVisualAnalysis({
    evidence,
    images,
    prospect,
  })

  if (!result) {
    return {
      visual_unavailable_message:
        "AI unavailable — rule-based quick score shown.",
    }
  }

  const analyzedAt = new Date().toISOString()
  await supabase
    .from("signal_visual_evidence")
    .update({
      model_provider: result.provider,
      model_name: result.model,
      analysis: result.output,
      confidence: result.output.confidence,
      analyzed_at: analyzedAt,
    })
    .eq("prospect_id", prospect.id)

  return {
    visual_unavailable_message: null,
  }
}

export async function runSignalQuickScore(prospect: SignalProspect): Promise<SignalQuickScoreResult> {
  const stages: SignalQuickScoreStage[] = []
  const scan = await scanSignalWebsite(prospect.website_url)

  stages.push({
    key: "confirming_site",
    label: "Confirming official site",
    status: scan.broken_response ? "skipped" : "done",
    note: scan.broken_response ? scan.error || "Official site could not be confirmed." : scan.scanned_urls[0] || undefined,
  })
  stages.push({
    key: "reading_homepage",
    label: "Reading homepage",
    status: scan.broken_response ? "skipped" : "done",
  })
  stages.push({
    key: "checking_pages",
    label: "Checking services and contact routes",
    status: scan.broken_response ? "skipped" : "done",
  })

  let visualMessage: string | null = null
  const capture = await captureSignalHomepageScreenshot({
    prospect,
    screenshotType: "desktop",
  })

  if (capture.ok) {
    const stored = await replaceDesktopEvidence({
      prospectId: prospect.id,
      result: capture,
    })
    stages.push({
      key: "capturing_screenshot",
      label: "Capturing screenshot",
      status: stored.ok ? "done" : "skipped",
      note: stored.ok ? capture.final_url : stored.message,
    })
  } else {
    visualMessage =
      capture.provider === "manual"
        ? "Visual score unavailable — screenshot provider not configured. Manual upload remains available."
        : capture.setup_message
    stages.push({
      key: "capturing_screenshot",
      label: "Capturing screenshot",
      status: "skipped",
      note: visualMessage,
    })
  }

  const visualStep = await runVisualStep(prospect)
  if (visualStep.visual_unavailable_message) {
    visualMessage = visualStep.visual_unavailable_message
    stages.push({
      key: "analyzing_presentation",
      label: "Analyzing presentation",
      status: "skipped",
      note: visualMessage,
    })
  } else {
    stages.push({
      key: "analyzing_presentation",
      label: "Analyzing presentation",
      status: "done",
    })
  }

  const result = await runAndStoreInitialSignalAnalysis({
    prospect,
    scan,
    researchContext: {
      confirmed_official_url: prospect.website_url,
      official_source_confidence: "high",
    },
  })

  stages.push({
    key: "calculating_score",
    label: "Calculating score",
    status: "done",
    note: result.ai_unavailable
      ? "AI unavailable — rule-based quick score shown."
      : undefined,
  })
  stages.push({
    key: "ready_for_review",
    label: "Ready for review",
    status: "done",
  })

  const supabase = createAdminClient()
  const { data: updatedProspect } = await supabase
    .from("signal_prospects")
    .update({ quick_score_updated_at: new Date().toISOString() })
    .eq("id", result.prospect.id)
    .select()
    .maybeSingle()

  return {
    ai_unavailable: result.ai_unavailable,
    analysis: result.analysis,
    prospect: (updatedProspect as SignalProspect | null) || result.prospect,
    scan,
    stages,
    visual_unavailable_message: visualMessage,
  }
}
