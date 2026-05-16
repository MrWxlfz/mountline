"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowUpRight, Layers } from "lucide-react"

const conceptBuilds = [
  {
    title: "Auto Detailing Website",
    category: "Concept build",
    description: "Service packages, gallery, online booking, and quote request form.",
    includes: ["5 pages", "Booking", "Gallery", "Quote form"],
    gradient: "from-sky-500/20 via-blue-500/10 to-indigo-500/20",
    accent: "bg-sky-500"
  },
  {
    title: "Contractor Services Site",
    category: "Concept build",
    description: "Service areas, project portfolio, testimonials, and contact system.",
    includes: ["6 pages", "Portfolio", "Service areas", "Lead form"],
    gradient: "from-amber-500/20 via-orange-500/10 to-red-500/20",
    accent: "bg-amber-500"
  },
  {
    title: "Local Gym Landing Page",
    category: "Concept build",
    description: "Membership tiers, class schedule, trainer profiles, and trial signup.",
    includes: ["Single page", "Pricing", "Schedule", "Trial signup"],
    gradient: "from-emerald-500/20 via-teal-500/10 to-cyan-500/20",
    accent: "bg-emerald-500"
  },
  {
    title: "Restaurant & Food Truck",
    category: "Concept build",
    description: "Menu display, location info, hours, and online ordering links.",
    includes: ["3 pages", "Menu", "Location", "Order links"],
    gradient: "from-rose-500/20 via-pink-500/10 to-fuchsia-500/20",
    accent: "bg-rose-500"
  },
]

export function WorkSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="work" ref={ref} className="py-24 sm:py-32 section-alt">
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
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6"
          >
            <Layers className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Sample work</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Examples of what we build.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Sample builds that show the type of sites northline creates. These are concept examples that demonstrate our design approach.
          </p>
        </motion.div>

        {/* Work grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {conceptBuilds.map((build, index) => (
            <motion.div
              key={build.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="group card-premium overflow-hidden"
            >
              {/* Preview area */}
              <div className={`aspect-[16/10] bg-gradient-to-br ${build.gradient} p-6 sm:p-8 relative overflow-hidden`}>
                {/* Mock browser chrome */}
                <div className="flex items-center gap-2 mb-6">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
                    <div className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
                  </div>
                  <div className="flex-1 max-w-[200px]">
                    <div className="h-5 rounded bg-background/50 backdrop-blur-sm" />
                  </div>
                </div>
                
                {/* Mock website content */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded ${build.accent}`} />
                    <div className="w-24 h-3 rounded bg-foreground/60" />
                  </div>
                  <div className="w-3/4 h-5 rounded bg-foreground/70" />
                  <div className="w-full h-3 rounded bg-foreground/40" />
                  <div className="w-2/3 h-3 rounded bg-foreground/40" />
                  <div className="flex gap-2 pt-2">
                    <div className={`w-20 h-8 rounded-lg ${build.accent}`} />
                    <div className="w-16 h-8 rounded-lg bg-background/50 backdrop-blur-sm border border-foreground/10" />
                  </div>
                </div>
                
                {/* Hover overlay with view button */}
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/5 transition-colors duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="bg-background/90 backdrop-blur-sm rounded-full px-4 py-2 flex items-center gap-2 text-sm font-medium text-foreground shadow-lg">
                    View concept
                    <ArrowUpRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
              
              {/* Content */}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`w-2 h-2 rounded-full ${build.accent}`} />
                  <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                    {build.category}
                  </span>
                </div>
                
                <h3 className="text-xl font-semibold text-foreground mb-2">
                  {build.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                  {build.description}
                </p>
                
                {/* Includes */}
                <div className="flex flex-wrap gap-2">
                  {build.includes.map((item) => (
                    <span key={item} className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full border border-border">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
