"use client"

import { useState, useEffect } from "react"
import { Menu, X, ArrowRight } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useUser, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { NorthlineLogo } from "./northline-logo"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => { document.body.style.overflow = "" }
  }, [mobileMenuOpen])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) element.scrollIntoView({ behavior: "smooth" })
    setMobileMenuOpen(false)
  }

  const navItems = [
    { label: "Services", id: "services" },
    { label: "Work", id: "work" },
    { label: "Portal", id: "portal" },
    { label: "Process", id: "process" },
    { label: "Pricing", id: "pricing" },
    { label: "Contact", id: "contact" },
  ]

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled 
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50" 
            : "bg-transparent"
        }`}
      >
        <div className="w-full max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <NorthlineLogo size="md" animated />
            
            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-1">
              {navItems.map((item, index) => (
                <motion.button
                  key={item.id}
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                  onClick={() => scrollToSection(item.id)}
                  className="relative px-4 py-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors duration-200"
                >
                  {item.label}
                </motion.button>
              ))}
            </div>
            
            {/* Right side */}
            <div className="flex items-center gap-4">
              {isLoaded && isSignedIn && (
                <>
                  <Link
                    href="/dashboard"
                    className="hidden sm:flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-foreground transition-colors"
                  >
                    Mountline ID
                  </Link>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{ elements: { avatarBox: "w-8 h-8" } }}
                  />
                </>
              )}

              {/* CTA */}
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                onClick={() => scrollToSection("contact")}
                className="hidden sm:flex items-center gap-2 text-sm font-medium bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 transition-all duration-200"
              >
                Book a Review
                <ArrowRight className="w-3.5 h-3.5" />
              </motion.button>

              {/* Mobile menu button */}
              <button
                className="lg:hidden text-foreground/60 hover:text-foreground transition-colors p-2 -mr-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <X className="w-6 h-6" />
                    </motion.div>
                  ) : (
                    <motion.div key="menu" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.2 }}>
                      <Menu className="w-6 h-6" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-40 bg-background lg:hidden"
          >
            <div className="flex flex-col h-full pt-24 px-6 pb-8">
              <div className="flex flex-col gap-2 flex-1">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left text-2xl font-medium text-foreground py-3 border-b border-border/30"
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>

              <div className="flex flex-col gap-4 pt-8 border-t border-border">
                {isLoaded && isSignedIn && (
                  <Link
                    href="/dashboard"
                    className="text-sm font-medium text-foreground/60 hover:text-foreground"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mountline ID
                  </Link>
                )}
                <button
                  onClick={() => scrollToSection("contact")}
                  className="w-full text-base font-medium bg-foreground text-background py-4 rounded-full flex items-center justify-center gap-2"
                >
                  Book a Review
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
