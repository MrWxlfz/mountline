import { BookButton } from "@/components/site/booking"
import { site } from "@/content/site"

export function ReceptionistSoon() {
  const { receptionist: r } = site
  return (
    <section className="soon-wrap" id="early">
      <div className="soon-card rv">
        <div>
          <span className="pill-soon"><i aria-hidden="true" />{r.pill}</span>
          <h2>{r.title}</h2>
          <p className="lead">{r.lead}</p>
          <div className="btns"><BookButton className="btn btn-dark hit">{r.cta}</BookButton></div>
        </div>
        <div className="call" role="group" aria-label={r.call.label}>
          <div className="call-h"><b><i aria-hidden="true" />{r.call.title}</b><span>{r.call.when}</span></div>
          {r.call.lines.map((line) => (
            <div key={line.text} className={line.who === "ai" ? "ln ai" : "ln cl"}>{line.text}</div>
          ))}
          <div className="sms">
            <span className="av d" aria-hidden="true">{site.what.app.clientInitial}</span>
            <span><b>{r.call.smsTitle}</b>{r.call.sms}</span>
          </div>
        </div>
      </div>
    </section>
  )
}
