import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight, ContactRound, Mail, MessageSquareText, Phone } from "lucide-react"
import { Wordmark } from "@/components/brand/wordmark"
import { DemoGallery } from "@/components/demo-gallery"
import { HomepageMotion } from "@/components/homepage/homepage-motion"

const contact = {
  phoneNumber: "+18178801028",
  phoneLabel: "(817) 880-1028",
  email: "luke.nordin@icloud.com",
  homepageUrl: "https://mountline.dev",
}

const pageUrl = `${contact.homepageUrl}/luke`

export const metadata: Metadata = {
  title: "Luke Nordin | Mountline Studio",
  description:
    "Meet Luke Nordin, founder of Mountline Studio in Keller, Texas. Websites, AI-powered systems, and practical tools for local businesses.",
  alternates: {
    canonical: "/luke",
  },
  openGraph: {
    title: "Luke Nordin | Mountline Studio",
    description: "Websites, AI-powered systems, and practical tools for local businesses.",
    url: pageUrl,
    siteName: "Mountline Studio",
    images: [
      {
        url: "/luke-nordin.jpg",
        width: 1054,
        height: 1054,
        alt: "Luke Nordin, founder of Mountline Studio.",
      },
    ],
    type: "profile",
  },
  twitter: {
    card: "summary_large_image",
    title: "Luke Nordin | Mountline Studio",
    description: "Websites, AI-powered systems, and practical tools for local businesses.",
    images: ["/luke-nordin.jpg"],
  },
}

const capabilities = [
  {
    title: "Business websites",
    copy: "Clear, mobile-friendly websites that feel true to your business, so customers know what to do next and trust you from the first impression.",
  },
  {
    title: "A private client portal",
    copy: "Every project includes a portal inside Mountline. Track status, share inspiration, handle support, and keep working together from kickoff through launch.",
  },
  {
    title: "AI-powered systems",
    copy: "Practical tools that organize leads, follow-ups, and customer requests without making the business harder to run.",
  },
]

const bestFit = [
  "Local businesses in Keller and the surrounding area",
  "Barbers, detailers, groomers, contractors, med spas, restaurants, churches, and independent shops",
  "Businesses that need a stronger website or a smarter way to handle leads and requests",
  "Owners who want honest communication and work that actually gets done",
]

export default function LukePage() {
  const emailHref =
    `mailto:${contact.email}?subject=Mountline%20Studio&body=` +
    encodeURIComponent("Hey Luke, it was great meeting you. My business is [business name].")
  const smsHref = `sms:${contact.phoneNumber}`
  const phoneHref = `tel:${contact.phoneNumber}`

  return (
    <div className={`ml-site ml-card-page`}>
      <HomepageMotion />
      <header className="ml-card-page__bar">
        <div className="ml-card-page__inner">
          <Link href="/" className="ml-header__brand" aria-label="Mountline home">
            <Wordmark size={18} />
          </Link>
          <Link href="/" className="ml-mono ml-card-page__home">
            mountline.dev <ArrowUpRight aria-hidden="true" />
          </Link>
        </div>
      </header>

      <main className="ml-card-page__inner">
        <section className="ml-profile">
          <div className="ml-profile__photo">
            <Image
              src="/luke-nordin.jpg"
              alt="Luke Nordin, founder of Mountline Studio."
              fill
              priority
              sizes="(max-width: 640px) 100vw, 320px"
            />
          </div>
          <div className="ml-profile__id">
            <p className="ml-mono">Founder · Mountline Studio · Keller, Texas</p>
            <h1>Luke Nordin</h1>
          </div>
        </section>

        <p className="ml-profile__intro">
          Hey, I’m Luke. I run Mountline Studio here in Keller, building websites, AI-powered systems, and simple
          tools that help local businesses look credible, get found, and hear from more customers.
        </p>

        <aside className="ml-profile__note">
          <p className="ml-mono">Scanned my card?</p>
          <p>
            It was a pleasure to meet you. Send me your business name, website, or social media so I can take a closer
            look at what you do. If I showed you a personalized demo, remind me and I’ll send your link over.
          </p>
        </aside>

        <div className="ml-profile__actions">
          <a href={smsHref} className="ml-btn ml-btn--solid">
            <MessageSquareText className="ml-btn__icon" aria-hidden="true" /> Text me
          </a>
          <a href="/luke-nordin.vcf" className="ml-btn ml-btn--line">
            <ContactRound className="ml-btn__icon" aria-hidden="true" /> Save contact
          </a>
          <a href={emailHref} className="ml-btn ml-btn--line">
            <Mail className="ml-btn__icon" aria-hidden="true" /> Email me
          </a>
          <a href={phoneHref} className="ml-btn ml-btn--line">
            <Phone className="ml-btn__icon" aria-hidden="true" /> Call
          </a>
        </div>

        <section className="ml-card-section" id="examples" aria-labelledby="examples-title" data-mtl-reveal>
          <div className="ml-card-section__head">
            <h2 id="examples-title">See what I’ve built</h2>
            <p>Working demo sites. Open any of them to click around.</p>
          </div>
          <DemoGallery />
          <p className="ml-fine">Concept previews are examples, not official websites unless approved by the business.</p>
        </section>

        <section className="ml-card-section" aria-labelledby="why-title" data-mtl-reveal>
          <div className="ml-card-section__head">
            <h2 id="why-title">Why I gave you this card</h2>
          </div>
          <p className="ml-card-section__prose">
            I saw something I liked about your business and thought I might be able to help. Maybe the work is great
            but the website hasn’t caught up, or customers are slipping through the cracks. Either way, this is an
            easy way to see my work and reach me.
          </p>
        </section>

        <section className="ml-card-section" aria-labelledby="build-title" data-mtl-reveal>
          <div className="ml-card-section__head">
            <h2 id="build-title">What I can build</h2>
          </div>
          <ol className="ml-card-list">
            {capabilities.map((item, index) => (
              <li key={item.title}>
                <span className="ml-mono">{String(index + 1).padStart(2, "0")}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <section className="ml-card-section" aria-labelledby="fit-title" data-mtl-reveal>
          <div className="ml-card-section__head">
            <h2 id="fit-title">Best fit for</h2>
          </div>
          <ul className="ml-card-list ml-card-list--plain">
            {bestFit.map((item) => (
              <li key={item}>
                <span className="ml-card-list__tick" aria-hidden="true" />
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="ml-card-cta" aria-labelledby="cta-title" data-mtl-reveal>
          <h2 id="cta-title">Let’s make your business easy to <em>trust</em></h2>
          <p>A strong website should feel clear and easy to use. I can help you get there without making the process complicated.</p>
          <div className="ml-profile__actions">
            <a href={smsHref} className="ml-btn ml-btn--solid">
              <MessageSquareText className="ml-btn__icon" aria-hidden="true" /> Text me
            </a>
            <a href={emailHref} className="ml-btn ml-btn--line">
              <Mail className="ml-btn__icon" aria-hidden="true" /> Email me
            </a>
            <a href={phoneHref} className="ml-btn ml-btn--line ml-profile__wide">
              <Phone className="ml-btn__icon" aria-hidden="true" /> Call {contact.phoneLabel}
            </a>
          </div>
        </section>
      </main>

      <footer className="ml-card-page__inner ml-card-page__footer">
        <span>Mountline Studio · Keller, Texas</span>
        <span>
          <Link href="/" className="ml-link">Home</Link>
          <a href={emailHref} className="ml-link">Email</a>
        </span>
      </footer>
    </div>
  )
}
