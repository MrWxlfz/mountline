"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Check, MessageSquare, CreditCard, Clock, Bell } from "lucide-react"

// Animated grid background
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Base grid */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.06]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path d="M 60 0 L 0 0 0 60" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-foreground" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      
      {/* Animated vertical lines */}
      <div className="absolute inset-0">
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute top-0 w-px bg-gradient-to-b from-transparent via-accent/20 to-transparent"
            style={{ left: `${12 + i * 12}%`, height: '100%' }}
            initial={{ opacity: 0, scaleY: 0 }}
            animate={{ 
              opacity: [0, 0.5, 0],
              scaleY: [0, 1, 0],
            }}
            transition={{
              duration: 4,
              delay: i * 0.3,
              repeat: Infinity,
              repeatDelay: 2,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-50" />
    </div>
  )
}

// Mountline mountain motif
function MountainMotif() {
  return (
    <motion.svg
      className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-[0.03]"
      viewBox="0 0 200 200"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 0.03, scale: 1 }}
      transition={{ duration: 1.5 }}
    >
      {/* Mountain peak lines */}
      <motion.path
        d="M 100 40 L 60 100 L 100 80 L 140 100 Z"
        stroke="currentColor"
        strokeWidth="0.5"
        fill="none"
        className="text-foreground"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.5 }}
      />
      <motion.path
        d="M 100 60 L 70 110 L 100 95 L 130 110 Z"
        stroke="currentColor"
        strokeWidth="0.3"
        fill="none"
        className="text-foreground"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 2, delay: 0.8 }}
      />
      {/* Vertical line */}
      <motion.line
        x1="100" y1="40" x2="100" y2="160"
        stroke="currentColor"
        strokeWidth="0.5"
        className="text-foreground"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, delay: 1 }}
      />
    </motion.svg>
  )
}

// Website preview mockup
function WebsitePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, rotateX: 15 }}
      animate={{ opacity: 1, y: 0, rotateX: 0 }}
      transition={{ duration: 1, delay: 0.4 }}
      className="relative"
      style={{ perspective: "1200px" }}
    >
      {/* Main browser window */}
      <div className="relative w-full max-w-[520px] rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Browser chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <div className="w-3 h-3 rounded-full bg-green-400/80" />
          </div>
          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-md text-xs text-muted-foreground border border-border/50">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              ridgewaycontracting.com
            </div>
          </div>
        </div>
        
        {/* Website content - Contractor theme */}
        <div className="relative p-5 bg-gradient-to-b from-stone-900 to-stone-800 min-h-[280px]">
          {/* Mock nav */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 font-bold text-xs">R</span>
              </div>
              <span className="text-white/90 font-semibold text-sm">RIDGEWAY</span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-white/40 text-xs hidden sm:block">Services</span>
              <span className="text-white/40 text-xs hidden sm:block">Gallery</span>
              <div className="px-3 py-1.5 rounded bg-amber-500 text-white text-xs font-medium">
                Get Estimate
              </div>
            </div>
          </div>
          
          {/* Hero content */}
          <div className="space-y-4">
            <div className="inline-block px-2 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-medium uppercase tracking-wider">
              Trusted Since 2008
            </div>
            <h3 className="text-white text-xl sm:text-2xl font-bold leading-tight">
              Build Something
              <br />
              <span className="text-white/60">That Lasts</span>
            </h3>
            <p className="text-white/50 text-xs max-w-[280px]">
              Premium residential contracting for roofing, remodels, and outdoor projects.
            </p>
            <div className="flex gap-3 pt-2">
              <div className="px-4 py-2 rounded-lg bg-amber-500 text-white text-xs font-medium">
                Free Estimate
              </div>
              <div className="px-4 py-2 rounded-lg border border-white/20 text-white/80 text-xs font-medium">
                View Work
              </div>
            </div>
          </div>
          
          {/* Concept label */}
          <div className="absolute top-3 right-3 px-2 py-1 bg-black/40 backdrop-blur rounded text-[9px] font-medium text-white/70">
            Concept Build
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Mobile preview overlay
function MobilePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40, y: 40 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.8, delay: 0.9 }}
      className="absolute -right-2 sm:-right-6 -bottom-8 sm:-bottom-12 w-24 sm:w-32 rounded-2xl border border-border bg-card shadow-xl overflow-hidden"
    >
      <div className="p-1.5 bg-muted/50 border-b border-border">
        <div className="w-10 h-1 rounded bg-muted-foreground/30 mx-auto" />
      </div>
      <div className="p-3 bg-gradient-to-b from-stone-900 to-stone-800">
        <div className="space-y-2">
          <div className="w-full h-3 rounded bg-white/25" />
          <div className="w-2/3 h-3 rounded bg-white/25" />
          <div className="w-full h-7 rounded bg-amber-500 mt-4 flex items-center justify-center">
            <span className="text-white text-[8px] font-medium">Get Quote</span>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Floating portal preview card
function PortalPreviewCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -30, y: -20 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.7, delay: 1.1 }}
      className="absolute -left-4 sm:-left-8 top-16 sm:top-20 w-44 sm:w-52 rounded-xl border border-border bg-card shadow-lg overflow-hidden"
    >
      <div className="px-3 py-2 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded bg-accent/10 flex items-center justify-center">
            <span className="text-accent text-[8px] font-bold">M</span>
          </div>
          <span className="text-[10px] font-medium text-foreground">Client Portal</span>
        </div>
      </div>
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">Project Status</span>
          <span className="ml-auto px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-[8px] font-medium">On Track</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">Support Chat</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-accent" />
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">Payments</span>
          <span className="ml-auto text-[8px] text-muted-foreground">$2,400</span>
        </div>
      </div>
    </motion.div>
  )
}

// Floating lead captured card
function LeadCapturedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.4 }}
      className="absolute -left-2 sm:-left-4 bottom-4 sm:bottom-8 flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg"
    >
      <motion.div 
        className="w-6 h-6 rounded-full bg-green-500/10 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.6, type: "spring" }}
      >
        <Check className="w-3 h-3 text-green-600 dark:text-green-400" />
      </motion.div>
      <div>
        <span className="text-[10px] font-medium text-foreground block">Lead Captured</span>
        <span className="text-[8px] text-muted-foreground">Roofing quote request</span>
      </div>
    </motion.div>
  )
}

// Notification card
function NotificationCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20, y: -10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.5, delay: 1.6 }}
      className="absolute right-0 sm:-right-4 top-0 sm:-top-4 flex items-center gap-2 px-3 py-2 bg-card border border-border rounded-lg shadow-lg"
    >
      <Bell className="w-3.5 h-3.5 text-accent" />
      <span className="text-[9px] font-medium text-foreground">New message from client</span>
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
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 80])

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
      className="relative min-h-screen flex flex-col justify-center overflow-hidden"
    >
      {/* Animated background */}
      <AnimatedGrid />
      <MountainMotif />
      
      {/* Subtle radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/[0.02] rounded-full blur-3xl pointer-events-none" />
      
      {/* Main content */}
      <motion.div 
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 pb-16 sm:pb-20"
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
            
            {/* Main headline - Large editorial type */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground tracking-tight leading-[0.95] mb-6"
            >
              <span className="block">Websites people</span>
              <span className="block">trust before they</span>
              <span className="block text-muted-foreground/60">ever call.</span>
            </motion.h1>
            
            {/* Subheadline - Updated per brief */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mb-8"
            >
              Mountline Studio builds clean websites, client portals, and practical systems for businesses that need a stronger first impression and smoother customer action.
            </motion.p>
            
            {/* CTAs - Updated per brief */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-10"
            >
              <motion.button
                onClick={() => scrollToSection('contact')}
                className="group inline-flex items-center gap-2 px-6 py-3.5 bg-foreground text-background font-medium rounded-lg hover:bg-foreground/90 transition-all hover:shadow-lg"
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
              >
                Book a website review
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('work')}
                className="inline-flex items-center gap-2 px-6 py-3.5 border border-border font-medium rounded-lg hover:bg-muted/50 hover:border-foreground/20 transition-all"
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
                  className="px-3 py-1.5 text-xs text-muted-foreground border border-border rounded-full hover:border-foreground/30 hover:text-foreground/80 transition-colors cursor-default"
                >
                  {chip}
                </motion.span>
              ))}
            </motion.div>
          </div>
          
          {/* Right column - Layered preview composition */}
          <div className="hidden lg:block relative">
            <div className="relative">
              <WebsitePreview />
              <MobilePreview />
              <PortalPreviewCard />
              <LeadCapturedCard />
              <NotificationCard />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
