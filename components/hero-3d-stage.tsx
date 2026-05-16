"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Check, Smartphone, Monitor } from "lucide-react"
import { MetricsStrip } from "./metrics-strip"

// Browser mockup component for hero visual
function BrowserMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotateY: -5 }}
      animate={{ opacity: 1, y: 0, rotateY: 0 }}
      transition={{ duration: 0.9, delay: 0.5 }}
      className="relative"
      style={{ perspective: "1000px" }}
    >
      {/* Main browser window */}
      <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/70" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/70" />
            <div className="w-3 h-3 rounded-full bg-green-400/70" />
          </div>
          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-md text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded-full bg-green-500" />
              acmeroofing.com
            </div>
          </div>
        </div>
        
        {/* Website preview content */}
        <div className="p-4 bg-gradient-to-b from-slate-900 to-slate-800">
          {/* Mock nav */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-white/10" />
              <div className="w-20 h-3 rounded bg-white/20" />
            </div>
            <div className="flex gap-4">
              <div className="w-12 h-2 rounded bg-white/10" />
              <div className="w-12 h-2 rounded bg-white/10" />
              <div className="w-16 h-6 rounded bg-orange-500" />
            </div>
          </div>
          
          {/* Hero area */}
          <div className="space-y-4 mb-6">
            <div className="w-32 h-4 rounded bg-orange-500/20" />
            <div className="space-y-2">
              <div className="w-full h-6 rounded bg-white/30" />
              <div className="w-3/4 h-6 rounded bg-white/30" />
            </div>
            <div className="w-2/3 h-3 rounded bg-white/15" />
            <div className="flex gap-3 pt-2">
              <div className="w-28 h-10 rounded-lg bg-orange-500" />
              <div className="w-24 h-10 rounded-lg border border-white/20" />
            </div>
          </div>
          
          {/* Feature cards */}
          <div className="grid grid-cols-3 gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="w-8 h-8 rounded bg-orange-500/20 mb-2" />
                <div className="w-full h-2 rounded bg-white/15 mb-1" />
                <div className="w-2/3 h-2 rounded bg-white/10" />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Floating mobile preview */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 0.9 }}
        className="absolute -right-4 -bottom-8 w-28 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
      >
        <div className="p-1.5 bg-muted/30 border-b border-border">
          <div className="w-8 h-1 rounded bg-muted-foreground/30 mx-auto" />
        </div>
        <div className="p-2 bg-gradient-to-b from-slate-900 to-slate-800">
          <div className="space-y-2">
            <div className="w-full h-3 rounded bg-white/20" />
            <div className="w-2/3 h-3 rounded bg-white/20" />
            <div className="w-full h-6 rounded bg-orange-500 mt-3" />
          </div>
        </div>
      </motion.div>
      
      {/* Floating feature badges */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.1 }}
        className="absolute -left-6 top-8 flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg"
      >
        <div className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center">
          <Check className="w-3 h-3 text-green-500" />
        </div>
        <span className="text-xs font-medium text-foreground">Mobile-first</span>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.3 }}
        className="absolute -left-4 bottom-16 flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg"
      >
        <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center">
          <Monitor className="w-3 h-3 text-blue-500" />
        </div>
        <span className="text-xs font-medium text-foreground">Fast load</span>
      </motion.div>
    </motion.div>
  )
}

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
        {/* Subtle dot grid background */}
        <div className="absolute inset-0 bg-dot-grid opacity-30" />
        
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        
        {/* Main content */}
        <motion.div 
          className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-20"
          style={{ opacity, y }}
        >
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left column - Copy */}
            <div>
              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="mb-6"
              >
                <span className="inline-flex items-center gap-3 text-sm font-medium text-muted-foreground tracking-wide">
                  <span className="w-10 h-px bg-border" />
                  Small team. Serious standards.
                </span>
              </motion.div>
              
              {/* Main headline */}
              <motion.h1 
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground tracking-tight leading-[0.95] mb-6"
              >
                <span className="block">Websites people</span>
                <span className="block">trust before they</span>
                <span className="block text-muted-foreground/75">ever call.</span>
              </motion.h1>
              
              {/* Subheadline */}
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mb-8"
              >
                Northline builds clean websites, landing pages, and practical digital systems for businesses that need a stronger first impression.
              </motion.p>
              
              {/* CTAs */}
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="flex flex-col sm:flex-row items-start gap-4 mb-10"
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
                className="flex flex-wrap items-center gap-2"
              >
                {benefitChips.map((chip, i) => (
                  <motion.span 
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.6 + i * 0.05 }}
                    className="px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-full hover:border-foreground/20 transition-colors"
                  >
                    {chip}
                  </motion.span>
                ))}
              </motion.div>
            </div>
            
            {/* Right column - Browser mockup */}
            <div className="hidden lg:block">
              <BrowserMockup />
            </div>
          </div>
        </motion.div>
      </section>
      
      {/* Metrics strip */}
      <MetricsStrip />
    </>
  )
}
