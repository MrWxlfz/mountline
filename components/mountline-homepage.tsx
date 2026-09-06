import Image from "next/image"
import Link from "next/link"
import {
  ArrowDown,
  ArrowRight,
  CalendarDays,
  Check,
  ChevronRight,
  Mail,
  MessageSquareText,
  Phone,
  PhoneCall,
  Route,
  UserRoundCheck,
} from "lucide-react"
import { HomepageMotion } from "@/components/homepage/homepage-motion"

const demoNumber = "817-632-6909"
const demoHref = "tel:+18176326909"

const flowSteps = [
  { number: "01", verb: "Customer calls", detail: "The call reaches your Mountline receptionist." },
  { number: "02", verb: "AI answers", detail: "It answers using your services, hours, and rules." },
  { number: "03", verb: "Need understood", detail: "It identifies what the customer is asking for." },
  { number: "04", verb: "Details collected", detail: "It asks for the information your team needs." },
  { number: "05", verb: "Availability checked", detail: "It checks the times you have approved." },
  { number: "06", verb: "Next step handled", detail: "It books, routes, transfers, or escalates." },
  { number: "07", verb: "Customer confirmed", detail: "The customer receives the appointment or next step." },
  { number: "08", verb: "Business updated", detail: "Your team receives the call details and outcome." },
] as const

const productChapters = [
  {
    index: "01",
    label: "AI reception",
    title: "Answers every call using your business information.",
    body: "Your receptionist answers questions about services, hours, locations, pricing rules, and availability. If the caller needs a person, it can transfer the call or collect the details for a callback.",
    points: ["Inbound call handling", "Business-specific answers", "Live transfer or callback"],
    visual: "reception",
  },
  {
    index: "02",
    label: "Scheduling + intake",
    title: "Books real appointments.",
    body: "Mountline checks availability, collects the information your team needs, books the appointment, and sends the details to both the customer and your business.",
    points: ["Qualification logic", "Calendar coordination", "Structured intake"],
    visual: "schedule",
  },
  {
    index: "03",
    label: "Customer communication",
    title: "Sends follow-up automatically.",
    body: "Customers can receive confirmations, reminders, missed-call replies, and follow-up messages without someone on your team sending them manually.",
    points: ["Missed-call text back", "Confirmations and reminders", "Two-way SMS"],
    visual: "messages",
  },
  {
    index: "04",
    label: "Websites + operations",
    title: "Handles more than the phone call.",
    body: "The receptionist can trigger scheduling, messaging, lead intake, internal notifications, and human handoffs. Mountline can also build the website, portal, or workflow tool that supports the same process.",
    points: ["Websites and lead intake", "Human handoffs", "Internal workflow tools"],
    visual: "operations",
  },
] as const

function BrandLogo({ footer = false }: { footer?: boolean }) {
  return (
    <Image
      src="/brand/mountline-wordmark.svg"
      alt="Mountline"
      width={footer ? 182 : 150}
      height={footer ? 42 : 35}
      className="ops-brand-image"
      priority={!footer}
    />
  )
}

function Header() {
  return (
    <header className="ops-header">
      <div className="ops-shell ops-header__inner">
        <Link href="/" className="ops-brand" aria-label="Mountline home">
          <BrandLogo />
        </Link>
        <nav className="ops-nav" aria-label="Primary navigation">
          <a href="#system">Systems</a>
          <a href="#how-it-works">How it works</a>
          <a href="#company">Company</a>
        </nav>
        <div className="ops-header__actions">
          <a href="#contact" className="ops-id-link">Contact</a>
          <a href={demoHref} className="ops-header__call">
            <Phone className="size-3.5" aria-hidden="true" />
            Call the demo
          </a>
        </div>
      </div>
    </header>
  )
}

function HeroSystem() {
  return (
    <div className="hero-product-stage" data-mtl-hero="system">
      <div className="hero-aurora" aria-hidden="true"><i /><i /><i /></div>
      <div className="hero-system" role="img" aria-label="Example Mountline call showing a customer request, availability check, appointment booking, confirmation, and owner notification">
        <div className="hero-system__topbar">
          <span><i /> Live call · answered</span>
          <span>Example conversation</span>
        </div>

        <div className="hero-callbar">
          <span className="hero-callbar__icon"><PhoneCall aria-hidden="true" /></span>
          <div><span>Incoming caller</span><strong>817-555-0184</strong></div>
          <time>00:22</time>
        </div>

        <div className="hero-live-grid">
          <div className="hero-conversation">
            <div className="hero-conversation__label"><span>Conversation</span><span>Transcript live</span></div>
            <div className="hero-message hero-message--customer">
              <span>Customer · 00:04</span>
              <p>Hi, I need someone to look at my AC tomorrow.</p>
            </div>
            <div className="hero-message hero-message--receptionist">
              <span>Mountline · 00:08</span>
              <p>I can help with that. What ZIP code are you in?</p>
            </div>
            <div className="hero-message hero-message--customer hero-message--short">
              <span>Customer · 00:12</span>
              <p>76244.</p>
            </div>
          </div>

          <div className="hero-call-state">
            <div className="hero-call-state__label"><span>Call activity</span><span>Complete</span></div>
            <ol>
              <li><span>Intent</span><strong>Service request</strong><i /></li>
              <li><span>Availability</span><strong>Tomorrow · 10:30 AM</strong><i /></li>
              <li><span>Appointment</span><strong>Created</strong><i /></li>
              <li><span>Confirmation</span><strong>Sent by SMS</strong><i /></li>
            </ol>
          </div>
        </div>

        <div className="hero-system__status">
          <span><Image src="/brand/mountline-icon.svg" alt="" width={24} height={24} /> Owner notified</span>
          <strong>Call summary and appointment details delivered</strong>
          <span>00:22</span>
        </div>
      </div>
    </div>
  )
}

function LiveDemoConsole() {
  const demoEvents = [
    ["00:00", "Incoming call", "New customer connected"],
    ["00:04", "Question received", "Asking about service"],
    ["00:07", "Intent identified", "Appointment request"],
    ["00:11", "Availability checked", "Approved calendar searched"],
    ["00:14", "Appointment found", "Tomorrow · 10:30 AM"],
    ["00:19", "Appointment created", "Calendar + intake updated"],
    ["00:22", "Confirmation sent", "Customer and business notified"],
  ] as const

  return (
    <div className="demo-console" data-mtl-reveal="scene">
      <div className="demo-console__header">
        <div><i /><span>System state · online</span></div>
        <span>Example sequence · simulated</span>
      </div>
      <div className="demo-console__body">
        <ol className="demo-events" aria-label="Example AI receptionist call sequence">
          {demoEvents.map(([time, event, detail]) => (
            <li key={time}>
              <time>{time}</time><i aria-hidden="true" /><strong>{event}</strong><span>{detail}</span>
            </li>
          ))}
        </ol>
        <div className="demo-prompts">
          <span>Things to ask</span>
          <p>Call as if you were a customer. The line is configured to demonstrate how a real request moves.</p>
          <ol>
            <li><span>01</span>“Can I book an appointment?”</li>
            <li><span>02</span>“What services do you offer?”</li>
            <li><span>03</span>“I need someone tomorrow.”</li>
            <li><span>04</span>“Can I speak to a person?”</li>
          </ol>
        </div>
      </div>
      <div className="demo-console__footer">
        <span>Product demonstration</span>
        <span>The phone line is live. The sequence above is illustrative.</span>
        <a href={demoHref}>Call {demoNumber} <ArrowRight /></a>
      </div>
    </div>
  )
}

function OperationalProof() {
  return (
    <div className="proof-interface" data-mtl-reveal="scene">
      <div className="proof-interface__bar">
        <span><i /> Call record</span>
        <span>Today · 10:18 AM</span>
      </div>
      <div className="proof-interface__grid">
        <div className="proof-transcript">
          <div className="proof-panel-label"><span>Conversation · source</span><span>01:47</span></div>
          <div className="transcript-line transcript-line--caller">
            <span>C</span>
            <p>Hi, I need someone tomorrow afternoon. My AC stopped cooling.</p>
          </div>
          <div className="transcript-line transcript-line--agent">
            <span>M</span>
            <p>I can help with that. What ZIP code are you in?</p>
          </div>
          <div className="transcript-line transcript-line--caller">
            <span>C</span>
            <p>76244. This is John.</p>
          </div>
          <div className="transcript-line transcript-line--agent">
            <span>M</span>
            <p>Thanks, John. I have 2:30 PM available tomorrow.</p>
          </div>
          <div className="transcript-cursor"><i /> Signal captured</div>
        </div>
        <div className="proof-transform" aria-hidden="true">
          <span>Extract</span>
          <i /><i /><i /><i />
          <Image src="/brand/mountline-icon.svg" alt="" width={30} height={30} />
          <small>Route</small>
        </div>
        <aside className="proof-summary">
          <div className="proof-panel-label"><span>Business state · structured</span><span className="proof-status">Complete</span></div>
          <dl>
            <div><dt>Service</dt><dd>AC repair</dd></div>
            <div><dt>Priority</dt><dd>Standard</dd></div>
            <div><dt>Preferred time</dt><dd>Tomorrow afternoon</dd></div>
            <div><dt>Customer</dt><dd>John · 76244</dd></div>
          </dl>
          <div className="proof-appointment">
            <CalendarDays aria-hidden="true" />
            <div><span>Appointment created</span><strong>Tomorrow · 2:30 PM</strong></div>
            <Check aria-hidden="true" />
          </div>
          <div className="proof-sms">
            <MessageSquareText aria-hidden="true" />
            <div><span>Confirmation sent</span><strong>Customer and business notified</strong></div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ProductVisual({ type }: { type: string }) {
  if (type === "reception") {
    return (
      <div className="product-visual product-visual--reception" role="img" aria-label="AI reception call interface">
        <div className="visual-topline"><span>Inbound · Answered</span><span>00:38</span></div>
        <div className="reception-caller"><PhoneCall /><div><span>New caller</span><strong>Service inquiry</strong></div></div>
        <div className="reception-wave" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} />)}</div>
        <div className="reception-intent"><span>Caller intent</span><strong>Estimate request</strong><i>Captured</i></div>
        <div className="visual-action"><span>Route state</span><strong>Qualification started</strong><ChevronRight /></div>
      </div>
    )
  }

  if (type === "schedule") {
    return (
      <div className="product-visual product-visual--schedule" role="img" aria-label="Scheduling and intake interface">
        <div className="visual-topline"><span>Appointment intake · Sep 8</span><span>Step 3 of 3</span></div>
        <dl className="intake-data">
          <div><dt>Service</dt><dd>Diagnostic visit</dd></div>
          <div><dt>Location</dt><dd>Within service area</dd></div>
          <div><dt>Access</dt><dd>Customer on site</dd></div>
        </dl>
        <div className="schedule-slots">
          <span>Available Sep 8</span>
          <div><i>9:00</i><i className="is-selected">10:30</i><i>1:15</i></div>
        </div>
        <div className="visual-action"><CalendarDays /><strong>Appointment ready</strong><Check /></div>
      </div>
    )
  }

  if (type === "messages") {
    return (
      <div className="product-visual product-visual--messages" role="img" aria-label="Customer SMS follow-up interface">
        <div className="visual-topline"><span>Customer thread</span><span>SMS</span></div>
        <div className="message-bubble message-bubble--system">Hi Jordan—your diagnostic visit is confirmed for Sep 8 at 10:30 AM. Reply here if anything changes.</div>
        <div className="message-bubble message-bubble--customer">Perfect, thank you.</div>
        <div className="message-event"><Check /><div><span>Customer confirmed</span><strong>Owner and calendar updated</strong></div><span>10:22</span></div>
        <div className="message-compose"><span>Follow-up is complete</span><Check /></div>
      </div>
    )
  }

  return (
    <div className="product-visual product-visual--operations" role="img" aria-label="Operational overview interface">
      <div className="visual-topline"><span>Operations</span><span>Today</span></div>
      <div className="operations-queue">
        <div><span><i className="is-brass" /> Appointment</span><strong>Jordan M.</strong><small>Sep 8 · 10:30 AM</small></div>
        <div><span><i /> Human handoff</span><strong>Casey R.</strong><small>Alex notified · 10:24</small></div>
        <div><span><i /> Website intake</span><strong>Morgan T.</strong><small>Estimate details captured</small></div>
      </div>
      <div className="operations-footer"><Route /><span>Every customer event has an owner and a next step.</span></div>
    </div>
  )
}

function OperationsOverview() {
  return (
    <div className="overview-system" data-mtl-reveal="overview">
      <div className="overview-system__bar">
        <span>Mountline operations trace</span>
        <span>Example state · Tuesday, Sep 8</span>
      </div>
      <div className="overview-system__canvas">
        <svg className="overview-traces" viewBox="0 0 1200 560" preserveAspectRatio="none" aria-hidden="true">
          <path className="overview-trace overview-trace--one" d="M188 112H404C445 112 445 248 486 248H620" />
          <path className="overview-trace overview-trace--two" d="M188 268H620" />
          <path className="overview-trace overview-trace--three" d="M188 424H404C445 424 445 288 486 288H620" />
          <path className="overview-trace overview-trace--out" d="M620 268H725" />
        </svg>

        <div className="overview-source overview-source--call">
          <span>09:41 · Phone</span><strong>Appointment request</strong><small>Jordan M. · diagnostic visit</small>
        </div>
        <div className="overview-source overview-source--sms">
          <span>09:43 · SMS</span><strong>Callback time confirmed</strong><small>Casey R. · after 2:00 PM</small>
        </div>
        <div className="overview-source overview-source--web">
          <span>10:02 · Website</span><strong>Estimate intake</strong><small>Morgan T. · details complete</small>
        </div>

        <div className="overview-core">
          <Image src="/brand/mountline-icon.svg" alt="" width={44} height={44} />
          <span>Route</span><strong>Events routed</strong>
        </div>

        <div className="overview-timeline">
          <div className="overview-timeline__label"><span>Business timeline</span><span>Owner view</span></div>
          <ol>
            <li><time>09:44</time><i /><div><strong>Callback assigned</strong><span>Casey R. · Alex notified</span></div><small>Open</small></li>
            <li><time>10:03</time><i /><div><strong>Estimate ready for review</strong><span>Morgan T. · website intake</span></div><small>Review</small></li>
            <li><time>10:20</time><i /><div><strong>Appointment confirmed</strong><span>Jordan M. · Sep 8, 10:30 AM</span></div><small>Done</small></li>
          </ol>
        </div>
      </div>
      <div className="overview-system__footer">
        <span>Phone</span><i />
        <span>Message</span><i />
        <span>Website</span>
        <strong>One operational record</strong>
      </div>
    </div>
  )
}

export function MountlineHomepage() {
  return (
    <div className="mountline-marketing mountline-homepage">
      <HomepageMotion />
      <a href="#main-content" className="ops-skip-link">Skip to main content</a>
      <Header />

      <main id="main-content" tabIndex={-1}>
        <section className="ops-hero">
          <div className="ops-shell ops-hero__grid">
            <div className="ops-hero__copy" data-mtl-hero="copy">
              <p className="ops-eyebrow"><span>Mountline AI reception</span> Built for service businesses.</p>
              <h1>AI receptionists that<br /><em>answer, book,</em><br />and follow up.</h1>
              <p className="ops-hero__lede">Mountline handles incoming calls, customer questions, scheduling, follow-up, and human handoffs so your team doesn’t have to stop working every time the phone rings.</p>
              <div className="ops-actions">
                <a href={demoHref} className="ops-button ops-button--primary"><Phone className="size-4" /> Call the live demo</a>
                <a href="#system" className="ops-button ops-button--quiet">See how it works <ArrowDown className="size-4" /></a>
              </div>
            </div>
            <HeroSystem />
          </div>
          <div className="ops-shell ops-hero__foot" data-mtl-hero="foot">
            <span>Try it now · {demoNumber}</span>
            <span>Answers · Books · Texts · Transfers · Notifies</span>
          </div>
        </section>

        <section className="demo-section" id="demo">
          <div className="ops-shell">
            <div className="demo-section__heading" data-mtl-reveal="copy">
              <p className="ops-kicker">01 / Call the live demo</p>
              <div>
                <h2>Hear exactly what a Mountline receptionist sounds like.</h2>
                <p>Call the number, ask a real question, try to book an appointment, or ask to speak with a person. The demo is live.</p>
              </div>
            </div>
            <a href={demoHref} className="demo-number" data-mtl-reveal="number" aria-label={`Call the Mountline live demo at ${demoNumber}`}>
              <span>{demoNumber}</span>
              <span className="demo-number__action"><PhoneCall /> Call now</span>
            </a>
            <LiveDemoConsole />
          </div>
        </section>

        <section className="system-section" id="system">
          <div className="ops-shell">
            <div className="system-intro" data-mtl-reveal="copy">
              <p className="ops-kicker">02 / From call to completed action</p>
              <h2>One call, handled from start to finish.</h2>
              <p>Mountline answers the call, understands the request, collects the right details, and completes the next step based on the rules you set.</p>
            </div>
            <ol className="system-rail" data-mtl-reveal="rail">
              {flowSteps.map((step) => (
                <li key={step.number}>
                  <span>{step.number}</span>
                  <i aria-hidden="true" />
                  <h3>{step.verb}</h3>
                  <p>{step.detail}</p>
                </li>
              ))}
            </ol>
            <div className="system-statement" data-mtl-reveal="copy">
              <span>The result</span>
              <p><strong>Customer helped</strong><i />Appointment booked<i />Team updated</p>
            </div>
          </div>
        </section>

        <section className="products-section" id="products">
          <div className="ops-shell">
            <div className="products-heading" data-mtl-reveal="copy">
              <p className="ops-kicker">03 / What Mountline handles</p>
              <h2>Calls, appointments, texts, and handoffs.</h2>
              <p>Each system is configured around your services, availability, service area, staff, and rules.</p>
            </div>
            <div className="product-list">
              {productChapters.map((product) => (
                <article className="product-row" key={product.index} data-mtl-reveal="product">
                  <div className="product-row__index">{product.index}</div>
                  <div className="product-row__copy">
                    <p>{product.label}</p>
                    <h3>{product.title}</h3>
                    <div className="product-row__body">
                      <p>{product.body}</p>
                      <ul>{product.points.map((point) => <li key={point}><Check />{point}</li>)}</ul>
                    </div>
                  </div>
                  <ProductVisual type={product.visual} />
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="proof-section" id="proof">
          <div className="ops-shell">
            <div className="proof-heading" data-mtl-reveal="copy">
              <p className="ops-kicker">04 / After the call</p>
              <div>
                <h2>Every call turns into usable information.</h2>
                <p>See who called, what they needed, what was booked, and what your team needs to do next.</p>
              </div>
            </div>
            <OperationalProof />
            <p className="proof-disclaimer">Illustrative interface · Actual systems are configured around each business and its approved workflows.</p>
          </div>
        </section>

        <section className="lifecycle-section" id="how-it-works">
          <div className="ops-shell lifecycle-grid">
            <div className="lifecycle-copy" data-mtl-reveal="copy">
              <p className="ops-kicker">05 / Step by step</p>
              <h2>How a Mountline call works.</h2>
              <p>Every call follows a clear process based on your business rules.</p>
              <a href="mailto:hello@mountline.dev?subject=Mountline%20system%20inquiry" className="ops-text-link">Talk to us about your phone line <ArrowRight /></a>
            </div>
            <ol className="lifecycle-list" data-mtl-reveal="lifecycle">
              <li><span>01</span><div><PhoneCall /><h3>Someone calls your business.</h3><p>Your existing number can route to the Mountline receptionist.</p></div></li>
              <li><span>02</span><div><PhoneCall /><h3>Mountline answers.</h3><p>The caller gets a clear response using your business information.</p></div></li>
              <li><span>03</span><div><UserRoundCheck /><h3>It understands what they need.</h3><p>The receptionist identifies the service, question, or reason for calling.</p></div></li>
              <li><span>04</span><div><UserRoundCheck /><h3>It collects the right information.</h3><p>Contact details, location, urgency, and job information are captured.</p></div></li>
              <li><span>05</span><div><Route /><h3>It books, routes, or escalates.</h3><p>The next step follows the rules you approved.</p></div></li>
              <li><span>06</span><div><MessageSquareText /><h3>The customer gets confirmation.</h3><p>Appointment or follow-up details are sent by text.</p></div></li>
              <li><span>07</span><div><CalendarDays /><h3>Your team gets the details.</h3><p>The call summary, customer information, and outcome stay together.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="overview-section" id="visibility">
          <div className="ops-shell overview-heading" data-mtl-reveal="copy">
            <p className="ops-kicker">06 / Calls, messages, and next steps</p>
            <h2>Your team always knows what happened.</h2>
            <p>Calls, appointments, messages, and follow-up actions stay connected instead of disappearing across separate tools.</p>
          </div>
          <div className="overview-edge"><OperationsOverview /></div>
        </section>

        <section className="company-section" id="company">
          <div className="ops-shell company-grid">
            <figure className="company-portrait" data-mtl-reveal="image">
              <Image
                src="/luke-profile.jpg"
                alt="Luke Nordin, founder of Mountline"
                fill
                sizes="(max-width: 860px) 100vw, 42vw"
                className="company-portrait__image"
              />
              <figcaption><span>Keller, Texas</span><strong>Luke Nordin · Founder</strong></figcaption>
            </figure>
            <div className="company-copy" data-mtl-reveal="copy">
              <p className="ops-kicker">07 / Built responsibly</p>
              <h2>Software should make a business feel more human, not less.</h2>
              <p>Automation should remove repetitive work without making customers feel like they’re talking to a machine. Mountline is built around clear conversations, useful handoffs, and giving callers a real person when they need one.</p>
              <div className="company-principles">
                <span><i>01</i> Clear answers based on approved information.</span>
                <span><i>02</i> A human handoff when the caller needs one.</span>
                <span><i>03</i> Direct support from the person building the system.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="final-section" id="contact">
          <div className="ops-shell">
            <div className="final-section__label"><span>Mountline</span><span>Keller, Texas · Working with service businesses</span></div>
            <div className="final-section__copy" data-mtl-reveal="copy">
              <h2>Put your phone line<br /><em>to work.</em></h2>
              <p>Try the live receptionist or talk to us about how Mountline could fit your business.</p>
            </div>
            <div className="final-section__actions" data-mtl-reveal="actions">
              <a href={demoHref} className="final-action final-action--call"><span><PhoneCall /> Live demo</span><strong>{demoNumber}</strong><ArrowRight /></a>
              <a href="mailto:hello@mountline.dev?subject=Mountline%20system%20inquiry" className="final-action"><span><Mail /> Start a conversation</span><strong>hello@mountline.dev</strong><ArrowRight /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="ops-footer">
        <div className="ops-shell ops-footer__grid">
          <div><BrandLogo footer /><p>AI reception, scheduling, follow-up, and customer communication for service businesses.</p></div>
          <nav aria-label="Footer navigation"><a href="#system">Systems</a><a href="#how-it-works">How it works</a><a href="#company">Company</a><a href={demoHref}>Live demo</a></nav>
          <div><a href={`tel:+18176326909`}>{demoNumber}</a><a href="mailto:hello@mountline.dev">hello@mountline.dev</a><Link href="/id">Mountline ID</Link></div>
        </div>
        <div className="ops-shell ops-footer__bottom"><span>© {new Date().getFullYear()} Mountline</span><span>Built for service businesses.</span></div>
      </footer>
    </div>
  )
}
