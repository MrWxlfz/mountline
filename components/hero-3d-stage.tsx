"use client"

import { motion } from "framer-motion"
import { ArrowRight, Check, MessageSquare, CreditCard, ExternalLink, Rocket } from "lucide-react"

// Subtle animated grid background
function PremiumGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Refined grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      
      {/* Radial gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,var(--background)_70%)]" />
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
    </div>
  )
}

// Large cinematic centerpiece showing the full Mountline system
function SystemCenterpiece() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1, delay: 0.4 }}
      className="relative w-full max-w-5xl mx-auto"
    >
      {/* Main composition container */}
      <div className="relative" style={{ perspective: "2000px" }}>
        
        {/* Central browser window - the website */}
        <motion.div
          initial={{ opacity: 0, y: 80, rotateX: 8 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 1.2, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative rounded-2xl border border-foreground/[0.08] bg-card shadow-2xl shadow-foreground/[0.04] overflow-hidden"
        >
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-5 py-3 border-b border-foreground/[0.06] bg-foreground/[0.01]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-foreground/10" />
              <div className="w-3 h-3 rounded-full bg-foreground/10" />
              <div className="w-3 h-3 rounded-full bg-foreground/10" />
            </div>
            <div className="flex-1 mx-6">
              <div className="flex items-center gap-2 px-4 py-2 bg-foreground/[0.02] rounded-lg text-sm text-foreground/40 border border-foreground/[0.06] max-w-[220px] mx-auto">
                <span className="w-2 h-2 rounded-full bg-green-500" />
                ridgewaycontracting.com
              </div>
            </div>
          </div>
          
          {/* Website content - Premium contractor theme */}
          <div className="relative bg-gradient-to-br from-stone-950 via-stone-900 to-stone-950 min-h-[380px] sm:min-h-[440px] lg:min-h-[480px] p-8 sm:p-10 lg:p-12">
            {/* Mock nav */}
            <div className="flex items-center justify-between mb-12 lg:mb-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 flex items-center justify-center border border-amber-500/20">
                  <span className="text-amber-400 font-bold text-sm">R</span>
                </div>
                <span className="text-white/70 font-semibold tracking-wide">RIDGEWAY</span>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-white/30 text-sm hidden sm:block">Services</span>
                <span className="text-white/30 text-sm hidden sm:block">Gallery</span>
                <span className="text-white/30 text-sm hidden md:block">About</span>
                <div className="px-5 py-2.5 rounded-xl bg-amber-500 text-white text-sm font-medium">
                  Get Estimate
                </div>
              </div>
            </div>
            
            {/* Hero content */}
            <div className="max-w-xl space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                <span className="text-amber-400 text-xs font-medium uppercase tracking-wider">
                  Trusted Since 2008
                </span>
              </div>
              <h3 className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
                Build Something
                <span className="text-white/35 block">That Lasts</span>
              </h3>
              <p className="text-white/40 text-lg max-w-md leading-relaxed">
                Premium residential contracting for roofing, remodels, and outdoor living projects.
              </p>
              <div className="flex gap-4 pt-2">
                <div className="px-6 py-3.5 rounded-xl bg-amber-500 text-white font-medium">
                  Free Estimate
                </div>
                <div className="px-6 py-3.5 rounded-xl border border-white/15 text-white/60 font-medium">
                  View Our Work
                </div>
              </div>
            </div>
            
            {/* Feature cards at bottom */}
            <div className="absolute bottom-8 right-8 hidden lg:flex gap-3">
              {["Roofing", "Remodels", "Outdoor"].map((item) => (
                <div key={item} className="px-4 py-3 bg-white/[0.03] border border-white/[0.06] rounded-xl">
                  <div className="w-8 h-8 rounded-lg bg-white/[0.05] mb-2" />
                  <span className="text-white/50 text-xs font-medium">{item}</span>
                </div>
              ))}
            </div>
            
            {/* Built by Mountline badge */}
            <div className="absolute bottom-6 left-8 flex items-center gap-2 px-3 py-2 bg-black/60 backdrop-blur rounded-lg text-[10px] font-medium text-white/40 border border-white/5">
              <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
                <span className="text-[8px] font-bold text-white/60">M</span>
              </div>
              Built by Mountline
            </div>
          </div>
        </motion.div>
        
        {/* Floating system cards showing the flow */}
        
        {/* Card 1: Lead Captured - top left */}
        <motion.div
          initial={{ opacity: 0, x: -60, y: 40 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 1.2 }}
          className="absolute -left-4 sm:-left-8 lg:-left-16 top-24 sm:top-28 lg:top-32"
        >
          <div className="flex items-center gap-4 px-5 py-4 bg-card border border-foreground/[0.08] rounded-2xl shadow-2xl shadow-foreground/[0.03]">
            <motion.div 
              className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.5, type: "spring", stiffness: 200 }}
            >
              <Check className="w-5 h-5 text-green-500" />
            </motion.div>
            <div>
              <div className="text-base font-semibold text-foreground">Lead Captured</div>
              <div className="text-sm text-foreground/50">Roofing quote request</div>
            </div>
          </div>
          <div className="mt-2 ml-4 text-[10px] text-foreground/30 uppercase tracking-wider font-medium">
            Step 1: Form submitted
          </div>
        </motion.div>
        
        {/* Card 2: Portal Preview - top right */}
        <motion.div
          initial={{ opacity: 0, x: 60, y: -40 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 1.5 }}
          className="absolute -right-4 sm:-right-8 lg:-right-12 top-8 sm:top-12 lg:top-16 w-56 sm:w-64 lg:w-72"
        >
          <div className="rounded-2xl border border-foreground/[0.08] bg-card shadow-2xl shadow-foreground/[0.03] overflow-hidden">
            <div className="px-4 py-3 border-b border-foreground/[0.06] bg-foreground/[0.01]">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-foreground flex items-center justify-center">
                  <span className="text-background text-[10px] font-bold">M</span>
                </div>
                <span className="text-sm font-medium text-foreground">Client Portal</span>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground/50">Status</span>
                <span className="px-2.5 py-1 rounded-lg bg-green-500/10 text-green-500 text-[10px] font-medium">In Progress</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground/50">Preview</span>
                <div className="flex items-center gap-1.5">
                  <ExternalLink className="w-3 h-3 text-foreground/40" />
                  <span className="text-xs text-foreground/60">Live</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-foreground/50">Paid</span>
                <span className="text-xs text-foreground/70 font-medium">$1,250 / $2,500</span>
              </div>
              <div className="pt-2 border-t border-foreground/[0.06]">
                <div className="text-[10px] text-foreground/40 uppercase tracking-wider mb-2">Next Step</div>
                <div className="text-xs text-foreground/70">Review homepage draft</div>
              </div>
            </div>
          </div>
          <div className="mt-2 mr-4 text-right text-[10px] text-foreground/30 uppercase tracking-wider font-medium">
            Step 2: Portal access
          </div>
        </motion.div>
        
        {/* Card 3: Support Message - bottom left */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.8 }}
          className="absolute -left-2 sm:-left-4 lg:-left-8 bottom-16 sm:bottom-20 lg:bottom-24"
        >
          <div className="flex items-start gap-3 px-4 py-3.5 bg-card border border-foreground/[0.08] rounded-2xl shadow-2xl shadow-foreground/[0.03] max-w-[220px]">
            <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 border border-foreground/10">
              <span className="text-foreground/60 text-[10px] font-bold">M</span>
            </div>
            <div>
              <div className="text-sm font-medium text-foreground mb-1">Mountline</div>
              <div className="text-xs text-foreground/50 leading-relaxed">
                Homepage is ready for your review. Let me know if you want changes!
              </div>
            </div>
          </div>
          <div className="mt-2 ml-4 text-[10px] text-foreground/30 uppercase tracking-wider font-medium">
            Step 3: Support chat
          </div>
        </motion.div>
        
        {/* Card 4: Ready to Launch - bottom right */}
        <motion.div
          initial={{ opacity: 0, x: 40, y: 40 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          transition={{ duration: 0.8, delay: 2.1 }}
          className="absolute -right-2 sm:-right-4 lg:-right-6 -bottom-2 sm:bottom-4 lg:bottom-8"
        >
          <div className="flex items-center gap-4 px-5 py-4 bg-card border border-foreground/[0.08] rounded-2xl shadow-2xl shadow-foreground/[0.03]">
            <div className="w-11 h-11 rounded-full bg-foreground/5 flex items-center justify-center border border-foreground/10">
              <Rocket className="w-5 h-5 text-foreground/60" />
            </div>
            <div>
              <div className="text-base font-semibold text-foreground">Ready to Launch</div>
              <div className="text-sm text-foreground/45">Final payment received</div>
            </div>
          </div>
          <div className="mt-2 mr-4 text-right text-[10px] text-foreground/30 uppercase tracking-wider font-medium">
            Step 4: Go live
          </div>
        </motion.div>
      </div>
      
      {/* System flow tagline */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 2.6, duration: 0.6 }}
        className="flex items-center justify-center gap-4 mt-20 sm:mt-24 lg:mt-28"
      >
        <div className="h-px w-16 bg-gradient-to-r from-transparent to-foreground/15" />
        <span className="text-xs text-foreground/40 uppercase tracking-widest font-medium">
          Website to launch, all in one system
        </span>
        <div className="h-px w-16 bg-gradient-to-l from-transparent to-foreground/15" />
      </motion.div>
    </motion.div>
  )
}

export function Hero3DStage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden py-12">
      {/* Background */}
      <PremiumGrid />
      
      {/* Main content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 lg:pt-32 pb-8">
        {/* Eyebrow */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-8"
        >
          <span className="inline-flex items-center gap-4 text-sm font-medium text-foreground/40 tracking-wide">
            <span className="w-10 h-px bg-foreground/15" />
            Small team. Serious standards.
            <span className="w-10 h-px bg-foreground/15" />
          </span>
        </motion.div>
        
        {/* Main headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1 }}
          className="text-center text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground tracking-tight leading-[0.92] mb-8 max-w-5xl mx-auto"
        >
          <span className="block">Websites people trust</span>
          <span className="block text-foreground/30">before they ever call.</span>
        </motion.h1>
        
        {/* Subheadline */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-center text-lg sm:text-xl text-foreground/50 leading-relaxed max-w-2xl mx-auto mb-12"
        >
          Mountline Studio builds clean websites, client portals, and practical systems for businesses that need a stronger first impression and smoother customer action.
        </motion.p>
        
        {/* CTAs */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20 sm:mb-24 lg:mb-28"
        >
          <motion.button
            onClick={() => scrollToSection('contact')}
            className="group inline-flex items-center gap-3 px-8 py-4.5 bg-foreground text-background font-medium rounded-xl hover:bg-foreground/90 transition-all text-base"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            Book a website review
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
          <motion.button
            onClick={() => scrollToSection('work')}
            className="inline-flex items-center gap-3 px-8 py-4.5 border border-foreground/10 font-medium rounded-xl hover:bg-foreground/[0.03] hover:border-foreground/20 transition-all text-base text-foreground/70"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            See concept builds
          </motion.button>
        </motion.div>
        
        {/* Cinematic centerpiece */}
        <SystemCenterpiece />
      </div>
      
      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
