import type { Metadata } from "next"
import { BookingProvider } from "@/components/site/booking"
import { Footer } from "@/components/site/footer"
import { Hero } from "@/components/site/hero"
import { MobileBookBar } from "@/components/site/mobile-book-bar"
import { Nav } from "@/components/site/nav"
import { PlaceholderWarning } from "@/components/site/placeholder-warning"
import { MotionRoot } from "@/components/site/reveal"
import { site } from "@/content/site"

export const metadata: Metadata = {
  title: { absolute: site.metadata.title },
  description: site.metadata.description,
  alternates: { canonical: "/" },
}

export default function Home() {
  return (
    <BookingProvider>
      <MotionRoot>
        <a href="#main-content" className="mk-skip">Skip to content</a>
        <Nav />
        <main id="main-content" tabIndex={-1}>
          <Hero />
          <section id="contact" className="mk-section">
            <div className="mk-container"><h2 className="mk-h2">{site.final.title}</h2></div>
          </section>
        </main>
        <Footer />
        <MobileBookBar />
        <PlaceholderWarning content={site} />
      </MotionRoot>
    </BookingProvider>
  )
}
