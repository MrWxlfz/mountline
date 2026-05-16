"use client"

import { motion } from "framer-motion"
import { ChevronRight, Plus, Globe, Zap, Settings } from "lucide-react"

const featureCards = [
  {
    title: "Websites that feel current",
    description: "Clean, responsive sites designed to make your business look credible from the first click.",
    icon: Globe,
  },
  {
    title: "Landing pages that convert",
    description: "Focused pages for offers, services, launches, and campaigns without bloated agency timelines.",
    icon: Zap,
  },
  {
    title: "Simple systems behind the scenes",
    description: "Forms, booking tools, payments, analytics, and automations connected in a way that actually makes sense.",
    icon: Settings,
  },
]

export function FeatureCardsSection() {
  return (
    <div id="services" className="relative z-20 py-40" style={{ backgroundColor: "#09090B" }}>
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)",
        }}
      />
      <div className="w-full flex justify-center px-6">
        <div className="w-full max-w-5xl">
          {/* Header row */}
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8 mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] text-white max-w-lg"
              style={{
                letterSpacing: "-0.0325em",
                fontVariationSettings: '"opsz" 28',
                fontWeight: 538,
                lineHeight: 1.1,
              }}
            >
              Made for businesses that need more than a basic template.
            </motion.h2>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="max-w-md"
            >
              <p className="text-zinc-400 leading-relaxed">
                A website should do more than exist. It should explain what you do, build trust fast, and make it easy for customers to take the next step.{" "}
                <a href="#contact" className="text-white inline-flex items-center gap-1 hover:underline">
                  Get started <ChevronRight className="w-4 h-4" />
                </a>
              </p>
            </motion.div>
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {featureCards.map((card, index) => (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
                className="bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer group overflow-hidden relative flex flex-col"
                style={{
                  borderRadius: "24px",
                  minHeight: "360px",
                  isolation: "isolate",
                }}
              >
                {/* Icon area */}
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="w-20 h-20 rounded-2xl bg-zinc-800/50 border border-zinc-700/50 flex items-center justify-center">
                    <card.icon className="w-10 h-10 text-zinc-400" />
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-6 pt-0">
                  <h3 className="text-white font-medium text-lg leading-tight mb-2">{card.title}</h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">{card.description}</p>
                </div>

                {/* Plus button */}
                <div className="absolute top-4 right-4">
                  <div className="w-8 h-8 rounded-full border border-zinc-700 flex items-center justify-center text-zinc-500 group-hover:border-zinc-500 group-hover:text-zinc-300 transition-colors flex-shrink-0">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
