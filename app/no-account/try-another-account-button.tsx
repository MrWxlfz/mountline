"use client"

import { SignOutButton } from "@clerk/nextjs"
import { LogIn } from "lucide-react"

export function TryAnotherAccountButton() {
  return (
    <SignOutButton redirectUrl="/id">
      <button
        type="button"
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-foreground px-4 py-2.5 text-sm font-medium text-background hover:bg-foreground/90 transition-colors"
      >
        <LogIn className="h-4 w-4" />
        Try another account
      </button>
    </SignOutButton>
  )
}
