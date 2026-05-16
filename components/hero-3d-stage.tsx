"use client"

import { motion, useScroll, useTransform } from "framer-motion"
import { useRef } from "react"
import { ArrowRight, Check, MessageSquare, Smartphone, Zap, Calendar, Shield } from "lucide-react"
import { NorthlinePattern } from "./northline-logo"

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
    "Websites",
    "Landing pages", 
    "Quote flows",
    "Booking systems",
    "Monthly support"
  ]

  return (
    <section 
      ref={containerRef}
      className="relative min-h-screen overflow-hidden pt-20 pb-24 lg:pt-24 lg:pb-32"
    >
      {/* Background layers */}
      <div className="absolute inset-0 bg-background" />
      <NorthlinePattern className="absolute inset-0" opacity={0.03} />
      
      {/* Subtle gradient orb */}
      <motion.div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-accent/5 blur-3xl animate-glow-pulse"
        style={{ y, opacity }}
      />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main hero content */}
        <div className="text-center max-w-4xl mx-auto pt-12 lg:pt-20 mb-16 lg:mb-24">
          {/* Eyebrow */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8"
          >
            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
            <span className="text-sm font-medium text-muted-foreground">Small team. Clean work. Straight answers.</span>
          </motion.div>
          
          {/* Headline */}
          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-foreground tracking-tight leading-[1.05] text-balance mb-6"
          >
            Websites that make your business{" "}
            <span className="relative">
              <span className="relative z-10">impossible to overlook</span>
              <motion.span 
                className="absolute bottom-2 left-0 right-0 h-3 bg-accent/20 -z-0"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ transformOrigin: "left" }}
              />
            </span>
          </motion.h1>
          
          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto mb-10"
          >
            northline builds clean websites, landing pages, and practical digital systems for businesses that need a stronger first impression and more customer action.
          </motion.p>
          
          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
          >
            <motion.button
              onClick={() => scrollToSection('contact')}
              className="group w-full sm:w-auto btn-primary flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Book a website review
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
            <motion.button
              onClick={() => scrollToSection('pricing')}
              className="w-full sm:w-auto btn-secondary"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              See packages
            </motion.button>
          </motion.div>
          
          {/* Trust chips */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-3"
          >
            {trustChips.map((item, i) => (
              <motion.span 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.5 + i * 0.05 }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/50 border border-border text-sm text-muted-foreground"
              >
                <Check className="w-3.5 h-3.5 text-accent" />
                {item}
              </motion.span>
            ))}
          </motion.div>
        </div>
        
        {/* Premium website preview composition */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-5xl mx-auto"
        >
          {/* Main desktop browser */}
          <div className="relative">
            <motion.div 
              className="card-premium overflow-hidden"
              whileHover={{ y: -4 }}
              transition={{ duration: 0.4 }}
            >
              {/* Browser chrome */}
              <div className="flex items-center gap-3 px-4 py-3 bg-secondary/50 border-b border-border">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
                  <div className="w-3 h-3 rounded-full bg-green-400/80" />
                </div>
                <div className="flex-1 max-w-md mx-auto">
                  <div className="bg-background rounded-lg px-4 py-1.5 text-xs text-muted-foreground border border-border text-center font-mono">
                    premiumautodetail.com
                  </div>
                </div>
                <div className="w-16" />
              </div>
              
              {/* Website content preview */}
              <div className="aspect-[16/9] bg-gradient-to-br from-background to-secondary/30 p-6 sm:p-8 lg:p-12">
                {/* Mock site layout */}
                <div className="h-full flex flex-col">
                  {/* Mock nav */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-foreground/90" />
                      <div className="w-24 h-4 rounded bg-foreground/80" />
                    </div>
                    <div className="hidden sm:flex items-center gap-6">
                      <div className="w-16 h-3 rounded bg-muted-foreground/40" />
                      <div className="w-16 h-3 rounded bg-muted-foreground/40" />
                      <div className="w-16 h-3 rounded bg-muted-foreground/40" />
                      <div className="w-24 h-8 rounded-lg bg-accent" />
                    </div>
                  </div>
                  
                  {/* Mock hero content */}
                  <div className="flex-1 flex items-center">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
                      <div className="space-y-4">
                        <div className="w-4/5 h-8 rounded bg-foreground/85" />
                        <div className="w-full h-6 rounded bg-foreground/70" />
                        <div className="space-y-2 pt-2">
                          <div className="w-full h-3 rounded bg-muted-foreground/30" />
                          <div className="w-4/5 h-3 rounded bg-muted-foreground/30" />
                        </div>
                        <div className="flex gap-3 pt-4">
                          <div className="w-32 h-11 rounded-lg bg-accent" />
                          <div className="w-28 h-11 rounded-lg bg-secondary border border-border" />
                        </div>
                      </div>
                      <div className="hidden lg:block">
                        <div className="w-full h-48 rounded-xl bg-gradient-to-br from-secondary to-muted/50 border border-border" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
            
            {/* Mobile preview - floating */}
            <motion.div
              initial={{ opacity: 0, x: 40, y: 20 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="absolute -right-4 sm:right-4 lg:right-12 bottom-8 sm:bottom-12 w-[100px] sm:w-[140px] lg:w-[180px]"
            >
              <motion.div 
                className="card-premium overflow-hidden"
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                {/* Phone notch */}
                <div className="h-5 bg-secondary/50 flex items-center justify-center border-b border-border">
                  <div className="w-16 h-3 rounded-full bg-foreground/20" />
                </div>
                {/* Phone content */}
                <div className="aspect-[9/16] bg-gradient-to-br from-background to-secondary/30 p-3">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 rounded bg-foreground/80" />
                      <div className="w-14 h-2.5 rounded bg-foreground/70" />
                    </div>
                    <div className="w-full h-3 rounded bg-foreground/60" />
                    <div className="w-4/5 h-3 rounded bg-foreground/60" />
                    <div className="w-full h-2 rounded bg-muted-foreground/30" />
                    <div className="w-3/4 h-2 rounded bg-muted-foreground/30" />
                    <div className="w-full h-8 rounded-lg bg-accent mt-4" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
            
            {/* Floating feature callouts */}
            <FeatureCallout
              icon={<Check className="w-4 h-4 text-emerald-500" />}
              label="Clear services"
              position="-left-4 lg:-left-8 top-1/4"
              delay={0.9}
              bgColor="bg-emerald-500/10"
            />
            
            <FeatureCallout
              icon={<MessageSquare className="w-4 h-4 text-blue-500" />}
              label="Quote ready"
              position="-left-2 lg:left-4 top-1/2"
              delay={1.0}
              bgColor="bg-blue-500/10"
            />
            
            <FeatureCallout
              icon={<Smartphone className="w-4 h-4 text-violet-500" />}
              label="Mobile-first"
              position="left-[15%] -bottom-4"
              delay={1.1}
              bgColor="bg-violet-500/10"
              className="hidden sm:flex"
            />
            
            <FeatureCallout
              icon={<Zap className="w-4 h-4 text-amber-500" />}
              label="Fast launch"
              position="right-[25%] lg:right-[30%] -bottom-4"
              delay={1.2}
              bgColor="bg-amber-500/10"
              className="hidden sm:flex"
            />
            
            <FeatureCallout
              icon={<Calendar className="w-4 h-4 text-rose-500" />}
              label="Booking flow"
              position="-right-2 lg:right-[22%] top-1/3"
              delay={1.3}
              bgColor="bg-rose-500/10"
              className="hidden lg:flex"
            />
            
            <FeatureCallout
              icon={<Shield className="w-4 h-4 text-cyan-500" />}
              label="Ongoing care"
              position="-right-4 lg:right-[18%] top-2/3"
              delay={1.4}
              bgColor="bg-cyan-500/10"
              className="hidden lg:flex"
            />
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function FeatureCallout({ 
  icon, 
  label, 
  position, 
  delay,
  bgColor,
  className = ""
}: { 
  icon: React.ReactNode
  label: string
  position: string
  delay: number
  bgColor: string
  className?: string
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      className={`absolute ${position} ${className}`}
    >
      <motion.div 
        className="glass-card px-3 py-2 flex items-center gap-2 shadow-lg"
        whileHover={{ scale: 1.05 }}
        transition={{ duration: 0.2 }}
      >
        <div className={`w-7 h-7 rounded-lg ${bgColor} flex items-center justify-center`}>
          {icon}
        </div>
        <span className="text-sm font-medium text-foreground whitespace-nowrap">{label}</span>
      </motion.div>
    </motion.div>
  )
}
