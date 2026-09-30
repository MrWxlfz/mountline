"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type Ref } from "react"
import { SamplePhoto } from "@/components/homepage/sample-photo"
import "./build-test-refine.css"

/**
 * Build → Test → Refine, shown on Bramble, the made-up dog groomer from the design demonstration.
 *
 * One composition in three states, keyed on [data-chapter]:
 * - Build: a photo, the services, the hours, and a way to get in touch travel along fine paths into
 *   their places on Bramble's website.
 * - Test: the same website becomes a phone, and a customer picks a service and asks for a visit.
 * - Refine: the phone page gets clearer (a tighter photo, today's hours up top, booking one tap
 *   away), then settles beside the finished desktop site.
 *
 * It's a designed demonstration of the customer experience: nothing is submitted and nothing is
 * measured. On wide, tall screens the chapter follows the scroll inside one short sticky stage;
 * everywhere else it's three tabs. Either way the chapter buttons work immediately, and every
 * chapter has a finished, still state for reduced motion or a fast scroll.
 */

type ChapterId = "build" | "test" | "refine"
type Chapter = { id: ChapterId; title: string; line: string; steps: string[] }

const clock = () => performance.now()

const chapters: Chapter[] = [
  {
    id: "build",
    title: "Build.",
    line: "We turn the details of your business into a website customers can use.",
    steps: ["A photo of the work", "When you’re open, and where", "One clear way to get in touch", "What you offer, and what it costs"],
  },
  {
    id: "test",
    title: "Test.",
    line: "Then we use it the way a customer would, on a phone.",
    steps: ["Find the service they came for", "Ask for a visit, with that service already chosen", "Know the request went through, and what happens next"],
  },
  {
    id: "refine",
    title: "Refine.",
    line: "Whatever made that harder than it should be gets fixed.",
    steps: ["A tighter photo that shows the work", "Today’s hours at the top", "Booking one tap away on every screen"],
  },
]

/** The ingredients, in the order they land. Each id matches a [data-slot] on the page. */
const ingredients = [
  { id: "photo", label: "Photo", value: "A groom in progress" },
  { id: "hours", label: "Hours", value: "Tue–Fri 8–5 · Sat 8–2" },
  { id: "contact", label: "Get in touch", value: "A request form, or a call" },
  { id: "services", label: "Services", value: "Bath & tidy · Full groom · Puppy’s first groom" },
] as const
type SlotId = (typeof ingredients)[number]["id"]

type Rect = { x: number; y: number; w: number; h: number }

/** Canvas geometry, in design units. The canvas scales to fit its box; these stay fixed. */
const LAYOUTS = {
  wide: {
    w: 800,
    h: 540,
    cards: {
      photo: { x: 0, y: 88, w: 196, h: 118 },
      hours: { x: 0, y: 222, w: 196, h: 56 },
      contact: { x: 0, y: 294, w: 196, h: 66 },
      services: { x: 0, y: 376, w: 196, h: 66 },
    },
    lanes: null,
    browser: { x: 250, y: 34, w: 550, h: 472 },
    phone: { x: 275, y: 8, w: 250, h: 524 },
    // Refine: the phone steps right, and the browser it came from slides left with the finished site.
    shift: { x: 270, y: 0 },
    desk: { x: 30, y: 34, w: 550, h: 472, scale: 1 },
  },
  narrow: {
    w: 360,
    h: 640,
    // One row. Each path runs down the phone's nearer side in its own lane, so none of them cross.
    cards: {
      contact: { x: 0, y: 0, w: 84, h: 56 },
      photo: { x: 92, y: 0, w: 84, h: 56 },
      services: { x: 184, y: 0, w: 84, h: 56 },
      hours: { x: 276, y: 0, w: 84, h: 56 },
    },
    lanes: {
      contact: { x: 14, jog: 66 },
      photo: { x: 30, jog: 80 },
      services: { x: 330, jog: 80 },
      hours: { x: 346, jog: 66 },
    },
    browser: null,
    phone: { x: 55, y: 128, w: 250, h: 508 },
    shift: { x: 55, y: 0 },
    desk: { x: 0, y: 196, w: 550, h: 472, scale: 0.52 },
  },
} as const
type LayoutName = keyof typeof LAYOUTS
type Layout = (typeof LAYOUTS)[LayoutName]

/** Where an element sits inside the canvas, whatever it's nested in. Offsets ignore transforms. */
function offsetWithin(node: HTMLElement, root: HTMLElement): Rect {
  let x = 0
  let y = 0
  let el: HTMLElement | null = node
  while (el && el !== root) {
    x += el.offsetLeft
    y += el.offsetTop
    el = el.offsetParent as HTMLElement | null
  }
  return { x, y, w: node.offsetWidth, h: node.offsetHeight }
}

/**
 * A path from an ingredient to its place on the page: level, then a 60° run like the sides of the
 * Mountline mark, then level again. The photo sits across the page from its card, so its path comes
 * over the top of the page and drops in, rather than crossing the words. On a phone the cards sit
 * above, so each path drops and turns in from its own side.
 */
function pathFor(geometry: Layout, id: SlotId, slot: Rect) {
  const tan = Math.tan(Math.PI / 3)
  const card: Rect = geometry.cards[id]
  if (!geometry.lanes) {
    const top = (geometry.browser?.y ?? 0) - 14
    const x0 = card.x + card.w
    const y0 = card.y + card.h / 2
    if (id === "photo") {
      const x2 = slot.x + slot.w * 0.5
      const bend = x0 + 16
      return `M${x0} ${y0} H${bend} L${bend + Math.abs(y0 - top) / tan} ${top} H${x2} V${slot.y - 4}`
    }
    const y1 = slot.y + Math.min(slot.h / 2, 14)
    const x1 = slot.x - 5
    const run = Math.abs(y1 - y0) / tan
    const bend = Math.min(x0 + 16, x1 - run - 8)
    return `M${x0} ${y0} H${bend} L${bend + run} ${y1} H${x1}`
  }
  const lane = geometry.lanes[id]
  const left = lane.x < geometry.w / 2
  const x0 = card.x + card.w / 2
  const x1 = left ? slot.x - 4 : slot.x + slot.w + 4
  const y1 = slot.y + Math.min(slot.h / 2, 12)
  return `M${x0} ${card.y + card.h} V${lane.jog} H${lane.x} V${y1} H${x1}`
}

/** Bramble's desktop page, cropped to the top: the part a customer sees first. */
function DeskPage({ pageRef, eager = false }: { pageRef?: Ref<HTMLDivElement>; eager?: boolean }) {
  return (
    <div ref={pageRef} className="bm bm--desk">
      <div className="bm-nav">
        <span className="bm-brand"><b>Bramble</b><small>Dog grooming</small></span>
        <span className="bm-links"><span>Services</span><span>Hours</span><span>Visit</span></span>
        <span className="bm-btn bm-btn--sm" data-part="contact">Request a visit</span>
      </div>
      <div className="bm-hero">
        <div className="bm-hero__copy">
          <span className="bm-eyebrow">Keller, Texas · By appointment</span>
          <span className="bm-display">Calm, careful dog grooming in Keller.</span>
          <span className="bm-lede">One dog at a time, in a quiet room. We’ll text you when yours is ready.</span>
          <span className="bm-slot" data-slot="hours">
            <span className="bm-skel" />
            <span className="bm-real bm-open"><i />Open today until 5:00 · 1120 Lantern Way</span>
          </span>
          <span className="bm-slot" data-slot="contact">
            <span className="bm-skel" />
            <span className="bm-real bm-actions"><span className="bm-btn">Request a visit</span><span className="bm-btn bm-btn--line">Call (817) 555-0164</span></span>
          </span>
        </div>
        <span className="bm-slot bm-photo" data-slot="photo">
          <span className="bm-skel" />
          <span className="bm-real bm-photo__frame"><SamplePhoto id="work" sizes="300px" className="bm-photo__img" eager={eager} /></span>
        </span>
      </div>
      <div className="bm-slot bm-services" data-slot="services">
        <span className="bm-skel" />
        <span className="bm-real">
          <span className="bm-title">Services</span>
          <span className="bm-rows">
            <span><b>Bath &amp; tidy</b><em>1½–2 hrs</em><i>from $55</i></span>
            <span><b>Full groom</b><em>2–3 hrs</em><i>from $75</i></span>
            <span><b>Puppy’s first groom</b><em>About 1 hr</em><i>$40</i></span>
          </span>
        </span>
      </div>
    </div>
  )
}

/** The same site on a phone: the page, the request sheet, and the call-or-book bar. */
function PhonePage({ pageRef }: { pageRef?: Ref<HTMLDivElement> }) {
  return (
    <div ref={pageRef} className="bm bm--phone">
      <div className="bm-scroll">
        <div className="bm-nav">
          <span className="bm-brand"><b>Bramble</b></span>
          <span className="bm-burger"><i /><i /></span>
        </div>
        <span className="bm-eyebrow">Keller, Texas · By appointment</span>
        <span className="bm-display">Calm, careful dog grooming in Keller.</span>
        <span className="bm-today"><span className="bm-open"><i />Open today until 5:00</span></span>
        <span className="bm-slot bm-photo" data-slot="photo">
          <span className="bm-skel" />
          <span className="bm-real bm-photo__frame"><SamplePhoto id="work" sizes="260px" className="bm-photo__img" /></span>
        </span>
        <span className="bm-slot" data-slot="contact">
          <span className="bm-skel" />
          <span className="bm-real bm-btn bm-btn--block">Request a visit</span>
        </span>
        <span className="bm-slot bm-services" data-slot="services">
          <span className="bm-skel" />
          <span className="bm-real">
            <span className="bm-title">Services</span>
            <span className="bm-rows">
              <span><b>Bath &amp; tidy</b><i>from $55</i></span>
              <span data-pick><b>Full groom</b><i>from $75</i><u aria-hidden="true" /></span>
              <span><b>Puppy’s first groom</b><i>$40</i></span>
              <span><b>Nail trim</b><i>$15</i></span>
            </span>
          </span>
        </span>
        <span className="bm-slot" data-slot="hours">
          <span className="bm-skel" />
          <span className="bm-real bm-hours"><b>Hours</b>Tue–Fri 8–5 · Sat 8–2</span>
        </span>
      </div>

      <span className="bm-dock"><span className="bm-btn bm-btn--line">Call</span><span className="bm-btn">Request a visit</span></span>

      <span className="bm-sheet">
        <span className="bm-sheet__grip" />
        <span className="bm-sheet__title">Request a visit</span>
        <span className="bm-field"><small>Service</small><span className="bm-input" data-filled>Full groom</span></span>
        <span className="bm-field"><small>Dog’s name</small><span className="bm-input"><span className="bm-type">Biscuit</span><span className="bm-caret" /></span></span>
        <span className="bm-field"><small>Days that work</small><span className="bm-chips"><span>Tue</span><span data-on="1">Wed</span><span>Thu</span><span data-on="2">Sat</span></span></span>
        <span className="bm-send">
          <span className="bm-btn bm-btn--block bm-send__btn">Send request</span>
          <span className="bm-done"><i />Request sent. We’ll text you to confirm a time.</span>
        </span>
      </span>
    </div>
  )
}

function useLayout() {
  const [layout, setLayout] = useState<{ name: LayoutName; pinned: boolean }>({ name: "wide", pinned: false })
  useEffect(() => {
    const wide = window.matchMedia("(min-width: 1024px)")
    // Pinned only where every chapter's words fit beside the stage without clipping.
    const tall = window.matchMedia("(min-height: 720px)")
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

export function BuildTestRefine() {
  const [chapter, setChapter] = useState(0)
  const [seen, setSeen] = useState(false)
  const layout = useLayout()
  const rootRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const boxRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  const deskRef = useRef<HTMLDivElement>(null)
  const phoneRef = useRef<HTMLDivElement>(null)
  const [scale, setScale] = useState(1)
  const [slots, setSlots] = useState<Rect[] | null>(null)
  // While a chapter button is scrolling the page, scroll position doesn't pick the chapter.
  const lock = useRef<{ chapter: number; until: number } | null>(null)

  const geometry: Layout = LAYOUTS[layout.name]

  /* Where each ingredient lands: measured from the page itself, so the paths always meet it. */
  useLayoutEffect(() => {
    const canvas = canvasRef.current
    const page = layout.name === "wide" ? deskRef.current : phoneRef.current
    if (!canvas || !page) return
    const measure = () => {
      const rects = ingredients.map((item) => {
        const slot = page.querySelector<HTMLElement>(`[data-slot="${item.id}"]`)
        return slot ? offsetWithin(slot, canvas) : null
      })
      setSlots(rects.every(Boolean) ? (rects as Rect[]) : null)
    }
    measure()
    document.fonts?.ready.then(measure).catch(() => {})
  }, [layout.name])

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
    const node = boxRef.current
    if (!node) return
    const observer = new IntersectionObserver(([entry]) => entry.isIntersecting && setSeen(true), { threshold: 0.3 })
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
      const next = progress < 0.3 ? 0 : progress < 0.64 ? 1 : 2
      setChapter((current) => (current === next ? current : next))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(read)
    }
    const release = () => {
      lock.current = null
      onScroll()
    }
    // A restored scroll position (back/forward, reload) lands in the right chapter straight away.
    read()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    window.addEventListener("scrollend", release)
    window.addEventListener("pageshow", onScroll)
    return () => {
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      window.removeEventListener("scrollend", release)
      window.removeEventListener("pageshow", onScroll)
      cancelAnimationFrame(frame)
    }
  }, [layout.pinned, range])

  function choose(index: number) {
    setChapter(index)
    setSeen(true)
    if (!layout.pinned) return
    const r = range()
    if (!r) return
    // A predictable place inside that chapter's stretch of the track.
    const anchors = [0.12, 0.47, 0.84]
    lock.current = { chapter: index, until: clock() + 1200 }
    window.scrollTo({ top: r.top + anchors[index] * r.distance, behavior: "smooth" })
  }

  function onKey(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    const keys: Record<string, number> = { ArrowRight: index + 1, ArrowLeft: index - 1, Home: 0, End: 2 }
    if (!(event.key in keys)) return
    event.preventDefault()
    const next = Math.min(2, Math.max(0, keys[event.key]))
    choose(next)
    document.getElementById(`btr-tab-${chapters[next].id}`)?.focus()
  }

  const current = chapters[chapter]
  const { union, browserInset, phoneInset, shiftedInset } = frames(geometry)
  // The desk starts where the browser was (or where it ends up, on a phone) and moves to its Refine place.
  const deskBase = geometry.browser ?? geometry.desk
  const style = {
    "--scale": scale,
    "--cw": geometry.w,
    "--ch": geometry.h,
    "--shift-x": `${geometry.shift.x}px`,
    "--shift-y": `${geometry.shift.y}px`,
    "--desk-x": `${geometry.desk.x - deskBase.x}px`,
    "--desk-y": `${geometry.desk.y - deskBase.y}px`,
    "--desk-scale": geometry.desk.scale,
  } as CSSProperties

  return (
    <div
      ref={rootRef}
      className="btr"
      data-chapter={current.id}
      data-layout={layout.name}
      data-pinned={layout.pinned || undefined}
      data-seen={seen || undefined}
    >
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
                      <h3 className="btr__title">{item.title}</h3>
                      <p className="btr__line">{item.line}</p>
                      <ol className="btr__steps" data-chapter={item.id}>
                        {item.steps.map((step, index) => (
                          <li key={step} style={{ "--i": index } as CSSProperties}>
                            <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                            {step}
                          </li>
                        ))}
                      </ol>
                    </div>
                  )
                })}
              </div>
              <p className="hp-tag btr__tag">Example business · Design demonstration</p>
            </div>

            <div className="btr__stage">
              <div className="btr__box" ref={boxRef} aria-hidden="true">
                <div ref={canvasRef} className="btr__canvas" style={style}>
                  {ingredients.map((item, index) => {
                    const box = geometry.cards[item.id]
                    return (
                      <div
                        key={item.id}
                        className="btr-card"
                        data-card={item.id}
                        style={{ left: box.x, top: box.y, width: box.w, height: box.h, "--i": index } as CSSProperties}
                      >
                        {item.id === "photo" ? <span className="btr-card__photo"><SamplePhoto id="work" sizes="200px" className="bm-photo__img" /></span> : null}
                        <span className="btr-card__label">{item.label}</span>
                        <strong>{item.value}</strong>
                      </div>
                    )
                  })}

                  <svg className="btr__paths" viewBox={`0 0 ${geometry.w} ${geometry.h}`} width={geometry.w} height={geometry.h}>
                    {slots && ingredients.map((item, index) => {
                      const d = pathFor(geometry, item.id, slots[index])
                      return (
                        <g key={item.id} style={{ "--i": index } as CSSProperties}>
                          <path className="btr-path__halo" d={d} pathLength={1} />
                          <path className="btr-path" d={d} pathLength={1} />
                          <path className="btr-path__glint" d={d} pathLength={1} />
                        </g>
                      )
                    })}
                  </svg>

                  {/* The finished desktop site, for Refine. On wide screens it's the same window the page was built in. */}
                  <div className="btr-desk" style={place({ ...deskBase, w: geometry.desk.w, h: geometry.desk.h })}>
                    <span className="btr-desk__bar"><i /><i /><i /></span>
                    <DeskPage />
                  </div>

                  {/*
                    One box covering the browser and both phone positions. Its visible shape is a clip-path
                    that moves between them, so nothing inside is laid out again while it changes.
                  */}
                  <div
                    className="btr-screen"
                    style={{ ...place(union), "--browser": browserInset, "--phone": phoneInset, "--phone-2": shiftedInset } as CSSProperties}
                  >
                    {geometry.browser ? <span className="btr-screen__edge" data-shape="browser" style={place(geometry.browser, union)} /> : null}
                    <span className="btr-screen__edge" data-shape="phone" style={place(geometry.phone, union)} />
                    <div className="btr-screen__clip">
                      {geometry.browser ? (
                        <>
                          <span className="btr-screen__bar" style={{ ...place(geometry.browser, union), height: 24 }}><i /><i /><i /></span>
                          <div className="btr-screen__desk" style={{ ...place(geometry.browser, union), top: geometry.browser.y - union.y + 24, height: geometry.browser.h - 24 }}>
                            <DeskPage pageRef={deskRef} />
                          </div>
                        </>
                      ) : null}
                      <div className="btr-screen__phone" style={place(geometry.phone, union)}>
                        <span className="btr-screen__island" />
                        <PhonePage pageRef={phoneRef} />
                      </div>
                    </div>
                  </div>

                  {/* On a phone, what's happening, where the ingredients were. */}
                  {layout.name === "narrow" ? (
                    <div className="btr-caption">
                      {chapters.slice(1).map((item) => (
                        <ol key={item.id} data-for={item.id}>
                          {item.steps.map((step, index) => <li key={step} style={{ "--i": index } as CSSProperties}>{step}</li>)}
                        </ol>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function place(r: Rect, origin: { x: number; y: number } = { x: 0, y: 0 }): CSSProperties {
  return { left: r.x - origin.x, top: r.y - origin.y, width: r.w, height: r.h }
}

function frames(geometry: Layout) {
  const p = geometry.phone
  const p2 = { ...p, x: p.x + geometry.shift.x, y: p.y + geometry.shift.y }
  const shapes: Rect[] = [p, p2, ...(geometry.browser ? [geometry.browser] : [])]
  const x = Math.min(...shapes.map((r) => r.x))
  const y = Math.min(...shapes.map((r) => r.y))
  const right = Math.max(...shapes.map((r) => r.x + r.w))
  const bottom = Math.max(...shapes.map((r) => r.y + r.h))
  const union = { x, y, w: right - x, h: bottom - y }
  const inset = (r: Rect, radius: number) => `inset(${r.y - y}px ${right - (r.x + r.w)}px ${bottom - (r.y + r.h)}px ${r.x - x}px round ${radius}px)`
  return {
    union,
    browserInset: geometry.browser ? inset(geometry.browser, 12) : inset(p, 36),
    phoneInset: inset(p, 36),
    shiftedInset: inset(p2, 36),
  }
}
