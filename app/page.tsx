import { Navbar } from "@/components/navbar"
import { Hero3DStage } from "@/components/hero-3d-stage"
import { ProblemSection } from "@/components/problem-section"
import { FeatureCardsSection } from "@/components/feature-cards-section"
import { WorkSection } from "@/components/work-section"
import { ProductDirectionSection } from "@/components/product-direction-section"
import { PricingSection } from "@/components/pricing-section"
import { TrustSection } from "@/components/trust-section"
import { AISection } from "@/components/ai-section"
import { FAQSection } from "@/components/faq-section"
import { CtaSection } from "@/components/cta-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="bg-stone-50">
      <Navbar />
      <Hero3DStage />
      <ProblemSection />
      <FeatureCardsSection />
      <WorkSection />
      <ProductDirectionSection />
      <PricingSection />
      <TrustSection />
      <AISection />
      <FAQSection />
      <CtaSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
