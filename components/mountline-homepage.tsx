import Image from "next/image"
import { ArrowRight, Check } from "lucide-react"
import { CallStack, type StackStep } from "@/components/homepage/call-stack"
import { GlyphField } from "@/components/homepage/glyph-field"
import { HomepageMotion } from "@/components/homepage/homepage-motion"
import { Landscape } from "@/components/homepage/landscape"
import { SiteFooter } from "@/components/homepage/site-footer"
import { SiteHeader } from "@/components/homepage/site-header"
import { TradeExplorer, type Trade } from "@/components/homepage/trade-explorer"
import { PilotRequestForm } from "@/components/receptionist/pilot-request-form"
import { receptionistDemo } from "@/lib/receptionist/demo"

const demoNumber = receptionistDemo.displayPhone
const demoHref = receptionistDemo.phoneHref

const nav = [
  { href: "#product", label: "Product" },
  { href: "#demo", label: "Demo" },
  { href: "#pilot", label: "Pilot" },
  { href: "#company", label: "Company" },
] as const

const facts = [
  "Keeps your existing number",
  "Answers from details you approve",
  "Callers can always ask for a person",
  "Tested with you before launch",
]

const layers: StackStep[] = [
  {
    label: "Your number",
    title: "Keep your number",
    body: "Customers call the number they already know. Missed or after-hours calls forward to Mountline.",
  },
  {
    label: "The receptionist",
    title: "Pick up and listen",
    body: "It answers as your business, asks one question at a time, and keeps the call short and polite.",
  },
  {
    label: "Your details",
    title: "Answer from what you approve",
    body: "Services, hours, service area, and what not to quote. When it doesn’t know, it says so and takes a message.",
  },
  {
    label: "Your team",
    title: "Hand off a clear request",
    body: "Name, number, location, the problem, and timing, ready for a callback. Your team confirms pricing and scheduling.",
  },
]

const trades: Trade[] = [
  {
    name: "HVAC",
    summary: "No-cooling calls in July, no-heat calls in January. Capture the system, the symptoms, and how urgent it is.",
    points: ["Symptoms and system type", "Service area check", "Urgency and preferred timing"],
    cta: { label: "Try the HVAC demo", href: "#demo" },
    example: {
      caller: "Our AC is running, but the house isn’t cooling.",
      reply: "Sorry about that. What ZIP code is the property in?",
      issue: "AC running, not cooling",
      location: "ZIP 76244",
      urgency: "Same week",
      timing: "Tomorrow afternoon",
    },
  },
  {
    name: "Plumbing",
    summary: "Leaks, clogs, and water heaters. Separate the emergencies from the estimates before anyone calls back.",
    points: ["Leak, clog, or install", "Water-on-the-floor questions", "Emergency rules you set"],
    cta: { label: "Discuss a pilot", href: "#contact" },
    example: {
      caller: "There’s water all over the garage floor from the heater.",
      reply: "Thanks for calling. Is the water still running right now?",
      issue: "Water heater leaking",
      location: "ZIP 76248 · garage",
      urgency: "Urgent · your rules apply",
      timing: "As soon as possible",
    },
  },
  {
    name: "Electrical",
    summary: "Breakers, outages, and new circuits. Collect the details without giving advice that should come from an electrician.",
    points: ["What’s affected, and since when", "Safety prompts you approve", "Repair or estimate request"],
    cta: { label: "Discuss a pilot", href: "#contact" },
    example: {
      caller: "The kitchen breaker trips every time we run the microwave.",
      reply: "Got it. How long has that been happening?",
      issue: "Kitchen breaker keeps tripping",
      location: "ZIP 76262",
      urgency: "Needs review",
      timing: "This week",
    },
  },
  {
    name: "Roofing",
    summary: "Storm season brings a wave of calls at once. Log each one with the address, the damage, and the insurance question.",
    points: ["Damage and roof type", "Insurance claim status", "Inspection request"],
    cta: { label: "Discuss a pilot", href: "#contact" },
    example: {
      caller: "We lost a bunch of shingles in last night’s storm.",
      reply: "I’m sorry to hear that. Have you started an insurance claim yet?",
      issue: "Missing shingles after storm",
      location: "ZIP 76092",
      urgency: "Inspection requested",
      timing: "Before the weekend",
    },
  },
  {
    name: "Cleaning",
    summary: "Quotes depend on size and scope. Gather rooms, square footage, and dates so the quote call is quick.",
    points: ["Home or office, size and rooms", "One-time or recurring", "Preferred dates"],
    cta: { label: "Discuss a pilot", href: "#contact" },
    example: {
      caller: "I need a move-out clean before Friday. Three bed, two bath.",
      reply: "Happy to help. Is the home empty, or will furniture still be there?",
      issue: "Move-out clean · 3 bed, 2 bath",
      location: "ZIP 76244",
      urgency: "Quote requested",
      timing: "Before Friday",
    },
  },
]

// Timings (seconds) keep each captured field in step with the line that produced it.
const transcript = [
  { who: "Caller", at: 0.2, text: "Our AC is running, but the house isn’t cooling." },
  { who: "Mountline", at: 1.0, text: "Sorry about that. What ZIP code is the property in?" },
  { who: "Caller", at: 1.8, text: "76244. This is John, at 817-555-0184." },
  { who: "Mountline", at: 2.6, text: "Thanks, John. When would you like someone to come out?" },
  { who: "Caller", at: 3.4, text: "Tomorrow afternoon, if possible." },
  { who: "Mountline", at: 4.2, text: "I’ve noted tomorrow afternoon. The team will call you back to confirm a time." },
] as const

const capturedFields = [
  { label: "Issue", value: "AC running, not cooling", at: 0.5 },
  { label: "Service location", value: "ZIP 76244", at: 2.1 },
  { label: "Caller name", value: "John", at: 2.2 },
  { label: "Callback number", value: "817-555-0184", at: 2.3 },
  { label: "Preferred time", value: "Tomorrow afternoon", at: 3.7 },
] as const

const tryPrompts = [
  { say: "“The AC is running but not cooling.”", note: "Describe a problem the way a customer would." },
  { say: "“Do you service homes in Keller?”", note: "Ask about the service area." },
  { say: "“Could someone come tomorrow afternoon?”", note: "It notes the time. It doesn’t book it." },
  { say: "“Can a person call me back?”", note: "Ask for a human at any point." },
]

const pilotSteps = [
  { title: "Pick one call flow", body: "Missed calls, after-hours calls, or common questions. Start where a better answer helps most." },
  { title: "Approve the details", body: "Services, coverage, hours, what not to quote, and who handles each kind of request." },
  { title: "Test it together", body: "Ordinary calls, interruptions, urgent requests, and questions it shouldn’t answer." },
  { title: "Launch, then review", body: "Real calls are reviewed with you, and the setup is adjusted before anything expands." },
]

const questions = [
  {
    q: "Can we keep our current number?",
    a: "Yes. We check your phone provider’s forwarding options and start with a limited route, such as unanswered calls, before changing how customers reach you.",
  },
  {
    q: "Does the demo book real appointments?",
    a: "No. North Texas Air & Heat is fictional, and the demo is for trying a conversation. In a pilot, your team confirms appointments unless a calendar connection has been set up and tested separately.",
  },
  {
    q: "What happens when a caller needs a person?",
    a: "We agree on a callback or transfer path and an after-hours fallback. Urgent or unsafe situations get their own instructions. The receptionist never says a technician is on the way.",
  },
  {
    q: "What does a pilot cost?",
    a: "It depends on your call volume and setup. After we review your call flow, you get the scope and price in writing before deciding anything.",
  },
] as const

function CallRecord() {
  return (
    <figure className="ml-record" data-illustrative data-mtl-reveal aria-label="Example call to the demo line. Not live customer data.">
      <div className="ml-record__head">
        <span className="ml-record__title">
          <i aria-hidden="true" />
          North Texas Air &amp; Heat
        </span>
        <span className="ml-mono ml-card__muted">Inbound call</span>
      </div>
      <ol className="ml-record__transcript">
        {transcript.map((line) => (
          <li key={line.text} data-who={line.who} style={{ "--at": `${line.at}s` } as React.CSSProperties}>
            <span className="ml-mono">{line.who}</span>
            <p>{line.text}</p>
          </li>
        ))}
      </ol>
      <div className="ml-record__request">
        <p className="ml-mono">Service request</p>
        <dl>
          {capturedFields.map((field) => (
            <div key={field.label} style={{ "--at": `${field.at}s` } as React.CSSProperties}>
              <dt>{field.label}</dt>
              <dd><span aria-hidden="true">—</span><span>{field.value}</span></dd>
            </div>
          ))}
        </dl>
      </div>
      <figcaption className="ml-card__foot ml-mono">Example · Not live customer data</figcaption>
    </figure>
  )
}

function SectionHead({ id, title, children, align = "start" }: { id: string; title: React.ReactNode; children?: React.ReactNode; align?: "start" | "center" }) {
  return (
    <div className="ml-head" data-align={align} data-mtl-reveal>
      <h2 id={id}>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  )
}

export function MountlineHomepage() {
  return (
    <div className="mountline-marketing mountline-homepage ml-site">
      <HomepageMotion />
      <a href="#main-content" className="ml-skip">Skip to content</a>
      <SiteHeader nav={nav} demoHref={demoHref} />

      <main id="main-content" tabIndex={-1}>
        <section className="ml-hero" aria-labelledby="hero-title">
          <div className="ml-container ml-hero__inner">
            <h1 id="hero-title" className="ml-hero__title">
              <span className="ml-hero__line"><span>The receptionist for</span></span>
              <span className="ml-hero__line"><span>the calls you can’t take</span></span>
            </h1>
            <p className="ml-hero__lede">
              Mountline builds AI receptionists for service businesses.{" "}
              <span>They pick up when your team can’t, ask the right questions, and leave you a clear request to call back.</span>
            </p>
            <div className="ml-hero__foot">
              <div className="ml-hero__actions">
                <a href={demoHref} className="ml-btn ml-btn--solid">
                  Call the demo <ArrowRight aria-hidden="true" />
                </a>
                <a href="#contact" className="ml-btn ml-btn--line">Discuss a pilot</a>
              </div>
              <a href={demoHref} className="ml-hero__line-link ml-mono" aria-label={`Call the demo line at ${demoNumber}`}>
                <i aria-hidden="true" />
                Demo line · {demoNumber}
                <ArrowRight aria-hidden="true" />
              </a>
            </div>
          </div>
        </section>

        <div className="ml-band" aria-hidden="true">
          <GlyphField className="ml-band__canvas" />
        </div>

        <ul className="ml-facts" aria-label="At a glance">
          {facts.map((fact, index) => (
            <li key={fact}>
              <span className="ml-mono">{String(index + 1).padStart(2, "0")}</span>
              {fact}
            </li>
          ))}
        </ul>

        <section className="ml-section ml-section--split" id="product" aria-labelledby="product-title">
          <div className="ml-container">
            <CallStack
              steps={layers}
              intro={
                <SectionHead id="product-title" title={<>Built around the phone line you <em>already</em> have</>}>
                  Mountline sits between your number and your team. Four layers, each one set up and tested with you.
                </SectionHead>
              }
            />
          </div>
        </section>

        <section className="ml-section" id="trades" aria-labelledby="trades-title">
          <div className="ml-container">
            <TradeExplorer
              trades={trades}
              intro={
                <SectionHead id="trades-title" title="Made for service businesses">
                  Every trade gets its own kind of call. The questions change; the handoff stays clear.
                </SectionHead>
              }
            />
          </div>
        </section>

        <section className="ml-section" id="demo" aria-labelledby="demo-title">
          <div className="ml-container ml-demo">
            <div className="ml-demo__copy" data-mtl-reveal>
              <h2 id="demo-title">Call the demo line</h2>
              <p className="ml-body">
                Meet North Texas Air &amp; Heat, a fictional HVAC business. Call it the way a customer would.
                Demo calls do not book real visits or dispatch a technician.
              </p>
              <ul className="ml-checks">
                {tryPrompts.map((item) => (
                  <li key={item.say}>
                    <span className="ml-checks__icon" aria-hidden="true"><Check /></span>
                    <div>
                      <strong>{item.say}</strong>
                      <span>{item.note}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="ml-demo__actions">
                <a href={demoHref} className="ml-btn ml-btn--solid">
                  Call {demoNumber} <ArrowRight aria-hidden="true" />
                </a>
                <a href="#contact" className="ml-btn ml-btn--line">Discuss a pilot</a>
              </div>
              <p className="ml-fine">
                The demo covers the conversation only.
                Calendar booking, text messages, and live transfers are not verified here.
                Please use made-up details.
              </p>
            </div>
            <div className="ml-demo__visual">
              <Landscape variant="night" id="demo-scene" className="ml-scene" />
              <div className="ml-demo__record">
                <CallRecord />
              </div>
            </div>
          </div>
        </section>

        <section className="ml-section" id="pilot" aria-labelledby="pilot-title">
          <div className="ml-container">
            <SectionHead id="pilot-title" title="How a pilot works">
              One call flow, tested with you before any customer reaches it. Scope and price are agreed in writing first.
            </SectionHead>
            <ol className="ml-cards" data-mtl-reveal>
              {pilotSteps.map((step, index) => (
                <li key={step.title}>
                  <span className="ml-mono">{String(index + 1).padStart(2, "0")}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="ml-section" id="company" aria-labelledby="company-title">
          <div className="ml-container ml-company">
            <figure className="ml-company__photo" data-mtl-reveal>
              <div>
                <Image
                  src="/luke-nordin.jpg"
                  alt="Luke Nordin, founder of Mountline"
                  fill
                  sizes="(max-width: 860px) 100vw, 520px"
                />
              </div>
              <figcaption className="ml-mono">Luke Nordin · Founder</figcaption>
            </figure>
            <div className="ml-company__copy" data-mtl-reveal>
              <h2 id="company-title">Built by the people you’ll <em>talk to</em></h2>
              <p className="ml-body">
                Mountline is a small company in Keller, Texas. We build receptionists for service businesses and set
                up every pilot ourselves, so you work directly with the people building the product.
              </p>
              <ul className="ml-principles">
                <li><span className="ml-mono">01</span>Answers come from information you approve.</li>
                <li><span className="ml-mono">02</span>Callers can always ask for a person.</li>
                <li><span className="ml-mono">03</span>Nothing is promised that your team hasn’t confirmed.</li>
              </ul>
            </div>
          </div>
        </section>

        <section className="ml-section" id="faq" aria-labelledby="faq-title">
          <div className="ml-container ml-faq">
            <SectionHead id="faq-title" title="Questions" />
            <div className="ml-faq__items" data-mtl-reveal>
              {questions.map((item) => (
                <details key={item.q}>
                  <summary>{item.q}<i aria-hidden="true" /></summary>
                  <p>{item.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className="ml-section ml-final" id="contact" aria-labelledby="contact-title">
          <div className="ml-container">
            <SectionHead id="contact-title" align="center" title={<>Tell us what happens when <em>nobody</em> can answer</>}>
              We’ll read it and reply by email with a practical starting point. Prefer to write directly?{" "}
              <a href="mailto:hello@mountline.dev" className="ml-link">hello@mountline.dev</a>
            </SectionHead>
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
