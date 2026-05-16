"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Clock, Layout, Smartphone, Phone, AlertCircle } from "lucide-react"

export function ProblemSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const problems = [
    {
      icon: Clock,
      title: "Outdated first impression",
      description: "Old design that makes customers question if you are still in business.",
      color: "text-rose-500",
      bg: "bg-rose-500/10"
    },
    {
      icon: Layout,
      title: "Confusing service pages",
      description: "Visitors cannot figure out what you do or where you serve.",
      color: "text-amber-500",
      bg: "bg-amber-500/10"
    },
    {
      icon: Smartphone,
      title: "Weak mobile experience", 
      description: "Broken layouts and tiny text that frustrate phone users.",
      color: "text-violet-500",
      bg: "bg-violet-500/10"
    },
    {
      icon: Phone,
      title: "No clear way to contact",
      description: "Missing or buried forms that cost you calls and quote requests.",
      color: "text-blue-500",
      bg: "bg-blue-500/10"
    }
  ]

  return (
    <section ref={ref} className="py-24 sm:py-32 section-alt">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rose-500/10 border border-rose-500/20 mb-6"
          >
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="text-sm font-medium text-rose-600 dark:text-rose-400">The problem</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight text-balance mb-6">
            Your website should not be the reason customers hesitate.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed text-pretty">
            A lot of good businesses lose trust online because their site is outdated, confusing, slow, or hard to contact from. northline fixes that.
          </p>
        </motion.div>

        {/* Problem cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="group card-premium p-6 hover:scale-[1.02]"
            >
              <div className={`w-12 h-12 rounded-xl ${problem.bg} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300`}>
                <problem.icon className={`w-6 h-6 ${problem.color}`} />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                {problem.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
