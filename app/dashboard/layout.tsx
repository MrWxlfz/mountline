import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import { DashboardShell } from "./dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireNorthlineTeamMember()
  const supabase = createAdminClient()
  const [{ count: supportOpenCount }, { count: signalUnreadCount }] =
    await Promise.all([
      supabase
        .from("support_threads")
        .select("*", { count: "exact", head: true })
        .eq("status", "open"),
      supabase
        .from("signal_alerts")
        .select("*", { count: "exact", head: true })
        .is("read_at", null),
    ])

  return (
    <DashboardShell
      supportOpenCount={supportOpenCount || 0}
      signalUnreadCount={signalUnreadCount || 0}
    >
      {children}
    </DashboardShell>
  )
}
