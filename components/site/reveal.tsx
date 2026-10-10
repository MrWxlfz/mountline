"use client"

import type { ReactNode } from "react"
import { LazyMotion, domAnimation, m, useReducedMotion } from "motion/react"

export const EASE_OUT = [0.22, 1, 0.36, 1] as const

/** Loads the small animation feature set once for every motion element on the public site. */
export function MotionRoot({ children }: { children: ReactNode }) {
  return <LazyMotion features={domAnimation} strict>{children}</LazyMotion>
}

/**
 * Fades and lifts its content the first time it scrolls into view. `index` staggers siblings.
 * With reduced motion it's just there.
 */
export function Reveal({
  children,
  index = 0,
  className,
  as = "div",
}: {
  children: ReactNode
  index?: number
  className?: string
  as?: "div" | "li" | "header"
}) {
  const reduced = useReducedMotion()
  const Tag = m[as]
  return (
    <Tag
      className={className}
      initial={reduced ? false : { opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -10% 0px" }}
      transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE_OUT, delay: index * 0.06 }}
    >
      {children}
    </Tag>
  )
}
