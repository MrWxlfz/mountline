"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from "react"
import { Check, Minus, X } from "lucide-react"
import { Wordmark } from "@/components/brand/wordmark"
import { formatDate, type EvidenceCheck, type SiteEvidence } from "@/lib/case-study/evidence"
import "./build-test-refine.css"

/**
 * Build → Test → Refine, shown on this website itself.
 *
 * One composition in three states. Build: three plain facts about Mountline travel along fine paths
 * into their places on the page. Test: the same page becomes a phone and gets used like a customer
 * would. Refine: two issues we actually found in the old homepage, with before and after values.
 *
 * Every pass/fail mark and number comes from lib/case-study/evidence.json (recorded test runs).
 * On wide, tall screens the chapter follows the scroll inside one short sticky stage; everywhere
 * else it's three tabs. Either way the chapter buttons work immediately.
 */

type Chapter = { id: "build" | "test" | "refine"; title: string; line: string }

const clock = () => performance.now()

const chapters: Chapter[] = [
  { id: "build", title: "Build.", line: "What customers ask about most, like what you do, where you are, and how to reach you, each gets a clear place on the page." },
  { id: "test", title: "Test.", line: "Then we use it the way a customer would, on a phone: find a service, and send a request." },
  { id: "refine", title: "Refine.", line: "Anything the checks turn up gets fixed, then checked again. These were real." },
]

const facts = [
  { id: "services", label: "What we do", value: "Websites · Photo & video · Receptionist", short: "Websites, photo & video" },
  { id: "where", label: "Where", value: "Keller, Texas · Dallas–Fort Worth", short: "Keller, Texas" },
  { id: "contact", label: "How to reach us", value: "A short form, or hello@mountline.dev", short: "A short form" },
] as const

// The customer task on a phone, and the recorded check behind each step.
const steps = [
  { check: "capture-link-preselects-form", action: "Tap “Ask about Capture”", result: "The form opens with Photo and video chosen" },
  { check: "form-round-trip-without-saving", action: "Fill it in and send", result: "The server checks it (a controlled test, so nothing is saved)" },
  { check: "form-keeps-input-after-error", action: "Make a mistake on the way", result: "Everything typed is still there" },
] as const

/** Canvas geometry, in design units. The canvas scales to fit its box; these stay fixed. */
const LAYOUTS = {
  wide: {
    w: 660,
    h: 520,
    facts: [96, 226, 356].map((y) => ({ x: 0, y, w: 232, h: 68 })),
    browser: { x: 292, y: 30, w: 368, h: 460 },
    phone: { x: 211, y: 6, w: 238, h: 508 },
  },
  narrow: {
    w: 360,
    h: 470,
    facts: [0, 124, 248].map((x) => ({ x, y: 0, w: 112, h: 78 })),
    browser: { x: 0, y: 112, w: 360, h: 358 },
    phone: { x: 82, y: 4, w: 196, h: 462 },
  },
} as const
type LayoutName = keyof typeof LAYOUTS
type Point = { x: number; y: number }

/**
 * A path from a fact to its place on the page: level, then a 60° run like the sides of the
 * Mountline mark, then level again (or, stacked on a phone, down and in).
 */
function pathFor(layout: LayoutName, index: number, slot: Point) {
  const fact = LAYOUTS[layout].facts[index]
  if (layout === "wide") {
    const x0 = fact.x + fact.w
    const y0 = fact.y + fact.h / 2
    const run = Math.abs(slot.y - y0) / Math.tan(Math.PI / 3)
    const bend = x0 + 18
    return `M${x0} ${y0} H${bend} L${bend + run} ${slot.y} H${slot.x}`
  }
  const x0 = fact.x + fact.w / 2
  const y0 = fact.y + fact.h
  const kink = 14
  const end = { x: x0 - kink / Math.tan(Math.PI / 3), y: slot.y }
  return `M${x0} ${y0} V${end.y - kink} L${end.x} ${end.y}`
}

function Status({ value }: { value: "pass" | "fail" | null }) {
  if (value === "pass") return <span className="btr-status" data-value="pass"><Check aria-hidden="true" />Passed</span>
  if (value === "fail") return <span className="btr-status" data-value="fail"><X aria-hidden="true" />Failed</span>
  return <span className="btr-status" data-value="none"><Minus aria-hidden="true" />Not recorded</span>
}

function MiniSite({ wide, ref, style }: { wide: boolean; ref?: React.Ref<HTMLDivElement>; style?: CSSProperties }) {
  return (
    <div ref={ref} className={wide ? "btr-site btr-site--wide" : "btr-site btr-site--narrow"} style={style}>
      <div className="btr-site__nav">
        <Wordmark size={wide ? 10 : 9} />
        {wide ? <span className="btr-site__links"><i /><i /><i /><i /></span> : <span className="btr-site__menu"><i /><i /></span>}
      </div>
      <div className="btr-site__scroll">
        <p className="btr-site__h">A better website for the business you’ve built.</p>
        <span className="btr-site__cta">Talk about your project</span>
        <div className="btr-site__slot" data-slot="services">
          <span className="btr-site__skeleton" />
          <span className="btr-site__real btr-site__services">
            <span>Websites</span>
            <span data-capture>Photo &amp; video <b>Ask about Capture</b></span>
            <span>Receptionist</span>
          </span>
        </div>
        <div className="btr-site__slot" data-slot="where">
          <span className="btr-site__skeleton" />
          <span className="btr-site__real btr-site__where">Keller, Texas · Dallas–Fort Worth</span>
        </div>
        <div className="btr-site__slot btr-site__form" data-slot="contact">
          <span className="btr-site__skeleton" />
          <span className="btr-site__real">
            <span className="btr-site__field">Your name</span>
            <span className="btr-site__field">Email</span>
            <span className="btr-site__choices">
              <span className="btr-site__choice"><i />Website</span>
              <span className="btr-site__choice" data-pick><i />Photo and video</span>
            </span>
            <span className="btr-site__send">Send message</span>
            <span className="btr-site__checked">Checked by the server</span>
          </span>
        </div>
      </div>
    </div>
  )
}

function useLayout() {
  const [layout, setLayout] = useState<{ name: LayoutName; pinned: boolean }>({ name: "wide", pinned: false })
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)")
    // Pinned only where every chapter's words fit beside the stage without clipping.
    const tall = window.matchMedia("(min-height: 760px)")
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)")
    const update = () => setLayout({ name: wide.matches ? "wide" : "narrow", pinned: wide.matches && tall.matches && !reduce.matches })
    update()
    for (const query of [wide, tall, reduce]) query.addEventListener("change", update)
    return () => {
      for (const query of [wide, tall, reduce]) query.removeEventListener("change", update)
    }
  }, [])
  return layout
}

export function BuildTestRefine({ evidence }: { evidence: SiteEvidence }) {
  const [chapter, setChapter] = useState(0)
  const [seen, setSeen] = useState(false)
  const layout = useLayout()
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  // While a chapter button is scrolling the page, scroll position doesn't pick the chapter.
  const lock = useRef<{ chapter: number; until: number } | null>(null)

  const geometry = LAYOUTS[layout.name]
  const siteRef = useRef<HTMLDivElement>(null)
  const [slots, setSlots] = useState<Point[] | null>(null)

  /* Where each fact lands: measured from the page in the Build frame, so the paths always meet it. */
  useLayoutEffect(() => {
    const site = siteRef.current
    if (!site) return
    const measure = () => {
      // The site is placed inside the frame's box, which starts at the union's corner.
      const { union } = frames(geometry)
      const points = facts.map((fact) => {
        const slot = site.querySelector<HTMLElement>(`[data-slot="${fact.id}"]`)
        if (!slot) return null
        return layout.name === "wide"
          ? { x: union.x + site.offsetLeft + slot.offsetLeft - 6, y: union.y + site.offsetTop + slot.offsetTop + slot.offsetHeight / 2 }
          : { x: 0, y: union.y + site.offsetTop + slot.offsetTop - 4 }
      })
      setSlots(points.every(Boolean) ? (points as Point[]) : null)
    }
    measure()
    document.fonts?.ready.then(measure).catch(() => {})
  }, [layout.name, geometry])

  /* Fit the fixed-size canvas into its box. */
  useLayoutEffect(() => {
    const box = boxRef.current
    if (!box) return
    const fit = () => {
      const { width, height } = box.getBoundingClientRect()
      const next = Math.min(width / geometry.w, (height || Infinity) / geometry.h)
      setScale(Number.isFinite(next) && next > 0 ? next : 1)
    }
    fit()
    const observer = new ResizeObserver(fit)
    observer.observe(box)
    return () => observer.disconnect()
  }, [geometry.w, geometry.h, layout.pinned])

  /* Start the Build animation only once it's actually on screen. */
  useEffect(() => {
    const node = rootRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setSeen(true), { threshold: 0.25 })
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  /* Pinned layout: the chapter comes from how far the visitor has scrolled through the track. */
  const range = useCallback(() => {
    const track = trackRef.current
    if (!track) return null
    const top = track.getBoundingClientRect().top + window.scrollY
    const distance = track.offsetHeight - window.innerHeight
    return { top, distance: Math.max(1, distance) }
  }, [])

  useEffect(() => {
    if (!layout.pinned) return
    let frame = 0
    const read = () => {
      frame = 0
      const r = range()
      if (!r) return
      const progress = Math.min(1, Math.max(0, (window.scrollY - r.top) / r.distance))
      rootRef.current?.style.setProperty("--progress", progress.toFixed(4))
      const held = lock.current
      if (held && clock() < held.until) return
      lock.current = null
      const next = progress < 0.34 ? 0 : progress < 0.67 ? 1 : 2
      setChapter((current) => (current === next ? current : next))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }
    const release = () => {
      lock.current = null
      onScroll()
    }
    read()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    window.addEventListener("scrollend", release)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      window.removeEventListener("scrollend", release)
      cancelAnimationFrame(frame)
    }
  }, [layout.pinned, range])

  function choose(index: number) {
    setChapter(index)
    setSeen(true)
    if (!layout.pinned) return
    const r = range()
    if (!r) return
    // The middle of that chapter's stretch of the track: a predictable place to land.
    const target = r.top + ((index + 0.5) / 3) * r.distance
    lock.current = { chapter: index, until: clock() + 1200 }
    window.scrollTo({ top: target, behavior: "smooth" })
  }

  function onKey(event: React.KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: 2 }
    if (!(event.key in keys)) return
    event.preventDefault()
    const next = Math.min(2, Math.max(0, keys[event.key]))
    choose(next)
    document.getElementById(`btr-tab-${chapters[next].id}`)?.focus()
  }

  const after = (id: string): EvidenceCheck | undefined => evidence.checks.find((c) => c.id === id)
  const recorded = evidence.builds.after ? formatDate(evidence.recordedOn) : null
  const current = chapters[chapter]
  const style = { "--scale": scale, "--cw": geometry.w, "--ch": geometry.h } as CSSProperties
  const { union, browserInset, phoneInset } = frames(geometry)

  const panel = (item: Chapter) => (
    <div className="btr__text">
      <h3 className="btr__title">{item.title}</h3>
      <p className="btr__line">{item.line}</p>

      {item.id === "test" ? (
        <ol className="btr__steps">
          {steps.map((step, index) => {
            const check = after(step.check)
            return (
              <li key={step.check} style={{ "--i": index } as CSSProperties}>
                <span className="btr__step-action">{step.action}</span>
                <span className="btr__step-result">{step.result}</span>
                <Status value={check?.after ? check.after.phone : null} />
              </li>
            )
          })}
        </ol>
      ) : null}

      {item.id === "refine" ? (
        <ul className="btr__fixes">
          {evidence.findings.filter((finding) => finding.featured).map((finding, index) => (
            <li key={finding.id} style={{ "--i": index } as CSSProperties}>
              <p className="btr__fix-title">{finding.title}</p>
              <p className="btr__fix-found">{finding.found} {finding.fix}</p>
              {finding.kind === "check" ? (
                <div className="btr__retest">
                  <span><b>Mid-build</b><Status value={finding.before} /></span>
                  <span><b>Final</b><Status value={finding.after} /></span>
                </div>
              ) : (
                <div className="btr__bars" aria-label={`${finding.unit}: ${finding.before ?? "not measured"} ${finding.beforeLabel.toLowerCase()}, ${finding.after ?? "not measured yet"} after`}>
                  {(["before", "after"] as const).map((when) => {
                    const value = finding[when]
                    const max = Math.max(finding.before ?? 0, finding.after ?? 0) || 1
                    return (
                      <span key={when} className="btr__bar" data-when={when} style={{ "--w": (value ?? 0) / max } as CSSProperties}>
                        <b>{when === "before" ? finding.beforeLabel : "Final"}</b>{value ?? (when === "before" ? "—" : "not measured yet")}
                      </span>
                    )
                  })}
                  <em>{finding.unit}</em>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      <p className="btr__source">
        {item.id === "build"
          ? "Shown on this website, the one we rebuilt this way."
          : recorded
            ? `Recorded while testing this site on ${recorded}. Phone results are from an emulated 390 px screen.`
            : "Results appear here once the finished build has been tested."}
      </p>
    </div>
  )

  return (
    <div ref={rootRef} className="btr" data-chapter={current.id} data-layout={layout.name} data-pinned={layout.pinned || undefined} data-seen={seen || undefined}>
      <div ref={trackRef} className="btr__track">
        <div className="btr__sticky">
          <div className="ml-container btr__grid">
            <div className="btr__copy">
              <div className="btr__tabs" role="tablist" aria-label="How we work">
                {chapters.map((item, index) => (
                  <button
                    key={item.id}
                    id={`btr-tab-${item.id}`}
                    type="button"
                    role="tab"
                    aria-selected={index === chapter}
                    aria-controls={`btr-panel-${item.id}`}
                    tabIndex={index === chapter ? 0 : -1}
                    onClick={() => choose(index)}
                    onKeyDown={(event) => onKey(event, index)}
                  >
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    {item.title.replace(".", "")}
                  </button>
                ))}
                <i className="btr__meter" aria-hidden="true" />
              </div>

              {/* All three chapters share one cell, so switching never changes the column's height. */}
              <div className="btr__panels">
                {chapters.map((item) => {
                  const active = item.id === current.id
                  return (
                    <div
                      key={item.id}
                      id={`btr-panel-${item.id}`}
                      role="tabpanel"
                      aria-labelledby={`btr-tab-${item.id}`}
                      className="btr__panel"
                      data-active={active || undefined}
                      inert={!active}
                    >
                      {panel(item)}
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="btr__stage" ref={boxRef} aria-hidden="true">
              <div className="btr__canvas" style={style}>
                <svg className="btr__mark" viewBox="26 18 128 138" preserveAspectRatio="xMidYMid meet">
                  <path d="M90 34 145 137H35L90 34Z" />
                </svg>
                {facts.map((fact, index) => {
                  const box = geometry.facts[index]
                  return (
                    <div key={fact.id} className="btr-fact" style={{ left: box.x, top: box.y, width: box.w, height: box.h, "--i": index } as CSSProperties}>
                      <span>{fact.label}</span>
                      <strong>{layout.name === "wide" ? fact.value : fact.short}</strong>
                    </div>
                  )
                })}
                <svg className="btr__paths" viewBox={`0 0 ${geometry.w} ${geometry.h}`} width={geometry.w} height={geometry.h}>
                  {slots && facts.map((fact, index) => {
                    const d = pathFor(layout.name, index, slots[index])
                    return (
                      <g key={fact.id} style={{ "--i": index } as CSSProperties}>
                        <path className="btr-path__halo" d={d} pathLength={1} />
                        <path className="btr-path" d={d} pathLength={1} />
                        <path className="btr-path__glint" d={d} pathLength={1} />
                      </g>
                    )
                  })}
                </svg>
                {/*
                  One box covering both the browser and the phone. The frame changes shape with clip-path,
                  so nothing inside it is laid out again or shifts while the page scrolls.
                */}
                <div
                  className="btr-screen"
                  style={{ left: union.x, top: union.y, width: union.w, height: union.h, "--browser": browserInset, "--phone": phoneInset } as CSSProperties}
                >
                  <span className="btr-screen__edge" data-shape="browser" style={place(geometry.browser, union)} />
                  <span className="btr-screen__edge" data-shape="phone" style={place(geometry.phone, union)} />
                  <div className="btr-screen__clip">
                    <span className="btr-screen__bar" style={{ ...place(geometry.browser, union), height: 22 }}><i /><i /><i /></span>
                    <span className="btr-screen__island" style={{ left: geometry.phone.x - union.x + geometry.phone.w / 2, top: geometry.phone.y - union.y + 9 }} />
                    <MiniSite wide ref={siteRef} style={{ left: geometry.browser.x - union.x, top: geometry.browser.y - union.y + 22, width: geometry.browser.w }} />
                    <MiniSite wide={false} style={{ left: geometry.phone.x - union.x, top: geometry.phone.y - union.y, width: geometry.phone.w }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type Rect = { x: number; y: number; w: number; h: number }

function frames(geometry: (typeof LAYOUTS)[LayoutName]) {
  const b = geometry.browser
  const p = geometry.phone
  const x = Math.min(b.x, p.x)
  const y = Math.min(b.y, p.y)
  const union = { x, y, w: Math.max(b.x + b.w, p.x + p.w) - x, h: Math.max(b.y + b.h, p.y + p.h) - y }
  const inset = (r: Rect, radius: number) => `inset(${r.y - y}px ${union.x + union.w - (r.x + r.w)}px ${union.y + union.h - (r.y + r.h)}px ${r.x - x}px round ${radius}px)`
  return { union, browserInset: inset(b, 14), phoneInset: inset(p, 34) }
}

function place(r: Rect, union: Rect): CSSProperties {
  return { left: r.x - union.x, top: r.y - union.y, width: r.w, height: r.h }
}
