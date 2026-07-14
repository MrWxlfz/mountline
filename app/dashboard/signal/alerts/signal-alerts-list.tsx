"use client"

import { useState } from "react"
import Link from "next/link"
import { CheckCircle2, ExternalLink, Loader2 } from "lucide-react"
import type { SignalAlertRow } from "./page"

function formatDate(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function SignalAlertsList({
  initialRows,
}: {
  initialRows: SignalAlertRow[]
}) {
  const [rows, setRows] = useState(initialRows)
  const [workingId, setWorkingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const markRead = async (alertId: string) => {
    setWorkingId(alertId)
    setError(null)

    try {
      const response = await fetch(`/api/signal/alerts/${alertId}`, {
        method: "PATCH",
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Alert could not be marked read.")
        return
      }
      setRows((current) =>
        current.map((row) =>
          row.id === alertId
            ? { ...row, read_at: data.alert.read_at }
            : row,
        ),
      )
    } catch {
      setError("Alert could not be marked read.")
    } finally {
      setWorkingId(null)
    }
  }

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        No Signal alerts yet.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="rounded-lg border border-error-border bg-error-soft px-3 py-2 text-sm text-error-foreground">
          {error}
        </div>
      )}
      {rows.map((row) => (
        <div
          key={row.id}
          className={`rounded-lg border p-4 ${
            row.read_at
              ? "border-border bg-muted/20"
              : "border-success-border bg-success-soft"
          }`}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-medium">{row.title}</p>
              <p className="mt-1 text-sm text-muted-foreground">{row.message}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {formatDate(row.created_at)}
                {row.email_alert_sent_at ? " · internal email sent" : ""}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              {row.prospect && (
                <Link
                  href={`/dashboard/signal/${row.prospect.id}`}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                >
                  Open
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}
              {!row.read_at && (
                <button
                  type="button"
                  disabled={workingId === row.id}
                  onClick={() => markRead(row.id)}
                  className="inline-flex h-9 items-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                >
                  {workingId === row.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Mark read
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
