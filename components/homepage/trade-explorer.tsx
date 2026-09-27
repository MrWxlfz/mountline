"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"
import { ArrowRight, Check } from "lucide-react"
import { Landscape } from "@/components/homepage/landscape"

export type Trade = {
  name: string
  summary: string
  points: string[]
  cta: { label: string; href: string }
  example: {
    caller: string
    reply: string
    issue: string
    location: string
    urgency: string
    timing: string
  }
}

const ADVANCE_MS = 7000

export function TradeExplorer({ trades, intro }: { trades: Trade[]; intro?: ReactNode }) {
  const [active, setActive] = useState(0)
  const [view, setView] = useState<"request" | "call">("request")
  const [autoplay, setAutoplay] = useState(true)
  const [paused, setPaused] = useState(false)
  const [inView, setInView] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Reduced motion needs no check here: the progress animation is disabled in CSS, so it never advances.
    const node = rootRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.35 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const running = autoplay && inView && !paused
  const trade = trades[active]

  const choose = (index: number) => {
    setAutoplay(false)
    setActive(index)
  }

  return (
    <div
      ref={rootRef}
      className="ml-trades"
      onPointerEnter={() => setPaused(true)}
      onPointerLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="ml-trades__list">
        {intro}
        {trades.map((item, index) => {
          const open = index === active
          return (
            <div key={item.name} className="ml-trade" data-open={open}>
              <h3>
                <button
                  type="button"
                  id={`trade-${index}`}
                  aria-expanded={open}
                  aria-controls={`trade-panel-${index}`}
                  onClick={() => choose(index)}
                >
                  {item.name}
                </button>
              </h3>
              <div id={`trade-panel-${index}`} role="region" aria-labelledby={`trade-${index}`} className="ml-trade__panel" inert={!open}>
                <div>
                  <p>{item.summary}</p>
                  <ul>
                    {item.points.map((point) => (
                      <li key={point}><Check aria-hidden="true" />{point}</li>
                    ))}
                  </ul>
                  <a href={item.cta.href} className="ml-btn ml-btn--line ml-btn--sm">
                    {item.cta.label}
                    <ArrowRight aria-hidden="true" />
                  </a>
                </div>
              </div>
              {open && autoplay ? (
                <span
                  key={active}
                  className="ml-trade__progress"
                  style={{ animationDuration: `${ADVANCE_MS}ms`, animationPlayState: running ? "running" : "paused" }}
                  onAnimationEnd={() => setActive((value) => (value + 1) % trades.length)}
                  aria-hidden="true"
                />
              ) : null}
            </div>
          )
        })}
      </div>

      <div className="ml-trades__visual">
        <Landscape variant="dusk" id="trades-scene" className="ml-scene" />
        <div className="ml-trades__card-wrap">
          <figure className="ml-card" data-illustrative aria-label={`Example ${trade.name} call. Not live customer data.`}>
            <div className="ml-card__head">
              <span className="ml-mono">{trade.name} · Service request</span>
              <span className="ml-mono ml-card__muted">Example</span>
            </div>
            <div className="ml-card__body" key={`${active}-${view}`}>
              {view === "request" ? (
                <dl className="ml-card__fields">
                  <div><dt>Issue</dt><dd>{trade.example.issue}</dd></div>
                  <div><dt>Service location</dt><dd>{trade.example.location}</dd></div>
                  <div><dt>Urgency</dt><dd>{trade.example.urgency}</dd></div>
                  <div><dt>Preferred time</dt><dd>{trade.example.timing}</dd></div>
                  <div><dt>Status</dt><dd><span className="ml-status"><i />Handoff pending</span></dd></div>
                </dl>
              ) : (
                <ol className="ml-card__call">
                  <li><span className="ml-mono">Caller</span><p>“{trade.example.caller}”</p></li>
                  <li data-self><span className="ml-mono">Mountline</span><p>{trade.example.reply}</p></li>
                </ol>
              )}
            </div>
            <figcaption className="ml-card__foot ml-mono">Not live customer data</figcaption>
          </figure>
          <div className="ml-toggle" role="group" aria-label="Example view">
            <button type="button" aria-pressed={view === "call"} onClick={() => setView("call")}>Call</button>
            <button type="button" aria-pressed={view === "request"} onClick={() => setView("request")}>Request</button>
            <span className="ml-toggle__thumb" data-view={view} aria-hidden="true" />
          </div>
        </div>
      </div>
    </div>
  )
}
