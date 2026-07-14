"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Check, Loader2, Send } from "lucide-react"

export function SupportReplyForm({ threadId }: { threadId: string }) {
  const router = useRouter()
  const [message, setMessage] = useState("")
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    if (!message.trim()) return

    setState("sending")
    setError(null)

    try {
      const res = await fetch(`/api/support/${threadId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()

      if (!res.ok) {
        setState("error")
        setError(data.error || "Reply could not be sent.")
        return
      }

      setMessage("")
      setState("sent")
      router.refresh()
    } catch {
      setState("error")
      setError("Reply could not be sent.")
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label className="block space-y-2">
        <span className="text-sm font-medium">Reply as Mountline</span>
        <textarea
          value={message}
          onChange={(event) => {
            setMessage(event.target.value)
            if (state !== "sending") {
              setState("idle")
              setError(null)
            }
          }}
          rows={4}
          className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-focus-ring"
          placeholder="Write a reply to the client..."
        />
      </label>

      {state === "error" && error && (
        <p className="text-sm text-error-foreground">{error}</p>
      )}
      {state === "sent" && (
        <p className="flex items-center gap-2 text-sm text-success-foreground">
          <Check className="h-4 w-4" />
          Reply sent.
        </p>
      )}

      <button
        type="submit"
        disabled={state === "sending" || !message.trim()}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {state === "sending" ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Send reply
      </button>
    </form>
  )
}
