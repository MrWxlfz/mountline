"use client"

import { useLayoutEffect } from "react"

const revealSelector = "[data-mtl-reveal]"

/**
 * Scroll reveals for secondary content, plus forwarding for anchors that moved to another page
 * (old links such as /#pilot now go to /receptionist#pilot).
 */
export function HomepageMotion({ movedAnchors }: { movedAnchors?: Record<string, string> }) {
  useLayoutEffect(() => {
    if (!movedAnchors) return
    const forward = () => {
      const target = movedAnchors[window.location.hash.slice(1)]
      if (target) window.location.replace(target)
    }
    forward()
    window.addEventListener("hashchange", forward)
    return () => window.removeEventListener("hashchange", forward)
  }, [movedAnchors])

  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".ml-site")
    if (!root) return

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const revealAll = () => {
      root.querySelectorAll<HTMLElement>(revealSelector).forEach((element) => {
        element.classList.add("is-visible")
      })
    }

    // Anything already on screen stays put; only content below the fold waits to reveal.
    root.querySelectorAll<HTMLElement>(revealSelector).forEach((element) => {
      if (element.getBoundingClientRect().top < window.innerHeight) element.classList.add("is-visible")
    })
    root.classList.add("is-motion-ready")

    if (motionQuery.matches || !("IntersectionObserver" in window)) {
      revealAll()
      return () => root.classList.remove("is-motion-ready")
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add("is-visible")
          observer.unobserve(entry.target)
        })
      },
      { rootMargin: "0px 0px 8% 0px", threshold: 0 },
    )

    root.querySelectorAll<HTMLElement>(revealSelector).forEach((element) => {
      observer.observe(element)
    })

    const handleMotionPreference = () => {
      if (!motionQuery.matches) return
      observer.disconnect()
      revealAll()
    }

    motionQuery.addEventListener("change", handleMotionPreference)

    return () => {
      observer.disconnect()
      motionQuery.removeEventListener("change", handleMotionPreference)
      root.classList.remove("is-motion-ready")
    }
  }, [])

  return null
}
