"use client"

import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { concepts, heroCopy } from "../concept-data"

const tiles = [
  { cls: "cxb-tile--coral", title: "Receptionist & callback", copy: "Missed call caught, acknowledged, and assigned for a callback.", state: "Callback assigned" },
  { cls: "cxb-tile--sky", title: "Customer support", copy: "Grounded answers, then a person.", state: "Handed off" },
  { cls: "cxb-tile--lemon", title: "Booking & intake", copy: "Just the details you use.", state: "Request ready" },
  { cls: "cxb-tile--dark", title: "Client portals", copy: "One place for status, files, approvals, payments and support.", state: "Phase: Design" },
  { cls: "cxb-tile--mint", title: "Internal operations", copy: "Leads and tasks with obvious next states.", state: "In progress" },
  { cls: "cxb-tile--lav", title: "Custom software", copy: "Focused connected modules.", state: "Built to fit" },
]

export default function ConceptB() {
  const hero = concepts[0]

  return (
    <div className="cx cx-b">
      <span className="cx-flag">Concept B · Product studio + Notion warmth</span>

      <div className="cx-shell">
        <div className="cx-nav">
          <span className="cx-brand">Mountline</span>
          <nav aria-label="Concept navigation">
            <a href="#work">Work</a>
            <a href="#build">What we build</a>
            <a href="#how">How it works</a>
            <a href="#about">About</a>
          </nav>
          <a className="cx-cta" href="#">Show us your business <ArrowRight className="size-4" /></a>
        </div>
      </div>

      <section className="cxb-hero">
        <div className="cx-shell">
          <p className="cx-eyebrow">{heroCopy.eyebrow}</p>
          <h1 className="text-balance">{heroCopy.headline}</h1>
          <p className="lede text-pretty">{heroCopy.lede}</p>
          <div className="cxb-hero-actions">
            <a className="cxb-tile" style={{ minHeight: 0, background: "var(--signal)", color: "#180a05", padding: "0.82rem 1.35rem", borderRadius: 12, fontWeight: 600, textDecoration: "none" }} href="#">{heroCopy.primary}</a>
            <a className="cx-cta" style={{ background: "transparent", border: "1px solid var(--line)", color: "var(--ink)" }} href="#work">{heroCopy.secondary}</a>
          </div>

          <div className="cxb-scene">
            <div className="cxb-scene-main">
              <Image src={hero.image} alt={`${hero.title} concept`} fill sizes="(max-width: 780px) 90vw, 55vw" priority />
            </div>
            <div className="cxb-scene-side">
              <div className="cxb-chip cxb-chip--coral">
                <small>Missed the call?</small>
                <strong>The opportunity should not disappear with it.</strong>
              </div>
              <div className="cxb-chip cxb-chip--sky">
                <small>One clear action</small>
                <strong>Call, book, or ask a question.</strong>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="work" className="cxb-work">
        <div className="cx-shell">
          <p className="cx-eyebrow">Real Mountline work</p>
          <h2 className="text-balance">A restaurant and a barber should not share a template.</h2>
          <div className="cxb-work-rail">
            {concepts.map((c) => (
              <article key={c.id} className="cxb-work-card">
                <div className="img">
                  <Image src={c.image} alt={`${c.title} concept`} fill sizes="(max-width: 900px) 78vw, 32vw" />
                </div>
                <div className="body">
                  <h3>{c.title}</h3>
                  <p>{c.objective}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="build" className="cxb-cap">
        <div className="cx-shell">
          <p className="cx-eyebrow">Useful systems, right-sized</p>
          <h2>And yeah—we do a lot more.</h2>
          <div className="cxb-mosaic">
            {tiles.map((t) => (
              <article key={t.title} className={`cxb-tile ${t.cls}`}>
                <div>
                  <h3>{t.title}</h3>
                  <p>{t.copy}</p>
                </div>
                <span className="state">{t.state}</span>
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
              <Image src={hero.mobile} alt={`${hero.title} mobile concept`} fill sizes="320px" />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
