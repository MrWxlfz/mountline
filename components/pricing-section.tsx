"use client"

import { motion } from "framer-motion"
import { Check, ArrowRight, Sparkles, LayoutDashboard } from "lucide-react"

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
            className="inline-flex items-center gap-3 text-sm font-medium text-muted-foreground tracking-wide uppercase mb-4"
          >
            <span className="w-8 h-px bg-border" />
            Pricing
          </motion.span>
          <div className="grid lg:grid-cols-2 gap-8 items-end">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]"
            >
              Simple packages.
              <br />
              <span className="text-muted-foreground/60">Clear scope.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground"
          >
            Every project includes a private client portal for tracking progress, support, and payments. No extra cost.
            </motion.p>
          </div>
        </div>
        
        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative"
            >
              <div className={`h-full rounded-2xl border transition-all duration-300 ${
                plan.highlight 
                  ? "border-foreground bg-foreground text-background shadow-xl" 
                  : "border-border bg-card hover:border-foreground/20 hover:shadow-lg"
              }`}>
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent text-accent-foreground text-[10px] font-medium uppercase tracking-wider shadow-lg">
                      <Sparkles className="w-3 h-3" />
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  {/* Plan name */}
                  <h3 className={`text-xs font-medium uppercase tracking-wider mb-6 ${
                    plan.highlight ? "text-background/70" : "text-muted-foreground"
                  }`}>
                    {plan.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl font-bold tracking-tight ${
                        plan.highlight ? "text-background" : "text-foreground"
                      }`}>
                        {plan.price}
                      </span>
                      {plan.priceSuffix && (
                        <span className={`text-lg ${
                          plan.highlight ? "text-background/70" : "text-muted-foreground"
                        }`}>
                          {plan.priceSuffix}
                        </span>
                      )}
                    </div>
                    <div className={`text-[10px] uppercase tracking-wider mt-1 ${
                      plan.highlight ? "text-background/60" : "text-muted-foreground/80"
                    }`}>
                      {plan.priceNote}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className={`text-sm leading-relaxed mb-6 ${
                    plan.highlight ? "text-background/80" : "text-muted-foreground"
                  }`}>
                    {plan.description}
                  </p>
                  
                  {/* Divider */}
                  <div className={`h-px mb-6 ${
                    plan.highlight ? "bg-background/20" : "bg-border"
                  }`} />
                  
                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.highlight ? "bg-background/10" : "bg-foreground/5"
                        }`}>
                          <Check className={`w-3 h-3 ${
                            plan.highlight ? "text-background" : "text-foreground"
                          }`} />
                        </div>
                        <span className={`text-sm ${
                          plan.highlight ? "text-background/85" : "text-muted-foreground"
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
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium transition-all ${
                      plan.highlight
                        ? "bg-background text-foreground hover:bg-background/90 shadow-lg"
                        : "bg-foreground/5 hover:bg-foreground/10 text-foreground border border-border hover:border-foreground/20"
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
          transition={{ delay: 0.5 }}
          className="mt-12 flex items-center justify-center gap-3 text-sm text-muted-foreground"
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>All packages include access to your private client portal</span>
        </motion.div>
        
        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
          className="text-center text-xs text-muted-foreground/70 mt-6"
        >
          Final pricing depends on scope, content, timeline, and integrations.
        </motion.p>
      </div>
    </section>
  )
}
