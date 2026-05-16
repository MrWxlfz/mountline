import { Navbar } from "@/components/navbar"
import { Hero3DStage } from "@/components/hero-3d-stage"
import { LogoCloud } from "@/components/logo-cloud"
import { FeatureCardsSection } from "@/components/feature-cards-section"
import { AISection } from "@/components/ai-section"
import { ProcessSection } from "@/components/product-direction-section"
import { WorkSection } from "@/components/work-section"
import { WorkflowsSection } from "@/components/workflows-section"
import { TrustSection } from "@/components/trust-section"
import { PricingSection } from "@/components/pricing-section"
import { FaqSection } from "@/components/faq-section"
import { CtaSection } from "@/components/cta-section"
import { ContactSection } from "@/components/contact-section"
import { Footer } from "@/components/footer"

export default function Home() {
  return (
    <main className="bg-background">
      <Navbar />
      <Hero3DStage />
      <LogoCloud />
      <FeatureCardsSection />
      <AISection />
      <ProcessSection />
      <WorkSection />
      <WorkflowsSection />
      <TrustSection />
      <PricingSection />
      <FaqSection />
      <CtaSection />
      <ContactSection />
      <Footer />
    </main>
  )
}
