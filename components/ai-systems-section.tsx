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
      className="relative p-8 rounded-2xl border border-white/[0.06] bg-white/[0.01]"
    >
      <div className="relative flex flex-col sm:flex-row items-center justify-between gap-8 sm:gap-6">
        <motion.div
          className="hidden sm:block absolute top-1/2 left-[12%] right-[12%] h-px bg-white/[0.06] -translate-y-1/2 -z-10"
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
              <div className="w-14 h-14 rounded-xl bg-white/[0.02] border border-white/[0.06] flex items-center justify-center mb-3 hover:border-white/[0.1] hover:bg-white/[0.03] transition-all">
                <step.icon className="w-6 h-6 text-white/50" />
              </div>
              <span className="text-sm font-medium text-white">{step.label}</span>
              <span className="text-[11px] text-white/35 mt-0.5">{step.sublabel}</span>
            </motion.div>
            
            {index < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, x: -5 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.6 + index * 0.12 }}
                className="hidden sm:flex items-center justify-center w-10 mx-2"
              >
                <ArrowRight className="w-4 h-4 text-white/15" />
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
    <section id="ai-systems" className="py-28 lg:py-36 bg-black border-t border-white/[0.04]">
      <div className="max-w-6xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-white/25 tracking-wide uppercase mb-6"
          >
            <span className="w-8 h-px bg-white/10" />
            Systems
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] mb-6"
          >
            Useful systems.
            <span className="text-white/25"> No gimmicks.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-white/35 max-w-xl leading-relaxed"
          >
            Some businesses need more than a website. Mountline can connect forms, booking, payment links, and simple AI-assisted tools.
          </motion.p>
        </div>
        
        <SystemFlowDiagram />
        
        {/* Capabilities grid */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiCapabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 + index * 0.05 }}
              className="group p-5 rounded-xl border border-white/[0.06] bg-white/[0.01] hover:bg-white/[0.02] hover:border-white/[0.08] transition-all"
            >
              <div className="w-10 h-10 rounded-lg border border-white/[0.06] bg-white/[0.02] flex items-center justify-center mb-4 group-hover:border-white/[0.1] group-hover:bg-white/[0.03] transition-all">
                <capability.icon className="w-4 h-4 text-white/45" />
              </div>
              <h3 className="text-sm font-semibold text-white mb-1.5">{capability.title}</h3>
              <p className="text-xs text-white/35 leading-relaxed">{capability.description}</p>
            </motion.div>
          ))}
        </div>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-12 text-center"
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 text-white font-medium hover:text-white/70 transition-colors"
          >
            Discuss what systems you need
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
