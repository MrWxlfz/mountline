"use client"

import { useEffect, useRef, type ReactNode } from "react"

/**
 * Plays the word-built mark's arrival once, when it first comes into view. The rows themselves are
 * rendered on the server (signature-mark.tsx); this only flips data-state. With reduced motion it
 * does nothing, so the finished mark is what shows.
 */
export function SignaturePlayer({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const node = ref.current
    if (!node) return
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    // Hidden until it's on screen, then played once. Scrolling back never replays it.
    node.dataset.state = "waiting"
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        node.dataset.state = "playing"
        observer.disconnect()
      },
      { threshold: 0.35 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  return (
    <div ref={ref} className={className} aria-hidden="true" data-nosnippet="">
      {children}
    </div>
  )
}
