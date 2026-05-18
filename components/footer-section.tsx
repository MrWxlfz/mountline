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
      {/* Pattern */}
      <div className="absolute inset-0 opacity-[0.02]">
        <svg className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <pattern id="footer-lines" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
              <path d="M0 60 L60 0" stroke="currentColor" strokeWidth="0.5" fill="none" className="text-background" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#footer-lines)" />
        </svg>
      </div>
      
      <div className="relative z-10 max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-16"
        >
          {/* Brand */}
          <div className="lg:col-span-2">
            <NorthlineLogo size="md" className="mb-6" inverted />
            <p className="text-background/60 max-w-sm leading-relaxed mb-6">
              Websites, client portals, and practical digital systems for businesses that need to look sharper online.
            </p>
            <a
              href="mailto:hello@mountline.dev"
              className="mb-6 block text-sm text-background/50 hover:text-background/80 transition-colors"
            >
              hello@mountline.dev
            </a>
            <motion.button
              onClick={() => scrollToSection('#contact')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-background text-foreground rounded-full font-medium text-sm hover:bg-background/90 transition-colors"
            >
              Get a website review
              <ArrowUpRight className="w-4 h-4" />
            </motion.button>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="text-xs font-medium text-background/40 mb-5 uppercase tracking-wider">Services</h4>
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
          
          {/* Company */}
          <div>
            <h4 className="text-xs font-medium text-background/40 mb-5 uppercase tracking-wider">Company</h4>
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
        
        {/* Bottom */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="pt-8 border-t border-background/10 flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-background/40">
            {new Date().getFullYear()} Mountline Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button className="text-sm text-background/40 hover:text-background/60 transition-colors">
              Privacy
            </button>
            <button className="text-sm text-background/40 hover:text-background/60 transition-colors">
              Terms
            </button>
            <Link
              href="/id"
              className="text-sm text-background/40 hover:text-background/60 transition-colors"
            >
              Mountline ID
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
