"use client"

export default function SignalRunError({ reset }: { error: Error; reset: () => void }) {
  return (
    <section className="rounded-xl border border-error-border bg-error-soft p-6">
      <p className="text-sm font-medium text-foreground">Signal could not load this run.</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        The saved run is still available. Try again, or return to Signal and start from the recent-runs list.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 inline-flex h-9 items-center rounded-md bg-foreground px-3 text-sm font-medium text-background transition-colors hover:bg-foreground/90"
      >
        Try again
      </button>
    </section>
  )
}
