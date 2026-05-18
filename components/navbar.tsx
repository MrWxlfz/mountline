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
    const handleScroll = () => setScrolled(window.scrollY > 10)
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
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50" 
            : "bg-transparent"
        }`}
      >
        <nav className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <NorthlineLogo size="md" />
            </motion.div>
            
            {/* Center Navigation - Desktop */}
            <div className="hidden lg:flex items-center justify-center">
              <div className="flex items-center gap-1">
                {navItems.map((item, index) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.03 }}
                    onClick={() => scrollToSection(item.id)}
                    className="px-3.5 py-2 text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Right side */}
            <motion.div 
              className="flex items-center gap-3"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {isLoaded && isSignedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="hidden sm:block text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                  >
                    Dashboard
                  </Link>
                  <UserButton 
                    afterSignOutUrl="/"
                    appearance={{ elements: { avatarBox: "w-8 h-8" } }}
                  />
                </>
              ) : (
                <Link
                  href="/id"
                  className="hidden sm:block text-[13px] font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2"
                >
                  Mountline ID
                </Link>
              )}

              {/* Primary CTA */}
              <button
                onClick={() => scrollToSection("contact")}
                className="hidden sm:flex items-center gap-1.5 text-[13px] font-medium bg-foreground text-background px-4 py-2 rounded-full hover:bg-foreground/90 transition-colors"
              >
                Book a Review
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              {/* Mobile menu button */}
              <button
                className="lg:hidden p-2 -mr-2 text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div 
                      key="close" 
                      initial={{ rotate: -90, opacity: 0 }} 
                      animate={{ rotate: 0, opacity: 1 }} 
                      exit={{ rotate: 90, opacity: 0 }} 
                      transition={{ duration: 0.15 }}
                    >
                      <X className="w-5 h-5" />
                    </motion.div>
                  ) : (
                    <motion.div 
                      key="menu" 
                      initial={{ rotate: 90, opacity: 0 }} 
                      animate={{ rotate: 0, opacity: 1 }} 
                      exit={{ rotate: -90, opacity: 0 }} 
                      transition={{ duration: 0.15 }}
                    >
                      <Menu className="w-5 h-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </button>
            </motion.div>
          </div>
        </nav>
      </motion.header>

      {/* Mobile full-screen overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background lg:hidden"
          >
            <div className="flex flex-col h-full pt-20 px-6 pb-8">
              <div className="flex flex-col gap-0.5 flex-1">
                {navItems.map((item, i) => (
                  <motion.button
                    key={item.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.04 }}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left text-2xl font-semibold text-foreground py-3 hover:text-muted-foreground transition-colors"
                  >
                    {item.label}
                  </motion.button>
                ))}
              </div>

              <div className="flex flex-col gap-3 pt-6 border-t border-border">
                {isLoaded && isSignedIn ? (
                  <Link
                    href="/dashboard"
                    className="flex items-center justify-center text-sm font-medium text-muted-foreground py-3 px-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                ) : (
                  <Link
                    href="/id"
                    className="flex items-center justify-center text-sm font-medium text-muted-foreground py-3 px-4 rounded-xl border border-border hover:bg-muted/50 transition-colors"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Mountline ID
                  </Link>
                )}
                <button
                  onClick={() => scrollToSection("contact")}
                  className="w-full text-sm font-medium bg-foreground text-background text-center py-3.5 px-4 rounded-xl flex items-center justify-center gap-2"
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
