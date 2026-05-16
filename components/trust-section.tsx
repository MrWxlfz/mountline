"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

const trustPoints = [
  "Clear scope before build",
  "Honest pricing",
  "No fake client claims",
  "Mobile-first delivery",
  "Built for future updates",
  "Straightforward communication",
  "Small team, focused work",
]

export function TrustSection() {
  return (
    <section className="relative py-40 px-6" style={{ backgroundColor: "#09090B" }}>
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)",
        }}
      />

      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
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
            <p className="text-zinc-400 leading-relaxed">
              Northline is a small team that builds websites for businesses that need to look professional online. We focus on clarity, speed, and honest communication.
            </p>
          </motion.div>

          {/* Right - trust points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="space-y-4"
          >
            {trustPoints.map((point, index) => (
              <div
                key={point}
                className="flex items-center gap-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-zinc-300">{point}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  )
}
