"use client"

import { ChevronRight, FileText, Target, Sparkles, CheckCircle } from "lucide-react"
import { motion } from "framer-motion"

const processSteps = [
  { label: "Website audit", status: "complete" },
  { label: "Offer clarity", status: "complete" },
  { label: "Page structure", status: "complete" },
  { label: "Design direction", status: "active" },
  { label: "Build sprint", status: "pending" },
  { label: "Review", status: "pending" },
  { label: "Launch", status: "pending" },
  { label: "Monthly care", status: "pending" },
]

export function ProductDirectionSection() {
  return (
    <section id="process" className="relative py-40 px-6 md:px-12 lg:px-24">
      {/* Gradient overlay at top */}
      <div
        className="absolute inset-x-0 top-0 pointer-events-none"
        style={{
          height: "20%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.05), transparent 100%)",
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-2 mb-6"
        >
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="text-zinc-400 text-sm">Our process</span>
          <ChevronRight className="w-4 h-4 text-zinc-500" />
        </motion.div>

        {/* Section heading */}
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-3xl sm:text-4xl md:text-5xl lg:text-[56px] font-medium text-white mb-8 max-w-3xl"
          style={{
            letterSpacing: "-0.0325em",
            fontVariationSettings: '"opsz" 28',
            fontWeight: 538,
            lineHeight: 1.1,
          }}
        >
          Start with the outcome.
          <br />
          <span className="text-zinc-500">Then build the site.</span>
        </motion.h2>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-zinc-400 text-lg max-w-lg mb-16"
        >
          Before touching the design, we figure out what the website needs to accomplish: more calls, better trust, cleaner booking, stronger presentation, or all of the above.
        </motion.p>

        {/* Process Timeline Visualization */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative w-full mb-16"
          style={{
            perspective: "1200px",
          }}
        >
          <div
            className="relative"
            style={{
              transform: "rotateX(50deg) rotateZ(-35deg)",
              transformStyle: "preserve-3d",
              transformOrigin: "center center",
            }}
          >
            {/* Timeline with process steps */}
            <div className="relative h-[400px]">
              {/* Diagonal dashed line */}
              <div
                className="absolute w-[1px] bg-zinc-600/50"
                style={{
                  height: "600px",
                  left: "55%",
                  top: "-100px",
                  transform: "rotate(0deg)",
                  backgroundImage:
                    "repeating-linear-gradient(to bottom, transparent, transparent 4px, rgba(113, 113, 122, 0.5) 4px, rgba(113, 113, 122, 0.5) 8px)",
                }}
              />

              {/* Timeline header with tick marks */}
              <div className="absolute top-0 left-0 right-0 flex items-end">
                <div className="flex items-end gap-[3px] absolute bottom-0 left-[5%] right-0">
                  {Array.from({ length: 60 }).map((_, i) => (
                    <div
                      key={i}
                      className="bg-zinc-600/60"
                      style={{
                        width: "1px",
                        height: i % 7 === 0 ? "16px" : "8px",
                      }}
                    />
                  ))}
                </div>
              </div>

              {/* Process step labels */}
              <div className="absolute text-zinc-500 text-sm" style={{ left: "5%", top: "80px" }}>
                Week 1
              </div>
              <div className="absolute text-zinc-500 text-sm" style={{ left: "25%", top: "55px" }}>
                Week 2
              </div>
              <div
                className="absolute px-3 py-1 rounded-md bg-emerald-500/20 text-emerald-400 text-sm font-medium"
                style={{ left: "45%", top: "35px" }}
              >
                Current
              </div>
              <div className="absolute text-zinc-500 text-sm" style={{ left: "65%", top: "15px" }}>
                Week 3
              </div>
              <div className="absolute text-zinc-500/50 text-sm" style={{ left: "85%", top: "-5px" }}>
                Launch
              </div>

              {/* Project bars */}
              {/* Audit & Planning bar */}
              <div
                className="absolute rounded-lg bg-zinc-800/90 border border-zinc-700/50 px-4 py-3 flex items-center gap-3"
                style={{
                  left: "5%",
                  top: "100px",
                  width: "35%",
                  height: "48px",
                }}
              >
                <div className="w-4 h-4 rounded bg-emerald-500/60" />
                <span className="text-zinc-300 text-sm font-medium">Audit & Planning</span>
                <div
                  className="absolute w-4 h-4 rounded border-2 border-emerald-500 bg-emerald-500/20"
                  style={{ right: "15%", top: "50%", transform: "translateY(-50%)" }}
                />
              </div>

              {/* Design bar */}
              <div
                className="absolute rounded-lg bg-zinc-800/70 border border-zinc-700/40 px-4 py-3 flex items-center gap-3"
                style={{
                  left: "25%",
                  top: "155px",
                  width: "30%",
                  height: "44px",
                }}
              >
                <div className="w-3 h-3 rounded bg-blue-500/60" />
                <span className="text-zinc-400 text-sm">Design Direction</span>
              </div>

              {/* Build bar */}
              <div
                className="absolute rounded-lg bg-zinc-800/90 border border-zinc-700/50 px-4 py-3 flex items-center justify-between"
                style={{
                  left: "40%",
                  top: "155px",
                  width: "45%",
                  height: "48px",
                }}
              >
                <span className="text-zinc-400 text-sm">Build Sprint</span>
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded bg-zinc-500/60" />
                  <div className="w-2.5 h-2.5 rounded bg-zinc-500/60" />
                  <div className="w-2.5 h-2.5 rounded bg-zinc-500/60" />
                </div>
              </div>

              {/* Review & Launch bar */}
              <div
                className="absolute rounded-lg bg-zinc-800/70 border border-zinc-700/40 px-4 py-3 flex items-center justify-between"
                style={{
                  left: "70%",
                  top: "240px",
                  width: "25%",
                  height: "48px",
                }}
              >
                <span className="text-zinc-400 text-sm">Review & Launch</span>
                <div className="flex gap-1">
                  <div className="w-2.5 h-2.5 rounded bg-zinc-500/60" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom two-column section */}
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Left column - Clear scope */}
          <div className="border-t md:border-r border-b border-zinc-800 pt-10 md:pr-10 pb-16">
            <h3 className="text-xl font-medium text-zinc-200 mb-3">Clear scope before work starts</h3>
            <p className="text-zinc-500 text-base leading-relaxed mb-8">
              We define pages, features, content needs, and timeline before the build gets messy.
            </p>

            <div className="rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
              <h4 className="text-lg font-medium text-zinc-200 mb-5">Project Scope</h4>

              {/* Pages row */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-zinc-500 text-sm w-20">Pages</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                    Home
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                    Services
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                    Contact
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-zinc-800 text-zinc-300 text-xs">
                    Pricing
                  </span>
                </div>
              </div>

              {/* Features row */}
              <div className="flex items-center gap-4 mb-4">
                <span className="text-zinc-500 text-sm w-20">Features</span>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs">
                    Contact Form
                  </span>
                  <span className="flex items-center gap-1.5 px-2 py-1 rounded bg-blue-500/20 text-blue-400 text-xs">
                    Booking
                  </span>
                </div>
              </div>

              {/* Status row */}
              <div className="flex items-start gap-4">
                <span className="text-zinc-500 text-sm w-20 pt-1">Status</span>
                <div className="flex flex-col gap-2">
                  <span className="flex items-center gap-2 text-zinc-300 text-sm">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    Scope approved
                  </span>
                  <span className="flex items-center gap-2 text-zinc-300 text-sm">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    Design in progress
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - Project direction */}
          <div className="border-t border-b border-zinc-800 pt-10 md:pl-10 pb-16">
            <h3 className="text-xl font-medium text-zinc-200 mb-3">Project direction</h3>
            <p className="text-zinc-500 text-base leading-relaxed mb-8">
              Every section has a job. No random filler blocks just because they came with a template.
            </p>

            <div className="relative h-48">
              {/* Background card */}
              <div
                className="absolute rounded-lg bg-zinc-800/40 border border-zinc-700/30 px-4 py-2"
                style={{ top: 0, left: "10%", width: "80%" }}
              >
                <span className="flex items-center gap-2 text-zinc-500 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500" />
                  Ideas & polish
                </span>
              </div>

              {/* Middle card */}
              <div
                className="absolute rounded-lg bg-zinc-800/60 border border-zinc-700/40 px-4 py-2"
                style={{ top: "30px", left: "5%", width: "85%" }}
              >
                <span className="flex items-center gap-2 text-zinc-400 text-sm">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                  Launch checklist
                </span>
              </div>

              {/* Front card */}
              <div
                className="absolute rounded-xl bg-zinc-800/90 border border-zinc-700/50 px-5 py-4"
                style={{ top: "60px", left: 0, width: "95%" }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <svg className="w-3 h-3 text-emerald-500" viewBox="0 0 16 16" fill="currentColor">
                      <path d="M13.78 4.22a.75.75 0 010 1.06l-7.25 7.25a.75.75 0 01-1.06 0L2.22 9.28a.75.75 0 011.06-1.06L6 10.94l6.72-6.72a.75.75 0 011.06 0z" />
                    </svg>
                  </span>
                  <span className="text-emerald-500 font-medium text-sm">Ready for launch</span>
                </div>
                <p className="text-zinc-300 text-sm mb-3">Mobile, forms, SEO, speed, and deployment checked</p>
                <span className="text-zinc-500 text-xs">Final review complete</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom feature grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 pt-16">
          {/* Clear scope */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-zinc-500" />
            </div>
            <h4 className="text-zinc-200 font-medium text-sm mb-2">Clear scope</h4>
            <p className="text-zinc-500 text-sm">Pages, features, and timeline defined upfront</p>
          </div>

          {/* Focused direction */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-5 h-5 text-zinc-500" />
            </div>
            <h4 className="text-zinc-200 font-medium text-sm mb-2">Focused direction</h4>
            <p className="text-zinc-500 text-sm">Every section serves a purpose</p>
          </div>

          {/* Ideas without noise */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-zinc-500" />
            </div>
            <h4 className="text-zinc-200 font-medium text-sm mb-2">Ideas without noise</h4>
            <p className="text-zinc-500 text-sm">We bring ideas but keep it customer-focused</p>
          </div>

          {/* Launch checklist */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-5 h-5 text-zinc-500" />
            </div>
            <h4 className="text-zinc-200 font-medium text-sm mb-2">Launch checklist</h4>
            <p className="text-zinc-500 text-sm">Mobile, forms, SEO, speed all verified</p>
          </div>
        </div>
      </div>
    </section>
  )
}
