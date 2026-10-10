import { Figtree } from "next/font/google"
import localFont from "next/font/local"

/**
 * Public-page faces. Geist and Geist Mono come from the root layout (app/layout.tsx), so the
 * dashboard and the public site share one copy of each.
 */

/** Headings and the "mountline" wordmark. */
export const figtree = Figtree({
  subsets: ["latin"],
  weight: ["500", "600"],
  variable: "--font-figtree",
  display: "swap",
})

/**
 * Only inside the Oak & Ember example mockups. Self-hosted copies of Google's latin files with the
 * optical-size axis at weight 500 (next/font/google can't request opsz without the full weight
 * range), so big headlines and tiny labels get the same cuts as the design reference.
 */
export const fraunces = localFont({
  src: [
    { path: "./fraunces-500.woff2", weight: "500", style: "normal" },
    { path: "./fraunces-500-italic.woff2", weight: "500", style: "italic" },
  ],
  variable: "--font-fraunces",
  display: "swap",
  preload: false,
  fallback: ["Georgia", "Times New Roman", "serif"],
})
