"use client"

import { useState, type CSSProperties, type KeyboardEvent } from "react"
import Image from "next/image"
import { ArrowUpRight, CalendarCheck, MapPin, Phone } from "lucide-react"
import { LiquidSurface } from "@/components/homepage/liquid-surface"
import { heroWork } from "@/lib/homepage-content"

export function HeroWorkShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const activeWork = heroWork[activeIndex]
  const sceneStyle = {
    "--project-accent": activeWork.accent,
    "--project-accent-soft": activeWork.accentSoft,
    "--project-focal": activeWork.focalPoint,
    "--project-mobile-focal": activeWork.mobileFocalPoint,
  } as CSSProperties

  function moveSelection(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
    event.preventDefault()

    const nextIndex = event.key === "Home"
      ? 0
      : event.key === "End"
        ? heroWork.length - 1
        : (index + (event.key === "ArrowRight" ? 1 : -1) + heroWork.length) % heroWork.length

    setActiveIndex(nextIndex)
    const buttons = event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>("button")
    buttons?.[nextIndex]?.focus()
  }

  return (
    <figure className="mtl-hero-world" style={sceneStyle}>
      <LiquidSurface
        id="hero-work-panel"
        className="mtl-hero-stage"
        tone="ember"
        role="tabpanel"
        aria-labelledby={`hero-work-tab-${activeWork.id}`}
      >
        <div className="mtl-scene-topline" aria-hidden="true">
          <span><i /> Selected Mountline work</span>
          <span>{String(activeIndex + 1).padStart(2, "0")} / 04</span>
        </div>

        <div className="mtl-hero-device-world">
          <a
            href={activeWork.href}
            target="_blank"
            rel="noreferrer"
            className="mtl-hero-browser"
            aria-label={`Open the ${activeWork.title} concept preview in a new tab`}
          >
            <span className="mtl-browser-chrome" aria-hidden="true">
              <span className="mtl-browser-dots"><i /><i /><i /></span>
              <span>{activeWork.title}</span>
              <ArrowUpRight className="size-3.5" />
            </span>
            <span key={`${activeWork.id}-desktop`} className="mtl-hero-browser-image">
              <Image
                src={activeWork.image}
                alt={activeWork.imageAlt}
                fill
                preload={activeIndex === 0}
                loading={activeIndex === 0 ? "eager" : undefined}
                className="object-cover"
                style={{ objectPosition: activeWork.focalPoint }}
                sizes="(max-width: 767px) 92vw, (max-width: 1100px) 78vw, 50vw"
              />
            </span>
          </a>

          <div className="mtl-hero-phone" aria-hidden="true">
            <span className="mtl-phone-top"><i /></span>
            <span key={`${activeWork.id}-mobile`} className="mtl-hero-phone-image">
              <Image
                src={activeWork.image}
                alt=""
                fill
                loading={activeIndex === 0 ? "eager" : undefined}
                className="object-cover"
                style={{ objectPosition: activeWork.mobileFocalPoint }}
                sizes="(max-width: 767px) 28vw, 170px"
              />
            </span>
            <span className="mtl-phone-action">
              <Phone className="size-3" />
              {activeWork.action}
            </span>
          </div>

          <div className="mtl-customer-action" aria-hidden="true">
            <span className="mtl-action-icon">
              {activeWork.id === "served-sliders" ? (
                <MapPin className="size-4" />
              ) : (
                <CalendarCheck className="size-4" />
              )}
            </span>
            <span>
              <small>Clear next move</small>
              <strong>{activeWork.action}</strong>
            </span>
            <i />
          </div>
        </div>

        <figcaption className="mtl-hero-caption" aria-live="polite">
          <span>
            <small>{activeWork.category}</small>
            <strong>{activeWork.title}</strong>
          </span>
          <span>Concept preview by Mountline — not the official website.</span>
        </figcaption>
      </LiquidSurface>

      <div
        className="mtl-hero-selector"
        role="tablist"
        aria-label="Choose a featured Mountline concept"
      >
        {heroWork.map((work, index) => (
          <button
            key={work.id}
            id={`hero-work-tab-${work.id}`}
            type="button"
            className={index === activeIndex ? "is-active" : undefined}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(event) => moveSelection(event, index)}
            role="tab"
            aria-selected={index === activeIndex}
            aria-controls="hero-work-panel"
            tabIndex={index === activeIndex ? 0 : -1}
          >
            <span>{String(index + 1).padStart(2, "0")}</span>
            <strong>{work.title}</strong>
          </button>
        ))}
      </div>
    </figure>
  )
}
