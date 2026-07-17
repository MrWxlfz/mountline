import { ImageResponse } from "next/og"

export const alt = "Mountline — Make your business easier to choose and easier to run"
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
          position: "relative",
          display: "flex",
          width: "100%",
          height: "100%",
          overflow: "hidden",
          background: "#080706",
          color: "#f7f1e7",
          fontFamily: "Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -220,
            right: -120,
            display: "flex",
            width: 620,
            height: 620,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(197,107,61,.58), rgba(197,107,61,0) 68%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            right: 76,
            bottom: 56,
            display: "flex",
            width: 360,
            height: 214,
            border: "1px solid rgba(247,241,231,.2)",
            background:
              "linear-gradient(135deg, rgba(224,165,99,.28), rgba(20,18,15,.92) 48%, rgba(242,230,213,.14))",
            boxShadow: "0 28px 80px rgba(0,0,0,.38)",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 18,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              padding: 22,
              border: "1px solid rgba(247,241,231,.16)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                color: "rgba(247,241,231,.68)",
                fontSize: 14,
                letterSpacing: 2,
                textTransform: "uppercase",
              }}
            >
              <span
                style={{
                  display: "flex",
                  width: 8,
                  height: 8,
                  borderRadius: 999,
                  background: "#e0a563",
                }}
              />
              Selected Mountline work
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <span
                style={{
                  display: "flex",
                  width: "88%",
                  height: 1,
                  background: "rgba(247,241,231,.34)",
                }}
              />
              <span
                style={{
                  display: "flex",
                  width: "66%",
                  height: 1,
                  background: "rgba(247,241,231,.22)",
                }}
              />
              <span
                style={{
                  display: "flex",
                  width: "76%",
                  height: 1,
                  background: "rgba(247,241,231,.22)",
                }}
              />
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                color: "rgba(247,241,231,.68)",
                fontSize: 14,
              }}
            >
              <span style={{ display: "flex" }}>Website</span>
              <span style={{ display: "flex", color: "#e0a563" }}>→</span>
              <span style={{ display: "flex" }}>Clear next action</span>
            </div>
          </div>
        </div>

        <div
          style={{
            position: "relative",
            display: "flex",
            width: "100%",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "64px 72px 58px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 15,
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            <span style={{ display: "flex", color: "#e0a563" }}>△</span>
            <span style={{ display: "flex" }}>mountline</span>
          </div>

          <div style={{ display: "flex", flexDirection: "column" }}>
            <div
              style={{
                display: "flex",
                maxWidth: 830,
                flexDirection: "column",
                fontSize: 66,
                fontWeight: 700,
                letterSpacing: -4.2,
                lineHeight: 0.96,
              }}
            >
              <span style={{ display: "flex" }}>Make your business</span>
              <span style={{ display: "flex", color: "#e6b074" }}>
                easier to choose—
              </span>
              <span style={{ display: "flex" }}>and easier to run.</span>
            </div>
            <div
              style={{
                display: "flex",
                marginTop: 30,
                color: "rgba(247,241,231,.64)",
                fontSize: 24,
              }}
            >
              Exceptional websites and practical systems for businesses.
            </div>
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              color: "rgba(247,241,231,.58)",
              fontSize: 18,
              letterSpacing: 0.5,
            }}
          >
            <span style={{ display: "flex" }}>Founder-led in Keller, Texas.</span>
          </div>
        </div>
      </div>
    ),
    size,
  )
}
