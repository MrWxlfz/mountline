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
      if (element) element.scrollIntoView({ behavior: "smooth" })
    }
  }

  return (
    <footer className="relative py-14 sm:py-16 bg-[#060606] border-t border-white/[0.04]">
      <div className="relative z-10 max-w-6xl mx-auto px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12"
        >
          {/* Brand column */}
          <div className="lg:col-span-2">
            <NorthlineLogo size="md" className="mb-4" inverted />
            <p className="text-white/30 max-w-sm leading-relaxed mb-5 text-sm">
              Websites, client portals, and practical digital systems for businesses that need to look sharper online.
            </p>
            <motion.button
              onClick={() => scrollToSection('#contact')}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg font-medium text-sm hover:bg-white/90 transition-colors"
            >
              Get a website review
              <ArrowUpRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>
          
          {/* Services */}
          <div>
            <h4 className="text-sm font-medium text-white/60 mb-4 uppercase tracking-wider">Services</h4>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-white/30 hover:text-white/60 transition-colors"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Company */}
          <div>
            <h4 className="text-sm font-medium text-white/60 mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-sm text-white/30 hover:text-white/60 transition-colors"
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
          className="pt-6 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4"
        >
          <p className="text-sm text-white/20">
            {new Date().getFullYear()} Mountline Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <button className="text-sm text-white/20 hover:text-white/50 transition-colors">
              Privacy
            </button>
            <button className="text-sm text-white/20 hover:text-white/50 transition-colors">
              Terms
            </button>
            <Link
              href="/id"
              className="text-sm text-white/20 hover:text-white/50 transition-colors"
            >
              Mountline ID
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}
