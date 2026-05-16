"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"
import { ParticleField } from "./particle-field"
import { MetricsStrip } from "./metrics-strip"

export function Hero3DStage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 60])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const benefitChips = [
    "Websites",
    "Landing Pages",
    "Quote Flows",
    "AI Systems",
    "Monthly Support",
  ]

  return (
    <>
      <section 
        ref={containerRef}
        className="relative min-h-screen flex flex-col justify-center overflow-hidden"
      >
        {/* Particle field background */}
        <div className="absolute inset-0">
          <ParticleField density="normal" interactive />
        </div>
        
        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background/50 pointer-events-none" />
        
        {/* Main content */}
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20"
          style={{ opacity, y }}
        >
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-8"
          >
            <span className="inline-flex items-center gap-3 text-sm font-medium text-muted-foreground tracking-wide">
              <span className="w-10 h-px bg-border" />
              Small team. Serious standards.
            </span>
          </motion.div>
          
          {/* Main headline - Massive clean typography */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-[clamp(2.5rem,8vw,6.5rem)] font-bold text-foreground tracking-tight leading-[0.95] mb-8 max-w-5xl"
          >
            <span className="block">Websites people</span>
            <span className="block">trust before they</span>
            <span className="block text-muted-foreground/60">ever call.</span>
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-12"
          >
            northline builds clean websites, landing pages, and practical digital systems for businesses that need a stronger first impression and more customer action.
          </motion.p>
          
          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row items-start gap-4 mb-16"
          >
            <motion.button
              onClick={() => scrollToSection('contact')}
              className="group inline-flex items-center gap-2 px-6 py-3.5 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Book a website review
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              onClick={() => scrollToSection('work')}
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-border font-medium rounded-lg hover:bg-muted/50 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              See the work
            </motion.button>
          </motion.div>
          
          {/* Benefit chips */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="flex flex-wrap items-center gap-3"
          >
            {benefitChips.map((chip, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.6 + i * 0.05 }}
                className="px-4 py-2 text-sm text-muted-foreground border border-border rounded-full hover:border-foreground/20 transition-colors"
              >
                {chip}
              </motion.span>
            ))}
          </motion.div>
        </motion.div>
        
        {/* Bottom gradient fade into metrics */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
      </section>
      
      {/* Metrics strip directly after hero */}
      <MetricsStrip />
    </>
  )
}
