import { Navbar } from "@/components/navbar"
import { Hero3DStage } from "@/components/hero-3d-stage"
import { TrustSection } from "@/components/trust-section"
import { WorkSection } from "@/components/work-section"
import { ClientPortalSection } from "@/components/client-portal-section"
import { FeatureCardsSection } from "@/components/feature-cards-section"
import { ProductDirectionSection } from "@/components/product-direction-section"
import { AiSystemsSection } from "@/components/ai-systems-section"
import { PricingSection } from "@/components/pricing-section"
import { FAQSection } from "@/components/faq-section"
import { ContactSection } from "@/components/contact-section"
import { FooterSection } from "@/components/footer-section"

export default function Home() {
  return (
    <main className="min-h-screen bg-black">
      <Navbar />
      <Hero3DStage />
      <TrustSection />
      <WorkSection />
      <ClientPortalSection />
      <FeatureCardsSection />
      <ProductDirectionSection />
      <AiSystemsSection />
      <PricingSection />
      <FAQSection />
      <ContactSection />
      <FooterSection />
    </main>
  )
}
