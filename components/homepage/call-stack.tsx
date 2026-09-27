"use client"

import { useEffect, useRef, useState, type ReactNode } from "react"

export type StackStep = { label: string; title: string; body: ReactNode }

// Isometric plate geometry (top vertex at the origin of each plate group).
const CX = 240
const A = 144 // half width of the top face
const B = 83 // half height of the top face
const T = 9 // plate thickness
const GAP = 56 // resting distance between plates
const LIFT = 96 // how far the plates above the active one move away
const BASE_Y = 132
// Maps a flat 200×200 drawing onto the plate's top face.
const K = A / 200
const ISO = `matrix(${K} ${K * 0.5774} ${-K} ${K * 0.5774} ${CX} 0)`

const top = `M${CX},0 L${CX + A},${B} L${CX},${2 * B} L${CX - A},${B} Z`
const left = `M${CX - A},${B} L${CX},${2 * B} L${CX},${2 * B + T} L${CX - A},${B + T} Z`
const right = `M${CX},${2 * B} L${CX + A},${B} L${CX + A},${B + T} L${CX},${2 * B + T} Z`

function KeypadDetail() {
  return (
    <g>
      {Array.from({ length: 12 }, (_, i) => {
        const col = i % 3
        const row = Math.floor(i / 3)
        return <rect key={i} x={34 + col * 46} y={22 + row * 40} width={38} height={30} rx={5} className={i === 4 ? "is-key" : undefined} />
      })}
    </g>
  )
}

function WaveDetail() {
  const heights = [18, 34, 52, 30, 70, 96, 64, 118, 84, 132, 96, 60, 108, 78, 46, 88, 56, 34, 62, 28, 44, 20]
  return (
    <g>
      {heights.map((h, i) => (
        <rect key={i} className="ml-stack__bar" x={22 + i * 7.6} y={100 - h / 2} width={2.6} height={h} rx={1.3} style={{ animationDelay: `${(i % 7) * -0.18}s` }} />
      ))}
    </g>
  )
}

function DetailsDetail() {
  const widths = [120, 96, 140, 84, 112]
  return (
    <g>
      {widths.map((w, i) => (
        <g key={i}>
          <rect x={30} y={34 + i * 30} width={12} height={12} rx={2.5} className={i < 3 ? "is-checked" : undefined} />
          <rect x={54} y={38 + i * 30} width={w} height={4} rx={2} className="is-line" />
        </g>
      ))}
    </g>
  )
}

function TeamDetail() {
  return (
    <g>
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={26} y={30 + i * 50} width={148} height={38} rx={6} className={i === 0 ? "is-request" : undefined} />
          <circle cx={42} cy={49 + i * 50} r={4} className={i === 0 ? "is-dot" : "is-muted-dot"} />
          <rect x={54} y={43 + i * 50} width={i === 0 ? 92 : 70} height={4} rx={2} className="is-line" />
          <rect x={54} y={52 + i * 50} width={i === 0 ? 60 : 48} height={3} rx={1.5} className="is-line is-faint" />
        </g>
      ))}
    </g>
  )
}

const details = [KeypadDetail, WaveDetail, DetailsDetail, TeamDetail]

function plateY(index: number, active: number) {
  let y = BASE_Y + index * GAP
  if (index < active) y -= LIFT
  if (index === active) y -= 10
  if (active === 0) y -= 36
  return y
}

function Stack({ active, uid }: { active: number; uid: string }) {
  return (
    <svg className="ml-stack__svg" viewBox="0 0 480 520" role="img" aria-label="Four layers: your number, the receptionist, your approved details, and your team.">
      <defs>
        <pattern id={`${uid}-hatch`} width="5" height="5" patternUnits="userSpaceOnUse">
          <path d="M0 0V5" className="ml-stack__hatch" />
        </pattern>
      </defs>
      {[3, 2, 1, 0].map((index) => {
        const Detail = details[index]
        return (
          <g
            key={index}
            className="ml-stack__plate"
            data-active={index === active}
            data-past={index < active}
            style={{ transform: `translateY(${plateY(index, active)}px)` }}
          >
            <path d={left} className="ml-stack__side" />
            <path d={left} fill={`url(#${uid}-hatch)`} className="ml-stack__side-hatch" />
            <path d={right} className="ml-stack__side" />
            <path d={top} className="ml-stack__top" />
            <g transform={ISO} className="ml-stack__detail">
              <Detail />
            </g>
          </g>
        )
      })}
    </svg>
  )
}

export function CallStack({ steps, intro }: { steps: StackStep[]; intro: ReactNode }) {
  const [active, setActive] = useState(0)
  const stepRefs = useRef<Array<HTMLElement | null>>([])
  const railRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          const index = stepRefs.current.indexOf(entry.target as HTMLElement)
          if (index >= 0) setActive(index)
        }
      },
      { rootMargin: "-48% 0px -48% 0px" },
    )
    stepRefs.current.forEach((node) => node && observer.observe(node))

    let frame = 0
    const update = () => {
      frame = 0
      const rail = railRef.current
      if (!rail) return
      const rect = rail.getBoundingClientRect()
      const progress = (window.innerHeight / 2 - rect.top) / rect.height
      rail.style.setProperty("--progress", Math.min(1, Math.max(0, progress)).toFixed(4))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener("scroll", onScroll, { passive: true })
    window.addEventListener("resize", onScroll)
    return () => {
      observer.disconnect()
      window.removeEventListener("scroll", onScroll)
      window.removeEventListener("resize", onScroll)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  const goTo = (index: number) => {
    stepRefs.current[index]?.scrollIntoView({ behavior: "smooth", block: "center" })
  }

  return (
    <div className="ml-stack">
      <div className="ml-stack__copy">
        {intro}
        <ol className="ml-stack__index" aria-label="Layers">
          {steps.map((step, index) => (
            <li key={step.label}>
              <button type="button" data-active={index === active} onClick={() => goTo(index)}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                {step.label}
              </button>
            </li>
          ))}
        </ol>
        <div className="ml-stack__mobile-visual" aria-hidden="true">
          <Stack active={active} uid="stack-m" />
        </div>
        <div className="ml-stack__steps" ref={railRef}>
          <span className="ml-stack__rail" aria-hidden="true"><i /></span>
          {steps.map((step, index) => (
            <article
              key={step.label}
              ref={(node) => {
                stepRefs.current[index] = node
              }}
              className="ml-stack__step"
              data-active={index === active}
            >
              <span className="ml-stack__dot" aria-hidden="true" />
              <p className="ml-mono">{String(index + 1).padStart(2, "0")} · {step.label}</p>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </div>
      <div className="ml-stack__visual">
        <div className="ml-stack__sticky">
          <Stack active={active} uid="stack-d" />
        </div>
      </div>
    </div>
  )
}
