import Link from "next/link"
import { FolderKanban, Pencil, Plus } from "lucide-react"
import { CompactTable, EmptyState, MetricStrip, PageHeader, PrimaryAction, SectionPanel, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { createAdminClient } from "@/lib/supabase/admin"
import { ProjectLinkActions } from "./project-link-actions"

type ProjectListRow = {
  id: string
  project_name: string
  package_type: string | null
  status: string
  next_step: string | null
  payment_status: string | null
  portal_id: string | null
  preview_url: string | null
  live_url: string | null
  payment_link: string | null
  clients: { business_name: string } | Array<{ business_name: string }> | null
  project_receipts: Array<{ amount_minor: number; currency: string }>
}

function tone(status: string) {
  if (status === "completed" || status === "support") return "green" as const
  if (status === "review" || status === "launch") return "amber" as const
  if (status === "design" || status === "build") return "blue" as const
  return "default" as const
}

function paymentEvidence(project: { payment_status?: string | null; project_receipts?: Array<{ amount_minor: number; currency: string }> }) {
  const receipts = project.project_receipts || []
  if (receipts.length > 0) {
    const currencies = Array.from(new Set(receipts.map((receipt) => receipt.currency)))
    return { label: `receipt${receipts.length === 1 ? "" : "s"} · ${currencies.join("/")}`, tone: "green" as const }
  }
  if (project.payment_status === "paid" || project.payment_status === "manual_received") return { label: "legacy · unverified", tone: "amber" as const }
  return { label: (project.payment_status || "not sent").replace(/_/g, " "), tone: project.payment_status === "pending" ? "amber" as const : "default" as const }
}

function clientName(project: ProjectListRow) {
  const client = Array.isArray(project.clients) ? project.clients[0] : project.clients
  return client?.business_name || "No client"
}
export default async function ProjectsPage() {
  await requireNorthlineTeamMember()
  const supabase = createAdminClient()
  const { data: projects, error } = await supabase.from("projects").select("*, clients(business_name, contact_name), project_receipts(amount_minor, currency)").order("created_at", { ascending: false })
  const rows = (projects || []) as ProjectListRow[]
  return (
    <div className="space-y-7">
      <PageHeader eyebrow="Projects" title="Delivery projects" subtitle="Status, next step, links, payment state, and portal readiness without leaving the operating view." actions={<PrimaryAction href="/dashboard/projects/new" icon={Plus}>New project</PrimaryAction>} />
      {error && <div className="rounded-lg border border-error-border bg-error-soft px-3 py-2 text-sm text-error-foreground">Projects could not be loaded: {error.message}</div>}
      <MetricStrip items={[{ label: "All projects", value: rows.length }, { label: "In build", value: rows.filter((item) => item.status === "build").length, tone: "blue" }, { label: "In review", value: rows.filter((item) => item.status === "review").length, tone: "amber" }, { label: "Completed", value: rows.filter((item) => item.status === "completed").length, tone: "green" }]} />
      <SectionPanel title="Project register" description="Edit a project to update delivery, payment, and portal details.">
        {rows.length ? <CompactTable minWidth="1080px"><thead><tr className="border-b border-border text-left text-xs uppercase tracking-wider text-muted-foreground"><th className="px-3 py-3 font-medium">Project</th><th className="px-3 py-3 font-medium">Client</th><th className="px-3 py-3 font-medium">Status</th><th className="px-3 py-3 font-medium">Next step</th><th className="px-3 py-3 font-medium">Payment</th><th className="px-3 py-3 font-medium">Links</th><th className="px-3 py-3 text-right font-medium">Edit</th></tr></thead><tbody className="divide-y divide-border">{rows.map((project) => { const payment = paymentEvidence(project); return <tr key={project.id} className="align-top hover:bg-muted/25"><td className="px-3 py-4"><p className="font-medium">{project.project_name}</p><p className="mt-1 text-xs text-muted-foreground">{project.package_type || "Package not set"}</p></td><td className="px-3 py-4 text-sm text-muted-foreground">{clientName(project)}</td><td className="px-3 py-4"><StatusBadge tone={tone(project.status)}>{project.status}</StatusBadge></td><td className="max-w-[260px] px-3 py-4 text-sm text-muted-foreground">{project.next_step || "Update next step"}</td><td className="px-3 py-4"><StatusBadge tone={payment.tone}>{payment.label}</StatusBadge></td><td className="px-3 py-4"><ProjectLinkActions portalPath={project.portal_id ? `/portal/${project.portal_id}` : null} previewUrl={project.preview_url} liveUrl={project.live_url} paymentLink={project.payment_link} /></td><td className="px-3 py-4 text-right"><Link href={`/dashboard/projects/${project.id}/edit`} className="inline-flex items-center gap-2 rounded-md border border-border px-3 py-2 text-xs text-muted-foreground hover:bg-muted hover:text-foreground"><Pencil className="h-3.5 w-3.5" /> Edit</Link></td></tr> })}</tbody></CompactTable> : <EmptyState title="No delivery projects" icon={FolderKanban} action={<PrimaryAction href="/dashboard/projects/new" icon={Plus}>New project</PrimaryAction>}>Create a project after client scope is confirmed.</EmptyState>}
      </SectionPanel>
    </div>
  )
}
