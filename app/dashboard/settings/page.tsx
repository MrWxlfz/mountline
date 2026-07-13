import { CheckCircle2, CircleAlert, KeyRound, Shield, User } from "lucide-react"
import { PageHeader, SectionPanel, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { getSignalPlacesSetup } from "@/lib/signal/places"

function ProviderRow({ configured, label, note }: { configured: boolean; label: string; note: string }) {
  return <div className="flex flex-col gap-3 rounded-lg border border-border bg-muted/15 p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3">{configured ? <CheckCircle2 className="mt-0.5 h-4 w-4 text-green-300" /> : <CircleAlert className="mt-0.5 h-4 w-4 text-yellow-200" />}<div><p className="text-sm font-medium">{label}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">{note}</p></div></div><StatusBadge tone={configured ? "green" : "amber"}>{configured ? "Configured" : "Not configured"}</StatusBadge></div>
}
export default async function SettingsPage() {
  const access = await requireNorthlineTeamMember()
  const places = getSignalPlacesSetup()
  const provider = process.env.SIGNAL_RESEARCH_PROVIDER?.toLowerCase()
  const aiProvider = process.env.SIGNAL_AI_PROVIDER?.toLowerCase()
  const screenshotProvider = process.env.SIGNAL_SCREENSHOT_PROVIDER?.toLowerCase()
  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Settings" title="Account and provider status" subtitle="Read-only deployment health. Secrets and provider credentials are never displayed in the dashboard." />
      <div className="grid gap-5 xl:grid-cols-2">
        <SectionPanel title="Mountline ID" description="Identity and security are managed by Clerk."><div className="space-y-4"><div className="flex items-start gap-3 rounded-lg border border-border p-4"><User className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">Signed-in team account</p><p className="mt-1 text-sm text-muted-foreground">{access.emails[0] || access.userId}</p></div></div><div className="flex items-start gap-3 rounded-lg border border-border p-4"><Shield className="mt-0.5 h-4 w-4 text-muted-foreground" /><div><p className="text-sm font-medium">Team authorization</p><p className="mt-1 text-sm text-muted-foreground">Active Mountline team-member access confirmed. Use the account control in the sidebar for profile and Clerk security settings.</p></div></div></div></SectionPanel>
        <SectionPanel title="Security boundaries" description="Operational reminders for this deployment."><div className="space-y-3 text-sm text-muted-foreground"><p className="flex gap-2"><KeyRound className="mt-0.5 h-4 w-4 shrink-0" />Dashboard and API access require a Clerk-authenticated Mountline team record.</p><p className="flex gap-2"><KeyRound className="mt-0.5 h-4 w-4 shrink-0" />Supabase service-role access stays in server-only modules and is not exposed to the browser.</p><p className="flex gap-2"><KeyRound className="mt-0.5 h-4 w-4 shrink-0" />Client portal authorization remains project-assignment based.</p></div></SectionPanel>
      </div>
      <SectionPanel title="Signal providers" description="Configuration presence only. Values are resolved from server environment variables.">
        <div className="grid gap-3 lg:grid-cols-2">
          <ProviderRow configured={places.enabled} label="Google Places" note={places.enabled ? "Structured place details are available for supported Maps inputs." : places.warning || "Map details require a server-side provider key."} />
          <ProviderRow configured={provider === "tavily" && Boolean(process.env.TAVILY_API_KEY)} label="Public web research" note={provider === "tavily" ? "Tavily is selected for public business research." : "Focused analysis still works with direct public sources; broader search is limited."} />
          <ProviderRow configured={Boolean(aiProvider && aiProvider !== "disabled" && (process.env.GEMINI_API_KEY || process.env.OPENAI_API_KEY))} label="AI analysis" note="When unavailable, Signal uses deterministic scoring and clearly marks the limitation." />
          <ProviderRow configured={Boolean(screenshotProvider && screenshotProvider !== "disabled" && (process.env.BROWSERLESS_API_KEY || process.env.FIRECRAWL_API_KEY))} label="Screenshot analysis" note="Optional visual evidence. Website text analysis and manual screenshot upload remain available without it." />
        </div>
      </SectionPanel>
    </div>
  )
}
