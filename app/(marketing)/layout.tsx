import type { Viewport } from "next"
import { Instrument_Serif } from "next/font/google"
import "./marketing.css"

// One italic word in the hero headline, nothing else.
const accentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: "italic",
  variable: "--font-accent-serif",
  display: "swap",
})

export const viewport: Viewport = {
  themeColor: "#f7f8fa",
  colorScheme: "light",
}

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <div className={`mk ${accentSerif.variable}`}>{children}</div>
}
