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
    subline: string
    cta: string
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
      headline: "Professional Mobile Detailing",
      subline: "Premium care for your vehicle",
      cta: "Book Now",
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
      headline: "Build Something That Lasts",
      subline: "Trusted residential contracting",
      cta: "Get Estimate",
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
      headline: "Train Without Limits",
      subline: "Strength. Conditioning. Community.",
      cta: "Start Trial",
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
      headline: "Wood-Fired Flavor",
      subline: "Farm to table dining experience",
      cta: "View Menu",
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
      headline: "Ship Faster, Launch Smarter",
      subline: "The modern founder toolkit",
      cta: "Join Waitlist",
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
      headline: "Effortless Beauty",
      subline: "Premium salon services",
      cta: "Book Now",
    },
  },
]

function WebsitePreview({ build, index }: { build: ConceptBuild; index: number }) {
  const isDark = build.theme === "dark"
  
  return (
    <div className="aspect-[4/3] relative overflow-hidden rounded-t-xl">
      {/* Browser chrome */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-foreground/[0.02] border-b border-foreground/[0.06] flex items-center px-3 z-10">
        <div className="flex gap-1.5">
          <div className="w-2 h-2 rounded-full bg-foreground/10" />
          <div className="w-2 h-2 rounded-full bg-foreground/10" />
          <div className="w-2 h-2 rounded-full bg-foreground/10" />
        </div>
        <div className="flex-1 mx-3">
          <div className="flex items-center gap-1.5 h-4 rounded bg-foreground/[0.02] border border-foreground/[0.06] max-w-[120px] mx-auto px-2">
            <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
            <span className="text-[7px] text-foreground/35 truncate">
              {build.mockContent.brand.toLowerCase().replace(/\s+/g, "").replace("&", "")}.com
            </span>
          </div>
        </div>
      </div>
      
      {/* Website content preview */}
      <div className={`absolute inset-0 top-7 ${isDark ? "bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" : "bg-gradient-to-br from-stone-50 via-white to-stone-100"}`}>
        <div className="h-full flex flex-col p-4">
          {/* Nav */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className={`w-5 h-5 rounded ${build.mockContent.brandColor} flex items-center justify-center`}>
                <span className="text-white text-[8px] font-bold">
                  {build.mockContent.brandLetter}
                </span>
              </div>
              <span className={`text-[9px] font-bold tracking-wider ${isDark ? "text-white/70" : "text-slate-800"}`}>
                {build.mockContent.brand}
              </span>
            </div>
            <div className={`px-2 py-1 rounded ${build.mockContent.brandColor} text-white text-[7px] font-medium`}>
              {build.mockContent.cta}
            </div>
          </div>
          
          {/* Hero content */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <h4 className={`text-sm font-bold leading-tight mb-1.5 ${isDark ? "text-white" : "text-slate-900"}`}>
                {build.mockContent.headline}
              </h4>
              <p className={`text-[9px] mb-3 ${isDark ? "text-white/40" : "text-slate-500"}`}>
                {build.mockContent.subline}
              </p>
              <div className="flex gap-1.5">
                <div className={`px-2 py-1.5 rounded ${build.mockContent.brandColor} text-white text-[7px] font-medium`}>
                  {build.mockContent.cta}
                </div>
                <div className={`px-2 py-1.5 rounded border ${isDark ? "border-white/10 text-white/50" : "border-slate-300 text-slate-500"} text-[7px] font-medium`}>
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
                className={`p-2 rounded ${isDark ? "bg-white/[0.02] border border-white/[0.04]" : "bg-slate-100/60 border border-slate-200/40"}`}
              >
                <div className={`w-3 h-3 rounded ${isDark ? "bg-white/5" : "bg-slate-200/60"} mb-1`} />
                <div className={`w-full h-1 rounded ${isDark ? "bg-white/[0.06]" : "bg-slate-200/50"} mb-0.5`} />
                <div className={`w-2/3 h-1 rounded ${isDark ? "bg-white/[0.03]" : "bg-slate-100/50"}`} />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Concept label */}
      <div className="absolute top-9 left-2 px-1.5 py-0.5 bg-background/90 backdrop-blur-sm rounded text-[7px] font-medium text-foreground/50 border border-foreground/[0.06]">
        Concept
      </div>
    </div>
  )
}

export function WorkSection() {
  return (
    <section id="work" className="py-24 lg:py-32 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-16 lg:mb-20">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-3 text-sm font-medium text-foreground/50 tracking-wide uppercase mb-5"
          >
            <span className="w-8 h-px bg-foreground/15" />
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
            transition={{ delay: 0.15 }}
            className="text-base lg:text-lg text-foreground/55 max-w-xl leading-relaxed"
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
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -4, transition: { duration: 0.25 } }}
              className="group"
            >
              <Link href={build.href || "#"} className="block">
                <div className="rounded-xl border border-foreground/[0.06] bg-card overflow-hidden hover:border-foreground/10 hover:shadow-xl hover:shadow-foreground/[0.02] transition-all duration-300">
                  {/* Preview area */}
                  <WebsitePreview build={build} index={index} />
                  
                  {/* Content */}
                  <div className="p-5 border-t border-foreground/[0.06]">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] text-foreground/40 uppercase tracking-wider font-medium">
                        {build.category}
                      </span>
                      <ArrowUpRight className="w-4 h-4 text-foreground/25 group-hover:text-foreground/60 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </div>
                    
                    <h3 className="text-base font-semibold text-foreground mb-2 group-hover:text-accent transition-colors">
                      {build.title}
                    </h3>
                    <p className="text-sm text-foreground/55 leading-relaxed mb-4">
                      {build.description}
                    </p>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-1.5">
                      {build.tags.map((tag) => (
                        <span 
                          key={tag} 
                          className="text-[9px] text-foreground/45 bg-foreground/[0.02] border border-foreground/[0.06] px-2 py-1 rounded-full"
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
          className="mt-14 text-center"
        >
          <p className="text-foreground/45 mb-3 text-sm">
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
