"use client"

import { useRef, useState, type CSSProperties, type KeyboardEvent } from "react"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, ChevronDown, Monitor, Smartphone } from "lucide-react"
import { publicConceptRoutes, workShowcase } from "@/lib/homepage-content"

export function WorkSelector() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [view, setView] = useState<"desktop" | "mobile">("desktop")
  const tabsRef = useRef<HTMLDivElement>(null)
  const activeWork = workShowcase[activeIndex]
  const sceneStyle = {
    "--project-accent": activeWork.accent,
    "--project-accent-soft": activeWork.accentSoft,
    "--project-focal": activeWork.focalPoint,
    "--project-mobile-focal": activeWork.mobileFocalPoint,
  } as CSSProperties

  function selectProject(index: number) {
    setActiveIndex(index)

    if (window.innerWidth > 767) return
    window.requestAnimationFrame(() => {
      tabsRef.current
        ?.querySelectorAll<HTMLButtonElement>("button")
        [index]?.scrollIntoView({
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth",
          block: "nearest",
          inline: "center",
        })
    })
  }

  function moveSelection(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return
    event.preventDefault()

    const nextIndex = event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? workShowcase.length - 1
        : (index + (event.key === 'ArrowRight' ? 1 : -1) + workShowcase.length) % workShowcase.length

    setActiveIndex(nextIndex)
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('button')
    buttons?.[nextIndex]?.focus()
  }

  return (
    <div className="mtl-work-explorer" style={sceneStyle} data-mtl-reveal="scene">
      <div
        ref={tabsRef}
        className="mtl-work-tabs"
        role="tablist"
        aria-label="Choose a Mountline concept"
        style={{ "--active-index": activeIndex } as CSSProperties}
      >
        {workShowcase.map((work, index) => (
          <button
            key={work.id}
            id={`work-tab-${work.id}`}
            type="button"
            className={index === activeIndex ? "is-active" : undefined}
            onClick={() => selectProject(index)}
            onKeyDown={(event) => moveSelection(event, index)}
            role="tab"
            aria-selected={index === activeIndex}
            aria-controls="work-panel"
            tabIndex={index === activeIndex ? 0 : -1}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{work.title}</strong>
          </button>
        ))}
      </div>

      <div
        id="work-panel"
        className="mtl-work-active"
        role="tabpanel"
        aria-labelledby={`work-tab-${activeWork.id}`}
      >
        <div className="mtl-work-stage">
          <div className="mtl-work-toolbar">
            <span aria-hidden="true">
              <i /> Concept browser
            </span>
            <div className="mtl-work-view-toggle" role="group" aria-label="Choose a preview size">
              <button
                type="button"
                className={view === "desktop" ? "is-active" : undefined}
                onClick={() => setView("desktop")}
                aria-pressed={view === "desktop"}
              >
                <Monitor className="size-3.5" aria-hidden="true" />
                Desktop
              </button>
              <button
                type="button"
                className={view === "mobile" ? "is-active" : undefined}
                onClick={() => setView("mobile")}
                aria-pressed={view === "mobile"}
              >
                <Smartphone className="size-3.5" aria-hidden="true" />
                Mobile
              </button>
            </div>
          </div>
          <a
            href={activeWork.href}
            target="_blank"
            rel="noreferrer"
            className={`mtl-work-stage-link${view === "mobile" ? " is-mobile" : ""}`}
            aria-label={`Open the ${activeWork.title} concept preview in a new tab`}
          >
            <span className="mtl-work-image-stage">
              <span key={`${activeWork.id}-${view}`} className="mtl-work-image-frame">
                <Image
                  src={view === "mobile" ? activeWork.mobileImage : activeWork.image}
                  alt={activeWork.imageAlt}
                  fill
                  className="object-cover"
                  style={{ objectPosition: view === "mobile" ? "50% 0%" : activeWork.focalPoint }}
                  sizes={view === "mobile"
                    ? "(max-width: 767px) 44vw, 300px"
                    : "(max-width: 767px) 100vw, (max-width: 1100px) 88vw, 65vw"}
                />
              </span>
            </span>
            <span className="mtl-work-open">
              View concept
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </span>
          </a>
        </div>

        <div className="mtl-work-copy" aria-live="polite">
          <div className="mtl-work-title">
            <p>{activeWork.category}</p>
            <h3>{activeWork.title}</h3>
          </div>
          <div className="mtl-work-note">
            <span>Business need</span>
            <p>{activeWork.challenge}</p>
          </div>
          <div className="mtl-work-note">
            <span>Design direction</span>
            <p>{activeWork.direction}</p>
            <a
              href={activeWork.href}
              target="_blank"
              rel="noreferrer"
              className="mtl-inline-link"
            >
              View concept
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <p className="mtl-concept-note">
          Concept preview by Mountline — not the official website.
        </p>
      </div>

      <details className="mtl-all-work">
        <summary>
          Explore all concepts
          <ChevronDown className="size-4" aria-hidden="true" />
        </summary>
        <div>
          {publicConceptRoutes.map((route, index) => (
            <Link key={route.href} href={route.href}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              {route.title}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </details>
    </div>
  )
}
