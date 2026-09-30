import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Phone } from "lucide-react"
import { SignatureMark } from "@/components/brand/signature-mark"
import { BrambleSite } from "@/components/homepage/bramble/bramble-site"
import { BuildTestRefine } from "@/components/homepage/build-test-refine"
import { CaptureScene } from "@/components/homepage/capture-scene"
import { ClientResults } from "@/components/homepage/client-results"
import { CustomerViews } from "@/components/homepage/customer-views"
import { DemoQr } from "@/components/homepage/demo-qr"
import { BrowserFrame, PhoneFrame } from "@/components/homepage/device-frames"
import { exampleSerif } from "@/components/homepage/fonts"
import { HomepageMotion } from "@/components/homepage/homepage-motion"
import { SiteFooter } from "@/components/homepage/site-footer"
import { SiteHeader } from "@/components/homepage/site-header"
import { TheDifference } from "@/components/homepage/the-difference"
import { ProjectInquiryForm } from "@/components/project-inquiry-form"
import { CallConsole, FullTranscript } from "@/components/receptionist/call-console"
import { DemoLimits } from "@/components/receptionist/receptionist-sections"
import { captureTerms, nextSteps, questions } from "@/lib/homepage/content"
import { receptionistDemo } from "@/lib/receptionist/demo"
import { isWebDemoAvailable } from "@/lib/receptionist/web-demo/config"
import "@/components/homepage/home.css"

const nav = [
  { href: "#websites", label: "Websites" },
  { href: "#process", label: "How we work" },
  { href: "#capture", label: "Capture" },
  { href: "#receptionist", label: "Receptionist" },
  { href: "#company", label: "About" },
] as const

// Receptionist sections that used to live here. Old links keep working.
const movedAnchors = {
  how: "/receptionist#how",
  control: "/receptionist#control",
  trades: "/receptionist#trades",
  testing: "/receptionist#testing",
  gap: "/receptionist#context",
  pilot: "/receptionist#pilot",
}

const EXAMPLE_LABEL = "Example business · Design demonstration"

export function MountlineHomepage() {
  // Read on the server at build time; only the yes/no reaches the browser.
  const liveDemo = isWebDemoAvailable()

  return (
    <div className={`mountline-marketing mountline-homepage ml-site ${exampleSerif.variable}`}>
      <HomepageMotion movedAnchors={movedAnchors} />
      <a href="#main-content" className="ml-skip">Skip to content</a>
      <SiteHeader nav={nav} ctaHref="#contact" ctaLabel="Talk about your project" ctaShortLabel="Contact" />

      <main id="main-content" tabIndex={-1}>
        {/* The promise, and the kind of work that backs it up. */}
        <section className="hp-hero" aria-labelledby="hero-title">
          <div className="hp-hero__grid" aria-hidden="true" />
          <div className="ml-container hp-hero__text">
            <h1 id="hero-title" className="hp-hero__title">
              A better website <span className="hp-hero__break">for the business you’ve built.</span>
            </h1>
            <div className="hp-hero__side">
              <p className="hp-hero__lede">
                Mountline designs and builds websites for local businesses. Show customers what you do, answer their
                first questions, and make it easy to get in touch.
              </p>
              <p className="hp-hero__also">Photos, video, and an AI receptionist are there if you want them.</p>
              <div className="hp-hero__actions">
                <a href="#contact" className="ml-btn ml-btn--solid">
                  Talk about your project <ArrowRight className="ml-btn__go" aria-hidden="true" />
                </a>
                <a href="#websites" className="ml-btn ml-btn--line">See how it helps</a>
              </div>
            </div>
          </div>

          <figure className="hp-hero__stage" aria-labelledby="hero-example">
            <div className="ml-container hp-hero__stage-inner">
              <BrowserFrame className="hp-hero__browser" label={EXAMPLE_LABEL}>
                <BrambleSite view="desktop" eager />
              </BrowserFrame>
              <PhoneFrame className="hp-hero__phone">
                <BrambleSite view="mobile" eager />
              </PhoneFrame>
            </div>
            <figcaption id="hero-example" className="ml-container hp-hero__caption">
              <span className="hp-tag">{EXAMPLE_LABEL}</span>
              <span>Bramble is a made-up dog groomer, shown with licensed sample photos.</span>
            </figcaption>
          </figure>
        </section>

        {/* Websites: the same example, from a customer's side. */}
        <section className="hp-section hp-websites" id="websites" aria-labelledby="websites-title">
          <div className="ml-container">
            <header className="hp-head">
              <div>
                <p className="hp-kicker">Websites</p>
                <h2 id="websites-title" className="hp-h2">Customers find what they came for.</h2>
              </div>
              <p className="hp-lede">
                Most people visit a local business’s website with one simple question. A good site answers it in a few
                seconds, on whatever screen they’re holding.
              </p>
            </header>
            <CustomerViews desktop={<BrambleSite view="desktop" />} phone={<BrambleSite view="mobile" />} />
            <div className="hp-websites__foot">
              <a href="#contact" data-interest="website" className="ml-btn ml-btn--solid">
                Talk about your website <ArrowRight className="ml-btn__go" aria-hidden="true" />
              </a>
              <p>We write the words with you, design it, build it, and help with changes after it’s live.</p>
            </div>
          </div>
        </section>

        {/* How we work, shown on the example business. */}
        <section className="hp-process" id="process" aria-labelledby="process-title">
          <div className="ml-container">
            <header className="hp-head">
              <div>
                <p className="hp-kicker">How we work</p>
                <h2 id="process-title" className="hp-h2">Built, then used the way your customers will use it.</h2>
              </div>
              <p className="hp-lede">Every site goes through the same three steps. Here they are for Bramble.</p>
            </header>
          </div>
          <BuildTestRefine />
        </section>

        {/* What changes for a customer. Real client results appear here only once they exist. */}
        <section className="hp-section hp-difference" id="difference" aria-labelledby="difference-title">
          <div className="ml-container">
            <header className="hp-head">
              <div>
                <p className="hp-kicker">Before and after</p>
                <h2 id="difference-title" className="hp-h2">The difference.</h2>
              </div>
              <p className="hp-lede">
                Same business, same details. What changes is how quickly a customer gets what they came for.
              </p>
            </header>
            <TheDifference label={EXAMPLE_LABEL} />
            <ClientResults />
          </div>
        </section>

        {/* Capture: photos and video of the real place. An optional add-on. */}
        <section className="hp-section hp-capture" id="capture" aria-labelledby="capture-title">
          <div className="ml-container">
            <header className="hp-head">
              <div>
                <p className="hp-kicker">Mountline Capture · optional</p>
                <h2 id="capture-title" className="hp-h2">Photos and video of the real place.</h2>
              </div>
              <p className="hp-lede">
                We can also photograph and film your business for the website: the room, the people, the work, and the
                result. It’s an optional add-on, discussed and priced with the project.
              </p>
            </header>
            <CaptureScene />
            <div className="hp-capture__foot">
              <ul className="hp-capture__terms">
                {captureTerms.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <div className="hp-capture__ask">
                <p>Capture is new, so we’ll talk through what’s possible for your business first.</p>
                <a href="#contact" data-interest="capture" className="ml-btn ml-btn--line">
                  Ask about Capture <ArrowRight className="ml-btn__go" aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* The receptionist: three ways to try it. */}
        <section className="hp-section hp-reception" id="receptionist" aria-labelledby="receptionist-title">
          <div className="ml-container">
            <header className="hp-head">
              <div>
                <p className="hp-kicker">AI receptionist · optional</p>
                <h2 id="receptionist-title" className="hp-h2">Help with the calls you can’t answer.</h2>
              </div>
              <p className="hp-lede">
                When nobody can get to the phone, an AI receptionist answers for your business, asks the few questions
                you choose, and sends your team a clear message. It says it’s an AI, and your team still confirms
                prices and times.
              </p>
            </header>

            <div id="demo" className="hp-reception__console">
              <CallConsole liveAvailable={liveDemo} />
            </div>

            <div className="hp-reception__line">
              <div className="hp-reception__call">
                <p className="ml-label">Or call the demo line from any phone</p>
                <a href={receptionistDemo.phoneHref} className="hp-reception__number" aria-label={`Call the demo line at ${receptionistDemo.displayPhone}`}>
                  {receptionistDemo.displayPhone}
                </a>
                <a href={receptionistDemo.phoneHref} className="ml-btn ml-btn--solid hp-reception__tap">
                  <Phone aria-hidden="true" /> Call the demo line
                </a>
                <p className="hp-reception__note">
                  Try our fictional HVAC business. Use made-up details; no real appointments are booked.
                </p>
              </div>
              <div className="hp-reception__qr">
                <DemoQr className="hp-reception__qr-code" />
                <p>On a computer? Scan to call from your phone.</p>
              </div>
              <div className="hp-reception__more">
                <DemoLimits />
                <FullTranscript />
                <p className="hp-reception__links">
                  <Link href="/receptionist" className="ml-link">How the receptionist works <ArrowUpRight aria-hidden="true" /></Link>
                  <a href="#contact" data-interest="receptionist" className="ml-link">Ask about the receptionist</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who you'll work with. */}
        <section className="hp-section hp-about" id="company" aria-labelledby="company-title">
          <div className="ml-container hp-about__grid">
            <figure className="hp-about__photo">
              <Image
                src="/luke-nordin.jpg"
                alt="Luke Nordin, founder of Mountline, outdoors in a blue checked jacket"
                fill
                sizes="(max-width: 760px) 100vw, 40vw"
              />
            </figure>
            <div className="hp-about__copy">
              <p className="hp-kicker">About</p>
              <h2 id="company-title" className="hp-h2">You’ll work with Luke.</h2>
              <p className="hp-about__lede">
                Mountline is a small studio in Keller, Texas, run by Luke Nordin. Luke reads your message, plans the
                site with you, and builds it, so you always know who’s doing the work.
              </p>
              <p className="hp-about__sign">
                <span>Luke Nordin, founder</span>
                <a href="mailto:hello@mountline.dev" className="ml-link">hello@mountline.dev</a>
              </p>
            </div>
          </div>
        </section>

        {/* Questions */}
        <section className="hp-section hp-faq" id="faq" aria-labelledby="faq-title">
          <div className="ml-container ml-faq">
            <div className="ml-head ml-faq__head">
              <h2 id="faq-title" className="hp-h2">Questions</h2>
              <p>
                Short answers. If yours isn’t here,{" "}
                <a href="mailto:hello@mountline.dev" className="ml-link">ask us directly</a>.
              </p>
            </div>
            <div className="ml-faq__items">
              {questions.map((item) => (
                <details key={item.q}>
                  <summary>
                    {item.q}
                    <i aria-hidden="true" />
                  </summary>
                  <p>
                    {item.a}
                    {"link" in item ? <> <Link href={item.link.href} className="ml-link">{item.link.label}</Link>.</> : null}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* The invitation, signed with the word-built mark. */}
        <section className="hp-final" id="contact" aria-labelledby="contact-title">
          <div className="ml-container hp-final__grid">
            <div className="hp-final__intro">
              <h2 id="contact-title" className="hp-h2">Tell us about your business.</h2>
              <p>
                A few sentences is plenty: what you do, what you’d like help with, and anything that isn’t working now.
                It comes straight to Luke, who replies by email.
              </p>
            </div>
            <div className="hp-final__form">
              <ProjectInquiryForm id="project" />
            </div>
            {/* On phones this follows the form, so "Talk about your project" lands next to the first field. */}
            <div className="hp-final__after">
              <ol className="hp-final__next" aria-label="What happens next">
                {nextSteps.map((step, index) => (
                  <li key={step}>
                    <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
                    {step}
                  </li>
                ))}
              </ol>
              <p className="hp-final__alt">
                Prefer email? <a href="mailto:hello@mountline.dev" className="ml-link">hello@mountline.dev</a>
              </p>
            </div>
            {/* The signature, beside the invitation and clear of the form. */}
            <div className="hp-final__mark">
              <SignatureMark />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
