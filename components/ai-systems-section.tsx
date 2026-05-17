"use client"

import { motion } from "framer-motion"
import { 
  MessageSquare, 
  FileText, 
  Mail, 
  Calendar, 
  Table, 
  ArrowRight,
  ChevronRight,
  User,
  Zap,
  LayoutDashboard
} from "lucide-react"

const aiCapabilities = [
  {
    icon: MessageSquare,
    title: "Lead capture",
    description: "Forms that organize inquiries and route them to the right place.",
  },
  {
    icon: FileText,
    title: "Quote organization",
    description: "Structured quote forms that capture what you need to respond.",
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
    description: "Connect forms to your existing Google Sheets workflow.",
  },
  {
    icon: LayoutDashboard,
    title: "Project portal",
    description: "Clients track progress in their own private dashboard.",
  },
]

// Visual workflow diagram
function WorkflowDiagram() {
  const steps = [
    { icon: User, label: "Customer", sublabel: "Submits form" },
    { icon: Zap, label: "Organized", sublabel: "Lead captured" },
    { icon: Mail, label: "Draft", sublabel: "Follow-up ready" },
    { icon: LayoutDashboard, label: "Portal", sublabel: "Project tracked" },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3 }}
      className="relative p-6 sm:p-8 rounded-2xl border border-foreground/10 bg-foreground/[0.02]"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 sm:gap-2">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-2 sm:gap-0 w-full sm:w-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.15 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-foreground/5 border border-foreground/10 flex items-center justify-center mb-2 group-hover:bg-foreground/10 transition-colors">
                <step.icon className="w-6 h-6 text-foreground/80" />
              </div>
              <span className="text-sm font-medium text-foreground">{step.label}</span>
              <span className="text-xs text-foreground/60">{step.sublabel}</span>
            </motion.div>
            
            {index < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.15 }}
                className="hidden sm:flex items-center justify-center w-8 mx-2"
              >
                <ChevronRight className="w-5 h-5 text-foreground/30" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
      
      {/* Animated connection line - desktop only */}
      <motion.div
        className="hidden sm:block absolute top-1/2 left-[15%] right-[15%] h-px bg-gradient-to-r from-foreground/5 via-foreground/15 to-foreground/5 -translate-y-1/2 -z-10"
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6, duration: 0.8 }}
      />
    </motion.div>
  )
}

export function AiSystemsSection() {
  return (
    <section id="ai-systems" className="py-20 lg:py-28 bg-foreground/[0.02]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 lg:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-foreground/60 tracking-wide uppercase mb-4"
          >
            <span className="w-8 h-px bg-foreground/20" />
            AI Systems
          </motion.span>
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-16 items-end">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1]"
            >
              Useful systems.
              <br />
              <span className="text-foreground/50">No gimmicks.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-base lg:text-lg text-foreground/70 leading-relaxed"
            >
              Some businesses need more than a website. Mountline can connect forms, booking, payment links, spreadsheets, email workflows, and simple AI-assisted tools so the site supports the business behind it.
            </motion.p>
          </div>
        </div>
        
        {/* Workflow diagram */}
        <WorkflowDiagram />
        
        {/* Capabilities grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {aiCapabilities.map((capability, index) => (
            <motion.div
              key={capability.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="group p-5 rounded-xl border border-foreground/10 bg-card hover:border-foreground/20 hover:bg-foreground/[0.02] transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-lg border border-foreground/10 bg-foreground/5 flex items-center justify-center mb-4 group-hover:border-foreground/20 group-hover:bg-foreground/10 transition-all">
                <capability.icon className="w-5 h-5 text-foreground/70 group-hover:text-foreground transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">
                {capability.title}
              </h3>
              <p className="text-sm text-foreground/60 leading-relaxed">
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
          className="mt-10 text-center"
        >
          <a
            href="#contact"
            className="group inline-flex items-center gap-2 text-foreground font-medium hover:text-accent transition-colors"
          >
            Discuss what systems you need
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
