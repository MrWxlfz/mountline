"use client"

import { useTheme } from "next-themes"
import { motion, AnimatePresence } from "framer-motion"
import { Laptop, Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className={`w-10 h-10 rounded-full bg-secondary border border-border ${className}`} />
    )
  }

  const current = theme === "light" || theme === "dark" ? theme : "system"
  const next = current === "system" ? "light" : current === "light" ? "dark" : "system"
  const label = current === "system" ? "System" : current === "light" ? "Light" : "Dark"

  return (
    <motion.button
      onClick={() => setTheme(next)}
      className={`relative w-10 h-10 rounded-full bg-secondary border border-border hover:bg-muted hover:border-border-strong transition-colors flex items-center justify-center overflow-hidden ${className}`}
      whileTap={{ scale: 0.95 }}
      aria-label={`${label} appearance. Switch to ${next}.`}
      title={`${label} appearance`}
    >
      <AnimatePresence mode="wait" initial={false}>
        {current === "system" ? (
          <motion.div
            key="system"
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Laptop className="w-[18px] h-[18px] text-foreground" />
          </motion.div>
        ) : current === "dark" ? (
          <motion.div
            key="moon"
            initial={{ y: -20, opacity: 0, rotate: -90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: 20, opacity: 0, rotate: 90 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Moon className="w-[18px] h-[18px] text-foreground" />
          </motion.div>
        ) : (
          <motion.div
            key="sun"
            initial={{ y: 20, opacity: 0, rotate: 90 }}
            animate={{ y: 0, opacity: 1, rotate: 0 }}
            exit={{ y: -20, opacity: 0, rotate: -90 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          >
            <Sun className="w-[18px] h-[18px] text-foreground" />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
