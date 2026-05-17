"use client"

import { motion } from "framer-motion"
import { LayoutDashboard, MessageSquare, CreditCard, CheckCircle2, ExternalLink, ListChecks } from "lucide-react"

const differentiators = [
  {
    icon: LayoutDashboard,
    title: "Private project portal",
    description: "Track progress in one place",
  },
  {
    icon: MessageSquare,
    title: "Support thread",
    description: "Direct line to your team",
  },
  {
    icon: ExternalLink,
    title: "Preview links",
    description: "Review your site as we build",
  },
  {
    icon: CreditCard,
    title: "Payment tracking",
    description: "Clear billing records",
  },
  {
    icon: ListChecks,
    title: "Launch checklist",
    description: "Know exactly what is left",
  },
  {
    icon: CheckCircle2,
    title: "Clear updates",
    description: "No chasing emails",
  },
]

export function TrustSection() {
  return (
    <section className="py-24 lg:py-32 bg-foreground/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-foreground/50 tracking-wide uppercase mb-5"
          >
            <span className="w-8 h-px bg-foreground/15" />
            Why Mountline
            <span className="w-8 h-px bg-foreground/15" />
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-5"
          >
            Not just a site.
            <span className="text-foreground/40 block sm:inline"> A cleaner way to work.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-base lg:text-lg text-foreground/55 max-w-2xl mx-auto leading-relaxed"
          >
            Every Mountline project includes a private portal so you can track progress, review previews, message support, and see payment details in one place.
          </motion.p>
        </div>
        
        {/* Differentiators grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4"
        >
          {differentiators.map((item, index) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.25 + index * 0.05 }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="group flex flex-col items-center text-center p-5 lg:p-6 rounded-xl border border-foreground/[0.06] bg-card hover:border-foreground/10 hover:shadow-lg hover:shadow-foreground/[0.02] transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] flex items-center justify-center mb-4 group-hover:border-foreground/15 group-hover:bg-foreground/[0.04] transition-all">
                <item.icon className="w-5 h-5 text-foreground/60 group-hover:text-foreground/80 transition-colors" />
              </div>
              <h3 className="text-sm font-semibold text-foreground mb-1">{item.title}</h3>
              <p className="text-xs text-foreground/50">{item.description}</p>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Bottom note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center text-sm text-foreground/40 mt-10"
        >
          Fewer lost emails. Clearer project updates. Faster feedback.
        </motion.p>
      </div>
    </section>
  )
}
