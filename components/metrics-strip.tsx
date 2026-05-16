"use client"

import { motion } from "framer-motion"

interface MetricItem {
  value: string
  label: string
}

export function MetricsStrip() {
  const metrics: MetricItem[] = [
    { value: "7–14 days", label: "typical starter launch" },
    { value: "$500+", label: "starter websites" },
    { value: "$149/mo", label: "monthly care" },
    { value: "0", label: "bloated agency process" },
    { value: "100%", label: "mobile-first builds" },
  ]

  return (
    <section className="relative border-y border-border bg-background overflow-hidden">
      <div className="flex">
        {/* Scrolling container for mobile, static for desktop */}
        <div className="flex lg:grid lg:grid-cols-5 w-full">
          {metrics.map((metric, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex-shrink-0 px-6 lg:px-8 py-8 lg:py-10 text-center ${
                index !== metrics.length - 1 ? "lg:border-r lg:border-border" : ""
              }`}
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-1">
                {metric.value}
              </div>
              <div className="text-sm text-muted-foreground">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
      
      {/* Scroll fade indicators on mobile */}
      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none lg:hidden" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none lg:hidden" />
    </section>
  )
}

// Alternative horizontal scrolling version
export function MetricsStripScrolling() {
  const metrics = [
    { value: "7–14 days", label: "typical starter" },
    { value: "$500+", label: "starter sites" },
    { value: "$149/mo", label: "monthly care" },
    { value: "0", label: "agency bloat" },
    { value: "100%", label: "mobile-first" },
    // Duplicate for seamless loop
    { value: "7–14 days", label: "typical starter" },
    { value: "$500+", label: "starter sites" },
    { value: "$149/mo", label: "monthly care" },
    { value: "0", label: "agency bloat" },
    { value: "100%", label: "mobile-first" },
  ]

  return (
    <section className="relative border-y border-border bg-background overflow-hidden py-6">
      <motion.div 
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: [0, "-50%"] }}
        transition={{ 
          duration: 30, 
          repeat: Infinity, 
          ease: "linear" 
        }}
      >
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center gap-3 px-4">
            <span className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {metric.value}
            </span>
            <span className="text-sm text-muted-foreground">
              {metric.label}
            </span>
          </div>
        ))}
      </motion.div>
    </section>
  )
}
