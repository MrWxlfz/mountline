import "./bramble.css"

/**
 * The "before" in the design demonstration: the kind of first website a small business often has.
 * Same made-up business, same facts, same 555-01xx number as Bramble's new site. Nothing here is
 * modeled on a real business or on any particular website builder. Like the new site, it is a
 * picture of a website: hidden from assistive tech, and nothing in it can be focused or submitted.
 *
 * It is laid out for a computer only. On a phone it's simply shrunk to fit, which is the problem.
 */

export type BeforeTarget = "top" | "services" | "hours" | "book"

function Paw() {
  return (
    <svg viewBox="0 0 40 40" className="bo-paw" aria-hidden="true" focusable="false">
      <ellipse cx="20" cy="27" rx="9" ry="7.5" />
      <ellipse cx="9" cy="17" rx="4" ry="5" />
      <ellipse cx="16" cy="10" rx="4" ry="5.2" />
      <ellipse cx="24" cy="10" rx="4" ry="5.2" />
      <ellipse cx="31" cy="17" rx="4" ry="5" />
    </svg>
  )
}

export function BrambleBefore({ fit }: { fit: "desktop" | "mobile" }) {
  return (
    <div className="bo" data-fit={fit} data-nosnippet="" aria-hidden="true" inert>
      <div className="bo-page">
        <div className="bo-banner" data-target="top">
          <Paw />
          <span className="bo-name">Bramble Dog Grooming</span>
          <span className="bo-tag">Keller, Texas</span>
        </div>
        <div className="bo-nav">
          <span>Home</span><span>|</span><span>About Us</span><span>|</span><span>Services</span><span>|</span><span>Gallery</span><span>|</span><span>Contact Us</span>
        </div>
        <div className="bo-main">
          <span className="bo-h1">Welcome to Bramble Dog Grooming!</span>
          <span className="bo-art"><Paw /><Paw /><Paw /></span>
          <span className="bo-p">
            We are a dog grooming business located in Keller Texas. We love dogs and we love what we do! We groom dogs
            of all sizes and breeds. Our goal is to make your dog look and feel their best. Please look around our
            website to learn more about us and our services. We look forward to meeting you and your furry friend!
          </span>
          <span className="bo-h2" data-target="services">Our Services</span>
          <span className="bo-p">
            We offer baths, haircuts, nail trims and more for dogs of all sizes. Prices vary depending on the size and
            coat of your dog. Please call for pricing.
          </span>
          <span className="bo-h2" data-target="book">Appointments</span>
          <span className="bo-p">Please call us during business hours to make an appointment. Thank you!</span>
        </div>
        <div className="bo-foot" data-target="hours">
          <span>Bramble Dog Grooming · 1120 Lantern Way, Keller TX</span>
          <span>Phone: (817) 555-0164 · Hours: Tues-Fri 8am-5pm, Sat 8am-2pm</span>
          <span>© Bramble Dog Grooming. All rights reserved.</span>
        </div>
      </div>
    </div>
  )
}
