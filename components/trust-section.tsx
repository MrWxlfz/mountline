"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Check, Shield, Clock, MessageSquare, User, Award } from "lucide-react"

const trustPoints = [
  "Clear scope before build starts",
  "Honest, upfront pricing",
  "No fake client claims or inflated portfolios",
  "Mobile-first delivery",
  "Built for future updates, not locked-in code",
  "Straightforward communication",
  "Small team, focused work"
]

const highlights = [
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "Revisions until you are satisfied with the final result.",
    color: "from-emerald-500 to-teal-500"
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "Most sites launch within 2-3 weeks of project start.",
    color: "from-blue-500 to-cyan-500"
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Work directly with the person building your site.",
    color: "from-violet-500 to-purple-500"
  },
  {
    icon: User,
    title: "Small Team Attention",
    description: "Not a faceless agency. Real people, real accountability.",
    color: "from-amber-500 to-orange-500"
  }
]

const stats = [
  { value: "2-3", label: "Week avg", suffix: "" },
  { value: "100", label: "Satisfaction", suffix: "%" },
  { value: "Direct", label: "Contact", suffix: "" },
]

export function TrustSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 sm:py-32 section-default">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 border border-emerald-500/20 mb-6"
          >
            <Award className="w-4 h-4 text-emerald-500" />
            <span className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Why northline</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Why businesses choose northline.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            A small team that builds websites for businesses that need to look professional online. No fake agency act. Just clean work and honest communication.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Left - Highlight cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className="group card-premium p-5"
              >
                <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <item.icon className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </motion.div>
            ))}
          </div>

          {/* Right - Trust points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="space-y-6"
          >
            <div className="card-premium p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-foreground mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                Our Promise
              </h3>
              <div className="space-y-2.5">
                {trustPoints.map((point, index) => (
                  <motion.div
                    key={point}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.4 + index * 0.05 }}
                    className="flex items-center gap-3 py-2.5 px-4 bg-secondary/50 rounded-lg"
                  >
                    <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-emerald-500" />
                    </div>
                    <span className="text-sm text-muted-foreground">{point}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="card-premium p-6"
            >
              <div className="grid grid-cols-3 gap-4">
                {stats.map((stat, index) => (
                  <div key={stat.label} className={`text-center ${index > 0 ? "border-l border-border" : ""}`}>
                    <div className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
                      {stat.value}<span className="text-accent">{stat.suffix}</span>
                    </div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
