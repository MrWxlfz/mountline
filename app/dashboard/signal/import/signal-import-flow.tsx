"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle2, Loader2, Upload } from "lucide-react"

type PreviewRow = {
  row_number: number
  mapped: Record<string, string | null>
  issues: string[]
  duplicate_matches: Array<{ prospect_id: string; business_name: string; reasons: string[] }>
}

type Preview = {
  batch: { id: string }
  sheet_names: string[]
  selected_sheet_name: string | null
  headers: string[]
  mapping: Record<string, number>
  row_count: number
  preview_rows: PreviewRow[]
  duplicate_summary: unknown[]
}

export function SignalImportFlow() {
  const [file, setFile] = useState<File | null>(null)
  const [sheetName, setSheetName] = useState("")
  const [preview, setPreview] = useState<Preview | null>(null)
  const [working, setWorking] = useState<"preview" | "commit" | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runPreview = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (!file) return
    setWorking("preview")
    setError(null)
    setMessage(null)

    const formData = new FormData()
    formData.set("file", file)
    if (sheetName) formData.set("sheet_name", sheetName)

    try {
      const response = await fetch("/api/signal/import/preview", {
        method: "POST",
        body: formData,
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || "Workbook preview failed.")
        return
      }

      setPreview(data)
      setSheetName(data.selected_sheet_name || "")
      setMessage("Preview ready. Review mapped rows and duplicates before importing.")
    } catch {
      setError("Workbook preview failed.")
    } finally {
      setWorking(null)
    }
  }

  const commit = async () => {
    if (!preview) return
    setWorking("commit")
    setError(null)
    setMessage(null)

    try {
      const response = await fetch("/api/signal/import/commit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch_id: preview.batch.id }),
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data.error || "Import failed.")
        return
      }

      setMessage(
        `Imported ${data.imported_count} row${data.imported_count === 1 ? "" : "s"}. ${data.skipped?.length || 0} skipped.`,
      )
      setPreview(null)
      setFile(null)
    } catch {
      setError("Import failed.")
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/signal" className="rounded-lg p-2 transition-colors hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Mountline Signal
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Import Existing Leads</h1>
          <p className="text-sm text-muted-foreground">
            Upload CSV or Excel, preview mappings, merge duplicates, then import approved rows.
          </p>
        </div>
      </div>

      {(message || error) && (
        <div
          className={`rounded-lg border px-3 py-2 text-sm ${
            error
              ? "border-red-500/25 bg-red-500/10 text-red-300"
              : "border-green-500/25 bg-green-500/10 text-green-300"
          }`}
        >
          {error || message}
        </div>
      )}

      <form onSubmit={runPreview} className="rounded-xl border border-border bg-card p-6">
        <div className="grid gap-4 lg:grid-cols-[1fr_260px_auto] lg:items-end">
          <label className="block space-y-2">
            <span className="text-sm font-medium">Workbook</span>
            <input
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={(event) => setFile(event.target.files?.[0] || null)}
              className="block w-full rounded-lg border border-border bg-muted px-3 py-2 text-sm file:mr-3 file:rounded-md file:border-0 file:bg-foreground file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-background"
            />
          </label>
          <label className="block space-y-2">
            <span className="text-sm font-medium">Worksheet</span>
            <select
              value={sheetName}
              onChange={(event) => setSheetName(event.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
            >
              <option value="">First sheet</option>
              {preview?.sheet_names.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          </label>
          <button
            type="submit"
            disabled={!file || working === "preview"}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {working === "preview" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            Preview
          </button>
        </div>
      </form>

      {preview && (
        <section className="rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <h2 className="font-semibold">Import Preview</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {preview.row_count} rows detected on {preview.selected_sheet_name || "selected sheet"}.
              </p>
            </div>
            <button
              type="button"
              disabled={working === "commit" || preview.preview_rows.length === 0}
              onClick={commit}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {working === "commit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              Confirm Import
            </button>
          </div>

          <div className="mb-4 grid gap-3 md:grid-cols-3">
            <Stat label="Mapped Columns" value={Object.keys(preview.mapping).length} />
            <Stat label="Preview Rows" value={preview.preview_rows.length} />
            <Stat label="Likely Merges" value={preview.duplicate_summary.length} />
          </div>

          <div className="overflow-hidden rounded-lg border border-border">
            <div className="max-h-[520px] overflow-auto">
              <table className="w-full min-w-[980px] text-sm">
                <thead className="sticky top-0 bg-muted text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 text-left">Row</th>
                    <th className="px-3 py-2 text-left">Business</th>
                    <th className="px-3 py-2 text-left">Industry</th>
                    <th className="px-3 py-2 text-left">City</th>
                    <th className="px-3 py-2 text-left">Website</th>
                    <th className="px-3 py-2 text-left">Email</th>
                    <th className="px-3 py-2 text-left">Status</th>
                    <th className="px-3 py-2 text-left">Duplicate</th>
                    <th className="px-3 py-2 text-left">Issues</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {preview.preview_rows.map((row) => (
                    <tr key={row.row_number} className="align-top">
                      <td className="px-3 py-2 text-muted-foreground">{row.row_number}</td>
                      <td className="px-3 py-2 font-medium">{row.mapped.business_name || "-"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.mapped.industry || "-"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.mapped.city || "-"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.mapped.website_url || "-"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.mapped.public_email || "-"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{row.mapped.outreach_status || "-"}</td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.duplicate_matches[0]?.business_name || "-"}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">
                        {row.issues.length ? row.issues.join(", ") : "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-xl font-semibold">{value}</p>
    </div>
  )
}
