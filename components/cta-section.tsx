"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { ArrowRight } from "lucide-react"

export function CtaSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section ref={ref} className="py-20 sm:py-24 bg-slate-900">
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-white tracking-tight mb-4">
            Ready to look better online?
          </h2>
          <p className="text-lg text-slate-400 max-w-xl mx-auto mb-8">
            Book a free website review. We will look at what you have, discuss your goals, and share what could be improved.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => scrollToSection('contact')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-white text-slate-900 font-medium rounded-lg hover:bg-slate-100 transition-colors"
            >
              Book a free review
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('pricing')}
              className="w-full sm:w-auto inline-flex items-center justify-center px-8 py-3.5 border border-slate-700 text-white rounded-lg hover:bg-slate-800 transition-colors"
            >
              See packages
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
