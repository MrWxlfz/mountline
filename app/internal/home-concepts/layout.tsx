import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Internal — Home Concepts",
  robots: { index: false, follow: false },
}

export default function HomeConceptsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="min-h-screen">{children}</div>
}
