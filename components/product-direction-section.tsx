"use client"

import { ChevronRight, FileText, Target, Sparkles, CheckCircle, ArrowRight } from "lucide-react"
import { motion } from "framer-motion"

export function ProductDirectionSection() {
  return (
    <section id="process" className="relative py-32 md:py-40 px-6 bg-zinc-950">
      {/* Top divider */}
      <div className="section-divider absolute top-0 left-0 right-0" />

      <div className="max-w-5xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 mb-6"
        >
          <div className="w-2 h-2 rounded-full bg-violet-500" />
          <span className="text-zinc-500 text-sm tracking-wide uppercase">Our Process</span>
        </motion.div>

        {/* Section heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-medium text-white mb-6 max-w-3xl leading-[1.1] tracking-tight"
        >
          Start with the outcome.
        </motion.h2>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="text-2xl md:text-3xl text-zinc-500 max-w-2xl mb-8"
        >
          Then build the site.
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-zinc-400 text-lg max-w-lg mb-16 leading-relaxed"
        >
          Before touching the design, we figure out what the website needs to accomplish: more calls, better trust, cleaner booking, stronger presentation.
        </motion.p>

        {/* Process Timeline - Simplified and more branded */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative mb-20"
        >
          {/* Timeline container */}
          <div className="relative bg-zinc-900/30 border border-zinc-800/60 rounded-2xl p-8 overflow-hidden">
            {/* Background grid pattern */}
            <div 
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px)
                `,
                backgroundSize: "40px 40px",
              }}
            />
            
            {/* Process steps */}
            <div className="relative grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { phase: "Week 1", title: "Discovery", desc: "Audit & planning", status: "complete", color: "emerald" },
                { phase: "Week 2", title: "Design", desc: "Direction & layout", status: "complete", color: "blue" },
                { phase: "Week 3", title: "Build", desc: "Development sprint", status: "active", color: "violet" },
                { phase: "Week 4", title: "Launch", desc: "Review & deploy", status: "pending", color: "zinc" },
              ].map((step, index) => (
                <motion.div
                  key={step.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  className="relative"
                >
                  {/* Connection line */}
                  {index < 3 && (
                    <div className="hidden md:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-zinc-700 to-zinc-800" style={{ width: "calc(100% - 2rem)", left: "calc(100% - 1rem)" }} />
                  )}
                  
                  <div className={`relative p-5 rounded-xl border transition-all duration-300 ${
                    step.status === "active" 
                      ? "bg-violet-500/5 border-violet-500/30" 
                      : step.status === "complete"
                        ? "bg-zinc-800/30 border-zinc-700/50"
                        : "bg-zinc-900/50 border-zinc-800/50"
                  }`}>
                    {/* Status indicator */}
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`w-2 h-2 rounded-full ${
                        step.status === "complete" ? "bg-emerald-500" :
                        step.status === "active" ? "bg-violet-500 animate-pulse" :
                        "bg-zinc-600"
                      }`} />
                      <span className="text-xs text-zinc-500">{step.phase}</span>
                      {step.status === "active" && (
                        <span className="ml-auto text-[10px] text-violet-400 bg-violet-500/10 px-2 py-0.5 rounded border border-violet-500/20">
                          Current
                        </span>
                      )}
                    </div>
                    
                    <h4 className="text-white font-medium mb-1">{step.title}</h4>
                    <p className="text-zinc-500 text-sm">{step.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Bottom two-column section */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left column - Clear scope */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="border-t md:border-r border-b border-zinc-800/60 pt-12 md:pr-12 pb-16"
          >
            <h3 className="text-xl font-medium text-zinc-200 mb-4">Clear scope before work starts</h3>
            <p className="text-zinc-500 text-base leading-relaxed mb-8">
              We define pages, features, content needs, and timeline before the build gets messy. No scope creep, no surprises.
            </p>

            <div className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-5">
              <h4 className="text-base font-medium text-zinc-200 mb-5">Project Scope</h4>

              {/* Pages row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-zinc-500 text-sm w-16">Pages</span>
                <div className="flex items-center gap-2 flex-wrap">
                  {["Home", "Services", "Contact", "Pricing"].map((page) => (
                    <span key={page} className="px-2.5 py-1 rounded-md bg-zinc-800/80 text-zinc-300 text-xs border border-zinc-700/50">
                      {page}
                    </span>
                  ))}
                </div>
              </div>

              {/* Features row */}
              <div className="flex flex-wrap items-center gap-3 mb-4">
                <span className="text-zinc-500 text-sm w-16">Features</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs border border-emerald-500/20">
                    Contact Form
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs border border-blue-500/20">
                    Booking
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="flex items-start gap-3 pt-4 border-t border-zinc-800/50">
                <span className="text-zinc-500 text-sm w-16 pt-1">Status</span>
                <div className="space-y-2">
                  <span className="flex items-center gap-2 text-zinc-300 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    Scope approved
                  </span>
                  <span className="flex items-center gap-2 text-zinc-400 text-sm">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    Design in progress
                  </span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Right column - Project direction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="border-t border-b border-zinc-800/60 pt-12 md:pl-12 pb-16"
          >
            <h3 className="text-xl font-medium text-zinc-200 mb-4">Every section has a job</h3>
            <p className="text-zinc-500 text-base leading-relaxed mb-8">
              No random filler blocks just because they came with a template. Every part of the site earns its place.
            </p>

            <div className="relative space-y-3">
              {/* Stacked cards showing prioritization */}
              <div className="p-4 rounded-xl bg-zinc-800/20 border border-zinc-800/40">
                <span className="flex items-center gap-2 text-zinc-500 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-600" />
                  Ideas & polish
                </span>
              </div>
              
              <div className="p-4 rounded-xl bg-zinc-800/40 border border-zinc-700/40">
                <span className="flex items-center gap-2 text-zinc-400 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Launch checklist
                </span>
              </div>
              
              <div className="p-5 rounded-xl bg-zinc-800/60 border border-zinc-700/50">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="text-emerald-400 font-medium text-sm">Ready for launch</span>
                </div>
                <p className="text-zinc-300 text-sm mb-2">Mobile, forms, SEO, speed checked</p>
                <span className="text-zinc-500 text-xs">Final review complete</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Bottom feature grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16"
        >
          {[
            { icon: FileText, title: "Clear scope", desc: "Pages and features defined upfront" },
            { icon: Target, title: "Focused direction", desc: "Every section serves a purpose" },
            { icon: Sparkles, title: "Ideas without noise", desc: "We bring ideas, stay customer-focused" },
            { icon: CheckCircle, title: "Launch checklist", desc: "Mobile, forms, SEO all verified" },
          ].map((item, index) => (
            <div key={item.title}>
              <div className="flex items-center gap-2 mb-3">
                <item.icon className="w-5 h-5 text-zinc-500" />
              </div>
              <h4 className="text-zinc-200 font-medium text-sm mb-2">{item.title}</h4>
              <p className="text-zinc-500 text-sm">{item.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Quote */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="mt-16 pt-12 border-t border-zinc-800/50"
        >
          <p className="text-zinc-500 text-lg italic max-w-2xl">
            {'"'}Built to launch cleanly and grow without turning into a mess.{'"'}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
