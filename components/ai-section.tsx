"use client"

import { motion } from "framer-motion"
import { ChevronRight, Check, Smartphone, Search, BarChart3, FileCheck } from "lucide-react"

export function AISection() {
  return (
    <div className="relative z-20 py-40" style={{ backgroundColor: "#09090B" }}>
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)",
        }}
      />
      <div className="w-full flex justify-center px-6">
        <div className="w-full max-w-5xl">
          {/* Section label */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="flex items-center gap-2 mb-6"
          >
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-zinc-400 text-sm">Modern development</span>
            <ChevronRight className="w-4 h-4 text-zinc-500" />
          </motion.div>

          {/* Heading */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] text-white max-w-3xl mb-8"
            style={{
              letterSpacing: "-0.0325em",
              fontVariationSettings: '"opsz" 28',
              fontWeight: 538,
              lineHeight: 1.1,
            }}
          >
            Built faster with modern tools.
            <br />
            <span className="text-zinc-500">Reviewed like real work.</span>
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-zinc-400 max-w-lg mb-8"
          >
            We use modern development tools to move quickly, but every project still needs clear scope, clean design, and human review.
          </motion.p>

          {/* Learn more button */}
          <motion.a
            href="#process"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="inline-flex px-5 py-2.5 bg-zinc-800 text-zinc-300 rounded-lg border border-zinc-700 hover:bg-zinc-700 transition-colors text-sm items-center gap-2 mb-16"
          >
            See how we work
            <ChevronRight className="w-4 h-4" />
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
                  transform: "translateY(0%) rotateX(30deg) scale(1.15)",
                  position: "relative",
                }}
              >
                {/* Glass overlay effect */}
                <div
                  style={{
                    border: "1px solid rgba(66, 66, 66, 0.5)",
                    background: "linear-gradient(rgba(255, 255, 255, 0.1) 40%, rgba(8, 9, 10, 0.1) 100%)",
                    borderRadius: "8px",
                    position: "absolute",
                    top: 0,
                    bottom: 0,
                    left: 0,
                    right: 0,
                    boxShadow:
                      "inset 0 1.503px 5.261px rgba(255, 255, 255, 0.04), inset 0 -0.752px 0.752px rgba(255, 255, 255, 0.1)",
                    pointerEvents: "none",
                    zIndex: 10,
                  }}
                />

                <div
                  style={{
                    background: "linear-gradient(180deg, transparent 0%, #09090B 100%)",
                    height: "80%",
                    position: "absolute",
                    bottom: "-2px",
                    left: "-180px",
                    right: "-180px",
                    pointerEvents: "none",
                    zIndex: 11,
                  }}
                />

                {/* Build checklist card */}
                <div className="bg-zinc-900/80 border border-zinc-700 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-6">
                    <FileCheck className="w-5 h-5 text-zinc-400" />
                    <span className="text-zinc-300 font-medium">Build Checklist</span>
                  </div>

                  <div className="space-y-4">
                    <ChecklistItem label="Page structure defined" checked />
                    <ChecklistItem label="Mobile layout complete" checked />
                    <ChecklistItem label="Contact form connected" checked />
                    <ChecklistItem label="SEO basics configured" checked />
                    <ChecklistItem label="Analytics ready" checked />
                    <ChecklistItem label="Speed optimized" inProgress />
                    <ChecklistItem label="Final review" />
                    <ChecklistItem label="Deploy to production" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Bottom divider with two columns */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-16"
          >
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left column */}
              <div className="border-t md:border-r border-b border-zinc-800/60 pt-12 md:pr-12 pb-16">
                <h3 className="text-zinc-200 font-medium text-xl mb-3">Faster build cycles</h3>
                <p className="text-zinc-500 text-base mb-8">
                  Modern tools help us go from idea to polished draft quickly, so clients can react to something real instead of waiting around.
                </p>

                {/* Speed visualization */}
                <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <Smartphone className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-zinc-300 text-sm font-medium">Mobile-first approach</p>
                      <p className="text-zinc-600 text-xs">Responsive from the start</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-zinc-400 text-sm">Draft ready in days, not weeks</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-zinc-400 text-sm">Iterate based on real feedback</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span className="text-zinc-400 text-sm">No endless revision cycles</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right column */}
              <div className="border-t border-b border-zinc-800/60 pt-12 md:pl-12 pb-16">
                <h3 className="text-zinc-200 font-medium text-xl mb-3">Clean technical handoff</h3>
                <p className="text-zinc-500 text-base mb-8">
                  Sites are structured for launch, updates, hosting, and future improvements instead of being a messy one-off build.
                </p>

                {/* Code structure visualization */}
                <div className="bg-zinc-900/30 border border-zinc-800/60 rounded-xl p-5 font-mono text-sm">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-zinc-600">/</span>
                      <span className="text-zinc-400">pages</span>
                    </div>
                    <div className="flex items-center gap-2 pl-4">
                      <span className="text-emerald-400">home.tsx</span>
                      <span className="text-zinc-600 text-xs">Ready</span>
                    </div>
                    <div className="flex items-center gap-2 pl-4">
                      <span className="text-emerald-400">services.tsx</span>
                      <span className="text-zinc-600 text-xs">Ready</span>
                    </div>
                    <div className="flex items-center gap-2 pl-4">
                      <span className="text-emerald-400">contact.tsx</span>
                      <span className="text-zinc-600 text-xs">Ready</span>
                    </div>
                    <div className="flex items-center gap-2 pl-4">
                      <span className="text-amber-400">pricing.tsx</span>
                      <span className="text-zinc-600 text-xs">Review</span>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <span className="text-zinc-600">/</span>
                      <span className="text-zinc-400">components</span>
                    </div>
                    <div className="flex items-center gap-2 mt-4">
                      <span className="text-zinc-600">/</span>
                      <span className="text-zinc-400">styles</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

function ChecklistItem({ label, checked, inProgress }: { label: string; checked?: boolean; inProgress?: boolean }) {
  return (
    <div className="flex items-center gap-3">
      {checked ? (
        <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
          <Check className="w-3 h-3 text-emerald-500" />
        </div>
      ) : inProgress ? (
        <div className="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin" />
      ) : (
        <div className="w-5 h-5 rounded-full border border-zinc-700" />
      )}
      <span className={checked ? "text-zinc-300" : inProgress ? "text-zinc-400" : "text-zinc-600"}>{label}</span>
    </div>
  )
}
