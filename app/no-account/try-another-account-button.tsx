"use client"

import { SignOutButton } from "@clerk/nextjs"

export function TryAnotherAccountButton() {
  return (
    <SignOutButton redirectUrl="/id">
      <button type="button" className="ml-pill ml-pill-solid">
        Try another account
      </button>
    </SignOutButton>
  )
}
