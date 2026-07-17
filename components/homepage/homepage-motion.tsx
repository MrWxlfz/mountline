"use client"

import { useLayoutEffect } from "react"

const revealSelector = "[data-mtl-reveal]"

export function HomepageMotion() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>(".mountline-homepage")
    if (!root) return

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
    const revealAll = () => {
      root.querySelectorAll<HTMLElement>(revealSelector).forEach((element) => {
        element.classList.add("is-visible")
      })
    }

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
      { rootMargin: "0px 0px -10%", threshold: 0.12 },
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
