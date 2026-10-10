import type { CSSProperties } from "react"
import { BookButton } from "@/components/site/booking"
import { BagIcon, CheckIcon, ServiceDots, ToastCheckIcon } from "@/components/site/icons"
import { RebrandNotice } from "@/components/site/rebrand-notice"
import { rebrandNoticeActive, site } from "@/content/site"

const i = (n: number) => ({ "--i": n }) as CSSProperties

export function Hero() {
  const { hero } = site
  const { site: bakery, google, toast } = hero
  return (
    <section className="hero" id="top">
      <div className={rebrandNoticeActive() ? "hero-top has-rebrand" : "hero-top"}>
        <div className="dots bob" id="heroDots" aria-hidden="true">
          <ServiceDots full />
        </div>
        <RebrandNotice afterIntro delay={700} />
      </div>
      <h1 className="ia" style={i(0)}>{hero.title}</h1>
      <p className="lead ia" style={i(1)}>{hero.lead}</p>
      <div className="btns ia" style={i(2)}>
        <BookButton className="btn btn-dark btn-lg hit">{hero.book}</BookButton>
        <a className="btn btn-light btn-lg hit" href={hero.secondary.href}>{hero.secondary.label}</a>
      </div>
      <div className="trust ia" style={i(3)}>
        {hero.trust.map((item) => (
          <span key={item}><CheckIcon />{item}</span>
        ))}
      </div>

      <div className="stage" role="img" aria-label={hero.stageLabel}>
        <div className="win w-site" aria-hidden="true">
          <div className="win-bar"><i /><i /><i /><span className="url">{bakery.url}</span></div>
          <div className="bk">
            <div className="bk-nav">
              <span className="bk-logo">{bakery.logo}</span>
              <span className="bk-links">
                {bakery.links.map((link) => <span key={link}>{link}</span>)}
                <b className="bk-order">{bakery.order}</b>
              </span>
            </div>
            <div className="bk-body">
              <div>
                <div className="bk-eye">{bakery.eyebrow}</div>
                <h4>{bakery.headlineStart}<em>{bakery.headlineEm}</em>{bakery.headlineEnd}</h4>
                <p>{bakery.body}</p>
                <div className="bk-row"><b>{bakery.pickup}</b><span className="bk-open">{bakery.open}</span></div>
              </div>
              <div className="bk-menu">
                <h5>{bakery.menuTitle}</h5>
                {bakery.menu.map((row) => (
                  <div key={row.item}>
                    {"soldOut" in row ? (
                      <span><s>{row.item}</s><span className="sold">{bakery.soldOut}</span></span>
                    ) : (
                      <span>{row.item}</span>
                    )}
                    <span>{row.price}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="win w-gbp" aria-hidden="true">
          <div className="win-bar"><i /><i /><i /><span>{google.bar}</span></div>
          <div className="gbp-map" />
          <div className="gbp">
            <b>{google.name}</b>
            <div className="meta">{google.meta}</div>
            <div className="open"><em>{google.open}</em>{google.closes}</div>
            <div className="gbp-acts">{google.actions.map((action) => <span key={action}>{action}</span>)}</div>
            <div className="pt">
              <div className="pt-h"><b>{google.popular}</b><span>{google.day}</span></div>
              <div className="pt-bars">
                {google.bars.map((bar, n) => (
                  <i key={n} className={"now" in bar ? "now" : undefined} style={{ "--h": `${bar.h}%` } as CSSProperties} />
                ))}
              </div>
              <div className="pt-x">{google.hours.map((hour) => <span key={hour}>{hour}</span>)}</div>
            </div>
          </div>
        </div>

        <div className="toast" aria-hidden="true">
          <span className="ti"><BagIcon /></span>
          <b>{toast.title}</b><span>{toast.detail}</span>
          <span className="ok"><ToastCheckIcon /></span>
        </div>
      </div>
    </section>
  )
}
