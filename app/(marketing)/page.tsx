import type { Metadata } from "next"
import { BookingProvider } from "@/components/site/booking"
import { Footer } from "@/components/site/footer"
import { About } from "@/components/site/home/about"
import { Announce } from "@/components/site/home/announce"
import { Faq } from "@/components/site/home/faq"
import { FinalCta } from "@/components/site/home/final-cta"
import { Hero } from "@/components/site/home/hero"
import { HowItWorks } from "@/components/site/home/how-it-works"
import { Intro } from "@/components/site/home/intro"
import { Pricing } from "@/components/site/home/pricing"
import { ReceptionistSoon } from "@/components/site/home/receptionist-soon"
import { Towns } from "@/components/site/home/towns"
import { WhatIDo } from "@/components/site/home/what-i-do"
import { Nav } from "@/components/site/nav"
import { PlaceholderWarning } from "@/components/site/placeholder-warning"
import { RevealObserver } from "@/components/site/reveal-observer"
import { site } from "@/content/site"

export const metadata: Metadata = {
  title: { absolute: site.metadata.title },
  description: site.metadata.description,
  alternates: { canonical: "/" },
}

/** The homepage, section by section from docs/design/site-reference.html. */
export default function Home() {
  return (
    <BookingProvider>
      <div className="mk-home">
        <Intro />
        <a href="#main-content" className="mk-skip">Skip to content</a>
        <Announce />
        <Nav />
        <main className="wrap" id="main-content" tabIndex={-1}>
          <Hero />
          <Towns />
          <WhatIDo />
          <HowItWorks />
          <Pricing />
          <About />
          <ReceptionistSoon />
          <Faq />
          <FinalCta />
        </main>
        <div className="wrap">
          <Footer />
        </div>
        <RevealObserver />
        <PlaceholderWarning content={site} />
      </div>
    </BookingProvider>
  )
}
