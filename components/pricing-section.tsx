"use client"

import { motion } from "framer-motion"
import { Check, ArrowRight, LayoutDashboard } from "lucide-react"

const pricingPlans = [
  {
    name: "Starter Website",
    price: "$500",
    priceNote: "starting at",
    description: "For businesses that need a clean one-page site to establish their online presence.",
    features: [
      "One-page website",
      "Mobile-first design",
      "Contact or quote form",
      "Basic SEO setup",
      "Launch support",
    ],
    highlight: false,
  },
  {
    name: "Business Website",
    price: "$1,250",
    priceNote: "starting at",
    description: "For businesses that need stronger structure, trust signals, and conversion focus.",
    features: [
      "Multi-page structure",
      "Services, about, contact",
      "Gallery and testimonials",
      "Conversion-focused layout",
      "Analytics-ready setup",
      "Client portal included",
    ],
    highlight: true,
    badge: "Most Popular",
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
    highlight: false,
  },
  {
    name: "Monthly Care",
    price: "$149",
    priceNote: "starting at",
    priceSuffix: "/mo",
    description: "For updates, edits, and ongoing support to keep your site fresh.",
    features: [
      "Small monthly edits",
      "Photo and content swaps",
      "Seasonal changes",
      "Basic site checks",
      "Priority support",
    ],
    highlight: false,
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
            className="inline-flex items-center gap-3 text-sm font-medium text-foreground/50 tracking-wide uppercase mb-5"
          >
            <span className="w-8 h-px bg-foreground/15" />
            Pricing
          </motion.span>
          <div className="grid lg:grid-cols-2 gap-6 items-end">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1]"
            >
              Simple packages.
              <br />
              <span className="text-foreground/40">Clear scope.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-base lg:text-lg text-foreground/60"
            >
              Every project includes a private client portal for tracking progress, previews, support, and payments.
            </motion.p>
          </div>
        </div>
        
        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="group relative"
            >
              <div className={`h-full rounded-2xl border transition-all duration-300 ${
                plan.highlight 
                  ? "border-foreground bg-foreground text-background shadow-2xl shadow-foreground/5" 
                  : "border-foreground/[0.06] bg-card hover:border-foreground/10 hover:shadow-xl hover:shadow-foreground/[0.02]"
              }`}>
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full bg-background text-foreground text-[10px] font-medium uppercase tracking-wider shadow-lg border border-foreground/10">
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  {/* Plan name */}
                  <h3 className={`text-[11px] font-medium uppercase tracking-wider mb-5 ${
                    plan.highlight ? "text-background/55" : "text-foreground/45"
                  }`}>
                    {plan.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-3xl font-bold tracking-tight ${
                        plan.highlight ? "text-background" : "text-foreground"
                      }`}>
                        {plan.price}
                      </span>
                      {plan.priceSuffix && (
                        <span className={`text-base ${
                          plan.highlight ? "text-background/55" : "text-foreground/45"
                        }`}>
                          {plan.priceSuffix}
                        </span>
                      )}
                    </div>
                    <div className={`text-[10px] uppercase tracking-wider mt-1 ${
                      plan.highlight ? "text-background/45" : "text-foreground/35"
                    }`}>
                      {plan.priceNote}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className={`text-sm leading-relaxed mb-5 ${
                    plan.highlight ? "text-background/70" : "text-foreground/55"
                  }`}>
                    {plan.description}
                  </p>
                  
                  {/* Divider */}
                  <div className={`h-px mb-5 ${
                    plan.highlight ? "bg-background/10" : "bg-foreground/[0.06]"
                  }`} />
                  
                  {/* Features */}
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <div className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.highlight ? "bg-background/10" : "bg-foreground/[0.03]"
                        }`}>
                          <Check className={`w-2.5 h-2.5 ${
                            plan.highlight ? "text-background" : "text-foreground/60"
                          }`} />
                        </div>
                        <span className={`text-sm ${
                          plan.highlight ? "text-background/75" : "text-foreground/60"
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  {/* CTA */}
                  <motion.button
                    onClick={() => scrollToSection('contact')}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                      plan.highlight
                        ? "bg-background text-foreground hover:bg-background/90 shadow-lg"
                        : "bg-foreground/[0.03] hover:bg-foreground/[0.06] text-foreground border border-foreground/[0.06] hover:border-foreground/10"
                    }`}
                  >
                    Get started
                    <ArrowRight className="w-4 h-4" />
                  </motion.button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Portal note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 flex items-center justify-center gap-3 text-sm text-foreground/50"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>All packages include access to your private client portal</span>
        </motion.div>
        
        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="text-center text-xs text-foreground/35 mt-4"
        >
          Final pricing depends on scope, content, timeline, and integrations.
        </motion.p>
      </div>
    </section>
  )
}
