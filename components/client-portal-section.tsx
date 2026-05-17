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
  Calendar,
  ChevronRight,
  Send
} from "lucide-react"

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
      <div className="relative w-full max-w-5xl mx-auto rounded-2xl border border-white/[0.06] bg-[#080808] shadow-2xl shadow-black/60 overflow-hidden">
        {/* Window chrome */}
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.04] bg-[#0a0a0a]">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-white/[0.06]" />
            <div className="w-3 h-3 rounded-full bg-white/[0.06]" />
            <div className="w-3 h-3 rounded-full bg-white/[0.06]" />
          </div>
          <div className="flex-1 mx-4">
            <div className="flex items-center gap-2 px-4 py-1.5 bg-white/[0.03] rounded-lg border border-white/[0.04] max-w-[200px] mx-auto">
              <div className="w-2 h-2 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] text-white/30 font-mono">portal.mountline.dev</span>
            </div>
          </div>
        </div>
        
        {/* Portal content */}
        <div className="flex min-h-[480px] lg:min-h-[540px]">
          {/* Sidebar */}
          <div className="w-56 lg:w-64 border-r border-white/[0.04] bg-[#060606] p-5 hidden md:block">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">
                <span className="text-black text-sm font-bold">M</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-white">Mountline</div>
                <div className="text-[10px] text-white/35">Client Portal</div>
              </div>
            </div>
            
            <nav className="space-y-1">
              {[
                { icon: LayoutDashboard, label: "Dashboard", active: true },
                { icon: FileText, label: "Project", active: false },
                { icon: MessageSquare, label: "Messages", active: false, badge: 2 },
                { icon: CreditCard, label: "Payments", active: false },
                { icon: ExternalLink, label: "Preview", active: false },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium ${
                    item.active 
                      ? "bg-white/[0.06] text-white" 
                      : "text-white/35 hover:text-white/50 hover:bg-white/[0.02]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </div>
                  {item.badge && (
                    <span className="w-5 h-5 rounded-full bg-white text-black text-[10px] flex items-center justify-center font-medium">
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
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-xl font-semibold text-white mb-1">Ridgeway Contracting</h3>
                <p className="text-xs text-white/35">Business Website Project</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                <span className="text-amber-500 text-sm font-medium">R</span>
              </div>
            </div>
            
            {/* Status cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
              {[
                { icon: Clock, label: "Status", value: "In Development", dot: true },
                { icon: CreditCard, label: "Paid", value: "$1,250 / $2,500", progress: 50 },
                { icon: ExternalLink, label: "Preview", value: "Live", dot: true },
                { icon: Calendar, label: "Launch", value: "Dec 15" },
              ].map((card) => (
                <div key={card.label} className="p-4 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                  <div className="flex items-center gap-1.5 mb-3">
                    <card.icon className="w-3.5 h-3.5 text-white/25" />
                    <span className="text-[9px] text-white/30 uppercase tracking-wider font-medium">{card.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {card.dot && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                    <span className="text-sm font-medium text-white">{card.value}</span>
                  </div>
                  {card.progress && (
                    <div className="mt-2 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                      <div className="h-full rounded-full bg-white/30" style={{ width: `${card.progress}%` }} />
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            {/* Two columns */}
            <div className="grid lg:grid-cols-2 gap-4">
              {/* Timeline */}
              <div className="p-5 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                <div className="flex items-center justify-between mb-5">
                  <span className="text-sm font-semibold text-white">Timeline</span>
                  <span className="text-[10px] text-white/30 bg-white/[0.03] px-2 py-1 rounded">4/6</span>
                </div>
                <div className="space-y-3">
                  {[
                    { label: "Kickoff", done: true },
                    { label: "Content", done: true },
                    { label: "Design", done: true },
                    { label: "Development", done: true, current: true },
                    { label: "Review", done: false },
                    { label: "Launch", done: false },
                  ].map((step, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                        step.done ? "bg-emerald-500/15" : "border border-white/10"
                      }`}>
                        {step.done && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      </div>
                      <span className={`text-xs ${step.current ? "text-white font-medium" : step.done ? "text-white/45" : "text-white/25"}`}>
                        {step.label}
                      </span>
                      {step.current && (
                        <span className="ml-auto text-[8px] text-white/40 bg-white/[0.04] px-1.5 py-0.5 rounded uppercase">Now</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              {/* Right column */}
              <div className="space-y-4">
                {/* Next step */}
                <div className="p-5 rounded-xl border border-white/[0.08] bg-white/[0.02]">
                  <div className="flex items-center gap-1.5 mb-3">
                    <ChevronRight className="w-3.5 h-3.5 text-white/40" />
                    <span className="text-[9px] text-white/40 uppercase tracking-wider font-medium">Next</span>
                  </div>
                  <p className="text-sm text-white leading-relaxed mb-4">
                    Review the homepage draft and share feedback.
                  </p>
                  <button className="flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg text-xs font-medium">
                    <ExternalLink className="w-3.5 h-3.5" />
                    Preview Site
                  </button>
                </div>
                
                {/* Chat */}
                <div className="p-5 rounded-xl border border-white/[0.04] bg-white/[0.01]">
                  <div className="flex items-center gap-1.5 mb-4">
                    <MessageSquare className="w-3.5 h-3.5 text-white/25" />
                    <span className="text-[9px] text-white/30 uppercase tracking-wider font-medium">Support</span>
                  </div>
                  <div className="flex items-start gap-2.5 mb-4">
                    <div className="w-6 h-6 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                      <span className="text-white/50 text-[8px] font-bold">M</span>
                    </div>
                    <div>
                      <div className="text-[10px] text-white/30 mb-0.5">Mountline</div>
                      <div className="text-xs text-white/50">Homepage ready for review!</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 p-2.5 rounded-lg border border-white/[0.04] bg-[#0a0a0a]">
                    <input type="text" placeholder="Message..." className="flex-1 text-xs bg-transparent outline-none placeholder:text-white/20 text-white" disabled />
                    <Send className="w-3.5 h-3.5 text-white/20" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export function ClientPortalSection() {
  return (
    <section id="portal" className="py-28 lg:py-36 bg-black border-t border-white/[0.04] overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-white/25 tracking-wide uppercase mb-6"
          >
            <span className="w-8 h-px bg-white/10" />
            Portal
            <span className="w-8 h-px bg-white/10" />
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] max-w-4xl mx-auto mb-6"
          >
            Every project gets a
            <span className="text-white/25"> private portal.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-white/35 max-w-2xl mx-auto leading-relaxed"
          >
            Clients can track progress, review links, send support messages, and view payment details in one private Mountline portal.
          </motion.p>
        </div>
        
        <PortalMockup />
        
        {/* Highlights */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="mt-16 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/30"
        >
          <span>Fewer lost emails</span>
          <span className="w-1 h-1 rounded-full bg-white/15" />
          <span>Clearer updates</span>
          <span className="w-1 h-1 rounded-full bg-white/15" />
          <span>Faster feedback</span>
          <span className="w-1 h-1 rounded-full bg-white/15" />
          <span>Payment + support in one place</span>
        </motion.div>
      </div>
    </section>
  )
}
