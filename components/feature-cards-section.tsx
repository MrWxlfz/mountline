"use client"

import { motion } from "framer-motion"
import { Globe, FileText, MessageSquare, Sparkles, Wrench, ArrowRight } from "lucide-react"

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
    title: "Quote & Contact Flows",
    description: "Forms, booking links, payment links, and customer paths that make action simple and reduce friction.",
    icon: MessageSquare,
    features: ["Smart forms", "Integrations", "Automations"],
  },
  {
    number: "04",
    title: "AI-Assisted Systems",
    description: "Practical AI tools for repetitive tasks, customer follow-up drafts, summaries, and internal workflows.",
    icon: Sparkles,
    features: ["No gimmicks", "Useful tools", "Time saved"],
  },
  {
    number: "05",
    title: "Monthly Website Care",
    description: "Updates, photos, seasonal changes, basic checks, and priority fixes. Keep your site fresh without thinking about it.",
    icon: Wrench,
    features: ["Regular updates", "Priority support", "Peace of mind"],
  },
]

function AnimatedIcon({ Icon, index }: { Icon: typeof Globe; index: number }) {
  return (
    <motion.div
      className="w-12 h-12 rounded-xl border border-border bg-card flex items-center justify-center group-hover:border-foreground/30 group-hover:bg-foreground/5 transition-all duration-300"
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 + index * 0.1 }}
    >
      <Icon className="w-5 h-5 text-foreground/70 group-hover:text-foreground transition-colors" />
    </motion.div>
  )
}

export function FeatureCardsSection() {
  return (
    <section id="services" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="mb-14 lg:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-foreground/60 tracking-wide uppercase mb-4"
          >
            <span className="w-8 h-px bg-foreground/20" />
            Services
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] max-w-3xl mb-5"
          >
            Everything your online
            <br />
            <span className="text-foreground/50">presence needs.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base lg:text-lg text-foreground/70 max-w-xl leading-relaxed"
          >
            No bloat. No unnecessary features. Just the tools that help your business grow.
          </motion.p>
        </div>
        
        {/* Service rows */}
        <div className="border-t border-foreground/10">
          {services.map((service, index) => (
            <motion.div
              key={service.number}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group border-b border-foreground/10 py-7 lg:py-8 hover:bg-foreground/[0.02] transition-colors -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 cursor-pointer"
            >
              <div className="grid grid-cols-12 gap-4 lg:gap-8 items-start lg:items-center">
                {/* Number */}
                <div className="col-span-2 lg:col-span-1">
                  <motion.span 
                    className="text-sm font-mono text-foreground/40 group-hover:text-foreground/60 transition-colors"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.1 + index * 0.08 }}
                  >
                    {service.number}
                  </motion.span>
                </div>
                
                {/* Title with icon */}
                <div className="col-span-10 lg:col-span-3 flex items-center gap-4">
                  <AnimatedIcon Icon={service.icon} index={index} />
                  <h3 className="text-lg lg:text-xl font-semibold text-foreground group-hover:text-accent transition-colors">
                    {service.title}
                  </h3>
                </div>
                
                {/* Description */}
                <div className="col-span-12 lg:col-span-5 lg:col-start-5">
                  <p className="text-foreground/70 leading-relaxed mt-3 lg:mt-0 text-[15px]">
                    {service.description}
                  </p>
                </div>
                
                {/* Features */}
                <div className="col-span-12 lg:col-span-3 flex flex-wrap gap-2 mt-3 lg:mt-0 lg:justify-end">
                  {service.features.map((feature) => (
                    <span 
                      key={feature}
                      className="px-2.5 py-1 text-[11px] text-foreground/60 bg-foreground/5 border border-foreground/10 rounded-full uppercase tracking-wider font-medium"
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
          className="mt-10 flex justify-center"
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 text-foreground font-medium hover:text-accent transition-colors"
          >
            Discuss your project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
