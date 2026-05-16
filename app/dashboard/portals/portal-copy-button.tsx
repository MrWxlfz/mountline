"use client"

import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function PortalCopyButton({
  portalPath,
  productionBaseUrl,
}: {
  portalPath: string
  productionBaseUrl: string | null
}) {
  const [copied, setCopied] = useState(false)

  async function copyPortalLink() {
    const baseUrl =
      productionBaseUrl || (typeof window !== "undefined" ? window.location.origin : "")
    const url = `${baseUrl}${portalPath}`

    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <button
      type="button"
      onClick={copyPortalLink}
      className="inline-flex items-center gap-1.5 rounded-lg border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  )
}
