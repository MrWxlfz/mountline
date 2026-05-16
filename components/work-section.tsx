"use client"

import { motion } from "framer-motion"
import { ArrowRight, Car, Dumbbell, Hammer, UtensilsCrossed, ExternalLink } from "lucide-react"

const conceptBuilds = [
  {
    title: "Auto Detailing Site",
    category: "Concept demo",
    icon: Car,
    description: "Clean service page with booking flow and gallery",
    gradient: "from-blue-500/10 to-cyan-500/10",
    iconColor: "text-blue-400",
  },
  {
    title: "Local Gym Landing Page",
    category: "Concept demo",
    icon: Dumbbell,
    description: "Membership tiers, schedule, and contact form",
    gradient: "from-orange-500/10 to-amber-500/10",
    iconColor: "text-orange-400",
  },
  {
    title: "Contractor Services Site",
    category: "Concept demo",
    icon: Hammer,
    description: "Service areas, portfolio, and quote request",
    gradient: "from-emerald-500/10 to-teal-500/10",
    iconColor: "text-emerald-400",
  },
  {
    title: "Restaurant / Food Truck Page",
    category: "Concept demo",
    icon: UtensilsCrossed,
    description: "Menu display, hours, and location info",
    gradient: "from-rose-500/10 to-pink-500/10",
    iconColor: "text-rose-400",
  },
]

export function WorkSection() {
  return (
    <section id="work" className="relative py-32 md:py-40 px-6 overflow-hidden" style={{ backgroundColor: "#09090B" }}>
      {/* Subtle gradient overlay */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "25%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto relative">
        {/* Header */}
        <div className="mb-16 md:mb-20">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-sm font-medium tracking-widest text-northline-accent uppercase mb-4"
          >
            Our Work
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
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

        {/* Concept cards - enhanced grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {conceptBuilds.map((build, index) => (
            <motion.div
              key={build.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 + index * 0.08 }}
              className="group relative bg-zinc-900/50 border border-zinc-800 hover:border-zinc-700 rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer"
            >
              {/* Icon area with gradient */}
              <div className={`aspect-[4/3] bg-gradient-to-br ${build.gradient} flex items-center justify-center border-b border-zinc-800/50 relative overflow-hidden`}>
                {/* Decorative grid pattern */}
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)`,
                  backgroundSize: '20px 20px'
                }} />
                <build.icon className={`w-14 h-14 ${build.iconColor} group-hover:scale-110 transition-transform duration-300`} />
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-zinc-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                  <span className="flex items-center gap-1.5 text-xs text-white/80">
                    <ExternalLink className="w-3.5 h-3.5" />
                    View concept
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-5">
                <span className="text-xs text-zinc-500 mb-2 block uppercase tracking-wider">{build.category}</span>
                <h3 className="text-white font-medium mb-2 group-hover:text-northline-accent-light transition-colors">{build.title}</h3>
                <p className="text-zinc-500 text-sm leading-relaxed">{build.description}</p>
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
          className="text-center mt-14"
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 px-6 py-3 bg-zinc-800/80 text-zinc-300 rounded-xl border border-zinc-700 hover:bg-zinc-700/80 hover:border-zinc-600 transition-all duration-200 text-sm font-medium"
          >
            Discuss your project
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
