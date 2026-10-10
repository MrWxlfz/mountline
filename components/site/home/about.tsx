import Image from "next/image"
import { BookButton } from "@/components/site/booking"
import { mailtoHref, site } from "@/content/site"

export function About() {
  const { about, person } = site
  return (
    <section className="about" id="about">
      <div className="portrait rv">
        <Image
          src={person.photo}
          alt={person.photoAlt}
          fill
          sizes="(max-width: 980px) calc(100vw - 32px), 562px"
          style={{ objectFit: "cover" }}
        />
        <div className="tag">
          <span className="av l" aria-hidden="true">{person.initial}</span>
          <span><b>{person.name}</b><span>{person.town}</span></span>
        </div>
      </div>
      <div className="rv">
        <span className="eyebrow">{about.eyebrow}</span>
        <h2 style={{ marginTop: 14 }}>{about.title}</h2>
        {about.body.map((paragraph) => <p className="lead" key={paragraph}>{paragraph}</p>)}
        <div className="btns">
          <BookButton className="btn btn-dark hit">{site.cta.book}</BookButton>
          <a className="btn btn-light hit" href={mailtoHref}>{site.contact.email}</a>
        </div>
      </div>
    </section>
  )
}
