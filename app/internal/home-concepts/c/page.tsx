"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight, ArrowUpRight, Check, CircleDot, MapPin, MessageSquareText, PhoneCall, PhoneMissed } from "lucide-react"
import { concepts, heroCopy } from "../concept-data"

const modes = [
  {
    id: "website",
    title: "Better website",
    sub: "Clear services, location and one obvious action.",
    rows: [
      { icon: "map", small: "Customer sees", strong: "Services, hours, location", tag: "Clear" },
      { icon: "phone", small: "Customer action", strong: "Call, visit or order", tag: "One tap", offset: 1 },
    ],
  },
  {
    id: "leads",
    title: "Calls and follow-up",
    sub: "Make the first response happen and keep it moving.",
    rows: [
      { icon: "missed", small: "Missed call", strong: "New estimate inquiry", tag: "10:42" },
      { icon: "msg", small: "First response", strong: "Sent with the next step", tag: "Done", offset: 1 },
      { icon: "phone", small: "Team view", strong: "Callback assigned", tag: "Open", offset: 2 },
    ],
  },
  {
    id: "workflow",
    title: "Workflow or custom system",
    sub: "Request in, status clear, approval out.",
    rows: [
      { icon: "dot", small: "Request", strong: "Customer details received", tag: "New" },
      { icon: "dot", small: "Status", strong: "Ready for approval", tag: "Active", offset: 1 },
      { icon: "check", small: "Result", strong: "Approved and assigned", tag: "Done", offset: 2 },
    ],
  },
]

function RowIcon({ kind }: { kind: string }) {
  if (kind === "phone") return <PhoneCall className="size-4" />
  if (kind === "missed") return <PhoneMissed className="size-4" />
  if (kind === "msg") return <MessageSquareText className="size-4" />
  if (kind === "map") return <MapPin className="size-4" />
  if (kind === "check") return <Check className="size-4" />
  return <CircleDot className="size-4" />
}

export default function ConceptC() {
  const [active, setActive] = useState(1)
  const hero = concepts[0]
  const mode = modes[active]

  return (
    <div className="cx cx-c">
      <span className="cx-flag">Concept C · Mountline signature</span>

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

      <section className="cxc-hero">
        <div className="cx-shell cxc-hero-grid">
          <div>
            <p className="cx-eyebrow">{heroCopy.eyebrow}</p>
            <h1 className="text-balance">{heroCopy.headline}</h1>
            <p className="lede text-pretty">{heroCopy.lede}</p>
            <div className="cxc-actions">
              <a className="cxc-btn cxc-btn--primary" href="#">{heroCopy.primary} <ArrowRight className="size-4" /></a>
              <a className="cxc-btn cxc-btn--ghost" href="#work">{heroCopy.secondary}</a>
            </div>
            <p className="cxc-trust">{heroCopy.trust}</p>
          </div>

          <figure className="cxc-stage">
            <div className="cxc-stage-bar">
              <span><i />Selected Mountline work</span>
              <span>01 / 04</span>
            </div>
            <div className="cxc-stage-frame">
              <Image src={hero.image} alt={`${hero.title} concept`} fill sizes="(max-width: 960px) 90vw, 50vw" priority />
              <div className="cxc-stage-phone">
                <Image src={hero.mobile} alt="" fill sizes="120px" />
              </div>
              <div className="cxc-action">
                <span className="ico"><MapPin className="size-4" /></span>
                <span><small>Clear next move</small><strong>{hero.action}</strong></span>
              </div>
            </div>
          </figure>
        </div>
      </section>

      <section id="work" className="cxc-bench" style={{ paddingBottom: 0 }}>
        <div className="cx-shell">
          <p className="cx-eyebrow">Real Mountline work</p>
          <h2 className="text-balance">Different businesses need different websites.</h2>
          <div className="cxa-work-layout" style={{ marginTop: "2.5rem", display: "grid", gap: "2rem" }}>
            <div className="cxb-work-rail" style={{ marginTop: 0 }}>
              {concepts.map((c) => (
                <article key={c.id} className="cxb-work-card" style={{ background: "var(--surface)", borderColor: "var(--line)" }}>
                  <div className="img">
                    <Image src={c.image} alt={`${c.title} concept`} fill sizes="(max-width: 900px) 78vw, 32vw" />
                  </div>
                  <div className="body">
                    <h3 style={{ color: "var(--ink)" }}>{c.title}</h3>
                    <p style={{ color: "var(--body)" }}>{c.objective}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section id="build" className="cxc-bench">
        <div className="cx-shell">
          <p className="cx-eyebrow">Start with the problem</p>
          <h2 className="text-balance">Start with the problem. Build the useful part.</h2>
          <div className="cxc-bench-shell">
            <div className="cxc-bench-top">
              <span>Mountline starting point</span>
              <span>Choose the closest problem</span>
            </div>
            <div className="cxc-bench-body">
              <div className="cxc-bench-modes" role="tablist" aria-label="Starting points">
                {modes.map((m, i) => (
                  <button key={m.id} role="tab" aria-selected={i === active} className={i === active ? "is-active" : undefined} onClick={() => setActive(i)}>
                    <span className="cxc-knob" aria-hidden />
                    <span><strong>{m.title}</strong><small>{m.sub}</small></span>
                    <span className="cxc-dot" aria-hidden />
                  </button>
                ))}
              </div>
              <div className="cxc-bench-scene" aria-live="polite">
                {mode.rows.map((r, i) => (
                  <div key={i} className={`cxc-row${r.offset ? ` offset-${r.offset}` : ""}`}>
                    <span className="ico"><RowIcon kind={r.icon} /></span>
                    <span><small>{r.small}</small><strong>{r.strong}</strong></span>
                    <span className="tag">{r.tag}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="cxc-founder">
        <div className="cx-shell cxc-founder-grid">
          <figure className="cxc-founder-photo">
            <Image src="/luke-profile.jpg" alt="Luke Nordin, founder of Mountline" fill sizes="(max-width: 860px) 60vw, 22rem" />
          </figure>
          <div>
            <p className="cx-eyebrow">Founder-led</p>
            <h2 className="text-balance">Direct communication. Clear responsibility.</h2>
            <p className="text-pretty">You work directly with the person responsible for understanding, designing and building the project. Mountline is founder-led in Keller, Texas.</p>
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
