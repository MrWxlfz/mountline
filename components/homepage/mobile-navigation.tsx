"use client"

import Link from "next/link"
import { ArrowRight, Menu, X } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { AppearanceSelector } from "@/components/dashboard/appearance-selector"
import { homepageNav } from "@/lib/homepage-content"

export function MobileNavigation() {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const summaryRef = useRef<HTMLElement>(null)
  const [isOpen, setIsOpen] = useState(false)

  function closeMenu() {
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
  }

  useEffect(() => {
    if (!isOpen) return

    const details = detailsRef.current
    if (!details) return

    const previousOverflow = document.body.style.overflow
    const focusable = Array.from(
      details.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), summary, [tabindex]:not([tabindex='-1'])",
      ),
    )

    document.body.style.overflow = "hidden"
    const focusFrame = window.requestAnimationFrame(() => focusable[1]?.focus())

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault()
        closeMenu()
        summaryRef.current?.focus()
        return
      }

      if (event.key !== "Tab" || focusable.length < 2) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      window.cancelAnimationFrame(focusFrame)
      document.body.style.overflow = previousOverflow
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen])

  return (
    <details
      ref={detailsRef}
      className="ml-mobile-nav"
      onToggle={(event) => setIsOpen(event.currentTarget.open)}
    >
      <summary
        ref={summaryRef}
        className="ml-mobile-nav-trigger"
        aria-expanded={isOpen}
      >
        {isOpen ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
        <span className="sr-only">{isOpen ? "Close" : "Open"} navigation</span>
      </summary>
      <div className="ml-mobile-nav-panel">
        <nav aria-label="Compact navigation">
          {homepageNav.map((item) => (
            <a
              key={item.href}
              href={item.href}
              onClick={closeMenu}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="ml-mobile-nav-actions">
          <div className="ml-mobile-utility-row">
            <Link href="/id" onClick={closeMenu} className="ml-mobile-id-link">
              Mountline ID
            </Link>
            <AppearanceSelector compact syncServer={false} className="mtl-theme-selector" />
          </div>
          <a
            href="#review"
            onClick={closeMenu}
            className="ml-mobile-nav-cta"
          >
            Show us your business
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>
      </div>
    </details>
  )
}
