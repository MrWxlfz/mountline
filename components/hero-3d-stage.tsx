"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Check, MessageSquare, CreditCard, Clock, Bell, ExternalLink, Mail, Calendar } from "lucide-react"

// Subtle grid background
function GridBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Fine grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      
      {/* Radial gradient fade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,119,198,0.08),transparent)]" />
      
      {/* Bottom fade to black */}
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-background to-transparent" />
    </div>
  )
}

// Main website preview - the hero centerpiece
function HeroCenterpiece() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
      className="relative w-full max-w-5xl mx-auto"
    >
      {/* Glow effect behind */}
      <div className="absolute -inset-4 bg-gradient-to-b from-white/[0.03] to-transparent rounded-3xl blur-xl" />
      
      {/* Main browser frame */}
      <div className="relative rounded-2xl border border-border/60 bg-card/50 backdrop-blur-sm overflow-hidden shadow-2xl shadow-black/40">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-muted/20">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
            <div className="w-3 h-3 rounded-full bg-white/10" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-lg bg-background/60 border border-border/50">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground font-medium">ridgewaycontracting.com</span>
            </div>
          </div>
          <div className="w-20" />
        </div>
        
        {/* Website content - Premium contractor */}
        <div className="relative bg-gradient-to-b from-stone-900 via-stone-900 to-stone-950 p-8 sm:p-12 min-h-[400px] sm:min-h-[480px]">
          {/* Mock navigation */}
          <div className="flex items-center justify-between mb-12 sm:mb-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 font-bold text-lg">R</span>
              </div>
              <span className="text-white/90 font-semibold text-lg tracking-tight">RIDGEWAY</span>
            </div>
            <div className="hidden sm:flex items-center gap-8">
              <span className="text-white/40 text-sm">Services</span>
              <span className="text-white/40 text-sm">Portfolio</span>
              <span className="text-white/40 text-sm">About</span>
              <div className="px-5 py-2.5 rounded-lg bg-amber-500 text-white text-sm font-medium">
                Get Estimate
              </div>
            </div>
          </div>
          
          {/* Hero content */}
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-6"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span className="text-amber-400 text-xs font-medium uppercase tracking-wider">Trusted Since 2008</span>
            </motion.div>
            
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              className="text-white text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight mb-6"
            >
              Build Something
              <br />
              <span className="text-white/50">That Lasts</span>
            </motion.h2>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1 }}
              className="text-white/50 text-base sm:text-lg leading-relaxed mb-8 max-w-md"
            >
              Premium residential contracting for roofing, remodels, and outdoor living spaces in the greater metro area.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 1.1 }}
              className="flex flex-wrap gap-4"
            >
              <div className="px-6 py-3 rounded-lg bg-amber-500 text-white text-sm font-medium">
                Free Estimate
              </div>
              <div className="px-6 py-3 rounded-lg border border-white/20 text-white/80 text-sm font-medium">
                View Our Work
              </div>
            </motion.div>
          </div>
          
          {/* Floating service cards */}
          <div className="absolute bottom-8 right-8 hidden lg:grid grid-cols-2 gap-3 max-w-xs">
            {[
              { label: "Roofing", icon: "🏠" },
              { label: "Remodels", icon: "🔨" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 1.2 + i * 0.1 }}
                className="px-4 py-3 rounded-lg bg-white/5 border border-white/10 backdrop-blur-sm"
              >
                <span className="text-sm text-white/70">{item.label}</span>
              </motion.div>
            ))}
          </div>
          
          {/* Concept badge */}
          <div className="absolute top-4 right-4 px-2.5 py-1 rounded bg-black/60 backdrop-blur text-[10px] font-medium text-white/60 uppercase tracking-wider">
            Concept Build
          </div>
        </div>
      </div>
      
      {/* Floating Portal Card - Left */}
      <motion.div
        initial={{ opacity: 0, x: -40, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.8, delay: 1.2 }}
        className="absolute -left-4 sm:-left-12 top-32 sm:top-40 w-52 sm:w-64 rounded-xl border border-border bg-card shadow-2xl shadow-black/40 overflow-hidden hidden md:block"
      >
        <div className="px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-foreground flex items-center justify-center">
              <span className="text-background text-[10px] font-bold">M</span>
            </div>
            <div>
              <span className="text-xs font-semibold text-foreground block leading-tight">Client Portal</span>
              <span className="text-[10px] text-muted-foreground">Ridgeway Contracting</span>
            </div>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Status</span>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-green-500/10 text-green-500 text-[10px] font-medium">On Track</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Messages</span>
            </div>
            <span className="w-5 h-5 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-medium">2</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Paid</span>
            </div>
            <span className="text-[11px] text-foreground font-medium">$2,400</span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">Preview</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-green-500" />
          </div>
        </div>
      </motion.div>
      
      {/* Lead Captured - Bottom Left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 1.5 }}
        className="absolute -left-2 sm:left-8 -bottom-6 sm:bottom-8 flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-xl hidden sm:flex"
      >
        <motion.div 
          className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 1.7, type: "spring" }}
        >
          <Check className="w-4 h-4 text-green-500" />
        </motion.div>
        <div>
          <span className="text-xs font-medium text-foreground block">Lead Captured</span>
          <span className="text-[10px] text-muted-foreground">Roofing estimate request</span>
        </div>
      </motion.div>
      
      {/* New Message - Top Right */}
      <motion.div
        initial={{ opacity: 0, x: 20, y: -10 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.5, delay: 1.4 }}
        className="absolute -right-2 sm:-right-4 top-16 sm:top-20 flex items-center gap-2.5 px-4 py-2.5 bg-card border border-border rounded-xl shadow-xl hidden sm:flex"
      >
        <Bell className="w-4 h-4 text-foreground" />
        <span className="text-[11px] font-medium text-foreground">New client message</span>
      </motion.div>
      
      {/* Launch Checklist - Bottom Right */}
      <motion.div
        initial={{ opacity: 0, x: 40, y: 20 }}
        animate={{ opacity: 1, x: 0, y: 0 }}
        transition={{ duration: 0.6, delay: 1.6 }}
        className="absolute -right-4 sm:-right-8 bottom-20 sm:bottom-32 w-48 sm:w-52 rounded-xl border border-border bg-card shadow-xl hidden lg:block overflow-hidden"
      >
        <div className="px-3 py-2.5 border-b border-border bg-muted/30">
          <span className="text-[11px] font-semibold text-foreground">Launch Checklist</span>
        </div>
        <div className="p-3 space-y-2">
          {[
            { label: "Design approved", done: true },
            { label: "Content finalized", done: true },
            { label: "Domain connected", done: false },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded flex items-center justify-center ${item.done ? "bg-green-500/10" : "border border-border"}`}>
                {item.done && <Check className="w-2.5 h-2.5 text-green-500" />}
              </div>
              <span className={`text-[10px] ${item.done ? "text-muted-foreground line-through" : "text-foreground"}`}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
      
      {/* Connecting lines - SVG */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block" style={{ zIndex: -1 }}>
        {/* Line from portal card to browser */}
        <motion.path
          d="M 220 200 Q 280 200, 280 240"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          className="text-border"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 1, delay: 1.4 }}
        />
      </svg>
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
  const y = useTransform(scrollYProgress, [0, 0.5], [0, 100])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen flex flex-col overflow-hidden"
    >
      <GridBackground />
      
      {/* Content */}
      <motion.div 
        className="relative z-10 flex-1 flex flex-col justify-center pt-24 sm:pt-28 pb-12"
        style={{ opacity, y }}
      >
        {/* Text content */}
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="text-center mb-12 sm:mb-16">
            {/* Eyebrow */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mb-6"
            >
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <span className="w-6 h-px bg-border" />
                Small team. Serious standards.
                <span className="w-6 h-px bg-border" />
              </span>
            </motion.div>
            
            {/* Main headline */}
            <motion.h1 
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold text-foreground tracking-tight leading-[0.95] mb-6"
            >
              <span className="block">Websites people trust</span>
              <span className="block text-muted-foreground/50">before they ever call.</span>
            </motion.h1>
            
            {/* Subheadline */}
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto mb-10"
            >
              Mountline Studio builds premium websites, private client portals, and practical systems for businesses that need a stronger first impression.
            </motion.p>
            
            {/* CTAs */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                onClick={() => scrollToSection('contact')}
                className="group flex items-center gap-2 px-8 py-4 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Book a website review
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </motion.button>
              <motion.button
                onClick={() => scrollToSection('work')}
                className="flex items-center gap-2 px-8 py-4 border border-border font-medium rounded-full hover:bg-muted/50 hover:border-muted-foreground/30 transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                See concept builds
              </motion.button>
            </motion.div>
          </div>
          
          {/* Hero centerpiece */}
          <HeroCenterpiece />
        </div>
      </motion.div>
    </section>
  )
}
