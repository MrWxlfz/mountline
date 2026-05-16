"use client"

import { Suspense, useMemo } from "react"
import { SignIn } from "@clerk/nextjs"
import { NorthlineLogo } from "@/components/northline-logo"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { ArrowLeft } from "lucide-react"

export default function ClientLoginPage() {
  return (
    <Suspense fallback={<ClientLoginShell />}>
      <ClientLoginContent />
    </Suspense>
  )
}

function ClientLoginContent() {
  const searchParams = useSearchParams()
  const redirectUrl = useMemo(
    () => getSafePortalRedirect(searchParams.get("redirect_url")),
    [searchParams],
  )

  return <ClientLoginShell redirectUrl={redirectUrl} />
}

function getSafePortalRedirect(rawRedirect: string | null) {
  if (!rawRedirect) return "/portal"

  try {
    const url = rawRedirect.startsWith("/")
      ? new URL(rawRedirect, "https://northline.local")
      : new URL(rawRedirect)

    if (url.pathname === "/portal" || url.pathname.startsWith("/portal/")) {
      return `${url.pathname}${url.search}${url.hash}`
    }
  } catch {
    return "/portal"
  }

  return "/portal"
}

function ClientLoginShell({ redirectUrl = "/portal" }: { redirectUrl?: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <NorthlineLogo size="md" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Client Portal</h1>
            <p className="text-muted-foreground mt-1.5">
              Sign in to view your project progress and deliverables.
            </p>
          </div>
        </div>

        {/* Clerk Sign In */}
        <div className="flex justify-center">
          <SignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-card border border-border shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border-border",
                formButtonPrimary: "bg-foreground text-background hover:bg-foreground/90",
                footerAction: "hidden",
              }
            }}
            redirectUrl={redirectUrl}
            signUpUrl={undefined}
          />
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to northline.dev
          </Link>
        </div>
      </div>
    </div>
  )
}
