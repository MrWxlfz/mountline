"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"

export function BrandStatementSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-24 sm:py-32 relative overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />
      
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="text-center"
        >
          {/* Large editorial heading */}
          <motion.h2 
            className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground tracking-tight leading-[1.1] mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.7, delay: 0.1 }}
          >
            A website should not feel{" "}
            <span className="relative inline-block">
              <span className="relative z-10 text-muted-foreground">like an afterthought.</span>
            </span>
          </motion.h2>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="max-w-2xl mx-auto"
          >
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed">
              If your business looks professional in person, your website should carry 
              that same weight online. Mountline helps close that gap with clean design,
              clear structure, and practical systems.
            </p>
          </motion.div>
          
          {/* Decorative line */}
          <motion.div
            initial={{ scaleX: 0 }}
            animate={isInView ? { scaleX: 1 } : {}}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mt-12 mx-auto w-24 h-px bg-gradient-to-r from-transparent via-border-strong to-transparent"
            style={{ transformOrigin: "center" }}
          />
        </motion.div>
      </div>
    </section>
  )
}
