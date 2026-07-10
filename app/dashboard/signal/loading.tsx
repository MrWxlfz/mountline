export default function SignalLoading() {
  return (
    <div className="space-y-6" aria-label="Loading Signal">
      <div className="h-64 animate-pulse rounded-xl border border-border bg-card" />
      <div className="h-[360px] animate-pulse rounded-xl border border-border bg-card" />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="h-44 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-44 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    </div>
  )
}
