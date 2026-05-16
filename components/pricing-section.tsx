"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Check, ArrowRight, Star, CreditCard } from "lucide-react"

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
    gradient: "from-blue-500/10 to-cyan-500/10"
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
    gradient: "from-violet-500/10 to-purple-500/10"
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
    gradient: "from-emerald-500/10 to-teal-500/10"
  },
]

export function PricingSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="pricing" ref={ref} className="py-24 sm:py-32 section-alt">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6"
          >
            <CreditCard className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Pricing</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Simple packages. Clear scope.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Start with the site your business needs now. Add more when it actually helps.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className={`relative group ${
                plan.highlighted
                  ? "card-premium bg-primary text-primary-foreground ring-2 ring-primary"
                  : "card-premium"
              }`}
            >
              {/* Background gradient */}
              {!plan.highlighted && (
                <div className={`absolute inset-0 bg-gradient-to-br ${plan.gradient} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
              )}
              
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-1.5 bg-accent text-accent-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-lg">
                    <Star className="w-3 h-3" />
                    Most popular
                  </span>
                </div>
              )}

              <div className="relative p-6 sm:p-8">
                <div className="mb-6">
                  <h3 className={`font-semibold text-xl mb-2 ${plan.highlighted ? "text-primary-foreground" : "text-foreground"}`}>
                    {plan.name}
                  </h3>
                  <div className="flex items-baseline gap-1 mb-3">
                    <span className={`text-sm ${plan.highlighted ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                      {plan.priceNote}
                    </span>
                    <span className={`text-4xl font-bold tracking-tight ${plan.highlighted ? "text-primary-foreground" : "text-foreground"}`}>
                      {plan.price}
                    </span>
                    {plan.priceSuffix && (
                      <span className={`text-lg ${plan.highlighted ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                        {plan.priceSuffix}
                      </span>
                    )}
                  </div>
                  <p className={`text-sm leading-relaxed ${plan.highlighted ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                    {plan.description}
                  </p>
                </div>

                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        plan.highlighted ? "bg-primary-foreground/20" : "bg-accent/10"
                      }`}>
                        <Check className={`w-3 h-3 ${plan.highlighted ? "text-primary-foreground" : "text-accent"}`} />
                      </div>
                      <span className={`text-sm ${plan.highlighted ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                        {feature}
                      </span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  onClick={() => scrollToSection('contact')}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`flex items-center justify-center gap-2 w-full py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                    plan.highlighted
                      ? "bg-primary-foreground text-primary hover:bg-primary-foreground/90"
                      : "btn-primary"
                  }`}
                >
                  {plan.cta}
                  <ArrowRight className="w-4 h-4" />
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center text-muted-foreground text-sm mt-10"
        >
          Final pricing depends on scope, content, timeline, and integrations.{" "}
          <button 
            onClick={() => scrollToSection('contact')} 
            className="text-foreground hover:text-accent underline underline-offset-2 transition-colors"
          >
            Get a custom quote
          </button>
        </motion.p>
      </div>
    </section>
  )
}
