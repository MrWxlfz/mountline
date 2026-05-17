"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Check, MessageSquare, CreditCard, ExternalLink, Send } from "lucide-react"

// Mountline line motif SVG
function MountlineMotif() {
  return (
    <motion.svg 
      width="120" 
      height="80" 
      viewBox="0 0 120 80" 
      className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-[0.08]"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 0.08, y: 0 }}
      transition={{ duration: 1.5, delay: 0.5 }}
    >
      <motion.path
        d="M60 0 L60 80 M30 25 L60 0 L90 25"
        stroke="currentColor"
        strokeWidth="1.5"
        fill="none"
        className="text-foreground"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.8, ease: "easeOut" }}
      />
    </motion.svg>
  )
}

// Premium animated grid with Mountline line accents
function PremiumGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base refined grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.025]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hero-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      
      {/* Animated vertical accent lines */}
      <div className="absolute inset-0">
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 w-px bg-gradient-to-b from-transparent via-foreground/8 to-transparent"
            style={{ left: `${20 + i * 15}%`, height: '100%' }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ 
              opacity: [0, 0.5, 0],
              scaleY: [0, 1, 0],
            }}
            transition={{
              duration: 6,
              delay: i * 0.6,
              repeat: Infinity,
              repeatDelay: 4,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Radial gradient overlays for depth */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,var(--background)_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
    </div>
  )
}

// Premium cinematic centerpiece showing the full system
function SystemCenterpiece() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.3 }}
      className="relative w-full max-w-[640px] mx-auto"
    >
      {/* Main composition container with perspective */}
      <div className="relative" style={{ perspective: "1500px" }}>
        
        {/* Central browser window - the website */}
        <motion.div
          initial={{ opacity: 0, y: 60, rotateX: 12 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-xl border border-foreground/[0.08] bg-card shadow-2xl shadow-foreground/[0.03] overflow-hidden"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-4 py-2.5 border-b border-foreground/[0.06] bg-foreground/[0.015]">
            <div className="flex gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
              <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
            </div>
            <div className="flex-1 mx-4">
              <div className="flex items-center gap-2 px-3 py-1.5 bg-foreground/[0.02] rounded-md text-xs text-foreground/40 border border-foreground/[0.06] max-w-[180px] mx-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                ridgewaycontracting.com
              </div>
            </div>
          </div>
          
          {/* Website content - Premium contractor theme */}
          <div className="relative bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 min-h-[280px] sm:min-h-[320px] p-6 sm:p-8">
            {/* Mock nav */}
            <div className="flex items-center justify-between mb-8 sm:mb-10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/15 flex items-center justify-center border border-amber-500/20">
                  <span className="text-amber-400 font-bold text-xs">R</span>
                </div>
                <span className="text-white/70 font-semibold text-sm tracking-wide">RIDGEWAY</span>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-white/25 text-xs hidden sm:block">Services</span>
                <span className="text-white/25 text-xs hidden sm:block">Gallery</span>
                <div className="px-3 py-2 rounded-lg bg-amber-500 text-white text-xs font-medium">
                  Get Estimate
                </div>
              </div>
            </div>
            
            {/* Hero content */}
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/20">
                <span className="w-1 h-1 rounded-full bg-amber-400" />
                <span className="text-amber-400 text-[10px] font-medium uppercase tracking-wider">
                  Trusted Since 2008
                </span>
              </div>
              <h3 className="text-white text-2xl sm:text-3xl font-bold leading-[1.1] tracking-tight">
                Build Something
                <span className="text-white/40 block">That Lasts</span>
              </h3>
              <p className="text-white/35 text-sm max-w-[280px] leading-relaxed">
                Premium residential contracting for roofing, remodels, and outdoor projects.
              </p>
              <div className="flex gap-3 pt-2">
                <div className="px-4 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium">
                  Free Estimate
                </div>
                <div className="px-4 py-2.5 rounded-lg border border-white/10 text-white/50 text-sm font-medium">
                  View Work
                </div>
              </div>
            </div>
            
            {/* Built by Mountline badge */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 px-2.5 py-1.5 bg-black/60 backdrop-blur rounded-lg text-[9px] font-medium text-white/40 border border-white/5">
              <div className="w-4 h-4 rounded bg-white/10 flex items-center justify-center">
                <span className="text-[7px] font-bold text-white/60">M</span>
              </div>
              Built by Mountline
            </div>
          </div>
        </motion.div>
        
        {/* Floating cards showing the system flow */}
        
        {/* Card 1: Lead Captured - top left */}
        <motion.div
          initial={{ opacity: 0, x: -40, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, delay: 1.1 }}
          className="absolute -left-4 sm:-left-12 top-16 sm:top-20"
        >
          <div className="flex items-center gap-3 px-4 py-3 bg-card border border-foreground/[0.08] rounded-xl shadow-xl shadow-foreground/[0.02]">
            <motion.div 
              className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.4, type: "spring", stiffness: 200 }}
            >
              <Check className="w-4 h-4 text-green-500" />
            </motion.div>
            <div>
              <div className="text-sm font-medium text-foreground">Lead Captured</div>
              <div className="text-xs text-foreground/50">Roofing quote request</div>
            </div>
          </div>
          {/* Label */}
          <div className="absolute -bottom-5 left-4 text-[9px] text-foreground/30 uppercase tracking-wider font-medium">
            Step 1
          </div>
        </motion.div>
        
        {/* Card 2: Portal Preview - top right */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: -20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, delay: 1.4 }}
          className="absolute -right-4 sm:-right-8 top-4 sm:top-8 w-48 sm:w-56"
        >
          <div className="rounded-xl border border-foreground/[0.08] bg-card shadow-xl shadow-foreground/[0.02] overflow-hidden">
            <div className="px-3 py-2 border-b border-foreground/[0.06] bg-foreground/[0.015]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded bg-foreground/5 flex items-center justify-center border border-foreground/10">
                  <span className="text-foreground/60 text-[8px] font-bold">M</span>
                </div>
                <span className="text-[11px] font-medium text-foreground">Client Portal</span>
              </div>
            </div>
            <div className="p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-foreground/50">Status</span>
                <span className="px-2 py-0.5 rounded bg-green-500/10 text-green-500 text-[9px] font-medium">On Track</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-foreground/50">Preview</span>
                <div className="flex items-center gap-1">
                  <ExternalLink className="w-2.5 h-2.5 text-foreground/40" />
                  <span className="text-[9px] text-foreground/60">Live</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[10px] text-foreground/50">Payment</span>
                <span className="text-[10px] text-foreground/60">$1,250 paid</span>
              </div>
            </div>
          </div>
          {/* Label */}
          <div className="absolute -bottom-5 right-3 text-[9px] text-foreground/30 uppercase tracking-wider font-medium">
            Step 2
          </div>
        </motion.div>
        
        {/* Card 3: Support Message - bottom left */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 1.7 }}
          className="absolute -left-2 sm:-left-6 bottom-4 sm:bottom-8"
        >
          <div className="flex items-start gap-2.5 px-3.5 py-3 bg-card border border-foreground/[0.08] rounded-xl shadow-xl shadow-foreground/[0.02] max-w-[200px]">
            <div className="w-7 h-7 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 border border-foreground/10">
              <span className="text-foreground/60 text-[9px] font-bold">M</span>
            </div>
            <div>
              <div className="text-[11px] font-medium text-foreground mb-0.5">Mountline</div>
              <div className="text-[10px] text-foreground/50 leading-relaxed">
                Homepage ready for review!
              </div>
            </div>
          </div>
          {/* Label */}
          <div className="absolute -bottom-5 left-3 text-[9px] text-foreground/30 uppercase tracking-wider font-medium">
            Step 3
          </div>
        </motion.div>
        
        {/* Card 4: Payment/Launch - bottom right */}
        <motion.div
          initial={{ opacity: 0, x: 30, y: 20 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.7, delay: 2.0 }}
          className="absolute -right-2 sm:-right-4 -bottom-2 sm:bottom-2"
        >
          <div className="flex items-center gap-2.5 px-3.5 py-2.5 bg-card border border-foreground/[0.08] rounded-xl shadow-xl shadow-foreground/[0.02]">
            <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center border border-foreground/10">
              <CreditCard className="w-3.5 h-3.5 text-foreground/60" />
            </div>
            <div>
              <div className="text-[11px] font-medium text-foreground">Ready to launch</div>
              <div className="text-[9px] text-foreground/40">Final payment received</div>
            </div>
          </div>
          {/* Label */}
          <div className="absolute -bottom-5 right-3 text-[9px] text-foreground/30 uppercase tracking-wider font-medium">
            Step 4
          </div>
        </motion.div>
      </div>
      
      {/* System flow indicator at bottom */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.5, duration: 0.6 }}
        className="flex items-center justify-center gap-3 mt-16 sm:mt-20"
      >
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-foreground/15" />
        <span className="text-[10px] text-foreground/40 uppercase tracking-wider font-medium">
          Website to launch, all in one system
        </span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-foreground/15" />
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
  const y = useTransform(scrollYProgress, [0, 0.4], [0, 80])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
    >
      {/* Premium background */}
      <PremiumGrid />
      
      {/* Mountline motif */}
      <MountlineMotif />
      
      {/* Main content */}
      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 sm:pb-20"
        style={{ opacity, y }}
      >
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-6"
        >
          <span className="inline-flex items-center gap-3 text-sm font-medium text-foreground/40 tracking-wide">
            <span className="w-8 h-px bg-foreground/15" />
            Small team. Serious standards.
            <span className="w-8 h-px bg-foreground/15" />
          </span>
        </motion.div>
        
        {/* Main headline - centered */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground tracking-tight leading-[0.95] mb-6 max-w-4xl mx-auto"
        >
          <span className="block">Websites people trust</span>
          <span className="block text-foreground/35">before they ever call.</span>
        </motion.h1>
        
        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-base sm:text-lg text-foreground/55 leading-relaxed max-w-2xl mx-auto mb-10"
        >
          Mountline Studio builds clean websites, client portals, and practical systems for businesses that need a stronger first impression and smoother customer action.
        </motion.p>
        
        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 sm:mb-20"
        >
          <motion.button
            onClick={() => scrollToSection('contact')}
            className="group inline-flex items-center gap-2.5 px-7 py-4 bg-foreground text-background font-medium rounded-xl hover:bg-foreground/90 transition-all text-[15px]"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Book a website review
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <motion.button
            onClick={() => scrollToSection('work')}
            className="inline-flex items-center gap-2.5 px-7 py-4 border border-foreground/10 font-medium rounded-xl hover:bg-foreground/[0.03] hover:border-foreground/20 transition-all text-[15px] text-foreground/80"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            See concept builds
          </motion.button>
        </motion.div>
        
        {/* Cinematic centerpiece */}
        <SystemCenterpiece />
      </motion.div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
