"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react"
import type { BrambleTarget } from "@/components/homepage/bramble/bramble-site"
import { BrowserFrame, PhoneFrame } from "@/components/homepage/device-frames"

type View = { id: string; target: BrambleTarget; tab: string; question: string; answer: string }

const views: View[] = [
  {
    id: "services",
    target: "services",
    tab: "Services",
    question: "“What do you offer, and what does it cost?”",
    answer: "Services named the way customers ask for them, with how long each takes and a starting price when you’re comfortable sharing one.",
  },
  {
    id: "hours",
    target: "hours",
    tab: "Hours",
    question: "“Are you open, and where are you?”",
    answer: "Hours where people look for them, with today marked, and an address that opens straight into directions.",
  },
  {
    id: "book",
    target: "book",
    tab: "Booking",
    question: "“How do I book?”",
    answer: "One clear way to ask for an appointment, only the questions you need answered, and a number for people who’d rather call.",
  },
  {
    id: "phone",
    target: "top",
    tab: "On a phone",
    question: "“Can I do all this on my phone?”",
    answer: "Most visitors arrive on a phone, often in a hurry. Every page is designed for a small screen, with calling and booking one tap away.",
  },
]

/** Moves one page inside its frame so `target` sits near the top, never past the end of the page. */
function useCamera(target: BrambleTarget) {
  const screenRef = useRef<HTMLDivElement>(null)
  const place = useCallback(() => {
    const screen = screenRef.current?.querySelector<HTMLElement>(".hp-browser__screen, .hp-phone__screen")
    const page = screen?.querySelector<HTMLElement>(".bx-page")
    const section = page?.querySelector<HTMLElement>(`[data-target="${target}"]`)
    if (!screen || !page || !section) return
    const max = Math.max(0, page.offsetHeight - screen.clientHeight)
    const inset = target === "top" ? 0 : screen.clientHeight * 0.04
    const y = Math.min(max, Math.max(0, section.offsetTop - inset))
    page.style.transform = `translate3d(0, ${-y}px, 0)`
  }, [target])

  useLayoutEffect(place, [place])
  useEffect(() => {
    const node = screenRef.current
    if (!node) return
    const observer = new ResizeObserver(place)
    observer.observe(node)
    return () => observer.disconnect()
  }, [place])
  return screenRef
}

// The example sites are rendered once on the server; only the camera and the outline change here.
function Stage({ view, desktop, phone }: { view: View; desktop: ReactNode; phone: ReactNode }) {
  const phoneView = view.id === "phone"
  const desktopRef = useCamera(phoneView ? "top" : view.target)
  const phoneRef = useCamera(phoneView ? "top" : view.target)
  return (
    <div className="cv__stage" data-view={view.id} aria-hidden="true">
      <div className="cv__lamp" />
      <div className="cv__desktop" ref={desktopRef}>
        <BrowserFrame>{desktop}</BrowserFrame>
      </div>
      <div className="cv__phone" ref={phoneRef}>
        <PhoneFrame>{phone}</PhoneFrame>
      </div>
    </div>
  )
}

/**
 * The Bramble example from a customer's side: four questions people bring to a local business's
 * website, each answered with one sentence and the part of the page that answers it. Choosing a
 * question changes the view straight away; nothing depends on scroll position.
 */
export function CustomerViews({ desktop, phone }: { desktop: ReactNode; phone: ReactNode }) {
  const [active, setActive] = useState(0)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys: Record<string, number> = { ArrowDown: index + 1, ArrowRight: index + 1, ArrowUp: index - 1, ArrowLeft: index - 1, Home: 0, End: views.length - 1 }
    if (!(event.key in keys)) return
    event.preventDefault()
    const next = (keys[event.key] + views.length) % views.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  const view = views[active]

  return (
    <div className="cv">
      <div className="cv__tabs" role="tablist" aria-label="Questions customers ask" aria-orientation="vertical">
        {views.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => { tabRefs.current[index] = node }}
            type="button"
            role="tab"
            id={`cv-tab-${item.id}`}
            aria-selected={index === active}
            aria-controls="cv-panel"
            tabIndex={index === active ? 0 : -1}
            className="cv__tab"
            onClick={() => setActive(index)}
            onKeyDown={(event) => onKey(event, index)}
          >
            <span className="cv__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <span className="cv__tab-short">{item.tab}</span>
            <span className="cv__tab-long">{item.question}</span>
          </button>
        ))}
      </div>

      <div className="cv__panel" id="cv-panel" role="tabpanel" aria-labelledby={`cv-tab-${view.id}`}>
        <div className="cv__text" key={view.id}>
          <p className="cv__question">{view.question}</p>
          <p className="cv__answer">{view.answer}</p>
        </div>
        <Stage view={view} desktop={desktop} phone={phone} />
      </div>
    </div>
  )
}
