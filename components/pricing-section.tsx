"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Check, ArrowRight } from "lucide-react"

const pricingPlans = [
  {
    name: "Starter Website",
    price: "$500",
    priceNote: "Starting at",
    description: "For businesses that need a clean, professional one-page website.",
    features: [
      "One-page website",
      "Mobile-friendly design",
      "Services and contact sections",
      "Contact or quote form",
      "Basic SEO setup",
      "Launch support",
    ],
    cta: "Get started",
    highlighted: false,
  },
  {
    name: "Business Website",
    price: "$1,250",
    priceNote: "Starting at",
    description: "For businesses that need a stronger online presence.",
    features: [
      "Multi-page or advanced single-page site",
      "About, services, contact, FAQ",
      "Gallery, testimonials, or trust sections",
      "Analytics-ready setup",
      "Stronger conversion layout",
      "Launch support",
    ],
    cta: "Get started",
    highlighted: true,
  },
  {
    name: "Monthly Care",
    price: "$149",
    priceNote: "Starting at",
    priceSuffix: "/mo",
    description: "For businesses that want updates handled without chasing a designer.",
    features: [
      "Small monthly edits",
      "New photos or service updates",
      "Seasonal changes",
      "Basic site checks",
      "Priority fixes",
      "Light content updates",
    ],
    cta: "Learn more",
    highlighted: false,
  },
]

export function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="pricing" ref={ref} className="py-20 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
            Simple packages. Clear scope.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Start with the site your business needs now. Add more when it actually helps.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`relative rounded-xl p-6 sm:p-8 ${
                plan.highlighted
                  ? "bg-slate-900 text-white ring-2 ring-slate-900"
                  : "bg-stone-50 border border-stone-200"
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-blue-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              )}

              <div className="mb-6">
                <h3 className={`font-semibold text-xl mb-2 ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className={`text-sm ${plan.highlighted ? "text-slate-400" : "text-slate-500"}`}>
                    {plan.priceNote}
                  </span>
                  <span className={`text-4xl font-semibold tracking-tight ${plan.highlighted ? "text-white" : "text-slate-900"}`}>
                    {plan.price}
                  </span>
                  {plan.priceSuffix && (
                    <span className={`text-lg ${plan.highlighted ? "text-slate-400" : "text-slate-500"}`}>
                      {plan.priceSuffix}
                    </span>
                  )}
                </div>
                <p className={`text-sm leading-relaxed ${plan.highlighted ? "text-slate-300" : "text-slate-600"}`}>
                  {plan.description}
                </p>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                      plan.highlighted ? "bg-blue-600" : "bg-slate-200"
                    }`}>
                      <Check className={`w-3 h-3 ${plan.highlighted ? "text-white" : "text-slate-600"}`} />
                    </div>
                    <span className={`text-sm ${plan.highlighted ? "text-slate-300" : "text-slate-600"}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <a
                href="#contact"
                className={`flex items-center justify-center gap-2 w-full py-3 rounded-lg text-sm font-medium transition-colors ${
                  plan.highlighted
                    ? "bg-white text-slate-900 hover:bg-slate-100"
                    : "bg-slate-900 text-white hover:bg-slate-800"
                }`}
              >
                {plan.cta}
                <ArrowRight className="w-4 h-4" />
              </a>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center text-slate-500 text-sm mt-10"
        >
          Final pricing depends on scope, content, timeline, and integrations. 
          <a href="#contact" className="text-slate-700 hover:text-slate-900 underline ml-1">
            Get a custom quote
          </a>
        </motion.p>
      </div>
    </section>
  )
}
