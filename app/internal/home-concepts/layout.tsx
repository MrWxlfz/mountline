import type { Metadata } from "next"
import type { ReactNode } from "react"
import "./concepts.css"

// Internal, non-public evaluation routes for the homepage visual reset.
// Kept out of search + public navigation. Safe to remove after the decision.
export const metadata: Metadata = {
  title: "Mountline — internal home concepts",
  robots: { index: false, follow: false },
}

export default function HomeConceptsLayout({ children }: { children: ReactNode }) {
  return children
}
