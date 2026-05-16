"use client"

import { motion } from "framer-motion"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section className="relative py-32 bg-zinc-900 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">
            Ready to look sharp online?
          </h2>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto mb-10">
            Get a free audit from the Northline team. We&apos;ll review what you have and share what could be better.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollToSection('contact')}
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-zinc-900 font-medium rounded-lg hover:bg-zinc-100 transition-colors"
            >
              Request a free audit
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('work')}
              className="inline-flex items-center px-6 py-3 border border-zinc-700 text-white rounded-lg hover:bg-zinc-800 transition-colors"
            >
              See sample work
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
