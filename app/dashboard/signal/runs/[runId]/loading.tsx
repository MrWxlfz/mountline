export default function SignalRunLoading() {
  return (
    <div className="space-y-6" aria-label="Loading Signal lead run">
      <div className="h-48 animate-pulse rounded-xl border border-border bg-card" />
      <div className="grid gap-4 xl:grid-cols-2">
        <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
        <div className="h-72 animate-pulse rounded-xl border border-border bg-card" />
      </div>
    </div>
  )
}
