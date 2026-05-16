"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Check, Shield, Clock, MessageSquare, User } from "lucide-react"

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
    description: "Revisions until you are satisfied with the final result."
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "Most sites launch within 2-3 weeks of project start."
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Work directly with the person building your site."
  },
  {
    icon: User,
    title: "Small Team Attention",
    description: "Not a faceless agency. Real people, real accountability."
  }
]

export function TrustSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 sm:py-24 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
              Why businesses choose Northline.
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed mb-8">
              Northline is a small team that builds websites for businesses that need to look professional online. No fake agency act. Just clean work and honest communication.
            </p>

            {/* Highlight cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {highlights.map((item, index) => (
                <motion.div
                  key={item.title}
                  initial={{ opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl border border-slate-200 p-5"
                >
                  <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center mb-4">
                    <item.icon className="w-5 h-5 text-slate-700" />
                  </div>
                  <h3 className="text-base font-semibold text-slate-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-slate-600">{item.description}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right - trust points */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                Our Promise
              </h3>
              <div className="space-y-3">
                {trustPoints.map((point, index) => (
                  <motion.div
                    key={point}
                    initial={{ opacity: 0, x: -10 }}
                    animate={isInView ? { opacity: 1, x: 0 } : {}}
                    transition={{ duration: 0.4, delay: 0.3 + index * 0.05 }}
                    className="flex items-center gap-3 py-3 px-4 bg-stone-50 rounded-lg"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-slate-700 text-sm">{point}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="grid grid-cols-3 gap-4 mt-6 bg-white rounded-xl border border-slate-200 p-6"
            >
              <div className="text-center">
                <div className="text-2xl font-semibold text-slate-900 mb-1">2-3</div>
                <div className="text-xs text-slate-500">Week avg</div>
              </div>
              <div className="text-center border-l border-slate-200">
                <div className="text-2xl font-semibold text-slate-900 mb-1">100%</div>
                <div className="text-xs text-slate-500">Satisfaction</div>
              </div>
              <div className="text-center border-l border-slate-200">
                <div className="text-2xl font-semibold text-slate-900 mb-1">Direct</div>
                <div className="text-xs text-slate-500">Contact</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
