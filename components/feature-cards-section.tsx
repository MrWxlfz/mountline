"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Globe, Target, MessageSquare, Search, RefreshCw, ArrowRight } from "lucide-react"

const services = [
  {
    icon: Globe,
    title: "Business Websites",
    description: "Clean, mobile-friendly sites that make your business look professional and easy to understand. Multi-page layouts with clear service showcases.",
    features: ["Multi-page layouts", "Service showcases", "About and team pages", "Contact integration"],
  },
  {
    icon: Target,
    title: "Landing Pages",
    description: "Focused single pages for offers, ads, events, or specific services. Built for a single goal with clear calls-to-action.",
    features: ["Single-purpose design", "Clear call-to-action", "Fast loading", "Conversion-focused"],
  },
  {
    icon: MessageSquare,
    title: "Quote & Contact Systems",
    description: "Forms, quote requests, booking links, and follow-up flows that help turn visitors into leads.",
    features: ["Custom forms", "Quote calculators", "Booking integration", "Email notifications"],
  },
  {
    icon: Search,
    title: "Local SEO Basics",
    description: "Page structure, titles, descriptions, and content cleanup so customers understand what you do and where.",
    features: ["Meta optimization", "Content structure", "Local keywords", "Google-ready pages"],
  },
  {
    icon: RefreshCw,
    title: "Monthly Website Care",
    description: "Ongoing edits, new photos, service updates, seasonal changes, and basic site checks handled for you.",
    features: ["Regular updates", "Content changes", "Photo swaps", "Priority support"],
  }
]

export function FeatureCardsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="services" ref={ref} className="py-24 sm:py-32 bg-background relative">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-accent" />
            <span className="text-sm font-medium text-accent tracking-wide uppercase">
              What we build
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Practical services for better online presence.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            No agency overhead. Just clean design, clear structure, and systems that work.
          </p>
        </motion.div>

        {/* Services - Alternating layout */}
        <div className="space-y-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
              className={`group grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 p-6 sm:p-8 rounded-2xl border border-border bg-card hover:border-border-strong hover:shadow-lg transition-all duration-300 ${
                index % 2 === 1 ? "lg:text-right" : ""
              }`}
            >
              {/* Icon and title column */}
              <div className={`lg:col-span-4 flex flex-col ${index % 2 === 1 ? "lg:order-2 lg:items-end" : ""}`}>
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/15 group-hover:scale-105 transition-all duration-300">
                  <service.icon className="w-7 h-7 text-accent" />
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                  {service.title}
                </h3>
                <p className={`text-muted-foreground leading-relaxed text-sm sm:text-base ${
                  index % 2 === 1 ? "lg:text-right" : ""
                }`}>
                  {service.description}
                </p>
              </div>
              
              {/* Features column */}
              <div className={`lg:col-span-8 flex items-center ${
                index % 2 === 1 ? "lg:order-1 lg:justify-start" : "lg:justify-end"
              }`}>
                <div className={`grid grid-cols-2 gap-3 w-full max-w-md ${
                  index % 2 === 1 ? "" : "lg:ml-auto"
                }`}>
                  {service.features.map((feature, featureIndex) => (
                    <motion.div
                      key={feature}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={isInView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ duration: 0.4, delay: 0.2 + index * 0.08 + featureIndex * 0.05 }}
                      className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-muted/50 border border-border"
                    >
                      <div className="w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                      <span className="text-sm text-foreground truncate">{feature}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-8"
        >
          <p className="text-muted-foreground">
            Not sure what you need?
          </p>
          <motion.button
            onClick={() => scrollToSection('contact')}
            className="group flex items-center gap-2 text-foreground font-medium hover:text-accent transition-colors"
            whileHover={{ x: 4 }}
          >
            Book a free website review
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
