"use client"

import { motion } from "framer-motion"
import { Check, Smartphone, Search, Zap, MessageSquare } from "lucide-react"

export function Hero3DStage() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  const trustItems = [
    "Websites",
    "Landing pages", 
    "Quote forms",
    "Booking flows",
    "Monthly updates"
  ]

  return (
    <section className="relative min-h-screen bg-gradient-to-b from-stone-50 to-white pt-24 pb-20 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-30">
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #d4d4d8 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        {/* Hero content */}
        <div className="text-center max-w-3xl mx-auto mb-16 pt-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-slate-900 tracking-tight leading-[1.1] text-balance mb-6"
          >
            Websites that make your business easier to trust.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-lg sm:text-xl text-slate-600 leading-relaxed text-pretty mb-8"
          >
            Northline Services builds clean websites, landing pages, and simple digital systems for businesses that need a stronger first impression and more customer action.
          </motion.p>
          
          {/* CTAs */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
          >
            <button
              onClick={() => scrollToSection('contact')}
              className="w-full sm:w-auto px-8 py-3.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors"
            >
              Book a website review
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-slate-700 font-medium rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-colors"
            >
              See packages
            </button>
          </motion.div>
          
          {/* Trust row */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-wrap items-center justify-center gap-x-2 gap-y-2 text-sm text-slate-500"
          >
            {trustItems.map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span className="text-slate-300">·</span>}
                {item}
              </span>
            ))}
          </motion.div>
        </div>
        
        {/* Website preview visual */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Desktop browser mockup */}
          <div className="relative bg-white rounded-xl shadow-2xl shadow-slate-900/10 border border-slate-200 overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-b border-slate-200">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
                <div className="w-3 h-3 rounded-full bg-slate-300" />
              </div>
              <div className="flex-1 mx-4">
                <div className="bg-white rounded-md px-3 py-1.5 text-xs text-slate-400 border border-slate-200 max-w-xs mx-auto text-center">
                  premiumautodetail.com
                </div>
              </div>
            </div>
            
            {/* Website preview content */}
            <div className="aspect-[16/10] bg-gradient-to-br from-slate-50 to-stone-50 p-6 sm:p-8">
              {/* Mock website layout */}
              <div className="h-full flex flex-col">
                {/* Mock nav */}
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <div className="flex items-center gap-2">
                    <div className="w-6 sm:w-8 h-6 sm:h-8 rounded-lg bg-slate-800" />
                    <div className="w-16 sm:w-24 h-3 sm:h-4 rounded bg-slate-800" />
                  </div>
                  <div className="hidden sm:flex items-center gap-4 lg:gap-6">
                    <div className="w-12 h-2.5 rounded bg-slate-300" />
                    <div className="w-12 h-2.5 rounded bg-slate-300" />
                    <div className="w-12 h-2.5 rounded bg-slate-300" />
                    <div className="w-16 h-7 rounded-lg bg-slate-800" />
                  </div>
                </div>
                
                {/* Mock hero */}
                <div className="flex-1 flex items-center">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 w-full">
                    <div className="space-y-3 sm:space-y-4">
                      <div className="w-3/4 h-5 sm:h-7 rounded bg-slate-800" />
                      <div className="w-full h-4 sm:h-5 rounded bg-slate-700" />
                      <div className="w-5/6 h-2.5 sm:h-3 rounded bg-slate-400" />
                      <div className="w-4/5 h-2.5 sm:h-3 rounded bg-slate-400" />
                      <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
                        <div className="w-20 sm:w-28 h-8 sm:h-10 rounded-lg bg-blue-600" />
                        <div className="w-16 sm:w-24 h-8 sm:h-10 rounded-lg bg-slate-200 border border-slate-300" />
                      </div>
                    </div>
                    <div className="hidden lg:block">
                      <div className="w-full h-40 rounded-xl bg-gradient-to-br from-slate-200 to-slate-300" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mobile preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="absolute -right-2 sm:right-4 lg:right-8 bottom-4 sm:bottom-8 w-[100px] sm:w-[140px] lg:w-[160px]"
          >
            <div className="bg-white rounded-2xl shadow-xl shadow-slate-900/10 border border-slate-200 overflow-hidden">
              {/* Phone notch */}
              <div className="h-4 sm:h-5 bg-slate-50 flex items-center justify-center">
                <div className="w-10 sm:w-14 h-2.5 sm:h-3 rounded-full bg-slate-200" />
              </div>
              {/* Phone content */}
              <div className="aspect-[9/16] bg-gradient-to-br from-slate-50 to-stone-50 p-2 sm:p-3">
                <div className="space-y-2 sm:space-y-2.5">
                  <div className="flex items-center gap-1.5 sm:gap-2">
                    <div className="w-4 sm:w-5 h-4 sm:h-5 rounded bg-slate-800" />
                    <div className="w-10 sm:w-12 h-1.5 sm:h-2 rounded bg-slate-800" />
                  </div>
                  <div className="w-full h-2 sm:h-2.5 rounded bg-slate-700" />
                  <div className="w-4/5 h-2 sm:h-2.5 rounded bg-slate-700" />
                  <div className="w-full h-1.5 sm:h-2 rounded bg-slate-400" />
                  <div className="w-3/4 h-1.5 sm:h-2 rounded bg-slate-400" />
                  <div className="w-full h-5 sm:h-6 rounded-lg bg-blue-600 mt-2 sm:mt-3" />
                </div>
              </div>
            </div>
          </motion.div>
          
          {/* Feature callout cards */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.7 }}
            className="hidden sm:flex absolute -left-2 lg:-left-4 top-1/4 bg-white rounded-lg shadow-lg shadow-slate-900/5 border border-slate-200 px-3 py-2 items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-700">Clear services</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="hidden sm:flex absolute left-2 lg:left-4 top-1/2 bg-white rounded-lg shadow-lg shadow-slate-900/5 border border-slate-200 px-3 py-2 items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
              <MessageSquare className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-700">Quote ready</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.9 }}
            className="hidden md:flex absolute left-[20%] -bottom-3 bg-white rounded-lg shadow-lg shadow-slate-900/5 border border-slate-200 px-3 py-2 items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
              <Smartphone className="w-3.5 h-3.5 text-violet-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">Mobile-first</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 1.0 }}
            className="hidden md:flex absolute right-[20%] -bottom-3 bg-white rounded-lg shadow-lg shadow-slate-900/5 border border-slate-200 px-3 py-2 items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center">
              <Search className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <span className="text-sm font-medium text-slate-700">SEO basics</span>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 1.1 }}
            className="hidden sm:flex absolute -right-2 lg:-right-4 top-1/3 bg-white rounded-lg shadow-lg shadow-slate-900/5 border border-slate-200 px-3 py-2 items-center gap-2"
          >
            <div className="w-7 h-7 rounded-lg bg-rose-100 flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-rose-600" />
            </div>
            <span className="text-xs sm:text-sm font-medium text-slate-700">Fast launch</span>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
