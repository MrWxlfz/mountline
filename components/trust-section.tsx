"use client"

import { motion } from "framer-motion"
import { Check } from "lucide-react"

const trustPoints = [
  "Clear scope before work starts",
  "Mobile-first builds",
  "Honest timelines",
  "Practical systems",
  "Strong visual taste",
  "Built for future updates",
]

export function TrustSection() {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          {/* Left - Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-medium text-muted-foreground tracking-wide uppercase mb-4"
            >
              Why northline
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] mb-6"
            >
              Small team.{" "}
              <span className="text-muted-foreground/50">Serious standards.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-lg"
            >
              northline is built for businesses that want sharp work, clear scope, and practical systems without the slow, confusing agency process.
            </motion.p>
          </div>
          
          {/* Right - Trust points */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trustPoints.map((point, index) => (
              <motion.div
                key={point}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card"
              >
                <div className="w-6 h-6 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4 text-foreground" />
                </div>
                <span className="text-foreground font-medium">{point}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
