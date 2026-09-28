import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { CallScene } from "@/components/homepage/call-scene"
import { CallStack } from "@/components/homepage/call-stack"
import { siteSans } from "@/components/homepage/fonts"
import { HomepageMotion } from "@/components/homepage/homepage-motion"
import { SiteFooter } from "@/components/homepage/site-footer"
import { SiteHeader } from "@/components/homepage/site-header"
import { TradeExplorer } from "@/components/homepage/trade-explorer"
import { ProjectInquiryForm } from "@/components/project-inquiry-form"
import { CallItSection, ContextNote, ControlSection, PilotSection, TestingSection } from "@/components/receptionist/receptionist-sections"
import { receptionistLayers, receptionistQuestions, trades } from "@/lib/homepage/content"
import { receptionistDemo } from "@/lib/receptionist/demo"

const nav = [
  { href: "#how", label: "How it works" },
  { href: "#demo", label: "Demo line" },
  { href: "#pilot", label: "Pilot" },
  { href: "#faq", label: "Questions" },
] as const

function SectionHead({ id, title, children }: { id: string; title: React.ReactNode; children?: React.ReactNode }) {
  return (
    <div className="ml-head" data-mtl-reveal>
      <h2 id={id}>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  )
}

export function ReceptionistPage() {
  return (
    <div className={`mountline-marketing mountline-homepage ml-site ${siteSans.variable}`}>
      <HomepageMotion />
      <a href="#main-content" className="ml-skip">Skip to content</a>
      <SiteHeader nav={nav} ctaHref="#contact" ctaLabel="Ask about a pilot" ctaShortLabel="Contact" />

      <main id="main-content" tabIndex={-1}>
        <section className="ml-hero ml-hero--service" aria-labelledby="hero-title">
          <div className="ml-container">
            <p className="ml-crumb"><Link href="/" className="ml-link">Mountline</Link> <span aria-hidden="true">/</span> AI receptionist</p>
            <h1 id="hero-title" className="ml-hero__title">
              <span className="ml-hero__line"><span>The receptionist for</span></span>{" "}
              <span className="ml-hero__line"><span>the calls you can’t take.</span></span>
            </h1>
            <p className="ml-hero__lede">
              Mountline answers missed and after-hours calls, asks the questions you choose, and leaves your team a clear
              request to follow up on.
            </p>
            <div className="ml-hero__foot">
              <div className="ml-hero__actions">
                <a href="#demo" className="ml-btn ml-btn--solid">Try the demo line <ArrowRight aria-hidden="true" /></a>
                <a href="#contact" className="ml-btn ml-btn--line">Ask about a pilot</a>
              </div>
              <a href={receptionistDemo.phoneHref} className="ml-hero__number" aria-label={`Call the demo line at ${receptionistDemo.displayPhone}`}>
                <i aria-hidden="true" />
                <span className="ml-hero__number-label">Demo line</span>
                <span className="ml-hero__number-value">{receptionistDemo.displayPhone}</span>
              </a>
            </div>
          </div>
        </section>

        <section className="ml-section ml-showcase" id="product" aria-labelledby="product-title">
          <div className="ml-container">
            <SectionHead id="product-title" title="Watch it take a call.">
              It’s 6:48 on a weeknight and the office is closed. A customer calls anyway. Here’s what Mountline does with it.
            </SectionHead>
            <div data-illustrative>
              <CallScene note="An example call to a fictional business, with made-up caller details. Not live customer data." />
            </div>
          </div>
        </section>

        <section className="ml-section ml-section--split" id="how" aria-labelledby="how-title">
          <div className="ml-container">
            <CallStack
              steps={receptionistLayers}
              intro={
                <SectionHead id="how-title" title={<>Built around the phone line you <em>already</em> have.</>}>
                  Nothing about how customers reach you has to change. Mountline sits between your number and your team.
                </SectionHead>
              }
            />
          </div>
        </section>

        <ControlSection />

        <section className="ml-section" id="trades" aria-labelledby="trades-title">
          <div className="ml-container">
            <TradeExplorer
              trades={trades}
              intro={
                <SectionHead id="trades-title" title="Every trade gets different calls.">
                  So the questions change with the work. Pick a trade to see what Mountline would ask, and what your team
                  would get back.
                </SectionHead>
              }
            />
          </div>
        </section>

        <CallItSection />
        <TestingSection />
        <ContextNote />
        <PilotSection />

        <section className="ml-section ml-faq-section" id="faq" aria-labelledby="faq-title">
          <div className="ml-container ml-faq">
            <div className="ml-head ml-faq__head" data-mtl-reveal>
              <h2 id="faq-title">Questions</h2>
              <p>
                Short answers about the receptionist. If yours isn’t here,{" "}
                <a href="mailto:hello@mountline.dev" className="ml-link">ask us directly</a>.
              </p>
            </div>
            <div className="ml-faq__items">
              {receptionistQuestions.map((item) => (
                <details key={item.q}>
                  <summary>
                    {item.q}
                    <i aria-hidden="true" />
                  </summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ml-section ml-final" id="contact" aria-labelledby="contact-title">
          <div className="ml-container ml-final__grid">
            <div className="ml-final__copy" data-mtl-reveal>
              <h2 id="contact-title">Tell us what happens when <em>nobody</em> can answer.</h2>
              <p>A few sentences is plenty: who answers now, when calls get missed, and what you’d like help with.</p>
              <ul className="ml-final__notes">
                <li>No commitment. Scope and price come in writing before you decide anything.</li>
                <li>Prefer email? <a href="mailto:hello@mountline.dev" className="ml-link">hello@mountline.dev</a></li>
                <li>Want to hear it first? <a href={receptionistDemo.phoneHref} className="ml-link">Call the demo line at {receptionistDemo.displayPhone}</a></li>
              </ul>
            </div>
            <div className="ml-final__form">
              <ProjectInquiryForm id="pilot-inquiry" defaultInterests={["receptionist"]} />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
