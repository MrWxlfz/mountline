import { readFile } from "node:fs/promises"
import { join } from "node:path"

/** Shared pieces for the generated share images (app/opengraph-image.tsx, app/(marketing)/luke/opengraph-image.tsx). */

export const OG_SIZE = { width: 1200, height: 630 }

export const ogColors = {
  bg: "#FCFCFC",
  ink: "#141518",
  ink2: "#575B63",
  ink3: "#6F737B",
  line: "#E5E6E9",
  panel: "#F4F4F5",
  web: "#4A86F0",
  map: "#2E9E66",
  ads: "#F0913E",
  call: "#DE5B98",
}

/** Figtree 500/600 as TTF (the image renderer can't read woff2). */
export async function ogFonts() {
  const dir = join(process.cwd(), "app/fonts/og")
  const [medium, semibold] = await Promise.all([readFile(join(dir, "figtree-500.ttf")), readFile(join(dir, "figtree-600.ttf"))])
  return [
    { name: "Figtree", data: medium, weight: 500 as const, style: "normal" as const },
    { name: "Figtree", data: semibold, weight: 600 as const, style: "normal" as const },
  ]
}

/** The logo lockup: the ridge mark plus "mountline" in Figtree 600, scaled from the 19px spec. */
export function OgLogo({ size = 38, color = ogColors.ink }: { size?: number; color?: string }) {
  const scale = size / 19
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 * scale, fontSize: size, fontWeight: 600, letterSpacing: "-0.03em", color }}>
      <svg width={22 * scale} height={18 * scale} viewBox="0 0 22 18" fill="none">
        <path d="M1.5 16 6.8 7.6 9.6 11.2 14 2.6 20.5 16" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span style={{ display: "flex" }}>mountline</span>
    </div>
  )
}

/** The four service dots from the homepage. */
export function OgDots({ size = 44 }: { size?: number }) {
  const dot = (background: string, radius: string, extra: object = {}) => (
    <div style={{ display: "flex", width: size, height: size, background, borderRadius: radius, ...extra }} />
  )
  return (
    <div style={{ display: "flex", gap: size * 0.2 }}>
      {dot(ogColors.web, `${size * 0.3}px`)}
      {dot(ogColors.map, "50%")}
      {dot(ogColors.ads, `50% 50% 50% ${size * 0.4}px`)}
      <div style={{ display: "flex", width: size, height: size, borderRadius: "50%", background: "#ECECEE", border: `1px solid ${ogColors.line}`, alignItems: "center", justifyContent: "center", fontSize: size * 0.4, fontWeight: 600, color: ogColors.ink }}>L</div>
    </div>
  )
}
