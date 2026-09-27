"use client"

import { useEffect, useState } from "react"
import type { FormEvent } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { Loader2 } from "lucide-react"
import { AccountMessage, AccountShell } from "@/components/brand/account-shell"
import { PortalView, type PortalPayload } from "./portal-view"

export default function PortalPage() {
  const { portalId } = useParams<{ portalId: string }>()
  const { user, isLoaded } = useUser()
  const [payload, setPayload] = useState<PortalPayload | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState("")
  const [messageState, setMessageState] = useState<"idle" | "sending" | "sent" | "error">("idle")
  const [messageError, setMessageError] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded || !portalId) return

    async function fetchPortal() {
      setLoading(true)
      setError(null)

      try {
        const res = await fetch(`/api/portal/${portalId}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Unable to load this portal.")
          return
        }

        setPayload(data)
      } catch {
        setError("Unable to load this portal.")
      } finally {
        setLoading(false)
      }
    }

    fetchPortal()
  }, [isLoaded, portalId])

  const project = payload?.project

  async function handleSendMessage(e: FormEvent) {
    e.preventDefault()
    if (!message.trim() || !portalId) return

    setMessageState("sending")
    setMessageError(null)

    try {
      const res = await fetch(`/api/portal/${portalId}/support`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessageState("error")
        setMessageError(data.error || "Message could not be sent.")
        return
      }

      setPayload((current) =>
        current
          ? {
              ...current,
              supportMessages: [...current.supportMessages, data.message],
            }
          : current,
      )
      setMessage("")
      setMessageState("sent")
    } catch {
      setMessageState("error")
      setMessageError("Message could not be sent.")
    }
  }

  if (!isLoaded || loading) {
    return (
      <AccountShell>
        <div className="flex flex-col items-center gap-4 text-center" role="status">
          <Loader2 className="size-5 animate-spin text-muted-foreground" aria-hidden="true" />
          <p className="ml-eyebrow">Loading your portal</p>
        </div>
      </AccountShell>
    )
  }

  if (error || !project) {
    return (
      <AccountShell>
        <AccountMessage
          eyebrow="Client portal"
          title={error?.includes("access") ? "You don’t have access to this portal" : "This portal isn’t available"}
          actions={
            <>
              <Link href="/portal" className="ml-pill ml-pill-solid">Your projects</Link>
              <Link href="/" className="ml-pill ml-pill-line">Back to Mountline</Link>
            </>
          }
        >
          {error || "This portal link may be invalid or expired."}
        </AccountMessage>
      </AccountShell>
    )
  }

  return (
    <PortalView
      payload={payload}
      displayName={user?.firstName || payload.viewer.email || "Client"}
      message={message}
      messageState={messageState}
      messageError={messageError}
      onMessageChange={(value) => {
        setMessage(value)
        if (messageState !== "sending") {
          setMessageState("idle")
          setMessageError(null)
        }
      }}
      onSubmit={handleSendMessage}
    />
  )
}

