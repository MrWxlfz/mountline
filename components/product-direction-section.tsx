"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Search, FileText, Code, Rocket, RefreshCw } from "lucide-react"

const processSteps = [
  {
    number: "1",
    title: "Review",
    description: "We look at the current site, business goals, and what customers need to do.",
    icon: Search
  },
  {
    number: "2", 
    title: "Plan",
    description: "We define the pages, content, timeline, and features before the build starts.",
    icon: FileText
  },
  {
    number: "3",
    title: "Build",
    description: "We design and build the website with mobile layout, speed, forms, and basic SEO in mind.",
    icon: Code
  },
  {
    number: "4",
    title: "Launch",
    description: "We connect the domain, test the site, and make sure everything is ready to use.",
    icon: Rocket
  },
  {
    number: "5",
    title: "Support",
    description: "If needed, Northline keeps the site updated with monthly care.",
    icon: RefreshCw
  }
]

export function ProductDirectionSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="process" ref={ref} className="py-20 sm:py-24 bg-stone-50">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
            A clear process from review to launch.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            No vague timelines or surprise scope changes. We define everything upfront so you know exactly what to expect.
          </p>
        </motion.div>

        {/* Process steps */}
        <div className="relative">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-14 left-0 right-0 h-px bg-slate-200" style={{ left: '10%', right: '10%' }} />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative"
              >
                {/* Step number circle */}
                <div className="relative z-10 w-12 h-12 rounded-full bg-white border-2 border-slate-200 flex items-center justify-center mb-5 mx-auto lg:mx-0">
                  <span className="text-lg font-semibold text-slate-900">{step.number}</span>
                </div>
                
                {/* Content */}
                <div className="text-center lg:text-left">
                  <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                    <step.icon className="w-4 h-4 text-slate-400" />
                    <h3 className="text-lg font-semibold text-slate-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom reassurance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-16 pt-12 border-t border-slate-200"
        >
          <div className="bg-white rounded-xl border border-slate-200 p-6 sm:p-8 max-w-3xl">
            <h3 className="text-lg font-semibold text-slate-900 mb-3">
              What this means for you
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2" />
                <span className="text-slate-600">Clear timeline before work starts</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2" />
                <span className="text-slate-600">No surprise scope changes or hidden costs</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2" />
                <span className="text-slate-600">Regular updates so you always know where things stand</span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-400 mt-2" />
                <span className="text-slate-600">A finished site you can actually use and update</span>
              </li>
            </ul>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
