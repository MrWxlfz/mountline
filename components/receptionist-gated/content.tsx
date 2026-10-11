import { receptionist as r } from "@/content/receptionist"
import { BookButton } from "@/components/site/booking"
import { Footer } from "@/components/site/footer"
import { CheckIcon, PhoneCallIcon } from "@/components/site/icons"
import { Nav } from "@/components/site/nav"
import { RevealObserver } from "@/components/site/reveal-observer"
import { CallDemo } from "@/components/receptionist-gated/call-demo"
import { DemoQr } from "@/components/receptionist-gated/demo-qr"

/**
 * The early-access receptionist page, shown only after the password gate. Server component: its copy
 * (content/receptionist.ts) never ships in a client bundle. Uses the homepage's classes (.mk-home)
 * plus a few of its own (.mk-rx, in marketing.css).
 */
export function ReceptionistContent() {
  const live = r.capabilities.items.filter((item) => item.live)
  return (
    <div className="mk-home mk-rx">
      <Nav links={[]} homeHref="/" />
      <main className="wrap" id="main-content">
        <section className="rx-hero" id="top">
          <div>
            <span className="pill-soon"><i aria-hidden="true" />{r.hero.pill}</span>
            <h1>{r.hero.title}</h1>
            <p className="lead">{r.hero.lead}</p>
            <div className="btns">
              <a className="btn btn-dark btn-lg hit" href={r.demo.phoneHref}><PhoneCallIcon />{r.hero.call}</a>
              <BookButton className="btn btn-light btn-lg hit">{r.hero.book}</BookButton>
            </div>
          </div>
          <div className="rx-line">
            <span className="rx-line-label">{r.hero.numberLabel}</span>
            <a className="rx-number" href={r.demo.phoneHref}>{r.demo.displayPhone}</a>
            <span className="rx-line-biz">{r.demo.businessName}</span>
            <div className="rx-qr">
              <DemoQr />
              <span>{r.hero.qrNote}</span>
            </div>
            <p className="rx-line-note">{r.hero.numberNote}</p>
          </div>
        </section>

        <section className="rx-hear" id="hear">
          <div className="how-h rv">
            <span className="eyebrow">{r.hear.eyebrow}</span>
            <h2 style={{ marginTop: 14 }}>{r.hear.title}</h2>
            <p className="lead">{r.hear.lead}</p>
          </div>
          <div className="rx-stage rv">
            <CallDemo
              label={r.hear.label}
              business={r.hear.business}
              situation={r.hear.situation}
              turns={r.hear.turns}
              request={r.hear.request}
              requestTitle={r.hear.requestTitle}
              requestTime={r.hear.requestTime}
              next={r.hear.next}
              nextLabel={r.hear.nextLabel}
              replay={r.hear.replay}
              agent={r.hear.agent}
              caller={r.hear.caller}
            />
          </div>
        </section>

        <section className="how" id="how">
          <div className="how-h rv">
            <span className="eyebrow">{r.steps.eyebrow}</span>
            <h2 style={{ marginTop: 14 }}>{r.steps.title}</h2>
          </div>
          <div className="bento rv">
            {r.steps.items.map((step) => (
              <div className="cell" key={step.n}>
                <div>
                  <span className="n">{step.n}</span>
                  <h3>{step.title}</h3>
                  <p>{step.body}</p>
                </div>
                <div className="vg" aria-hidden="true">
                  {"greeting" in step ? (
                    <div className="rx-vg-call">
                      <span className="rx-ring"><PhoneCallIcon /></span>
                      <p className="ln ai">{step.greeting}</p>
                    </div>
                  ) : "questions" in step ? (
                    <div className="rx-vg-qs">{step.questions.map((q) => <span className="chip" key={q}>{q}</span>)}</div>
                  ) : "routes" in step ? (
                    <div className="rx-vg-routes">
                      <span className="rx-vg-req"><b>New call request</b><i /><i /></span>
                      <span className="rx-vg-arrow" />
                      <span className="rx-vg-dest">{step.routes.map((route) => <span key={route}>{route}</span>)}</span>
                    </div>
                  ) : (
                    <div className="rx-vg-card">
                      {r.hear.request.map((field) => (
                        <div key={field.key}><span>{field.label}</span><b>{field.value}</b></div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rx-split" id="get">
          <div className="rv">
            <span className="eyebrow">{r.capabilities.eyebrow}</span>
            <h2 style={{ marginTop: 14 }}>{r.capabilities.title}</h2>
            <ul className="rx-list">
              {live.map((item) => <li key={item.label}><CheckIcon width={1.6} />{item.label}</li>)}
            </ul>
          </div>
          <div className="rv">
            <span className="eyebrow">{r.setup.eyebrow}</span>
            <h2 style={{ marginTop: 14 }}>{r.setup.title}</h2>
            <ol className="rx-setup">
              {r.setup.items.map((item) => (
                <li key={item.n}><span className="n">{item.n}</span><div><b>{item.title}</b><p>{item.body}</p></div></li>
              ))}
            </ol>
          </div>
        </section>

        <section className="soon-wrap" id="pricing">
          <div className="soon-card rx-price rv">
            <div>
              <span className="pill-soon"><i aria-hidden="true" />{r.pricing.pill}</span>
              <h2>{r.pricing.title}</h2>
              <p className="lead">{r.pricing.body}</p>
            </div>
            <div className="btns rx-price-cta">
              <BookButton className="btn btn-dark btn-lg hit">{r.pricing.cta}</BookButton>
            </div>
          </div>
        </section>

        <section className="cta rv" id="contact">
          <span className="rx-ring rx-ring-lg" aria-hidden="true"><PhoneCallIcon /></span>
          <h2>{r.final.title}</h2>
          <p className="lead">{r.final.lead}</p>
          <div className="btns">
            <BookButton className="btn btn-dark btn-lg hit">{r.final.book}</BookButton>
            <a className="btn btn-light btn-lg hit" href={r.demo.phoneHref}>{r.final.call}</a>
          </div>
        </section>
      </main>
      <div className="wrap">
        <Footer base="/" note={r.footerNote} />
      </div>
      <RevealObserver />
    </div>
  )
}
