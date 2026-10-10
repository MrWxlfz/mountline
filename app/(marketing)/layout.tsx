import type { Viewport } from "next"
import { figtree, fraunces } from "@/app/fonts/fonts"
import "./marketing.css"

export const viewport: Viewport = {
  themeColor: "#FCFCFC",
  colorScheme: "light",
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`mk ${figtree.variable} ${fraunces.variable}`}>{children}</div>
}
