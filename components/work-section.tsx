"use client"

import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface ConceptBuild {
  title: string
  category: string
  description: string
  tags: string[]
  href?: string
  theme: "dark" | "light"
  mockContent: {
    brand: string
    brandLetter: string
    brandColor: string
    headline: string
    headlineFaded: string
    subline: string
    cta: string
    ctaSecondary: string
  }
}

const conceptBuilds: ConceptBuild[] = [
  {
    title: "Auto Detailing",
    category: "Full Website",
    description: "Service packages, gallery, online booking, and quote request form for a mobile detailing business.",
    tags: ["5 pages", "Booking", "Gallery"],
    href: "/work/auto-detailing",
    theme: "dark",
    mockContent: {
      brand: "SHINE AUTO",
      brandLetter: "S",
      brandColor: "bg-amber-500",
      headline: "Professional",
      headlineFaded: "Mobile Detailing",
      subline: "Premium care for your vehicle, anywhere you need us.",
      cta: "Book Now",
      ctaSecondary: "View Packages",
    },
  },
  {
    title: "Contractor Services",
    category: "Full Website",
    description: "Service areas, project portfolio, testimonials, and lead capture for a residential contractor.",
    tags: ["6 pages", "Portfolio", "Lead form"],
    href: "/work/contractor",
    theme: "dark",
    mockContent: {
      brand: "RIDGEWAY",
      brandLetter: "R",
      brandColor: "bg-amber-600",
      headline: "Build Something",
      headlineFaded: "That Lasts",
      subline: "Trusted residential contracting since 2008.",
      cta: "Get Estimate",
      ctaSecondary: "View Work",
    },
  },
  {
    title: "Local Gym",
    category: "Landing Page",
    description: "Membership tiers, class schedule, trainer profiles, and trial signup for a local fitness center.",
    tags: ["Single page", "Pricing", "Signup"],
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
      ctaSecondary: "View Classes",
    },
  },
  {
    title: "Restaurant",
    category: "Mini Site",
    description: "Menu display, location schedule, hours, and online ordering links for a food business.",
    tags: ["3 pages", "Menu", "Orders"],
    href: "/work/restaurant",
    theme: "light",
    mockContent: {
      brand: "EMBER & OAK",
      brandLetter: "E",
      brandColor: "bg-amber-700",
      headline: "Wood-Fired",
      headlineFaded: "Flavor",
      subline: "Farm to table dining experience.",
      cta: "View Menu",
      ctaSecondary: "Order Online",
    },
  },
  {
    title: "Creator / Startup",
    category: "Landing Page",
    description: "Product showcase, waitlist capture, and founder credibility for early-stage startups.",
    tags: ["Single page", "Waitlist", "Social proof"],
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
      ctaSecondary: "Learn More",
    },
  },
  {
    title: "Beauty Studio",
    category: "Full Website",
    description: "Service menu, booking path, gallery-style preview, and appointment request flow.",
    tags: ["4 pages", "Booking", "Services"],
    href: "/work/beauty-studio",
    theme: "light",
    mockContent: {
      brand: "VALE STUDIO",
      brandLetter: "V",
      brandColor: "bg-rose-400",
      headline: "Effortless",
      headlineFaded: "Beauty",
      subline: "Premium salon services in a serene space.",
      cta: "Book Now",
      ctaSecondary: "View Services",
    },
  },
]

function LargeWebsitePreview({ build, index }: { build: ConceptBuild; index: number }) {
  const isDark = build.theme === "dark"
  
  return (
    <div className="relative overflow-hidden rounded-xl lg:rounded-2xl">
      {/* Browser chrome */}
      <div className="absolute top-0 left-0 right-0 h-9 bg-foreground/[0.015] border-b border-foreground/[0.06] flex items-center px-4 z-10">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
        </div>
        <div className="flex-1 mx-4">
          <div className="flex items-center gap-2 h-5 rounded bg-foreground/[0.02] border border-foreground/[0.06] max-w-[140px] mx-auto px-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[9px] text-foreground/40 truncate">
              {build.mockContent.brand.toLowerCase().replace(/\s+/g, "").replace("&", "")}.com
            </span>
          </div>
        </div>
      </div>
      
      {/* Website content */}
      <div className={`pt-9 ${isDark ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" : "bg-gradient-to-br from-stone-50 via-white to-stone-100"}`}>
        <div className="aspect-[16/10] p-6 sm:p-8 lg:p-10 flex flex-col">
          {/* Nav */}
          <div className="flex items-center justify-between mb-auto">
            <div className="flex items-center gap-2.5">
              <div className={`w-7 h-7 rounded-lg ${build.mockContent.brandColor} flex items-center justify-center`}>
                <span className="text-white text-xs font-bold">
                  {build.mockContent.brandLetter}
                </span>
              </div>
              <span className={`text-xs font-bold tracking-wider ${isDark ? "text-white/70" : "text-slate-800"}`}>
                {build.mockContent.brand}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className={`text-[10px] hidden sm:block ${isDark ? "text-white/30" : "text-slate-400"}`}>Services</span>
              <span className={`text-[10px] hidden sm:block ${isDark ? "text-white/30" : "text-slate-400"}`}>About</span>
              <div className={`px-3 py-1.5 rounded-lg ${build.mockContent.brandColor} text-white text-[10px] font-medium`}>
                {build.mockContent.cta}
              </div>
            </div>
          </div>
          
          {/* Hero content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 + index * 0.05 }}
            className="my-auto max-w-[70%]"
          >
            <h4 className={`text-2xl sm:text-3xl lg:text-4xl font-bold leading-[1.1] mb-3 ${isDark ? "text-white" : "text-slate-900"}`}>
              {build.mockContent.headline}
              <span className={`block ${isDark ? "text-white/35" : "text-slate-400"}`}>
                {build.mockContent.headlineFaded}
              </span>
            </h4>
            <p className={`text-sm mb-5 max-w-[280px] ${isDark ? "text-white/40" : "text-slate-500"}`}>
              {build.mockContent.subline}
            </p>
            <div className="flex gap-2">
              <div className={`px-4 py-2.5 rounded-lg ${build.mockContent.brandColor} text-white text-xs font-medium`}>
                {build.mockContent.cta}
              </div>
              <div className={`px-4 py-2.5 rounded-lg border ${isDark ? "border-white/10 text-white/50" : "border-slate-300 text-slate-500"} text-xs font-medium`}>
                {build.mockContent.ctaSecondary}
              </div>
            </div>
          </motion.div>
          
          {/* Bottom feature cards */}
          <div className="flex gap-2 mt-auto">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`flex-1 p-3 rounded-lg ${isDark ? "bg-white/[0.02] border border-white/[0.05]" : "bg-slate-100/80 border border-slate-200/50"}`}
              >
                <div className={`w-5 h-5 rounded ${isDark ? "bg-white/5" : "bg-slate-200/80"} mb-2`} />
                <div className={`w-full h-1.5 rounded ${isDark ? "bg-white/[0.06]" : "bg-slate-200/60"} mb-1`} />
                <div className={`w-2/3 h-1.5 rounded ${isDark ? "bg-white/[0.03]" : "bg-slate-100/60"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Concept badge */}
      <div className="absolute top-12 left-4 px-2 py-1 bg-background/90 backdrop-blur rounded text-[9px] font-medium text-foreground/50 border border-foreground/[0.06]">
        Concept
      </div>
    </div>
  )
}

export function WorkSection() {
  return (
    <section id="work" className="py-28 lg:py-36 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-foreground/50 tracking-wide uppercase mb-6"
          >
            <span className="w-10 h-px bg-foreground/15" />
            Work
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.05] max-w-3xl mb-6"
          >
            Concept builds for
            <span className="text-foreground/35"> real businesses.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15 }}
            className="text-lg text-foreground/50 max-w-xl leading-relaxed"
          >
            Sample directions that show the kind of online presence Mountline can create for your business.
          </motion.p>
        </div>
        
        {/* Work grid - larger cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {conceptBuilds.map((build, index) => (
            <motion.div
              key={build.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -6, transition: { duration: 0.3 } }}
              className="group"
            >
              <Link href={build.href || "#"} className="block">
                <div className="rounded-xl lg:rounded-2xl border border-foreground/[0.06] bg-card overflow-hidden hover:border-foreground/12 hover:shadow-2xl hover:shadow-foreground/[0.03] transition-all duration-400">
                  {/* Large preview */}
                  <LargeWebsitePreview build={build} index={index} />
                  
                  {/* Content */}
                  <div className="p-6 lg:p-8 border-t border-foreground/[0.06]">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="text-[10px] text-foreground/40 uppercase tracking-wider font-medium">
                          {build.category}
                        </span>
                        <h3 className="text-xl font-semibold text-foreground mt-1 group-hover:text-accent transition-colors">
                          {build.title}
                        </h3>
                      </div>
                      <ArrowUpRight className="w-5 h-5 text-foreground/25 group-hover:text-foreground/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    
                    <p className="text-sm text-foreground/50 leading-relaxed mb-5">
                      {build.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2">
                      {build.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="text-[10px] text-foreground/45 bg-foreground/[0.02] border border-foreground/[0.06] px-2.5 py-1.5 rounded-lg"
                        >
                          {tag}
                        </span>
                      ))}
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
          <p className="text-foreground/40 mb-4">
            Have a similar business? Let&apos;s build something like this for you.
          </p>
          <a 
            href="#contact"
            className="inline-flex items-center gap-2.5 text-foreground font-medium hover:text-accent transition-colors group"
          >
            Start a project
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
