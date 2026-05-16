"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Check, Loader2, Plus, Save } from "lucide-react"

type ProjectRecord = {
  id: string
  project_name: string
  status: string
  portal_id: string | null
  target_launch_date: string | null
  preview_url: string | null
  live_url: string | null
  payment_link: string | null
  next_step: string | null
  notes: string | null
  clients: {
    business_name: string
    contact_name: string
    email: string
  } | null
}

type PortalAccessRecord = {
  id: string
  created_at: string
  project_id: string
  client_email: string
  clerk_user_id: string | null
  access_status: string
}

type ProjectForm = {
  status: string
  preview_url: string
  live_url: string
  payment_link: string
  next_step: string
  target_launch_date: string
  notes: string
}

const statuses = ["discovery", "design", "build", "review", "launch", "support", "completed"]
const accessStatuses = ["invited", "active", "revoked"]

export function ProjectEditForm({
  project,
  initialPortalAccess,
}: {
  project: ProjectRecord
  initialPortalAccess: PortalAccessRecord[]
}) {
  const router = useRouter()
  const [form, setForm] = useState<ProjectForm>({
    status: project.status || "discovery",
    preview_url: project.preview_url || "",
    live_url: project.live_url || "",
    payment_link: project.payment_link || "",
    next_step: project.next_step || "",
    target_launch_date: project.target_launch_date || "",
    notes: project.notes || "",
  })
  const [portalAccess, setPortalAccess] = useState(initialPortalAccess)
  const [newAccessEmail, setNewAccessEmail] = useState("")
  const [newAccessStatus, setNewAccessStatus] = useState("invited")
  const [saving, setSaving] = useState(false)
  const [addingAccess, setAddingAccess] = useState(false)
  const [changingAccessId, setChangingAccessId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [accessError, setAccessError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const res = await fetch(`/api/projects/${project.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Project could not be saved.")
        return
      }

      setSuccess(true)
      router.refresh()
    } catch {
      setError("Project could not be saved.")
    } finally {
      setSaving(false)
    }
  }

  async function handleAddAccess(e: React.FormEvent) {
    e.preventDefault()
    setAddingAccess(true)
    setAccessError(null)

    try {
      const res = await fetch(`/api/projects/${project.id}/portal-access`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: newAccessEmail,
          access_status: newAccessStatus,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setAccessError(data.error || "Portal access could not be added.")
        return
      }

      setPortalAccess((current) => [
        data.access,
        ...current.filter((item) => item.id !== data.access.id),
      ])
      setNewAccessEmail("")
    } catch {
      setAccessError("Portal access could not be added.")
    } finally {
      setAddingAccess(false)
    }
  }

  async function handleAccessStatusChange(accessId: string, accessStatus: string) {
    setChangingAccessId(accessId)
    setAccessError(null)

    try {
      const res = await fetch(`/api/projects/${project.id}/portal-access/${accessId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ access_status: accessStatus }),
      })
      const data = await res.json()

      if (!res.ok) {
        setAccessError(data.error || "Portal access could not be updated.")
        return
      }

      setPortalAccess((current) =>
        current.map((item) => (item.id === accessId ? data.access : item)),
      )
    } catch {
      setAccessError("Portal access could not be updated.")
    } finally {
      setChangingAccessId(null)
    }
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/projects"
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="min-w-0">
          <h1 className="text-2xl font-bold tracking-tight truncate">{project.project_name}</h1>
          <p className="text-muted-foreground">
            Edit project links, next step, status, and portal access.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-card border border-border rounded-xl p-6 space-y-5">
        {error && (
          <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}
        {success && (
          <div className="flex items-center gap-2 rounded-lg border border-green-500/25 bg-green-500/10 px-3 py-2 text-sm text-green-400">
            <Check className="h-4 w-4" />
            Project saved.
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="space-y-2">
            <span className="text-sm font-medium">Status</span>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            >
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-2">
            <span className="text-sm font-medium">Target Launch Date</span>
            <input
              type="date"
              value={form.target_launch_date}
              onChange={(e) => setForm({ ...form, target_launch_date: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </label>
        </div>

        <ProjectInput label="Preview URL" value={form.preview_url} onChange={(value) => setForm({ ...form, preview_url: value })} />
        <ProjectInput label="Live URL" value={form.live_url} onChange={(value) => setForm({ ...form, live_url: value })} />
        <ProjectInput label="Manual Payment Link" value={form.payment_link} onChange={(value) => setForm({ ...form, payment_link: value })} />

        <label className="space-y-2 block">
          <span className="text-sm font-medium">Next Step</span>
          <textarea
            value={form.next_step}
            onChange={(e) => setForm({ ...form, next_step: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
            placeholder="What should the client know or do next?"
          />
        </label>

        <label className="space-y-2 block">
          <span className="text-sm font-medium">Notes</span>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
            placeholder="Internal project notes or scope details..."
          />
        </label>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/dashboard/projects"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Back
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>

      <section className="bg-card border border-border rounded-xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-semibold">Portal access</h2>
          <p className="text-sm text-muted-foreground">
            Add or update client access for this project portal.
          </p>
        </div>

        {accessError && (
          <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {accessError}
          </div>
        )}

        <form onSubmit={handleAddAccess} className="grid gap-3 sm:grid-cols-[1fr_150px_auto]">
          <input
            type="email"
            required
            value={newAccessEmail}
            onChange={(e) => setNewAccessEmail(e.target.value)}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="client@example.com"
          />
          <select
            value={newAccessStatus}
            onChange={(e) => setNewAccessStatus(e.target.value)}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
          >
            {accessStatuses.map((status) => (
              <option key={status} value={status}>
                {status}
              </option>
            ))}
          </select>
          <button
            type="submit"
            disabled={addingAccess}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2 text-sm font-medium text-background hover:bg-foreground/90 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {addingAccess ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add
          </button>
        </form>

        <div className="divide-y divide-border rounded-lg border border-border">
          {portalAccess.length > 0 ? (
            portalAccess.map((access) => (
              <div key={access.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{access.client_email}</p>
                  <p className="text-xs text-muted-foreground">
                    {access.clerk_user_id ? "Linked to Clerk user" : "Email access"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {changingAccessId === access.id && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                  <select
                    value={access.access_status}
                    onChange={(e) => handleAccessStatusChange(access.id, e.target.value)}
                    disabled={changingAccessId === access.id}
                    className="px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
                  >
                    {accessStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            ))
          ) : (
            <div className="p-4 text-sm text-muted-foreground">
              No portal access rows yet.
            </div>
          )}
        </div>
      </section>
    </div>
  )
}

function ProjectInput({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <label className="space-y-2 block">
      <span className="text-sm font-medium">{label}</span>
      <input
        type="url"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
        placeholder="https://..."
      />
    </label>
  )
}
