import Image from "next/image"
import { ArrowRight, Mail, MessageSquare } from "lucide-react"
import { BookButton } from "@/components/site/booking"
import { HeroBuild } from "@/components/site/vignettes/hero-build"
import { mailtoHref, site, smsHref } from "@/content/site"

export function Hero() {
  const { hero, person, cta } = site
  const sms = smsHref()

  return (
    <section id="hero" className="mk-hero" aria-labelledby="hero-title">
      <div className="mk-container mk-hero__grid">
        <div className="mk-hero__copy">
          <p className="mk-hero__hello">
            <Image src={person.avatar} alt="" width={44} height={44} priority className="mk-hero__avatar" />
            <span>{hero.greeting}</span>
          </p>
          <h1 id="hero-title" className="mk-hero__title">
            {hero.titleStart} <em>{hero.titleAccent}</em>{" "}
            <span className="mk-hero__second">{hero.titleSecond}</span>
          </h1>
          <p className="mk-hero__sub">{hero.sub}</p>
          <div className="mk-hero__actions">
            <BookButton className="mk-btn mk-btn--primary">
              {cta.bookLong} <ArrowRight className="mk-btn__go" aria-hidden="true" />
            </BookButton>
            {sms ? (
              <a href={sms} className="mk-btn mk-btn--secondary"><MessageSquare aria-hidden="true" />{cta.text}</a>
            ) : (
              <a href={mailtoHref} className="mk-btn mk-btn--secondary"><Mail aria-hidden="true" />{cta.email}</a>
            )}
          </div>
        </div>
        <HeroBuild demo={hero.demo} />
      </div>
    </section>
  )
}
