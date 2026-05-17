"use client"

import { motion } from "framer-motion"
import { useInView } from "framer-motion"
import { useRef } from "react"
import { Zap, Smartphone, Search, BarChart2, FileText, Settings } from "lucide-react"

const tools = [
  {
    icon: Zap,
    title: "Modern development",
    description: "We use current tools and frameworks to build faster and deliver cleaner code."
  },
  {
    icon: Smartphone,
    title: "Mobile-first design",
    description: "Every site starts with mobile layout, then scales up for larger screens."
  },
  {
    icon: Search,
    title: "SEO-ready structure",
    description: "Clean page titles, descriptions, headings, and content organization."
  },
  {
    icon: BarChart2,
    title: "Analytics setup",
    description: "Google Analytics or similar tracking ready from day one."
  },
  {
    icon: FileText,
    title: "Form systems",
    description: "Contact forms, quote requests, and lead capture that actually work."
  },
  {
    icon: Settings,
    title: "Easy updates",
    description: "Sites built so you or we can update content without breaking anything."
  }
]

export function AISection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section ref={ref} className="py-20 sm:py-24 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-12 sm:mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-semibold text-slate-900 tracking-tight mb-4">
            How Mountline builds sites.
          </h2>
          <p className="text-lg text-slate-600 leading-relaxed">
            Modern tools, clean structure, and practical features that make your website work harder for your business.
          </p>
        </motion.div>

        {/* Tools grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {tools.map((tool, index) => (
            <motion.div
              key={tool.title}
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="p-6 bg-stone-50 rounded-xl border border-stone-100"
            >
              <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center mb-4">
                <tool.icon className="w-5 h-5 text-slate-700" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">{tool.title}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">{tool.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Bottom note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="mt-12 p-6 bg-slate-900 rounded-xl text-center"
        >
          <p className="text-white font-medium mb-2">Built to last, not just to launch.</p>
          <p className="text-slate-400 text-sm">
            Every site is structured for future updates, not locked-in code that breaks when you need changes.
          </p>
        </motion.div>
      </div>
    </section>
  )
}
