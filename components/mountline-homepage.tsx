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
import { PilotRequestForm } from "@/components/receptionist/pilot-request-form"
import { receptionistDemo } from "@/lib/receptionist/demo"

const demoNumber = receptionistDemo.displayPhone
const demoHref = receptionistDemo.phoneHref

const flowSteps = [
  { number: "01", verb: "Customer calls", detail: "Start with the calls your team cannot take." },
  { number: "02", verb: "Receptionist answers", detail: "A short greeting explains who is answering." },
  { number: "03", verb: "Request understood", detail: "One useful question at a time, in plain language." },
  { number: "04", verb: "Details collected", detail: "Name, callback number, location, and the reason for calling." },
  { number: "05", verb: "Next step explained", detail: "A callback request stays a request until your team confirms it." },
  { number: "06", verb: "Team takes over", detail: "Your staff handles pricing, availability, and unusual requests." },
  { number: "07", verb: "Follow-up recorded", detail: "Keep track of which requests still need attention." },
  { number: "08", verb: "Setup improved", detail: "Use reviewed calls to refine the questions and answers." },
] as const

const productChapters = [
  {
    index: "01",
    label: "Answering",
    title: "A useful first conversation.",
    body: "Start with your services, hours, and service area. The receptionist answers from information you approve and asks for help when the answer is unclear.",
    points: ["Approved business information", "Short, natural conversations", "A clear fallback for unknowns"],
    visual: "reception",
  },
  {
    index: "02",
    label: "Service requests",
    title: "The details your team needs to call back.",
    body: "Capture the problem, location, callback number, and preferred timing. Your team confirms pricing and scheduling; a requested time is never presented as a booked visit.",
    points: ["Contact and service details", "Urgency and preferred timing", "No invented availability"],
    visual: "schedule",
  },
  {
    index: "03",
    label: "Human follow-up",
    title: "Know when a person should take over.",
    body: "Decide how urgent calls, existing appointments, and requests for a person should be handled. Start with a callback path; add live transfers only after the destination is tested.",
    points: ["Clear escalation rules", "An after-hours fallback", "No promised response time without approval"],
    visual: "messages",
  },
  {
    index: "04",
    label: "A focused pilot",
    title: "Prove one call flow before adding more.",
    body: "Begin with one useful job: collect a service request when your team cannot answer. Calendar booking, texts, and other connections are scoped and tested separately before they are offered to callers.",
    points: ["A small, agreed scope", "Realistic test calls", "Review before routing customer calls"],
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
          <a href="#demo">Demo</a>
          <a href="#how-it-works">How it works</a>
          <a href="#company">Company</a>
        </nav>
        <div className="ops-header__actions">
          <a href="#contact" className="ops-id-link">Discuss a pilot</a>
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
      <div className="hero-system" role="img" aria-label="Illustrative HVAC service request; not live customer data">
        <div className="hero-system__topbar">
          <span><i /> Illustrative example</span>
          <span>Not live customer data</span>
        </div>

        <div className="hero-callbar">
          <span className="hero-callbar__icon"><PhoneCall aria-hidden="true" /></span>
          <div><span>Incoming caller</span><strong>817-555-0184</strong></div>
          <time>00:22</time>
        </div>

        <div className="hero-live-grid">
          <div className="hero-conversation">
            <div className="hero-conversation__label"><span>Sample conversation</span><span>Illustrative only</span></div>
            <div className="hero-message hero-message--customer">
              <span>Customer · 00:04</span>
              <p>The AC is running, but the house is not cooling.</p>
            </div>
            <div className="hero-message hero-message--receptionist">
              <span>Mountline · 00:08</span>
              <p>What ZIP code is the property in?</p>
            </div>
            <div className="hero-message hero-message--customer hero-message--short">
              <span>Customer · 00:12</span>
              <p>76244.</p>
            </div>
          </div>

          <div className="hero-call-state">
            <div className="hero-call-state__label"><span>Sample capture</span><span>Recorded</span></div>
            <ol>
              <li><span>Issue</span><strong>AC not cooling</strong><i /></li>
              <li><span>Location</span><strong>ZIP 76244</strong><i /></li>
              <li><span>Service request</span><strong>Recorded</strong><i /></li>
              <li><span>Handoff</span><strong>Pending team follow-up</strong><i /></li>
            </ol>
          </div>
        </div>

        <div className="hero-system__status">
          <span><Image src="/brand/mountline-icon.svg" alt="" width={24} height={24} /> Inquiry saved</span>
          <strong>Details prepared for team follow-up</strong>
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
    ["00:07", "Intent identified", "AC service request"],
    ["00:11", "Location and urgency", "Service area and job details"],
    ["00:14", "Contact captured", "Callback information recorded"],
    ["00:19", "Inquiry saved", "Request ready for review"],
    ["00:22", "Handoff pending", "Team follow-up required"],
  ] as const

  return (
    <div className="demo-console" data-mtl-reveal="scene">
      <div className="demo-console__header">
        <div><i /><span>Illustrative example</span></div>
        <span>Not live customer data</span>
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
          <p>Try a realistic service call. Use fictional details; this is a demonstration, not an HVAC service line.</p>
          <ol>
            <li><span>01</span>“The AC is running but not cooling.”</li>
            <li><span>02</span>“Do you service homes in Keller?”</li>
            <li><span>03</span>“Could someone come tomorrow afternoon?”</li>
            <li><span>04</span>“Could a person call back?”</li>
          </ol>
        </div>
      </div>
      <div className="demo-console__footer">
        <span>Product demonstration</span>
        <span>Demo only · No real appointments or dispatch.</span>
        <a href={demoHref}>Call {demoNumber} <ArrowRight /></a>
      </div>
    </div>
  )
}

function OperationalProof() {
  return (
    <div className="proof-interface" data-mtl-reveal="scene">
      <div className="proof-interface__bar">
        <span><i /> Illustrative inquiry record</span>
        <span>Not live customer data</span>
      </div>
      <div className="proof-interface__grid">
        <div className="proof-transcript">
          <div className="proof-panel-label"><span>Conversation · source</span><span>01:47</span></div>
          <div className="transcript-line transcript-line--caller">
            <span>C</span>
            <p>The AC is running, but the house is not cooling.</p>
          </div>
          <div className="transcript-line transcript-line--agent">
            <span>M</span>
            <p>What ZIP code is the property in?</p>
          </div>
          <div className="transcript-line transcript-line--caller">
            <span>C</span>
            <p>76244. This is John. Could someone come tomorrow afternoon?</p>
          </div>
          <div className="transcript-line transcript-line--agent">
            <span>M</span>
            <p>Thanks, John. Your details are ready for the team to review.</p>
          </div>
          <div className="transcript-cursor"><i /> Inquiry captured</div>
        </div>
        <div className="proof-transform" aria-hidden="true">
          <span>Extract</span>
          <i /><i /><i /><i />
          <Image src="/brand/mountline-icon.svg" alt="" width={30} height={30} />
          <small>Route</small>
        </div>
        <aside className="proof-summary">
          <div className="proof-panel-label"><span>Sample intake · structured</span><span className="proof-status">Captured</span></div>
          <dl>
            <div><dt>Service</dt><dd>AC not cooling</dd></div>
            <div><dt>Priority</dt><dd>Needs review</dd></div>
            <div><dt>Preferred time</dt><dd>Tomorrow afternoon</dd></div>
            <div><dt>Customer</dt><dd>John · 76244</dd></div>
          </dl>
          <div className="proof-appointment">
            <CalendarDays aria-hidden="true" />
            <div><span>Service request recorded</span><strong>Team review required</strong></div>
            <Check aria-hidden="true" />
          </div>
          <div className="proof-sms">
            <MessageSquareText aria-hidden="true" />
            <div><span>Handoff state</span><strong>Awaiting team review</strong></div>
          </div>
        </aside>
      </div>
    </div>
  )
}

function ProductVisual({ type }: { type: string }) {
  if (type === "reception") {
    return (
      <div className="product-visual product-visual--reception" role="img" aria-label="Illustrative inquiry capture interface; not live customer data">
        <div className="visual-topline"><span>Illustrative example</span><span>Not live data</span></div>
        <div className="reception-caller"><PhoneCall /><div><span>New caller</span><strong>Service inquiry</strong></div></div>
        <div className="reception-wave" aria-hidden="true">{Array.from({ length: 18 }, (_, i) => <i key={i} />)}</div>
        <div className="reception-intent"><span>Caller intent</span><strong>Estimate request</strong><i>Captured</i></div>
        <div className="visual-action"><span>Route state</span><strong>Qualification started</strong><ChevronRight /></div>
      </div>
    )
  }

  if (type === "schedule") {
    return (
      <div className="product-visual product-visual--schedule" role="img" aria-label="Illustrative HVAC service intake; not live customer data">
        <div className="visual-topline"><span>Illustrative service request</span><span>Not live data</span></div>
        <dl className="intake-data">
          <div><dt>Service</dt><dd>AC not cooling</dd></div>
          <div><dt>Location</dt><dd>Within service area</dd></div>
          <div><dt>Access</dt><dd>Customer on site</dd></div>
        </dl>
        <div className="schedule-slots">
          <span>Preferred timing</span>
          <div><i>Mon</i><i className="is-selected">Tue</i><i>Wed</i></div>
        </div>
        <div className="visual-action"><CalendarDays /><strong>Ready for team review</strong><Check /></div>
      </div>
    )
  }

  if (type === "messages") {
    return (
      <div className="product-visual product-visual--messages" role="img" aria-label="Illustrative owner handoff states; not live customer data">
        <div className="visual-topline"><span>Illustrative handoff</span><span>Not live data</span></div>
        <div className="message-bubble message-bubble--system">Caller requested AC service in 76244. Preferred time: tomorrow afternoon.</div>
        <div className="message-bubble message-bubble--customer">Team follow-up is still required.</div>
        <div className="message-event"><Check /><div><span>Attempt recorded</span><strong>Follow-up needed</strong></div><span>10:22</span></div>
        <div className="message-compose"><span>Handoff pending</span><Check /></div>
      </div>
    )
  }

  return (
    <div className="product-visual product-visual--operations" role="img" aria-label="Illustrative inquiry evidence interface; not live customer data">
      <div className="visual-topline"><span>Illustrative records</span><span>Not live data</span></div>
      <div className="operations-queue">
        <div><span><i className="is-brass" /> Quote request</span><strong>Jordan M.</strong><small>Team review pending</small></div>
        <div><span><i /> Handoff attempt</span><strong>Casey R.</strong><small>Delivery unknown · 10:24</small></div>
        <div><span><i /> Website intake</span><strong>Morgan T.</strong><small>Estimate details captured</small></div>
      </div>
      <div className="operations-footer"><Route /><span>Requests and confirmed outcomes stay separate.</span></div>
    </div>
  )
}

function OperationsOverview() {
  return (
    <div className="overview-system" data-mtl-reveal="overview">
      <div className="overview-system__bar">
        <span>Illustrative inquiry trace</span>
        <span>Not live customer data</span>
      </div>
      <div className="overview-system__canvas">
        <svg className="overview-traces" viewBox="0 0 1200 560" preserveAspectRatio="none" aria-hidden="true">
          <path className="overview-trace overview-trace--one" d="M188 112H404C445 112 445 248 486 248H620" />
          <path className="overview-trace overview-trace--two" d="M188 268H620" />
          <path className="overview-trace overview-trace--three" d="M188 424H404C445 424 445 288 486 288H620" />
          <path className="overview-trace overview-trace--out" d="M620 268H725" />
        </svg>

        <div className="overview-source overview-source--call">
          <span>09:41 · Phone</span><strong>AC service request</strong><small>Jordan M. · AC not cooling</small>
        </div>
        <div className="overview-source overview-source--sms">
          <span>09:43 · Phone</span><strong>Callback requested</strong><small>Casey R. · after 2:00 PM</small>
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
            <li><time>09:44</time><i /><div><strong>Handoff attempted</strong><span>Casey R. · delivery unknown</span></div><small>Pending</small></li>
            <li><time>10:03</time><i /><div><strong>Estimate ready for review</strong><span>Morgan T. · website intake</span></div><small>Review</small></li>
            <li><time>10:20</time><i /><div><strong>Customer contacted</strong><span>Jordan M. · phone evidence</span></div><small>Recorded</small></li>
          </ol>
        </div>
      </div>
      <div className="overview-system__footer">
        <span>Phone</span><i />
        <span>Message</span><i />
        <span>Website</span>
        <strong>Separate evidence events</strong>
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
              <p className="ops-eyebrow"><span>Mountline AI reception</span> For service businesses.</p>
              <h1>AI receptionists<br /><em>for the calls</em><br />you can’t take.</h1>
              <p className="ops-hero__lede">AI receptionists for the calls your team cannot take. Mountline helps collect service requests, answer common questions, and prepare the next step for your team.</p>
              <div className="ops-actions">
                <a href={demoHref} className="ops-button ops-button--primary"><Phone className="size-4" /> Call the demo line</a>
                <a href="#contact" className="ops-button ops-button--quiet">Discuss a pilot <ArrowDown className="size-4" /></a>
              </div>
            </div>
            <HeroSystem />
          </div>
          <div className="ops-shell ops-hero__foot" data-mtl-hero="foot">
            <span>Try it now · {demoNumber}</span>
            <span>Fictional HVAC demo · No real appointments</span>
          </div>
        </section>

        <section className="demo-section" id="demo">
          <div className="ops-shell">
            <div className="demo-section__heading" data-mtl-reveal="copy">
              <p className="ops-kicker">01 / Call the demo line</p>
              <div>
                <h2>Meet North Texas Air &amp; Heat.</h2>
                <p>A fictional HVAC business, a familiar kind of call. Try a service question, describe an AC problem, or ask for a callback. Demo calls do not book real visits or dispatch a technician.</p>
              </div>
            </div>
            <a href={demoHref} className="demo-number" data-mtl-reveal="number" aria-label={`Call the Mountline demo line at ${demoNumber}`}>
              <span>{demoNumber}</span>
              <span className="demo-number__action"><PhoneCall /> Call now</span>
            </a>
            <p className="demo-boundary">The phone demo runs separately from this website. Calendar booking, text messages, and live transfers are not verified here. Please use made-up contact details.</p>
            <LiveDemoConsole />
            <a href="#contact" className="ops-text-link demo-next-step">Want a version for your business? Discuss a pilot <ArrowRight /></a>
          </div>
        </section>

        <section className="system-section" id="system">
          <div className="ops-shell">
            <div className="system-intro" data-mtl-reveal="copy">
              <p className="ops-kicker">02 / From call to recorded inquiry</p>
              <h2>A better starting point for the next call.</h2>
              <p>This is the call flow we build toward in a pilot. Your team confirms pricing and scheduling. Connections to your phone system and any other tools are tested before launch.</p>
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
              <p><strong>Inquiry captured</strong><i />Details recorded<i />Team follow-up pending</p>
            </div>
          </div>
        </section>

        <section className="products-section" id="products">
          <div className="ops-shell">
            <div className="products-heading" data-mtl-reveal="copy">
              <p className="ops-kicker">03 / What Mountline handles</p>
              <h2>Start with the calls you are missing.</h2>
              <p>A receptionist should know your business and its limits. We agree on both before setup.</p>
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
                <h2>A useful request, ready for a person.</h2>
                <p>The goal is a clear handoff: who called, what went wrong, and what needs attention. The example below shows the information a pilot is designed to collect.</p>
              </div>
            </div>
            <OperationalProof />
            <p className="proof-disclaimer">Illustrative interface · Sample records only; the phone demo is not connected to this display.</p>
          </div>
        </section>

        <section className="lifecycle-section" id="how-it-works">
          <div className="ops-shell lifecycle-grid">
            <div className="lifecycle-copy" data-mtl-reveal="copy">
              <p className="ops-kicker">05 / Step by step</p>
              <h2>From first conversation to a tested pilot.</h2>
              <p>A narrow setup is easier to test and easier for your team to trust. We work through these steps together before routing real customer calls.</p>
              <a href="#contact" className="ops-text-link">Tell us about your calls <ArrowRight /></a>
            </div>
            <ol className="lifecycle-list" data-mtl-reveal="lifecycle">
              <li><span>01</span><div><PhoneCall /><h3>Choose the first call flow.</h3><p>Missed calls, after-hours requests, or common service questions. Start where a better response would help most.</p></div></li>
              <li><span>02</span><div><UserRoundCheck /><h3>Approve the business details.</h3><p>Services, coverage, hours, pricing boundaries, and who should handle each kind of request.</p></div></li>
              <li><span>03</span><div><MessageSquareText /><h3>Listen and test together.</h3><p>Try ordinary calls, interruptions, urgent requests, and questions the receptionist cannot answer.</p></div></li>
              <li><span>04</span><div><Route /><h3>Confirm the handoff.</h3><p>Test where requests go and what happens when a person or connected tool is unavailable.</p></div></li>
              <li><span>05</span><div><CalendarDays /><h3>Launch a limited pilot.</h3><p>Agree on scope and cost before launch. Review calls and improve the setup before expanding it.</p></div></li>
            </ol>
          </div>
        </section>

        <section className="overview-section" id="visibility">
          <div className="ops-shell overview-heading" data-mtl-reveal="copy">
            <p className="ops-kicker">06 / Calls, messages, and next steps</p>
            <h2>Keep the next step in view.</h2>
            <p>A captured request is only the beginning. Your team still needs to review it, call back, and confirm the work. This example shows those steps separately.</p>
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
              <p>Automation should remove repetitive work without making customers feel like they’re talking to a machine. Mountline is built around clear conversations, useful handoffs, and giving callers a clear way to request a person.</p>
              <div className="company-principles">
                <span><i>01</i> Clear answers based on approved information.</span>
                <span><i>02</i> A clear path to request a person.</span>
                <span><i>03</i> Direct support from the person building the system.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="pilot-faq" aria-labelledby="pilot-faq-heading">
          <div className="ops-shell">
            <p className="ops-kicker">Before the pilot</p>
            <h2 id="pilot-faq-heading">A few practical questions.</h2>
            <details><summary>Can the business keep its current number?</summary><p>That is the starting point. We check your phone provider’s forwarding options and test a limited route, such as unanswered calls, before changing how customers reach you.</p></details>
            <details><summary>Does the demo book real appointments?</summary><p>No. North Texas Air &amp; Heat is fictional. The demo is for trying a conversation. In a pilot, your team confirms appointments unless a real calendar connection has been separately configured and tested.</p></details>
            <details><summary>What happens when a caller needs a person?</summary><p>We agree on a callback or transfer path and an after-hours fallback. Urgent or unsafe situations have separate instructions. The receptionist should never pretend that a technician has been dispatched.</p></details>
            <details><summary>What does a pilot cost?</summary><p>We confirm setup, ongoing costs, and any call-usage charges after reviewing your call flow. You receive the scope and price before deciding to proceed.</p></details>
          </div>
        </section>

        <section className="final-section" id="contact">
          <div className="ops-shell">
            <div className="final-section__label"><span>Mountline</span><span>Keller, Texas · Working with service businesses</span></div>
            <div className="final-section__copy" data-mtl-reveal="copy">
              <h2>Put your phone line<br /><em>to work.</em></h2>
              <p>Tell us what happens when nobody can answer. We’ll review the call flow and reply by email with a practical starting point.</p>
            </div>
            <PilotRequestForm />
            <div className="final-section__actions" data-mtl-reveal="actions">
              <a href={demoHref} className="final-action final-action--call"><span><PhoneCall /> Demo line</span><strong>{demoNumber}</strong><ArrowRight /></a>
              <a href="mailto:hello@mountline.dev?subject=Mountline%20system%20inquiry" className="final-action"><span><Mail /> Start a conversation</span><strong>hello@mountline.dev</strong><ArrowRight /></a>
            </div>
          </div>
        </section>
      </main>

      <footer className="ops-footer">
        <div className="ops-shell ops-footer__grid">
          <div><BrandLogo footer /><p>AI receptionist pilots for service businesses. Clear conversations. Useful follow-up.</p></div>
          <nav aria-label="Footer navigation"><a href="#demo">Demo</a><a href="#how-it-works">How it works</a><a href="#company">Company</a><a href={demoHref}>Demo line</a></nav>
          <div><a href={demoHref}>{demoNumber}</a><a href="mailto:hello@mountline.dev">hello@mountline.dev</a><Link href="/id">Mountline ID</Link></div>
        </div>
        <div className="ops-shell ops-footer__bottom"><span>© {new Date().getFullYear()} Mountline</span><span>Built for service businesses.</span></div>
      </footer>
    </div>
  )
}
