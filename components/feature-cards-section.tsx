"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Globe, Target, MessageSquare, Search, RefreshCw, ArrowRight } from "lucide-react"

const services = [
  {
    icon: Globe,
    title: "Business Websites",
    description: "Clean, mobile-friendly websites that make your business look professional and easy to understand.",
    features: ["Multi-page layouts", "Service showcases", "About and team pages", "Contact integration"]
  },
  {
    icon: Target,
    title: "Landing Pages",
    description: "Focused pages for offers, ads, events, launches, or specific services.",
    features: ["Single-purpose design", "Clear call-to-action", "Fast loading", "Conversion-focused"]
  },
  {
    icon: MessageSquare,
    title: "Quote & Contact Systems",
    description: "Forms, quote requests, booking links, and basic follow-up flows that help turn visitors into leads.",
    features: ["Custom forms", "Quote calculators", "Booking integration", "Email notifications"]
  },
  {
    icon: Search,
    title: "Local SEO Basics",
    description: "Page structure, titles, descriptions, and content cleanup so customers understand what you do and where you serve.",
    features: ["Meta optimization", "Content structure", "Local keywords", "Google-ready pages"]
  },
  {
    icon: RefreshCw,
    title: "Monthly Website Care",
    description: "Ongoing edits, new photos, service updates, seasonal changes, and basic site checks.",
    features: ["Regular updates", "Content changes", "Photo swaps", "Priority support"]
  }
]

export function FeatureCardsSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="services" ref={ref} className="py-20 sm:py-24 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
            What Northline builds.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Practical services for businesses that need a better online presence without the agency overhead.
          </p>
        </motion.div>

        {/* Services grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={service.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-white rounded-xl border border-slate-200 p-6 hover:shadow-lg hover:shadow-slate-900/5 hover:border-slate-300 transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-lg bg-slate-900 flex items-center justify-center mb-5">
                <service.icon className="w-5 h-5 text-white" />
              </div>
              
              <h3 className="text-xl font-semibold text-slate-900 mb-3">
                {service.title}
              </h3>
              
              <p className="text-slate-600 text-sm leading-relaxed mb-5">
                {service.description}
              </p>
              
              <ul className="space-y-2">
                {service.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm text-slate-500">
                    <div className="w-1 h-1 rounded-full bg-slate-400" />
                    {feature}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
          
          {/* CTA card */}
          <motion.a
            href="#contact"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="group bg-slate-900 rounded-xl p-6 flex flex-col justify-between min-h-[280px] hover:bg-slate-800 transition-colors"
          >
            <div>
              <h3 className="text-xl font-semibold text-white mb-3">
                Not sure what you need?
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                Book a free website review and we will take a look at your current site, discuss your goals, and recommend a clear path forward.
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-white font-medium mt-6">
              Book a review
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </motion.a>
        </div>
      </div>
    </section>
  )
}
