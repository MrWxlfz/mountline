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
  { number: "01", verb: "Answer", detail: "Every call gets a clear, on-brand response." },
  { number: "02", verb: "Understand", detail: "Intent and urgency are captured in the conversation." },
  { number: "03", verb: "Qualify", detail: "The right questions turn a caller into usable information." },
  { number: "04", verb: "Act", detail: "Book, route, notify, or follow up—based on the call." },
  { number: "05", verb: "Record", detail: "Your team sees what happened and what needs attention." },
] as const

const productChapters = [
  {
    index: "01",
    label: "AI reception",
    title: "A front desk that answers with context.",
    body: "Mountline builds reception systems around your services, service area, availability, and rules. Calls are handled clearly, questions are answered responsibly, and the next step is never improvised.",
    points: ["Inbound call handling", "Service and FAQ knowledge", "Intelligent routing"],
    visual: "reception",
  },
  {
    index: "02",
    label: "Scheduling + intake",
    title: "A useful appointment, not just a calendar slot.",
    body: "Collect the details your team needs before work is booked. The system can check fit, capture the request, offer approved times, and send a clean confirmation.",
    points: ["Qualification logic", "Calendar coordination", "Structured intake"],
    visual: "schedule",
  },
  {
    index: "03",
    label: "Customer communication",
    title: "Follow-up that closes the loop.",
    body: "Missed calls, confirmations, and open questions should not disappear. Mountline connects voice and SMS into a communication path your customers can follow and your team can see.",
    points: ["Missed-call recovery", "SMS confirmation", "Owner notifications"],
    visual: "messages",
  },
  {
    index: "04",
    label: "Websites + operations",
    title: "The same system, before and after the call.",
    body: "When the customer journey needs more than phone handling, Mountline builds the website, intake flow, portal, or focused internal tool that keeps the operation coherent.",
    points: ["Conversion-focused websites", "Client portals", "Internal workflow tools"],
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
    <div className="hero-system" data-mtl-hero="system" role="img" aria-label="A Mountline system answering a customer call, understanding the request, booking an appointment, confirming it, and notifying the business">
      <div className="hero-system__topbar">
        <span><i /> Mountline system online</span>
        <span>Example run · 22 sec</span>
      </div>

      <div className="hero-system__canvas">
        <svg className="hero-system__contours" viewBox="0 0 720 540" preserveAspectRatio="none" aria-hidden="true">
          <path d="M-30 424C84 319 162 497 276 392S475 298 758 396" />
          <path d="M-22 457C97 351 174 528 291 423S492 330 752 427" />
          <path d="M-12 491C111 385 193 558 310 455S517 363 744 461" />
        </svg>
        <svg className="hero-system__trace" viewBox="0 0 720 540" preserveAspectRatio="none" aria-hidden="true">
          <path className="hero-trace hero-trace--base" d="M44 103H168C196 103 202 136 229 136H315C347 136 347 224 379 224H472C503 224 503 306 534 306H676" />
          <path className="hero-trace hero-trace--active" d="M44 103H168C196 103 202 136 229 136H315C347 136 347 224 379 224H472C503 224 503 306 534 306H676" />
          <path className="hero-trace hero-trace--branch" d="M379 224V400H532" />
        </svg>

        <div className="hero-route-node hero-route-node--call">
          <span>00:00</span><PhoneCall aria-hidden="true" /><strong>Incoming call</strong><small>New customer</small>
        </div>
        <div className="hero-route-node hero-route-node--answer">
          <span>00:02</span><i /><strong>Answered</strong><small>Mountline reception</small>
        </div>
        <div className="hero-route-node hero-route-node--intent">
          <span>00:07</span><i /><strong>Intent understood</strong><small>AC repair · no cooling</small>
        </div>
        <div className="hero-route-node hero-route-node--qualified">
          <span>00:11</span><i /><strong>Qualified</strong><small>Service area confirmed</small>
        </div>
        <div className="hero-route-node hero-route-node--action">
          <span>00:19</span><CalendarDays aria-hidden="true" /><strong>Appointment created</strong><small>Sep 8 · 10:30 AM</small>
        </div>
        <div className="hero-route-node hero-route-node--confirm">
          <span>00:21</span><MessageSquareText aria-hidden="true" /><strong>Confirmation sent</strong><small>Customer · SMS</small>
        </div>
        <div className="hero-route-node hero-route-node--notify">
          <span>00:22</span><Route aria-hidden="true" /><strong>Business notified</strong><small>Context + next step</small>
        </div>

        <div className="hero-system__core">
          <Image src="/brand/mountline-icon.svg" alt="" width={52} height={52} />
          <div><span>Customer operating layer</span><strong>Route active</strong></div>
        </div>
      </div>
      <div className="hero-system__status">
        <span><i /> Run complete</span>
        <strong>One call. Four actions. Nothing lost.</strong>
        <span>System settled</span>
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
          <div className="transcript-line transcript-line--agent">
            <span>M</span>
            <p>Absolutely. What kind of issue are you having with the unit?</p>
          </div>
          <div className="transcript-line transcript-line--caller">
            <span>C</span>
            <p>It stopped cooling last night. The fan is still running.</p>
          </div>
          <div className="transcript-line transcript-line--agent">
            <span>M</span>
            <p>Understood. I can help check availability for a technician.</p>
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
            <div><dt>Caller intent</dt><dd>AC repair</dd></div>
            <div><dt>Reported issue</dt><dd>No cooling</dd></div>
            <div><dt>Qualification</dt><dd>Service area confirmed</dd></div>
            <div><dt>Handoff status</dt><dd>Not requested</dd></div>
          </dl>
          <div className="proof-appointment">
            <CalendarDays aria-hidden="true" />
            <div><span>Appointment created</span><strong>Sep 8 · 10:30–11:30 AM</strong></div>
            <Check aria-hidden="true" />
          </div>
          <div className="proof-sms">
            <MessageSquareText aria-hidden="true" />
            <div><span>Confirmation · 10:20 AM</span><strong>Customer + business notified</strong></div>
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
              <p className="ops-eyebrow"><span>Mountline systems</span> Customer operations, built to work.</p>
              <h1>Every call<br />should go<br /><em>somewhere.</em></h1>
              <p className="ops-hero__lede">Mountline builds the customer operating layer for service businesses—answering, qualifying, scheduling, following up, and keeping the work visible.</p>
              <div className="ops-actions">
                <a href={demoHref} className="ops-button ops-button--primary"><Phone className="size-4" /> Call {demoNumber}</a>
                <a href="#system" className="ops-button ops-button--quiet">Explore the system <ArrowDown className="size-4" /></a>
              </div>
            </div>
            <HeroSystem />
          </div>
          <div className="ops-shell ops-hero__foot" data-mtl-hero="foot">
            <span>Built for businesses where every call can become real work.</span>
            <span>AI reception · Communication · Scheduling · Operations</span>
          </div>
        </section>

        <section className="demo-section" id="demo">
          <div className="ops-shell">
            <div className="demo-section__heading" data-mtl-reveal="copy">
              <p className="ops-kicker">01 / Live system</p>
              <div>
                <h2>Don’t take our word for it.<br />Call the system.</h2>
                <p>This is a live demonstration of a Mountline AI receptionist. Ask a real question, try to schedule service, or see how it handles an uncertain request.</p>
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
              <p className="ops-kicker">02 / The operating layer</p>
              <h2>The call is only the beginning.</h2>
              <p>A useful system doesn’t stop when the conversation ends. It turns the customer’s intent into a clear operational outcome.</p>
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
              <span>One continuous path</span>
              <p><strong>Ring</strong><i />Intent<i />Appointment<i />Confirmation<i />Visibility</p>
            </div>
          </div>
        </section>

        <section className="products-section" id="products">
          <div className="ops-shell">
            <div className="products-heading" data-mtl-reveal="copy">
              <p className="ops-kicker">03 / Systems</p>
              <h2>Built around the way<br />your business operates.</h2>
              <p>No generic bot dropped on top. Each part is shaped around what you offer, what your customers ask, and what your team needs next.</p>
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
              <p className="ops-kicker">04 / Operational proof</p>
              <div>
                <h2>The conversation becomes something your business can use.</h2>
                <p>Calls are translated into structured information, scheduled work, clear communication, and a visible next step.</p>
              </div>
            </div>
            <OperationalProof />
            <p className="proof-disclaimer">Illustrative interface · Actual systems are configured around each business and its approved workflows.</p>
          </div>
        </section>

        <section className="lifecycle-section" id="how-it-works">
          <div className="ops-shell lifecycle-grid">
            <div className="lifecycle-copy" data-mtl-reveal="copy">
              <p className="ops-kicker">05 / From ring to revenue</p>
              <h2>What happens next is the product.</h2>
              <p>A polished voice is useful. A dependable chain of actions is what changes the business.</p>
              <a href="mailto:hello@mountline.dev?subject=Mountline%20system%20inquiry" className="ops-text-link">Talk through your workflow <ArrowRight /></a>
            </div>
            <ol className="lifecycle-list" data-mtl-reveal="lifecycle">
              <li><span>01</span><div><PhoneCall /><h3>The customer calls.</h3><p>The system answers in the context of your business—not from a generic script.</p></div></li>
              <li><span>02</span><div><UserRoundCheck /><h3>The request takes shape.</h3><p>Intent, fit, urgency, and the right contact details are captured naturally.</p></div></li>
              <li><span>03</span><div><CalendarDays /><h3>The next step is created.</h3><p>An appointment, transfer, task, or callback moves into the right place.</p></div></li>
              <li><span>04</span><div><MessageSquareText /><h3>Everyone stays informed.</h3><p>The customer gets confirmation. Your team gets the context and ownership.</p></div></li>
              <li><span>05</span><div><Route /><h3>The operation keeps moving.</h3><p>Nothing depends on somebody remembering to rebuild the story after the call.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="overview-section" id="visibility">
          <div className="ops-shell overview-heading" data-mtl-reveal="copy">
            <p className="ops-kicker">06 / One operational record</p>
            <h2>Different signals.<br /><em>One clear business timeline.</em></h2>
            <p>Calls, texts, website requests, handoffs, and appointments stop living as separate fragments. Mountline routes them into a record your team can act on.</p>
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
              <p>Customers want a useful answer. Teams want clean information. Owners want to know what happened. Mountline builds for all three—with clear boundaries, direct communication, and one person responsible for understanding the work.</p>
              <div className="company-principles">
                <span><i>01</i> No pretending software can do what it can’t.</span>
                <span><i>02</i> A human handoff when the situation needs one.</span>
                <span><i>03</i> Systems shaped around the real operation.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="final-section" id="contact">
          <div className="ops-shell">
            <div className="final-section__label"><span>Mountline</span><span>Keller, Texas · Working with service businesses</span></div>
            <div className="final-section__copy" data-mtl-reveal="copy">
              <h2>Build the part that<br /><em>should already work.</em></h2>
              <p>Start with the live system, or tell us where customer communication breaks down in your business.</p>
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
          <div><BrandLogo footer /><p>Customer systems for businesses that need every opportunity handled well.</p></div>
          <nav aria-label="Footer navigation"><a href="#system">Systems</a><a href="#how-it-works">How it works</a><a href="#company">Company</a><a href={demoHref}>Live demo</a></nav>
          <div><a href={`tel:+18176326909`}>{demoNumber}</a><a href="mailto:hello@mountline.dev">hello@mountline.dev</a><Link href="/id">Mountline ID</Link></div>
        </div>
        <div className="ops-shell ops-footer__bottom"><span>© {new Date().getFullYear()} Mountline</span><span>Serious infrastructure for real businesses.</span></div>
      </footer>
    </div>
  )
}
