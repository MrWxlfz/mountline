"use client"

import { motion } from "framer-motion"
import { Check, Shield, Zap, MessageSquare } from "lucide-react"

const trustPoints = [
  { text: "Clear scope before build", icon: Check },
  { text: "Honest pricing", icon: Check },
  { text: "No fake client claims", icon: Check },
  { text: "Mobile-first delivery", icon: Check },
  { text: "Built for future updates", icon: Check },
  { text: "Straightforward communication", icon: Check },
  { text: "Small team, focused work", icon: Check },
]

const highlights = [
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "We stand behind every project with revisions until you are satisfied.",
  },
  {
    icon: Zap,
    title: "Fast Turnaround",
    description: "Most sites launch within 2-3 weeks of starting the project.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Work directly with the person building your site, no middlemen.",
  },
]

export function TrustSection() {
  return (
    <section className="relative py-32 md:py-40 px-6 overflow-hidden" style={{ backgroundColor: "#09090B" }}>
      {/* Subtle gradient overlay */}
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "25%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.02) 0%, transparent 100%)",
        }}
      />

      <div className="max-w-5xl mx-auto relative">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-20 items-start">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-sm font-medium tracking-widest text-northline-accent uppercase mb-4">
              Why Northline
            </p>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl text-white mb-6"
              style={{
                letterSpacing: "-0.0325em",
                fontVariationSettings: '"opsz" 28',
                fontWeight: 538,
                lineHeight: 1.1,
              }}
            >
              No fake agency act.
              <br />
              <span className="text-zinc-500">Just clean work.</span>
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-10">
              Northline is a small team that builds websites for businesses that need to look professional online. We focus on clarity, speed, and honest communication.
            </p>

            {/* Highlight cards */}
            <div className="space-y-4">
              {highlights.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                  className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800"
                >
                  <div className="w-10 h-10 rounded-lg bg-northline-accent/10 flex items-center justify-center shrink-0">
                    <item.icon className="w-5 h-5 text-northline-accent" />
                  </div>
                  <div>
                    <h3 className="text-white font-medium mb-1">{item.title}</h3>
                    <p className="text-zinc-500 text-sm">{item.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - trust points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-3"
          >
            <div className="p-6 rounded-2xl bg-gradient-to-br from-zinc-900/80 to-zinc-900/40 border border-zinc-800">
              <h3 className="text-white font-medium mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                Our Promise
              </h3>
              <div className="space-y-3">
                {trustPoints.map((point, index) => (
                  <motion.div
                    key={point.text}
                    initial={{ opacity: 0, x: -10 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                    className="flex items-center gap-3 p-3 bg-zinc-800/30 rounded-lg border border-zinc-800/50"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-500/15 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    </div>
                    <span className="text-zinc-300 text-sm">{point.text}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats callout */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="grid grid-cols-3 gap-4 p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800"
            >
              <div className="text-center">
                <div className="text-2xl font-semibold text-white mb-1">50+</div>
                <div className="text-xs text-zinc-500">Sites Built</div>
              </div>
              <div className="text-center border-l border-zinc-800">
                <div className="text-2xl font-semibold text-white mb-1">2wk</div>
                <div className="text-xs text-zinc-500">Avg Delivery</div>
              </div>
              <div className="text-center border-l border-zinc-800">
                <div className="text-2xl font-semibold text-white mb-1">100%</div>
                <div className="text-xs text-zinc-500">Satisfaction</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
