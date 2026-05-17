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
    <section id="process" className="relative py-20 lg:py-28 bg-foreground text-background overflow-hidden">
      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="process-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-background" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#process-grid)" />
        </svg>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 lg:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-background/50 tracking-wide uppercase mb-4"
          >
            <span className="w-8 h-px bg-background/20" />
            Process
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] max-w-2xl"
          >
            A clear path from review to launch.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base lg:text-lg text-background/60 mt-5 max-w-xl leading-relaxed"
          >
            Clear scope, careful design, clean build, and steady support. No mystery.
          </motion.p>
        </div>
        
        {/* Steps */}
        <div className="relative">
          {/* Vertical progress line - desktop */}
          <div className="hidden lg:block absolute left-10 top-0 bottom-0 w-px bg-background/10">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-background/30"
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
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
                <div className="grid grid-cols-12 gap-4 lg:gap-8 py-7 lg:py-8 border-b border-background/10 last:border-b-0">
                  {/* Numeral */}
                  <div className="col-span-2 lg:col-span-1 flex items-start lg:justify-center">
                    <span className="text-sm font-mono text-background/40 group-hover:text-background/60 transition-colors">
                      {step.numeral}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <div className="col-span-10 lg:col-span-3">
                    <h3 className="text-lg lg:text-xl font-semibold text-background group-hover:text-accent transition-colors">
                      {step.title}
                    </h3>
                  </div>
                  
                  {/* Description */}
                  <div className="col-span-12 lg:col-span-7 lg:col-start-5">
                    <p className="text-background/65 leading-relaxed mt-2 lg:mt-0 text-[15px]">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Progress dot - desktop */}
                  <div className="hidden lg:flex col-span-1 items-center justify-end">
                    <motion.div 
                      className="w-2.5 h-2.5 rounded-full border-2 border-background/20 group-hover:border-background/40 group-hover:bg-background/10 transition-colors"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                    />
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
