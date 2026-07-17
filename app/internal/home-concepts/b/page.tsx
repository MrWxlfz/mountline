import Image from "next/image"
import { PhoneCall } from "lucide-react"
import { workShowcase } from "@/lib/homepage-content"

const featured = workShowcase.slice(0, 3)
const hero = workShowcase[0]

export default function ConceptB() {
  return (
    <div className="hc-b">
      <header className="hc-b-header">
        <div className="hc-shell">
          <strong>mountline</strong>
          <nav className="hc-b-nav">
            <a href="#work">Work</a>
            <a href="#capability">What we build</a>
            <a href="#">How it works</a>
            <a href="#">About</a>
          </nav>
          <a href="#" className="hc-b-cta">Show us your business</a>
        </div>
      </header>

      <main>
        <section className="hc-b-hero">
          <div className="hc-shell hc-b-hero-grid">
            <div>
              <h1>Make your business easier to choose—and easier to run.</h1>
              <p>
                Mountline builds exceptional websites and practical systems that
                help customers call, book, buy and get answers.
              </p>
              <div className="hc-b-jobs">
                <span>Websites</span>
                <span>Missed-call follow-up</span>
                <span>Booking</span>
                <span>Client portals</span>
                <span>Custom tools</span>
              </div>
              <a href="#" className="hc-b-cta">Show us your business</a>
            </div>

            <div className="hc-b-hero-visual">
              <div className="hc-b-hero-main">
                <Image
                  src={hero.image || "/placeholder.svg"}
                  alt={hero.imageAlt}
                  fill
                  className="object-cover object-top"
                  sizes="(max-width: 900px) 94vw, 44rem"
                />
              </div>
              <div className="hc-b-hero-side">
                <div className="hc-b-hero-phone">
                  <Image
                    src={hero.mobileImage || "/placeholder.svg"}
                    alt=""
                    fill
                    className="object-cover object-top"
                    sizes="200px"
                  />
                </div>
                <div className="hc-b-action-card">
                  <PhoneCall size={16} aria-hidden="true" />
                  <div>
                    <small>Customer action</small>
                    <strong>Call ahead</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="work" className="hc-b-work">
          <div className="hc-shell">
            <h2>Different businesses need different websites.</h2>
            <p>
              The design starts with how the business earns trust and what
              customers need next.
            </p>
            <div className="hc-b-work-row">
              {featured.map((item) => (
                <article key={item.id} className="hc-b-work-card">
                  <div className="hc-b-work-img">
                    <Image
                      src={item.image || "/placeholder.svg"}
                      alt={item.imageAlt}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 860px) 90vw, 24rem"
                    />
                  </div>
                  <strong>{item.title}</strong>
                  <span>{item.category}</span>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="capability" className="hc-b-capability">
          <div className="hc-shell">
            <div className="hc-b-cap-panel">
              <div className="hc-b-cap-copy">
                <h2>Customers should not need a treasure map to contact you.</h2>
                <p>
                  Mountline can answer common questions from real business
                  information, collect callback details, and hand the conversation
                  to a person the moment they want one.
                </p>
              </div>
              <div className="hc-b-cap-scene">
                <div className="hc-b-chat">Do you work in my area?</div>
                <div className="hc-b-chat is-reply">
                  Yes—your address is inside the listed service area. Want help
                  with a request?
                </div>
                <div className="hc-b-chat">Yes! Tuesday afternoon works.</div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
