"use client"

import { motion } from "framer-motion"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

interface ConceptBuild {
  title: string
  category: string
  description: string
  tags: string[]
  colorAccent: string
  href?: string
  mockContent: {
    nav: string
    headline: string
    cta: string
  }
}

const conceptBuilds: ConceptBuild[] = [
  {
    title: "Auto Detailing",
    category: "Full Website",
    description: "Service packages, gallery, online booking, and quote request form for a mobile detailing business.",
    tags: ["5 pages", "Booking", "Gallery"],
    colorAccent: "bg-amber-500",
    href: "/work/auto-detailing",
    mockContent: {
      nav: "SHINE AUTO",
      headline: "Professional Mobile Detailing",
      cta: "Book Now",
    },
  },
  {
    title: "Contractor Services",
    category: "Full Website",
    description: "Service areas, project portfolio, testimonials, and lead capture for a residential contractor.",
    tags: ["6 pages", "Portfolio", "Lead form"],
    colorAccent: "bg-blue-600",
    mockContent: {
      nav: "BUILDRIGHT",
      headline: "Quality Home Renovations",
      cta: "Get Quote",
    },
  },
  {
    title: "Local Gym",
    category: "Landing Page",
    description: "Membership tiers, class schedule, trainer profiles, and trial signup for a local fitness center.",
    tags: ["Single page", "Pricing", "Signup"],
    colorAccent: "bg-red-500",
    mockContent: {
      nav: "IRON STRENGTH",
      headline: "Transform Your Body",
      cta: "Start Free",
    },
  },
  {
    title: "Restaurant / Food Truck",
    category: "Mini Site",
    description: "Menu display, location schedule, hours, and online ordering links for a food truck business.",
    tags: ["3 pages", "Menu", "Orders"],
    colorAccent: "bg-green-600",
    mockContent: {
      nav: "STREET BITES",
      headline: "Fresh Street Food",
      cta: "Order Now",
    },
  },
  {
    title: "Creator / Startup",
    category: "Landing Page",
    description: "Personal brand showcase, services, social links, and contact for creators and consultants.",
    tags: ["Single page", "Social", "Contact"],
    colorAccent: "bg-violet-600",
    mockContent: {
      nav: "SARAH.DEV",
      headline: "Design That Converts",
      cta: "Let's Talk",
    },
  },
  {
    title: "Home Services",
    category: "Full Website",
    description: "Service list, coverage area map, reviews, and quick quote form for home service providers.",
    tags: ["4 pages", "Map", "Quote form"],
    colorAccent: "bg-emerald-600",
    mockContent: {
      nav: "CLEANPRO",
      headline: "Spotless Every Time",
      cta: "Free Estimate",
    },
  },
]

function BrowserPreview({ build, index }: { build: ConceptBuild; index: number }) {
  // Alternate between dark and light preview backgrounds
  const isDark = index % 2 === 0
  
  return (
    <div className="aspect-[16/10] relative bg-muted/30 overflow-hidden rounded-t-lg">
      {/* Browser chrome */}
      <div className="absolute top-0 left-0 right-0 h-7 bg-muted/50 dark:bg-muted/30 border-b border-border flex items-center px-3 z-10">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-red-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-400/70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-400/70" />
        </div>
        <div className="flex-1 mx-4">
          <div className="flex items-center gap-1.5 h-4 rounded bg-background border border-border max-w-[140px] mx-auto px-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-[8px] text-muted-foreground truncate">{build.mockContent.nav.toLowerCase().replace(" ", "")}.com</span>
          </div>
        </div>
      </div>
      
      {/* Website content preview */}
      <div className={`absolute inset-0 top-7 ${isDark ? "bg-slate-900" : "bg-slate-50"}`}>
        <div className="h-full flex flex-col p-3">
          {/* Nav */}
          <div className="flex items-center justify-between mb-auto">
            <div className={`text-[10px] font-bold tracking-wider ${isDark ? "text-white" : "text-slate-900"}`}>
              {build.mockContent.nav}
            </div>
            <div className="flex gap-3">
              <div className={`w-6 h-1.5 rounded ${isDark ? "bg-white/20" : "bg-slate-900/20"}`} />
              <div className={`w-6 h-1.5 rounded ${isDark ? "bg-white/20" : "bg-slate-900/20"}`} />
              <div className={`w-12 h-5 rounded ${build.colorAccent} text-white text-[8px] font-medium flex items-center justify-center`}>
                {build.mockContent.cta}
              </div>
            </div>
          </div>
          
          {/* Hero content */}
          <div className="flex-1 flex flex-col justify-center items-center text-center py-2">
            <div className={`text-sm font-bold mb-1 ${isDark ? "text-white" : "text-slate-900"}`}>
              {build.mockContent.headline}
            </div>
            <div className={`w-2/3 h-2 rounded mb-3 ${isDark ? "bg-white/20" : "bg-slate-900/15"}`} />
            <div className={`w-16 h-5 rounded ${build.colorAccent} text-white text-[8px] font-medium flex items-center justify-center`}>
              {build.mockContent.cta}
            </div>
          </div>
          
          {/* Bottom elements */}
          <div className="flex justify-center gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className={`w-14 h-8 rounded ${isDark ? "bg-white/10" : "bg-slate-900/5"}`} />
            ))}
          </div>
        </div>
      </div>
      
      {/* Concept label */}
      <div className="absolute top-9 left-2 px-1.5 py-0.5 bg-background/90 backdrop-blur rounded text-[9px] font-medium text-muted-foreground border border-border">
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
            className="inline-block text-sm font-medium text-muted-foreground tracking-wide uppercase mb-4"
          >
            Work
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-[1.1] max-w-3xl mb-6"
          >
            Work concepts built
            <br />
            <span className="text-muted-foreground">for real businesses.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl"
          >
            Sample directions that show the kind of online presence Northline can create.
          </motion.p>
        </div>
        
        {/* Work grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {conceptBuilds.map((build, index) => (
            <motion.div
              key={build.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.08 }}
              className="group"
            >
              <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-foreground/20 hover:shadow-lg transition-all duration-300">
                {/* Preview area */}
                <BrowserPreview build={build} index={index} />
                
                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      {build.category}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-foreground/90">
                    {build.title}
                  </h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                    {build.description}
                  </p>
                  
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {build.tags.map((tag) => (
                      <span 
                        key={tag} 
                        className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {build.href && (
                    <Link
                      href={build.href}
                      className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-foreground hover:underline underline-offset-4"
                    >
                      View concept
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  )}
                </div>
              </div>
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
          <p className="text-muted-foreground mb-4">
            Have a similar business? Let&apos;s build something like this for you.
          </p>
          <a 
            href="#contact"
            className="inline-flex items-center gap-2 text-foreground font-medium hover:underline underline-offset-4"
          >
            Start a project
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}
