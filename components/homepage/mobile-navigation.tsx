"use client"

import Link from "next/link"
import { ArrowRight, Menu } from "lucide-react"
import { useEffect, useRef } from "react"
import { HomepageThemeToggle } from "@/components/homepage/homepage-theme-toggle"
import { homepageNav } from "@/lib/homepage-content"

export function MobileNavigation() {
  const detailsRef = useRef<HTMLDetailsElement>(null)
  const summaryRef = useRef<HTMLElement>(null)

  function closeMenu() {
    if (detailsRef.current) {
      detailsRef.current.open = false
    }
  }

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key !== "Escape" || !detailsRef.current?.open) return
      closeMenu()
      summaryRef.current?.focus()
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <details ref={detailsRef} className="ml-mobile-nav">
      <summary
        ref={summaryRef}
        className="ml-mobile-nav-trigger"
      >
        <Menu className="size-5" aria-hidden="true" />
        <span className="sr-only">Open navigation</span>
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
            <HomepageThemeToggle />
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
