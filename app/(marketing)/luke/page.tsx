import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { Wordmark } from "@/components/brand/wordmark"
import { BookButton, BookingProvider } from "@/components/site/booking"
import { ArrowUpRightIcon, CardIcon, ServiceIcon } from "@/components/site/icons"
import { RebrandNotice } from "@/components/site/rebrand-notice"
import { RevealObserver } from "@/components/site/reveal-observer"
import { site } from "@/content/site"
import { bookingEmbedUrl } from "@/lib/booking-embed"

const pageUrl = `${site.url}/luke`
const description = `${site.card.introStart}${site.card.introBold}`

export const metadata: Metadata = {
  title: { absolute: "Luke Nordin | Mountline" },
  description,
  alternates: { canonical: "/luke" },
  openGraph: {
    title: "Luke Nordin | Mountline",
    description,
    url: pageUrl,
    siteName: "Mountline",
    images: [{ url: site.person.photo, width: 1054, height: 1054, alt: site.person.photoAlt }],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luke Nordin | Mountline",
    description,
    images: [site.person.photo],
  },
}

/** The business-card page (docs/design/card-reference.html): phone first, one 560px column. */
export default async function LukePage() {
  const { card, contact } = site
  const embedUrl = await bookingEmbedUrl()
  const smsHref = `sms:${contact.cardPhone}`
  const telHref = `tel:${contact.cardPhone}`
  const emailHref =
    `mailto:${contact.cardEmail}?subject=${encodeURIComponent(card.emailSubject)}&body=` + encodeURIComponent(card.emailBody)

  return (
    <BookingProvider embedUrl={embedUrl}>
      <div className="mk-card">
        <div className="col">
          <header className="top">
            <Link className="logo hit" href="/" aria-label="Mountline home">
              <Wordmark size={18} mark={{ width: 21, height: 17 }} gap={8} />
            </Link>
            <Link className="top-link hit" href="/">
              {card.homeLink}
              <ArrowUpRightIcon />
            </Link>
          </header>

          <RebrandNotice delay={600} />

          <main>
            <div className="photo">
              <Image
                src={site.person.photo}
                alt={site.person.photoAlt}
                fill
                priority
                sizes="(max-width: 592px) calc(100vw - 32px), 560px"
                style={{ objectFit: "cover" }}
              />
              <span className="tag"><i aria-hidden="true" />{card.photoTag}</span>
            </div>

            <div className="who">
              <span className="eyebrow">{card.eyebrow}</span>
              <h1>{site.person.name}</h1>
              <p className="intro">{card.introStart}<b>{card.introBold}</b></p>
            </div>

            <div className="scan">
              <span className="scan-i" aria-hidden="true"><CardIcon name="scan" /></span>
              <div><b>{card.scanTitle}</b><p>{card.scanBody}</p></div>
            </div>

            <div className="acts">
              <a className="act pri" href={smsHref}><CardIcon name="text" />{card.actions.text}</a>
              <a className="act" href={telHref}><CardIcon name="call" />{card.actions.call}</a>
              <a className="act" href={emailHref}><CardIcon name="email" />{card.actions.email}</a>
              <a className="act" href="/luke-nordin.vcf" style={{ gridColumn: "1/-1" }}>
                <CardIcon name="save" />{card.actions.save}
              </a>
            </div>

            <section className="rv" aria-labelledby="demos-h">
              <span className="eyebrow">{card.demos.eyebrow}</span>
              <h2 id="demos-h">{card.demos.title}</h2>
              <div className="list">
                {card.demos.items.map((demo) => (
                  <a className="row" key={demo.href} href={demo.href} target="_blank" rel="noreferrer">
                    <span className="ri" style={demo.tint ? { background: demo.tint } : undefined} aria-hidden="true">
                      {demo.initials}
                    </span>
                    <span className="rt"><b>{demo.title}</b><span>{card.demos.kind}</span></span>
                    {demo.unpublished ? (
                      <span className="pill">{card.demos.unpublished}</span>
                    ) : (
                      <span className="open">{card.demos.open}<ArrowUpRightIcon grid={12} /></span>
                    )}
                  </a>
                ))}
              </div>
              <p className="note">{card.demos.note}</p>
            </section>

            <section className="rv" aria-labelledby="why-h">
              <span className="eyebrow">{card.why.eyebrow}</span>
              <h2 id="why-h">{card.why.title}</h2>
              <p className="why">{card.why.body}</p>
            </section>

            <section className="rv" aria-labelledby="svcs-h">
              <span className="eyebrow">{card.services.eyebrow}</span>
              <h2 id="svcs-h">{card.services.title}</h2>
              <div className="svcs">
                {card.services.items.map((svc) => (
                  <div className="svc" key={svc.key}>
                    <span className={`dt ${svc.key}`} aria-hidden="true"><ServiceIcon k={svc.key} /></span>
                    <div>
                      <b>{svc.title}{svc.soon ? <small>{svc.soon}</small> : null}</b>
                      <p>{svc.body}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="rv" aria-labelledby="fit-h">
              <span className="eyebrow">{card.fit.eyebrow}</span>
              <h2 id="fit-h">{card.fit.title}</h2>
              <div className="chips">{card.fit.chips.map((chip) => <span className="chip" key={chip}>{chip}</span>)}</div>
            </section>

            <div className="close rv" id="contact">
              <h2>{card.close.title}</h2>
              <p>{card.close.body}</p>
              <div className="acts">
                <a className="act pri" href={smsHref}><CardIcon name="text" />{card.actions.text}</a>
                <BookButton className="act">{card.actions.book}</BookButton>
                <a className="act" href={emailHref}>{card.actions.email}</a>
              </div>
            </div>
          </main>

          <footer>
            <span>{card.footer.place}</span>
            <nav aria-label="Links">
              <Link className="hit" href="/">{card.footer.home}</Link>
              <a className="hit" href={emailHref}>{card.footer.email}</a>
            </nav>
          </footer>
        </div>
        <RevealObserver />
      </div>
    </BookingProvider>
  )
}
