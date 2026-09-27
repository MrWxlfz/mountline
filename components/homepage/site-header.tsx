"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { ArrowRight } from "lucide-react"
import { Wordmark } from "@/components/brand/wordmark"

type NavItem = { href: string; label: string }

export function SiteHeader({ nav, demoHref }: { nav: readonly NavItem[]; demoHref: string }) {
  const [raised, setRaised] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      setRaised(window.scrollY > 8)
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

  useEffect(() => {
    if (!open) return
    const previous = document.documentElement.style.overflow
    document.documentElement.style.overflow = "hidden"
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOpen(false)
      toggleRef.current?.focus()
    }
    const onResize = () => {
      if (window.innerWidth > 860) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    window.addEventListener("resize", onResize)
    return () => {
      document.documentElement.style.overflow = previous
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", onResize)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className="ml-header" data-raised={raised} data-open={open}>
      <div className="ml-container ml-header__bar">
        <Link href="/" className="ml-header__brand" aria-label="Mountline home" onClick={close}>
          <Wordmark size={19} />
        </Link>

        <nav className="ml-header__nav" aria-label="Primary">
          {nav.map((item) => (
            <a key={item.href} href={item.href} className="ml-mono">{item.label}</a>
          ))}
        </nav>

        <div className="ml-header__actions">
          <Link href="/id" className="ml-header__login ml-mono">Log in</Link>
          <a href={demoHref} className="ml-btn ml-btn--solid ml-btn--sm ml-header__cta">
            Call the demo
          </a>
          <button
            ref={toggleRef}
            type="button"
            className="ml-header__toggle"
            aria-expanded={open}
            aria-controls="ml-menu"
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <i aria-hidden="true" />
            <i aria-hidden="true" />
          </button>
        </div>
      </div>

      <div id="ml-menu" className="ml-menu" inert={!open}>
        <nav className="ml-container ml-menu__nav" aria-label="Menu">
          {nav.map((item, index) => (
            <a key={item.href} href={item.href} onClick={close} style={{ transitionDelay: open ? `${60 + index * 40}ms` : "0ms" }}>
              <span className="ml-mono">{String(index + 1).padStart(2, "0")}</span>
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ml-container ml-menu__actions">
          <a href={demoHref} className="ml-btn ml-btn--solid" onClick={close}>
            Call the demo <ArrowRight aria-hidden="true" />
          </a>
          <Link href="/id" className="ml-btn ml-btn--line" onClick={close}>Log in</Link>
        </div>
      </div>
    </header>
  )
}
