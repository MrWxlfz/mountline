import { Check, Phone } from "lucide-react"
import { DemoQr } from "@/components/homepage/demo-qr"
import { Landscape } from "@/components/homepage/landscape"
import { TestRound } from "@/components/homepage/test-round"
import { callContext } from "@/lib/homepage/benchmarks"
import { controls, pilotSteps, tryPrompts, type ControlExample } from "@/lib/homepage/content"
import { receptionistDemo } from "@/lib/receptionist/demo"

const demoNumber = receptionistDemo.displayPhone
const demoHref = receptionistDemo.phoneHref
const pad = (index: number) => String(index + 1).padStart(2, "0")

/** The limits of the public demo, stated wherever the demo is offered. */
export function DemoFinePrint({ className = "ml-demo__fine" }: { className?: string }) {
  return (
    <p className={className}>
      North Texas Air &amp; Heat is a fictional HVAC business.{" "}
      Demo calls do not book real visits or dispatch a technician.{" "}
      Calendar booking, text messages, and live transfers are not verified here.{" "}
      Please use made-up details. Nobody will call you back.
    </p>
  )
}

/** The same limits, folded into a short disclosure beside the homepage's demo line. */
export function DemoLimits() {
  return (
    <details className="cc-transcript hp-limits">
      <summary>
        What the demo can and can’t do
        <i aria-hidden="true" />
      </summary>
      <DemoFinePrint className="hp-limits__text" />
    </details>
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

export function ControlSection() {
  return (
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
            <li key={item.label}>
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
  )
}

export function CallItSection() {
  return (
    <section className="ml-demo" id="demo" aria-labelledby="demo-title">
      <Landscape variant="night" id="demo-scene" className="ml-demo__scene" horizon={0.16} />
      <div className="ml-container ml-demo__inner">
        <div className="ml-demo__call" data-mtl-reveal>
          <h2 id="demo-title">Don’t take our word for it. <em>Call it.</em></h2>
          <p className="ml-demo__business">
            <strong>North Texas Air &amp; Heat</strong>
            <span>Fictional HVAC demo · a real call to the AI receptionist</span>
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
          <DemoFinePrint />
        </div>
      </div>
    </section>
  )
}

export function TestingSection() {
  return (
    <section className="ml-section ml-testing" id="testing" aria-labelledby="testing-title">
      <div className="ml-container">
        <div className="ml-testing__head" data-mtl-reveal>
          <h2 id="testing-title">We call it before your customers do.</h2>
          <div>
            <p>
              Before it answers a single real customer, we call it ourselves: the normal calls, the strange ones, and
              the ones that could go wrong.
            </p>
            <p>If something misses, it gets fixed and called again. Then you try it too.</p>
          </div>
        </div>
        <TestRound />
      </div>
    </section>
  )
}

/** One sourced figure, stated plainly, with what it does and doesn't say. */
export function ContextNote() {
  const source = callContext.source
  return (
    <section className="ml-section ml-context" id="context" aria-labelledby="context-title">
      <div className="ml-container ml-context__grid">
        <h2 id="context-title" className="ml-context__title">Why the calls you miss matter</h2>
        <div className="ml-context__body">
          <p className="ml-context__claim">
            In a survey of 1,000 U.S. consumers published by CallRail, <strong>{callContext.value}%</strong> {callContext.claim}.
          </p>
          <p className="ml-context__caveat">
            That’s industry research, not a Mountline result, and it doesn’t mean every missed call is a lost customer.
            CallRail sells call-tracking software.{" "}
            <a href={source.url} className="ml-link" target="_blank" rel="noopener noreferrer">Read the source</a>{" "}
            ({source.publisher}, {new Date(`${source.published}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })}).
          </p>
        </div>
      </div>
    </section>
  )
}

export function PilotSection() {
  return (
    <section className="ml-section ml-pilot" id="pilot" aria-labelledby="pilot-title">
      <div className="ml-container">
        <div className="ml-head" data-mtl-reveal>
          <h2 id="pilot-title">How a pilot works</h2>
          <p>
            One kind of call to start, set up with you and tested by you. Scope and price are agreed in writing before
            anything begins.
          </p>
        </div>
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
        <p className="ml-pilot__out">
          <span>Not working for you?</span> Turn call forwarding off and your phone works exactly the way it does today.
        </p>
      </div>
    </section>
  )
}
