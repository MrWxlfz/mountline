"use client"

import { useEffect, useState } from "react"
import { BookButton } from "@/components/site/booking"
import { site, smsHref } from "@/content/site"

/**
 * Phones only (hidden by CSS above 768px). Appears once the hero has scrolled away and hides again
 * when the final call to action is on screen, so it never sits on top of it.
 */
export function MobileBookBar({ heroId = "hero", finalId = "contact" }: { heroId?: string; finalId?: string }) {
  const [heroVisible, setHeroVisible] = useState(true)
  const [finalVisible, setFinalVisible] = useState(false)
  const sms = smsHref()

  useEffect(() => {
    const hero = document.getElementById(heroId)
    const final = document.getElementById(finalId)
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) setHeroVisible(entry.isIntersecting)
        if (entry.target === final) setFinalVisible(entry.isIntersecting)
      }
    })
    if (hero) observer.observe(hero)
    if (final) observer.observe(final)
    return () => observer.disconnect()
  }, [heroId, finalId])

  const shown = !heroVisible && !finalVisible

  return (
    <div className="mk-bookbar" data-shown={shown} aria-hidden={!shown} inert={!shown}>
      <BookButton className="mk-btn mk-btn--primary mk-bookbar__book">{site.cta.bookLong}</BookButton>
      {sms ? <a href={sms} className="mk-btn mk-btn--secondary mk-bookbar__text">{site.cta.text}</a> : null}
    </div>
  )
}
