"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react"
import { BrambleSite, type BrambleTarget } from "@/components/homepage/bramble/bramble-site"
import { BrowserFrame, PhoneFrame } from "@/components/homepage/device-frames"

type Step = { id: string; target: BrambleTarget; tab: string; question: string; body: string }

const steps: Step[] = [
  {
    id: "services",
    target: "services",
    tab: "Services",
    question: "“What do you offer, and what does it cost?”",
    body: "Services are named the way customers ask for them, with how long each takes and a starting price when you’re comfortable sharing one.",
  },
  {
    id: "hours",
    target: "hours",
    tab: "Hours",
    question: "“Are you open, and where are you?”",
    body: "Hours sit where people look for them, with today marked. The address opens straight into directions, with a note about parking.",
  },
  {
    id: "book",
    target: "book",
    tab: "Booking",
    question: "“How do I book?”",
    body: "One clear way to ask for an appointment, with only the questions you need answered, and a phone number for people who’d rather call.",
  },
  {
    id: "phone",
    target: "top",
    tab: "On a phone",
    question: "“Can I do all this on my phone?”",
    body: "Most visitors arrive on a phone, often in a hurry. Every page is designed for a small screen too, and calling or booking stays one tap away.",
  },
]

/** Moves one page inside its frame so `target` sits near the top, never past the end of the page. */
function useCamera(target: BrambleTarget) {
  const screenRef = useRef<HTMLDivElement>(null)
  const place = useCallback(() => {
    const screen = screenRef.current
    const page = screen?.querySelector<HTMLElement>(".bx-page")
    const section = page?.querySelector<HTMLElement>(`[data-target="${target}"]`)
    if (!screen || !page || !section) return
    const max = Math.max(0, page.offsetHeight - screen.clientHeight)
    const inset = target === "top" ? 0 : screen.clientHeight * 0.06
    const y = Math.min(max, Math.max(0, section.offsetTop - inset))
    page.style.transform = `translate3d(0, ${-y}px, 0)`
  }, [target])

  useLayoutEffect(place, [place])
  useEffect(() => {
    const screen = screenRef.current
    if (!screen) return
    const observer = new ResizeObserver(place)
    observer.observe(screen)
    return () => observer.disconnect()
  }, [place])
  return screenRef
}

function Stage({ step }: { step: Step }) {
  const phoneStep = step.id === "phone"
  const desktopRef = useCamera(phoneStep ? "top" : step.target)
  const phoneRef = useCamera(phoneStep ? "top" : step.target)
  return (
    <div className="hp-questions__stage" data-step={step.id} aria-hidden="true">
      <div className="hp-questions__desktop" ref={desktopRef}>
        <BrowserFrame>
          <BrambleSite view="desktop" focus={phoneStep ? undefined : step.target} />
        </BrowserFrame>
      </div>
      <div className="hp-questions__phone" ref={phoneRef}>
        <PhoneFrame>
          <BrambleSite view="mobile" focus={phoneStep ? undefined : step.target} />
        </PhoneFrame>
      </div>
    </div>
  )
}

/**
 * The Bramble example again, from a customer's side. On a computer the steps scroll past a
 * pinned view of the site; on a phone they're a short set of tabs. Either way the same page moves
 * inside its frame to answer each question.
 */
export function CustomerQuestions() {
  const [active, setActive] = useState(0)
  // Tabs exist only on narrow screens; on wide ones every step is visible and scrolls past the stage.
  const [wide, setWide] = useState(false)
  const listRef = useRef<HTMLOListElement>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])

  // Wide screens: the step nearest the middle of the viewport is the one on stage.
  useEffect(() => {
    const list = listRef.current
    if (!list) return
    const query = window.matchMedia("(min-width: 1024px)")
    setWide(query.matches)
    let frame = 0
    let visible = false
    const pick = () => {
      frame = 0
      if (!query.matches || !visible) return
      const middle = window.innerHeight * 0.5
      let best = 0
      let bestDistance = Infinity
      list.querySelectorAll<HTMLElement>("[data-step]").forEach((item, index) => {
        const box = item.getBoundingClientRect()
        const distance = Math.abs(box.top + box.height / 2 - middle)
        if (distance < bestDistance) {
          bestDistance = distance
          best = index
        }
      })
      setActive((current) => (current === best ? current : best))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(pick)
    }
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) onScroll()
    })
    observer.observe(list)
    window.addEventListener("scroll", onScroll, { passive: true })
    const onChange = () => {
      setWide(query.matches)
      onScroll()
    }
    query.addEventListener("change", onChange)
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
      query.removeEventListener("change", onChange)
      cancelAnimationFrame(frame)
    }
  }, [])

  function onTabKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: steps.length - 1 }
    if (!(event.key in keys)) return
    event.preventDefault()
    const next = (keys[event.key] + steps.length) % steps.length
    setActive(next)
    tabRefs.current[next]?.focus()
  }

  const step = steps[active]

  return (
    <div className="hp-questions" data-active={step.id}>
      <div className="hp-questions__tabs" role="tablist" aria-label="Customer questions" hidden={wide}>
        {steps.map((item, index) => (
          <button
            key={item.id}
            ref={(node) => { tabRefs.current[index] = node }}
            type="button"
            role="tab"
            id={`question-tab-${item.id}`}
            aria-selected={index === active}
            aria-controls={`question-${item.id}`}
            tabIndex={index === active ? 0 : -1}
            onClick={() => setActive(index)}
            onKeyDown={(event) => onTabKey(event, index)}
          >
            {item.tab}
          </button>
        ))}
      </div>

      <div className="hp-questions__pin">
        <Stage step={step} />
      </div>

      <ol className="hp-questions__list" ref={listRef}>
        {steps.map((item, index) => (
          <li
            key={item.id}
            id={`question-${item.id}`}
            data-step={item.id}
            data-active={index === active || undefined}
            role={wide ? undefined : "tabpanel"}
            aria-labelledby={wide ? undefined : `question-tab-${item.id}`}
          >
            <span className="hp-questions__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
            <h3>{item.question}</h3>
            <p>{item.body}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
