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
  Calendar,
  ChevronRight
} from "lucide-react"

// Large portal preview mockup
function PortalMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Main portal window */}
      <div className="relative w-full max-w-5xl mx-auto rounded-2xl border border-foreground/[0.06] bg-card shadow-2xl shadow-foreground/[0.03] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-foreground/[0.06] bg-foreground/[0.015]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-foreground/10" />
            <div className="w-3 h-3 rounded-full bg-foreground/10" />
            <div className="w-3 h-3 rounded-full bg-foreground/10" />
          </div>
          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-foreground/[0.02] rounded-lg text-sm text-foreground/40 border border-foreground/[0.06] max-w-[200px] mx-auto">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              portal.mountline.dev
            </div>
          </div>
        </div>
        
        {/* Portal content */}
        <div className="flex min-h-[520px]">
          {/* Sidebar */}
          <div className="w-60 border-r border-foreground/[0.06] bg-foreground/[0.01] p-5 hidden md:block">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-foreground flex items-center justify-center">
                <span className="text-background text-sm font-bold">M</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Mountline</div>
                <div className="text-[11px] text-foreground/45">Client Portal</div>
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
                      ? "bg-foreground/[0.04] text-foreground" 
                      : "text-foreground/50 hover:text-foreground/70 hover:bg-foreground/[0.02]"
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
          
          {/* Main content area */}
          <div className="flex-1 p-6 lg:p-8">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-xl font-semibold text-foreground mb-1">Ridgeway Contracting</h3>
                <p className="text-sm text-foreground/45">Business Website Project</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Bell className="w-5 h-5 text-foreground/45" />
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-foreground" />
                </div>
                <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <span className="text-amber-500 text-sm font-medium">R</span>
                </div>
              </div>
            </div>
            
            {/* Grid of status cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <motion.div 
                className="p-4 rounded-xl border border-foreground/[0.06] bg-foreground/[0.015]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Clock className="w-4 h-4 text-foreground/35" />
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-medium">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-foreground">In Development</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl border border-foreground/[0.06] bg-foreground/[0.015]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-foreground/35" />
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-medium">Paid</span>
                </div>
                <div className="text-sm font-medium text-foreground">$1,250 / $2,500</div>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl border border-foreground/[0.06] bg-foreground/[0.015]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <ExternalLink className="w-4 h-4 text-foreground/35" />
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-medium">Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-foreground">Live</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-4 rounded-xl border border-foreground/[0.06] bg-foreground/[0.015]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="w-4 h-4 text-foreground/35" />
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-medium">Launch</span>
                </div>
                <div className="text-sm font-medium text-foreground">Dec 15</div>
              </motion.div>
            </div>
            
            {/* Two column layout for timeline and next step */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Timeline/checklist */}
              <motion.div 
                className="p-5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.015]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-semibold text-foreground">Project Timeline</span>
                  <span className="text-xs text-foreground/45">4 of 6 done</span>
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
                          : "border border-foreground/10"
                      }`}>
                        {step.done && <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />}
                      </div>
                      <span className={`text-sm ${
                        step.current 
                          ? "text-foreground font-medium" 
                          : step.done 
                            ? "text-foreground/55" 
                            : "text-foreground/35"
                      }`}>
                        {step.label}
                      </span>
                      {step.current && (
                        <span className="ml-auto px-2 py-0.5 rounded bg-foreground/5 text-foreground/60 text-[9px] font-medium uppercase tracking-wider border border-foreground/[0.06]">
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
                  className="p-5 rounded-xl border border-foreground/10 bg-foreground/[0.03]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55 }}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <ChevronRight className="w-4 h-4 text-foreground/60" />
                    <span className="text-[10px] text-foreground/60 uppercase tracking-wider font-medium">Next Step</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-4">
                    Review the homepage draft and leave feedback. We will schedule a quick call if needed.
                  </p>
                  <button className="inline-flex items-center gap-2 px-4 py-2.5 bg-foreground text-background rounded-lg text-sm font-medium">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Preview Site
                  </button>
                </motion.div>
                
                {/* Recent message preview */}
                <motion.div 
                  className="p-5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.015]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-4 h-4 text-foreground/35" />
                    <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-medium">Support Chat</span>
                    <span className="ml-auto w-2 h-2 rounded-full bg-foreground" />
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-7 h-7 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 border border-foreground/10">
                      <span className="text-foreground/60 text-[9px] font-bold">M</span>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-foreground mb-0.5">Mountline</div>
                      <div className="text-sm text-foreground/55 leading-relaxed">
                        Homepage is ready for your review. Let me know if you want any changes!
                      </div>
                      <div className="text-[10px] text-foreground/35 mt-1.5">2 hours ago</div>
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
        initial={{ opacity: 0, x: 40, y: -20 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.8 }}
        className="absolute -right-2 lg:-right-4 top-28 flex items-center gap-3 px-4 py-3 bg-card border border-foreground/[0.08] rounded-xl shadow-xl shadow-foreground/[0.02] max-w-[180px]"
      >
        <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </div>
        <div>
          <div className="text-xs font-medium text-foreground">Design approved</div>
          <div className="text-[10px] text-foreground/45">2 hours ago</div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ClientPortalSection() {
  return (
    <section className="py-24 lg:py-32 bg-foreground/[0.015] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-14 lg:mb-18">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-foreground/50 tracking-wide uppercase mb-5"
          >
            <span className="w-8 h-px bg-foreground/15" />
            Client Portal
            <span className="w-8 h-px bg-foreground/15" />
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
            transition={{ delay: 0.15 }}
            className="text-base lg:text-lg text-foreground/55 max-w-2xl mx-auto leading-relaxed"
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
          transition={{ delay: 0.5 }}
          className="mt-14 flex flex-wrap items-center justify-center gap-6 lg:gap-10 text-sm text-foreground/45"
        >
          <span>Fewer lost emails</span>
          <span className="w-1 h-1 rounded-full bg-foreground/20" />
          <span>Clearer project updates</span>
          <span className="w-1 h-1 rounded-full bg-foreground/20" />
          <span>Faster feedback</span>
          <span className="w-1 h-1 rounded-full bg-foreground/20" />
          <span>Payment and support in one place</span>
        </motion.div>
      </div>
    </section>
  )
}
