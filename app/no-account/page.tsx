import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { NorthlineLogo } from "@/components/northline-logo"
import { TryAnotherAccountButton } from "./try-another-account-button"

export default function NoAccountPage() {
  return (
    <main className="min-h-screen bg-background text-foreground flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md text-center space-y-8">
        <NorthlineLogo size="md" showWordmark className="justify-center" />

        <div className="space-y-3">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            Mountline ID
          </p>
          <h1 className="text-2xl font-bold tracking-tight">No Mountline access found</h1>
          <p className="text-sm text-muted-foreground">
            This account is not linked to a Mountline workspace or client portal yet.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-foreground hover:bg-muted transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Mountline
          </Link>
          <TryAnotherAccountButton />
        </div>
      </div>
    </main>
  )
}
