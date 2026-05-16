import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { DashboardShell } from "./dashboard-shell"

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await requireNorthlineTeamMember()

  return <DashboardShell>{children}</DashboardShell>
}
