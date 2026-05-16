"use client"

import { motion, useInView } from "framer-motion"
import { useRef, useState } from "react"
import { ArrowUpRight, Monitor, Smartphone, Layers } from "lucide-react"

const conceptBuilds = [
  {
    title: "Premium Auto Detailing",
    category: "Full Website",
    description: "Service packages, gallery, online booking, and quote request form for a mobile detailing business.",
    includes: ["5 pages", "Booking system", "Gallery", "Quote form"],
    colors: {
      primary: "#0a0a0a",
      accent: "#3b82f6",
      background: "#fafafa"
    }
  },
  {
    title: "Elite Contracting",
    category: "Full Website",
    description: "Service areas, project portfolio, testimonials, and lead capture for a residential contractor.",
    includes: ["6 pages", "Portfolio", "Service areas", "Lead form"],
    colors: {
      primary: "#1a1a1a",
      accent: "#f59e0b",
      background: "#f5f5f4"
    }
  },
  {
    title: "FitLife Gym",
    category: "Landing Page",
    description: "Membership tiers, class schedule, trainer profiles, and trial signup for a local fitness center.",
    includes: ["Single page", "Pricing table", "Schedule", "Trial signup"],
    colors: {
      primary: "#0f172a",
      accent: "#10b981",
      background: "#f8fafc"
    }
  },
  {
    title: "Taco Truck Co.",
    category: "Mini Site",
    description: "Menu display, location schedule, hours, and online ordering links for a food truck business.",
    includes: ["3 pages", "Menu", "Location", "Order links"],
    colors: {
      primary: "#18181b",
      accent: "#ef4444",
      background: "#fef2f2"
    }
  },
]

export function WorkSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

  return (
    <section id="work" ref={ref} className="py-24 sm:py-32 bg-muted/30 relative overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="w-full h-full">
          <defs>
            <pattern id="work-grid" width="80" height="80" patternUnits="userSpaceOnUse">
              <path d="M 80 0 L 0 0 0 80" fill="none" className="stroke-foreground" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#work-grid)" />
        </svg>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <Layers className="w-5 h-5 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              Sample Work
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Examples of what we build.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            Concept builds that show our design approach. Each tailored to a different industry and goal.
          </p>
        </motion.div>

        {/* Work grid - 2x2 bento style */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {conceptBuilds.map((build, index) => (
            <motion.div
              key={build.title}
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
              className="group relative"
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
            >
              <div className="rounded-2xl border border-border bg-card overflow-hidden hover:border-border-strong hover:shadow-xl transition-all duration-500">
                {/* Preview area */}
                <div 
                  className="aspect-[16/10] relative overflow-hidden"
                  style={{ backgroundColor: build.colors.background }}
                >
                  {/* Mock browser elements */}
                  <div className="absolute top-4 left-4 right-4">
                    <div className="flex items-center gap-2 p-2 rounded-lg bg-white/90 backdrop-blur-sm border border-black/5 shadow-sm">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 rounded-full bg-red-400" />
                        <div className="w-2 h-2 rounded-full bg-yellow-400" />
                        <div className="w-2 h-2 rounded-full bg-green-400" />
                      </div>
                      <div className="flex-1 h-4 rounded bg-gray-100 max-w-[180px] mx-auto" />
                    </div>
                  </div>
                  
                  {/* Mock website content */}
                  <div className="absolute inset-x-4 bottom-4 top-16 flex flex-col justify-center items-center gap-3">
                    {/* Logo */}
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: build.colors.primary }}
                    >
                      <span className="text-white text-xs font-bold">
                        {build.title.split(" ").map(w => w[0]).join("").slice(0, 2)}
                      </span>
                    </div>
                    {/* Mock headline */}
                    <div className="w-3/4 h-5 rounded" style={{ backgroundColor: build.colors.primary + "e6" }} />
                    <div className="w-1/2 h-3 rounded bg-gray-300" />
                    {/* Mock CTA */}
                    <div 
                      className="w-24 h-8 rounded-lg mt-2 flex items-center justify-center"
                      style={{ backgroundColor: build.colors.accent }}
                    >
                      <span className="text-white text-[10px] font-medium">Get Quote</span>
                    </div>
                  </div>
                  
                  {/* View overlay on hover */}
                  <motion.div 
                    className="absolute inset-0 bg-foreground/80 flex items-center justify-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: hoveredIndex === index ? 1 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center gap-2 text-background">
                        <Monitor className="w-6 h-6" />
                        <span className="text-xs font-medium">Desktop</span>
                      </div>
                      <div className="w-px h-12 bg-background/20" />
                      <div className="flex flex-col items-center gap-2 text-background">
                        <Smartphone className="w-6 h-6" />
                        <span className="text-xs font-medium">Mobile</span>
                      </div>
                    </div>
                  </motion.div>
                </div>
                
                {/* Content */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: build.colors.accent }}
                      />
                      <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                        {build.category}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    {build.title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-4">
                    {build.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2">
                    {build.includes.map((item) => (
                      <span 
                        key={item} 
                        className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full border border-border"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
