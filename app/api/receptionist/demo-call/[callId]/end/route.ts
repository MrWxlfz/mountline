import { readWebDemoConfig } from "@/lib/receptionist/web-demo/config"
import { handleEndDemoCall } from "@/lib/receptionist/web-demo/server"
import { createDemoStore } from "@/lib/receptionist/web-demo/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Ends a demo call. Also receives navigator.sendBeacon on pagehide (text/plain JSON body).
export async function POST(request: Request, { params }: { params: Promise<{ callId: string }> }) {
  const { callId } = await params
  return handleEndDemoCall(request, callId, {
    config: readWebDemoConfig(),
    fetch,
    store: createDemoStore(),
    siteUrl: process.env.MOUNTLINE_SITE_URL,
  })
}
