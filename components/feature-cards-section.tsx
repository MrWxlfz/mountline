"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Globe, Target, MessageSquare, Search, RefreshCw, ArrowRight, Sparkles } from "lucide-react"

const services = [
  {
    icon: Globe,
    title: "Business Websites",
    description: "Clean, mobile-friendly websites that make your business look professional and easy to understand.",
    features: ["Multi-page layouts", "Service showcases", "About and team pages", "Contact integration"],
    accent: "from-blue-500 to-cyan-500"
  },
  {
    icon: Target,
    title: "Landing Pages",
    description: "Focused pages for offers, ads, events, launches, or specific services.",
    features: ["Single-purpose design", "Clear call-to-action", "Fast loading", "Conversion-focused"],
    accent: "from-violet-500 to-purple-500"
  },
  {
    icon: MessageSquare,
    title: "Quote & Contact Systems",
    description: "Forms, quote requests, booking links, and basic follow-up flows that help turn visitors into leads.",
    features: ["Custom forms", "Quote calculators", "Booking integration", "Email notifications"],
    accent: "from-emerald-500 to-teal-500"
  },
  {
    icon: Search,
    title: "Local SEO Basics",
    description: "Page structure, titles, descriptions, and content cleanup so customers understand what you do.",
    features: ["Meta optimization", "Content structure", "Local keywords", "Google-ready pages"],
    accent: "from-amber-500 to-orange-500"
  },
  {
    icon: RefreshCw,
    title: "Monthly Website Care",
    description: "Ongoing edits, new photos, service updates, seasonal changes, and basic site checks.",
    features: ["Regular updates", "Content changes", "Photo swaps", "Priority support"],
    accent: "from-rose-500 to-pink-500"
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
    <section id="services" ref={ref} className="py-24 sm:py-32 section-default">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 border border-accent/20 mb-6"
          >
            <Sparkles className="w-4 h-4 text-accent" />
            <span className="text-sm font-medium text-accent">Services</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            What northline builds.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Practical services for businesses that need a better online presence without the agency overhead.
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
              className="group card-premium p-6 flex flex-col"
            >
              {/* Gradient accent line */}
              <div className={`h-1 w-12 rounded-full bg-gradient-to-r ${service.accent} mb-6 group-hover:w-16 transition-all duration-300`} />
              
              <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                <service.icon className="w-6 h-6 text-foreground" />
              </div>
              
              <h3 className="text-xl font-semibold text-foreground mb-3">
                {service.title}
              </h3>
              
              <p className="text-muted-foreground text-sm leading-relaxed mb-5 flex-1">
                {service.description}
              </p>
              
              <ul className="space-y-2.5">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2.5 text-sm text-muted-foreground">
                    <div className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${service.accent}`} />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
          
          {/* CTA card */}
          <motion.button
            onClick={() => scrollToSection('contact')}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="group bg-primary text-primary-foreground rounded-xl p-6 flex flex-col justify-between min-h-[320px] hover:scale-[1.02] transition-transform duration-300 text-left"
          >
            <div>
              <div className="w-12 h-12 rounded-xl bg-primary-foreground/10 flex items-center justify-center mb-6">
                <ArrowRight className="w-6 h-6 text-primary-foreground" />
              </div>
              
              <h3 className="text-xl font-semibold mb-3">
                Not sure what you need?
              </h3>
              <p className="text-primary-foreground/70 text-sm leading-relaxed">
                Book a free website review and we will take a look at your current site, discuss your goals, and recommend a clear path forward.
              </p>
            </div>
            
            <div className="flex items-center gap-2 font-medium mt-6">
              Book a review
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.button>
        </div>
      </div>
    </section>
  )
}
