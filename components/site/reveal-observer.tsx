"use client"

import { useEffect } from "react"

/**
 * Scroll reveal (choreography.md §3). Only `.rv` elements that start below the first screen are
 * hidden, then rise in once when they cross 8% above the bottom of the viewport. Nothing on the
 * first screen is ever hidden, and with reduced motion nothing is.
 */
export function RevealObserver() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || !("IntersectionObserver" in window)) return
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.remove("hide")
          observer.unobserve(entry.target)
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    )
    for (const el of document.querySelectorAll<HTMLElement>(".rv")) {
      if (el.getBoundingClientRect().top > window.innerHeight) {
        el.classList.add("hide")
        observer.observe(el)
      }
    }
    return () => observer.disconnect()
  }, [])
  return null
}
