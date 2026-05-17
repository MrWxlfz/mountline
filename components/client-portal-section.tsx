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
  Eye,
  Calendar,
  ChevronRight
} from "lucide-react"

// Large portal preview mockup
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
      <div className="relative w-full max-w-4xl mx-auto rounded-2xl border border-foreground/10 bg-card shadow-2xl shadow-foreground/5 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-foreground/10 bg-foreground/[0.02]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-foreground/15" />
            <div className="w-3 h-3 rounded-full bg-foreground/15" />
            <div className="w-3 h-3 rounded-full bg-foreground/15" />
          </div>
          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-foreground/[0.03] rounded-lg text-sm text-foreground/50 border border-foreground/10 max-w-[220px] mx-auto">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              portal.mountline.dev
            </div>
          </div>
        </div>
        
        {/* Portal content */}
        <div className="flex min-h-[480px]">
          {/* Sidebar */}
          <div className="w-56 border-r border-foreground/10 bg-foreground/[0.01] p-5 hidden md:block">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-9 h-9 rounded-lg bg-foreground flex items-center justify-center">
                <span className="text-background text-sm font-bold">M</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Mountline</div>
                <div className="text-[11px] text-foreground/50">Client Portal</div>
              </div>
            </div>
            
            <nav className="space-y-1">
              {[
                { icon: LayoutDashboard, label: "Dashboard", active: true },
                { icon: FileText, label: "Project Details", active: false },
                { icon: MessageSquare, label: "Messages", active: false, badge: 2 },
                { icon: CreditCard, label: "Payments", active: false },
                { icon: ExternalLink, label: "Preview Site", active: false },
                { icon: Calendar, label: "Timeline", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
                    item.active 
                      ? "bg-foreground/5 text-foreground" 
                      : "text-foreground/50 hover:text-foreground hover:bg-foreground/[0.03]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-medium">
                      {item.badge}
                    </span>
                  )}
                </div>
              ))}
            </nav>
            
            {/* Label explaining sidebar */}
            <div className="mt-6 pt-4 border-t border-foreground/10">
              <div className="flex items-center gap-2 text-[10px] text-foreground/40 uppercase tracking-wider font-medium">
                <Eye className="w-3 h-3" />
                Track everything
              </div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">Ridgeway Contracting</h3>
                <p className="text-sm text-foreground/50">Business Website Project</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="w-5 h-5 text-foreground/50" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-accent" />
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-500/15 flex items-center justify-center">
                  <span className="text-amber-500 text-sm font-medium">R</span>
                </div>
              </div>
            </div>
            
            {/* Grid of status cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <motion.div 
                className="p-4 rounded-xl border border-foreground/10 bg-foreground/[0.02]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-foreground/40" />
                  <span className="text-xs text-foreground/50 uppercase tracking-wider">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-foreground">In Development</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl border border-foreground/10 bg-foreground/[0.02]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-foreground/40" />
                  <span className="text-xs text-foreground/50 uppercase tracking-wider">Paid</span>
                </div>
                <div className="text-sm font-medium text-foreground">$1,250 / $2,500</div>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl border border-foreground/10 bg-foreground/[0.02]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <ExternalLink className="w-4 h-4 text-foreground/40" />
                  <span className="text-xs text-foreground/50 uppercase tracking-wider">Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span className="text-sm font-medium text-foreground">Live</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl border border-foreground/10 bg-foreground/[0.02]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-foreground/40" />
                  <span className="text-xs text-foreground/50 uppercase tracking-wider">Launch</span>
                </div>
                <div className="text-sm font-medium text-foreground">Dec 15</div>
              </motion.div>
            </div>
            
            {/* Two column layout for timeline and next step */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Timeline/checklist */}
              <motion.div 
                className="p-5 rounded-xl border border-foreground/10 bg-foreground/[0.02]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-semibold text-foreground">Project Timeline</span>
                  <span className="text-xs text-foreground/50">4 of 6 done</span>
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
                          : "border border-foreground/15"
                      }`}>
                        {step.done && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                      </div>
                      <span className={`text-sm ${
                        step.current 
                          ? "text-foreground font-medium" 
                          : step.done 
                            ? "text-foreground/60" 
                            : "text-foreground/40"
                      }`}>
                        {step.label}
                      </span>
                      {step.current && (
                        <span className="ml-auto px-2 py-0.5 rounded bg-accent/10 text-accent text-[9px] font-medium uppercase tracking-wider">
                          Current
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
              
              {/* Next step + Support chat preview */}
              <div className="space-y-4">
                {/* Next step card */}
                <motion.div 
                  className="p-5 rounded-xl border border-accent/20 bg-accent/5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.45 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <ChevronRight className="w-4 h-4 text-accent" />
                    <span className="text-xs text-accent uppercase tracking-wider font-medium">Next Step</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed">
                    Review the homepage draft and leave feedback. We will schedule a quick call if needed.
                  </p>
                  <button className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-foreground text-background rounded-lg text-sm font-medium">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Preview Site
                  </button>
                </motion.div>
                
                {/* Recent message preview */}
                <motion.div 
                  className="p-5 rounded-xl border border-foreground/10 bg-foreground/[0.02]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4 text-foreground/40" />
                    <span className="text-xs text-foreground/50 uppercase tracking-wider">Support Chat</span>
                    <span className="ml-auto w-2 h-2 rounded-full bg-accent" />
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-foreground/10 flex items-center justify-center shrink-0">
                      <span className="text-foreground/70 text-[9px] font-bold">M</span>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-foreground mb-0.5">Mountline</div>
                      <div className="text-sm text-foreground/60 leading-relaxed">
                        Homepage is ready for your review. Let me know if you want any changes!
                      </div>
                      <div className="text-[10px] text-foreground/40 mt-1">2 hours ago</div>
                    </div>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating notification - design approved */}
      <motion.div
        initial={{ opacity: 0, x: 30, y: -20 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.6 }}
        className="absolute -right-3 lg:-right-6 top-24 flex items-center gap-3 px-4 py-3 bg-card border border-foreground/10 rounded-xl shadow-lg max-w-[200px]"
      >
        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </div>
        <div>
          <div className="text-xs font-medium text-foreground">Design approved</div>
          <div className="text-[10px] text-foreground/50">2 hours ago</div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ClientPortalSection() {
  return (
    <section className="py-24 lg:py-32 bg-foreground/[0.02] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-foreground/60 tracking-wide uppercase mb-4"
          >
            <span className="w-8 h-px bg-foreground/20" />
            Client Portal
            <span className="w-8 h-px bg-foreground/20" />
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] max-w-3xl mx-auto mb-5"
          >
            Every project gets a
            <span className="text-foreground/40"> private portal.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base lg:text-lg text-foreground/60 max-w-2xl mx-auto leading-relaxed"
          >
            Track progress, review previews, send messages, and view payments in one private Mountline portal. No more chasing emails.
          </motion.p>
        </div>
        
        {/* Portal mockup */}
        <PortalMockup />
        
        {/* Feature highlights with labels */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto"
        >
          {[
            { icon: Clock, label: "Project status", description: "Know where things stand" },
            { icon: ExternalLink, label: "Preview links", description: "Review your site live" },
            { icon: MessageSquare, label: "Support chat", description: "Direct line to your team" },
            { icon: CreditCard, label: "Payment history", description: "Clear billing records" },
          ].map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.08 }}
              whileHover={{ y: -2, transition: { duration: 0.2 } }}
              className="flex flex-col items-center text-center p-4 rounded-xl border border-foreground/10 bg-card hover:border-foreground/15 transition-all cursor-default"
            >
              <div className="w-11 h-11 rounded-xl border border-foreground/10 bg-foreground/[0.03] flex items-center justify-center mb-3">
                <feature.icon className="w-5 h-5 text-foreground/60" />
              </div>
              <span className="text-sm font-medium text-foreground mb-1">{feature.label}</span>
              <span className="text-xs text-foreground/50">{feature.description}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
