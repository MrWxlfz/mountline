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
  const { count: supportOpenCount } = await supabase
    .from("support_threads")
    .select("*", { count: "exact", head: true })
    .eq("status", "open")

  return (
    <DashboardShell supportOpenCount={supportOpenCount || 0}>
      {children}
    </DashboardShell>
  )
}
