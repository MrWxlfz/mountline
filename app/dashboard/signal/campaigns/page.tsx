import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  MapPin,
  Plus,
  RadioTower,
} from "lucide-react"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { getSignalPlaybook } from "@/lib/signal/playbooks"
import { createAdminClient } from "@/lib/supabase/admin"
import type {
  SignalCampaign,
  SignalCampaignCandidate,
} from "@/lib/supabase/types"

type CampaignRow = SignalCampaign & {
  candidates: SignalCampaignCandidate[]
}

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

function formatDate(value: string | null | undefined) {
  if (!value) return "-"
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  })
}

async function getCampaignRows(): Promise<CampaignRow[]> {
  const supabase = createAdminClient()
  const [{ data: campaigns }, { data: candidates }] = await Promise.all([
    supabase
      .from("signal_campaigns")
      .select("*")
      .order("created_at", { ascending: false }),
    supabase
      .from("signal_campaign_candidates")
      .select("*")
      .order("created_at", { ascending: false }),
  ])

  const candidatesByCampaign = new Map<string, SignalCampaignCandidate[]>()
  ;((candidates || []) as SignalCampaignCandidate[]).forEach((candidate) => {
    candidatesByCampaign.set(candidate.campaign_id, [
      ...(candidatesByCampaign.get(candidate.campaign_id) || []),
      candidate,
    ])
  })

  return ((campaigns || []) as SignalCampaign[]).map((campaign) => ({
    ...campaign,
    candidates: candidatesByCampaign.get(campaign.id) || [],
  }))
}

export default async function SignalCampaignsPage() {
  await requireNorthlineTeamMember()
  const campaigns = await getCampaignRows()

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex items-start gap-4">
          <Link href="/dashboard/signal" className="rounded-lg p-2 transition-colors hover:bg-muted">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <p className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              Mountline Signal
            </p>
            <h1 className="text-2xl font-bold tracking-tight">Campaigns</h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
              Build city campaigns, review public sources, and import only confirmed official websites.
            </p>
          </div>
        </div>
        <Link
          href="/dashboard/signal/campaigns/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
        >
          <Plus className="h-4 w-4" />
          Build Campaign
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
          <RadioTower className="mx-auto mb-3 h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No campaigns yet</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Start with a city and one vertical, then review sources before importing prospects.
          </p>
          <Link
            href="/dashboard/signal/campaigns/new"
            className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-foreground px-4 text-sm font-medium text-background"
          >
            <Plus className="h-4 w-4" />
            Build Campaign
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {campaigns.map((campaign) => {
            const approved = campaign.candidates.filter((candidate) => candidate.candidate_status === "approved").length
            const imported = campaign.candidates.filter((candidate) => candidate.candidate_status === "imported_to_signal").length
            const needsConfirmation = campaign.candidates.filter((candidate) => candidate.candidate_status === "needs_confirmation").length
            const playbooks = campaign.selected_playbooks
              .map((key) => getSignalPlaybook(key).name)
              .join(", ")

            return (
              <Link
                key={campaign.id}
                href={`/dashboard/signal/campaigns/${campaign.id}`}
                className="group rounded-xl border border-border bg-card p-5 transition-colors hover:border-border-strong hover:bg-card-elevated"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                      {statusLabels[campaign.status] || campaign.status}
                    </p>
                    <h2 className="mt-1 text-lg font-semibold">{campaign.name}</h2>
                    <p className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                      <MapPin className="h-3.5 w-3.5" />
                      {[campaign.target_city, campaign.target_state].filter(Boolean).join(", ")}
                    </p>
                  </div>
                  <span className="rounded-full border border-border px-2.5 py-1 text-xs text-muted-foreground group-hover:text-foreground">
                    Open
                  </span>
                </div>
                <p className="mt-4 text-sm text-muted-foreground">{playbooks}</p>
                <div className="mt-5 grid gap-2 sm:grid-cols-4">
                  <MiniStat label="Discovered" value={campaign.candidates.length} />
                  <MiniStat label="Approved" value={approved} />
                  <MiniStat label="Imported" value={imported} />
                  <MiniStat label="Confirm" value={needsConfirmation} />
                </div>
                <div className="mt-4 flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-400" />
                  <p>{campaign.next_action || `Last run ${formatDate(campaign.last_run_at)}`}</p>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg border border-border bg-muted/30 p-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 font-mono text-lg font-semibold">{value}</p>
    </div>
  )
}
