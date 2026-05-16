"use client"

import { motion } from "framer-motion"
import { Check, ArrowRight } from "lucide-react"

const pricingPlans = [
  {
    name: "Starter Website",
    price: "$500",
    priceNote: "starting at",
    description: "For businesses that need a clean one-page site.",
    features: [
      "One-page website",
      "Mobile-first design",
      "Contact or quote form",
      "Basic SEO setup",
      "Launch support",
    ],
  },
  {
    name: "Business Website",
    price: "$1,250",
    priceNote: "starting at",
    description: "For businesses that need stronger structure, trust, and conversion.",
    features: [
      "Multi-page structure",
      "Services, about, contact",
      "Gallery and testimonials",
      "Conversion-focused layout",
      "Analytics-ready setup",
      "Launch support",
    ],
    highlighted: true,
  },
  {
    name: "AI/System Add-ons",
    price: "Custom",
    priceNote: "scope varies",
    description: "For booking, forms, simple automations, or practical AI workflows.",
    features: [
      "Quote request systems",
      "Booking integrations",
      "Email workflows",
      "AI-assisted tools",
      "Spreadsheet connections",
    ],
  },
  {
    name: "Monthly Care",
    price: "$149",
    priceNote: "starting at",
    priceSuffix: "/mo",
    description: "For updates, edits, and basic support.",
    features: [
      "Small monthly edits",
      "Photo and content swaps",
      "Seasonal changes",
      "Basic site checks",
      "Priority fixes",
    ],
  },
]

export function PricingSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-muted-foreground tracking-wide uppercase mb-4"
          >
            Pricing
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] max-w-2xl"
          >
            Simple packages.{" "}
            <span className="text-muted-foreground/70">Clear scope.</span>
          </motion.h2>
        </div>
        
        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className={`h-full rounded-xl border transition-colors ${
                plan.highlighted 
                  ? "border-foreground bg-foreground text-background" 
                  : "border-border bg-card hover:border-foreground/20"
              }`}>
                <div className="p-6">
                  {/* Plan name */}
                  <h3 className={`text-sm font-medium uppercase tracking-wider mb-6 ${
                    plan.highlighted ? "text-background/80" : "text-muted-foreground"
                  }`}>
                    {plan.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-bold tracking-tight ${
                        plan.highlighted ? "text-background" : "text-foreground"
                      }`}>
                        {plan.price}
                      </span>
                      {plan.priceSuffix && (
                        <span className={`text-lg ${
                          plan.highlighted ? "text-background/80" : "text-muted-foreground"
                        }`}>
                          {plan.priceSuffix}
                        </span>
                      )}
                    </div>
                    <div className={`text-xs mt-1 ${
                      plan.highlighted ? "text-background/75" : "text-muted-foreground"
                    }`}>
                      {plan.priceNote}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className={`text-sm leading-relaxed mb-6 ${
                    plan.highlighted ? "text-background/85" : "text-muted-foreground"
                  }`}>
                    {plan.description}
                  </p>
                  
                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <Check className={`w-4 h-4 mt-0.5 shrink-0 ${
                          plan.highlighted ? "text-background/80" : "text-muted-foreground"
                        }`} />
                        <span className={`text-sm ${
                          plan.highlighted ? "text-background/80" : "text-muted-foreground"
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA */}
                  <button
                    onClick={() => scrollToSection('contact')}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-medium transition-colors ${
                      plan.highlighted
                        ? "bg-background text-foreground hover:bg-background/90"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    Get started
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-sm text-muted-foreground mt-12"
        >
          Final pricing depends on scope, content, timeline, and integrations.
        </motion.p>
      </div>
    </section>
  )
}
