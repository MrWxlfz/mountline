import {
  ArrowRight,
  BellRing,
  CalendarCheck,
  Check,
  Clock3,
  MessageSquareText,
  PhoneMissed,
} from "lucide-react"

const journey = [
  ["01", "A customer reaches out", "Call, form, or estimate request"],
  ["02", "A useful response goes out", "Prompt and professional"],
  ["03", "The right person knows", "Context and next action included"],
  ["04", "Follow-up keeps moving", "Only where appropriate"],
  ["05", "The outcome stays clear", "Booked, closed, or later"],
] as const

export function LeadRecoveryScene() {
  return (
    <div className="mtl-inquiry-journey">
      <div className="mtl-inquiry-label">
        <span><i /> Illustrative workflow</span>
        <span>No customer data</span>
      </div>

      <ol className="mtl-inquiry-steps" aria-label="Inquiry response journey">
        {journey.map(([number, title, copy], index) => (
          <li key={number} className={index === 0 ? "is-active" : undefined}>
            <span>{number}</span>
            <strong>{title}</strong>
            <small>{copy}</small>
          </li>
        ))}
      </ol>

      <div className="mtl-inquiry-scene">
        <section className="mtl-missed-call" aria-label="Illustrative missed call">
          <div className="mtl-inquiry-icon"><PhoneMissed className="size-5" aria-hidden="true" /></div>
          <div>
            <small>Missed call</small>
            <h3>Estimate request</h3>
            <p>A new inquiry arrived while the team was busy.</p>
          </div>
          <time>10:42 AM</time>
        </section>

        <span className="mtl-inquiry-connector" aria-hidden="true"><i /><ArrowRight className="size-4" /></span>

        <section className="mtl-response-card" aria-label="Illustrative professional response">
          <div className="mtl-response-from">
            <span><MessageSquareText className="size-4" aria-hidden="true" /> Business response</span>
            <small>Sent</small>
          </div>
          <blockquote>
            Thanks for calling. We can help with an estimate. What address and
            callback time work best?
          </blockquote>
          <div className="mtl-response-status"><Check className="size-3.5" aria-hidden="true" /> Customer has a clear next step</div>
        </section>

        <span className="mtl-inquiry-connector" aria-hidden="true"><i /><ArrowRight className="size-4" /></span>

        <div className="mtl-inquiry-outcomes">
          <section>
            <BellRing className="size-4" aria-hidden="true" />
            <span><small>Team notification</small><strong>New callback ready</strong></span>
            <i />
          </section>
          <section>
            <Clock3 className="size-4" aria-hidden="true" />
            <span><small>Next action</small><strong>Call after 3:00 PM</strong></span>
            <span>Open</span>
          </section>
          <section>
            <CalendarCheck className="size-4" aria-hidden="true" />
            <span><small>Clear outcome</small><strong>Estimate booked</strong></span>
            <Check className="size-4" aria-hidden="true" />
          </section>
        </div>
      </div>
    </div>
  )
}
