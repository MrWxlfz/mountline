"use client"

import { motion } from "framer-motion"
import { Check, ArrowRight, Sparkles } from "lucide-react"

const pricingPlans = [
  {
    name: "Starter Site",
    price: "$300",
    priceNote: "Starting at",
    description: "Best for small businesses that need a clean online presence quickly.",
    features: [
      "One-page website",
      "Mobile-first design",
      "Services/contact sections",
      "Contact form UI",
      "Basic SEO setup",
      "Deployed live",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Business Site",
    price: "$750",
    priceNote: "Starting at",
    description: "Best for businesses that need a stronger, more complete site.",
    features: [
      "Multi-section or multi-page build",
      "About/services/contact",
      "Gallery, testimonials, or FAQ",
      "Analytics-ready setup",
      "Better conversion layout",
      "Launch support",
    ],
    cta: "Get started",
    highlighted: true,
  },
  {
    name: "Monthly Care",
    price: "$75",
    priceNote: "Starting at",
    priceSuffix: "/mo",
    description: "Best for businesses that want updates handled without stress.",
    features: [
      "Small monthly edits",
      "New photos/services",
      "Seasonal updates",
      "Basic site checks",
      "Priority fixes",
      "Light content updates",
    ],
    cta: "Learn more",
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section id="pricing" className="relative py-32 md:py-40 px-6 overflow-hidden" style={{ backgroundColor: "#09090B" }}>
      {/* Subtle gradient overlay */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "30%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, transparent 100%)",
        }}
      />
      
      {/* Decorative background element */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] pointer-events-none opacity-30">
        <div className="absolute inset-0 bg-gradient-to-r from-northline-accent/5 via-transparent to-northline-violet/5 blur-3xl" />
      </div>

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="text-center mb-16 md:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-800/50 border border-zinc-700/50 mb-6"
          >
            <Sparkles className="w-4 h-4 text-northline-accent" />
            <span className="text-sm text-zinc-400">Transparent pricing</span>
          </motion.div>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] text-white mb-6"
            style={{
              letterSpacing: "-0.0325em",
              fontVariationSettings: '"opsz" 28',
              fontWeight: 538,
              lineHeight: 1.1,
            }}
          >
            Packages that make sense.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-zinc-400 text-lg max-w-md mx-auto"
          >
            Start with what your business needs now. Add more when it actually helps.
          </motion.p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
              className={`group relative rounded-2xl p-8 transition-all duration-300 ${
                plan.highlighted
                  ? "bg-gradient-to-b from-zinc-800/80 to-zinc-900/80 border-2 border-zinc-600 shadow-xl shadow-northline-accent/5"
                  : "bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <div className="px-4 py-1.5 bg-gradient-to-r from-white to-zinc-200 text-zinc-900 text-xs font-medium rounded-full shadow-lg">
                    Most popular
                  </div>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-white font-medium text-xl mb-3">{plan.name}</h3>
                <div className="flex items-baseline gap-1.5 mb-4">
                  <span className="text-zinc-500 text-sm">{plan.priceNote}</span>
                  <span className="text-4xl font-semibold text-white tracking-tight">
                    {plan.price}
                  </span>
                  {plan.priceSuffix && (
                    <span className="text-zinc-500 text-lg">{plan.priceSuffix}</span>
                  )}
                </div>
                <p className="text-zinc-500 text-sm leading-relaxed">{plan.description}</p>
              </div>

              <ul className="space-y-3.5 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                      plan.highlighted 
                        ? "bg-northline-accent/20"
                        : "bg-zinc-800"
                    }`}>
                      <Check className={`w-3 h-3 ${
                        plan.highlighted 
                          ? "text-northline-accent-light"
                          : "text-zinc-500"
                      }`} />
                    </div>
                    <span className="text-zinc-400 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  plan.highlighted
                    ? "bg-white text-zinc-900 hover:bg-zinc-100"
                    : "bg-zinc-800 text-zinc-300 border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-center text-zinc-600 text-sm mt-12"
        >
          All packages include deployment and basic launch support. Custom scopes available on request.
        </motion.p>
      </div>
    </section>
  )
}
