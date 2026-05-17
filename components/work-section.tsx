"use client"

import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface ConceptBuild {
  title: string
  category: string
  href: string
  theme: "dark" | "light"
  mockContent: {
    brand: string
    brandLetter: string
    brandColor: string
    headline: string
    headlineFaded: string
    subline: string
    cta: string
  }
}

const conceptBuilds: ConceptBuild[] = [
  {
    title: "Auto Detailing",
    category: "Full Website",
    href: "/work/auto-detailing",
    theme: "dark",
    mockContent: {
      brand: "SHINE AUTO",
      brandLetter: "S",
      brandColor: "bg-amber-500",
      headline: "Professional",
      headlineFaded: "Mobile Detailing",
      subline: "Premium care for your vehicle.",
      cta: "Book Now",
    },
  },
  {
    title: "Contractor Services",
    category: "Full Website",
    href: "/work/contractor",
    theme: "dark",
    mockContent: {
      brand: "RIDGEWAY",
      brandLetter: "R",
      brandColor: "bg-amber-600",
      headline: "Build Something",
      headlineFaded: "That Lasts",
      subline: "Trusted residential contracting.",
      cta: "Get Estimate",
    },
  },
  {
    title: "Local Gym",
    category: "Landing Page",
    href: "/work/local-gym",
    theme: "dark",
    mockContent: {
      brand: "COREHOUSE",
      brandLetter: "C",
      brandColor: "bg-lime-500",
      headline: "Train Without",
      headlineFaded: "Limits",
      subline: "Strength. Conditioning. Community.",
      cta: "Start Trial",
    },
  },
  {
    title: "Restaurant",
    category: "Mini Site",
    href: "/work/restaurant",
    theme: "light",
    mockContent: {
      brand: "EMBER & OAK",
      brandLetter: "E",
      brandColor: "bg-amber-700",
      headline: "Wood-Fired",
      headlineFaded: "Flavor",
      subline: "Farm to table dining.",
      cta: "View Menu",
    },
  },
  {
    title: "Startup",
    category: "Landing Page",
    href: "/work/startup",
    theme: "dark",
    mockContent: {
      brand: "LAUNCHGRID",
      brandLetter: "L",
      brandColor: "bg-indigo-500",
      headline: "Ship Faster",
      headlineFaded: "Launch Smarter",
      subline: "The modern founder toolkit.",
      cta: "Join Waitlist",
    },
  },
  {
    title: "Beauty Studio",
    category: "Full Website",
    href: "/work/beauty-studio",
    theme: "light",
    mockContent: {
      brand: "VALE STUDIO",
      brandLetter: "V",
      brandColor: "bg-rose-400",
      headline: "Effortless",
      headlineFaded: "Beauty",
      subline: "Premium salon services.",
      cta: "Book Now",
    },
  },
]

function WebsitePreview({ build }: { build: ConceptBuild }) {
  const isDark = build.theme === "dark"
  
  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* Browser chrome */}
      <div className={`h-8 ${isDark ? "bg-[#0a0a0a]" : "bg-slate-100"} border-b ${isDark ? "border-white/[0.04]" : "border-slate-200/60"} flex items-center px-3`}>
        <div className="flex gap-1.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-white/[0.08]" : "bg-slate-300"}`} />
          <div className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-white/[0.08]" : "bg-slate-300"}`} />
          <div className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-white/[0.08]" : "bg-slate-300"}`} />
        </div>
      </div>
      
      {/* Website content */}
      <div className={`aspect-[16/10] p-6 lg:p-8 flex flex-col ${
        isDark 
          ? "bg-gradient-to-br from-[#0c0c0c] to-[#0f0f0f]" 
          : "bg-gradient-to-br from-stone-50 to-white"
      }`}>
        {/* Nav */}
        <div className="flex items-center justify-between mb-auto">
          <div className="flex items-center gap-2">
            <div className={`w-6 h-6 rounded-lg ${build.mockContent.brandColor} flex items-center justify-center`}>
              <span className="text-white text-[10px] font-bold">{build.mockContent.brandLetter}</span>
            </div>
            <span className={`text-[10px] font-bold tracking-wider ${isDark ? "text-white/60" : "text-slate-700"}`}>
              {build.mockContent.brand}
            </span>
          </div>
          <div className={`px-2.5 py-1 rounded-md ${build.mockContent.brandColor} text-white text-[9px] font-medium`}>
            {build.mockContent.cta}
          </div>
        </div>
        
        {/* Hero content */}
        <div className="my-auto">
          <h4 className={`text-xl lg:text-2xl font-bold leading-[1.1] mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
            {build.mockContent.headline}
            <span className={`block ${isDark ? "text-white/30" : "text-slate-400"}`}>
              {build.mockContent.headlineFaded}
            </span>
          </h4>
          <p className={`text-[11px] mb-4 ${isDark ? "text-white/35" : "text-slate-500"}`}>
            {build.mockContent.subline}
          </p>
          <div className={`inline-block px-3 py-1.5 rounded-md ${build.mockContent.brandColor} text-white text-[10px] font-medium`}>
            {build.mockContent.cta}
          </div>
        </div>
        
        {/* Bottom placeholder */}
        <div className="flex gap-2 mt-auto">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className={`flex-1 h-8 rounded-md ${isDark ? "bg-white/[0.02]" : "bg-slate-100"}`}
            />
          ))}
        </div>
      </div>
      
      {/* Concept badge */}
      <div className="absolute top-10 left-3 px-2 py-0.5 bg-black/80 backdrop-blur rounded text-[8px] font-medium text-white/60">
        Concept
      </div>
    </div>
  )
}

export function WorkSection() {
  return (
    <section id="work" className="py-28 lg:py-36 bg-black">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-white/30 tracking-wide uppercase mb-6"
          >
            <span className="w-8 h-px bg-white/10" />
            Work
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight leading-[1.05] max-w-3xl mb-6"
          >
            Concept builds for
            <span className="text-white/25"> real businesses.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-white/35 max-w-xl leading-relaxed"
          >
            Sample directions that show how Mountline can make different businesses look sharper online.
          </motion.p>
        </div>
        
        {/* Work grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6">
          {conceptBuilds.map((build, index) => (
            <motion.div
              key={build.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.06 }}
            >
              <Link href={build.href} className="group block">
                <div className="rounded-2xl border border-white/[0.06] bg-white/[0.01] overflow-hidden hover:border-white/[0.1] hover:bg-white/[0.02] transition-all duration-300">
                  <WebsitePreview build={build} />
                  
                  {/* Content */}
                  <div className="p-5 lg:p-6 border-t border-white/[0.04]">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] text-white/30 uppercase tracking-wider font-medium">
                          {build.category}
                        </span>
                        <h3 className="text-base font-semibold text-white mt-1 group-hover:text-white/80 transition-colors">
                          {build.title}
                        </h3>
                      </div>
                      <ArrowUpRight className="w-4 h-4 text-white/20 group-hover:text-white/50 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-white/30 text-sm mb-4">
            Have a similar business? Let&apos;s build something like this for you.
          </p>
          <a 
            href="#contact"
            className="inline-flex items-center gap-2 text-white font-medium hover:text-white/70 transition-colors group"
          >
            Start a project
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
