"use client"

import { useState, useEffect } from "react"
import { Menu, X, LayoutDashboard } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useUser, SignInButton, UserButton } from "@clerk/nextjs"
import Link from "next/link"
import { NorthlineLogo } from "./northline-logo"
import { ThemeToggle } from "./theme-toggle"

export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { isSignedIn, isLoaded } = useUser()

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
    setMobileMenuOpen(false)
  }

  const navItems = [
    { label: "Services", id: "services" },
    { label: "Work", id: "work" },
    { label: "Process", id: "process" },
    { label: "Pricing", id: "pricing" },
    { label: "AI Systems", id: "ai-systems" },
    { label: "Contact", id: "contact" },
  ]

  return (
    <motion.nav 
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled 
          ? "glass-card shadow-sm" 
          : "bg-transparent"
      }`}
    >
      <div className="w-full flex justify-center px-4 sm:px-6 py-4">
        <div className="w-full max-w-6xl flex items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <NorthlineLogo size="md" animated />
          </motion.div>
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.15 + index * 0.05 }}
                onClick={() => scrollToSection(item.id)}
                className="relative px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary/50"
              >
                {item.label}
              </motion.button>
            ))}
          </div>
          
          {/* Right side - Theme toggle + Auth */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex items-center gap-3"
          >
            <ThemeToggle className="hidden sm:flex" />
            
            {isLoaded && (
              <>
                {isSignedIn ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="hidden sm:flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-secondary/50"
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      Dashboard
                    </Link>
                    <UserButton 
                      afterSignOutUrl="/"
                      appearance={{
                        elements: {
                          avatarBox: "w-8 h-8"
                        }
                      }}
                    />
                  </>
                ) : (
                  <>
                    <SignInButton mode="modal">
                      <button className="hidden sm:block text-sm font-medium btn-primary">
                        Client Login
                      </button>
                    </SignInButton>
                  </>
                )}
              </>
            )}

            {/* Mobile menu button */}
            <button
              className="lg:hidden text-muted-foreground hover:text-foreground transition-colors p-2 -mr-2 hover:bg-secondary/50 rounded-lg"
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
                    transition={{ duration: 0.2 }}
                  >
                    <X className="w-6 h-6" />
                  </motion.div>
                ) : (
                  <motion.div
                    key="menu"
                    initial={{ rotate: 90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: -90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Menu className="w-6 h-6" />
                  </motion.div>
                )}
              </AnimatePresence>
            </button>
          </motion.div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden border-t border-border bg-card overflow-hidden"
          >
            <div className="px-4 sm:px-6 py-4 space-y-1">
              {navItems.map((item, index) => (
                <motion.button 
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  onClick={() => scrollToSection(item.id)}
                  className="block w-full text-left text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-3 px-2 rounded-lg hover:bg-secondary/50"
                >
                  {item.label}
                </motion.button>
              ))}
              
              <div className="flex items-center gap-3 pt-4 border-t border-border mt-4">
                <ThemeToggle />
                {isLoaded && (
                  <>
                    {isSignedIn ? (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="flex-1"
                      >
                        <Link
                          href="/dashboard"
                          className="flex items-center justify-center gap-2 w-full text-sm font-medium btn-primary text-center"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <LayoutDashboard className="w-4 h-4" />
                          Dashboard
                        </Link>
                      </motion.div>
                    ) : (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                        className="flex-1"
                      >
                        <SignInButton mode="modal">
                          <button className="w-full text-sm font-medium btn-primary text-center">
                            Client Login
                          </button>
                        </SignInButton>
                      </motion.div>
                    )}
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
