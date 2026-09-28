import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ArrowUpRight, Phone } from "lucide-react"
import { SignatureMark } from "@/components/brand/signature-mark"
import { BrambleSite } from "@/components/homepage/bramble/bramble-site"
import { StorefrontDefs } from "@/components/homepage/bramble/storefront"
import { CallScene, FullTranscript } from "@/components/homepage/call-scene"
import { CaptureScene } from "@/components/homepage/capture-scene"
import { CustomerQuestions } from "@/components/homepage/customer-questions"
import { DemoQr } from "@/components/homepage/demo-qr"
import { BrowserFrame, PhoneFrame } from "@/components/homepage/device-frames"
import { exampleSerif, siteSans } from "@/components/homepage/fonts"
import { HomepageMotion } from "@/components/homepage/homepage-motion"
import { SiteFooter } from "@/components/homepage/site-footer"
import { SiteHeader } from "@/components/homepage/site-header"
import { ProjectInquiryForm } from "@/components/project-inquiry-form"
import { DemoFinePrint } from "@/components/receptionist/receptionist-sections"
import { captureTerms, projectSteps, questions } from "@/lib/homepage/content"
import { receptionistDemo } from "@/lib/receptionist/demo"
import "@/components/homepage/home.css"

const nav = [
  { href: "#websites", label: "Websites" },
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

const pad = (index: number) => String(index + 1).padStart(2, "0")

export function MountlineHomepage() {
  return (
    <div className={`mountline-marketing mountline-homepage ml-site ${siteSans.variable} ${exampleSerif.variable}`}>
      <StorefrontDefs />
      <HomepageMotion movedAnchors={movedAnchors} />
      <a href="#main-content" className="ml-skip">Skip to content</a>
      <SiteHeader nav={nav} ctaHref="#contact" ctaLabel="Talk about your project" ctaShortLabel="Contact" />

      <main id="main-content" tabIndex={-1}>
        {/* The promise, and the work that backs it up. */}
        <section className="hp-hero" aria-labelledby="hero-title">
          <div className="ml-container hp-hero__text">
            <h1 id="hero-title" className="hp-hero__title">A better website for the business you’ve built.</h1>
            <div className="hp-hero__side">
              <p className="hp-hero__lede">
                We design and build websites for local businesses. We can also help with photos, video, and the calls
                your team can’t answer.
              </p>
              <div className="hp-hero__actions">
                <a href="#contact" className="ml-btn ml-btn--solid">
                  Talk about your project <ArrowRight aria-hidden="true" />
                </a>
                <a href="#websites" className="ml-btn ml-btn--line">See the example up close</a>
              </div>
            </div>
          </div>

          <figure className="hp-hero__stage" aria-labelledby="hero-example">
            <div className="ml-container hp-hero__stage-inner">
              <span className="hp-tag hp-hero__label" aria-hidden="true">Design example — not a client project</span>
              <BrowserFrame className="hp-hero__browser">
                <BrambleSite view="desktop" />
              </BrowserFrame>
              <PhoneFrame className="hp-hero__phone">
                <BrambleSite view="mobile" />
              </PhoneFrame>
            </div>
            <figcaption id="hero-example" className="ml-container hp-hero__caption">
              <strong>Design example — not a client project.</strong>
              <span>
                Bramble is a made-up dog groomer in Keller. We designed its website, on a computer and a phone, to show
                the kind of work we do.
              </span>
            </figcaption>
          </figure>
        </section>

        {/* Websites: the same example, from a customer's side. */}
        <section className="hp-section hp-websites" id="websites" aria-labelledby="websites-title">
          <div className="ml-container">
            <div className="hp-websites__head">
              <div>
                <p className="hp-kicker">Websites</p>
                <h2 id="websites-title" className="hp-h2">Customers find what they came for.</h2>
              </div>
              <p className="hp-lede">
                Most people visit a local business’s website with one simple question. A good site answers it in a few
                seconds, on whatever screen they’re holding. Here’s Bramble again, from a customer’s side.
              </p>
            </div>
            <CustomerQuestions />
            <div className="hp-websites__foot">
              <a href="#contact" data-interest="website" className="ml-btn ml-btn--solid">
                Talk about your website <ArrowRight aria-hidden="true" />
              </a>
              <p>We write the words with you, design it, build it, and help with changes after it’s live.</p>
            </div>
          </div>
        </section>

        {/* Capture: the real place, on the page. An optional add-on. */}
        <section className="hp-section hp-capture" id="capture" aria-labelledby="capture-title">
          <div className="ml-container">
            <div className="hp-capture__head">
              <div>
                <p className="hp-kicker">Mountline Capture · optional</p>
                <h2 id="capture-title" className="hp-h2">Photos and video of the real place.</h2>
              </div>
              <p className="hp-lede">
                While we build your website, we can also photograph and film the business itself: the front door, the
                people, the work, and the details regulars notice. Then it goes straight into the design.
              </p>
            </div>
            <CaptureScene />
            <div className="hp-capture__foot">
              <ul className="hp-capture__terms">
                {captureTerms.map((item) => <li key={item}>{item}</li>)}
              </ul>
              <div className="hp-capture__ask">
                <p>Capture is new, so we’ll talk through what’s possible for your business first.</p>
                <a href="#contact" data-interest="capture" className="ml-btn ml-btn--line">
                  Ask about Capture <ArrowRight aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* The receptionist: one call, told plainly. */}
        <section className="hp-section hp-reception" id="receptionist" aria-labelledby="receptionist-title">
          <div className="ml-container">
            <div className="hp-reception__head">
              <div>
                <p className="hp-kicker">AI receptionist</p>
                <h2 id="receptionist-title" className="hp-h2">Help with the calls you can’t answer.</h2>
              </div>
              <p className="hp-lede">
                When nobody can get to the phone, an AI receptionist answers for your business, asks the few questions
                you choose, and sends your team a clear message. It says it’s an AI receptionist, and when it doesn’t
                know something, it says so. Your team still confirms prices and times.
              </p>
            </div>

            <div id="product" data-illustrative>
              <CallScene note="An example call to a fictional business, with made-up caller details. Not live customer data." />
            </div>

            <div className="hp-reception__line" id="demo">
              <div className="hp-reception__call">
                <p className="hp-reception__label">
                  <Phone aria-hidden="true" /> The real demo line · a live AI receptionist
                </p>
                <a href={receptionistDemo.phoneHref} className="hp-reception__number" aria-label={`Call the demo line at ${receptionistDemo.displayPhone}`}>
                  {receptionistDemo.displayPhone}
                </a>
                <p className="hp-reception__try">
                  Call it and try a question. It answers as North Texas Air &amp; Heat, a made-up HVAC company.
                </p>
                <DemoFinePrint className="hp-reception__fine" />
              </div>
              <div className="hp-reception__qr">
                <DemoQr className="hp-reception__qr-code" />
                <p>On a computer? Scan to call from your phone.</p>
              </div>
              <div className="hp-reception__more">
                <FullTranscript />
                <p className="hp-reception__links">
                  <Link href="/receptionist" className="ml-link">How the receptionist works <ArrowUpRight aria-hidden="true" /></Link>
                  <a href="#contact" data-interest="receptionist" className="ml-link">Ask about the receptionist</a>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Who you'll work with, and how it goes. */}
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
                Mountline is a small studio in Keller, Texas, run by Luke Nordin. Luke answers your message, plans the
                site with you, and builds it, so you always know who’s doing the work.
              </p>
              <p className="hp-about__sign">
                <span>Luke Nordin, founder</span>
                <a href="mailto:hello@mountline.dev" className="ml-link">hello@mountline.dev</a>
              </p>
            </div>
          </div>

          <div className="ml-container hp-process-wrap" id="process">
            <h3 className="hp-process__title">How a project goes</h3>
            <ol className="hp-process">
              {projectSteps.map((step, index) => (
                <li key={step.title}>
                  <span className="hp-process__index" aria-hidden="true">{pad(index)}</span>
                  <h4>{step.title}</h4>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Questions */}
        <section className="hp-section hp-faq" id="faq" aria-labelledby="faq-title">
          <div className="ml-container ml-faq">
            <div className="ml-head ml-faq__head">
              <h2 id="faq-title">Questions</h2>
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

        {/* The signature, then the invitation. */}
        <section className="hp-final" aria-labelledby="contact-title">
          <div className="hp-final__mark">
            <SignatureMark />
          </div>
          <div className="ml-container hp-final__grid" id="contact">
            <div className="hp-final__copy">
              <h2 id="contact-title" className="hp-h2">Tell us about your business.</h2>
              <p>
                A few sentences is plenty: what you do, what you’d like help with, and anything that isn’t working now.
                It comes straight to Luke, who replies by email.
              </p>
              <ul className="hp-final__notes">
                <li>No commitment. Scope and price come in writing before you decide anything.</li>
                <li>
                  Prefer email? <a href="mailto:hello@mountline.dev" className="ml-link">hello@mountline.dev</a>
                </li>
                <li>
                  Want to hear the receptionist first?{" "}
                  <a href={receptionistDemo.phoneHref} className="ml-link">Call {receptionistDemo.displayPhone}</a>
                </li>
              </ul>
            </div>
            <div className="hp-final__form">
              <ProjectInquiryForm id="project" />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
