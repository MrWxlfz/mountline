"use client"

import type { ReactNode } from "react"
import { reviewEventName } from "@/lib/review-interest"

export function ReviewLink({
  interest,
  className,
  children,
}: {
  interest: "website-launch" | "lead-recovery" | "custom-systems" | "not-sure"
  className: string
  children: ReactNode
}) {
  function selectInterest() {
    try {
      window.sessionStorage.setItem("mountline-review-interest", interest)
    } catch {
      // The custom event still updates the active form when storage is unavailable.
    }

    window.dispatchEvent(
      new CustomEvent(reviewEventName, {
        detail: interest,
      }),
    )
  }

  return (
    <a
      href={`#review-${interest}`}
      data-review-interest={interest}
      onClick={selectInterest}
      className={className}
    >
      {children}
    </a>
  )
}
