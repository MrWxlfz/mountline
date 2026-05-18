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
  Mail,
  Zap
} from "lucide-react"

// Portal preview mockup - enhanced
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
      <div className="relative w-full max-w-3xl mx-auto rounded-xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400/80" />
            <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
            <div className="w-3 h-3 rounded-full bg-green-400/80" />
          </div>
          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-md text-xs text-muted-foreground border border-border/50 max-w-[220px] mx-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              portal.mountline.dev
            </div>
          </div>
        </div>
        
        {/* Portal content */}
        <div className="flex min-h-[420px]">
          {/* Sidebar */}
          <div className="w-52 border-r border-border bg-muted/20 p-4 hidden sm:block">
            <div className="flex items-center gap-2.5 mb-8">
              <div className="w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background text-xs font-bold">M</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Mountline</div>
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
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    item.active 
                      ? "bg-foreground/5 text-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-medium">
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </div>
          
          {/* Main content */}
          <div className="flex-1 p-6">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Ridgeway Contracting</h3>
                <p className="text-sm text-muted-foreground">Website project</p>
              </div>
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-600 dark:text-amber-400 text-sm font-medium">R</span>
                </div>
              </div>
            </div>
            
            {/* Status cards */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <motion.div 
                className="p-4 rounded-xl border border-border bg-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-base font-semibold text-foreground">In Development</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl border border-border bg-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium">Payment</span>
                </div>
                <div className="text-base font-semibold text-foreground">$1,250 paid</div>
              </motion.div>
            </div>
            
            {/* Timeline/checklist */}
            <motion.div 
              className="p-5 rounded-xl border border-border bg-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
            >
              <div className="flex items-center justify-between mb-5">
                <span className="text-base font-semibold text-foreground">Project Timeline</span>
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
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                      step.done 
                        ? "bg-green-500/10" 
                        : "border border-border"
                    }`}>
                      {step.done && <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />}
                    </div>
                    <span className={`text-sm ${
                      step.current 
                        ? "text-foreground font-medium" 
                        : step.done 
                          ? "text-muted-foreground" 
                          : "text-muted-foreground/60"
                    }`}>
                      {step.label}
                    </span>
                    {step.current && (
                      <span className="ml-auto px-2.5 py-1 rounded-full bg-foreground/5 text-foreground text-[10px] font-medium">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Quick actions */}
            <div className="flex gap-3 mt-5">
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-foreground text-background text-sm font-medium">
                <ExternalLink className="w-4 h-4" />
                Preview Site
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted/50 transition-colors">
                <MessageSquare className="w-4 h-4" />
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
        className="absolute -right-2 sm:-right-8 top-24 flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-xl max-w-[220px]"
      >
        <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">Design approved</div>
          <div className="text-[11px] text-muted-foreground">2 hours ago</div>
        </div>
      </motion.div>
      
      {/* Floating message card */}
      <motion.div
        initial={{ opacity: 0, x: -30, y: 20 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="absolute -left-2 sm:-left-8 bottom-24 flex items-start gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-xl max-w-[240px]"
      >
        <div className="w-8 h-8 rounded-full bg-foreground/10 flex items-center justify-center shrink-0 mt-0.5">
          <span className="text-foreground text-[11px] font-bold">M</span>
        </div>
        <div>
          <div className="text-sm font-medium text-foreground mb-1">Mountline</div>
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            Homepage is ready for review. Let me know if you want any changes!
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ClientPortalSection() {
  const benefits = [
    { icon: Mail, label: "Fewer lost emails", description: "All communication in one place" },
    { icon: Clock, label: "Clearer updates", description: "Always know where things stand" },
    { icon: Zap, label: "Faster feedback", description: "Review and approve in the portal" },
    { icon: CreditCard, label: "Payment in one place", description: "View invoices and pay online" },
  ]

  return (
    <section id="portal" className="py-24 lg:py-32 bg-muted/30 overflow-hidden">
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
            Clients can track progress, review links, send support messages, and view payment details all in one private Mountline portal. Included with every project.
          </motion.p>
        </div>
        
        {/* Portal mockup */}
        <PortalMockup />
        
        {/* Benefits grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.1 }}
              className="p-5 rounded-xl border border-border bg-card text-center"
            >
              <div className="w-12 h-12 rounded-xl border border-border bg-background flex items-center justify-center mb-4 mx-auto">
                <benefit.icon className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground block mb-1">{benefit.label}</span>
              <span className="text-xs text-muted-foreground">{benefit.description}</span>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Included note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
          className="text-center text-sm text-muted-foreground mt-8"
        >
          Included with all website packages. No extra cost.
        </motion.p>
      </div>
    </section>
  )
}
