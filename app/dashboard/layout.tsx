import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { getAppearancePreference, type AppearancePreference } from "@/lib/appearance"
import { createAdminClient } from "@/lib/supabase/admin"
import { DashboardShell } from "./dashboard-shell"

function AppearancePreferenceBoot({ preference }: { preference: AppearancePreference | null }) {
  if (!preference) return null
  const value = JSON.stringify(preference)
  const script = `(()=>{try{const t=${value};localStorage.setItem('mountline-appearance',t);const r=t==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):t;const e=document.documentElement;e.classList.remove('light','dark');e.classList.add(r);e.style.colorScheme=r}catch{}})()`
  return <script dangerouslySetInnerHTML={{ __html: script }} />
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const access = await requireNorthlineTeamMember()
  const supabase = createAdminClient()
  const [
    { count: supportOpenCount },
    { count: signalUnreadCount },
    { data: commandLeads },
    appearancePreference,
  ] =
    await Promise.all([
      supabase
        .from("support_threads")
        .select("*", { count: "exact", head: true })
        .eq("status", "open"),
      supabase
        .from("signal_alerts")
        .select("*", { count: "exact", head: true })
        .is("read_at", null),
      supabase
        .from("signal_prospects")
        .select("id, business_name, city, state, public_phone, public_email")
        .neq("pipeline_stage", "lost")
        .order("updated_at", { ascending: false })
        .limit(30),
      getAppearancePreference(access.userId),
    ])

  return (
    <>
      <AppearancePreferenceBoot preference={appearancePreference} />
      <DashboardShell
        supportOpenCount={supportOpenCount || 0}
        signalUnreadCount={signalUnreadCount || 0}
        commandLeads={commandLeads || []}
      >
        {children}
      </DashboardShell>
    </>
  )
}
