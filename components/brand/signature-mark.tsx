"use client"

import { useEffect, useRef, type CSSProperties } from "react"
import { MARK_VIEWBOX, microtypeCoarse, microtypeFine, type MicrotypeRow, type MicrotypeVariant } from "@/lib/brand/microtype-mark"
import "./signature-mark.css"

type Layer = MicrotypeRow["layer"]
const layers: Layer[] = ["triangle", "stem", "chevron"]

// How far each row travels along its own stroke before it settles, in logo units.
const TRAVEL = 16

function Rows({ variant, layer }: { variant: MicrotypeVariant; layer: Layer }) {
  const rows = variant.rows.filter((row) => row.layer === layer)
  return (
    <>
      {rows.map((row, i) => {
        const radians = (row.angle * Math.PI) / 180
        // Neighbouring rows arrive from opposite ends, so the stroke knits together.
        const direction = i % 2 ? 1 : -1
        const style = {
          "--dx": (Math.cos(radians) * TRAVEL * direction).toFixed(2),
          "--dy": (Math.sin(radians) * TRAVEL * direction).toFixed(2),
          "--s": ((i / Math.max(1, rows.length - 1)) * 0.35).toFixed(3),
        } as CSSProperties
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

function Variant({ variant, className }: { variant: MicrotypeVariant; className: string }) {
  return (
    <div className={`ml-signature__variant ${className}`}>
      {layers.map((layer) => (
        <svg key={layer} className={`ml-signature__layer ml-signature__layer--${layer}`} viewBox={MARK_VIEWBOX} focusable="false">
          <Rows variant={variant} layer={layer} />
        </svg>
      ))}
    </div>
  )
}

/**
 * The closing signature: the Mountline mark set in tiny words. As it scrolls into view, its three
 * strokes come forward out of a shallow depth and each row of words slides along its stroke into
 * place, then everything holds still. Scrolling back reverses it smoothly. With reduced motion,
 * or without scripts, it is simply the finished mark. Decorative and hidden from assistive tech.
 */
export function SignatureMark({ className }: { className?: string }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    let frame = 0
    let visible = false

    const set = (p: number) => node.style.setProperty("--p", p.toFixed(4))
    const measure = () => {
      frame = 0
      if (reduce.matches) return set(1)
      const box = node.getBoundingClientRect()
      const vh = window.innerHeight
      // 0 as the mark's top edge enters the screen; 1 once all of it is comfortably in view.
      const p = (vh - box.top) / (vh * 0.35 + box.height / 2)
      set(Math.min(1, Math.max(0, p)))
    }
    const onScroll = () => {
      if (visible && !frame) frame = requestAnimationFrame(measure)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      measure()
    }, { rootMargin: "20% 0px" })

    measure()
    node.dataset.ready = "true"
    observer.observe(node)
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    reduce.addEventListener("change", measure)
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      reduce.removeEventListener("change", measure)
      cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <div ref={ref} className={className ? `ml-signature ${className}` : "ml-signature"} aria-hidden="true" data-nosnippet="">
      <div className="ml-signature__stage">
        <Variant variant={microtypeFine} className="ml-signature__fine" />
        <Variant variant={microtypeCoarse} className="ml-signature__coarse" />
      </div>
    </div>
  )
}
