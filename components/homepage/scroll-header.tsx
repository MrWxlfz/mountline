"use client"

import { useEffect, useState, type ReactNode } from "react"

export function ScrollHeader({ children }: { children: ReactNode }) {
  const [isRaised, setIsRaised] = useState(false)

  useEffect(() => {
    let frame = 0

    function update() {
      setIsRaised(window.scrollY > 18)
      frame = 0
    }

    function onScroll() {
      if (frame) return
      frame = window.requestAnimationFrame(update)
    }

    update()
    window.addEventListener("scroll", onScroll, { passive: true })

    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <header className={`mtl-header${isRaised ? " is-raised" : ""}`}>
      {children}
    </header>
  )
}
