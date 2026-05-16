"use client"

import { useState } from "react"
import { Check, Copy, ExternalLink } from "lucide-react"

export function ProjectLinkActions({
  portalPath,
  previewUrl,
  liveUrl,
  paymentLink,
}: {
  portalPath: string | null
  previewUrl: string | null
  liveUrl: string | null
  paymentLink: string | null
}) {
  const [copied, setCopied] = useState(false)

  async function copyPortalLink() {
    if (!portalPath) return

    const url = `${window.location.origin}${portalPath}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="space-y-3 pt-4 border-t border-border">
      {portalPath && (
        <div className="flex items-center gap-2">
          <code className="min-w-0 flex-1 truncate rounded bg-muted px-2 py-1 text-xs text-muted-foreground">
            {portalPath}
          </code>
          <button
            type="button"
            onClick={copyPortalLink}
            className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <ProjectOutboundLink label="Portal" href={portalPath} />
        <ProjectOutboundLink label="Preview" href={previewUrl} />
        <ProjectOutboundLink label="Live" href={liveUrl} />
        <ProjectOutboundLink label="Payment" href={paymentLink} />
      </div>
    </div>
  )
}

function ProjectOutboundLink({
  label,
  href,
}: {
  label: string
  href: string | null
}) {
  if (!href) {
    return (
      <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground/70">
        No {label.toLowerCase()}
      </span>
    )
  }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
    >
      {label}
      <ExternalLink className="w-3 h-3" />
    </a>
  )
}
