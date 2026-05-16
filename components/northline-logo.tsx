"use client"

import { motion } from "framer-motion"

interface NorthlineLogoProps {
  size?: "sm" | "md" | "lg"
  showWordmark?: boolean
  showServices?: boolean
  animated?: boolean
  variant?: "dark" | "light"
  className?: string
}

export function NorthlineLogo({ 
  size = "md", 
  showWordmark = true,
  showServices = false,
  animated = false,
  variant = "dark",
  className = "" 
}: NorthlineLogoProps) {
  const sizes = {
    sm: { mark: 24, text: "text-sm", gap: "gap-2" },
    md: { mark: 32, text: "text-lg", gap: "gap-2.5" },
    lg: { mark: 40, text: "text-2xl", gap: "gap-3" },
  }
  
  const s = sizes[size]
  const isDark = variant === "dark"
  
  const markVariants = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] } },
  }
  
  const textVariants = {
    initial: { opacity: 0, x: -6 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.4, delay: 0.1, ease: [0.22, 1, 0.36, 1] } },
  }

  const Mark = animated ? motion.div : "div"
  const Text = animated ? motion.div : "div"

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Brand Mark - Abstract N with north direction */}
      <Mark
        {...(animated ? { variants: markVariants, initial: "initial", animate: "animate" } : {})}
        className="relative flex-shrink-0"
        style={{ width: s.mark, height: s.mark }}
      >
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          className="w-full h-full"
        >
          {/* Clean geometric N mark */}
          <rect 
            x="2" 
            y="2" 
            width="28" 
            height="28" 
            rx="6"
            fill={isDark ? "#1e293b" : "#f8fafc"}
            stroke={isDark ? "#334155" : "#e2e8f0"}
            strokeWidth="1"
          />
          {/* N letterform - clean, modern */}
          <path
            d="M9 23V9L16 16L23 9V23"
            stroke={isDark ? "#f8fafc" : "#1e293b"}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Subtle north indicator dot */}
          <circle
            cx="16"
            cy="6"
            r="1.5"
            fill="#3b82f6"
          />
        </svg>
      </Mark>
      
      {showWordmark && (
        <Text
          {...(animated ? { variants: textVariants, initial: "initial", animate: "animate" } : {})}
          className="flex flex-col"
        >
          <span 
            className={`font-semibold tracking-tight leading-none ${s.text}`}
            style={{ color: isDark ? "#1e293b" : "#f8fafc" }}
          >
            Northline
          </span>
          {showServices && (
            <span 
              className="text-xs tracking-wide mt-0.5"
              style={{ color: isDark ? "#64748b" : "#94a3b8" }}
            >
              Services
            </span>
          )}
        </Text>
      )}
    </div>
  )
}

// Icon-only version for favicon
export function NorthlineIcon({ 
  size = 32, 
  variant = "dark",
  className = "" 
}: { 
  size?: number
  variant?: "dark" | "light"
  className?: string 
}) {
  const isDark = variant === "dark"
  
  return (
    <div 
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
        <rect 
          x="2" 
          y="2" 
          width="28" 
          height="28" 
          rx="6"
          fill={isDark ? "#1e293b" : "#f8fafc"}
          stroke={isDark ? "#334155" : "#e2e8f0"}
          strokeWidth="1"
        />
        <path
          d="M9 23V9L16 16L23 9V23"
          stroke={isDark ? "#f8fafc" : "#1e293b"}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <circle cx="16" cy="6" r="1.5" fill="#3b82f6" />
      </svg>
    </div>
  )
}

// Decorative brand pattern
export function NorthlinePattern({ 
  className = "",
  opacity = 0.03
}: { 
  className?: string
  opacity?: number 
}) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg 
        className="absolute w-full h-full" 
        style={{ opacity }}
        preserveAspectRatio="none"
      >
        <defs>
          <pattern 
            id="northline-marks" 
            x="0" 
            y="0" 
            width="80" 
            height="80" 
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M20 35V15L30 25L40 15V35"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
            <circle cx="30" cy="10" r="2" fill="currentColor" opacity="0.5" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#northline-marks)" />
      </svg>
    </div>
  )
}
