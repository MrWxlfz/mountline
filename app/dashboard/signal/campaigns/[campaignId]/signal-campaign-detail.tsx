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
  MoreHorizontal,
  RadioTower,
  Search,
  UserPlus,
  XCircle,
} from "lucide-react"
import {
  EmptyState,
  MetricStrip,
  PageHeader,
  PrimaryAction,
  SecondaryAction,
  SectionPanel,
  StatusBadge,
} from "@/components/dashboard/dashboard-ui"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getSignalPlaybook } from "@/lib/signal/playbooks"
import { formatBusinessCategory, formatSignalLabel } from "@/lib/signal/presentation"
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

const campaignStages = [
  "Discover",
  "Review Candidates",
  "Confirm Official Sites",
  "Quick Score",
  "Prioritize",
  "Add to Focus Mode",
]

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
  const [categoryOverrides, setCategoryOverrides] = useState<Record<string, string>>({})
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

  const quickScoreCandidate = async (candidate: SignalCampaignCandidate) => {
    setWorking(`score:${candidate.id}`)
    setError(null)
    setMessage(null)
    try {
      const response = await fetch(
        `/api/signal/campaigns/${campaign.id}/candidates/${candidate.id}/quick-score`,
        { method: "POST" },
      )
      const data = await response.json().catch(() => ({}))
      if (!response.ok) {
        setError(data.error || "Candidate quick score failed.")
        return
      }
      setCandidates((current) =>
        current.map((item) => (item.id === candidate.id ? data.candidate : item)),
      )
      setMessage(
        data.ai_unavailable
          ? "Candidate quick score complete. AI unavailable; rule-based score shown."
          : "Candidate quick score complete.",
      )
      router.refresh()
    } catch {
      setError("Candidate quick score failed.")
    } finally {
      setWorking(null)
    }
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Mountline Signal"
        title={campaign.name}
        subtitle={`${[campaign.target_city, campaign.target_state].filter(Boolean).join(", ")} · ${playbooks.join(", ")}`}
        meta={
          <Link href="/dashboard/signal/campaigns" className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-3.5 w-3.5" />
            Campaigns
          </Link>
        }
        actions={
          <>
            <PrimaryAction onClick={runDiscover} disabled={working === "discover"} icon={working === "discover" ? Loader2 : Search}>
              Discover Candidates
            </PrimaryAction>
            <SecondaryAction onClick={importApproved} disabled={working === "import" || counts.approved === 0} icon={working === "import" ? Loader2 : UserPlus}>
              Import Approved
            </SecondaryAction>
            <SecondaryAction href="/dashboard/signal/focus" icon={RadioTower}>Focus Mode</SecondaryAction>
          </>
        }
      />

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

      <SectionPanel>
        <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
          {campaignStages.map((stage, index) => (
            <div key={stage} className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="font-mono text-xs text-muted-foreground">{index + 1}</p>
              <p className="mt-1 text-sm font-medium">{stage}</p>
            </div>
          ))}
        </div>
      </SectionPanel>

      <MetricStrip
        items={[
          { label: "Status", value: statusLabels[campaign.status] || campaign.status },
          { label: "Discovered", value: counts.discovered },
          { label: "Approved", value: counts.approved, tone: counts.approved ? "green" : "default" },
          { label: "Imported", value: counts.imported },
          { label: "Confirm", value: counts.confirm, tone: counts.confirm ? "amber" : "default" },
        ]}
      />

      <SectionPanel title="Next Action">
        <p className="text-sm text-muted-foreground">
          {campaign.next_action || "Run discovery, then approve only confirmed official public websites."}
        </p>
      </SectionPanel>

      {candidates.length === 0 ? (
        <EmptyState title="No candidates yet" icon={RadioTower}>
          Run discovery when provider keys are configured, or keep this campaign as a manual planning record.
        </EmptyState>
      ) : (
        <div className="space-y-3">
          {candidates.map((candidate) => {
            const officialUrl = officialUrls[candidate.id] ?? candidate.likely_official_url ?? candidate.candidate_url ?? ""
            const mergeId = mergeIds[candidate.id] || candidate.duplicate_prospect_id || ""
            const categoryValue = categoryOverrides[candidate.id] || candidate.classified_playbook || "general_local_business"
            const duplicate = prospects.find((prospect) => prospect.id === candidate.duplicate_prospect_id)
            const imported = candidate.candidate_status === "imported_to_signal"
            const quickScore = candidate.quick_score_summary && typeof candidate.quick_score_summary === "object"
              ? (candidate.quick_score_summary as Record<string, unknown>)
              : null
            const quickScoreDetails =
              quickScore?.quick_score && typeof quickScore.quick_score === "object"
                ? (quickScore.quick_score as Record<string, unknown>)
                : null

            return (
              <section key={candidate.id} className="rounded-xl border border-border bg-card p-4">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="font-semibold">{candidate.business_name}</h2>
                      <span className={`rounded-full border px-2 py-0.5 text-xs ${badgeClass(candidate.candidate_status)}`}>
                        {candidateStatusLabels[candidate.candidate_status] || candidate.candidate_status}
                      </span>
                      <StatusBadge>{candidate.official_source_confidence || "unknown"} site</StatusBadge>
                      <StatusBadge>{candidate.classification_confidence || "unknown"} category</StatusBadge>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {[candidate.city, candidate.state].filter(Boolean).join(", ") || "Location unknown"} · {formatBusinessCategory(candidate.classified_playbook || candidate.industry_hint, "Industry unknown")}
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
                    {quickScoreDetails && (
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground sm:grid-cols-4">
                        <MiniStat label="Priority" value={String(quickScoreDetails.priority || "-")} />
                        <MiniStat label="Score" value={String(quickScoreDetails.overall_opportunity_score || "-")} />
                        <MiniStat label="Lane" value={formatSignalLabel(String(quickScoreDetails.recommended_lane || "-"), "-")} />
                        <MiniStat label="Coverage" value={String(quickScoreDetails.scan_coverage_confidence || "-")} />
                      </div>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        type="button"
                        className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-border px-3 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        Actions
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-60">
                      <DropdownMenuItem
                        disabled={working === candidate.id || imported}
                        onSelect={() =>
                          updateCandidate(candidate, {
                            candidate_status: "approved",
                            likely_official_url: officialUrl || null,
                            duplicate_prospect_id: mergeId || null,
                            classified_playbook: categoryValue,
                            reason: mergeId
                              ? "Approved to merge into an existing Signal prospect."
                              : "Approved by Mountline team for official-site scan and import.",
                          })
                        }
                      >
                        <CheckCircle2 className="h-4 w-4" />
                        Approve
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={working === candidate.id || imported}
                        onSelect={() =>
                          updateCandidate(candidate, {
                            candidate_status: "rejected",
                            reason: "Rejected during campaign source review.",
                          })
                        }
                      >
                        <XCircle className="h-4 w-4" />
                        Reject From Campaign
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={working === candidate.id || imported}
                        onSelect={() =>
                          updateCandidate(candidate, {
                            candidate_status: "rejected",
                            reason: "Rejected permanently from campaign review.",
                          })
                        }
                      >
                        <XCircle className="h-4 w-4" />
                        Reject Permanently
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        disabled={working === candidate.id || imported}
                        onSelect={() =>
                          updateCandidate(candidate, {
                            candidate_status: "duplicate",
                            duplicate_prospect_id: mergeId || candidate.duplicate_prospect_id,
                            reason: "Marked duplicate during campaign review.",
                          })
                        }
                      >
                        Mark Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={working === candidate.id || imported}
                        onSelect={() =>
                          updateCandidate(candidate, {
                            candidate_status: "pending_review",
                            duplicate_prospect_id: null,
                            reason: "Marked not a duplicate during campaign review.",
                          })
                        }
                      >
                        Not a Duplicate
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        disabled={working === candidate.id || imported}
                        onSelect={() =>
                          updateCandidate(candidate, {
                            candidate_status: "needs_confirmation",
                            likely_official_url: officialUrl || null,
                            reason: "Official website needs confirmation.",
                          })
                        }
                      >
                        Confirm Official Site
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem disabled={working === `score:${candidate.id}` || !officialUrl} onSelect={() => quickScoreCandidate(candidate)}>
                        <Search className="h-4 w-4" />
                        Quick Score
                      </DropdownMenuItem>
                      {imported && (
                        <DropdownMenuItem disabled={working === `focus:${candidate.id}`} onSelect={() => addToFocus(candidate)}>
                          <RadioTower className="h-4 w-4" />
                          Add to Focus Mode
                        </DropdownMenuItem>
                      )}
                      {candidate.duplicate_prospect_id && (
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/signal/${candidate.duplicate_prospect_id}`}>
                            <ExternalLink className="h-4 w-4" />
                            {duplicate ? `Open ${duplicate.business_name}` : "Open prospect"}
                          </Link>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 grid gap-3 xl:grid-cols-[1.1fr_0.8fr_0.8fr]">
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
                    <span className="text-xs font-medium text-muted-foreground">Category</span>
                    <select
                      value={categoryValue}
                      onChange={(event) =>
                        setCategoryOverrides((current) => ({
                          ...current,
                          [candidate.id]: event.target.value,
                        }))
                      }
                      className="h-10 w-full rounded-lg border border-border bg-muted px-3 text-sm outline-none focus:ring-2 focus:ring-foreground/20"
                    >
                      {[
                        "auto_detailing",
                        "barber_salon",
                        "beauty_wellness",
                        "hvac",
                        "roofing_contractors_home_services",
                        "medical_dental",
                        "restaurant_food",
                        "general_local_business",
                        "unknown_needs_review",
                      ].map((value) => (
                        <option key={value} value={value}>
                          {formatSignalLabel(value)}
                        </option>
                      ))}
                    </select>
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
                </div>
              </section>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-md border border-border bg-background/50 px-2 py-2">
      <p className="font-mono text-sm text-foreground">{value}</p>
      <p className="mt-1 text-[11px] uppercase tracking-wide">{label}</p>
    </div>
  )
}
