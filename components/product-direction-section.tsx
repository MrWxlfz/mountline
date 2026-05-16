"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Search, FileText, Code, Rocket, RefreshCw, Check, ArrowRight } from "lucide-react"

const processSteps = [
  {
    number: "01",
    title: "Review",
    description: "We look at your current site, business goals, and what customers need to do.",
    icon: Search,
  },
  {
    number: "02", 
    title: "Plan",
    description: "We define the pages, content, timeline, and features before the build starts.",
    icon: FileText,
  },
  {
    number: "03",
    title: "Build",
    description: "We design and build with mobile layout, speed, forms, and SEO in mind.",
    icon: Code,
  },
  {
    number: "04",
    title: "Launch",
    description: "We connect the domain, test the site, and make sure everything is ready.",
    icon: Rocket,
  },
  {
    number: "05",
    title: "Support",
    description: "If needed, northline keeps the site updated with monthly care.",
    icon: RefreshCw,
  }
]

const benefits = [
  "Clear timeline before work starts",
  "No surprise scope changes",
  "Regular updates on progress",
  "A site you can actually use"
]

export function ProductDirectionSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <section id="process" ref={ref} className="py-24 sm:py-32 bg-background relative overflow-hidden">
      {/* Background accent */}
      <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-muted/50 to-transparent" />
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <div className="flex items-center gap-3 mb-6">
            <span className="w-8 h-px bg-border-strong" />
            <span className="text-sm font-medium text-muted-foreground tracking-wide uppercase">
              How it works
            </span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            A clear path from review to launch.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            No vague timelines. No surprise scope changes. We define everything upfront so you know exactly what to expect.
          </p>
        </motion.div>

        {/* Process timeline - Horizontal on desktop, vertical on mobile */}
        <div className="mb-16">
          {/* Desktop layout */}
          <div className="hidden lg:block">
            <div className="relative">
              {/* Connection line */}
              <div className="absolute top-[44px] left-[60px] right-[60px] h-px bg-border" />
              <motion.div 
                className="absolute top-[44px] left-[60px] h-px bg-accent"
                initial={{ width: 0 }}
                animate={isInView ? { width: "calc(100% - 120px)" } : {}}
                transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
              />
              
              <div className="grid grid-cols-5 gap-4">
                {processSteps.map((step, index) => (
                  <motion.div
                    key={step.title}
                    initial={{ opacity: 0, y: 20 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 0.2 + index * 0.1 }}
                    className="text-center"
                  >
                    {/* Number circle */}
                    <div className="relative z-10 mx-auto mb-6">
                      <div className="w-[88px] h-[88px] rounded-full bg-card border-2 border-border flex items-center justify-center mx-auto hover:border-accent transition-colors">
                        <div className="flex flex-col items-center">
                          <step.icon className="w-5 h-5 text-accent mb-1" />
                          <span className="text-lg font-bold text-foreground">{step.number}</span>
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {step.description}
                    </p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Mobile/Tablet layout - Vertical */}
          <div className="lg:hidden space-y-6">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.08 }}
                className="flex gap-4"
              >
                {/* Timeline column */}
                <div className="flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-card border-2 border-border flex items-center justify-center shrink-0">
                    <step.icon className="w-5 h-5 text-accent" />
                  </div>
                  {index < processSteps.length - 1 && (
                    <div className="w-px h-full bg-border mt-2" />
                  )}
                </div>
                
                {/* Content */}
                <div className="pb-6">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-accent">{step.number}</span>
                    <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Benefits grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {benefits.map((benefit, index) => (
            <motion.div
              key={benefit}
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.4, delay: 0.7 + index * 0.05 }}
              className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                <Check className="w-4 h-4 text-emerald-500" />
              </div>
              <span className="text-sm text-foreground">{benefit}</span>
            </motion.div>
          ))}
        </motion.div>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="mt-12"
        >
          <motion.button
            onClick={() => scrollToSection('contact')}
            className="group flex items-center gap-2 text-foreground font-medium hover:text-accent transition-colors"
            whileHover={{ x: 4 }}
          >
            Ready to start?
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </motion.button>
        </motion.div>
      </div>
    </section>
  )
}
