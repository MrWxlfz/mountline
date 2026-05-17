"use client"

import { motion } from "framer-motion"
import { Check, ArrowRight } from "lucide-react"

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
      "Priority support",
    ],
    highlight: false,
  },
]

export function PricingSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section id="pricing" className="py-28 lg:py-36 bg-black border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-white/25 tracking-wide uppercase mb-6"
          >
            <span className="w-8 h-px bg-white/10" />
            Pricing
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-6"
          >
            Simple packages.
            <span className="text-white/25"> Clear scope.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-white/35"
          >
            Every project includes a private client portal for tracking progress, previews, and support.
          </motion.p>
        </div>
        
        {/* Pricing grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="group relative"
            >
              <div className={`h-full rounded-2xl border transition-all duration-300 ${
                plan.highlight 
                  ? "border-white/20 bg-white text-black" 
                  : "border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/[0.1]"
              }`}>
                {plan.badge && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center px-3 py-1 rounded-lg bg-black text-white text-[9px] font-medium uppercase tracking-wider">
                      {plan.badge}
                    </span>
                  </div>
                )}
                
                <div className="p-6">
                  <h3 className={`text-[10px] font-medium uppercase tracking-wider mb-5 ${
                    plan.highlight ? "text-black/40" : "text-white/30"
                  }`}>
                    {plan.name}
                  </h3>
                  
                  <div className="mb-4">
                    <div className="flex items-baseline gap-0.5">
                      <span className={`text-3xl font-bold tracking-tight ${plan.highlight ? "text-black" : "text-white"}`}>
                        {plan.price}
                      </span>
                      {plan.priceSuffix && (
                        <span className={`text-base ${plan.highlight ? "text-black/40" : "text-white/30"}`}>
                          {plan.priceSuffix}
                        </span>
                      )}
                    </div>
                    <div className={`text-[9px] uppercase tracking-wider mt-1 ${plan.highlight ? "text-black/30" : "text-white/20"}`}>
                      {plan.priceNote}
                    </div>
                  </div>
                  
                  <p className={`text-sm leading-relaxed mb-5 ${plan.highlight ? "text-black/55" : "text-white/40"}`}>
                    {plan.description}
                  </p>
                  
                  <div className={`h-px mb-5 ${plan.highlight ? "bg-black/[0.08]" : "bg-white/[0.04]"}`} />
                  
                  <ul className="space-y-2.5 mb-6">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2.5">
                        <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 ${
                          plan.highlight ? "bg-black/[0.06]" : "bg-white/[0.03]"
                        }`}>
                          <Check className={`w-2.5 h-2.5 ${plan.highlight ? "text-black" : "text-white/50"}`} />
                        </div>
                        <span className={`text-sm ${plan.highlight ? "text-black/60" : "text-white/45"}`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                  </ul>
                  
                  <button
                    onClick={() => scrollToSection('contact')}
                    className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all ${
                      plan.highlight
                        ? "bg-black text-white hover:bg-black/90"
                        : "bg-white/[0.04] hover:bg-white/[0.06] text-white border border-white/[0.04]"
                    }`}
                  >
                    Get started
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-white/25 mt-12"
        >
          Final pricing depends on scope, content, timeline, and integrations.
        </motion.p>
      </div>
    </section>
  )
}
