"use client"

import Link from "next/link"
import { useEffect, useRef, useState } from "react"
import { Wordmark } from "@/components/brand/wordmark"
import { BookButton } from "@/components/site/booking"
import { mailtoHref, site, smsHref } from "@/content/site"

type NavItem = { href: string; label: string }

/** Wordmark, a few plain links, and Book a call. Frosted once the page scrolls. */
export function Nav({ links = site.nav }: { links?: readonly NavItem[] }) {
  const [raised, setRaised] = useState(false)
  const [open, setOpen] = useState(false)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const sms = smsHref()

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
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return
      setOpen(false)
      toggleRef.current?.focus()
    }
    const onResize = () => {
      if (window.innerWidth >= 860) setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    window.addEventListener("resize", onResize)
    return () => {
      document.removeEventListener("keydown", onKey)
      window.removeEventListener("resize", onResize)
    }
  }, [open])

  const close = () => setOpen(false)

  return (
    <header className="mk-nav" data-raised={raised || open} data-open={open}>
      <div className="mk-container mk-nav__bar">
        <Link href="/" className="mk-nav__brand" aria-label="Mountline home" onClick={close}>
          <Wordmark size={19} />
        </Link>

        {links.length ? (
          <nav className="mk-nav__links" aria-label="Primary">
            {links.map((item) => <a key={item.href} href={item.href}>{item.label}</a>)}
          </nav>
        ) : null}

        <div className="mk-nav__actions">
          <BookButton className="mk-btn mk-btn--primary mk-btn--sm">{site.cta.book}</BookButton>
          {links.length ? (
            <button
              ref={toggleRef}
              type="button"
              className="mk-nav__toggle"
              aria-expanded={open}
              aria-controls="mk-menu"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              <i aria-hidden="true" />
              <i aria-hidden="true" />
            </button>
          ) : null}
        </div>
      </div>

      {links.length ? (
        <div id="mk-menu" className="mk-menu" inert={!open}>
          <nav className="mk-container mk-menu__links" aria-label="Menu">
            {links.map((item) => <a key={item.href} href={item.href} onClick={close}>{item.label}</a>)}
          </nav>
          <p className="mk-container mk-menu__contact">
            {sms ? <><a href={sms} className="mk-link">{site.cta.text}</a><span aria-hidden="true">·</span></> : null}
            <a href={mailtoHref} className="mk-link">{site.contact.email}</a>
          </p>
        </div>
      ) : null}
    </header>
  )
}
