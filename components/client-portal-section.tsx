"use client"

import { motion } from "framer-motion"
import { 
  LayoutDashboard, 
  MessageSquare, 
  CreditCard, 
  ExternalLink, 
  CheckCircle2, 
  Clock,
  FileText,
  Bell,
  ChevronRight
} from "lucide-react"

// Portal preview mockup
function PortalMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      {/* Main portal window */}
      <div className="relative w-full max-w-2xl mx-auto rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <div className="w-3 h-3 rounded-full bg-green-400/80" />
          </div>
          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-md text-xs text-muted-foreground border border-border/50 max-w-[200px] mx-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              portal.mountline.dev
            </div>
          </div>
        </div>
        
        {/* Portal content */}
        <div className="flex min-h-[400px]">
          {/* Sidebar */}
          <div className="w-48 border-r border-border bg-muted/20 p-4 hidden sm:block">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background text-xs font-bold">M</span>
              </div>
              <div>
                <div className="text-xs font-semibold text-foreground">Mountline</div>
                <div className="text-[10px] text-muted-foreground">Client Portal</div>
              </div>
            </div>
            
            <nav className="space-y-1">
              {[
                { icon: LayoutDashboard, label: "Dashboard", active: true },
                { icon: FileText, label: "Project", active: false },
                { icon: MessageSquare, label: "Messages", active: false, badge: 2 },
                { icon: CreditCard, label: "Payments", active: false },
                { icon: ExternalLink, label: "Preview Site", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    item.active 
                      ? "bg-foreground/5 text-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  {item.badge && (
                    <span className="w-4 h-4 rounded-full bg-accent text-accent-foreground text-[9px] flex items-center justify-center font-medium">
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </div>
          
          {/* Main content */}
          <div className="flex-1 p-5 sm:p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">Ridgeway Contracting</h3>
                <p className="text-xs text-muted-foreground">Website project</p>
              </div>
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-muted-foreground" />
                <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-600 dark:text-amber-400 text-xs font-medium">R</span>
                </div>
              </div>
            </div>
            
            {/* Status cards */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <motion.div 
                className="p-4 rounded-xl border border-border bg-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-foreground">In Development</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl border border-border bg-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-2">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Payment</span>
                </div>
                <div className="text-sm font-medium text-foreground">$1,250 paid</div>
              </motion.div>
            </div>
            
            {/* Timeline/checklist */}
            <motion.div 
              className="p-4 rounded-xl border border-border bg-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-foreground">Project Timeline</span>
                <span className="text-xs text-muted-foreground">4 of 6 complete</span>
              </div>
              
              <div className="space-y-3">
                {[
                  { label: "Kickoff call", done: true },
                  { label: "Content gathered", done: true },
                  { label: "Design approved", done: true },
                  { label: "Development", done: true, current: true },
                  { label: "Review & revisions", done: false },
                  { label: "Launch", done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      step.done 
                        ? "bg-green-500/10" 
                        : "border border-border"
                    }`}>
                      {step.done && <CheckCircle2 className="w-3.5 h-3.5 text-green-600 dark:text-green-400" />}
                    </div>
                    <span className={`text-xs ${
                      step.current 
                        ? "text-foreground font-medium" 
                        : step.done 
                          ? "text-muted-foreground" 
                          : "text-muted-foreground/60"
                    }`}>
                      {step.label}
                    </span>
                    {step.current && (
                      <span className="ml-auto px-2 py-0.5 rounded bg-accent/10 text-accent text-[9px] font-medium">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Quick actions */}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-foreground text-background text-xs font-medium">
                <ExternalLink className="w-3.5 h-3.5" />
                Preview Site
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-border text-foreground text-xs font-medium hover:bg-muted/50 transition-colors">
                <MessageSquare className="w-3.5 h-3.5" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating notification */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: -20 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="absolute -right-2 sm:-right-6 top-20 flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-lg max-w-[200px]"
      >
        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <div className="text-xs font-medium text-foreground">Design approved</div>
          <div className="text-[10px] text-muted-foreground">2 hours ago</div>
        </div>
      </motion.div>
      
      {/* Floating message card */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 20 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="absolute -left-2 sm:-left-6 bottom-20 flex items-start gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-lg max-w-[220px]"
      >
        <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-foreground text-[10px] font-bold">M</span>
        </div>
        <div>
          <div className="text-xs font-medium text-foreground mb-1">Mountline</div>
          <div className="text-[10px] text-muted-foreground leading-relaxed">
            Homepage is ready for review. Let me know if you want any changes!
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ClientPortalSection() {
  return (
    <section className="py-24 lg:py-32 bg-muted/30 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-muted-foreground tracking-wide uppercase mb-4"
          >
            <span className="w-8 h-px bg-border" />
            Client Portal
            <span className="w-8 h-px bg-border" />
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] max-w-3xl mx-auto mb-6"
          >
            Every project gets a
            <br />
            <span className="text-muted-foreground/60">private portal.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Clients can track progress, review links, send support messages, and view payment details in one private Mountline portal.
          </motion.p>
        </div>
        
        {/* Portal mockup */}
        <PortalMockup />
        
        {/* Feature highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { icon: Clock, label: "Project status" },
            { icon: ExternalLink, label: "Preview links" },
            { icon: MessageSquare, label: "Support chat" },
            { icon: CreditCard, label: "Payment history" },
          ].map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-12 h-12 rounded-xl border border-border bg-card flex items-center justify-center mb-3">
                <feature.icon className="w-5 h-5 text-muted-foreground" />
              </div>
              <span className="text-sm font-medium text-foreground">{feature.label}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
