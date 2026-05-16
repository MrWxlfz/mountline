"use client"

import { motion } from "framer-motion"
import { Monitor, Smartphone, ArrowUpRight } from "lucide-react"

const conceptBuilds = [
  {
    title: "Auto Detailing",
    category: "Full Website",
    description: "Service packages, gallery, online booking, and quote request form for a mobile detailing business.",
    tags: ["5 pages", "Booking", "Gallery"],
  },
  {
    title: "Contractor Services",
    category: "Full Website",
    description: "Service areas, project portfolio, testimonials, and lead capture for a residential contractor.",
    tags: ["6 pages", "Portfolio", "Lead form"],
  },
  {
    title: "Local Gym",
    category: "Landing Page",
    description: "Membership tiers, class schedule, trainer profiles, and trial signup for a local fitness center.",
    tags: ["Single page", "Pricing", "Signup"],
  },
  {
    title: "Restaurant / Food Truck",
    category: "Mini Site",
    description: "Menu display, location schedule, hours, and online ordering links for a food truck business.",
    tags: ["3 pages", "Menu", "Orders"],
  },
  {
    title: "Creator / Startup",
    category: "Landing Page",
    description: "Personal brand showcase, services, social links, and contact for creators and consultants.",
    tags: ["Single page", "Social", "Contact"],
  },
  {
    title: "Home Services",
    category: "Full Website",
    description: "Service list, coverage area map, reviews, and quick quote form for home service providers.",
    tags: ["4 pages", "Map", "Quote form"],
  },
]

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
            Work concepts built for real businesses.
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-muted-foreground max-w-xl"
          >
            Sample directions that show the kind of online presence northline can create.
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
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-foreground/20 transition-colors">
                {/* Preview area */}
                <div className="aspect-[16/10] relative bg-muted/30 overflow-hidden">
                  {/* Browser chrome */}
                  <div className="absolute top-0 left-0 right-0 h-8 bg-muted/50 border-b border-border flex items-center px-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 rounded-full bg-foreground/10" />
                      <div className="w-2 h-2 rounded-full bg-foreground/10" />
                      <div className="w-2 h-2 rounded-full bg-foreground/10" />
                    </div>
                    <div className="flex-1 mx-4">
                      <div className="h-4 rounded bg-background border border-border max-w-[120px] mx-auto" />
                    </div>
                  </div>
                  
                  {/* Mock website content */}
                  <div className="absolute inset-0 top-8 p-4 flex flex-col">
                    {/* Nav */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-16 h-4 rounded bg-foreground/80" />
                      <div className="flex gap-2">
                        <div className="w-8 h-2 rounded bg-foreground/20" />
                        <div className="w-8 h-2 rounded bg-foreground/20" />
                      </div>
                    </div>
                    {/* Hero */}
                    <div className="flex-1 flex flex-col justify-center items-center gap-2">
                      <div className="w-3/4 h-4 rounded bg-foreground/60" />
                      <div className="w-1/2 h-3 rounded bg-foreground/40" />
                      <div className="w-20 h-6 rounded bg-accent mt-2" />
                    </div>
                  </div>
                  
                  {/* Hover overlay */}
                  <div className="absolute inset-0 top-8 bg-foreground/90 flex items-center justify-center gap-8 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="flex flex-col items-center gap-1.5 text-background">
                      <Monitor className="w-5 h-5" />
                      <span className="text-[10px] font-medium">Desktop</span>
                    </div>
                    <div className="flex flex-col items-center gap-1.5 text-background">
                      <Smartphone className="w-5 h-5" />
                      <span className="text-[10px] font-medium">Mobile</span>
                    </div>
                  </div>
                  
                  {/* Concept label */}
                  <div className="absolute top-10 left-3 px-2 py-0.5 bg-background/90 rounded text-[10px] font-medium text-muted-foreground">
                    Concept build
                  </div>
                </div>
                
                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium">
                      {build.category}
                    </span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-accent transition-colors" />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2">
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
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
