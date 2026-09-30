"use client"

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties, type ReactNode } from "react"
import { ArrowRight } from "lucide-react"
import { BrambleBefore } from "@/components/homepage/bramble/bramble-before"
import { BrambleSite } from "@/components/homepage/bramble/bramble-site"
import "./the-difference.css"

/**
 * The difference, as a designed before and after for Bramble, the made-up groomer. One frame holds
 * both websites; the divider (a range input, so it works with a keyboard and a screen reader) shows
 * more of either. Choosing a difference moves both pages to where it shows. No figures: this is a
 * demonstration, and measured client results live in <ClientResults />, which stays empty until a
 * client has approved publishing real numbers.
 */

type Target = "top" | "services" | "hours" | "book"

const differences: Array<{ id: string; target: Target; title: string; before: string; after: string }> = [
  { id: "place", target: "top", title: "What the place is like", before: "Clip art, and no photos of the shop.", after: "Photos of the room, the work, and a finished groom." },
  { id: "offer", target: "services", title: "What you offer", before: "One paragraph that ends with “call for pricing.”", after: "Each service, how long it takes, and a starting price." },
  { id: "hours", target: "hours", title: "When you’re open", before: "Hours in the footer, in small print.", after: "Hours where people look, with today marked, and directions one tap away." },
  { id: "book", target: "book", title: "How to book", before: "Call during business hours.", after: "Ask for a visit from any page, or call." },
]

/** Moves a page inside its frame so `target` sits near the top, never past the end of the page. */
function aim(frame: HTMLElement | null, target: Target) {
  if (!frame) return
  for (const layer of frame.querySelectorAll<HTMLElement>("[data-layer]")) {
    const page = layer.querySelector<HTMLElement>(".bx-page, .bo-page")
    const section = page?.querySelector<HTMLElement>(`[data-target="${target}"]`)
    if (!page || !section || !layer.clientHeight) continue
    const max = Math.max(0, page.offsetHeight - layer.clientHeight)
    const y = target === "top" ? 0 : Math.min(max, Math.max(0, section.offsetTop - layer.clientHeight * 0.06))
    page.style.transform = `translate3d(0, ${-y}px, 0)`
  }
}

function Compare({ kind, split, onSplit, target, children }: { kind: "desktop" | "mobile"; split: number; onSplit: (value: number) => void; target: Target; children: [ReactNode, ReactNode] }) {
  const frameRef = useRef<HTMLDivElement>(null)
  const [dragging, setDragging] = useState(false)

  const place = useCallback(() => aim(frameRef.current, target), [target])
  useLayoutEffect(place, [place])
  useEffect(() => {
    const node = frameRef.current
    if (!node) return
    const observer = new ResizeObserver(place)
    observer.observe(node)
    return () => observer.disconnect()
  }, [place])

  return (
    <div ref={frameRef} className="df__frame" data-kind={kind} data-dragging={dragging || undefined} style={{ "--split": `${split}%` } as CSSProperties}>
      <div className="df__layer" data-layer="before">{children[0]}</div>
      <div className="df__layer" data-layer="after">{children[1]}</div>
      <span className="df__label" data-side="before" aria-hidden="true">Before</span>
      <span className="df__label" data-side="after" aria-hidden="true">After</span>
      <input
        type="range"
        className="df__range"
        min={0}
        max={100}
        step={1}
        value={Math.round(split)}
        aria-label="Compare Bramble’s old website with the new one"
        aria-valuetext={split >= 98 ? "Showing the old website" : split <= 2 ? "Showing the new website" : `${Math.round(split)}% old website, ${100 - Math.round(split)}% new`}
        onChange={(event) => onSplit(Number(event.target.value))}
        onPointerDown={() => setDragging(true)}
        onPointerUp={() => setDragging(false)}
        onPointerCancel={() => setDragging(false)}
        onBlur={() => setDragging(false)}
      />
      <span className="df__divider" aria-hidden="true"><span className="df__handle"><i /><i /></span></span>
    </div>
  )
}

export function TheDifference({ label }: { label: string }) {
  const [active, setActive] = useState(0)
  const [split, setSplit] = useState(62)
  const [opened, setOpened] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  /* The first time it comes into view, the divider sweeps across once so both sides read as one frame. */
  useEffect(() => {
    const node = rootRef.current
    if (!node || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        setOpened(true)
        setSplit(94)
        window.setTimeout(() => setSplit(46), 700)
      },
      { threshold: 0.45 },
    )
    observer.observe(node)
    return () => observer.disconnect()
  }, [])

  const item = differences[active]

  return (
    <div ref={rootRef} className="df" data-opened={opened || undefined}>
      <div className="df__stage">
        <p className="hp-tag df__tag">{label}</p>
        <div className="df__screens">
          <div className="df__browser">
            <span className="df__bar" aria-hidden="true"><i /><i /><i /></span>
            <Compare kind="desktop" split={split} onSplit={setSplit} target={item.target}>
              <BrambleBefore fit="desktop" />
              <BrambleSite view="desktop" />
            </Compare>
          </div>
          <div className="df__phone">
            <Compare kind="mobile" split={split} onSplit={setSplit} target={item.target}>
              <BrambleBefore fit="mobile" />
              <BrambleSite view="mobile" />
            </Compare>
          </div>
        </div>
      </div>

      <div className="df__side">
        <ol className="df__list" aria-label="What changed">
          {differences.map((entry, index) => (
            <li key={entry.id}>
              <button type="button" className="df__item" aria-pressed={index === active} onClick={() => setActive(index)}>
                <span className="df__index" aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                <span className="df__title">{entry.title}</span>
                <span className="df__change">
                  <span data-side="before"><b>Before</b>{entry.before}</span>
                  <span data-side="after"><b>After</b>{entry.after}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className="df__calls">
          <span className="df__index" aria-hidden="true">05</span>
          <span>
            <span className="df__title">Calls nobody can answer</span>
            <span className="df__plain">
              Before, they go to voicemail. With an AI receptionist set up, a missed call can become a written request
              with the details. <a href="#receptionist" className="ml-link">Try the demo <ArrowRight aria-hidden="true" /></a>
            </span>
          </span>
        </p>
      </div>
    </div>
  )
}
