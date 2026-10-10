"use client"

import { useEffect, useRef, useState } from "react"
import { MountlineMark } from "@/components/brand/wordmark"
import { OldMark } from "@/components/brand/old-mark"
import { CloseIcon, SmallArrowIcon } from "@/components/site/icons"
import { waitForIntro } from "@/components/site/intro-signal"
import { rebrandNoticeActive, site } from "@/content/site"

const STORAGE_KEY = "ml-rebrand-2026"

type Phase = "off" | "enter" | "in" | "settled" | "out"

const PHASE_CLASS: Record<Phase, string> = {
  off: "",
  enter: " rb-wait rb-pre",
  in: " rb-pre",
  settled: "",
  out: " rb-out",
}

/**
 * "Notice something new? We changed our branding from [old] → [new]!" (choreography.md §2).
 *
 * Renders nothing on the server and nothing until it's time to show, so it never shifts the page on
 * load. On the homepage it waits for the intro, then 700ms; on /luke it shows 600ms after load.
 * Dismissal is remembered in localStorage, and after REBRAND_NOTICE_UNTIL it never shows.
 */
export function RebrandNotice({ afterIntro = false, delay }: { afterIntro?: boolean; delay: number }) {
  const [phase, setPhase] = useState<Phase>("off")
  const ref = useRef<HTMLDivElement>(null)
  const reduced = useRef(false)

  useEffect(() => {
    if (!rebrandNoticeActive()) return
    try {
      if (window.localStorage.getItem(STORAGE_KEY) === "1") return
    } catch {}
    reduced.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let timer = 0
    const start = () => {
      timer = window.setTimeout(() => setPhase(reduced.current ? "settled" : "enter"), reduced.current ? 0 : delay)
    }
    const stop = afterIntro ? waitForIntro(start) : (start(), () => {})
    return () => {
      stop()
      window.clearTimeout(timer)
    }
  }, [afterIntro, delay])

  useEffect(() => {
    if (phase === "enter") {
      // Paint the starting state once, then let the transition run from it.
      void ref.current?.offsetWidth
      const frame = window.requestAnimationFrame(() => setPhase("in"))
      return () => window.cancelAnimationFrame(frame)
    }
    if (phase === "in") {
      const timer = window.setTimeout(() => setPhase("settled"), 650)
      return () => window.clearTimeout(timer)
    }
    if (phase === "out") {
      const timer = window.setTimeout(() => setPhase("off"), 260)
      return () => window.clearTimeout(timer)
    }
  }, [phase])

  if (phase === "off") return null

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, "1")
    } catch {}
    setPhase(reduced.current ? "off" : "out")
  }

  return (
    <div ref={ref} className={`rebrand${PHASE_CLASS[phase]}`} role="status">
      <span>
        <b>{site.rebrand.lead}</b> {site.rebrand.text}{" "}
        <span className="rb-logos" role="img" aria-label={site.rebrand.logosLabel}>
          <span className="rb-old"><OldMark /></span>
          <span className="rb-arrow"><SmallArrowIcon /></span>
          <span className="rb-new"><MountlineMark strokeWidth={2.2} /></span>
        </span>
        !
      </span>
      <button className="rb-x hit" type="button" aria-label={site.rebrand.dismiss} onClick={dismiss}>
        <CloseIcon size={10} />
      </button>
    </div>
  )
}
