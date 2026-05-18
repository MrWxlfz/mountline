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
    <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20 items-start">
          {/* Left - Main message */}
          <div className="lg:col-span-5">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6"
            >
              <span className="w-8 h-px bg-border" />
              The Mountline difference
            </motion.div>
            
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-6"
            >
              Not just a site.
              <br />
              <span className="text-muted-foreground/50">A cleaner way to work.</span>
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed"
            >
              Mountline combines sharp websites with private client portals, support threads, payment links, and launch tracking so every project feels organized from day one.
            </motion.p>
          </div>
          
          {/* Right - Points grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {positioningPoints.map((point, index) => (
                <motion.div
                  key={point.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                  className="group relative"
                >
                  <div className="p-6 rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-border transition-all duration-300">
                    <div className="w-11 h-11 rounded-xl bg-muted flex items-center justify-center mb-5 group-hover:bg-foreground/5 transition-colors">
                      <point.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <h3 className="text-base font-semibold text-foreground mb-2">
                      {point.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {point.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
