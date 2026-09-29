import "server-only"

import type { SupabaseClient } from "@supabase/supabase-js"
import { createAdminClient } from "@/lib/supabase/admin"
import type { DemoStore, StartOutcome } from "./server.ts"

// Session bookkeeping for the browser demo, through the service-role RPCs in
// supabase/migrations/20260929120000_receptionist_web_demo.sql. Only a hashed visitor key and
// the provider call ID are stored; never transcripts, and never anything in leads.

const OUTCOMES = new Set<StartOutcome>(["allowed", "visitor_limit", "busy", "daily_limit"])

function logFailure(label: string, error: { code?: string } | null) {
  // Codes only: messages can include argument values.
  console.error(`[mountline] ${label}`, { code: error?.code || "missing_result" })
}

export function createDemoStore(): DemoStore {
  // Created on first use, so an unconfigured deployment never builds a client.
  let client: SupabaseClient | null = null
  const supabase = () => (client ??= createAdminClient())

  return {
    async start(request) {
      const { data, error } = await supabase().rpc("start_receptionist_demo_call", {
        p_visitor_hash: request.visitorHash,
        p_max_per_visitor: request.perVisitor,
        p_visitor_window_minutes: request.visitorWindowMinutes,
        p_daily_cap: request.dailyCap,
        p_max_concurrent: request.maxConcurrent,
        p_max_seconds: request.maxSeconds,
      })
      const row = Array.isArray(data) ? data[0] : null
      if (error || !row || !OUTCOMES.has(row.outcome)) {
        logFailure("Demo call limits were not checked", error)
        throw new Error("Demo call limits were not checked.")
      }
      return {
        sessionId: typeof row.session_id === "string" ? row.session_id : null,
        outcome: row.outcome as StartOutcome,
        retryAfterSeconds: typeof row.retry_after_seconds === "number" ? row.retry_after_seconds : null,
      }
    },

    async attach(sessionId, callId) {
      const { error } = await supabase().rpc("attach_receptionist_demo_call", { p_session_id: sessionId, p_call_id: callId })
      if (error) {
        logFailure("Demo call ID was not attached", error)
        throw new Error("Demo call ID was not attached.")
      }
    },

    async fail(sessionId) {
      const { error } = await supabase().rpc("fail_receptionist_demo_call", { p_session_id: sessionId })
      if (error) {
        logFailure("Demo call session was not closed", error)
        throw new Error("Demo call session was not closed.")
      }
    },

    async finish(request) {
      const { error } = await supabase().rpc("finish_receptionist_demo_call", {
        p_call_id: request.callId,
        p_duration_ms: request.durationMs,
        p_disconnection_reason: request.disconnectionReason,
      })
      if (error) {
        logFailure("Demo call session was not finished", error)
        throw new Error("Demo call session was not finished.")
      }
    },
  }
}
