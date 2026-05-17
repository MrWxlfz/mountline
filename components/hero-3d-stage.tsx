"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Check, MessageSquare, CreditCard, Clock, Bell, ExternalLink, Zap } from "lucide-react"

// Subtle animated grid background
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.04]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      
      {/* Animated vertical lines */}
      <div className="absolute inset-0">
        {[...Array(6)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 w-px bg-gradient-to-b from-transparent via-foreground/10 to-transparent"
            style={{ left: `${15 + i * 14}%`, height: '100%' }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ 
              opacity: [0, 0.4, 0],
              scaleY: [0, 1, 0],
            }}
            transition={{
              duration: 5,
              delay: i * 0.4,
              repeat: Infinity,
              repeatDelay: 3,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-40" />
    </div>
  )
}

// Full system visual - website → lead → portal → support
function SystemVisual() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      {/* Main browser window showing website */}
      <motion.div
        initial={{ opacity: 0, y: 40, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ duration: 0.9, delay: 0.4 }}
        className="relative w-full max-w-[480px] rounded-xl border border-foreground/10 bg-card shadow-2xl shadow-foreground/5 overflow-hidden"
        style={{ perspective: "1200px" }}
      >
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-foreground/10 bg-foreground/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
            <div className="w-2.5 h-2.5 rounded-full bg-foreground/20" />
          </div>
          <div className="flex-1 mx-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/[0.03] rounded-md text-xs text-foreground/50 border border-foreground/10 max-w-[200px]">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              ridgewaycontracting.com
            </div>
          </div>
        </div>
        
        {/* Website content - Contractor theme */}
        <div className="relative p-5 bg-gradient-to-br from-stone-900 via-stone-900 to-stone-800 min-h-[240px]">
          {/* Mock nav */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 font-bold text-[10px]">R</span>
              </div>
              <span className="text-white/80 font-semibold text-xs tracking-wide">RIDGEWAY</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/30 text-[10px] hidden sm:block">Services</span>
              <span className="text-white/30 text-[10px] hidden sm:block">Gallery</span>
              <div className="px-2.5 py-1.5 rounded bg-amber-500 text-white text-[10px] font-medium">
                Get Estimate
              </div>
            </div>
          </div>
          
          {/* Hero content */}
          <div className="space-y-3">
            <div className="inline-block px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 text-[9px] font-medium uppercase tracking-wider">
              Trusted Since 2008
            </div>
            <h3 className="text-white text-lg sm:text-xl font-bold leading-tight">
              Build Something
              <span className="text-white/50"> That Lasts</span>
            </h3>
            <p className="text-white/40 text-[11px] max-w-[240px] leading-relaxed">
              Premium residential contracting for roofing, remodels, and outdoor projects.
            </p>
            <div className="flex gap-2 pt-1">
              <div className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-[10px] font-medium">
                Free Estimate
              </div>
              <div className="px-3 py-1.5 rounded-lg border border-white/15 text-white/60 text-[10px] font-medium">
                View Work
              </div>
            </div>
          </div>
          
          {/* Built by Mountline label */}
          <div className="absolute bottom-3 right-3 flex items-center gap-1.5 px-2 py-1 bg-black/50 backdrop-blur rounded text-[8px] font-medium text-white/50">
            <span className="w-3 h-3 rounded bg-white/10 flex items-center justify-center text-[6px] font-bold text-white/70">M</span>
            Mountline
          </div>
        </div>
      </motion.div>
      
      {/* Step 1: Lead Captured notification */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, x: -20 }}
        animate={{ opacity: 1, scale: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.0 }}
        className="absolute -left-3 sm:-left-6 bottom-32 flex items-center gap-2.5 px-3 py-2.5 bg-card border border-foreground/10 rounded-xl shadow-lg"
      >
        <motion.div 
          className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.2, type: "spring" }}
        >
          <Check className="w-3.5 h-3.5 text-green-500" />
        </motion.div>
        <div>
          <span className="text-[11px] font-medium text-foreground block">Lead Captured</span>
          <span className="text-[9px] text-foreground/50">Roofing quote request</span>
        </div>
      </motion.div>
      
      {/* Step 2: Portal card */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 1.3 }}
        className="absolute -right-2 sm:-right-6 top-12 w-44 sm:w-48 rounded-xl border border-foreground/10 bg-card shadow-lg overflow-hidden"
      >
        <div className="px-3 py-2 border-b border-foreground/10 bg-foreground/[0.02]">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-foreground/10 flex items-center justify-center">
              <span className="text-foreground/70 text-[7px] font-bold">M</span>
            </div>
            <span className="text-[10px] font-medium text-foreground">Client Portal</span>
          </div>
        </div>
        <div className="p-3 space-y-2">
          <div className="flex items-center gap-2">
            <Clock className="w-3 h-3 text-foreground/40" />
            <span className="text-[9px] text-foreground/60">Status</span>
            <span className="ml-auto px-1.5 py-0.5 rounded bg-green-500/10 text-green-500 text-[7px] font-medium">On Track</span>
          </div>
          <div className="flex items-center gap-2">
            <ExternalLink className="w-3 h-3 text-foreground/40" />
            <span className="text-[9px] text-foreground/60">Preview Site</span>
            <span className="ml-auto text-[7px] text-foreground/40">Live</span>
          </div>
          <div className="flex items-center gap-2">
            <CreditCard className="w-3 h-3 text-foreground/40" />
            <span className="text-[9px] text-foreground/60">Payments</span>
            <span className="ml-auto text-[8px] text-foreground/50">$1,250</span>
          </div>
        </div>
      </motion.div>
      
      {/* Step 3: Support message */}
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 1.6 }}
        className="absolute -left-2 sm:-left-4 -bottom-4 flex items-start gap-2.5 px-3 py-2.5 bg-card border border-foreground/10 rounded-xl shadow-lg max-w-[180px]"
      >
        <div className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-foreground/70 text-[8px] font-bold">M</span>
        </div>
        <div>
          <div className="text-[10px] font-medium text-foreground mb-0.5">Mountline</div>
          <div className="text-[9px] text-foreground/50 leading-relaxed">
            Homepage is ready for review!
          </div>
        </div>
      </motion.div>
      
      {/* Step 4: New inquiry notification */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 1.9 }}
        className="absolute right-0 sm:-right-2 bottom-8 flex items-center gap-2 px-2.5 py-2 bg-card border border-foreground/10 rounded-lg shadow-lg"
      >
        <div className="w-5 h-5 rounded-full bg-accent/10 flex items-center justify-center">
          <Bell className="w-2.5 h-2.5 text-accent" />
        </div>
        <span className="text-[9px] font-medium text-foreground">New inquiry</span>
      </motion.div>
      
      {/* Connection line visual hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2.2, duration: 0.5 }}
        className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-2 text-[9px] text-foreground/40"
      >
        <Zap className="w-3 h-3" />
        <span>All in one system</span>
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
  
  const opacity = useTransform(scrollYProgress, [0, 0.4], [1, 0])
  const y = useTransform(scrollYProgress, [0, 0.4], [0, 60])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const benefitChips = [
    "Websites",
    "Client Portals",
    "Landing Pages", 
    "Quote Flows",
    "AI Systems",
  ]

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[90vh] flex flex-col justify-center overflow-hidden"
    >
      {/* Animated background */}
      <AnimatedGrid />
      
      {/* Main content */}
      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-20 sm:pb-24"
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
              className="mb-5"
            >
              <span className="inline-flex items-center gap-3 text-sm font-medium text-foreground/50 tracking-wide">
                <span className="w-8 h-px bg-foreground/20" />
                Small team. Serious standards.
              </span>
            </motion.div>
            
            {/* Main headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[0.95] mb-5"
            >
              <span className="block">Websites people</span>
              <span className="block">trust before they</span>
              <span className="block text-foreground/40">ever call.</span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg text-foreground/60 leading-relaxed max-w-lg mb-7"
            >
              Mountline Studio builds clean websites, client portals, and practical systems for businesses that need a stronger first impression and smoother customer action.
            </motion.p>
            
            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-start gap-3 mb-8"
            >
              <motion.button
                onClick={() => scrollToSection('contact')}
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-all"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Book a website review
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('work')}
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-foreground/15 font-medium rounded-lg hover:bg-foreground/5 hover:border-foreground/25 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                See concept builds
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
                  className="px-3 py-1.5 text-xs text-foreground/50 border border-foreground/10 rounded-full hover:border-foreground/20 hover:text-foreground/70 transition-colors cursor-default"
                >
                  {chip}
                </motion.span>
              ))}
            </motion.div>
          </div>
          
          {/* Right column - System visual */}
          <div className="hidden lg:block relative">
            <SystemVisual />
          </div>
        </div>
      </motion.div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
