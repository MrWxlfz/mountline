import type { Metadata } from "next"
import "./concepts.css"

export const metadata: Metadata = {
  title: "Mountline internal concept sprint",
  robots: { index: false, follow: false },
}

export default function HomeConceptsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="hc-root">{children}</div>
}
