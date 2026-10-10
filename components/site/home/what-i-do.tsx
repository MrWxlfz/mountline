import { BookButton } from "@/components/site/booking"
import { ArrowRightIcon, FeatIcon } from "@/components/site/icons"
import { ServiceTabs } from "@/components/site/home/service-tabs"
import { site } from "@/content/site"

export function WhatIDo() {
  const { what } = site
  return (
    <section className="what" id="what">
      <div className="what-l rv">
        <a className="eyebrow hit" href="#what">{what.eyebrow}<ArrowRightIcon /></a>
        <h2>{what.title}</h2>
        <p className="lead">{what.lead}</p>
        <div className="btns">
          <BookButton className="btn btn-dark hit">{site.cta.book}</BookButton>
          <a className="btn btn-light hit" href={what.secondary.href}>{what.secondary.label}</a>
        </div>
        <div className="feats">
          {what.feats.map((feat) => (
            <div className="feat" key={feat.label}>
              <FeatIcon name={feat.icon} />
              {feat.label}
              {"soon" in feat ? <span className="soon">{feat.soon}</span> : null}
            </div>
          ))}
        </div>
      </div>

      <ServiceTabs />
    </section>
  )
}
