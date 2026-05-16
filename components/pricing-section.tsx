"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Check, ArrowRight, Star } from "lucide-react"

const pricingPlans = [
  {
    name: "Starter",
    price: "$500",
    priceNote: "Starting at",
    description: "A clean one-page website for businesses just getting started online.",
    features: [
      "One-page website",
      "Mobile-friendly design",
      "Services and contact sections",
      "Contact or quote form",
      "Basic SEO setup",
      "Launch support",
    ],
    highlighted: false,
  },
  {
    name: "Business",
    price: "$1,250",
    priceNote: "Starting at",
    description: "A complete multi-page site for a stronger online presence.",
    features: [
      "Multi-page or advanced single-page",
      "About, services, contact, FAQ",
      "Gallery and testimonials",
      "Analytics-ready setup",
      "Stronger conversion layout",
      "Launch support",
    ],
    highlighted: true,
  },
  {
    name: "Monthly Care",
    price: "$149",
    priceNote: "Starting at",
    priceSuffix: "/mo",
    description: "Ongoing updates handled without chasing a designer.",
    features: [
      "Small monthly edits",
      "New photos or service updates",
      "Seasonal changes",
      "Basic site checks",
      "Priority fixes",
      "Light content updates",
    ],
    highlighted: false,
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
    <section id="pricing" ref={ref} className="py-24 sm:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/[0.02] to-transparent" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - Centered */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <div className="flex items-center justify-center gap-3 mb-6">
            <span className="w-8 h-px bg-border-strong" />
            <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              Pricing
            </span>
            <span className="w-8 h-px bg-border-strong" />
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Simple packages. Clear scope.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Start with the site your business needs now. Add more when it actually helps.
          </p>
        </motion.div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
          {pricingPlans.map((plan, index) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className={`group relative ${plan.highlighted ? "lg:-mt-4 lg:mb-4" : ""}`}
            >
              {/* Popular badge */}
              {plan.highlighted && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="absolute -top-3 left-1/2 -translate-x-1/2 z-10"
                >
                  <span className="inline-flex items-center gap-1.5 bg-foreground text-background text-xs font-medium px-3 py-1.5 rounded-full">
                    <Star className="w-3 h-3" />
                    Most popular
                  </span>
                </motion.div>
              )}
              
              <div className={`h-full rounded-2xl border overflow-hidden transition-all duration-300 ${
                plan.highlighted
                  ? "bg-foreground text-background border-foreground shadow-2xl"
                  : "bg-card border-border hover:border-border-strong hover:shadow-lg"
              }`}>
                <div className="p-6 sm:p-8">
                  {/* Plan name */}
                  <h3 className={`text-lg font-semibold mb-4 ${
                    plan.highlighted ? "text-background" : "text-foreground"
                  }`}>
                    {plan.name}
                  </h3>
                  
                  {/* Price */}
                  <div className="mb-4">
                    <div className={`text-xs uppercase tracking-wider mb-1 ${
                      plan.highlighted ? "text-background/60" : "text-muted-foreground"
                    }`}>
                      {plan.priceNote}
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className={`text-4xl sm:text-5xl font-bold tracking-tight ${
                        plan.highlighted ? "text-background" : "text-foreground"
                      }`}>
                        {plan.price}
                      </span>
                      {plan.priceSuffix && (
                        <span className={`text-lg ${
                          plan.highlighted ? "text-background/60" : "text-muted-foreground"
                        }`}>
                          {plan.priceSuffix}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {/* Description */}
                  <p className={`text-sm leading-relaxed mb-6 ${
                    plan.highlighted ? "text-background/70" : "text-muted-foreground"
                  }`}>
                    {plan.description}
                  </p>
                  
                  {/* Divider */}
                  <div className={`h-px mb-6 ${
                    plan.highlighted ? "bg-background/10" : "bg-border"
                  }`} />
                  
                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                          plan.highlighted ? "bg-background/10" : "bg-accent/10"
                        }`}>
                          <Check className={`w-3 h-3 ${
                            plan.highlighted ? "text-background" : "text-accent"
                          }`} />
                        </div>
                        <span className={`text-sm ${
                          plan.highlighted ? "text-background/80" : "text-muted-foreground"
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
                    className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-xl text-sm font-medium transition-all duration-300 ${
                      plan.highlighted
                        ? "bg-background text-foreground hover:bg-background/90"
                        : "bg-foreground text-background hover:bg-foreground/90"
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

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <p className="text-muted-foreground text-sm">
            Final pricing depends on scope, content, timeline, and integrations.{" "}
            <button 
              onClick={() => scrollToSection('contact')} 
              className="text-foreground hover:text-accent underline underline-offset-4 transition-colors"
            >
              Get a custom quote
            </button>
          </p>
        </motion.div>
      </div>
    </section>
  )
}
