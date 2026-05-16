"use client"

import { motion } from "framer-motion"

const capabilityTags = [
  "Websites",
  "Landing Pages",
  "SEO Basics",
  "Automations",
  "Booking Flows",
  "Payments",
  "Analytics",
  "Monthly Care",
]

export function LogoCloud() {
  return (
    <div className="relative z-20 pb-24 pt-8" style={{ backgroundColor: "#09090B" }}>
      <div className="w-full flex justify-center px-6">
        <div className="w-full max-w-4xl text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-lg text-zinc-300 mb-2"
          >
            Built for local businesses, startups, creators, and small teams.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-12"
          >
            {/* Capability tags grid */}
            <div className="flex flex-wrap justify-center gap-3">
              {capabilityTags.map((tag, i) => (
                <div
                  key={tag}
                  className="px-4 py-2 bg-zinc-900/50 border border-zinc-800 rounded-full text-sm text-zinc-400 hover:text-zinc-200 hover:border-zinc-700 transition-colors cursor-default"
                >
                  {tag}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
