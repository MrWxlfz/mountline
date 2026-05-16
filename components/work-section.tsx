"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"

const conceptBuilds = [
  {
    title: "Auto Detailing Website",
    category: "Concept example",
    description: "Service packages, gallery, online booking, and quote request form.",
    includes: ["5 pages", "Booking integration", "Service gallery", "Quote form"],
    image: "from-blue-100 to-slate-100"
  },
  {
    title: "Contractor Services Site",
    category: "Concept example",
    description: "Service areas, project portfolio, testimonials, and contact system.",
    includes: ["6 pages", "Project gallery", "Service areas", "Lead form"],
    image: "from-amber-100 to-orange-50"
  },
  {
    title: "Local Gym Landing Page",
    category: "Concept example",
    description: "Membership tiers, class schedule, trainer profiles, and trial signup.",
    includes: ["Single page", "Pricing table", "Schedule display", "Trial signup"],
    image: "from-emerald-100 to-teal-50"
  },
  {
    title: "Restaurant / Food Truck",
    category: "Concept example",
    description: "Menu display, location info, hours, and online ordering links.",
    includes: ["3 pages", "Menu sections", "Location map", "Order links"],
    image: "from-rose-100 to-pink-50"
  },
]

export function WorkSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="work" ref={ref} className="py-20 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
            Examples of what we build.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Sample builds that show the type of sites Northline creates for local businesses. These are concept examples, not client work.
          </p>
        </motion.div>

        {/* Work grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {conceptBuilds.map((build, index) => (
            <motion.div
              key={build.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group bg-stone-50 rounded-xl border border-stone-100 overflow-hidden hover:shadow-lg hover:shadow-slate-900/5 transition-all duration-300"
            >
              {/* Preview area */}
              <div className={`aspect-[16/10] bg-gradient-to-br ${build.image} p-6 flex flex-col justify-between relative`}>
                {/* Mock browser chrome */}
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                  <div className="w-2 h-2 rounded-full bg-slate-300" />
                </div>
                
                {/* Mock content */}
                <div className="space-y-2">
                  <div className="w-1/2 h-4 rounded bg-slate-800/80" />
                  <div className="w-3/4 h-3 rounded bg-slate-600/60" />
                  <div className="w-1/3 h-6 rounded bg-blue-600 mt-3" />
                </div>
                
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-slate-900/0 group-hover:bg-slate-900/5 transition-colors duration-300" />
              </div>
              
              {/* Content */}
              <div className="p-6">
                <span className="text-xs text-slate-500 uppercase tracking-wider mb-2 block">
                  {build.category}
                </span>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">
                  {build.title}
                </h3>
                <p className="text-slate-600 text-sm leading-relaxed mb-4">
                  {build.description}
                </p>
                
                {/* Includes */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {build.includes.map((item) => (
                    <span key={item} className="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      {item}
                    </span>
                  ))}
                </div>
                
                <button className="flex items-center gap-2 text-sm font-medium text-slate-700 group-hover:text-blue-600 transition-colors">
                  View sample
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
