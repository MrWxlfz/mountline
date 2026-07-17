import Image from "next/image"
import Link from "next/link"
import {
  ArrowRight,
  Check,
  CircleDot,
  CreditCard,
  FileText,
  LifeBuoy,
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
          <div className="mtl-portal-next" data-mtl-portal="next">
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
        <span>Mountline project portal · Seeded preview, no client data</span>
        <span>Status, next step, feedback, links, and support in one place</span>
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
        {/* 1 · Hero — editorial split with integrated device stage */}
        <section className="mtl-hero">
          <div className="mtl-shell mtl-hero-layout">
            <div className="mtl-hero-copy" data-mtl-hero="copy">
              <p className="mtl-hero-eyebrow">Websites and practical systems for real businesses</p>
              <h1>Make your business easier to choose—and easier to run.</h1>
              <p className="mtl-hero-lede">
                Mountline builds exceptional websites and practical systems that
                help customers call, book, buy, and get answers. Start with a
                focused site, or add the useful systems around it.
              </p>

              <div className="mtl-hero-actions">
                <a href="#review" className="mtl-button mtl-button--primary">
                  Show us your business <ArrowRight className="size-4" aria-hidden="true" />
                </a>
                <a href="#work" className="mtl-button mtl-button--secondary">
                  See the work
                </a>
              </div>

              <p className="mtl-trust-line">Founder-led in Keller, Texas.</p>
            </div>

            <HeroWorkShowcase />
          </div>
        </section>

        {/* 2 · Real-work explorer — sticky index, one large scene */}
        <section id="work" className="mtl-work-section">
          <div className="mtl-shell">
            <header className="mtl-work-header" data-mtl-reveal="copy">
              <h2>Different businesses need different websites.</h2>
              <p>
                A restaurant, groomer, barber, and service company should not be
                forced into the same template. The design starts with how the
                business earns trust and what customers need next.
              </p>
            </header>
            <WorkSelector />
          </div>
        </section>

        {/* 3 · Starting points — tactile workbench */}
        <section id="what-we-build" className="mtl-build-section">
          <div className="mtl-shell">
            <header className="mtl-build-header" data-mtl-reveal="copy">
              <h2>Start with the problem. Build the useful part.</h2>
              <p>
                Sometimes that means a better website. Sometimes it means faster
                follow-up, easier booking, or one place for customers and your
                team to stay organized.
              </p>
            </header>
            <StartingPathWorkbench />
          </div>
        </section>

        {/* 4 · After an inquiry — horizontal communication story */}
        <section id="after-the-click" className="mtl-inquiry-section">
          <div className="mtl-shell">
            <header className="mtl-inquiry-header" data-mtl-reveal="copy">
              <h2>The website gets their attention. What happens next matters too.</h2>
            </header>

            <LeadRecoveryScene />

            <div className="mtl-inquiry-footer" data-mtl-reveal="copy">
              <p>
                For businesses handling valuable inquiries, Mountline can make sure
                somebody responds, follow-up continues, and the next action does not
                disappear into an inbox.
              </p>
              <Link href="/lead-recovery" className="mtl-inline-link">
                Explore Lead Recovery <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        {/* 5 · Capability mosaic — greatest Notion influence */}
        <section id="capabilities" className="mtl-capability-section">
          <div className="mtl-shell">
            <header className="mtl-capability-heading" data-mtl-reveal="copy">
              <h2>And yeah—we do a lot more.</h2>
              <p>
                The best system is not always a giant app. Sometimes it is one
                annoying part of the day finally working properly.
              </p>
            </header>

            <CapabilityGallery />
          </div>
        </section>

        {/* 6 · Process, portal, founder */}
        <section id="how-it-works" className="mtl-experience-section">
          <div className="mtl-shell">
            <div className="mtl-process-chapter" data-mtl-reveal="process">
              <h2>Clear from the first conversation.</h2>
              <ol className="mtl-process-rail">
                {processSteps.map((step) => (
                  <li key={step.number}>
                    <i aria-hidden="true" />
                    <h3>{step.title}</h3>
                    <p>{step.copy}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          <div className="mtl-shell mtl-portal-chapter">
            <div className="mtl-portal-copy" data-mtl-reveal="copy">
              <h2>You always know what happens next.</h2>
              <p>
                Project status, the current next step, concepts, feedback, support,
                and launch information stay in one clear place.
              </p>
            </div>
            <PortalScene />
          </div>
        </section>

        {/* Founder — warm editorial interruption */}
        <section id="about" className="mtl-founder-section">
          <div className="mtl-shell mtl-founder-layout">
            <figure data-mtl-reveal="image">
              <Image
                src="/luke-profile.jpg"
                alt="Luke Nordin, founder of Mountline"
                fill
                className="object-cover object-[47%_42%]"
                sizes="(max-width: 767px) 94vw, 44vw"
              />
            </figure>

            <div className="mtl-founder-copy" data-mtl-reveal="copy">
              <h2>Direct communication. Clear responsibility.</h2>
              <p>
                You work directly with the person responsible for understanding,
                designing, and building the project. Mountline is founder-led in
                Keller, Texas.
              </p>
              <span className="mtl-founder-sign">Luke Nordin · Founder</span>
            </div>
          </div>
        </section>

        {/* 7 · Final invitation */}
        <section id="review" className="mtl-final-section">
          <span id="review-website-launch" className="mtl-review-anchor" aria-hidden="true" />
          <span id="review-lead-recovery" className="mtl-review-anchor" aria-hidden="true" />
          <span id="review-custom-systems" className="mtl-review-anchor" aria-hidden="true" />
          <span id="review-not-sure" className="mtl-review-anchor" aria-hidden="true" />
          <div className="mtl-shell mtl-final-layout">
            <div className="mtl-final-copy" data-mtl-reveal="copy">
              <h2>Show us what your customers see.</h2>
              <p>
                Send Mountline your business name, current website, or social page.
                We&apos;ll identify the clearest useful place to improve—without
                forcing the business into more than it needs.
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
