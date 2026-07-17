"use client"

import {
  useEffect,
  useRef,
  type HTMLAttributes,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react"

type LiquidSurfaceProps = Omit<
  HTMLAttributes<HTMLDivElement>,
  "onPointerMove" | "onPointerLeave"
> & {
  children: ReactNode
  tone?: "ember" | "pearl" | "steel"
}

export function LiquidSurface({
  children,
  className = "",
  tone = "ember",
  ...props
}: LiquidSurfaceProps) {
  const surfaceRef = useRef<HTMLDivElement>(null)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        window.cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  function moveFields(event: ReactPointerEvent<HTMLDivElement>) {
    if (
      event.pointerType === "touch" ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return
    }

    const surface = surfaceRef.current
    if (!surface) return

    const bounds = surface.getBoundingClientRect()
    const x = (event.clientX - bounds.left) / bounds.width - 0.5
    const y = (event.clientY - bounds.top) / bounds.height - 0.5

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current)
    }

    frameRef.current = window.requestAnimationFrame(() => {
      surface.style.setProperty("--liquid-x", `${(x * 10).toFixed(2)}px`)
      surface.style.setProperty("--liquid-y", `${(y * 8).toFixed(2)}px`)
      frameRef.current = null
    })
  }

  function resetFields() {
    const surface = surfaceRef.current
    if (!surface) return

    if (frameRef.current !== null) {
      window.cancelAnimationFrame(frameRef.current)
    }

    frameRef.current = window.requestAnimationFrame(() => {
      surface.style.setProperty("--liquid-x", "0px")
      surface.style.setProperty("--liquid-y", "0px")
      frameRef.current = null
    })
  }

  return (
    <div
      ref={surfaceRef}
      className={`ml-liquid-surface ml-liquid-surface--${tone} ${className}`.trim()}
      onPointerMove={moveFields}
      onPointerLeave={resetFields}
      {...props}
    >
      <span className="ml-liquid-field ml-liquid-field--one" aria-hidden="true" />
      <span className="ml-liquid-field ml-liquid-field--two" aria-hidden="true" />
      <span className="ml-liquid-edge" aria-hidden="true" />
      <div className="ml-liquid-content">{children}</div>
    </div>
  )
}
