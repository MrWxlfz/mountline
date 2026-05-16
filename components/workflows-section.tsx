"use client"

import { motion } from "framer-motion"
import { ArrowRight, Layers, Palette, Code, Rocket } from "lucide-react"

const capabilities = [
  {
    icon: Layers,
    title: "Strategy & Discovery",
    description: "We dive deep into your business goals, target audience, and competitive landscape to craft a strategic foundation.",
  },
  {
    icon: Palette,
    title: "Design & Prototyping",
    description: "From wireframes to high-fidelity mockups, we create intuitive interfaces that users love to interact with.",
  },
  {
    icon: Code,
    title: "Development & Build",
    description: "Clean, scalable code built with modern frameworks. We prioritize performance, accessibility, and maintainability.",
  },
  {
    icon: Rocket,
    title: "Launch & Support",
    description: "We handle deployment, monitoring, and ongoing support to ensure your product thrives post-launch.",
  },
]

export function WorkflowsSection() {
  return (
    <section id="capabilities" className="relative py-32 bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-20"
        >
          <p className="text-sm font-medium tracking-widest text-primary uppercase mb-4">
            Our Capabilities
          </p>
          <h2 className="text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6">
            End-to-end digital expertise
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            We handle every stage of product development, from initial concept to market launch and beyond.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {capabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative p-8 rounded-2xl border border-border bg-card hover:border-primary/50 transition-all duration-300"
            >
              <div className="flex items-start gap-6">
                <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <capability.icon className="w-7 h-7 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {capability.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {capability.description}
                  </p>
                </div>
              </div>
              <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-opacity">
                <ArrowRight className="w-5 h-5 text-primary" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
