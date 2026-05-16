"use client"

import { motion, useInView } from "framer-motion"
import { useRef } from "react"
import { NorthlineLogo } from "./northline-logo"
import { ArrowUpRight } from "lucide-react"

const footerLinks = {
  services: [
    { label: "Business Websites", href: "#services" },
    { label: "Landing Pages", href: "#services" },
    { label: "Quote Systems", href: "#services" },
    { label: "Local SEO", href: "#services" },
    { label: "Monthly Care", href: "#services" },
  ],
  company: [
    { label: "Work", href: "#work" },
    { label: "Process", href: "#process" },
    { label: "Pricing", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
    { label: "Contact", href: "#contact" },
  ],
}

export function FooterSection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-50px" })

  const scrollToSection = (id: string) => {
    if (id.startsWith('#')) {
      const element = document.getElementById(id.slice(1))
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <footer ref={ref} className="relative py-16 sm:py-20 bg-foreground text-background overflow-hidden">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="w-full h-full">
          <defs>
            <pattern id="footer-grid" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M 60 0 L 0 0 0 60" fill="none" className="stroke-background" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>
      
      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12"
        >
          {/* Brand column */}
          <div className="lg:col-span-2">
            <NorthlineLogo size="md" className="mb-6" inverted />
            <p className="text-background/60 max-w-sm leading-relaxed mb-6">
              Clean websites, landing pages, and practical digital systems for businesses that need a stronger first impression and more customer action.
            </p>
            <motion.button
              onClick={() => scrollToSection('#contact')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-background text-foreground rounded-xl font-medium text-sm hover:bg-background/90 transition-colors"
            >
              Book a website review
              <ArrowUpRight className="w-4 h-4" />
            </motion.button>
          </div>
          
          {/* Services links */}
          <div>
            <h4 className="text-sm font-semibold text-background mb-4">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company links */}
          <div>
            <h4 className="text-sm font-semibold text-background mb-4">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-background/60 hover:text-background transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
        
        {/* Bottom bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-background/40">
            {new Date().getFullYear()} northline. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button className="text-sm text-background/40 hover:text-background/60 transition-colors">
              Privacy
            </button>
            <button className="text-sm text-background/40 hover:text-background/60 transition-colors">
              Terms
            </button>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
