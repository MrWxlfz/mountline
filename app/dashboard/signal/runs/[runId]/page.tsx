import Link from "next/link"
import { notFound } from "next/navigation"
import { requireNorthlineTeamMember } from "@/lib/auth/team"
import { getSignalLeadRunSnapshot } from "@/lib/signal/lead-runs"
import { SignalRunDetail } from "./signal-run-detail"

export const dynamic = "force-dynamic"

export default async function SignalRunPage({
  params,
}: {
  params: Promise<{ runId: string }>
}) {
  await requireNorthlineTeamMember()
  const { runId } = await params

  try {
    const snapshot = await getSignalLeadRunSnapshot(runId)
    if (!snapshot) notFound()

    return (
      <SignalRunDetail
        initialEvents={snapshot.events}
        initialLeads={snapshot.leads}
        initialRun={snapshot.run}
      />
    )
  } catch (error) {
    console.error("[signal] Run detail page failed:", error)
    return (
      <section className="rounded-lg border border-red-500/30 bg-red-500/5 p-6">
        <p className="text-sm font-medium text-foreground">Signal could not load this lead run.</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Confirm the Signal lead-run migration has been applied, then try again.
        </p>
        <Link href="/dashboard/signal" className="mt-4 inline-flex text-sm font-medium text-foreground underline underline-offset-4">
          Back to Signal
        </Link>
      </section>
    )
  }
}
