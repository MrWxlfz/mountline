"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

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
    <section id="pricing" className="relative py-40 px-6" style={{ backgroundColor: "#09090B" }}>
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
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
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-zinc-400 text-lg max-w-md mx-auto"
          >
            Start with what your business needs now. Add more when it actually helps.
          </motion.p>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className={`relative rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-zinc-800/80 border-2 border-zinc-600"
                  : "bg-zinc-900/50 border border-zinc-800"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-white text-zinc-900 text-xs font-medium rounded-full">
                  Most popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-white font-medium text-xl mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-zinc-500 text-sm">{plan.priceNote}</span>
                  <span className="text-white text-4xl font-semibold">{plan.price}</span>
                  {plan.priceSuffix && <span className="text-zinc-400 text-lg">{plan.priceSuffix}</span>}
                </div>
                <p className="text-zinc-500 text-sm mt-3">{plan.description}</p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <Check className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-zinc-300 text-sm">{feature}</span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`block w-full text-center py-3 rounded-lg font-medium text-sm transition-colors ${
                  plan.highlighted
                    ? "bg-white text-zinc-900 hover:bg-zinc-100"
                    : "bg-zinc-800 text-white border border-zinc-700 hover:bg-zinc-700"
                }`}
              >
                {plan.cta}
              </a>
            </motion.div>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-zinc-500 text-sm mt-12"
        >
          Final pricing depends on scope, content, timeline, and integrations.
        </motion.p>
      </div>
    </section>
  )
}
