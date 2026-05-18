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
  Zap,
  LayoutDashboard,
  CreditCard
} from "lucide-react"

const systems = [
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
    icon: CreditCard,
    title: "Payment links",
    description: "Simple invoicing and payment collection for projects.",
  },
]

// Visual flow diagram
function FlowDiagram() {
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
      className="relative p-8 lg:p-10 rounded-2xl border border-border bg-card/50"
    >
      <div className="flex flex-col sm:flex-row items-center justify-between gap-6 sm:gap-4">
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center gap-4 sm:gap-0 w-full sm:w-auto">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              whileInView={{ scale: 1, opacity: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 + index * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center mb-3">
                <step.icon className="w-6 h-6 text-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{step.label}</span>
              <span className="text-[10px] text-muted-foreground">{step.sublabel}</span>
            </motion.div>
            
            {index < steps.length - 1 && (
              <motion.div
                initial={{ opacity: 0, scaleX: 0 }}
                whileInView={{ opacity: 1, scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="hidden sm:flex items-center justify-center w-12 mx-2"
              >
                <ArrowRight className="w-5 h-5 text-muted-foreground/40" />
              </motion.div>
            )}
          </div>
        ))}
      </div>
      
      {/* Connection line */}
      <motion.div
        className="hidden sm:block absolute top-1/2 left-[12%] right-[12%] h-px bg-gradient-to-r from-border via-border to-border -translate-y-1/2 -z-10"
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
    <section id="ai-systems" className="py-24 lg:py-32 bg-muted/20">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6"
          >
            <span className="w-8 h-px bg-border" />
            Systems
          </motion.div>
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-20">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1]"
            >
              Useful systems.
              <br />
              <span className="text-muted-foreground/50">No gimmicks.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed lg:pt-4"
            >
              Some businesses need more than a website. Mountline can connect forms, booking, payment links, spreadsheets, and simple AI-assisted tools so the site supports the business behind it.
            </motion.p>
          </div>
        </div>
        
        {/* Flow diagram */}
        <FlowDiagram />
        
        {/* Systems grid */}
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {systems.map((system, index) => (
            <motion.div
              key={system.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
              className="group p-5 rounded-2xl border border-border bg-card/50 hover:bg-card hover:border-border transition-all duration-300"
            >
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center mb-4 group-hover:bg-foreground/5 transition-colors">
                <system.icon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
              </div>
              <h3 className="text-base font-semibold text-foreground mb-1.5">
                {system.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {system.description}
              </p>
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
            className="group inline-flex items-center gap-2 text-foreground font-medium hover:text-muted-foreground transition-colors"
          >
            Discuss what systems you need
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
