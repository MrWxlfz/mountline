"use client"

import { motion } from "framer-motion"
import { ArrowRight, Car, Dumbbell, Hammer, UtensilsCrossed } from "lucide-react"

const conceptBuilds = [
  {
    title: "Auto Detailing Site",
    category: "Concept demo",
    icon: Car,
    description: "Clean service page with booking flow and gallery",
  },
  {
    title: "Local Gym Landing Page",
    category: "Concept demo",
    icon: Dumbbell,
    description: "Membership tiers, schedule, and contact form",
  },
  {
    title: "Contractor Services Site",
    category: "Concept demo",
    icon: Hammer,
    description: "Service areas, portfolio, and quote request",
  },
  {
    title: "Restaurant / Food Truck Page",
    category: "Concept demo",
    icon: UtensilsCrossed,
    description: "Menu display, hours, and location info",
  },
]

export function WorkSection() {
  return (
    <section id="work" className="relative py-40 px-6" style={{ backgroundColor: "#09090B" }}>
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] text-white mb-6"
            style={{
              letterSpacing: "-0.0325em",
              fontVariationSettings: '"opsz" 28',
              fontWeight: 538,
              lineHeight: 1.1,
            }}
          >
            Concept builds for the kind of work we do.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-zinc-400 text-lg max-w-lg"
          >
            Sample directions that show the type of sites we build for local businesses.
          </motion.p>
        </div>

        {/* Concept cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {conceptBuilds.map((build, index) => (
            <motion.div
              key={build.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 + index * 0.1 }}
              className="group bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-xl overflow-hidden transition-colors cursor-pointer"
            >
              {/* Icon area */}
              <div className="aspect-[4/3] bg-zinc-800/30 flex items-center justify-center border-b border-zinc-800">
                <build.icon className="w-12 h-12 text-zinc-600 group-hover:text-zinc-500 transition-colors" />
              </div>

              {/* Content */}
              <div className="p-5">
                <span className="text-xs text-zinc-500 mb-2 block">{build.category}</span>
                <h3 className="text-white font-medium mb-2">{build.title}</h3>
                <p className="text-zinc-500 text-sm mb-4">{build.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="text-center mt-12"
        >
          <a
            href="#contact"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors text-sm"
          >
            Request a mockup
            <ArrowRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
