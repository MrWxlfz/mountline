// Shared between the browser demo and its API routes. No server imports: safe for client bundles.

export const DEMO_CALL_ENDPOINT = "/api/receptionist/demo-call"

export type DemoCallErrorCode =
  | "not_configured"
  | "bad_request"
  | "forbidden"
  | "not_found"
  | "visitor_limit"
  | "busy"
  | "daily_limit"
  | "provider_error"
  | "storage_error"

/** Retell's create-web-call response, passed through unchanged for the browser SDK. */
export type RetellWebCall = {
  call_id: string
  access_token: string
  transport?: "livekit" | "gateway"
  url?: string
  ice_servers?: RTCIceServer[]
  expires_at?: number
}

export type DemoCallStartResponse = { ok: true; call: RetellWebCall; viewToken: string; maxSeconds: number }

export type DemoCallErrorResponse = { ok: false; code: DemoCallErrorCode; message: string; retryAfterSeconds?: number }

export type DemoCallRecord = {
  ok: true
  status: "registered" | "not_connected" | "ongoing" | "ended" | "error" | "unknown"
  durationMs: number | null
  disconnectionReason: string | null
  transcript: Array<{ role: "agent" | "caller"; text: string }>
  analysis: { state: "pending" | "ready" | "unavailable"; summary: string | null; details: Array<{ label: string; value: string }> }
}

/** Visitor-facing text for each error. The server always sends one of these. */
export const DEMO_CALL_MESSAGES: Record<DemoCallErrorCode, string> = {
  not_configured: "The browser demo isn’t switched on yet. You can still call the demo line.",
  bad_request: "We couldn’t read that request. Please refresh the page and try again.",
  forbidden: "We couldn’t confirm this request came from our site. Please refresh the page and try again.",
  not_found: "We couldn’t find that demo call. Please refresh the page and start a new one.",
  visitor_limit: "You’ve tried the browser demo a few times already. Please call the demo line instead, or try again later.",
  busy: "The demo line is busy with other visitors right now. Try again in a minute, or call it instead.",
  daily_limit: "The browser demo has had a lot of visitors today. Please call the demo line instead, or try again later.",
  provider_error: "We couldn’t connect the demo just now. Please try again in a moment, or call the demo line.",
  storage_error: "Something went wrong on our side. Please try again in a moment, or call the demo line.",
}

/** GET: the call's status, transcript, and summary. */
export function demoCallRecordPath(callId: string, viewToken: string) {
  return `${DEMO_CALL_ENDPOINT}/${encodeURIComponent(callId)}?token=${encodeURIComponent(viewToken)}`
}

/** POST { token }: ends the call. Accepts a text/plain JSON body so navigator.sendBeacon works. */
export function demoCallEndPath(callId: string) {
  return `${DEMO_CALL_ENDPOINT}/${encodeURIComponent(callId)}/end`
}
