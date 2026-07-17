import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  CircleDot,
  CreditCard,
  FileText,
  LifeBuoy,
  MapPin,
  MessageSquareText,
} from "lucide-react"
import { BusinessReviewForm } from "@/components/homepage/business-review-form"
import { CapabilityGallery } from "@/components/homepage/capability-gallery"
import { AppearanceSelector } from "@/components/dashboard/appearance-selector"
import { HeroWorkShowcase } from "@/components/homepage/hero-work-showcase"
import { HomepageMotion } from "@/components/homepage/homepage-motion"
import { LeadRecoveryScene } from "@/components/homepage/lead-recovery-scene"
import { MobileNavigation } from "@/components/homepage/mobile-navigation"
import { ScrollHeader } from "@/components/homepage/scroll-header"
import { StartingPathWorkbench } from "@/components/homepage/starting-path-workbench"
import { WorkSelector } from "@/components/homepage/work-selector"
import { MountlineLogo } from "@/components/mountline-logo"
import { homepageNav } from "@/lib/homepage-content"

const processSteps = [
  {
    number: "01",
    title: "Understand",
    copy: "Learn how the business works, what customers need, and what currently gets in the way.",
  },
  {
    number: "02",
    title: "Plan",
    copy: "Choose the smallest useful scope and define exactly what will be built.",
  },
  {
    number: "03",
    title: "Build",
    copy: "Design, develop, test, and refine on real screens.",
  },
  {
    number: "04",
    title: "Launch and improve",
    copy: "Put it live, keep the next steps organized, and support what comes afterward.",
  },
] as const

function HomepageHeader() {
  return (
    <ScrollHeader>
      <div className="mtl-shell mtl-header-inner">
        <Link href="/" aria-label="Mountline home" className="mtl-logo-link">
          <MountlineLogo size="md" className="mtl-header-logo" />
        </Link>

        <nav aria-label="Primary navigation" className="mtl-desktop-nav">
          {homepageNav.map((item) => (
            <a key={item.href} href={item.href}>{item.label}</a>
          ))}
        </nav>

        <div className="mtl-header-actions">
          <Link href="/id" className="mtl-id-link">Mountline ID</Link>
          <AppearanceSelector compact syncServer={false} className="mtl-theme-selector" />
          <a href="#review" className="mtl-header-cta">
            Show us your business
            <ArrowRight className="size-4" aria-hidden="true" />
          </a>
        </div>

        <MobileNavigation />
      </div>
    </ScrollHeader>
  )
}

function PortalScene() {
  return (
    <figure className="mtl-portal-scene" data-mtl-reveal="scene">
      <div className="mtl-portal-toolbar">
        <span><i /> Mountline project portal</span>
        <span>Seeded preview · No client data</span>
      </div>
      <div className="mtl-portal-canvas">
        <div className="mtl-portal-image-wrap">
          <Image
            src="/work-previews/client-portal.png"
            alt="Mountline project portal showing status, timeline, next step, payment, preview, and launch information"
            fill
            className="object-cover object-top"
            sizes="(max-width: 767px) 94vw, (max-width: 1100px) 88vw, 73vw"
          />
        </div>

        <div className="mtl-portal-summary" aria-label="Portal preview details">
          <div>
            <span><CircleDot className="size-3.5" /> Current phase</span>
            <strong>Design</strong>
          </div>
          <div>
            <span><FileText className="size-3.5" /> Next step</span>
            <strong>Review the homepage concept</strong>
          </div>
          <ul>
            <li><MessageSquareText className="size-3.5" /> Feedback</li>
            <li><CreditCard className="size-3.5" /> Payments</li>
            <li><LifeBuoy className="size-3.5" /> Support</li>
          </ul>
        </div>
      </div>
      <figcaption>
        <span><Check className="size-3.5" /> Project status</span>
        <span><Check className="size-3.5" /> Current next step</span>
        <span><Check className="size-3.5" /> Concepts and links</span>
        <span><Check className="size-3.5" /> Feedback and support</span>
        <span><Check className="size-3.5" /> Launch information</span>
      </figcaption>
    </figure>
  )
}

export function MountlineHomepage() {
  return (
    <div className="mountline-marketing mountline-homepage">
      <HomepageMotion />
      <a href="#main-content" className="ml-skip-link">Skip to main content</a>
      <HomepageHeader />

      <main id="main-content" tabIndex={-1}>
        <section className="mtl-hero">
          <div className="mtl-shell mtl-hero-layout">
            <div className="mtl-hero-copy" data-mtl-hero="copy">
              <p className="mtl-hero-eyebrow">Websites + practical systems for real businesses</p>
              <h1>Make your business easier to choose—and easier to run.</h1>
              <p className="mtl-hero-lede">
                Mountline builds exceptional websites and practical systems that
                help customers call, book, buy, and get answers. Start with a
                focused site, or go further with lead follow-up, callback systems,
                support, portals, and custom tools.
              </p>

              <div className="mtl-hero-actions">
                <a href="#review" className="mtl-button mtl-button--primary">
                  Show us your business <ArrowRight className="size-4" aria-hidden="true" />
                </a>
                <a href="#what-we-build" className="mtl-button mtl-button--secondary">
                  See what we build <ArrowRight className="size-4" aria-hidden="true" />
                </a>
              </div>

              <p className="mtl-trust-line">
                <MapPin className="size-4" aria-hidden="true" />
                Founder-led in Keller, Texas. Built around what you actually need.
              </p>
            </div>

            <HeroWorkShowcase />
          </div>
        </section>

        <section id="work" className="mtl-work-section">
          <div className="mtl-shell">
            <div className="mtl-section-heading mtl-section-heading--work" data-mtl-reveal="copy">
              <p className="mtl-kicker">Real Mountline work</p>
              <h2>Different businesses need different websites.</h2>
              <p>
                A barber, restaurant, groomer, and service company should not be
                forced into the same template. Mountline starts with how the business
                earns trust and what customers need to do next.
              </p>
            </div>
            <WorkSelector />
          </div>
        </section>

        <section id="what-we-build" className="mtl-build-section">
          <div className="mtl-shell">
            <div className="mtl-section-heading mtl-section-heading--build" data-mtl-reveal="copy">
              <p className="mtl-kicker">What Mountline builds</p>
              <h2>Start with the problem. Build the useful part.</h2>
              <p>
                Sometimes that is a better website. Sometimes it is faster follow-up,
                easier booking, or one place for customers and your team to stay organized.
              </p>
            </div>
            <StartingPathWorkbench />
          </div>
        </section>

        <section id="after-the-click" className="mtl-inquiry-section">
          <div className="mtl-shell">
            <div className="mtl-section-heading mtl-section-heading--inquiry" data-mtl-reveal="copy">
              <p className="mtl-kicker">What happens after the click</p>
              <h2>The website gets their attention. What happens next matters too.</h2>
              <p>
                For businesses handling valuable inquiries, Mountline can help make
                sure somebody responds, the follow-up continues, and the next action
                does not disappear into an inbox.
              </p>
            </div>

            <LeadRecoveryScene />

            <div className="mtl-inquiry-footer">
              <Link href="/lead-recovery" className="mtl-inline-link">
                See Mountline Lead Recovery <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <p>Managed around the business and often able to work alongside tools already in place.</p>
            </div>
          </div>
        </section>

        <section id="capabilities" className="mtl-capability-section">
          <div className="mtl-shell">
            <div className="mtl-capability-heading" data-mtl-reveal="copy">
              <p className="mtl-kicker">Useful systems, right-sized</p>
              <h2>And yeah—we do a lot more.</h2>
              <p>The best system is not always a giant app. Sometimes it is one frustrating part of the day finally working properly.</p>
            </div>

            <CapabilityGallery />

            <p className="mtl-capability-note">Capabilities are scoped around the business and existing tools.</p>
          </div>
        </section>

        <section id="how-it-works" className="mtl-experience-section">
          <div className="mtl-shell">
            <div className="mtl-process-heading" data-mtl-reveal="copy">
              <p className="mtl-kicker">How working with Mountline feels</p>
              <h2>Clear from the first conversation.</h2>
            </div>

            <ol className="mtl-process-rail" data-mtl-reveal="process">
              {processSteps.map((step) => (
                <li key={step.number} tabIndex={0}>
                  <span>{step.number}</span>
                  <i aria-hidden="true" />
                  <h3>{step.title}</h3>
                  <p>{step.copy}</p>
                </li>
              ))}
            </ol>

            <div className="mtl-delivery-chapter">
              <div>
                <p className="mtl-kicker">Organized delivery</p>
                <h2>You always know what happens next.</h2>
                <p>
                  Project status, the current next step, concepts, feedback,
                  support, payment, and launch information stay in one clear place.
                </p>
              </div>
              <PortalScene />
            </div>
          </div>
        </section>

        <section id="about" className="mtl-founder-section">
          <div className="mtl-shell mtl-founder-layout">
            <figure data-mtl-reveal="image">
              <Image
                src="/luke-profile.jpg"
                alt="Luke Nordin, founder of Mountline"
                fill
                className="object-cover object-[47%_42%]"
                sizes="(max-width: 767px) 94vw, 55vw"
              />
              <figcaption><span>Keller, Texas</span>Luke Nordin · Founder</figcaption>
            </figure>

            <div className="mtl-founder-copy" data-mtl-reveal="copy">
              <p className="mtl-kicker">Founder-led</p>
              <h2>Direct communication. Clear responsibility.</h2>
              <p>
                You work directly with the person responsible for understanding,
                designing, and building the project. Mountline is founder-led in
                Keller, Texas, with a process designed to keep communication simple
                and the work accountable.
              </p>
            </div>
          </div>
        </section>

        <section id="review" className="mtl-final-section">
          <span id="review-website-launch" className="mtl-review-anchor" aria-hidden="true" />
          <span id="review-lead-recovery" className="mtl-review-anchor" aria-hidden="true" />
          <span id="review-custom-systems" className="mtl-review-anchor" aria-hidden="true" />
          <span id="review-not-sure" className="mtl-review-anchor" aria-hidden="true" />
          <div className="mtl-shell mtl-final-layout">
            <div className="mtl-final-copy" data-mtl-reveal="copy">
              <p className="mtl-kicker">A useful first look</p>
              <h2>Show us what your customers see.</h2>
              <p>
                Send Mountline your business name, website, or social page. We’ll
                identify the clearest useful place to improve—whether that is the
                website, the response after an inquiry, or a workflow that should be easier.
              </p>
              <div>
                <span><Check className="size-3.5" /> No giant commitment</span>
                <span><Check className="size-3.5" /> Smallest useful starting point</span>
                <span><Check className="size-3.5" /> Direct reply from Mountline</span>
              </div>
            </div>

            <BusinessReviewForm />
          </div>
        </section>
      </main>

      <footer className="mtl-footer">
        <div className="mtl-shell mtl-footer-main">
          <div>
            <MountlineLogo size="md" inverted />
            <p>Exceptional websites and practical systems for businesses.</p>
          </div>
          <nav aria-label="Footer navigation">
            <a href="#work">Work</a>
            <a href="#what-we-build">What we build</a>
            <Link href="/lead-recovery">Lead Recovery</Link>
            <a href="#about">About</a>
            <a href="#review">Contact</a>
            <Link href="/id">Mountline ID</Link>
          </nav>
        </div>
        <div className="mtl-footer-bottom">
          <div className="mtl-shell">
            <p>Mountline · Keller, Texas</p>
            <a href="mailto:hello@mountline.dev">hello@mountline.dev</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
