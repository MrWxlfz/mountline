"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { Search, FileText, Code, Rocket, RefreshCw, Check, Workflow } from "lucide-react"

const processSteps = [
  {
    number: "01",
    title: "Review",
    description: "We look at your current site, business goals, and what customers need to do.",
    icon: Search,
    color: "from-blue-500 to-cyan-500"
  },
  {
    number: "02", 
    title: "Plan",
    description: "We define the pages, content, timeline, and features before the build starts.",
    icon: FileText,
    color: "from-violet-500 to-purple-500"
  },
  {
    number: "03",
    title: "Build",
    description: "We design and build with mobile layout, speed, forms, and SEO in mind.",
    icon: Code,
    color: "from-emerald-500 to-teal-500"
  },
  {
    number: "04",
    title: "Launch",
    description: "We connect the domain, test the site, and make sure everything is ready.",
    icon: Rocket,
    color: "from-amber-500 to-orange-500"
  },
  {
    number: "05",
    title: "Support",
    description: "If needed, northline keeps the site updated with monthly care.",
    icon: RefreshCw,
    color: "from-rose-500 to-pink-500"
  }
]

const benefits = [
  "Clear timeline before work starts",
  "No surprise scope changes or hidden costs",
  "Regular updates so you always know where things stand",
  "A finished site you can actually use and update"
]

export function ProductDirectionSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })

  return (
    <section id="process" ref={ref} className="py-24 sm:py-32 section-default">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl mb-16"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-6"
          >
            <Workflow className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-muted-foreground">Our process</span>
          </motion.div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight mb-4">
            A clear process from review to launch.
          </h2>
          <p className="text-lg text-muted-foreground leading-relaxed">
            No vague timelines or surprise scope changes. We define everything upfront so you know exactly what to expect.
          </p>
        </motion.div>

        {/* Process steps */}
        <div className="relative mb-16">
          {/* Connection line for desktop */}
          <div className="hidden lg:block absolute top-[72px] left-[10%] right-[10%] h-px bg-border" />
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-6">
            {processSteps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.1 + index * 0.1 }}
                className="relative group"
              >
                {/* Step number circle */}
                <div className="relative z-10 mb-6 flex justify-center lg:justify-start">
                  <motion.div 
                    className="relative"
                    whileHover={{ scale: 1.1 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center shadow-lg group-hover:shadow-xl transition-shadow`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-background border-2 border-border flex items-center justify-center">
                      <span className="text-xs font-bold text-foreground">{step.number}</span>
                    </div>
                  </motion.div>
                </div>
                
                {/* Content */}
                <div className="text-center lg:text-left">
                  <h3 className="text-lg font-semibold text-foreground mb-2">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Bottom reassurance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="card-premium p-6 sm:p-8 max-w-3xl"
        >
          <h3 className="text-lg font-semibold text-foreground mb-5">
            What this means for you
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {benefits.map((benefit, index) => (
              <motion.div
                key={benefit}
                initial={{ opacity: 0, x: -10 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.7 + index * 0.05 }}
                className="flex items-center gap-3"
              >
                <div className="w-6 h-6 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                  <Check className="w-3.5 h-3.5 text-emerald-500" />
                </div>
                <span className="text-sm text-muted-foreground">{benefit}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}
