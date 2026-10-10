"use client"

import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from "react"
import { ServiceIcon, StepCheck } from "@/components/site/icons"
import { site } from "@/content/site"

type StepState = "" | "wait" | "busy"

const DUR = 7000
const panes = site.what.panes
const sleep = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms))

/**
 * The app frame in "What I do" (choreography.md §4). Auto-advances every 7s while at least 35% of it
 * is on screen, with a progress bar under the active tab. On every change the steps reset and tick
 * through one by one. Clicking a tab stops auto-advance for this page view; arrow keys move between
 * tabs. Reduced motion: no auto-advance and every step is already shown.
 */
export function ServiceTabs() {
  const { app } = site.what
  const [cur, setCur] = useState(0)
  const [steps, setSteps] = useState<StepState[]>(() => panes[0].steps.map(() => ""))
  const [resultWait, setResultWait] = useState(false)

  const frame = useRef<HTMLDivElement>(null)
  const tabs = useRef<(HTMLButtonElement | null)[]>([])
  const bars = useRef<(HTMLElement | null)[]>([])
  const curRef = useRef(0)
  const runId = useRef(0)
  const timer = useRef(0)
  const auto = useRef(true)
  const inView = useRef(false)
  const reduce = useRef(false)

  const playPane = useCallback(async (index: number) => {
    const id = ++runId.current
    const count = panes[index].steps.length
    if (reduce.current) {
      setSteps(Array(count).fill(""))
      setResultWait(false)
      return
    }
    setSteps(Array(count).fill("wait"))
    setResultWait(true)
    await sleep(350)
    for (let step = 0; step < count; step++) {
      if (id !== runId.current) return
      setSteps((prev) => prev.map((value, n) => (n === step ? "busy" : value)))
      await sleep(520)
      if (id !== runId.current) return
      setSteps((prev) => prev.map((value, n) => (n === step ? "" : value)))
      await sleep(90)
    }
    if (id === runId.current) setResultWait(false)
  }, [])

  const select = useCallback(
    function select(index: number, fromUser = false) {
      curRef.current = index
      setCur(index)
      for (const bar of bars.current) {
        if (!bar) continue
        bar.style.transition = "none"
        bar.style.width = "0"
      }
      if (fromUser) auto.current = false
      playPane(index)
      window.clearTimeout(timer.current)
      if (auto.current && !reduce.current && inView.current) {
        const bar = bars.current[index]
        window.requestAnimationFrame(() => {
          if (!bar) return
          bar.style.transition = `width ${DUR}ms linear`
          bar.style.width = "100%"
        })
        timer.current = window.setTimeout(() => select((curRef.current + 1) % panes.length), DUR)
      }
    },
    [playPane],
  )

  useEffect(() => {
    reduce.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    const el = frame.current
    const runs = runId
    if (!el || !("IntersectionObserver" in window)) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !inView.current) {
          inView.current = true
          select(curRef.current)
        } else if (!entry.isIntersecting) {
          inView.current = false
          window.clearTimeout(timer.current)
        }
      },
      { threshold: 0.35 },
    )
    observer.observe(el)
    return () => {
      observer.disconnect()
      window.clearTimeout(timer.current)
      runs.current++ // stops any step animation still ticking
    }
  }, [select])

  const onKeyDown = (event: KeyboardEvent) => {
    const keys = ["ArrowDown", "ArrowUp", "ArrowRight", "ArrowLeft"]
    if (!keys.includes(event.key)) return
    event.preventDefault()
    const step = event.key === "ArrowDown" || event.key === "ArrowRight" ? 1 : -1
    const next = (curRef.current + step + panes.length) % panes.length
    select(next, true)
    tabs.current[next]?.focus()
  }

  return (
    <div className="app rv" id="app" ref={frame}>
      <div className="app-bar" aria-hidden="true">
        <i /><i /><i />
        <span className="ttl"><b>{app.title}</b>{app.subtitle}</span>
        <span className="sync">{app.sync}</span>
      </div>
      <div className="rail" role="tablist" aria-label={app.railLabel} onKeyDown={onKeyDown}>
        {panes.map((pane, index) => (
          <button
            key={pane.key}
            ref={(el) => {
              tabs.current[index] = el
            }}
            className="tab"
            role="tab"
            type="button"
            data-k={pane.key}
            aria-selected={index === cur}
            aria-controls={`p-${pane.key}`}
            id={`t-${pane.key}`}
            onClick={() => select(index, true)}
          >
            <span className="ti"><ServiceIcon k={pane.key} width={1.5} /></span>
            {pane.tab}
            <span className="prog">
              <i
                ref={(el) => {
                  bars.current[index] = el
                }}
              />
            </span>
          </button>
        ))}
      </div>

      {panes.map((pane, index) => {
        const active = index === cur
        return (
          <div
            key={pane.key}
            className="pane"
            role="tabpanel"
            id={`p-${pane.key}`}
            aria-labelledby={`t-${pane.key}`}
            hidden={!active}
          >
            <div className="pane-h">
              <span className="ti" style={{ background: `var(--c-${pane.key})` }}>
                <ServiceIcon k={pane.key} width={1.5} />
              </span>
              <div>
                <h3>{pane.title}</h3>
                <p>{pane.sub}</p>
              </div>
            </div>
            <div className="chips">
              {pane.chips.map((chip) => (
                <span key={chip.label} className={"live" in chip && chip.live ? "chip live" : "chip"}>{chip.label}</span>
              ))}
            </div>
            <div className="conv">
              <div className="who"><span className="av d">{app.clientInitial}</span>{app.client}</div>
              <div className="bubble">{pane.ask}</div>
              <div className="reply">
                <div className="who"><span className="av l">{site.person.initial}</span>{site.person.firstName}</div>
                <ul className="steps">
                  {pane.steps.map((step, n) => (
                    <li key={step} className={active ? steps[n] || undefined : undefined}>
                      <span className="st-i"><StepCheck /></span>
                      {step}
                    </li>
                  ))}
                </ul>
                <p className={active && resultWait ? "result wait" : "result"}>{pane.result}</p>
                {"footNote" in pane && pane.footNote ? <p className="foot-note">{pane.footNote}</p> : null}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
