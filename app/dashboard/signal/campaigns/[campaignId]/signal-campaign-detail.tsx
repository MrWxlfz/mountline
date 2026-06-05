"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RadioTower,
  Search,
  UserPlus,
  XCircle,
} from "lucide-react"
import { getSignalPlaybook } from "@/lib/signal/playbooks"
import type {
  SignalCampaign,
  SignalCampaignCandidate,
  SignalProspect,
} from "@/lib/supabase/types"

const statusLabels: Record<string, string> = {
  draft: "Draft",
  discovering: "Discovering",
  review_candidates: "Review candidates",
  researching: "Researching",
  ready: "Ready",
  paused: "Paused",
  complete: "Complete",
  failed: "Failed",
}

const candidateStatusLabels: Record<string, string> = {
  pending_review: "Pending review",
  approved: "Approved",
  rejected: "Rejected",
  duplicate: "Duplicate",
  needs_confirmation: "Needs confirmation",
  imported_to_signal: "Imported",
  research_failed: "Research failed",
}

function badgeClass(status: string) {
  if (status === "approved" || status === "imported_to_signal") return "border-green-500/25 bg-green-500/10 text-green-300"
  if (status === "needs_confirmation" || status === "duplicate") return "border-yellow-500/25 bg-yellow-500/10 text-yellow-200"
  if (status === "rejected" || status === "research_failed") return "border-red-500/25 bg-red-500/10 text-red-300"
  return "border-border bg-muted text-muted-foreground"
}

function formatDate(value: string | null | undefined) {
  if (!value) return "-"
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function SignalCampaignDetail({
  campaign: initialCampaign,
  candidates: initialCandidates,
  prospects,
}: {
  campaign: SignalCampaign
  candidates: SignalCampaignCandidate[]
  prospects: SignalProspect[]
}) {
  const router = useRouter()
  const [campaign, setCampaign] = useState(initialCampaign)
  const [candidates, setCandidates] = useState(initialCandidates)
  const [officialUrls, setOfficialUrls] = useState<Record<string, string>>({})
  const [mergeIds, setMergeIds] = useState<Record<string, string>>({})
  const [working, setWorking] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const counts = useMemo(() => {
    const count = (status: string) =>
      candidates.filter((candidate) => candidate.candidate_status === status).length
    return {
      discovered: candidates.length,
      approved: count("approved"),
      imported: count("imported_to_signal"),
      confirm: count("needs_confirmation"),
      rejected: count("rejected"),
      duplicate: count("duplicate"),
      failed: count("research_failed"),
    }
  }, [candidates])

  const playbooks = campaign.selected_playbooks.map((key) => getSignalPlaybook(key).name)

  const runDiscover = async () => {
    setWorking("discover")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/campaigns/${campaign.id}/discover`, { method: "POST" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Campaign discovery failed.")
        if (data.campaign) setCampaign(data.campaign)
        if (data.candidates) setCandidates(data.candidates)
        return
      }
      setCampaign(data.campaign)
      setCandidates(data.candidates || [])
      setMessage(`Discovery complete. Review ${data.candidates?.length || 0} candidate source${data.candidates?.length === 1 ? "" : "s"}.`)
      router.refresh()
    } catch {
      setError("Campaign discovery failed.")
    } finally {
      setWorking(null)
    }
  }

  const updateCandidate = async (
    candidate: SignalCampaignCandidate,
    body: Record<string, unknown>,
  ) => {
    setWorking(candidate.id)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/campaigns/${campaign.id}/candidates/${candidate.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Candidate could not be updated.")
        return
      }
      setCandidates((current) =>
        current.map((item) => (item.id === candidate.id ? data.candidate : item)),
      )
      setMessage("Candidate updated.")
      router.refresh()
    } catch {
      setError("Candidate could not be updated.")
    } finally {
      setWorking(null)
    }
  }

  const importApproved = async () => {
    setWorking("import")
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(`/api/signal/campaigns/${campaign.id}/import`, { method: "POST" })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Approved candidates could not be imported.")
        return
      }
      setCampaign(data.campaign)
      setMessage(
        `Imported ${data.imported?.length || 0} candidate${data.imported?.length === 1 ? "" : "s"} to Signal. ${data.failed?.length || 0} need review.`,
      )
      router.refresh()
      window.location.reload()
    } catch {
      setError("Approved candidates could not be imported.")
    } finally {
      setWorking(null)
    }
  }

  const addToFocus = async (candidate: SignalCampaignCandidate) => {
    if (!candidate.duplicate_prospect_id) {
      setError("Import or merge the candidate before adding it to Focus Mode.")
      return
    }
    setWorking(`focus:${candidate.id}`)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch("/api/signal/focus/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prospect_id: candidate.duplicate_prospect_id,
          campaign_id: campaign.id,
          focus_reason: candidate.reason || `Added from ${campaign.name}.`,
          recommended_action: "Review campaign evidence and prepare the next manual step.",
        }),
      })
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Could not add to Focus Mode.")
        return
      }
      setMessage(data.existing ? "Prospect is already in Focus Mode." : "Prospect added to Focus Mode.")
    } catch {
      setError("Could not add to Focus Mode.")
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/signal/campaigns" className="rounded-lg p-2 transition-colors hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Mountline Signal
            </p>
            <h1 className="text-2xl font-bold tracking-tight">{campaign.name}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {[campaign.target_city, campaign.target_state].filter(Boolean).join(", ")} · {playbooks.join(", ")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={working === "discover"}
            onClick={runDiscover}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
          >
            {working === "discover" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Discover Candidates
          </button>
          <button
            type="button"
            disabled={working === "import" || counts.approved === 0}
            onClick={importApproved}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
          >
            {working === "import" ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
            Import Approved
          </button>
          <Link
            href="/dashboard/signal/focus"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <RadioTower className="h-4 w-4" />
            Focus Mode
          </Link>
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

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-7">
        <Stat label="Status" value={statusLabels[campaign.status] || campaign.status} />
        <Stat label="Discovered" value={String(counts.discovered)} />
        <Stat label="Approved" value={String(counts.approved)} />
        <Stat label="Imported" value={String(counts.imported)} />
        <Stat label="Confirm" value={String(counts.confirm)} />
        <Stat label="Duplicates" value={String(counts.duplicate)} />
        <Stat label="Last run" value={formatDate(campaign.last_run_at)} />
      </section>

      <div className="rounded-xl border border-border bg-card p-4">
        <p className="text-sm font-medium">Next action</p>
        <p className="mt-1 text-sm text-muted-foreground">
          {campaign.next_action || "Run discovery, then approve only confirmed official public websites."}
        </p>
      </div>

      {candidates.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <RadioTower className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No candidates yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Run discovery when provider keys are configured, or keep this campaign as a manual planning record.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {candidates.map((candidate) => {
            const officialUrl = officialUrls[candidate.id] ?? candidate.likely_official_url ?? candidate.candidate_url ?? ""
            const mergeId = mergeIds[candidate.id] || candidate.duplicate_prospect_id || ""
            const duplicate = prospects.find((prospect) => prospect.id === candidate.duplicate_prospect_id)
            const imported = candidate.candidate_status === "imported_to_signal"

            return (
              <section key={candidate.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{candidate.business_name}</h2>
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${badgeClass(candidate.candidate_status)}`}>
                        {candidateStatusLabels[candidate.candidate_status] || candidate.candidate_status}
                      </span>
                      <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                        {candidate.official_source_confidence || "unknown"} confidence
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[candidate.city, candidate.state].filter(Boolean).join(", ") || "Location unknown"} · {candidate.industry_hint || "Industry unknown"}
                    </p>
                    {candidate.source_url && (
                      <a
                        href={candidate.source_url}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-2 inline-flex max-w-full items-center gap-1 truncate text-xs text-muted-foreground hover:text-foreground"
                      >
                        Source: {candidate.source_title || candidate.source_url}
                        <ExternalLink className="h-3 w-3 shrink-0" />
                      </a>
                    )}
                    {candidate.source_snippet && (
                      <p className="mt-2 max-w-4xl text-sm text-muted-foreground">{candidate.source_snippet}</p>
                    )}
                    {candidate.reason && (
                      <div className="mt-3 flex gap-2 rounded-lg border border-border bg-muted/30 p-2 text-xs text-muted-foreground">
                        <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <p>{candidate.reason}</p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {candidate.duplicate_prospect_id && (
                      <Link
                        href={`/dashboard/signal/${candidate.duplicate_prospect_id}`}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <ExternalLink className="h-4 w-4" />
                        {duplicate ? `Open ${duplicate.business_name}` : "Open prospect"}
                      </Link>
                    )}
                    {imported && (
                      <button
                        type="button"
                        disabled={working === `focus:${candidate.id}`}
                        onClick={() => addToFocus(candidate)}
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
                      >
                        {working === `focus:${candidate.id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <RadioTower className="h-4 w-4" />}
                        Add to Focus
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-[1.2fr_0.8fr_auto]">
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Official website to use</span>
                    <input
                      value={officialUrl}
                      onChange={(event) =>
                        setOfficialUrls((current) => ({
                          ...current,
                          [candidate.id]: event.target.value,
                        }))
                      }
                      placeholder="https://official-business-site.com"
                      className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                    />
                  </label>
                  <label className="block space-y-1">
                    <span className="text-xs font-medium text-muted-foreground">Merge into existing prospect</span>
                    <select
                      value={mergeId}
                      onChange={(event) =>
                        setMergeIds((current) => ({
                          ...current,
                          [candidate.id]: event.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                    >
                      <option value="">Create new prospect on import</option>
                      {prospects.map((prospect) => (
                        <option key={prospect.id} value={prospect.id}>
                          {prospect.business_name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <div className="flex flex-wrap items-end gap-2">
                    <button
                      type="button"
                      disabled={working === candidate.id || imported}
                      onClick={() =>
                        updateCandidate(candidate, {
                          candidate_status: "approved",
                          likely_official_url: officialUrl || null,
                          duplicate_prospect_id: mergeId || null,
                          reason: mergeId
                            ? "Approved to merge into an existing Signal prospect."
                            : "Approved by Mountline team for official-site scan and import.",
                        })
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-foreground px-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90 disabled:opacity-50"
                    >
                      {working === candidate.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                      Approve
                    </button>
                    <button
                      type="button"
                      disabled={working === candidate.id || imported}
                      onClick={() =>
                        updateCandidate(candidate, {
                          candidate_status: "rejected",
                          reason: "Rejected during campaign source review.",
                        })
                      }
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-red-500/25 px-3 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 break-words text-sm font-semibold">{value}</p>
    </div>
  )
}
