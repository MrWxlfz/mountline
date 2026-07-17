"use client"

import { useState } from "react"
import Image from "next/image"
import { ArrowRight } from "lucide-react"
import { heroWork, workShowcase } from "@/lib/homepage-content"

const capabilities = [
  ["Receptionist and callbacks", "Missed calls get an acknowledgement, and the right person gets the callback."],
  ["Customer support", "Grounded answers from real business information, with a person close by."],
  ["Booking and intake", "Collect the right details before the next conversation begins."],
  ["Client portals", "One place for status, feedback, payments, and support."],
  ["Internal operations", "Leads, tasks, and next actions stay visible."],
  ["Custom software", "Focused tools for the one workflow that should be easier."],
] as const

export default function ConceptA() {
  const [active, setActive] = useState(0)
  const work = heroWork[active]

  return (
    <div className="hc-a">
      <header className="hc-a-header">
        <div className="hc-shell">
          <strong>mountline</strong>
          <nav className="hc-a-nav">
            <a href="#work">Work</a>
            <a href="#capability">What we build</a>
            <a href="#">How it works</a>
            <a href="#">About</a>
          </nav>
          <a href="#" className="hc-a-cta">Show us your business</a>
        </div>
      </header>

      <main>
        <section className="hc-a-hero">
          <div className="hc-shell hc-a-hero-copy">
            <h1>Make your business easier to choose—and easier to run.</h1>
            <p>
              Mountline builds exceptional websites and practical systems that help
              customers call, book, buy and get answers. Start with a focused site,
              or add the useful systems around it.
            </p>
            <div className="hc-a-hero-actions">
              <a href="#" className="hc-a-button-primary">
                Show us your business <ArrowRight size={15} aria-hidden="true" />
              </a>
              <a href="#work" className="hc-a-button-ghost">See the work</a>
            </div>
            <p className="hc-a-trust">Founder-led in Keller, Texas.</p>
          </div>

          <div className="hc-a-scene">
            <div className="hc-shell hc-a-scene-inner">
              <div className="hc-a-browser">
                <div className="hc-a-browser-bar">
                  <i /><i /><i />
                  <span>{work.title}</span>
                </div>
                <span className="hc-a-browser-img">
                  <Image
                    src={work.image || "/placeholder.svg"}
                    alt={work.imageAlt}
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 767px) 94vw, 62rem"
                  />
                </span>
                <div className="hc-a-phone" aria-hidden="true">
                  <span className="hc-a-phone-img">
                    <Image
                      src={work.mobileImage || "/placeholder.svg"}
                      alt=""
                      fill
                      className="object-cover object-top"
                      sizes="190px"
                    />
                  </span>
                </div>
              </div>
            </div>
            <div className="hc-a-selector" role="tablist" aria-label="Featured work">
              {heroWork.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  aria-selected={index === active}
                  className={index === active ? "is-active" : undefined}
                  onClick={() => setActive(index)}
                >
                  {item.title}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section id="work" className="hc-a-work">
          <div className="hc-shell">
            <div className="hc-a-work-head">
              <h2>Different businesses need different websites.</h2>
              <p>
                A restaurant, groomer, barber and service company should not be
                forced into the same template.
              </p>
            </div>
            <div className="hc-a-work-grid">
              {workShowcase.slice(0, 4).map((item) => (
                <article key={item.id} className="hc-a-work-card">
                  <div className="hc-a-work-img">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.imageAlt}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 720px) 94vw, 38rem"
                    />
                  </div>
                  <div className="hc-a-work-meta">
                    <strong>{item.title}</strong>
                    <span>{item.category}</span>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="capability" className="hc-a-capability">
          <div className="hc-shell">
            <h2>And yeah—we do a lot more.</h2>
            <div className="hc-a-cap-rows">
              {capabilities.map(([title, copy]) => (
                <div key={title} className="hc-a-cap-row">
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
