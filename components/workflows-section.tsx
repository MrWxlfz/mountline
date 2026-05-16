"use client"

import { motion } from "framer-motion"
import { ArrowRight, Layers, Palette, Code, Rocket } from "lucide-react"

const capabilities = [
  {
    icon: Layers,
    title: "Strategy & Discovery",
    description: "We start by understanding what your business needs and what your customers expect to see.",
  },
  {
    icon: Palette,
    title: "Design & Layout",
    description: "Clean, professional layouts that look good on any device and make sense to visitors.",
  },
  {
    icon: Code,
    title: "Development & Build",
    description: "Fast, modern code that loads quickly and works reliably across browsers and devices.",
  },
  {
    icon: Rocket,
    title: "Launch & Support",
    description: "We handle deployment and offer ongoing support to keep everything running smoothly.",
  },
]

export function WorkflowsSection() {
  return (
    <section id="capabilities" className="relative py-32" style={{ backgroundColor: "#09090B" }}>
      <div
        className="absolute top-0 left-0 right-0 pointer-events-none"
        style={{
          height: "20%",
          background: "linear-gradient(to bottom, rgba(255,255,255,0.05) 0%, transparent 100%)",
        }}
      />
      
      <div className="mx-auto max-w-5xl px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-medium tracking-widest text-zinc-500 uppercase mb-4">
            Our Capabilities
          </p>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium text-white mb-6 tracking-tight">
            End-to-end digital expertise
          </h2>
          <p className="text-lg text-zinc-400 max-w-xl mx-auto">
            We handle every stage of your project, from initial concept to launch and ongoing support.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-8 rounded-2xl border border-zinc-800 bg-zinc-900/50 hover:border-zinc-700 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                  <capability.icon className="w-6 h-6 text-zinc-400" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-white mb-2">
                    {capability.title}
                  </h3>
                  <p className="text-zinc-500 text-sm leading-relaxed">
                    {capability.description}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5 text-zinc-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
