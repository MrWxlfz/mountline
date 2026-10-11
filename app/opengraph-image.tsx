import { ImageResponse } from "next/og"
import { OG_SIZE, OgDots, OgLogo, ogColors, ogFonts } from "@/lib/og"

export const alt = "Mountline: websites, Google listings, and ads for businesses around Keller, by Luke Nordin"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          padding: "68px 80px 60px",
          background: ogColors.bg,
          color: ogColors.ink,
          fontFamily: "Figtree",
        }}
      >
        <OgLogo size={38} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          <OgDots size={46} />
          <div style={{ display: "flex", marginTop: 34, fontSize: 30, fontWeight: 500, color: ogColors.ink2 }}>Luke Nordin</div>
          <div style={{ display: "flex", marginTop: 10, maxWidth: 940, fontSize: 70, fontWeight: 500, lineHeight: 1.06, letterSpacing: "-0.028em" }}>
            Websites, Google listings &amp; ads for businesses around Keller
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 22,
            borderTop: `1px solid ${ogColors.line}`,
            fontSize: 24,
            fontWeight: 500,
            color: ogColors.ink3,
          }}
        >
          <span style={{ display: "flex" }}>mountline.dev</span>
          <span style={{ display: "flex" }}>Keller, Texas</span>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  )
}
