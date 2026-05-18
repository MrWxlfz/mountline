"use client"

import { motion } from "framer-motion"
import { Sparkles, Route, Lock, Wallet } from "lucide-react"

const positioningPoints = [
  {
    icon: Sparkles,
    title: "Sharper first impression",
    description: "A clean site that builds trust before the first call.",
  },
  {
    icon: Route,
    title: "Leads routed clearly",
    description: "Forms that organize inquiries and reduce missed opportunities.",
  },
  {
    icon: Lock,
    title: "Private project portal",
    description: "Clients track progress, send messages, and review work in one place.",
  },
  {
    icon: Wallet,
    title: "Support and payment unified",
    description: "Everything in one portal instead of scattered emails and links.",
  },
]

export function PositioningSection() {
  return (
    <section className="py-24 lg:py-32 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          {/* Left - Main message */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-3 text-sm font-medium text-muted-foreground tracking-wide mb-6"
            >
              <span className="w-8 h-px bg-border" />
              The Mountline difference
            </motion.span>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-6"
            >
              Not just a site.
              <br />
              <span className="text-muted-foreground/60">A cleaner way to work.</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed max-w-lg"
            >
              Most studios hand you a website and walk away. Mountline builds the site, the portal, and the systems that help your business run smoother after launch.
            </motion.p>
          </div>
          
          {/* Right - Points grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {positioningPoints.map((point, index) => (
              <motion.div
                key={point.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="group p-5 rounded-xl border border-border bg-card hover:border-foreground/20 hover:shadow-lg transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-lg border border-border bg-background flex items-center justify-center mb-4 group-hover:border-foreground/20 group-hover:bg-foreground/5 transition-all">
                  <point.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1.5">
                  {point.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {point.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
