import { PageHeader, SectionPanel, StatusBadge } from "@/components/dashboard/dashboard-ui"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { pilotChecklist } from "@/lib/receptionist/prompt"
import { ReceptionistSetup } from "./receptionist-setup"

export default async function ReceptionistPage() {
  await requireNorthlineTeamMember()

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Receptionist"
        title="Prepare a receptionist pilot"
        subtitle="Turn business facts into a consistent call-handling draft. Review and export it for a provider setup; nothing here changes a live agent or phone number."
        meta={<StatusBadge tone="amber">Provider not connected</StatusBadge>}
      />
      <ReceptionistSetup />
      <SectionPanel title="Before routing real calls" description="A valid profile is a starting point. Each of these needs evidence before a customer pilot.">
        <ol className="space-y-5">
          {pilotChecklist.map((item, index) => (
            <li key={item.title} className="flex gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-border font-mono text-xs text-muted-foreground">{index + 1}</span>
              <div>
                <h3 className="text-sm font-medium">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
              </div>
            </li>
          ))}
        </ol>
      </SectionPanel>
    </div>
  )
}
