"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Loader2, Save } from "lucide-react"
import Link from "next/link"

interface Client {
  id: string
  business_name: string
  contact_name: string
}

export default function NewProjectPage() {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [loadingClients, setLoadingClients] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [clients, setClients] = useState<Client[]>([])
  const [form, setForm] = useState({
    project_name: "",
    client_id: "",
    package_type: "",
    status: "discovery",
    start_date: "",
    target_launch_date: "",
    live_url: "",
    preview_url: "",
    payment_link: "",
    next_step: "",
    notes: "",
  })

  useEffect(() => {
    async function fetchClients() {
      setLoadingClients(true)
      try {
        const res = await fetch("/api/clients")
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || "Clients could not be loaded.")
          return
        }

        setClients(data.clients || [])
      } catch {
        setError("Clients could not be loaded.")
      } finally {
        setLoadingClients(false)
      }
    }
    fetchClients()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          client_id: form.client_id || null,
        }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error || "Project could not be created.")
        return
      }

      router.push("/dashboard/projects")
      router.refresh()
    } catch {
      setError("Project could not be created.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/dashboard/projects"
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">New Project</h1>
          <p className="text-muted-foreground">Create a new website project.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 space-y-5">
        {error && (
          <div className="rounded-lg border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-400">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Name *</label>
            <input
              required
              type="text"
              value={form.project_name}
              onChange={(e) => setForm({ ...form, project_name: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
              placeholder="Acme Corp Website"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Client</label>
            <select
              value={form.client_id}
              onChange={(e) => setForm({ ...form, client_id: e.target.value })}
              disabled={loadingClients}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            >
              <option value="">{loadingClients ? "Loading clients..." : "No client"}</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>{c.business_name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Package Type</label>
            <select
              value={form.package_type}
              onChange={(e) => setForm({ ...form, package_type: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            >
              <option value="">Select package</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="premium">Premium</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            >
              <option value="discovery">Discovery</option>
              <option value="design">Design</option>
              <option value="build">Build</option>
              <option value="review">Review</option>
              <option value="launch">Launch</option>
              <option value="support">Support</option>
            </select>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <label className="text-sm font-medium">Start Date</label>
            <input
              type="date"
              value={form.start_date}
              onChange={(e) => setForm({ ...form, start_date: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Target Launch Date</label>
            <input
              type="date"
              value={form.target_launch_date}
              onChange={(e) => setForm({ ...form, target_launch_date: e.target.value })}
              className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Preview URL</label>
          <input
            type="url"
            value={form.preview_url}
            onChange={(e) => setForm({ ...form, preview_url: e.target.value })}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="https://preview.acme.northline.dev"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Live URL</label>
          <input
            type="url"
            value={form.live_url}
            onChange={(e) => setForm({ ...form, live_url: e.target.value })}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="https://acme.com"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Manual Payment Link</label>
          <input
            type="url"
            value={form.payment_link}
            onChange={(e) => setForm({ ...form, payment_link: e.target.value })}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20"
            placeholder="https://buy.stripe.com/..."
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Next Step</label>
          <textarea
            value={form.next_step}
            onChange={(e) => setForm({ ...form, next_step: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
            placeholder="What should the client know or do next?"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 bg-muted border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-foreground/20 resize-none"
            placeholder="Project notes, scope, deliverables..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <Link
            href="/dashboard/projects"
            className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background text-sm font-medium rounded-lg hover:bg-foreground/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? "Creating..." : "Create Project"}
          </button>
        </div>
      </form>
    </div>
  )
}
