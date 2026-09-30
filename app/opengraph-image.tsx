import { ImageResponse } from "next/og"

export const alt = "Mountline: websites for local businesses, with photo, video, and AI receptionists"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

function Mark({ size: side, color }: { size: number; color: string }) {
  return (
    <svg width={side} height={side} viewBox="0 0 180 180" fill="none">
      <path d="M90 34 145 137H35L90 34Z" stroke={color} strokeWidth="9" strokeLinejoin="round" />
      <path d="M90 146V29" stroke={color} strokeWidth="12" strokeLinecap="round" />
      <path d="m70 57 20-28 20 28" stroke={color} strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px 64px",
          background: "radial-gradient(circle at 72% 88%, rgba(255,255,255,0.07), rgba(9,9,10,0) 55%), #09090a",
          color: "#ededed",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, letterSpacing: -1, fontFamily: "Arial, sans-serif" }}>
          <Mark size={34} color="#ededed" />
          <span style={{ display: "flex" }}>mountline</span>
        </div>

        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", flexDirection: "column", fontSize: 78, letterSpacing: -3, lineHeight: 1 }}>
              <span style={{ display: "flex" }}>A better website for the</span>
              <span style={{ display: "flex" }}>business you’ve built.</span>
            </div>
            <div style={{ display: "flex", marginTop: 28, color: "#a3a3a3", fontSize: 28 }}>
              Websites for local businesses · Photo and video · AI receptionists
            </div>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: "1px solid rgba(255,255,255,.13)",
            color: "#8d8d8d",
            fontSize: 22,
            fontFamily: "Arial, sans-serif",
          }}
        >
          <span style={{ display: "flex" }}>mountline.dev</span>
          <span style={{ display: "flex" }}>Keller, Texas · Dallas–Fort Worth</span>
        </div>
      </div>
    ),
    size,
  )
}
