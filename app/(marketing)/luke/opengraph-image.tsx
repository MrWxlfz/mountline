import { readFile } from "node:fs/promises"
import { join } from "node:path"
import { ImageResponse } from "next/og"
import { OG_SIZE, OgLogo, ogColors, ogFonts } from "@/lib/og"

export const alt = "Luke Nordin, founder of Mountline, in Keller, Texas"
export const size = OG_SIZE
export const contentType = "image/png"

export default async function LukeOpenGraphImage() {
  const photo = await readFile(join(process.cwd(), "public/luke-nordin.jpg"))
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`
  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", background: ogColors.bg, fontFamily: "Figtree", color: ogColors.ink }}>
        <div style={{ display: "flex", width: 630, height: 630, padding: 28 }}>
          <img src={src} width={574} height={574} alt="" style={{ borderRadius: 28, objectFit: "cover" }} />
        </div>
        <div style={{ display: "flex", flex: 1, flexDirection: "column", justifyContent: "space-between", padding: "64px 64px 56px 36px" }}>
          <OgLogo size={34} />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", fontSize: 26, fontWeight: 500, color: ogColors.ink3 }}>Founder of Mountline</div>
            <div style={{ display: "flex", marginTop: 10, fontSize: 76, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1 }}>Luke Nordin</div>
            <div style={{ display: "flex", marginTop: 22, fontSize: 28, fontWeight: 500, lineHeight: 1.35, color: ogColors.ink2 }}>
              Websites, Google listings, and ads for businesses around Keller.
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 22, fontWeight: 500, color: ogColors.ink3 }}>
            <div style={{ display: "flex", width: 10, height: 10, borderRadius: "50%", background: ogColors.map }} />
            Keller, Texas
          </div>
        </div>
      </div>
    ),
    { ...size, fonts: await ogFonts() },
  )
}
