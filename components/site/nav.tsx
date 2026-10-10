"use client"

import { useEffect, useState } from "react"
import { Wordmark } from "@/components/brand/wordmark"
import { BookButton } from "@/components/site/booking"
import { site } from "@/content/site"

type NavItem = { readonly href: string; readonly label: string }

/** Full-bleed frosted bar, content capped at 1180px. A hairline fades in once the page scrolls. */
export function Nav({ links = site.nav, homeHref = "#top" }: { links?: readonly NavItem[]; homeHref?: string }) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setScrolled(window.scrollY > 8)
    }
    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => {
      window.removeEventListener("scroll", onScroll)
      if (frame) window.cancelAnimationFrame(frame)
    }
  }, [])

  return (
    <header className={scrolled ? "nav scrolled" : "nav"} id="nav">
      <div className="nav-in">
        <a className="logo hit" href={homeHref} aria-label="Mountline home">
          <Wordmark />
        </a>
        <nav className="nav-links" aria-label="Sections">
          {links.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>
        <div className="btns">
          <BookButton className="btn btn-dark hit">{site.cta.book}</BookButton>
        </div>
      </div>
    </header>
  )
}
