"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Check, Shield, Clock, MessageSquare, User, ArrowRight } from "lucide-react"

const trustPoints = [
  "Clear scope before build starts",
  "Honest, upfront pricing",
  "No fake client claims",
  "Mobile-first delivery",
  "Built for future updates",
  "Straightforward communication",
]

const highlights = [
  {
    icon: Shield,
    title: "Quality Guarantee",
    description: "Revisions until you are satisfied with the final result.",
  },
  {
    icon: Clock,
    title: "Fast Turnaround",
    description: "Most sites launch within 2-3 weeks of project start.",
  },
  {
    icon: MessageSquare,
    title: "Direct Communication",
    description: "Work directly with the person building your site.",
  },
  {
    icon: User,
    title: "Small Team Attention",
    description: "Not a faceless agency. Real people, real accountability.",
  }
]

export function TrustSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section ref={ref} className="py-24 sm:py-32 bg-background relative overflow-hidden">
      {/* Subtle top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left - Content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center gap-3 mb-6">
              <span className="w-8 h-px bg-border-strong" />
              <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
                Why northline
              </span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-6">
              A team you can trust with your online presence.
            </h2>
            
            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              No fake agency act. Just clean work and honest communication from people who care about getting it right.
            </p>
            
            {/* Trust points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-8">
              {trustPoints.map((point, index) => (
                <motion.div
                  key={point}
                  initial={{ opacity: 0, x: -10 }}
                  animate={isInView ? { opacity: 1, x: 0 } : {}}
                  transition={{ duration: 0.4, delay: 0.2 + index * 0.05 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                    <Check className="w-3 h-3 text-emerald-500" />
                  </div>
                  <span className="text-sm text-muted-foreground">{point}</span>
                </motion.div>
              ))}
            </div>
            
            <motion.button
              onClick={() => scrollToSection('contact')}
              className="group flex items-center gap-2 text-foreground font-medium hover:text-accent transition-colors"
              whileHover={{ x: 4 }}
            >
              Start a conversation
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
          
          {/* Right - Highlight cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                className="group p-5 rounded-xl border border-border bg-card hover:border-border-strong hover:shadow-lg transition-all duration-300"
              >
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/15 transition-colors">
                  <item.icon className="w-5 h-5 text-accent" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
