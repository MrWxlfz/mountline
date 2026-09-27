import Image from "next/image"
import { ArrowRight, Check, Phone } from "lucide-react"
import { CallDemo } from "@/components/homepage/call-demo"
import { CallGap } from "@/components/homepage/call-gap"
import { CallStack } from "@/components/homepage/call-stack"
import { DemoQr } from "@/components/homepage/demo-qr"
import { GlyphField } from "@/components/homepage/glyph-field"
import { HomepageMotion } from "@/components/homepage/homepage-motion"
import { Landscape } from "@/components/homepage/landscape"
import { SiteFooter } from "@/components/homepage/site-footer"
import { SiteHeader } from "@/components/homepage/site-header"
import { TestRound } from "@/components/homepage/test-round"
import { TradeExplorer } from "@/components/homepage/trade-explorer"
import { PilotRequestForm } from "@/components/receptionist/pilot-request-form"
import { benchmarkSources } from "@/lib/homepage/benchmarks"
import { controls, flow, pilotSteps, principles, questions, trades, tryPrompts, type ControlExample } from "@/lib/homepage/content"
import { receptionistDemo } from "@/lib/receptionist/demo"

const demoNumber = receptionistDemo.displayPhone
const demoHref = receptionistDemo.phoneHref
const unansweredSource = Object.values(benchmarkSources).findIndex((source) => source.id === benchmarkSources.unanswered.id) + 1

const nav = [
  { href: "#product", label: "How it works" },
  { href: "#demo", label: "Demo" },
  { href: "#pilot", label: "Pilot" },
  { href: "#company", label: "Company" },
] as const

// Each layer answers one practical question: which number, who picks up, what gets written down, who follows up.
const layers = [
  {
    label: "Your number",
    title: "Keep the number you have.",
    body: "No new number to put on the trucks. You choose which calls forward to Mountline: after hours, the ones nobody picks up, or both.",
  },
  {
    label: "The receptionist",
    title: "It answers when your team can’t.",
    body: "It greets callers with your business name, tells them it’s an AI receptionist, and asks one question at a time.",
  },
  {
    label: "The request",
    title: "Instead of a voicemail, a clear request.",
    body: "The problem, the address, how soon they need someone, and the best number to call back.",
  },
  {
    label: "Your team",
    title: "Your team takes it from there.",
    body: "The request goes to whoever handles callbacks. Your team confirms pricing and scheduling, the same as always.",
  },
] as const

const pad = (index: number) => String(index + 1).padStart(2, "0")

function SectionHead({ id, title, children, className }: { id: string; title: React.ReactNode; children?: React.ReactNode; className?: string }) {
  return (
    <div className={className ? `ml-head ${className}` : "ml-head"} data-mtl-reveal>
      <h2 id={id}>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  )
}

function ControlSample({ example }: { example: ControlExample }) {
  if (example.kind === "facts") {
    return (
      <dl className="ml-control__facts">
        {example.items.map(([label, value]) => (
          <div key={label}>
            <dt>{label}</dt>
            <dd>{value}</dd>
          </div>
        ))}
      </dl>
    )
  }
  if (example.kind === "exchange") {
    return (
      <div className="ml-control__exchange">
        <p><span>Caller</span>“{example.caller}”</p>
        <p><span>Mountline</span>“{example.reply}”</p>
      </div>
    )
  }
  return (
    <ul className="ml-control__checks">
      {example.items.map((item) => (
        <li key={item}><Check aria-hidden="true" />{item}</li>
      ))}
    </ul>
  )
}

export function MountlineHomepage() {
  return (
    <div className="mountline-marketing mountline-homepage ml-site">
      <HomepageMotion />
      <a href="#main-content" className="ml-skip">Skip to content</a>
      <SiteHeader nav={nav} ctaHref="#demo" ctaLabel="Try the demo" menuCtaLabel="Try the demo line" />

      <main id="main-content" tabIndex={-1}>
        {/* Hero: what it is, and the whole idea in one line of glyphs. */}
        <section className="ml-hero" aria-labelledby="hero-title">
          <div className="ml-container ml-hero__inner">
            <h1 id="hero-title" className="ml-hero__title">
              <span className="ml-hero__line"><span>The receptionist for</span></span>{" "}
              <span className="ml-hero__line"><span>the calls you can’t take.</span></span>
            </h1>
            <p className="ml-hero__lede">
              Mountline answers missed and after-hours calls, asks the questions you choose, and leaves your team a
              clear request to follow up on.
            </p>
            <div className="ml-hero__foot">
              <div className="ml-hero__actions">
                <a href="#demo" className="ml-btn ml-btn--solid">
                  Try the demo line <ArrowRight aria-hidden="true" />
                </a>
                <a href="#contact" className="ml-btn ml-btn--line">Ask about a pilot</a>
              </div>
              <a href={demoHref} className="ml-hero__number" aria-label={`Call the demo line at ${demoNumber}`}>
                <i aria-hidden="true" />
                <span className="ml-hero__number-label">Demo line</span>
                <span className="ml-hero__number-value">{demoNumber}</span>
              </a>
            </div>
          </div>

          <div className="ml-band" aria-hidden="true">
            <GlyphField className="ml-band__canvas" />
          </div>

          <ol className="ml-container ml-flow" aria-label="How Mountline works">
            {flow.map((step, index) => (
              <li key={step.title}>
                <span className="ml-flow__index" aria-hidden="true">{pad(index)}</span>
                <p className="ml-flow__title">{step.title}</p>
                <p className="ml-flow__body">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* Show me: one call, start to finish. */}
        <section className="ml-section ml-showcase" id="product" aria-labelledby="product-title">
          <div className="ml-container">
            <SectionHead id="product-title" title="Watch it take a call." className="ml-showcase__head">
              It’s 6:48 on a weeknight and the office is closed. A customer calls anyway. Here’s what Mountline does with it.
            </SectionHead>
            <div data-mtl-reveal data-illustrative>
              <CallDemo note="An example call to a fictional business, with made-up caller details. Not live customer data." />
            </div>
          </div>
        </section>

        {/* How does it work? */}
        <section className="ml-section ml-section--split" id="how" aria-labelledby="how-title">
          <div className="ml-container">
            <CallStack
              steps={layers}
              intro={
                <SectionHead id="how-title" title={<>Built around the phone line you <em>already</em> have.</>}>
                  Nothing about how customers reach you has to change. Mountline sits between your number and your team.
                </SectionHead>
              }
            />
          </div>
        </section>

        {/* Will it say something stupid? */}
        <section className="ml-control" id="control" aria-labelledby="control-title">
          <div className="ml-container">
            <div className="ml-control__head" data-mtl-reveal>
              <h2 id="control-title">You decide what it can say.</h2>
              <p>
                Mountline is set up to answer from your facts, not its own guesses. You give it the details, you set the
                limits, and you hear it before any customer does.
              </p>
            </div>
            <ol className="ml-control__list">
              {controls.map((item, index) => (
                <li key={item.label} data-mtl-reveal>
                  <span className="ml-control__index" aria-hidden="true">{pad(index)}</span>
                  <h3>{item.label}</h3>
                  <p className="ml-control__statement">{item.statement}</p>
                  <div className="ml-control__sample">
                    <ControlSample example={item.example} />
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Does this apply to my business? */}
        <section className="ml-section" id="trades" aria-labelledby="trades-title">
          <div className="ml-container">
            <TradeExplorer
              trades={trades}
              intro={
                <SectionHead id="trades-title" title="Every trade gets different calls.">
                  So the questions change with the work. Pick a trade to see what Mountline would ask, and what your
                  team would get back.
                </SectionHead>
              }
            />
          </div>
        </section>

        {/* Can I try it? */}
        <section className="ml-demo" id="demo" aria-labelledby="demo-title">
          <Landscape variant="night" id="demo-scene" className="ml-demo__scene" horizon={0.16} />
          <div className="ml-container ml-demo__inner">
            <div className="ml-demo__call" data-mtl-reveal>
              <h2 id="demo-title">Don’t take our word for it. <em>Call it.</em></h2>
              <p className="ml-demo__business">
                <strong>North Texas Air &amp; Heat</strong>
                <span>Fictional HVAC demo</span>
              </p>
              <a href={demoHref} className="ml-demo__number" aria-label={`Call the demo line at ${demoNumber}`}>
                {demoNumber}
              </a>
              <div className="ml-demo__actions">
                <a href={demoHref} className="ml-btn ml-btn--solid">
                  <Phone className="ml-btn__icon" aria-hidden="true" /> Call the demo
                </a>
                <div className="ml-demo__qr">
                  <DemoQr className="ml-demo__qr-code" />
                  <p>On a computer? Scan to call from your phone.</p>
                </div>
              </div>
            </div>
            <div className="ml-demo__try" data-mtl-reveal>
              <p className="ml-demo__try-label">Things to try saying</p>
              <ol>
                {tryPrompts.map((item) => (
                  <li key={item.say}>
                    <q>{item.say}</q>
                    <span>{item.note}</span>
                  </li>
                ))}
              </ol>
              <p className="ml-demo__fine">
                North Texas Air &amp; Heat is a fictional HVAC business.{" "}
                Demo calls do not book real visits or dispatch a technician.{" "}
                Calendar booking, text messages, and live transfers are not verified here.{" "}
                Please use made-up details. Nobody will call you back.
              </p>
            </div>
          </div>
        </section>

        {/* Does this actually help? First: it's checked before it's trusted. */}
        <section className="ml-section ml-testing" id="testing" aria-labelledby="testing-title">
          <div className="ml-container">
            <div className="ml-testing__head" data-mtl-reveal>
              <h2 id="testing-title">And yeah, we test it.</h2>
              <div>
                <p>
                  Before it answers a single real customer, we call it ourselves. The normal calls, the strange ones, and
                  the ones that could go wrong.
                </p>
                <p>If something misses, it gets fixed and called again. Then you try it too.</p>
              </div>
            </div>
            <TestRound />
          </div>
        </section>

        {/* Then: the size of the problem, honestly sourced. */}
        <section className="ml-section ml-gap-section" id="gap" aria-labelledby="gap-title">
          <div className="ml-container">
            <div className="ml-gap__head" data-mtl-reveal>
              <h2 id="gap-title">Here’s the gap Mountline is built to cover.</h2>
              <p>
                CallRail reports that, on average, 28% of calls to businesses go unanswered.
                <sup><a href={`#source-${unansweredSource}`} aria-label={`Source ${unansweredSource}`}>{unansweredSource}</a></sup>{" "}
                Mountline doesn’t change how your team handles the rest. It’s there for the calls that would otherwise
                ring out.
              </p>
            </div>
            <CallGap />
          </div>
        </section>

        {/* How do we start? */}
        <section className="ml-section ml-pilot" id="pilot" aria-labelledby="pilot-title">
          <div className="ml-container">
            <SectionHead id="pilot-title" title="How a pilot works">
              One kind of call to start, set up with you and tested by you. Scope and price are agreed in writing before
              anything begins.
            </SectionHead>
            <ol className="ml-timeline" data-mtl-reveal>
              {pilotSteps.map((step, index) => (
                <li key={step.title} style={{ "--i": index } as React.CSSProperties}>
                  <span className="ml-timeline__node" aria-hidden="true" />
                  <span className="ml-timeline__index" aria-hidden="true">{pad(index)}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
            <p className="ml-pilot__out" data-mtl-reveal>
              <span>Not working for you?</span> Turn call forwarding off and your phone works exactly the way it does
              today.
            </p>
          </div>
        </section>

        {/* Who is behind this? */}
        <section className="ml-company" id="company" aria-labelledby="company-title">
          <figure className="ml-company__photo">
            <Image
              src="/luke-nordin.jpg"
              alt="Luke Nordin, founder of Mountline, standing outdoors in front of green trees"
              fill
              sizes="(max-width: 860px) 100vw, 50vw"
            />
          </figure>
          <div className="ml-company__copy" data-mtl-reveal>
            <h2 id="company-title">Built by the people you’ll <em>talk to</em>.</h2>
            <p className="ml-company__lede">
              Mountline is a small company in Keller, Texas. You work directly with the people who build it.
            </p>
            <dl className="ml-company__principles">
              {principles.map((item) => (
                <div key={item.title}>
                  <dt>{item.title}</dt>
                  <dd>{item.body}</dd>
                </div>
              ))}
            </dl>
            <p className="ml-company__sign">
              <span>Luke Nordin, Founder</span>
              <a href="mailto:hello@mountline.dev" className="ml-link">hello@mountline.dev</a>
            </p>
          </div>
        </section>

        {/* Questions */}
        <section className="ml-section ml-faq-section" id="faq" aria-labelledby="faq-title">
          <div className="ml-container ml-faq">
            <div className="ml-head ml-faq__head" data-mtl-reveal>
              <h2 id="faq-title">Questions</h2>
              <p>
                Short answers. If yours isn’t here,{" "}
                <a href="mailto:hello@mountline.dev" className="ml-link">ask us directly</a>.
              </p>
            </div>
            <div className="ml-faq__items" data-mtl-reveal>
              {questions.map((item) => (
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

        {/* Contact */}
        <section className="ml-section ml-final" id="contact" aria-labelledby="contact-title">
          <div className="ml-container ml-final__grid">
            <div className="ml-final__copy" data-mtl-reveal>
              <h2 id="contact-title">Tell us what happens when <em>nobody</em> can answer.</h2>
              <p>A few sentences is plenty. We’ll read it and email you back with where we’d start.</p>
              <ul className="ml-final__notes">
                <li>No commitment. Scope and price come in writing before you decide anything.</li>
                <li>
                  Prefer email? <a href="mailto:hello@mountline.dev" className="ml-link">hello@mountline.dev</a>
                </li>
                <li>
                  Want to hear it first? <a href={demoHref} className="ml-link">Call the demo line at {demoNumber}</a>
                </li>
              </ul>
            </div>
            <div className="ml-final__form" data-mtl-reveal>
              <PilotRequestForm />
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  )
}
