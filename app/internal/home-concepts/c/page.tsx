"use client"

import { useState, type CSSProperties } from "react"
import Image from "next/image"
import { ArrowRight, Check, PhoneMissed } from "lucide-react"
import { heroWork, workShowcase } from "@/lib/homepage-content"

export default function ConceptC() {
  const [heroIndex, setHeroIndex] = useState(0)
  const [workIndex, setWorkIndex] = useState(0)
  const hero = heroWork[heroIndex]
  const work = workShowcase[workIndex]

  return (
    <div className="hc-c">
      <header className="hc-c-header">
        <div className="hc-shell">
          <strong>mountline</strong>
          <nav className="hc-c-nav">
            <a href="#work">Work</a>
            <a href="#capability">What we build</a>
            <a href="#">How it works</a>
            <a href="#">About</a>
          </nav>
          <a href="#" className="hc-c-cta">Show us your business</a>
        </div>
      </header>

      <main>
        <section className="hc-c-hero">
          <div className="hc-shell hc-c-hero-grid">
            <div>
              <p className="hc-c-eyebrow">Websites and practical systems for real businesses</p>
              <h1>Make your business easier to choose—and easier to run.</h1>
              <p className="hc-c-hero-lede">
                Mountline builds exceptional websites and practical systems that
                help customers call, book, buy and get answers. Start with a
                focused site, or add the useful systems around it.
              </p>
              <div className="hc-c-hero-actions">
                <a href="#" className="hc-c-btn-primary">
                  Show us your business <ArrowRight size={15} aria-hidden="true" />
                </a>
                <a href="#work" className="hc-c-btn-quiet">See the work</a>
              </div>
              <p className="hc-c-trust">Founder-led in Keller, Texas.</p>
            </div>

            <figure
              className="hc-c-stage"
              style={{ "--stage-tint": hero.accentSoft } as CSSProperties}
            >
              <div className="hc-c-stage-world">
                <div className="hc-c-stage-browser">
                  <div className="hc-c-stage-browser-bar">
                    <i /><i /><i />
                    <span>{hero.title}</span>
                  </div>
                  <span className="hc-c-stage-browser-img">
                    <Image
                      src={hero.image || "/placeholder.svg"}
                      alt={hero.imageAlt}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 980px) 94vw, 40rem"
                    />
                  </span>
                </div>
                <div className="hc-c-stage-phone" aria-hidden="true">
                  <span className="hc-c-stage-phone-img">
                    <Image
                      src={hero.mobileImage || "/placeholder.svg"}
                      alt=""
                      fill
                      className="object-cover object-top"
                      sizes="160px"
                    />
                  </span>
                </div>
                <div className="hc-c-stage-action" aria-hidden="true">
                  <i />
                  <div>
                    <small>Clear next move</small>
                    <strong>{hero.action}</strong>
                  </div>
                </div>
              </div>

              <div className="hc-c-stage-selector" role="tablist" aria-label="Featured work">
                {heroWork.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={index === heroIndex}
                    className={index === heroIndex ? "is-active" : undefined}
                    onClick={() => setHeroIndex(index)}
                  >
                    {item.title}
                  </button>
                ))}
              </div>
              <figcaption className="hc-c-stage-caption">
                <span>{hero.category}</span>
                <span>Concept preview by Mountline</span>
              </figcaption>
            </figure>
          </div>
        </section>

        <section id="work" className="hc-c-work">
          <div className="hc-shell hc-c-work-grid">
            <div className="hc-c-work-rail">
              <h2>Different businesses need different websites.</h2>
              <p>
                The design starts with how the business earns trust and what
                customers need next.
              </p>
              <div className="hc-c-work-list" role="tablist" aria-label="All work">
                {workShowcase.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    role="tab"
                    aria-selected={index === workIndex}
                    className={index === workIndex ? "is-active" : undefined}
                    onClick={() => setWorkIndex(index)}
                  >
                    {item.title}
                    <span>{String(index + 1).padStart(2, "0")}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="hc-c-work-stage">
              <div className="hc-c-work-stage-img">
                <Image
                  src={work.image || "/placeholder.svg"}
                  alt={work.imageAlt}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 980px) 94vw, 48rem"
                />
              </div>
              <div className="hc-c-work-stage-meta">
                <strong>{work.title}</strong>
                <span>{work.category}</span>
              </div>
            </div>
          </div>
        </section>

        <section id="capability" className="hc-c-capability">
          <div className="hc-shell">
            <h2>And yeah—we do a lot more.</h2>
            <p>
              The best system is not always a giant app. Sometimes it is one
              annoying part of the day finally working properly.
            </p>
            <div className="hc-c-mosaic">
              <article className="hc-c-tile-coral">
                <h3>Receptionist and callback systems</h3>
                <p>Missed the call? The opportunity should not disappear with it.</p>
                <div className="hc-c-tile-steps">
                  <div><PhoneMissed size={14} aria-hidden="true" /> Missed call — new service question</div>
                  <div><Check size={14} aria-hidden="true" /> Acknowledgement sent automatically</div>
                  <div><Check size={14} aria-hidden="true" /> Callback assigned to the team</div>
                </div>
              </article>
              <article className="hc-c-tile-dark">
                <div>
                  <h3>Client portals</h3>
                  <p>One place for status, feedback, payments, and support.</p>
                </div>
                <div className="hc-c-tile-dark-img">
                  <Image
                    src="/work-previews/client-portal.png"
                    alt="Mountline client portal preview"
                    fill
                    className="object-cover object-top"
                    sizes="(max-width: 980px) 94vw, 28rem"
                  />
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
