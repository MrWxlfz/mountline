"use client"

import { SignIn } from "@clerk/nextjs"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { NorthlineLogo } from "@/components/northline-logo"

export function MountlineIdForm({ redirectUrl }: { redirectUrl: string }) {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-4">
          <NorthlineLogo size="md" showWordmark className="justify-center" />
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Mountline ID</h1>
            <p className="text-muted-foreground mt-1.5">
              Sign in once to access your Mountline workspace, client portal, or project dashboard.
            </p>
          </div>
        </div>

        <div className="flex justify-center">
          <SignIn
            path="/id"
            routing="path"
            forceRedirectUrl={redirectUrl}
            fallbackRedirectUrl={redirectUrl}
            withSignUp={false}
            signUpUrl={undefined}
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-card border border-border shadow-none",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "border-border",
                formButtonPrimary: "bg-foreground text-background hover:bg-foreground/90",
                footerAction: "hidden",
              },
            }}
          />
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Mountline
          </Link>
        </div>
      </div>
    </div>
  )
}
