"use client"

import { motion } from "framer-motion"

const processSteps = [
  {
    numeral: "01",
    title: "Review",
    description: "We look at your current site, business goals, and what customers need to do. Free assessment, no pressure.",
  },
  {
    numeral: "02", 
    title: "Plan",
    description: "We define pages, content, timeline, and systems. Clear scope before the build starts so there are no surprises.",
  },
  {
    numeral: "03",
    title: "Build",
    description: "We design and build the site with mobile, speed, forms, and trust signals in mind. You get preview access throughout.",
  },
  {
    numeral: "04",
    title: "Launch",
    description: "We connect your domain, test everything, and make sure the site is ready to bring in customers.",
  },
  {
    numeral: "05",
    title: "Support",
    description: "Mountline can keep the site updated with monthly care plans. Edits, photos, seasonal changes, and priority fixes.",
  }
]

export function ProductDirectionSection() {
  return (
    <section id="process" className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden">
      {/* Mountline line motif - subtle mountain pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <svg className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] opacity-[0.02]" viewBox="0 0 800 400" fill="none">
          <path 
            d="M400 0 L400 400 M200 100 L400 0 L600 100" 
            stroke="currentColor" 
            strokeWidth="1" 
            className="text-background"
          />
          <path 
            d="M400 50 L400 400 M250 125 L400 50 L550 125" 
            stroke="currentColor" 
            strokeWidth="0.5" 
            className="text-background"
          />
        </svg>
      </div>
      
      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="process-grid" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-background" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#process-grid)" />
        </svg>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-background/45 tracking-wide uppercase mb-5"
          >
            <span className="w-8 h-px bg-background/15" />
            Process
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] max-w-2xl"
          >
            A clear path from
            <span className="text-background/40"> review to launch.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-base lg:text-lg text-background/55 mt-5 max-w-xl leading-relaxed"
          >
            Clear scope, careful design, clean build, and steady support. No mystery.
          </motion.p>
        </div>
        
        {/* Steps */}
        <div className="relative">
          {/* Vertical Mountline line - desktop */}
          <div className="hidden lg:block absolute left-[42px] top-4 bottom-4">
            {/* Base line */}
            <div className="absolute left-0 top-0 bottom-0 w-px bg-background/10" />
            {/* Animated progress line */}
            <motion.div 
              className="absolute left-0 top-0 w-px bg-background/25"
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2.5, ease: "easeOut" }}
            />
            {/* Mountain peak accent at top */}
            <svg className="absolute -top-2 -left-3 w-7 h-5 text-background/20" viewBox="0 0 28 20">
              <path d="M14 0 L7 12 L14 8 L21 12 Z" fill="currentColor" />
            </svg>
          </div>
          
          {/* Steps list */}
          <div className="space-y-0">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.numeral}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="relative group"
              >
                <div className="grid grid-cols-12 gap-4 lg:gap-8 py-8 lg:py-9 border-b border-background/[0.06] last:border-b-0">
                  {/* Step dot - desktop */}
                  <div className="hidden lg:flex col-span-1 items-center justify-center">
                    <motion.div 
                      className="w-3 h-3 rounded-full border-2 border-background/20 bg-foreground group-hover:border-background/40 group-hover:bg-background/5 transition-all duration-300"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.1, type: "spring" }}
                    />
                  </div>
                  
                  {/* Numeral - mobile */}
                  <div className="col-span-2 lg:hidden">
                    <span className="text-sm font-mono text-background/30">
                      {step.numeral}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <div className="col-span-10 lg:col-span-3">
                    <h3 className="text-lg lg:text-xl font-semibold text-background">
                      {step.title}
                    </h3>
                  </div>
                  
                  {/* Description */}
                  <div className="col-span-12 lg:col-span-7 lg:col-start-5">
                    <p className="text-background/60 leading-relaxed mt-2 lg:mt-0 text-[15px]">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Numeral - desktop */}
                  <div className="hidden lg:flex col-span-1 items-center justify-end">
                    <span className="text-sm font-mono text-background/25 group-hover:text-background/40 transition-colors">
                      {step.numeral}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
