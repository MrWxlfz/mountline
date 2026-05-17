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
    <section id="process" className="relative py-28 lg:py-36 bg-white text-black overflow-hidden">
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-black/30 tracking-wide uppercase mb-6"
          >
            <span className="w-8 h-px bg-black/15" />
            Process
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] max-w-3xl"
          >
            A clear path from
            <span className="text-black/25"> review to launch.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-black/40 mt-6 max-w-xl leading-relaxed"
          >
            Clear scope, careful design, clean build, and steady support. No mystery.
          </motion.p>
        </div>
        
        {/* Steps */}
        <div className="border-t border-black/[0.06]">
          {processSteps.map((step, index) => (
            <motion.div
              key={step.numeral}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group border-b border-black/[0.06] py-8 lg:py-10"
            >
              <div className="flex items-start lg:items-center gap-6 lg:gap-10">
                {/* Numeral */}
                <span className="text-sm font-mono text-black/20 group-hover:text-black/40 transition-colors w-8 shrink-0">
                  {step.numeral}
                </span>
                
                {/* Title */}
                <h3 className="text-xl lg:text-2xl font-semibold text-black min-w-[120px] lg:min-w-[160px]">
                  {step.title}
                </h3>
                
                {/* Description */}
                <p className="hidden lg:block flex-1 text-black/45 leading-relaxed text-base">
                  {step.description}
                </p>
              </div>
              
              {/* Description - mobile */}
              <p className="lg:hidden text-black/45 leading-relaxed text-sm mt-3 ml-14">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
