"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { AlertTriangle, Clock, Smartphone, Eye, PhoneOff, TrendingDown } from "lucide-react"

const problems = [
  {
    icon: Clock,
    title: "The site looks outdated",
    description: "Old design, dated fonts, or a template from 2015 that makes customers question if you are still in business.",
    severity: "high"
  },
  {
    icon: Smartphone,
    title: "Mobile feels broken",
    description: "Text too small, buttons that miss, layouts that break. Half your visitors leave before they even scroll.",
    severity: "high"
  },
  {
    icon: Eye,
    title: "Services are unclear",
    description: "Visitors cannot figure out what you actually do, where you serve, or why they should choose you.",
    severity: "medium"
  },
  {
    icon: PhoneOff,
    title: "No clear way to contact",
    description: "Buried contact info, missing forms, no quote request option. Potential customers give up.",
    severity: "high"
  },
  {
    icon: TrendingDown,
    title: "Less credible than the work",
    description: "Your business is professional in person, but your website tells a different story online.",
    severity: "medium"
  }
]

export function ProblemSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-muted/30 relative overflow-hidden">
      {/* Subtle diagonal lines pattern */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full">
          <defs>
            <pattern id="diagonal-lines" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M-10,10 l20,-20 M0,40 l40,-40 M30,50 l20,-20" className="stroke-foreground" strokeWidth="1" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
        </svg>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header - left aligned */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <span className="text-sm font-medium text-rose-500 tracking-wide uppercase">
              Where trust breaks down
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            Where good businesses lose trust online.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            These are the patterns we see over and over. Real problems that cost real customers.
          </p>
        </motion.div>

        {/* Problems - stacked diagnostic style */}
        <div className="space-y-4">
          {problems.map((problem, index) => (
            <motion.div
              key={problem.title}
              initial={{ opacity: 0, x: -20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
              className="group"
            >
              <div className="flex items-start gap-4 sm:gap-6 p-5 sm:p-6 rounded-xl border border-border bg-card hover:border-border-strong hover:bg-card-elevated transition-all duration-300">
                {/* Severity indicator */}
                <div className={`hidden sm:flex w-1 h-full min-h-[60px] rounded-full ${
                  problem.severity === "high" ? "bg-rose-500" : "bg-amber-500"
                }`} />
                
                {/* Icon */}
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                  problem.severity === "high" 
                    ? "bg-rose-500/10 text-rose-500" 
                    : "bg-amber-500/10 text-amber-500"
                }`}>
                  <problem.icon className="w-5 h-5" />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1.5">
                    <h3 className="text-lg font-semibold text-foreground">
                      {problem.title}
                    </h3>
                    <span className={`text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      problem.severity === "high" 
                        ? "bg-rose-500/10 text-rose-500" 
                        : "bg-amber-500/10 text-amber-500"
                    }`}>
                      {problem.severity === "high" ? "Common" : "Often missed"}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
                    {problem.description}
                  </p>
                </div>
                
                {/* Arrow on hover */}
                <div className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-transparent group-hover:bg-muted transition-colors">
                  <motion.svg 
                    className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                    viewBox="0 0 24 24" 
                    fill="none"
                  >
                    <path d="M5 12h14m-7-7l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </motion.svg>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Bottom CTA line */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12 flex items-center gap-4 text-muted-foreground"
        >
          <div className="w-8 h-px bg-border" />
          <p className="text-sm">
            Recognize any of these? northline can help fix them.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
