"use client"

import { motion } from "framer-motion"
import { Globe, FileText, MessageSquare, Lock, Sparkles, Wrench, ArrowRight } from "lucide-react"

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
    title: "Quote & Contact Flows",
    description: "Forms, booking links, payment links, and customer paths that make action simple and reduce friction.",
    icon: MessageSquare,
  },
  {
    number: "04",
    title: "Client Portals",
    description: "Private dashboards where clients track project status, send messages, view previews, and handle payments in one place.",
    icon: Lock,
  },
  {
    number: "05",
    title: "AI-Assisted Systems",
    description: "Practical AI tools for repetitive tasks, customer follow-up drafts, summaries, and internal workflows. No hype.",
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
    <section id="services" className="py-24 lg:py-32 bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6"
          >
            <span className="w-8 h-px bg-border" />
            Services
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]"
            >
              Everything your
              <br />
              <span className="text-muted-foreground/50">presence needs.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed lg:pt-4"
            >
              Nothing bloated. Just the tools that help your business grow and run smoother online.
            </motion.p>
          </div>
        </div>
        
        {/* Services list */}
        <div className="border-t border-border">
          {services.map((service, index) => (
            <motion.div
              key={service.number}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group border-b border-border"
            >
              <div className="py-8 lg:py-10 grid grid-cols-12 gap-4 lg:gap-8 items-center">
                {/* Number */}
                <div className="col-span-2 lg:col-span-1">
                  <span className="text-sm font-mono text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
                    {service.number}
                  </span>
                </div>
                
                {/* Icon and Title */}
                <div className="col-span-10 lg:col-span-4 flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center group-hover:bg-foreground/5 transition-colors shrink-0">
                    <service.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                  </div>
                  <h3 className="text-xl lg:text-2xl font-semibold text-foreground">
                    {service.title}
                  </h3>
                </div>
                
                {/* Description */}
                <div className="col-span-12 lg:col-span-6 lg:col-start-6">
                  <p className="text-muted-foreground leading-relaxed pl-0 lg:pl-0 mt-3 lg:mt-0">
                    {service.description}
                  </p>
                </div>
                
                {/* Arrow */}
                <div className="hidden lg:flex col-span-1 justify-end">
                  <ArrowRight className="w-5 h-5 text-muted-foreground/30 group-hover:text-foreground group-hover:translate-x-1 transition-all" />
                </div>
              </div>
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
            className="group inline-flex items-center gap-2 text-foreground font-medium hover:text-muted-foreground transition-colors"
          >
            Discuss your project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
