"use client"

import { motion } from "framer-motion"

interface MetricItem {
  value: string
  label: string
}

const metrics: MetricItem[] = [
  { value: "7–14 days", label: "Typical starter launch" },
  { value: "$500+", label: "Starter websites" },
  { value: "$149/mo", label: "Monthly care" },
  { value: "Client portals", label: "Available for projects" },
  { value: "Mobile-first", label: "Built by default" },
]

export function MetricsStrip() {
  return (
    <section className="relative border-y border-border bg-background overflow-hidden">
      <div className="flex">
        <div className="flex lg:grid lg:grid-cols-5 w-full">
          {metrics.map((metric, index) => (
            <motion.div
              key={metric.value}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className={`flex-shrink-0 px-6 lg:px-8 py-8 lg:py-10 text-center ${
                index !== metrics.length - 1 ? "lg:border-r lg:border-border" : ""
              }`}
            >
              <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground tracking-tight mb-1 text-balance">
                {metric.value}
              </div>
              <div className="text-sm text-muted-foreground leading-relaxed">
                {metric.label}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-background to-transparent pointer-events-none lg:hidden" />
      <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-background to-transparent pointer-events-none lg:hidden" />
    </section>
  )
}

export function MetricsStripScrolling() {
  const scrollingMetrics = [...metrics, ...metrics]

  return (
    <section className="relative border-y border-border bg-background overflow-hidden py-6">
      <motion.div
        className="flex gap-12 whitespace-nowrap"
        animate={{ x: [0, "-50%"] }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        {scrollingMetrics.map((metric, index) => (
          <div key={`${metric.value}-${index}`} className="flex items-center gap-3 px-4">
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
