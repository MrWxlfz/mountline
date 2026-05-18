"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Check, MessageSquare, CreditCard, Clock, Bell, ExternalLink } from "lucide-react"

// Animated grid background
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
      
      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background opacity-50" />
    </div>
  )
}

// Main website preview - larger and more impactful
function WebsitePreview() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.3 }}
      className="relative"
    >
      {/* Main browser window */}
      <div className="relative w-full max-w-[560px] rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
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
        <div className="relative p-6 bg-gradient-to-b from-stone-900 to-stone-800 min-h-[300px]">
          {/* Mock nav */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 font-bold text-sm">R</span>
              </div>
              <span className="text-white/90 font-semibold">RIDGEWAY</span>
            </div>
            <div className="flex items-center gap-5">
              <span className="text-white/40 text-xs hidden sm:block">Services</span>
              <span className="text-white/40 text-xs hidden sm:block">Gallery</span>
              <span className="text-white/40 text-xs hidden sm:block">About</span>
              <div className="px-4 py-2 rounded-lg bg-amber-500 text-white text-xs font-medium">
                Get Estimate
              </div>
            </div>
          </div>
          
          {/* Hero content */}
          <div className="space-y-5">
            <div className="inline-block px-2.5 py-1 rounded bg-amber-500/20 text-amber-400 text-[10px] font-medium uppercase tracking-wider">
              Trusted Since 2008
            </div>
            <h3 className="text-white text-2xl sm:text-3xl font-bold leading-tight">
              Build Something
              <br />
              <span className="text-white/60">That Lasts</span>
            </h3>
            <p className="text-white/50 text-sm max-w-[320px]">
              Premium residential contracting for roofing, remodels, and outdoor projects in the greater area.
            </p>
            <div className="flex gap-3 pt-2">
              <div className="px-5 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium">
                Free Estimate
              </div>
              <div className="px-5 py-2.5 rounded-lg border border-white/20 text-white/80 text-sm font-medium">
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

// Floating portal preview card - positioned to show connection
function PortalPreviewCard() {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20, y: -10 }}
      animate={{ opacity: 1, x: 0, y: 0 }}
      transition={{ duration: 0.6, delay: 0.8 }}
      className="absolute -left-4 sm:-left-8 top-24 sm:top-28 w-48 sm:w-56 rounded-xl border border-border bg-card shadow-xl overflow-hidden"
    >
      <div className="px-3 py-2.5 border-b border-border bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded bg-foreground flex items-center justify-center">
            <span className="text-background text-[9px] font-bold">M</span>
          </div>
          <div>
            <span className="text-[10px] font-semibold text-foreground block leading-tight">Client Portal</span>
            <span className="text-[8px] text-muted-foreground">Ridgeway Contracting</span>
          </div>
        </div>
      </div>
      <div className="p-3 space-y-2.5">
        <div className="flex items-center gap-2">
          <Clock className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">Project Status</span>
          <span className="ml-auto px-1.5 py-0.5 rounded bg-green-500/10 text-green-600 dark:text-green-400 text-[8px] font-medium">On Track</span>
        </div>
        <div className="flex items-center gap-2">
          <MessageSquare className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">Messages</span>
          <span className="ml-auto w-4 h-4 rounded-full bg-accent text-accent-foreground text-[8px] flex items-center justify-center font-medium">2</span>
        </div>
        <div className="flex items-center gap-2">
          <CreditCard className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">Payments</span>
          <span className="ml-auto text-[8px] text-foreground font-medium">$2,400</span>
        </div>
        <div className="flex items-center gap-2">
          <ExternalLink className="w-3 h-3 text-muted-foreground" />
          <span className="text-[9px] text-muted-foreground">Preview Site</span>
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-green-500" />
        </div>
      </div>
    </motion.div>
  )
}

// Lead captured notification
function LeadCapturedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 1.1 }}
      className="absolute -left-2 sm:-left-4 bottom-8 sm:bottom-12 flex items-center gap-2.5 px-3.5 py-2.5 bg-card border border-border rounded-xl shadow-lg"
    >
      <motion.div 
        className="w-7 h-7 rounded-full bg-green-500/10 flex items-center justify-center"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1.3, type: "spring" }}
      >
        <Check className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />
      </motion.div>
      <div>
        <span className="text-[11px] font-medium text-foreground block">Lead Captured</span>
        <span className="text-[9px] text-muted-foreground">Roofing estimate request</span>
      </div>
    </motion.div>
  )
}

// New message notification
function MessageNotification() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 1.4 }}
      className="absolute right-0 sm:-right-4 -top-2 sm:-top-4 flex items-center gap-2.5 px-3.5 py-2.5 bg-card border border-border rounded-xl shadow-lg"
    >
      <Bell className="w-4 h-4 text-foreground" />
      <span className="text-[10px] font-medium text-foreground">New client message</span>
    </motion.div>
  )
}

// Connection line visual
function ConnectionLine() {
  return (
    <motion.svg
      className="absolute top-32 -left-12 w-16 h-24 hidden lg:block"
      initial={{ opacity: 0 }}
      animate={{ opacity: 0.3 }}
      transition={{ delay: 1 }}
    >
      <motion.path
        d="M 60 0 C 60 40, 0 40, 0 80"
        stroke="currentColor"
        strokeWidth="1"
        fill="none"
        className="text-border"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1, delay: 0.8 }}
      />
    </motion.svg>
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
      
      {/* Subtle radial gradient */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/[0.015] rounded-full blur-3xl pointer-events-none" />
      
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
            
            {/* Main headline */}
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
            
            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-lg mb-8"
            >
              Mountline Studio builds premium websites, private client portals, and practical systems for businesses that need a stronger first impression and smoother customer action.
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
            <div className="relative ml-8">
              <ConnectionLine />
              <WebsitePreview />
              <PortalPreviewCard />
              <LeadCapturedCard />
              <MessageNotification />
            </div>
          </div>
        </div>
      </motion.div>
      
      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent pointer-events-none" />
    </section>
  )
}
