"use client"

import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface ConceptBuild {
  title: string
  category: string
  description: string
  href?: string
  size: "featured" | "medium" | "small"
  theme: {
    bg: string
    brand: string
    brandBg: string
    brandText: string
    headline: string
    subline: string
    cta: string
    ctaBg: string
  }
}

const conceptBuilds: ConceptBuild[] = [
  {
    title: "Contractor Services",
    category: "Full Website",
    description: "Service areas, project portfolio, testimonials, and lead capture for a residential contractor.",
    href: "/work/contractor",
    size: "featured",
    theme: {
      bg: "from-stone-900 via-stone-900 to-stone-950",
      brand: "RIDGEWAY",
      brandBg: "bg-amber-500/20",
      brandText: "text-amber-400",
      headline: "Build Something That Lasts",
      subline: "Premium residential contracting for roofing, remodels, and outdoor living.",
      cta: "Get Estimate",
      ctaBg: "bg-amber-500",
    },
  },
  {
    title: "Auto Detailing",
    category: "Full Website",
    description: "Service packages, gallery, online booking, and quote request form for a mobile detailing business.",
    href: "/work/auto-detailing",
    size: "medium",
    theme: {
      bg: "from-slate-900 via-slate-900 to-slate-950",
      brand: "SHINE AUTO",
      brandBg: "bg-sky-500/20",
      brandText: "text-sky-400",
      headline: "Professional Detailing",
      subline: "Premium mobile car care at your doorstep.",
      cta: "Book Now",
      ctaBg: "bg-sky-500",
    },
  },
  {
    title: "Local Gym",
    category: "Landing Page",
    description: "Membership tiers, class schedule, trainer profiles, and trial signup.",
    href: "/work/local-gym",
    size: "medium",
    theme: {
      bg: "from-zinc-900 via-zinc-900 to-zinc-950",
      brand: "COREHOUSE",
      brandBg: "bg-lime-500/20",
      brandText: "text-lime-400",
      headline: "Train Without Limits",
      subline: "Strength, conditioning, community.",
      cta: "Start Trial",
      ctaBg: "bg-lime-500",
    },
  },
  {
    title: "Restaurant",
    category: "Mini Site",
    description: "Menu display, location, hours, and online ordering links.",
    href: "/work/restaurant",
    size: "small",
    theme: {
      bg: "from-neutral-100 via-stone-50 to-neutral-100",
      brand: "EMBER & OAK",
      brandBg: "bg-amber-700/10",
      brandText: "text-amber-700",
      headline: "Wood-Fired Flavor",
      subline: "Farm to table dining.",
      cta: "View Menu",
      ctaBg: "bg-amber-700",
    },
  },
  {
    title: "Beauty Studio",
    category: "Full Website",
    description: "Service menu, booking path, and gallery-style preview.",
    href: "/work/beauty-studio",
    size: "small",
    theme: {
      bg: "from-rose-50 via-white to-rose-50",
      brand: "VALE STUDIO",
      brandBg: "bg-rose-400/10",
      brandText: "text-rose-500",
      headline: "Effortless Beauty",
      subline: "Premium salon services.",
      cta: "Book Now",
      ctaBg: "bg-rose-500",
    },
  },
  {
    title: "Startup",
    category: "Landing Page",
    description: "Product showcase, waitlist capture, and founder credibility.",
    href: "/work/startup",
    size: "small",
    theme: {
      bg: "from-indigo-950 via-slate-900 to-slate-950",
      brand: "LAUNCHGRID",
      brandBg: "bg-indigo-500/20",
      brandText: "text-indigo-400",
      headline: "Ship Faster",
      subline: "Modern founder toolkit.",
      cta: "Join Waitlist",
      ctaBg: "bg-indigo-500",
    },
  },
]

function WebsitePreview({ build, className = "" }: { build: ConceptBuild; className?: string }) {
  const isDark = build.theme.bg.includes("900") || build.theme.bg.includes("950")
  
  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Browser chrome */}
      <div className="absolute top-0 left-0 right-0 h-10 bg-muted/30 dark:bg-muted/20 border-b border-border/50 flex items-center px-4 z-10">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
          <div className="w-2.5 h-2.5 rounded-full bg-foreground/10" />
        </div>
        <div className="flex-1 flex justify-center">
          <div className="flex items-center gap-2 h-5 rounded bg-background/60 border border-border/30 max-w-[140px] sm:max-w-[160px] px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[9px] text-muted-foreground truncate">
              {build.theme.brand.toLowerCase().replace(/\s+/g, "").replace("&", "")}.com
            </span>
          </div>
        </div>
      </div>
      
      {/* Website content */}
      <div className={`pt-10 h-full bg-gradient-to-b ${build.theme.bg}`}>
        <div className="h-full flex flex-col p-5 sm:p-6">
          {/* Nav */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <div className={`w-7 h-7 rounded-lg ${build.theme.brandBg} flex items-center justify-center`}>
                <span className={`${build.theme.brandText} text-[10px] font-bold`}>
                  {build.theme.brand.charAt(0)}
                </span>
              </div>
              <span className={`text-xs font-bold tracking-wide ${isDark ? "text-white/90" : "text-slate-900"}`}>
                {build.theme.brand}
              </span>
            </div>
            <div className={`px-3 py-1.5 rounded-lg ${build.theme.ctaBg} text-white text-[9px] font-medium`}>
              {build.theme.cta}
            </div>
          </div>
          
          {/* Hero */}
          <div className="flex-1 flex flex-col justify-center">
            <h4 className={`text-lg sm:text-xl font-bold leading-tight mb-2 ${isDark ? "text-white" : "text-slate-900"}`}>
              {build.theme.headline}
            </h4>
            <p className={`text-[11px] mb-4 ${isDark ? "text-white/50" : "text-slate-500"}`}>
              {build.theme.subline}
            </p>
            <div className="flex gap-2">
              <div className={`px-3 py-1.5 rounded-lg ${build.theme.ctaBg} text-white text-[9px] font-medium`}>
                {build.theme.cta}
              </div>
              <div className={`px-3 py-1.5 rounded-lg border ${isDark ? "border-white/20 text-white/60" : "border-slate-300 text-slate-500"} text-[9px] font-medium`}>
                Learn More
              </div>
            </div>
          </div>
          
          {/* Bottom cards */}
          <div className="grid grid-cols-3 gap-2 mt-auto">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`p-2 rounded-lg ${isDark ? "bg-white/5 border border-white/10" : "bg-slate-100/80 border border-slate-200/50"}`}
              >
                <div className={`w-5 h-5 rounded ${build.theme.brandBg} mb-1.5`} />
                <div className={`w-full h-1.5 rounded ${isDark ? "bg-white/15" : "bg-slate-300/50"} mb-1`} />
                <div className={`w-2/3 h-1.5 rounded ${isDark ? "bg-white/10" : "bg-slate-200/50"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Concept badge */}
      <div className="absolute top-12 left-3 px-2 py-1 bg-background/80 backdrop-blur-sm rounded text-[8px] font-medium text-muted-foreground border border-border/50">
        Concept
      </div>
    </div>
  )
}

function WorkCard({ build, index }: { build: ConceptBuild; index: number }) {
  const isFeatured = build.size === "featured"
  const isMedium = build.size === "medium"
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.08 }}
      className={`group ${isFeatured ? "md:col-span-2 md:row-span-2" : ""}`}
    >
      <Link href={build.href || "#"} className="block h-full">
        <div className="h-full rounded-2xl border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-2xl hover:shadow-black/10 transition-all duration-500 group-hover:-translate-y-1">
          {/* Preview */}
          <WebsitePreview 
            build={build} 
            className={isFeatured ? "aspect-[16/10]" : isMedium ? "aspect-[16/11]" : "aspect-[16/12]"} 
          />
          
          {/* Content */}
          <div className="p-5 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                {build.category}
              </span>
              <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </div>
            
            <h3 className={`font-semibold text-foreground mb-2 group-hover:text-foreground/90 ${isFeatured ? "text-xl" : "text-lg"}`}>
              {build.title}
            </h3>
            <p className={`text-muted-foreground leading-relaxed ${isFeatured ? "text-sm" : "text-xs"}`}>
              {build.description}
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export function WorkSection() {
  const featured = conceptBuilds.filter(b => b.size === "featured")
  const medium = conceptBuilds.filter(b => b.size === "medium")
  const small = conceptBuilds.filter(b => b.size === "small")
  
  return (
    <section id="work" className="py-24 lg:py-32 bg-background">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 text-sm text-muted-foreground mb-6"
          >
            <span className="w-8 h-px bg-border" />
            Work
          </motion.div>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] max-w-3xl mb-6"
          >
            Concept builds for
            <br />
            <span className="text-muted-foreground/50">real businesses.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl"
          >
            Sample directions showing how Mountline can make different businesses look sharper online.
          </motion.p>
        </div>
        
        {/* Grid layout: Featured + 2 medium */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {featured.map((build, i) => (
            <WorkCard key={build.title} build={build} index={i} />
          ))}
          <div className="grid grid-cols-1 gap-6">
            {medium.map((build, i) => (
              <WorkCard key={build.title} build={build} index={i + featured.length} />
            ))}
          </div>
        </div>
        
        {/* 3 small cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {small.map((build, i) => (
            <WorkCard key={build.title} build={build} index={i + featured.length + medium.length} />
          ))}
        </div>
        
        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 text-center"
        >
          <p className="text-muted-foreground mb-4">
            Have a similar business? Let&apos;s build something like this for you.
          </p>
          <a 
            href="#contact"
            className="inline-flex items-center gap-2 text-foreground font-medium hover:text-muted-foreground transition-colors group"
          >
            Start a project
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
