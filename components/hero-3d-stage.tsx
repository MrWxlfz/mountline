"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Check, Globe, Smartphone, MessageSquare, Zap, Calendar, ArrowUpRight } from "lucide-react"

export function Hero3DStage() {
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"]
  })
  
  const y = useTransform(scrollYProgress, [0, 1], [0, 100])
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const trustChips = [
    { label: "Websites", icon: Globe },
    { label: "Landing pages", icon: Globe },
    { label: "Quote flows", icon: MessageSquare },
    { label: "Booking systems", icon: Calendar },
    { label: "Monthly support", icon: Zap },
  ]

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen overflow-hidden"
    >
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-background">
        <AnimatedGrid />
      </div>
      
      {/* Subtle gradient accent */}
      <motion.div 
        className="absolute top-1/3 right-0 w-[600px] h-[600px] rounded-full bg-accent/[0.03] blur-[100px]"
        style={{ y, opacity }}
      />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-36 pb-20 lg:pb-32">
        {/* Main grid - Editorial split layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left column - Copy */}
          <div className="lg:col-span-6 xl:col-span-5">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center gap-2 mb-8"
            >
              <span className="w-8 h-px bg-accent" />
              <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                Small team. Serious work.
              </span>
            </motion.div>
            
            {/* Headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[3.5rem] xl:text-6xl font-bold text-foreground tracking-tight leading-[1.08] mb-6"
            >
              Websites people trust{" "}
              <span className="relative inline-block">
                <span className="relative z-10">before they ever call.</span>
                <motion.span 
                  className="absolute -bottom-1 left-0 right-0 h-3 bg-accent/15"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.8 }}
                  style={{ transformOrigin: "left" }}
                />
              </span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-lg sm:text-xl text-muted-foreground leading-relaxed mb-10 max-w-xl"
            >
              northline builds clean websites, landing pages, and practical digital systems for businesses that need a stronger first impression and more customer action.
            </motion.p>
            
            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-start gap-4 mb-12"
            >
              <motion.button
                onClick={() => scrollToSection('contact')}
                className="group btn-primary flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Book a website review
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('work')}
                className="btn-secondary flex items-center gap-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                See the work
              </motion.button>
            </motion.div>
            
            {/* Trust chips */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="flex flex-wrap items-center gap-2"
            >
              {trustChips.map((item, i) => (
                <motion.span 
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-border bg-card/50 text-sm text-muted-foreground hover:border-border-strong hover:bg-card transition-colors"
                >
                  <Check className="w-3.5 h-3.5 text-accent" />
                  {item.label}
                </motion.span>
              ))}
            </motion.div>
          </div>
          
          {/* Right column - Visual composition */}
          <div className="lg:col-span-6 xl:col-span-7">
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              {/* Main website preview */}
              <div className="relative">
                <WebsitePreview />
                
                {/* Mobile preview floating */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.7 }}
                  className="absolute -left-4 sm:left-4 lg:-left-8 bottom-8 sm:bottom-16 w-[110px] sm:w-[140px]"
                >
                  <MobilePreview />
                </motion.div>
                
                {/* Quote flow card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.9 }}
                  className="absolute -right-2 sm:right-8 top-12 sm:top-20"
                >
                  <QuoteFlowCard />
                </motion.div>
                
                {/* Stats card */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 1.1 }}
                  className="absolute right-4 sm:right-12 -bottom-4 sm:bottom-8 hidden sm:block"
                >
                  <StatsCard />
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
      
      {/* Bottom border line */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
    </section>
  )
}

// Animated grid background
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Horizontal lines */}
      <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none">
        <defs>
          <pattern id="hero-grid" width="60" height="60" patternUnits="userSpaceOnUse">
            <path 
              d="M 60 0 L 0 0 0 60" 
              fill="none" 
              className="stroke-border/40" 
              strokeWidth="0.5"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-grid)" />
      </svg>
      
      {/* Animated vertical line accent */}
      <motion.div
        className="absolute left-1/4 top-0 w-px h-full bg-gradient-to-b from-transparent via-accent/20 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
      />
      <motion.div
        className="absolute right-1/3 top-0 w-px h-full bg-gradient-to-b from-transparent via-accent/10 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 0.7 }}
      />
    </div>
  )
}

// Main website preview component
function WebsitePreview() {
  return (
    <motion.div 
      className="relative rounded-2xl overflow-hidden border border-border bg-card shadow-2xl shadow-foreground/5"
      whileHover={{ y: -4 }}
      transition={{ duration: 0.4 }}
    >
      {/* Browser chrome */}
      <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-foreground/10 hover:bg-red-400/80 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-foreground/10 hover:bg-yellow-400/80 transition-colors" />
          <div className="w-3 h-3 rounded-full bg-foreground/10 hover:bg-green-400/80 transition-colors" />
        </div>
        <div className="flex-1 max-w-sm mx-auto">
          <div className="bg-background rounded-lg px-4 py-1.5 text-xs text-muted-foreground border border-border text-center font-mono flex items-center justify-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500/80" />
            premiumautodetail.com
          </div>
        </div>
        <div className="w-16" />
      </div>
      
      {/* Website content */}
      <div className="aspect-[16/10] bg-gradient-to-br from-background via-background to-muted/30 p-6 sm:p-8">
        {/* Nav */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background text-xs font-bold">PA</span>
            </div>
            <div className="w-28 h-4 rounded bg-foreground/80" />
          </div>
          <div className="hidden sm:flex items-center gap-4">
            <div className="w-14 h-3 rounded bg-muted-foreground/30" />
            <div className="w-14 h-3 rounded bg-muted-foreground/30" />
            <div className="w-14 h-3 rounded bg-muted-foreground/30" />
            <div className="w-20 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-[10px] text-accent-foreground font-medium">Get Quote</span>
            </div>
          </div>
        </div>
        
        {/* Hero content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <div className="w-[85%] h-7 rounded bg-foreground/90" />
            <div className="w-full h-5 rounded bg-foreground/70" />
            <div className="space-y-2 pt-1">
              <div className="w-full h-3 rounded bg-muted-foreground/25" />
              <div className="w-[80%] h-3 rounded bg-muted-foreground/25" />
            </div>
            <div className="flex gap-3 pt-3">
              <div className="w-28 h-10 rounded-lg bg-accent" />
              <div className="w-24 h-10 rounded-lg border border-border bg-card" />
            </div>
            {/* Trust badges */}
            <div className="flex gap-2 pt-2">
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div className="w-8 h-2 rounded bg-muted-foreground/30" />
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded bg-muted/50">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div className="w-10 h-2 rounded bg-muted-foreground/30" />
              </div>
            </div>
          </div>
          <div className="hidden lg:block">
            <div className="w-full h-40 rounded-xl bg-gradient-to-br from-muted/50 to-muted/20 border border-border/50 flex items-center justify-center">
              <div className="w-20 h-20 rounded-xl bg-foreground/5 border border-border/50" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Mobile preview component
function MobilePreview() {
  return (
    <motion.div 
      className="rounded-2xl overflow-hidden border border-border bg-card shadow-xl"
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      {/* Phone notch */}
      <div className="h-4 bg-muted/50 flex items-center justify-center border-b border-border">
        <div className="w-12 h-2 rounded-full bg-foreground/10" />
      </div>
      {/* Content */}
      <div className="aspect-[9/16] bg-gradient-to-br from-background to-muted/20 p-3">
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <div className="w-5 h-5 rounded bg-foreground" />
            <div className="w-12 h-2 rounded bg-foreground/70" />
          </div>
          <div className="w-full h-3 rounded bg-foreground/80" />
          <div className="w-[85%] h-3 rounded bg-foreground/60" />
          <div className="w-full h-2 rounded bg-muted-foreground/25 mt-2" />
          <div className="w-[70%] h-2 rounded bg-muted-foreground/25" />
          <div className="w-full h-7 rounded-lg bg-accent mt-3" />
          <div className="w-full h-7 rounded-lg border border-border bg-card" />
        </div>
      </div>
    </motion.div>
  )
}

// Quote flow card
function QuoteFlowCard() {
  return (
    <motion.div 
      className="w-[160px] sm:w-[180px] rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg p-3"
      whileHover={{ scale: 1.03 }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <MessageSquare className="w-4 h-4 text-emerald-500" />
        </div>
        <span className="text-xs font-medium text-foreground">Quote Request</span>
      </div>
      <div className="space-y-2">
        <div className="h-6 rounded bg-muted/50 border border-border" />
        <div className="h-6 rounded bg-muted/50 border border-border" />
        <div className="h-5 rounded-lg bg-accent flex items-center justify-center">
          <span className="text-[9px] text-accent-foreground font-medium">Submit</span>
        </div>
      </div>
    </motion.div>
  )
}

// Stats card
function StatsCard() {
  return (
    <motion.div 
      className="w-[140px] rounded-xl border border-border bg-card/95 backdrop-blur-sm shadow-lg p-3"
      whileHover={{ scale: 1.03 }}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-lg bg-accent/10 flex items-center justify-center">
          <ArrowUpRight className="w-3.5 h-3.5 text-accent" />
        </div>
        <span className="text-[10px] font-medium text-muted-foreground">This month</span>
      </div>
      <div className="text-2xl font-bold text-foreground mb-0.5">+47%</div>
      <div className="text-[10px] text-muted-foreground">More quote requests</div>
    </motion.div>
  )
}
