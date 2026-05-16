"use client"

import { motion } from "framer-motion"
import { Globe, FileText, MessageSquare, Sparkles, Wrench } from "lucide-react"

const services = [
  {
    number: "01",
    title: "Business Websites",
    description: "Clean, mobile-first websites that make a business easier to understand and trust.",
    icon: Globe,
  },
  {
    number: "02", 
    title: "Landing Pages",
    description: "Focused pages for offers, campaigns, launches, ads, or specific services.",
    icon: FileText,
  },
  {
    number: "03",
    title: "Quote & Contact Flows",
    description: "Forms, booking links, payment links, and customer paths that make action simple.",
    icon: MessageSquare,
  },
  {
    number: "04",
    title: "AI-Assisted Systems",
    description: "Practical AI tools for repetitive tasks, customer follow-up drafts, summaries, and internal workflows.",
    icon: Sparkles,
  },
  {
    number: "05",
    title: "Monthly Website Care",
    description: "Updates, photos, seasonal changes, basic checks, and priority fixes.",
    icon: Wrench,
  },
]

export function FeatureCardsSection() {
  return (
    <section id="services" className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-muted-foreground tracking-wide uppercase mb-4"
          >
            Services
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] max-w-3xl"
          >
            Everything your online presence needs.{" "}
            <span className="text-muted-foreground/70">Nothing bloated.</span>
          </motion.h2>
        </div>
        
        {/* Service rows */}
        <div className="border-t border-border">
          {services.map((service, index) => (
            <motion.div
              key={service.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group border-b border-border py-8 lg:py-10"
            >
              <div className="grid grid-cols-12 gap-4 items-start lg:items-center">
                {/* Number */}
                <div className="col-span-2 lg:col-span-1">
                  <span className="text-sm font-mono text-muted-foreground">
                    {service.number}
                  </span>
                </div>
                
                {/* Title */}
                <div className="col-span-10 lg:col-span-4">
                  <h3 className="text-xl lg:text-2xl font-semibold text-foreground group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>
                </div>
                
                {/* Description */}
                <div className="col-span-12 lg:col-span-6 lg:col-start-6">
                  <p className="text-muted-foreground leading-relaxed mt-2 lg:mt-0">
                    {service.description}
                  </p>
                </div>
                
                {/* Icon */}
                <div className="hidden lg:flex col-span-1 justify-end">
                  <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center group-hover:border-accent/30 group-hover:bg-accent/5 transition-colors">
                    <service.icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
