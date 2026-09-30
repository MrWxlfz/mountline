import { SamplePhoto } from "@/components/homepage/sample-photo"
import type { SamplePhotoId } from "@/lib/homepage/sample-photos"
import "./bramble.css"

/**
 * Bramble: a design demonstration Mountline made for a fictional dog groomer, to show what a finished
 * small-business website can look like. The business, its address, prices, and phone number
 * (a 555-01xx number) are all made up, and its photos are licensed sample images
 * (lib/homepage/sample-photos.ts). It is drawn as a picture of a website: nothing in it is
 * focusable, and nothing in it submits anywhere.
 *
 * Sizes are written in design pixels (`--u`), so the page lays out at any frame size exactly as
 * designed: 1280 units wide on a computer, 390 on a phone.
 */

export type BrambleView = "desktop" | "mobile"
export type BrambleTarget = "top" | "services" | "hours" | "book"

const phone = "(817) 555-0164"

const services = [
  { name: "Bath & tidy", body: "Bath, blow-dry, nails, ears, and a neat trim around the face and feet.", time: "1½–2 hrs", price: "from $55" },
  { name: "Full groom", body: "Everything in the bath & tidy, plus a full haircut in the style you ask for.", time: "2–3 hrs", price: "from $75" },
  { name: "Puppy’s first groom", body: "A short, gentle visit for puppies under six months, to get used to the table and dryer.", time: "About 1 hr", price: "$40" },
  { name: "Nail trim", body: "Walk in Tuesday to Friday, 8 to 10 in the morning. No appointment needed.", time: "10 min", price: "$15" },
] as const

const gallery: SamplePhotoId[] = ["room", "dryer", "result"]

const hours = [
  { day: "Monday", time: "Closed" },
  { day: "Tuesday", time: "8:00 – 5:00" },
  { day: "Wednesday", time: "8:00 – 5:00", today: true },
  { day: "Thursday", time: "8:00 – 5:00" },
  { day: "Friday", time: "8:00 – 5:00" },
  { day: "Saturday", time: "8:00 – 2:00" },
  { day: "Sunday", time: "Closed" },
] as const

function Brand({ small = false }: { small?: boolean }) {
  return (
    <span className={small ? "bx-brand bx-brand--small" : "bx-brand"}>
      <span className="bx-brand__name">Bramble</span>
      <span className="bx-brand__trade">Dog grooming</span>
    </span>
  )
}

function StreetMap() {
  return (
    <svg className="bx-map__art" viewBox="0 0 400 260" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="400" height="260" fill="#ebe3d2" />
      <path d="M-10 70 C120 90 220 40 410 60" stroke="#fffaf1" strokeWidth="18" fill="none" />
      <path d="M-10 190 C140 170 260 210 410 176" stroke="#fffaf1" strokeWidth="14" fill="none" />
      <path d="M150 -10 C160 90 130 170 170 270" stroke="#fffaf1" strokeWidth="14" fill="none" />
      <path d="M300 -10 C290 80 320 180 300 270" stroke="#fffaf1" strokeWidth="10" fill="none" />
      <path d="M190 90 C230 110 262 118 300 116" stroke="#fffaf1" strokeWidth="8" fill="none" />
      <path d="M20 100 H120 V160 H20 Z" fill="#d6dfc8" rx="10" />
      <circle cx="238" cy="112" r="34" fill="#c4613a" opacity="0.14" />
      <path d="M238 78 C222 78 212 90 212 104 C212 124 238 146 238 146 C238 146 264 124 264 104 C264 90 254 78 238 78 Z" fill="#c4613a" />
      <circle cx="238" cy="104" r="9" fill="#fbf7ef" />
    </svg>
  )
}

function Field({ label, value, wide = false, placeholder = false }: { label: string; value: string; wide?: boolean; placeholder?: boolean }) {
  return (
    <span className={wide ? "bx-field bx-field--wide" : "bx-field"}>
      <span className="bx-field__label">{label}</span>
      <span className="bx-field__box" data-placeholder={placeholder || undefined}>{value}</span>
    </span>
  )
}

function Desktop({ photo, focus, eager }: { photo: SamplePhotoId; focus?: BrambleTarget; eager?: boolean }) {
  return (
    <div className="bx-page bx-page--desktop">
      <div className="bx-nav" data-target="top">
        <Brand />
        <span className="bx-nav__links">
          <span>Services</span>
          <span>Hours</span>
          <span>Visit</span>
        </span>
        <span className="bx-nav__end">
          <span className="bx-nav__phone">{phone}</span>
          <span className="bx-button">Request a visit</span>
        </span>
      </div>

      <div className="bx-hero">
        <div className="bx-hero__copy">
          <span className="bx-eyebrow">Keller, Texas · By appointment</span>
          <span className="bx-display">Calm, careful dog grooming in Keller.</span>
          <span className="bx-lede">One dog at a time, in a quiet room. Most grooms take two to three hours, and we’ll text you when yours is ready.</span>
          <span className="bx-actions">
            <span className="bx-button bx-button--lg">Request an appointment</span>
            <span className="bx-button bx-button--line bx-button--lg">Call {phone}</span>
          </span>
          <span className="bx-open"><i />Open today until 5:00 <span>·</span> 1120 Lantern Way</span>
        </div>
        <span className="bx-photo">
          <SamplePhoto id={photo} sizes="(max-width: 760px) 1px, 40vw" className="bx-photo__art" eager={eager} />
        </span>
      </div>

      <div className="bx-section bx-services" data-target="services" data-focus={focus === "services" || undefined}>
        <span className="bx-section__head">
          <span className="bx-title">Services</span>
          <span className="bx-note">Prices depend on size and coat. We’ll confirm yours when you book.</span>
        </span>
        <span className="bx-menu">
          {services.map((item) => (
            <span key={item.name} className="bx-menu__row">
              <span className="bx-menu__name">{item.name}</span>
              <span className="bx-menu__body">{item.body}</span>
              <span className="bx-menu__time">{item.time}</span>
              <span className="bx-menu__price">{item.price}</span>
            </span>
          ))}
        </span>
      </div>

      <div className="bx-section bx-gallery">
        <span className="bx-section__head">
          <span className="bx-title">Inside Bramble</span>
          <span className="bx-note">One quiet grooming room, and plenty of time for each dog.</span>
        </span>
        <span className="bx-gallery__row">
          {gallery.map((id) => (
            <span key={id} className="bx-gallery__photo"><SamplePhoto id={id} sizes="20vw" className="bx-photo__art" /></span>
          ))}
        </span>
      </div>

      <div className="bx-section bx-visit" data-target="hours" data-focus={focus === "hours" || undefined}>
        <span className="bx-hours">
          <span className="bx-title">Hours</span>
          <span className="bx-hours__list">
            {hours.map((row) => (
              <span key={row.day} className="bx-hours__row" data-today={"today" in row || undefined}>
                <span>{row.day}{"today" in row ? <em>Today</em> : null}</span>
                <span>{row.time}</span>
              </span>
            ))}
          </span>
        </span>
        <span className="bx-map">
          <StreetMap />
          <span className="bx-map__card">
            <span className="bx-map__name">1120 Lantern Way, Keller</span>
            <span className="bx-map__note">Parking right out front. Look for the green door.</span>
            <span className="bx-map__link">Get directions →</span>
          </span>
        </span>
      </div>

      <div className="bx-section bx-book" data-target="book" data-focus={focus === "book" || undefined}>
        <span className="bx-book__copy">
          <span className="bx-title">Request an appointment</span>
          <span className="bx-note">Tell us about your dog and the days that suit you. We’ll text you to confirm a time.</span>
          <span className="bx-book__call">Rather talk? Call or text <b>{phone}</b></span>
        </span>
        <span className="bx-form">
          <Field label="Your name" value="Jordan" placeholder />
          <Field label="Mobile number" value="(817) 555-" placeholder />
          <Field label="Dog’s name" value="Biscuit" placeholder />
          <Field label="Breed and size" value="Cockapoo, about 20 lb" placeholder />
          <Field label="Service" value="Full groom" wide />
          <span className="bx-field bx-field--wide">
            <span className="bx-field__label">Days that work</span>
            <span className="bx-chips"><span>Tue</span><span data-on>Wed</span><span>Thu</span><span>Fri</span><span data-on>Sat</span></span>
          </span>
          <span className="bx-button bx-button--cream bx-button--lg">Send request</span>
        </span>
      </div>
    </div>
  )
}

function Mobile({ photo, focus, eager }: { photo: SamplePhotoId; focus?: BrambleTarget; eager?: boolean }) {
  return (
    <div className="bx-page bx-page--mobile">
      <div className="bx-nav" data-target="top">
        <Brand small />
        <span className="bx-burger"><i /><i /></span>
      </div>
      <div className="bx-hero">
        <span className="bx-eyebrow">Keller, Texas · By appointment</span>
        <span className="bx-display">Calm, careful dog grooming in Keller.</span>
        <span className="bx-photo">
          <SamplePhoto id={photo} sizes="(max-width: 760px) 80vw, 300px" className="bx-photo__art" eager={eager} />
        </span>
        <span className="bx-open"><i />Open today until 5:00</span>
        <span className="bx-lede">One dog at a time, in a quiet room. We’ll text you when yours is ready.</span>
      </div>

      <div className="bx-section bx-services" data-target="services" data-focus={focus === "services" || undefined}>
        <span className="bx-title">Services</span>
        <span className="bx-menu">
          {services.map((item) => (
            <span key={item.name} className="bx-menu__row">
              <span className="bx-menu__name">{item.name}</span>
              <span className="bx-menu__price">{item.price}</span>
              <span className="bx-menu__body">{item.body}</span>
            </span>
          ))}
        </span>
      </div>

      <div className="bx-section bx-visit" data-target="hours" data-focus={focus === "hours" || undefined}>
        <span className="bx-title">Hours &amp; directions</span>
        <span className="bx-hours__list">
          {hours.slice(1, 6).map((row) => (
            <span key={row.day} className="bx-hours__row" data-today={"today" in row || undefined}>
              <span>{row.day}{"today" in row ? <em>Today</em> : null}</span>
              <span>{row.time}</span>
            </span>
          ))}
          <span className="bx-hours__row"><span>Sun &amp; Mon</span><span>Closed</span></span>
        </span>
        <span className="bx-map">
          <StreetMap />
          <span className="bx-map__card">
            <span className="bx-map__name">1120 Lantern Way, Keller</span>
            <span className="bx-map__link">Get directions →</span>
          </span>
        </span>
      </div>

      <div className="bx-section bx-book" data-target="book" data-focus={focus === "book" || undefined}>
        <span className="bx-title">Request an appointment</span>
        <span className="bx-note">We’ll text you to confirm a time.</span>
        <span className="bx-form">
          <Field label="Your name" value="Jordan" placeholder wide />
          <Field label="Dog’s name" value="Biscuit" placeholder wide />
          <Field label="Service" value="Full groom" wide />
          <span className="bx-button bx-button--cream bx-button--lg">Send request</span>
        </span>
      </div>
    </div>
  )
}

/**
 * One view of the Bramble site. `photo` picks the hero photo; `focus` outlines the part of the page a
 * customer is looking for. The phone view also carries the call-or-book bar that stays on screen.
 */
export function BrambleSite({ view, photo = "work", focus, eager = false }: { view: BrambleView; photo?: SamplePhotoId; focus?: BrambleTarget; eager?: boolean }) {
  return (
    <div className="bx" data-view={view} data-nosnippet="" aria-hidden="true" inert>
      {view === "desktop" ? <Desktop photo={photo} focus={focus} eager={eager} /> : <Mobile photo={photo} focus={focus} eager={eager} />}
      {view === "mobile" ? (
        <span className="bx-dock">
          <span className="bx-button bx-button--line">Call</span>
          <span className="bx-button">Request a visit</span>
        </span>
      ) : null}
    </div>
  )
}
