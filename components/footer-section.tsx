"use client"

import { motion } from "framer-motion"
import { NorthlineLogo } from "./northline-logo"
import { ArrowUpRight } from "lucide-react"
import Link from "next/link"

const footerLinks = {
  services: [
    { label: "Business Websites", href: "#services" },
    { label: "Landing Pages", href: "#services" },
    { label: "AI Systems", href: "#ai-systems" },
    { label: "Monthly Care", href: "#pricing" },
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
  const scrollToSection = (id: string) => {
    if (id.startsWith('#')) {
      const element = document.getElementById(id.slice(1))
      if (element) {
        element.scrollIntoView({ behavior: "smooth" })
      }
    }
  }

  return (
    <footer className="relative py-16 sm:py-20 bg-foreground text-background overflow-hidden">
      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.04]">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="footer-grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-background" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-grid)" />
        </svg>
      </div>
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-14"
        >
          {/* Brand column */}
          <div className="lg:col-span-2">
            <NorthlineLogo size="md" className="mb-5" inverted />
            <p className="text-background/70 max-w-sm leading-relaxed mb-5 text-[15px]">
              Websites, client portals, and practical digital systems for businesses that need to look sharper online.
            </p>
            <a
              href="mailto:hello@mountline.dev"
              className="mb-5 block text-sm text-background/60 hover:text-background transition-colors"
            >
              hello@mountline.dev
            </a>
            <motion.button
              onClick={() => scrollToSection('#contact')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-background text-foreground rounded-lg font-medium text-sm hover:bg-background/90 transition-colors"
            >
              Get a website review
              <ArrowUpRight className="w-4 h-4" />
            </motion.button>
          </div>
          
          {/* Services links */}
          <div>
            <h4 className="text-sm font-semibold text-background mb-4 uppercase tracking-wider">Services</h4>
            <ul className="space-y-2.5">
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
            <h4 className="text-sm font-semibold text-background mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
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
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-6 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-background/50">
            {new Date().getFullYear()} Mountline Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button className="text-sm text-background/50 hover:text-background/70 transition-colors">
              Privacy
            </button>
            <button className="text-sm text-background/50 hover:text-background/70 transition-colors">
              Terms
            </button>
            <Link
              href="/id"
              className="text-sm text-background/50 hover:text-background/70 transition-colors"
            >
              Mountline ID
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
