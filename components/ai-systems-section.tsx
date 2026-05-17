"use client"

import { motion } from "framer-motion"
import { Zap, Mail, Calendar, MessageSquare, FileText, Table, Workflow } from "lucide-react"

const aiCapabilities = [
  {
    icon: MessageSquare,
    title: "Lead capture",
    description: "Forms that organize inquiries and route them to the right place.",
  },
  {
    icon: FileText,
    title: "Quote request organization",
    description: "Structured quote forms that capture what you need to respond.",
  },
  {
    icon: Mail,
    title: "Follow-up draft generation",
    description: "AI-assisted templates for common customer responses.",
  },
  {
    icon: Calendar,
    title: "Appointment routing",
    description: "Booking flows that connect to your calendar and availability.",
  },
  {
    icon: Zap,
    title: "FAQ/chat preparation",
    description: "Content and flows for handling common customer questions.",
  },
  {
    icon: Table,
    title: "Google Sheets/email workflows",
    description: "Simple automations that connect forms to your existing tools.",
  },
]

export function AiSystemsSection() {
  return (
    <section id="ai-systems" className="py-24 lg:py-32 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24">
          {/* Left column - Content */}
          <div>
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="inline-block text-sm font-medium text-muted-foreground tracking-wide uppercase mb-4"
            >
              AI Systems
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight leading-[1.1] mb-6"
            >
              Useful AI systems,{" "}
              <span className="text-muted-foreground/70">not AI theater.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-lg text-muted-foreground leading-relaxed mb-8"
            >
              Some businesses need more than a website. Mountline can connect forms, booking, payment links, spreadsheets, email workflows, and simple AI-assisted tools so the site supports the business behind it.
            </motion.p>
            
            {/* Workflow diagram */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              className="relative p-6 rounded-xl border border-border bg-card"
            >
              <div className="flex items-center justify-between gap-4 flex-wrap">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <MessageSquare className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Form</span>
                </div>
                <Workflow className="w-5 h-5 text-muted-foreground" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Zap className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Process</span>
                </div>
                <Workflow className="w-5 h-5 text-muted-foreground" />
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                    <Mail className="w-5 h-5 text-accent" />
                  </div>
                  <span className="text-sm font-medium text-foreground">Action</span>
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Right column - Capabilities grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aiCapabilities.map((capability, index) => (
              <motion.div
                key={capability.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group p-5 rounded-xl border border-border bg-card hover:border-foreground/20 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg border border-border flex items-center justify-center mb-4 group-hover:border-accent/30 group-hover:bg-accent/5 transition-colors">
                  <capability.icon className="w-5 h-5 text-muted-foreground group-hover:text-accent transition-colors" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-1">
                  {capability.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {capability.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
