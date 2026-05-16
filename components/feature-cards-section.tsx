"use client"

import { motion } from "framer-motion"
import { ChevronRight, Globe, Zap, Settings, ArrowUpRight } from "lucide-react"

const featureCards = [
  {
    title: "Websites that feel current",
    description: "Clean, responsive sites designed to make your business look credible from the first click. No outdated templates.",
    icon: Globe,
    accent: "blue",
  },
  {
    title: "Landing pages that convert",
    description: "Focused pages for offers, services, launches, and campaigns without bloated agency timelines or inflated costs.",
    icon: Zap,
    accent: "emerald",
  },
  {
    title: "Simple systems behind the scenes",
    description: "Forms, booking tools, payments, analytics, and automations connected in a way that actually makes sense for your business.",
    icon: Settings,
    accent: "violet",
  },
]

const accentColors = {
  blue: {
    bg: "bg-blue-500/10",
    border: "border-blue-500/20",
    text: "text-blue-400",
    glow: "rgba(59, 130, 246, 0.15)",
  },
  emerald: {
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    text: "text-emerald-400",
    glow: "rgba(16, 185, 129, 0.15)",
  },
  violet: {
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
    text: "text-violet-400",
    glow: "rgba(139, 92, 246, 0.15)",
  },
}

export function FeatureCardsSection() {
  return (
    <section id="services" className="relative z-20 py-32 md:py-40 bg-zinc-950">
      {/* Subtle top gradient */}
      <div
        className="absolute top-0 left-0 right-0 h-px"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(63, 63, 70, 0.5), transparent)",
        }}
      />
      
      <div className="w-full flex justify-center px-6">
        <div className="w-full max-w-5xl">
          {/* Section eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-zinc-500 text-sm tracking-wide uppercase">Services</span>
          </motion.div>

          {/* Header row */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] text-white max-w-xl leading-[1.1] tracking-tight"
            >
              Made for businesses that need more than a basic template.
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-md lg:pt-2"
            >
              <p className="text-zinc-400 leading-relaxed mb-4">
                A website should do more than exist. It should explain what you do, build trust fast, and make it easy for customers to take the next step.
              </p>
              <a 
                href="#contact" 
                className="inline-flex items-center gap-2 text-white hover:text-blue-400 transition-colors group text-sm font-medium"
              >
                Get started 
                <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </motion.div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {featureCards.map((card, index) => {
              const colors = accentColors[card.accent as keyof typeof accentColors]
              return (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                  className="group relative bg-zinc-900/50 border border-zinc-800/80 hover:border-zinc-700/80 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col premium-card"
                  style={{
                    borderRadius: "20px",
                    minHeight: "380px",
                  }}
                >
                  {/* Hover glow effect */}
                  <div 
                    className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                    style={{
                      background: `radial-gradient(circle at 50% 0%, ${colors.glow} 0%, transparent 60%)`,
                    }}
                  />
                  
                  {/* Top accent line */}
                  <div 
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-1/3 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                    style={{
                      background: `linear-gradient(90deg, transparent, ${colors.glow.replace('0.15', '0.5')}, transparent)`,
                    }}
                  />

                  {/* Icon area */}
                  <div className="flex-1 flex items-center justify-center p-8 relative">
                    <div 
                      className={`w-20 h-20 rounded-2xl ${colors.bg} border ${colors.border} flex items-center justify-center transition-transform duration-500 group-hover:scale-110`}
                    >
                      <card.icon className={`w-9 h-9 ${colors.text}`} />
                    </div>
                  </div>
                  
                  {/* Content */}
                  <div className="p-6 pt-0 relative">
                    <h3 className="text-white font-medium text-lg leading-tight mb-3 group-hover:text-white transition-colors">
                      {card.title}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed group-hover:text-zinc-400 transition-colors">
                      {card.description}
                    </p>
                  </div>

                  {/* Arrow button */}
                  <div className="absolute top-4 right-4">
                    <div className="w-9 h-9 rounded-full border border-zinc-800 flex items-center justify-center text-zinc-600 group-hover:border-zinc-600 group-hover:text-zinc-400 group-hover:bg-zinc-800/50 transition-all duration-300">
                      <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-300" />
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>

          {/* Bottom quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16 pt-12 border-t border-zinc-800/50"
          >
            <p className="text-zinc-500 text-lg italic max-w-2xl">
              {'"'}A website should not be the weakest part of your business.{'"'}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
