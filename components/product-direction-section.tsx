"use client"

import { motion } from "framer-motion"

const processSteps = [
  {
    numeral: "I",
    title: "Review",
    description: "We look at the current site, business goals, and what customers need to do.",
  },
  {
    numeral: "II", 
    title: "Plan",
    description: "We define pages, content, timeline, and systems before the build starts.",
  },
  {
    numeral: "III",
    title: "Build",
    description: "We design and build the site with mobile, speed, forms, and trust in mind.",
  },
  {
    numeral: "IV",
    title: "Launch",
    description: "We connect the domain, test the site, and make sure it is ready to use.",
  },
  {
    numeral: "V",
    title: "Support",
    description: "Mountline can keep the site updated with monthly care.",
  }
]

export function ProductDirectionSection() {
  return (
    <section id="process" className="relative py-24 lg:py-32 bg-foreground text-background overflow-hidden">
      {/* Diagonal line texture */}
      <div className="absolute inset-0 opacity-[0.03]">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="diagonal-lines" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M0 40 L40 0" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-background" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
        </svg>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-20 lg:mb-24">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block text-sm font-medium text-background/70 tracking-wide uppercase mb-4"
          >
            Process
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1] max-w-2xl"
          >
            A clear path from review to launch.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-background/80 mt-6 max-w-xl leading-relaxed"
          >
            Clear scope, careful design, clean build, and steady support.
          </motion.p>
        </div>
        
        {/* Steps with animated progress line */}
        <div className="relative">
          {/* Vertical progress line - desktop */}
          <div className="hidden lg:block absolute left-8 top-0 bottom-0 w-px bg-background/10">
            <motion.div 
              className="absolute top-0 left-0 w-full bg-accent"
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </div>
          
          {/* Steps */}
          <div className="space-y-0">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.numeral}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.15 }}
                className="relative group"
              >
                <div className="grid grid-cols-12 gap-4 lg:gap-8 py-8 lg:py-10 border-b border-background/10 last:border-b-0">
                  {/* Numeral */}
                  <div className="col-span-2 lg:col-span-1 flex items-start lg:justify-center">
                    <span className="text-2xl lg:text-3xl font-serif text-background/55 group-hover:text-background transition-colors">
                      {step.numeral}
                    </span>
                  </div>
                  
                  {/* Title */}
                  <div className="col-span-10 lg:col-span-3">
                    <h3 className="text-xl lg:text-2xl font-semibold group-hover:text-accent transition-colors">
                      {step.title}
                    </h3>
                  </div>
                  
                  {/* Description */}
                  <div className="col-span-12 lg:col-span-7 lg:col-start-5">
                    <p className="text-background/80 leading-relaxed mt-2 lg:mt-0">
                      {step.description}
                    </p>
                  </div>
                  
                  {/* Progress dot - desktop */}
                  <div className="hidden lg:flex col-span-1 items-center justify-end">
                    <motion.div 
                      className="w-3 h-3 rounded-full border-2 border-background/20 group-hover:border-accent group-hover:bg-accent transition-colors"
                      initial={{ scale: 0 }}
                      whileInView={{ scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + index * 0.15 }}
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
