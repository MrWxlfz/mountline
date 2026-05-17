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
    brandColor: string
    headline: string
    subline: string
    cta: string
    accent: string
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
      brandColor: "bg-amber-500",
      headline: "Professional Mobile Detailing",
      subline: "Premium care for your vehicle",
      cta: "Book Now",
      accent: "amber",
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
      brandColor: "bg-amber-600",
      headline: "Build Something That Lasts",
      subline: "Trusted residential contracting",
      cta: "Get Estimate",
      accent: "amber",
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
      brandColor: "bg-lime-500",
      headline: "Train Without Limits",
      subline: "Strength. Conditioning. Community.",
      cta: "Start Trial",
      accent: "lime",
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
      brandColor: "bg-amber-700",
      headline: "Wood-Fired Flavor",
      subline: "Farm to table dining experience",
      cta: "View Menu",
      accent: "amber",
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
      brandColor: "bg-indigo-500",
      headline: "Ship Faster, Launch Smarter",
      subline: "The modern founder toolkit",
      cta: "Join Waitlist",
      accent: "indigo",
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
      brandColor: "bg-rose-400",
      headline: "Effortless Beauty",
      subline: "Premium salon services",
      cta: "Book Now",
      accent: "rose",
    },
  },
]

function RichWebsitePreview({ build, index }: { build: ConceptBuild; index: number }) {
  const isDark = build.theme === "dark"
  
  // Accent color classes
  const accentClasses: Record<string, { bg: string; text: string; bgLight: string }> = {
    amber: { bg: "bg-amber-500", text: "text-amber-500", bgLight: "bg-amber-500/20" },
    lime: { bg: "bg-lime-500", text: "text-lime-500", bgLight: "bg-lime-500/20" },
    indigo: { bg: "bg-indigo-500", text: "text-indigo-500", bgLight: "bg-indigo-500/20" },
    rose: { bg: "bg-rose-400", text: "text-rose-400", bgLight: "bg-rose-400/20" },
  }
  
  const accent = accentClasses[build.mockContent.accent] || accentClasses.amber
  
  return (
    <div className="aspect-[4/3] relative overflow-hidden rounded-t-xl">
      {/* Browser chrome */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-foreground/[0.03] border-b border-foreground/10 flex items-center px-3 z-10">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-foreground/15" />
          <div className="w-2 h-2 rounded-full bg-foreground/15" />
          <div className="w-2 h-2 rounded-full bg-foreground/15" />
        </div>
        <div className="flex-1 mx-3">
          <div className="flex items-center gap-1.5 h-4 rounded bg-foreground/[0.03] border border-foreground/10 max-w-[140px] mx-auto px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[8px] text-foreground/40 truncate">
              {build.mockContent.brand.toLowerCase().replace(/\s+/g, "")}.com
            </span>
          </div>
        </div>
      </div>
      
      {/* Website content preview */}
      <div className={`absolute inset-0 top-7 ${isDark ? "bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800" : "bg-gradient-to-br from-stone-50 via-white to-stone-100"}`}>
        <div className="h-full flex flex-col p-4">
          {/* Nav */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded ${accent.bgLight} flex items-center justify-center`}>
                <span className={`${accent.text} text-[7px] font-bold`}>
                  {build.mockContent.brand.charAt(0)}
                </span>
              </div>
              <span className={`text-[9px] font-bold tracking-wider ${isDark ? "text-white/80" : "text-slate-900/80"}`}>
                {build.mockContent.brand}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-1 rounded ${isDark ? "bg-white/10" : "bg-slate-900/10"}`} />
              <div className={`w-6 h-1 rounded ${isDark ? "bg-white/10" : "bg-slate-900/10"}`} />
              <div className={`px-2 py-1 rounded ${accent.bg} text-white text-[7px] font-medium`}>
                {build.mockContent.cta}
              </div>
            </div>
          </div>
          
          {/* Hero content */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
            >
              <h4 className={`text-sm sm:text-base font-bold leading-tight mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
                {build.mockContent.headline}
              </h4>
              <p className={`text-[9px] mb-3 ${isDark ? "text-white/45" : "text-slate-600"}`}>
                {build.mockContent.subline}
              </p>
              <div className="flex gap-1.5">
                <div className={`px-2.5 py-1.5 rounded ${accent.bg} text-white text-[8px] font-medium`}>
                  {build.mockContent.cta}
                </div>
                <div className={`px-2.5 py-1.5 rounded border ${isDark ? "border-white/15 text-white/60" : "border-slate-300 text-slate-600"} text-[8px] font-medium`}>
                  Learn More
                </div>
              </div>
            </motion.div>
          </div>
          
          {/* Bottom feature cards */}
          <div className="grid grid-cols-3 gap-1.5">
            {[1, 2, 3].map((i) => (
              <div 
                key={i} 
                className={`p-2 rounded ${isDark ? "bg-white/[0.03] border border-white/[0.06]" : "bg-slate-100/80 border border-slate-200/50"}`}
              >
                <div className={`w-4 h-4 rounded ${accent.bgLight} mb-1`} />
                <div className={`w-full h-1 rounded ${isDark ? "bg-white/10" : "bg-slate-300/50"} mb-0.5`} />
                <div className={`w-2/3 h-1 rounded ${isDark ? "bg-white/[0.06]" : "bg-slate-200/50"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Concept label */}
      <div className="absolute top-9 left-2 px-1.5 py-0.5 bg-background/90 backdrop-blur-sm rounded text-[7px] font-medium text-foreground/60 border border-foreground/10">
        Concept
      </div>
    </div>
  )
}

export function WorkSection() {
  return (
    <section id="work" className="py-20 lg:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-14 lg:mb-16">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-foreground/60 tracking-wide uppercase mb-4"
          >
            <span className="w-8 h-px bg-foreground/20" />
            Work
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground tracking-tight leading-[1.1] max-w-3xl mb-5"
          >
            Concept builds for
            <span className="text-foreground/40"> real businesses.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base lg:text-lg text-foreground/60 max-w-xl leading-relaxed"
          >
            Sample directions that show the kind of online presence Mountline can create for your business.
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
              transition={{ delay: index * 0.08 }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="group"
            >
              <Link href={build.href || "#"} className="block">
                <div className="rounded-xl border border-foreground/10 bg-card overflow-hidden hover:border-foreground/20 hover:shadow-xl hover:shadow-foreground/5 transition-all duration-300">
                  {/* Preview area */}
                  <RichWebsitePreview build={build} index={index} />
                  
                  {/* Content */}
                  <div className="p-5 border-t border-foreground/10">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-foreground/50 uppercase tracking-wider font-medium">
                        {build.category}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-foreground/30 group-hover:text-foreground/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    
                    <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {build.title}
                    </h3>
                    <p className="text-sm text-foreground/60 leading-relaxed mb-4">
                      {build.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {build.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="text-[10px] text-foreground/50 bg-foreground/[0.03] border border-foreground/10 px-2 py-1 rounded-full"
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
          className="mt-12 text-center"
        >
          <p className="text-foreground/50 mb-3 text-sm">
            Have a similar business? Let&apos;s build something like this for you.
          </p>
          <a 
            href="#contact"
            className="inline-flex items-center gap-2 text-foreground font-medium hover:text-accent transition-colors group"
          >
            Start a project
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
