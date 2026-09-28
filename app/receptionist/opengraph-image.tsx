import { ImageResponse } from "next/og"
import { receptionistDemo } from "@/lib/receptionist/demo"

export const alt = "Mountline AI receptionist, with the fictional HVAC demo line"
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = "image/png"

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
          background: "#0a0a09",
          color: "#ece8e1",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 30, letterSpacing: -1 }}>
          <svg width="34" height="34" viewBox="0 0 180 180" fill="none">
            <path d="M90 34 145 137H35L90 34Z" stroke="#ece8e1" strokeWidth="9" strokeLinejoin="round" />
            <path d="M90 146V29" stroke="#ece8e1" strokeWidth="12" strokeLinecap="round" />
            <path d="m70 57 20-28 20 28" stroke="#ece8e1" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span style={{ display: "flex" }}>mountline</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              fontSize: 76,
              letterSpacing: -3,
              lineHeight: 1.04,
            }}
          >
            <span style={{ display: "flex" }}>AI receptionists for</span>
            <span style={{ display: "flex" }}>service businesses.</span>
          </div>
          <div style={{ display: "flex", marginTop: 28, color: "#a4a09a", fontSize: 28 }}>
            Mountline answers the calls your team can’t get to.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            paddingTop: 24,
            borderTop: "1px solid rgba(236,232,225,.14)",
            color: "#817e78",
            fontSize: 22,
          }}
        >
          <span style={{ display: "flex" }}>mountline.dev</span>
          <span style={{ display: "flex", gap: 12 }}>
            <span style={{ display: "flex", color: "#e2a24a" }}>●</span>
            Demo line {receptionistDemo.displayPhone}
          </span>
        </div>
      </div>
    ),
    size,
  )
}
