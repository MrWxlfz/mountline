"use client"

import Link from "next/link"
import { NorthlineLogo } from "./northline-logo"
import { Twitter, Linkedin, Github, Mail, ArrowUpRight } from "lucide-react"

const navigation = {
  services: [
    { name: "Web Design", href: "#services" },
    { name: "Development", href: "#services" },
    { name: "Landing Pages", href: "#services" },
    { name: "Monthly Care", href: "#pricing" },
  ],
  company: [
    { name: "Work", href: "#work" },
    { name: "Process", href: "#capabilities" },
    { name: "Pricing", href: "#pricing" },
    { name: "Contact", href: "#contact" },
  ],
  resources: [
    { name: "FAQ", href: "#faq" },
  ],
  social: [
    { name: "Twitter", href: "#", icon: Twitter },
    { name: "LinkedIn", href: "#", icon: Linkedin },
    { name: "GitHub", href: "#", icon: Github },
  ],
}

export function Footer() {
  return (
    <footer className="relative bg-zinc-950 border-t border-zinc-800/50">
      {/* Top gradient line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-northline-accent/20 to-transparent" />
      
      <div className="mx-auto max-w-6xl px-6 py-16 lg:py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6 group">
              <NorthlineLogo />
            </Link>
            <p className="text-zinc-500 text-sm max-w-xs mb-6 leading-relaxed">
              Websites and systems for businesses that are done looking average. Built with care in the Pacific Northwest.
            </p>
            <div className="flex items-center gap-3">
              {navigation.social.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 hover:text-white hover:border-zinc-700 transition-all"
                  aria-label={item.name}
                >
                  <item.icon className="w-4 h-4" />
                </Link>
              ))}
            </div>
          </div>

          {/* Services */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-white mb-5">Services</h3>
            <ul className="space-y-3">
              {navigation.services.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-500 hover:text-white transition-colors inline-flex items-center gap-1 group"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-white mb-5">Company</h3>
            <ul className="space-y-3">
              {navigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Resources */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-white mb-5">Resources</h3>
            <ul className="space-y-3">
              {navigation.resources.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-zinc-500 hover:text-white transition-colors"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter / CTA */}
          <div className="lg:col-span-2">
            <h3 className="text-sm font-medium text-white mb-5">Get in touch</h3>
            <a
              href="#contact"
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-lg text-sm text-zinc-400 hover:text-white hover:border-zinc-700 transition-all group"
            >
              <Mail className="w-4 h-4" />
              Contact us
              <ArrowUpRight className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
            </a>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-16 pt-8 border-t border-zinc-800/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-zinc-600">
            &copy; {new Date().getFullYear()} Northline Services. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
              Privacy
            </Link>
            <Link href="#" className="text-sm text-zinc-600 hover:text-zinc-400 transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
