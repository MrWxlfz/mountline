"use client"

import { motion } from "framer-motion"
import { 
  MessageSquare, 
  FileText, 
  Mail, 
  Calendar, 
  Table, 
  ArrowRight,
  User,
  LayoutDashboard
} from "lucide-react"

const aiCapabilities = [
  {
    icon: MessageSquare,
    title: "Lead capture",
    description: "Forms that organize inquiries and route them correctly.",
  },
  {
    icon: FileText,
    title: "Quote organization",
    description: "Structured forms that capture what you need to respond.",
  },
  {
    icon: Mail,
    title: "Follow-up drafts",
    description: "AI-assisted templates for common customer responses.",
  },
  {
    icon: Calendar,
    title: "Appointment routing",
    description: "Booking flows that connect to your calendar.",
  },
  {
    icon: Table,
    title: "Spreadsheet sync",
    description: "Connect forms to your Google Sheets workflow.",
  },
  {
    icon: LayoutDashboard,
    title: "Project portal",
    description: "Clients track progress in their own private dashboard.",
  },
]

// Visual system flow diagram
function SystemFlowDiagram() {
  const steps = [
    { icon: User, label: "Customer", sublabel: "Submits form" },
    { icon: FileText, label: "Lead", sublabel: "Organized" },
    { icon: Mail, label: "Draft", sublabel: "Follow-up ready" },
    { icon: LayoutDashboard, label: "Portal", sublabel: "Project tracked" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.2 }}
      className="relative p-8 sm:p-10 rounded-2xl border border-foreground/[0.06] bg-foreground/[0.015]"
    >
      {/* Flow container */}
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-6">
        {/* Connecting line - desktop */}
        <motion.div
          className="hidden sm:block absolute top-1/2 left-[12%] right-[12%] h-px bg-foreground/[0.08] -translate-y-1/2 -z-10"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5, duration: 1 }}
        />
        
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-4 sm:gap-0 w-full sm:w-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.12 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-16 h-16 rounded-xl bg-foreground/[0.03] border border-foreground/[0.08] flex items-center justify-center mb-4 hover:border-foreground/15 hover:bg-foreground/[0.05] transition-all">
                <step.icon className="w-7 h-7 text-foreground/65" />
              </div>
              <span className="text-sm font-semibold text-foreground">{step.label}</span>
              <span className="text-xs text-foreground/50 mt-0.5">{step.sublabel}</span>
            </motion.div>
            
            {/* Arrow between steps - desktop */}
            {index < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.12 }}
                className="hidden sm:flex items-center justify-center w-12 mx-2"
              >
                <ArrowRight className="w-5 h-5 text-foreground/20" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  )
}

export function AiSystemsSection() {
  return (
    <section id="ai-systems" className="py-28 lg:py-36 bg-foreground/[0.015]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-foreground/50 tracking-wide uppercase mb-6"
          >
            <span className="w-10 h-px bg-foreground/15" />
            Systems
          </motion.span>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-end">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.05]"
            >
              Useful systems.
              <span className="text-foreground/35"> No gimmicks.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.15 }}
              className="text-lg text-foreground/55 leading-relaxed"
            >
              Some businesses need more than a website. Mountline can connect forms, booking, payment links, spreadsheets, and simple AI-assisted tools.
            </motion.p>
          </div>
        </div>
        
        {/* System flow diagram */}
        <SystemFlowDiagram />
        
        {/* Capabilities grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {aiCapabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.05 }}
              whileHover={{ y: -3, transition: { duration: 0.25 } }}
              className="group p-6 rounded-xl border border-foreground/[0.06] bg-card hover:border-foreground/10 hover:shadow-xl hover:shadow-foreground/[0.02] transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl border border-foreground/[0.08] bg-foreground/[0.02] flex items-center justify-center mb-5 group-hover:border-foreground/15 group-hover:bg-foreground/[0.04] transition-all">
                <capability.icon className="w-5 h-5 text-foreground/55 group-hover:text-foreground/75 transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">
                {capability.title}
              </h3>
              <p className="text-sm text-foreground/50 leading-relaxed">
                {capability.description}
              </p>
            </motion.div>
          ))}
        </div>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-14 text-center"
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-2.5 text-foreground font-medium hover:text-accent transition-colors"
          >
            Discuss what systems you need
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
