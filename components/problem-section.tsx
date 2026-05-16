"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Clock, Layout, Smartphone, Phone } from "lucide-react"

export function ProblemSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const problems = [
    {
      icon: Clock,
      title: "Outdated first impression",
      description: "Old design that makes customers question if you are still in business."
    },
    {
      icon: Layout,
      title: "Confusing service pages",
      description: "Visitors cannot figure out what you do or where you serve."
    },
    {
      icon: Smartphone,
      title: "Weak mobile experience", 
      description: "Broken layouts and tiny text that frustrate phone users."
    },
    {
      icon: Phone,
      title: "No clear way to contact",
      description: "Missing or buried forms that cost you calls and quote requests."
    }
  ]

  return (
    <section ref={ref} className="py-20 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-3xl mx-auto text-center mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight text-balance mb-6">
            Your website should not be the reason customers hesitate.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed text-pretty">
            A lot of good businesses lose trust online because their site is outdated, confusing, slow, or hard to contact from. Northline fixes that with clear design, simple structure, and practical tools that help people take the next step.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 bg-stone-50 rounded-xl border border-stone-100"
            >
              <div className="w-10 h-10 rounded-lg bg-slate-900 flex items-center justify-center mb-4">
                <problem.icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                {problem.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {problem.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
