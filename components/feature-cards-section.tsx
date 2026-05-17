"use client"

import { motion } from "framer-motion"
import { Globe, FileText, MessageSquare, Sparkles, Wrench, LayoutDashboard, ArrowRight } from "lucide-react"

const services = [
  {
    number: "01",
    title: "Business Websites",
    description: "Clean, mobile-first websites that make a business easier to understand and trust. Built for speed, clarity, and conversion.",
    icon: Globe,
    features: ["Mobile-first", "Fast loading", "SEO ready"],
  },
  {
    number: "02", 
    title: "Landing Pages",
    description: "Focused pages for offers, campaigns, launches, ads, or specific services. Designed to convert visitors into leads.",
    icon: FileText,
    features: ["High conversion", "A/B ready", "Analytics"],
  },
  {
    number: "03",
    title: "Client Portals",
    description: "Private dashboards where clients track progress, view previews, send messages, and manage payments in one place.",
    icon: LayoutDashboard,
    features: ["Progress tracking", "Support chat", "Payments"],
  },
  {
    number: "04",
    title: "Quote & Contact Flows",
    description: "Forms, booking links, payment links, and customer paths that make action simple and reduce friction.",
    icon: MessageSquare,
    features: ["Smart forms", "Integrations", "Automations"],
  },
  {
    number: "05",
    title: "AI-Assisted Systems",
    description: "Practical AI tools for repetitive tasks, customer follow-up drafts, summaries, and internal workflows.",
    icon: Sparkles,
    features: ["No gimmicks", "Useful tools", "Time saved"],
  },
  {
    number: "06",
    title: "Monthly Website Care",
    description: "Updates, photos, seasonal changes, basic checks, and priority fixes. Keep your site fresh without thinking about it.",
    icon: Wrench,
    features: ["Regular updates", "Priority support", "Peace of mind"],
  },
]

export function FeatureCardsSection() {
  return (
    <section id="services" className="py-28 lg:py-36 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-foreground/50 tracking-wide uppercase mb-6"
          >
            <span className="w-10 h-px bg-foreground/15" />
            Services
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.05] max-w-3xl mb-6"
          >
            Everything your online
            <span className="text-foreground/35"> presence needs.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-foreground/55 max-w-xl leading-relaxed"
          >
            Nothing bloated. Just the tools that help your business grow and look sharper online.
          </motion.p>
        </div>
        
        {/* Service rows */}
        <div className="border-t border-foreground/[0.06]">
          {services.map((service, index) => (
            <motion.div
              key={service.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group border-b border-foreground/[0.06] py-9 lg:py-10 hover:bg-foreground/[0.015] transition-colors -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 cursor-pointer"
            >
              <div className="grid grid-cols-12 gap-4 lg:gap-8 items-start lg:items-center">
                {/* Number */}
                <div className="col-span-2 lg:col-span-1">
                  <span className="text-sm font-mono text-foreground/25 group-hover:text-foreground/40 transition-colors">
                    {service.number}
                  </span>
                </div>
                
                {/* Title with icon */}
                <div className="col-span-10 lg:col-span-3 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] flex items-center justify-center group-hover:border-foreground/15 group-hover:bg-foreground/[0.04] transition-all duration-300">
                    <service.icon className="w-5 h-5 text-foreground/55 group-hover:text-foreground/75 transition-colors" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>
                </div>
                
                {/* Description */}
                <div className="col-span-12 lg:col-span-5 lg:col-start-5">
                  <p className="text-foreground/55 leading-relaxed mt-3 lg:mt-0 text-base">
                    {service.description}
                  </p>
                </div>
                
                {/* Features */}
                <div className="col-span-12 lg:col-span-3 flex flex-wrap gap-2 mt-4 lg:mt-0 lg:justify-end">
                  {service.features.map((feature) => (
                    <span 
                      key={feature}
                      className="px-3 py-1.5 text-[10px] text-foreground/45 bg-foreground/[0.02] border border-foreground/[0.06] rounded-lg uppercase tracking-wider font-medium"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 flex justify-center"
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-2.5 text-foreground font-medium hover:text-accent transition-colors"
          >
            Discuss your project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
