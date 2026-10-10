import { BookButton } from "@/components/site/booking"
import { ServiceDots } from "@/components/site/icons"
import { mailtoHref, site } from "@/content/site"

export function FinalCta() {
  const { final } = site
  return (
    <section className="cta rv" id="contact">
      <div className="dots bob" aria-hidden="true">
        <ServiceDots />
      </div>
      <h2>{final.title}</h2>
      <p className="lead">{final.lead}</p>
      <div className="btns">
        <BookButton className="btn btn-dark btn-lg hit">{final.book}</BookButton>
        <a className="btn btn-light btn-lg hit" href={mailtoHref}>{site.contact.email}</a>
      </div>
    </section>
  )
}
