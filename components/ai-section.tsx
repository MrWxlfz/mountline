"use client"

import { motion } from "framer-motion"
import { ChevronRight, Check, Smartphone, FileCheck, Zap, Shield } from "lucide-react"

export function AISection() {
  return (
    <section className="relative z-20 py-32 md:py-40 bg-zinc-950">
      {/* Top divider */}
      <div className="section-divider absolute top-0 left-0 right-0" />
      
      <div className="w-full flex justify-center px-6">
        <div className="w-full max-w-5xl">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-3 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-zinc-500 text-sm tracking-wide uppercase">Modern Development</span>
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] text-white max-w-3xl mb-6 leading-[1.1] tracking-tight"
          >
            Built faster with modern tools.
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="text-2xl md:text-3xl text-zinc-500 max-w-2xl mb-8"
          >
            Reviewed like real work.
          </motion.p>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-400 max-w-lg mb-8 leading-relaxed"
          >
            We use modern development tools to move quickly, but every project still needs clear scope, clean design, and human review before it ships.
          </motion.p>

          {/* Learn more button */}
          <motion.a
            href="#process"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex px-5 py-2.5 bg-zinc-900 text-zinc-300 rounded-lg border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800 transition-all duration-300 text-sm items-center gap-2 mb-20 group"
          >
            See how we work
            <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </motion.a>

          {/* Process mockup */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex justify-center mb-24"
          >
            <div
              style={{
                perspective: "900px",
                userSelect: "none",
                WebkitUserSelect: "none",
                width: "100%",
                maxWidth: "720px",
                position: "relative",
              }}
            >
              <div
                style={{
                  transformOrigin: "top",
                  willChange: "transform",
                  transform: "translateY(0%) rotateX(30deg) scale(1.1)",
                  position: "relative",
                }}
              >
                {/* Glass overlay effect */}
                <div
                  className="absolute inset-0 rounded-xl pointer-events-none z-10"
                  style={{
                    border: "1px solid rgba(63, 63, 70, 0.4)",
                    background: "linear-gradient(rgba(255, 255, 255, 0.03) 0%, transparent 100%)",
                    boxShadow: "inset 0 1px 0 rgba(255, 255, 255, 0.05)",
                  }}
                />

                {/* Bottom fade */}
                <div
                  className="absolute -bottom-2 -left-40 -right-40 h-3/4 pointer-events-none z-20"
                  style={{
                    background: "linear-gradient(180deg, transparent 0%, #09090b 100%)",
                  }}
                />

                {/* Build checklist card */}
                <div className="relative bg-zinc-900/90 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                      <FileCheck className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <span className="text-white font-medium">Launch Checklist</span>
                      <p className="text-zinc-500 text-xs">Peak Fitness Website</p>
                    </div>
                    <div className="ml-auto px-2.5 py-1 bg-emerald-500/10 text-emerald-400 text-xs rounded-full border border-emerald-500/20">
                      6/8 Complete
                    </div>
                  </div>

                  <div className="space-y-3">
                    <ChecklistItem label="Page structure defined" checked />
                    <ChecklistItem label="Mobile layout complete" checked />
                    <ChecklistItem label="Contact form connected" checked />
                    <ChecklistItem label="SEO basics configured" checked />
                    <ChecklistItem label="Analytics ready" checked />
                    <ChecklistItem label="Speed optimized" checked />
                    <ChecklistItem label="Final review" inProgress />
                    <ChecklistItem label="Deploy to production" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom two-column section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left column */}
              <div className="border-t md:border-r border-b border-zinc-800/60 pt-12 md:pr-12 pb-16">
                <h3 className="text-zinc-200 font-medium text-xl mb-4">Faster build cycles</h3>
                <p className="text-zinc-500 text-base mb-8 leading-relaxed">
                  Modern tools help us go from idea to polished draft quickly, so clients can react to something real instead of waiting around for weeks.
                </p>

                {/* Speed visualization */}
                <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-zinc-200 text-sm font-medium">Mobile-first approach</p>
                      <p className="text-zinc-600 text-xs">Responsive from the start</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {["Draft ready in days, not weeks", "Iterate based on real feedback", "No endless revision cycles"].map((item, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        <span className="text-zinc-400 text-sm">{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="border-t border-b border-zinc-800/60 pt-12 md:pl-12 pb-16">
                <h3 className="text-zinc-200 font-medium text-xl mb-4">Clean technical handoff</h3>
                <p className="text-zinc-500 text-base mb-8 leading-relaxed">
                  Sites are structured for launch, updates, hosting, and future improvements instead of being a messy one-off build that nobody can touch later.
                </p>

                {/* Code structure visualization */}
                <div className="bg-zinc-900/50 border border-zinc-800/60 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="w-10 h-10 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                      <Shield className="w-5 h-5 text-violet-400" />
                    </div>
                    <div>
                      <p className="text-zinc-200 text-sm font-medium">Production-ready code</p>
                      <p className="text-zinc-600 text-xs">Built for maintainability</p>
                    </div>
                  </div>

                  <div className="font-mono text-sm space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600">/</span>
                      <span className="text-zinc-400">pages</span>
                    </div>
                    <div className="flex items-center gap-2 pl-4">
                      <span className="text-emerald-400">home.tsx</span>
                      <span className="text-emerald-500/60 text-xs ml-auto">Ready</span>
                    </div>
                    <div className="flex items-center gap-2 pl-4">
                      <span className="text-emerald-400">services.tsx</span>
                      <span className="text-emerald-500/60 text-xs ml-auto">Ready</span>
                    </div>
                    <div className="flex items-center gap-2 pl-4">
                      <span className="text-emerald-400">contact.tsx</span>
                      <span className="text-emerald-500/60 text-xs ml-auto">Ready</span>
                    </div>
                    <div className="flex items-center gap-2 pl-4">
                      <span className="text-amber-400">pricing.tsx</span>
                      <span className="text-amber-500/60 text-xs ml-auto">Review</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function ChecklistItem({ label, checked, inProgress }: { label: string; checked?: boolean; inProgress?: boolean }) {
  return (
    <div className="flex items-center gap-3 py-2 px-3 rounded-lg hover:bg-zinc-800/30 transition-colors">
      {checked ? (
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
          <Check className="w-3 h-3 text-emerald-500" />
        </div>
      ) : inProgress ? (
        <div className="w-5 h-5 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />
      ) : (
        <div className="w-5 h-5 rounded-full border border-zinc-700 bg-zinc-800/50" />
      )}
      <span className={`text-sm ${checked ? "text-zinc-300" : inProgress ? "text-zinc-400" : "text-zinc-600"}`}>
        {label}
      </span>
      {inProgress && (
        <span className="ml-auto text-[10px] text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded border border-blue-500/20">
          Active
        </span>
      )}
    </div>
  )
}
