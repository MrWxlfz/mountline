"use client"

import { motion } from "framer-motion"
import { Globe, FileText, LayoutDashboard, MessageSquare, Sparkles, Wrench, ArrowRight } from "lucide-react"

const services = [
  {
    number: "01",
    title: "Business Websites",
    description: "Clean, mobile-first websites that make a business easier to understand and trust. Built for speed, clarity, and conversion.",
    icon: Globe,
  },
  {
    number: "02", 
    title: "Landing Pages",
    description: "Focused pages for offers, campaigns, launches, or specific services. Designed to convert visitors into leads.",
    icon: FileText,
  },
  {
    number: "03",
    title: "Client Portals",
    description: "Private dashboards where clients track progress, view previews, send messages, and manage payments in one place.",
    icon: LayoutDashboard,
  },
  {
    number: "04",
    title: "Quote & Contact Flows",
    description: "Forms, booking links, payment links, and customer paths that make action simple and reduce friction.",
    icon: MessageSquare,
  },
  {
    number: "05",
    title: "AI-Assisted Systems",
    description: "Practical AI tools for repetitive tasks, customer follow-up drafts, summaries, and internal workflows.",
    icon: Sparkles,
  },
  {
    number: "06",
    title: "Monthly Website Care",
    description: "Updates, photos, seasonal changes, basic checks, and priority fixes. Keep your site fresh without thinking about it.",
    icon: Wrench,
  },
]

export function FeatureCardsSection() {
  return (
    <section id="services" className="py-28 lg:py-36 bg-black border-t border-white/[0.04]">
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
            Services
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] max-w-3xl mb-6"
          >
            Everything your presence
            <span className="text-white/25"> needs.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-white/35 max-w-xl leading-relaxed"
          >
            Nothing bloated. Just the tools that help your business grow and look sharper online.
          </motion.p>
        </div>
        
        {/* Service rows */}
        <div className="border-t border-white/[0.04]">
          {services.map((service, index) => (
            <motion.div
              key={service.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.04 }}
              className="group border-b border-white/[0.04] py-8 lg:py-9 hover:bg-white/[0.01] transition-colors -mx-6 px-6 lg:-mx-8 lg:px-8"
            >
              <div className="flex items-start lg:items-center gap-6 lg:gap-10">
                {/* Number */}
                <span className="text-sm font-mono text-white/20 group-hover:text-white/35 transition-colors w-8 shrink-0">
                  {service.number}
                </span>
                
                {/* Icon + Title */}
                <div className="flex items-center gap-4 min-w-[200px] lg:min-w-[260px]">
                  <div className="w-10 h-10 rounded-xl border border-white/[0.06] bg-white/[0.02] flex items-center justify-center group-hover:border-white/[0.1] group-hover:bg-white/[0.03] transition-all">
                    <service.icon className="w-4 h-4 text-white/45 group-hover:text-white/65 transition-colors" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">{service.title}</h3>
                </div>
                
                {/* Description */}
                <p className="hidden lg:block flex-1 text-white/40 leading-relaxed text-sm">
                  {service.description}
                </p>
              </div>
              
              {/* Description - mobile */}
              <p className="lg:hidden text-white/40 leading-relaxed text-sm mt-4 ml-14">
                {service.description}
              </p>
            </motion.div>
          ))}
        </div>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 flex justify-center"
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 text-white font-medium hover:text-white/70 transition-colors"
          >
            Discuss your project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
