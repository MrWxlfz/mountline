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
  ChevronRight,
  Send
} from "lucide-react"

// Large premium portal mockup
function PortalMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* Main portal window */}
      <div className="relative w-full max-w-6xl mx-auto rounded-2xl lg:rounded-3xl border border-foreground/[0.06] bg-card shadow-2xl shadow-foreground/[0.04] overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-6 py-4 border-b border-foreground/[0.06] bg-foreground/[0.01]">
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-foreground/10" />
            <div className="w-3 h-3 rounded-full bg-foreground/10" />
            <div className="w-3 h-3 rounded-full bg-foreground/10" />
          </div>
          <div className="flex-1 mx-6">
            <div className="flex items-center gap-2 px-4 py-2 bg-foreground/[0.02] rounded-lg text-sm text-foreground/40 border border-foreground/[0.06] max-w-[220px] mx-auto">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              portal.mountline.dev
            </div>
          </div>
        </div>
        
        {/* Portal content */}
        <div className="flex min-h-[560px] lg:min-h-[620px]">
          {/* Sidebar */}
          <div className="w-64 lg:w-72 border-r border-foreground/[0.06] bg-foreground/[0.01] p-6 hidden md:block">
            <div className="flex items-center gap-3 mb-12">
              <div className="w-11 h-11 rounded-xl bg-foreground flex items-center justify-center">
                <span className="text-background text-sm font-bold">M</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Mountline</div>
                <div className="text-xs text-foreground/45">Client Portal</div>
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
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                    item.active 
                      ? "bg-foreground/[0.05] text-foreground" 
                      : "text-foreground/50 hover:text-foreground/70 hover:bg-foreground/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-3">
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
            
            {/* Support shortcut */}
            <div className="mt-8 p-4 rounded-xl border border-foreground/[0.06] bg-foreground/[0.02]">
              <div className="text-xs text-foreground/50 mb-2">Need help?</div>
              <div className="text-sm text-foreground font-medium">Message Mountline</div>
            </div>
          </div>
          
          {/* Main content area */}
          <div className="flex-1 p-6 lg:p-10">
            {/* Header */}
            <div className="flex items-center justify-between mb-10">
              <div>
                <h3 className="text-2xl font-semibold text-foreground mb-1">Ridgeway Contracting</h3>
                <p className="text-sm text-foreground/45">Business Website Project</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Bell className="w-5 h-5 text-foreground/45" />
                  <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-foreground border-2 border-card" />
                </div>
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                  <span className="text-amber-500 text-sm font-medium">R</span>
                </div>
              </div>
            </div>
            
            {/* Status cards grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <motion.div 
                className="p-5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.015]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Clock className="w-4 h-4 text-foreground/35" />
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-medium">Status</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold text-foreground">In Development</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.015]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-4 h-4 text-foreground/35" />
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-medium">Paid</span>
                </div>
                <div className="text-sm font-semibold text-foreground">$1,250 / $2,500</div>
                <div className="mt-2 h-1.5 rounded-full bg-foreground/[0.06] overflow-hidden">
                  <div className="h-full w-1/2 rounded-full bg-foreground/30" />
                </div>
              </motion.div>
              
              <motion.div 
                className="p-5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.015]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <ExternalLink className="w-4 h-4 text-foreground/35" />
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-medium">Preview</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
                  <span className="text-sm font-semibold text-foreground">Live</span>
                </div>
              </motion.div>
              
              <motion.div 
                className="p-5 rounded-xl border border-foreground/[0.06] bg-foreground/[0.015]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.45 }}
              >
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="w-4 h-4 text-foreground/35" />
                  <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-medium">Launch</span>
                </div>
                <div className="text-sm font-semibold text-foreground">Dec 15, 2024</div>
              </motion.div>
            </div>
            
            {/* Two column layout */}
            <div className="grid lg:grid-cols-2 gap-6">
              {/* Timeline checklist */}
              <motion.div 
                className="p-6 rounded-xl border border-foreground/[0.06] bg-foreground/[0.015]"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 }}
              >
                <div className="flex items-center justify-between mb-6">
                  <span className="text-base font-semibold text-foreground">Project Timeline</span>
                  <span className="text-xs text-foreground/45 bg-foreground/[0.04] px-2.5 py-1 rounded-lg">4 of 6</span>
                </div>
                
                <div className="space-y-4">
                  {[
                    { label: "Kickoff call completed", done: true },
                    { label: "Content gathered", done: true },
                    { label: "Design approved", done: true },
                    { label: "Development in progress", done: true, current: true },
                    { label: "Review and revisions", done: false },
                    { label: "Launch", done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-4">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                        step.done 
                          ? "bg-green-500/10" 
                          : "border border-foreground/10 bg-foreground/[0.02]"
                      }`}>
                        {step.done && <CheckCircle2 className="w-4 h-4 text-green-500" />}
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
                        <span className="ml-auto px-2.5 py-1 rounded-lg bg-foreground/[0.04] text-foreground/60 text-[9px] font-medium uppercase tracking-wider">
                          Current
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
              
              {/* Right column - Next step + Chat */}
              <div className="space-y-6">
                {/* Next step card */}
                <motion.div 
                  className="p-6 rounded-xl border border-foreground/15 bg-foreground/[0.04]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.55 }}
                >
                  <div className="flex items-center gap-2 mb-4">
                    <ChevronRight className="w-4 h-4 text-foreground/60" />
                    <span className="text-[10px] text-foreground/60 uppercase tracking-wider font-medium">What&apos;s Next</span>
                  </div>
                  <p className="text-base text-foreground leading-relaxed mb-5">
                    Review the homepage draft and share feedback. We can schedule a quick call if helpful.
                  </p>
                  <button className="inline-flex items-center gap-2 px-5 py-3 bg-foreground text-background rounded-xl text-sm font-medium hover:bg-foreground/90 transition-colors">
                    <ExternalLink className="w-4 h-4" />
                    Preview Site
                  </button>
                </motion.div>
                
                {/* Support chat preview */}
                <motion.div 
                  className="p-6 rounded-xl border border-foreground/[0.06] bg-foreground/[0.015]"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.6 }}
                >
                  <div className="flex items-center gap-2 mb-5">
                    <MessageSquare className="w-4 h-4 text-foreground/35" />
                    <span className="text-[10px] text-foreground/45 uppercase tracking-wider font-medium">Support Chat</span>
                    <span className="ml-auto w-2.5 h-2.5 rounded-full bg-green-500" />
                  </div>
                  
                  {/* Messages */}
                  <div className="space-y-4 mb-5">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-foreground/5 flex items-center justify-center shrink-0 border border-foreground/10">
                        <span className="text-foreground/60 text-[10px] font-bold">M</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">Mountline</span>
                          <span className="text-[10px] text-foreground/35">2h ago</span>
                        </div>
                        <div className="text-sm text-foreground/55 leading-relaxed">
                          Homepage is ready for your review. Let me know if you want any changes!
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Input */}
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-foreground/[0.06] bg-card">
                    <input 
                      type="text" 
                      placeholder="Type a message..." 
                      className="flex-1 text-sm bg-transparent outline-none placeholder:text-foreground/30 text-foreground"
                      disabled
                    />
                    <button className="w-8 h-8 rounded-lg bg-foreground/[0.04] flex items-center justify-center text-foreground/40">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Floating notification */}
      <motion.div
        initial={{ opacity: 0, x: 50, y: -30 }}
        whileInView={{ opacity: 1, x: 0, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.9 }}
        className="absolute -right-2 lg:-right-6 top-32 lg:top-36 flex items-center gap-3 px-5 py-4 bg-card border border-foreground/[0.08] rounded-2xl shadow-2xl shadow-foreground/[0.03] max-w-[200px]"
      >
        <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center shrink-0">
          <CheckCircle2 className="w-5 h-5 text-green-500" />
        </div>
        <div>
          <div className="text-sm font-medium text-foreground">Design approved</div>
          <div className="text-xs text-foreground/45">2 hours ago</div>
        </div>
      </motion.div>
    </motion.div>
  )
}

export function ClientPortalSection() {
  return (
    <section className="py-28 lg:py-36 bg-foreground/[0.015] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-4 text-sm font-medium text-foreground/50 tracking-wide uppercase mb-6"
          >
            <span className="w-10 h-px bg-foreground/15" />
            Client Portal
            <span className="w-10 h-px bg-foreground/15" />
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.05] max-w-4xl mx-auto mb-6"
          >
            Every project gets a
            <span className="text-foreground/35"> private portal.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-foreground/50 max-w-2xl mx-auto leading-relaxed"
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
          className="mt-16 flex flex-wrap items-center justify-center gap-x-10 gap-y-4 text-sm text-foreground/45"
        >
          <span>Fewer lost emails</span>
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
          <span>Clearer project updates</span>
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
          <span>Faster feedback</span>
          <span className="w-1.5 h-1.5 rounded-full bg-foreground/20" />
          <span>Payment and support in one place</span>
        </motion.div>
      </div>
    </section>
  )
}
