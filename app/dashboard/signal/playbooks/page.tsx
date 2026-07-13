import Link from "next/link"
import { ArrowLeft, BookOpen, ShieldAlert } from "lucide-react"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { SIGNAL_PLAYBOOKS } from "@/lib/signal/playbooks"
import { formatSignalLabel } from "@/lib/signal/presentation"

export default async function SignalPlaybooksPage() {
  await requireNorthlineTeamMember()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/signal" className="rounded-lg p-2 transition-colors hover:bg-muted">
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <p className="mb-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Mountline Signal
          </p>
          <h1 className="text-2xl font-bold tracking-tight">Playbooks</h1>
          <p className="text-sm text-muted-foreground">
            Sector guidance for evidence-grounded research and manual outreach.
          </p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {Object.values(SIGNAL_PLAYBOOKS).map((playbook) => (
          <section key={playbook.key} className="rounded-xl border border-border bg-card p-5">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <h2 className="font-semibold">{playbook.name}</h2>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Demo: {playbook.relevantDemo === "none" ? "None yet" : playbook.relevantDemo}
                </p>
              </div>
              <span className="rounded-full border border-border bg-muted px-2.5 py-0.5 text-xs text-muted-foreground">
                {formatSignalLabel(playbook.recommendedOutreachMode)}
              </span>
            </div>

            {playbook.complianceTier === "compliance_gated" && (
              <div className="mb-4 flex gap-2 rounded-lg border border-yellow-500/25 bg-yellow-500/10 p-3 text-sm text-yellow-100">
                <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <p>{playbook.complianceNotes[0]}</p>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <List title="Ideal prospect signals" items={playbook.idealSignals} />
              <List title="Visible website weaknesses" items={playbook.visibleWeaknesses} />
              <List title="Workflow / AI opportunities" items={playbook.workflowOpportunities} />
              <List title="Discovery-call questions" items={playbook.discoveryQuestions} />
              <List title="Red flags" items={playbook.redFlags} />
              <List title="Compliance notes" items={playbook.complianceNotes} />
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function List({ items, title }: { items: string[]; title: string }) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</p>
      <ul className="space-y-2 text-sm text-muted-foreground">
        {items.map((item) => (
          <li key={item} className="leading-relaxed">
            {item}
          </li>
        ))}
      </ul>
    </div>
  )
}
