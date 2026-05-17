"use client"

import { motion } from "framer-motion"
import { Sparkles, Users, LayoutDashboard, Zap } from "lucide-react"

const pillars = [
  {
    icon: Sparkles,
    title: "Sharper first impression",
    description: "Premium design that builds trust before the first call.",
  },
  {
    icon: Users,
    title: "Leads routed clearly",
    description: "Form submissions organized and tracked, not lost in inboxes.",
  },
  {
    icon: LayoutDashboard,
    title: "Private project portal",
    description: "Track progress, preview drafts, and message support in one place.",
  },
  {
    icon: Zap,
    title: "Support and payment in one place",
    description: "No more scattered threads or confusing invoices.",
  },
]

export function TrustSection() {
  return (
    <section className="py-28 lg:py-36 bg-black border-t border-white/[0.04]">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-6"
          >
            Not just a site.
            <span className="text-white/25 block">A cleaner way to work.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/40 max-w-2xl mx-auto leading-relaxed"
          >
            Mountline combines sharp websites with private client portals, support threads, payment links, and clear launch tracking — so the project feels organized from day one.
          </motion.p>
        </div>
        
        {/* Pillars grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.15 }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-5"
        >
          {pillars.map((pillar, index) => (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.05 }}
              className="group p-6 lg:p-8 rounded-2xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/[0.08] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center mb-5 group-hover:bg-white/[0.06] transition-colors">
                <pillar.icon className="w-5 h-5 text-white/50" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{pillar.title}</h3>
              <p className="text-sm text-white/40 leading-relaxed">{pillar.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
