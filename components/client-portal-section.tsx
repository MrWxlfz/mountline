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
  Zap,
  ArrowUpRight
} from "lucide-react"

// Portal preview mockup - large and premium
function PortalMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60, scale: 0.98 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8 }}
      className="relative"
    >
      {/* Glow effect */}
      <div className="absolute -inset-4 bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl blur-xl" />
      
      {/* Main portal window */}
      <div className="relative w-full rounded-2xl border border-border bg-card/50 backdrop-blur-sm shadow-2xl shadow-black/30 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 bg-muted/20">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-foreground/10" />
            <div className="w-3 h-3 rounded-full bg-foreground/10" />
            <div className="w-3 h-3 rounded-full bg-foreground/10" />
          </div>
          <div className="flex-1 flex justify-center">
            <div className="flex items-center gap-2.5 px-4 py-1.5 rounded-lg bg-background/60 border border-border/50">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-xs text-muted-foreground font-medium">portal.mountline.dev</span>
            </div>
          </div>
          <div className="w-20" />
        </div>
        
        {/* Portal content */}
        <div className="flex min-h-[480px]">
          {/* Sidebar */}
          <div className="w-56 border-r border-border/50 bg-muted/10 p-5 hidden lg:block">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
                <span className="text-background text-sm font-bold">M</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Mountline</div>
                <div className="text-[11px] text-muted-foreground">Client Portal</div>
              </div>
            </div>
            
            <nav className="space-y-1.5">
              {[
                { icon: LayoutDashboard, label: "Dashboard", active: true },
                { icon: FileText, label: "Project", active: false },
                { icon: MessageSquare, label: "Messages", active: false, badge: 2 },
                { icon: CreditCard, label: "Payments", active: false },
                { icon: ExternalLink, label: "Preview Site", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors ${
                    item.active 
                      ? "bg-foreground/5 text-foreground" 
                      : "text-muted-foreground hover:text-foreground hover:bg-foreground/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-foreground text-background text-[10px] flex items-center justify-center font-semibold">
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </nav>
          </div>
          
          {/* Main content */}
          <div className="flex-1 p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-semibold text-foreground">Ridgeway Contracting</h3>
                <p className="text-sm text-muted-foreground">Business website project</p>
              </div>
              <div className="flex items-center gap-4">
                <Bell className="w-5 h-5 text-muted-foreground" />
                <div className="w-9 h-9 rounded-full bg-amber-500/20 flex items-center justify-center">
                  <span className="text-amber-500 text-sm font-semibold">R</span>
                </div>
              </div>
            </div>
            
            {/* Status cards */}
            <div className="grid grid-cols-2 gap-5 mb-6">
              <motion.div 
                className="p-5 rounded-2xl border border-border bg-card/50"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Status</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-base font-semibold text-foreground">In Development</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-5 rounded-2xl border border-border bg-card/50"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Payment</span>
                </div>
                <div className="text-base font-semibold text-foreground">$1,250 paid</div>
              </motion.div>
            </div>
            
            {/* Timeline/checklist */}
            <motion.div 
              className="p-6 rounded-2xl border border-border bg-card/50"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-6">
                <span className="text-base font-semibold text-foreground">Project Timeline</span>
                <span className="text-xs text-muted-foreground">4 of 6 complete</span>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: "Kickoff call", done: true },
                  { label: "Content gathered", done: true },
                  { label: "Design approved", done: true },
                  { label: "Development", done: true, current: true },
                  { label: "Review & revisions", done: false },
                  { label: "Launch", done: false },
                ].map((step, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      step.done 
                        ? "bg-green-500/10" 
                        : "border border-border"
                    }`}>
                      {step.done && <CheckCircle2 className="w-4 h-4 text-green-500" />}
                    </div>
                    <span className={`text-sm ${
                      step.current 
                        ? "text-foreground font-medium" 
                        : step.done 
                          ? "text-muted-foreground" 
                          : "text-muted-foreground/50"
                    }`}>
                      {step.label}
                    </span>
                    {step.current && (
                      <span className="ml-auto px-3 py-1 rounded-full bg-foreground/5 text-foreground text-[10px] font-medium uppercase tracking-wider">
                        Current
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
            
            {/* Quick actions */}
            <div className="flex gap-4 mt-6">
              <button className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl bg-foreground text-background text-sm font-medium">
                <ExternalLink className="w-4 h-4" />
                Preview Site
              </button>
              <button className="flex-1 flex items-center justify-center gap-2.5 px-5 py-3.5 rounded-xl border border-border text-foreground text-sm font-medium hover:bg-muted/50 transition-colors">
                <MessageSquare className="w-4 h-4" />
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating notification - right */}
      <motion.div
        initial={{ opacity: 0, x: 30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.7 }}
        className="absolute -right-4 sm:-right-8 top-32 flex items-center gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-xl max-w-[200px] hidden sm:flex"
      >
        <div className="w-9 h-9 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <div className="text-xs font-medium text-foreground">Design approved</div>
          <div className="text-[10px] text-muted-foreground">2 hours ago</div>
        </div>
      </motion.div>
      
      {/* Floating message - left */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9 }}
        className="absolute -left-4 sm:-left-8 bottom-32 flex items-start gap-3 px-4 py-3 bg-card border border-border rounded-xl shadow-xl max-w-[220px] hidden sm:flex"
      >
        <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 mt-0.5">
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
  const benefits = [
    { icon: Mail, label: "Fewer lost emails", description: "All communication in one place" },
    { icon: Clock, label: "Clearer updates", description: "Always know where things stand" },
    { icon: Zap, label: "Faster feedback", description: "Review and approve in the portal" },
    { icon: CreditCard, label: "Payment in one place", description: "View invoices and pay online" },
  ]

  return (
    <section id="portal" className="py-24 lg:py-32 bg-muted/20 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6"
          >
            <span className="w-8 h-px bg-border" />
            Client Portal
            <span className="w-8 h-px bg-border" />
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] max-w-3xl mx-auto mb-6"
          >
            Every project gets a
            <br />
            <span className="text-muted-foreground/50">private portal.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-2xl mx-auto"
          >
            Track progress, review links, send support messages, and view payment details all in one private Mountline portal. Included with every project.
          </motion.p>
        </div>
        
        {/* Portal mockup */}
        <PortalMockup />
        
        {/* Benefits strip */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto"
        >
          {benefits.map((benefit, i) => (
            <motion.div
              key={benefit.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="text-center p-5 rounded-2xl border border-border bg-card/50"
            >
              <div className="w-12 h-12 rounded-xl border border-border bg-background flex items-center justify-center mb-4 mx-auto">
                <benefit.icon className="w-5 h-5 text-foreground" />
              </div>
              <span className="text-sm font-semibold text-foreground block mb-1">{benefit.label}</span>
              <span className="text-xs text-muted-foreground">{benefit.description}</span>
            </motion.div>
          ))}
        </motion.div>
        
        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.9 }}
          className="text-center text-sm text-muted-foreground mt-10"
        >
          Included with all website packages. No extra cost.
        </motion.p>
      </div>
    </section>
  )
}
