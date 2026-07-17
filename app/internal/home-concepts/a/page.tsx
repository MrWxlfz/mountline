"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight, ArrowUpRight, MapPin, PhoneCall } from "lucide-react"
import { concepts, heroCopy } from "../concept-data"

const capabilities = [
  { tag: "Calls", title: "Receptionist & callback", copy: "Catch the missed call, acknowledge it, and route the callback to the right person." },
  { tag: "Answers", title: "Customer support", copy: "Grounded answers from your real services and hours, with a clean handoff to a human." },
  { tag: "Requests", title: "Booking & intake", copy: "Collect only the details the business actually uses, then route the request." },
  { tag: "Built to fit", title: "Custom software", copy: "Portals, dashboards and integrations for the part that should not still be manual." },
]

export default function ConceptA() {
  const [active, setActive] = useState(0)
  const work = concepts[active]

  return (
    <div className="cx cx-a">
      <span className="cx-flag">Concept A · Linear precision</span>

      <div className="cx-shell">
        <div className="cx-nav">
          <span className="cx-brand">Mountline</span>
          <nav aria-label="Concept navigation">
            <a href="#work">Work</a>
            <a href="#build">What we build</a>
            <a href="#how">How it works</a>
            <a href="#about">About</a>
          </nav>
          <a className="cx-cta" href="#">
            Show us your business <ArrowRight className="size-4" />
          </a>
        </div>
      </div>

      <section className="cxa-hero">
        <div className="cx-shell cxa-hero-grid">
          <div>
            <p className="cx-eyebrow">{heroCopy.eyebrow}</p>
            <h1 className="text-balance">{heroCopy.headline}</h1>
            <p className="lede text-pretty">{heroCopy.lede}</p>
            <div className="cxa-actions">
              <a className="cxa-btn cxa-btn--primary" href="#">{heroCopy.primary} <ArrowRight className="size-4" /></a>
              <a className="cxa-btn cxa-btn--ghost" href="#work">{heroCopy.secondary}</a>
            </div>
            <p className="cxa-trust">{heroCopy.trust}</p>
          </div>

          <figure className="cxa-scene">
            <div className="cxa-scene-frame">
              <Image src={work.image} alt={`${work.title} website concept`} fill sizes="(max-width: 960px) 90vw, 45vw" priority />
            </div>
            <div className="cxa-scene-phone">
              <Image src={work.mobile} alt="" fill sizes="120px" />
            </div>
            <figcaption className="cxa-scene-foot">
              <span>{work.title} — concept preview</span>
              <span className="cxa-scene-pill"><PhoneCall className="size-3" /> {work.action}</span>
            </figcaption>
          </figure>
        </div>
      </section>

      <section id="work" className="cxa-work">
        <div className="cx-shell">
          <p className="cx-eyebrow">Real Mountline work</p>
          <h2 className="text-balance">Different businesses need different websites.</h2>
          <div className="cxa-work-layout">
            <div className="cxa-work-list">
              {concepts.map((c, i) => (
                <button key={c.id} className={i === active ? "is-active" : undefined} onClick={() => setActive(i)}>
                  <small>{c.category}</small>
                  <strong>{c.title}</strong>
                </button>
              ))}
            </div>
            <figure className="cxa-work-visual">
              <Image src={work.image} alt={`${work.title} concept`} fill sizes="(max-width: 960px) 90vw, 55vw" />
              <figcaption className="cxa-work-caption">
                <span>{work.objective}</span>
                <span><ArrowUpRight className="size-4" /></span>
              </figcaption>
            </figure>
          </div>
        </div>
      </section>

      <section id="build" className="cxa-cap">
        <div className="cx-shell">
          <p className="cx-eyebrow">Useful systems, right-sized</p>
          <h2>And yeah—we do a lot more.</h2>
          <div className="cxa-cap-grid">
            {capabilities.map((cap) => (
              <article key={cap.title} className="cxa-cap-card">
                <span className="cxa-cap-tag">{cap.tag}</span>
                <div>
                  <h3>{cap.title}</h3>
                  <p>{cap.copy}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="cx-mobiledemo">
        <div className="cx-shell" style={{ textAlign: "center" }}>
          <h2>Mobile treatment</h2>
          <div className="frame">
            <div style={{ position: "relative", aspectRatio: "9 / 19" }}>
              <Image src={work.mobile} alt={`${work.title} mobile concept`} fill sizes="320px" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
