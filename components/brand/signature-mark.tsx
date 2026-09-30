import type { CSSProperties } from "react"
import { MARK_VIEWBOX, microtypeCoarse, microtypeFine, type MicrotypeVariant } from "@/lib/brand/microtype-mark"
import { SignaturePlayer } from "./signature-player"
import "./signature-mark.css"

// How far each row travels along its own stroke before it settles, in logo units.
const TRAVEL = 14
const [VX, , VW] = MARK_VIEWBOX.split(" ").map(Number)

function Rows({ variant }: { variant: MicrotypeVariant }) {
  const count = variant.rows.length
  return (
    <>
      {variant.rows.map((row, i) => {
        const radians = (row.angle * Math.PI) / 180
        // Neighbouring rows arrive from opposite ends, so each stroke knits together.
        const direction = i % 2 ? 1 : -1
        const center = row.x + (Math.cos(radians) * row.length) / 2
        const style = {
          "--dx": `${(Math.cos(radians) * TRAVEL * direction).toFixed(2)}px`,
          "--dy": `${(Math.sin(radians) * TRAVEL * direction).toFixed(2)}px`,
          // Order of arrival: the triangle first, then the stem, then the chevron on top.
          "--s": ((row.layer === "triangle" ? 0 : row.layer === "stem" ? 0.25 : 0.45) + (i / count) * 0.3).toFixed(3),
          // Where the highlight reaches this row, left to right.
          "--h": ((center - VX) / VW).toFixed(3),
        } as CSSProperties
        // The motion goes on the group; the rotation stays on the text, so neither overrides the other.
        return (
          <g key={i} className="ml-signature__row" style={style}>
            <text
              x={row.x}
              y={row.y}
              transform={row.angle ? `rotate(${row.angle} ${row.x} ${row.y})` : undefined}
              textLength={row.length}
              lengthAdjust="spacing"
              fontSize={variant.fontSize}
            >
              {row.text}
            </text>
          </g>
        )
      })}
    </>
  )
}

/**
 * The Mountline mark set in tiny words: TRUST, CARE, DETAIL, CLARITY, WORK. When it first comes into
 * view, each row slides along its own stroke into place, one highlight crosses it, and then it
 * holds still for good (see signature-player.tsx; prefers-reduced-motion: reduce skips all of it).
 * Without scripts it is simply the finished mark. Decorative: aria-hidden="true" on the wrapper.
 */
export function SignatureMark({ className }: { className?: string }) {
  return (
    <SignaturePlayer className={className ? `ml-signature ${className}` : "ml-signature"}>
      <svg className="ml-signature__fine" viewBox={MARK_VIEWBOX} focusable="false">
        <Rows variant={microtypeFine} />
      </svg>
      <svg className="ml-signature__coarse" viewBox={MARK_VIEWBOX} focusable="false">
        <Rows variant={microtypeCoarse} />
      </svg>
    </SignaturePlayer>
  )
}
