"use client"

import { motion } from "framer-motion"
import { ArrowRight, Check, MessageSquare, CreditCard, Rocket } from "lucide-react"

// Subtle animated grid background
function AnimatedGrid() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Fine grid */}
      <div 
        className="absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
          backgroundSize: '80px 80px'
        }}
      />
      
      {/* Radial fade */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_0%,_black_70%)]" />
      
      {/* Subtle cyan glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1000px] h-[600px] bg-cyan-500/[0.015] blur-[150px] rounded-full pointer-events-none" />
    </div>
  )
}

// The Mountline Flow - main visual system
function MountlineFlow() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.12, delayChildren: 0.4 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.96 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] }
    }
  }

  return (
    <motion.div 
      className="relative w-full max-w-6xl mx-auto"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Central website preview */}
      <motion.div 
        variants={itemVariants}
        className="relative mx-auto max-w-4xl"
      >
        <div className="bg-[#080808] border border-white/[0.06] rounded-2xl overflow-hidden shadow-2xl shadow-black/60">
          {/* Browser chrome */}
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.04] bg-[#0a0a0a]">
            <div className="flex gap-2">
              <div className="w-3 h-3 rounded-full bg-white/[0.06]" />
              <div className="w-3 h-3 rounded-full bg-white/[0.06]" />
              <div className="w-3 h-3 rounded-full bg-white/[0.06]" />
            </div>
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 bg-white/[0.03] rounded-lg px-4 py-1.5 border border-white/[0.04]">
                <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
                <span className="text-xs text-white/30 font-mono">ridgewaycontracting.com</span>
              </div>
            </div>
          </div>
          
          {/* Website content */}
          <div className="aspect-[16/9] bg-gradient-to-br from-[#0c0c0c] to-[#111] p-8 lg:p-12 relative overflow-hidden">
            {/* Nav */}
            <div className="flex items-center justify-between mb-16">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-500 font-bold">R</span>
                </div>
                <span className="text-white/80 font-semibold tracking-wide">RIDGEWAY</span>
              </div>
              <div className="hidden sm:flex items-center gap-8">
                <span className="text-white/25 text-sm">Services</span>
                <span className="text-white/25 text-sm">Portfolio</span>
                <span className="text-white/25 text-sm">About</span>
                <div className="bg-amber-500 text-black px-5 py-2.5 rounded-lg text-sm font-semibold">
                  Get Quote
                </div>
              </div>
            </div>
            
            {/* Hero */}
            <div className="max-w-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-amber-500/10 border border-amber-500/15 rounded-lg mb-6">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span className="text-amber-500/90 text-xs font-medium uppercase tracking-wider">Trusted Since 2008</span>
              </div>
              <h3 className="text-white text-4xl lg:text-5xl font-bold leading-[1.1] mb-4">
                Build Something
                <span className="block text-white/25">That Lasts.</span>
              </h3>
              <p className="text-white/35 text-base lg:text-lg mb-8 max-w-md leading-relaxed">
                Premium residential contracting for roofing, remodels, and outdoor living.
              </p>
              <div className="flex gap-4">
                <div className="bg-amber-500 text-black px-6 py-3 rounded-lg font-semibold">
                  Free Estimate
                </div>
                <div className="border border-white/10 text-white/50 px-6 py-3 rounded-lg font-medium">
                  Our Work
                </div>
              </div>
            </div>
            
            {/* Decorative */}
            <div className="absolute right-12 top-1/2 -translate-y-1/3 w-64 h-64 border border-amber-500/10 rounded-2xl hidden lg:block" />
            <div className="absolute right-20 top-1/2 -translate-y-1/4 w-40 h-40 bg-amber-500/5 rounded-2xl hidden lg:block" />
          </div>
        </div>
      </motion.div>

      {/* Floating flow cards */}
      
      {/* Lead Captured - left */}
      <motion.div
        variants={itemVariants}
        className="absolute left-0 lg:-left-8 top-20 lg:top-28 z-10"
      >
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <Check className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <div className="text-[11px] text-white/30 uppercase tracking-wider mb-0.5">New lead</div>
              <div className="text-sm text-white font-medium">Kitchen remodel inquiry</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Portal Preview - right */}
      <motion.div
        variants={itemVariants}
        className="absolute right-0 lg:-right-4 top-8 lg:top-16 z-10 w-60 lg:w-64"
      >
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl overflow-hidden shadow-2xl shadow-black/50">
          <div className="px-4 py-3 border-b border-white/[0.04] flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-white/10 flex items-center justify-center">
              <span className="text-[9px] font-bold text-white/60">M</span>
            </div>
            <span className="text-xs font-medium text-white/60">Client Portal</span>
          </div>
          <div className="p-4 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-[11px] text-white/30">Status</span>
              <span className="text-[11px] text-emerald-400 font-medium">In Progress</span>
            </div>
            <div className="h-1.5 bg-white/[0.04] rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-gradient-to-r from-cyan-500/80 to-cyan-400/80 rounded-full" />
            </div>
            <div className="flex justify-between items-center pt-1">
              <span className="text-[11px] text-white/30">Next step</span>
              <span className="text-[11px] text-white/50">Review draft</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Support Chat - bottom left */}
      <motion.div
        variants={itemVariants}
        className="absolute left-4 lg:left-8 bottom-4 lg:bottom-8 z-10"
      >
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4 shadow-2xl shadow-black/50 max-w-[200px]">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4 text-white/40" />
            </div>
            <div>
              <div className="text-[11px] text-white/30 mb-1">Support</div>
              <div className="text-xs text-white/60 leading-relaxed">{'"'}Ready for your review!{'"'}</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Ready to Launch - bottom right */}
      <motion.div
        variants={itemVariants}
        className="absolute right-4 lg:right-12 bottom-12 lg:bottom-20 z-10"
      >
        <div className="bg-[#0a0a0a] border border-white/[0.06] rounded-xl p-4 shadow-2xl shadow-black/50">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-violet-500/10 flex items-center justify-center">
              <Rocket className="w-5 h-5 text-violet-400" />
            </div>
            <div>
              <div className="text-[11px] text-white/30 uppercase tracking-wider mb-0.5">Status</div>
              <div className="text-sm text-emerald-400 font-medium">Ready to launch</div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function Hero3DStage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-black">
      <AnimatedGrid />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 pt-32 lg:pt-40 pb-20">
        {/* Text content */}
        <div className="text-center mb-20 lg:mb-24">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold text-white tracking-tight leading-[0.95] mb-8"
          >
            Websites people trust
            <br />
            <span className="text-white/25">before they ever call.</span>
          </motion.h1>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg lg:text-xl text-white/40 max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Mountline Studio builds premium websites, private client portals, and practical systems for businesses that need a stronger first impression and smoother customer action.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              onClick={() => scrollToSection("contact")}
              className="group flex items-center gap-3 bg-white text-black px-8 py-4 rounded-full font-semibold text-base hover:bg-white/90 transition-all duration-200"
            >
              Book a website review
              <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </button>
            <button
              onClick={() => scrollToSection("work")}
              className="flex items-center gap-2 text-white/40 hover:text-white/70 px-6 py-4 font-medium text-base transition-colors duration-200"
            >
              See concept builds
            </button>
          </motion.div>
        </div>

        {/* Mountline Flow Visual */}
        <MountlineFlow />
        
        {/* Flow tagline */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.8 }}
          className="flex items-center justify-center gap-4 mt-20 lg:mt-24"
        >
          <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/10" />
          <span className="text-[11px] text-white/25 uppercase tracking-[0.2em] font-medium">
            Website to launch, all in one system
          </span>
          <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/10" />
        </motion.div>
      </div>
    </section>
  )
}
