"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-[#09090B]/80 backdrop-blur-md">
      <div className="w-full flex justify-center px-6 py-4">
        <div className="w-full max-w-5xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-white flex items-center justify-center">
              <span className="text-zinc-900 font-bold text-sm">N</span>
            </div>
            <span className="text-white font-semibold">Northline</span>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <button 
              onClick={() => scrollToSection('services')}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('work')}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Work
            </button>
            <button 
              onClick={() => scrollToSection('process')}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Process
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              FAQ
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="text-sm text-zinc-400 hover:text-white transition-colors"
            >
              Contact
            </button>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <button
              onClick={() => scrollToSection('contact')}
              className="text-sm text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2 rounded-lg border border-zinc-700 transition-colors"
            >
              Get a free audit
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-zinc-400 hover:text-white transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-zinc-800 bg-[#09090B]/95 backdrop-blur-md">
          <div className="px-6 py-4 space-y-4">
            <button 
              onClick={() => scrollToSection('services')}
              className="block w-full text-left text-sm text-zinc-400 hover:text-white transition-colors py-2"
            >
              Services
            </button>
            <button 
              onClick={() => scrollToSection('work')}
              className="block w-full text-left text-sm text-zinc-400 hover:text-white transition-colors py-2"
            >
              Work
            </button>
            <button 
              onClick={() => scrollToSection('process')}
              className="block w-full text-left text-sm text-zinc-400 hover:text-white transition-colors py-2"
            >
              Process
            </button>
            <button 
              onClick={() => scrollToSection('pricing')}
              className="block w-full text-left text-sm text-zinc-400 hover:text-white transition-colors py-2"
            >
              Pricing
            </button>
            <button 
              onClick={() => scrollToSection('faq')}
              className="block w-full text-left text-sm text-zinc-400 hover:text-white transition-colors py-2"
            >
              FAQ
            </button>
            <button 
              onClick={() => scrollToSection('contact')}
              className="block w-full text-left text-sm text-zinc-400 hover:text-white transition-colors py-2"
            >
              Contact
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="w-full text-sm text-white bg-zinc-800 hover:bg-zinc-700 px-4 py-2.5 rounded-lg border border-zinc-700 transition-colors mt-4"
            >
              Get a free audit
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
