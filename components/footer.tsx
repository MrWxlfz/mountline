"use client"

import Link from "next/link"
import { NorthlineLogo } from "./northline-logo"
import { Mail, ArrowUpRight } from "lucide-react"

const navigation = {
  services: [
    { name: "Business Websites", href: "#services" },
    { name: "Landing Pages", href: "#services" },
    { name: "Quote Systems", href: "#services" },
    { name: "Monthly Care", href: "#pricing" },
  ],
  company: [
    { name: "Work", href: "#work" },
    { name: "Process", href: "#process" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" },
  ],
  resources: [
    { name: "FAQ", href: "#faq" },
  ],
}

export function Footer() {
  return (
    <footer className="bg-[#060606] border-t border-white/[0.04]">
      <div className="mx-auto max-w-6xl px-6 py-14 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-5">
              <NorthlineLogo />
            </Link>
            <p className="text-white/30 text-sm max-w-xs mb-5 leading-relaxed">
              Websites and digital systems for businesses that need a stronger online presence.
            </p>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              <Mail className="w-4 h-4" />
              Get in touch
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-white/70 mb-4">Services</h3>
            <ul className="space-y-2.5">
              {navigation.services.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/30 hover:text-white/60 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-white/70 mb-4">Company</h3>
            <ul className="space-y-2.5">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/30 hover:text-white/60 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-white/70 mb-4">Resources</h3>
            <ul className="space-y-2.5">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-white/30 hover:text-white/60 transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* CTA */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-white/70 mb-4">Ready to start?</h3>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg text-sm font-medium hover:bg-white/90 transition-colors"
            >
              Book a review
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-white/[0.04] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-white/25">
            {new Date().getFullYear()} Mountline Studio. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-white/25 hover:text-white/50 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-white/25 hover:text-white/50 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
