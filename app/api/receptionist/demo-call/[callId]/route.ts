import { readWebDemoConfig } from "@/lib/receptionist/web-demo/config"
import { handleGetDemoCall } from "@/lib/receptionist/web-demo/server"
import { createDemoStore } from "@/lib/receptionist/web-demo/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Status, transcript, and summary of one demo call, for the browser that started it (signed token).
export async function GET(request: Request, { params }: { params: Promise<{ callId: string }> }) {
  const { callId } = await params
  return handleGetDemoCall(request, callId, {
    config: readWebDemoConfig(),
    fetch,
    store: createDemoStore(),
  })
}
