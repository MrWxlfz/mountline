import { readWebDemoConfig } from "@/lib/receptionist/web-demo/config"
import { handleStartDemoCall } from "@/lib/receptionist/web-demo/server"
import { createDemoStore } from "@/lib/receptionist/web-demo/store"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Starts a browser call with the fictional demo agent. Logic and limits live in lib/receptionist/web-demo.
export async function POST(request: Request) {
  return handleStartDemoCall(request, {
    config: readWebDemoConfig(),
    fetch,
    store: createDemoStore(),
    siteUrl: process.env.MOUNTLINE_SITE_URL,
  })
}
