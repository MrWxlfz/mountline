"use client"

import { motion } from "framer-motion"

interface NorthlineLogoProps {
  size?: "sm" | "md" | "lg"
  showWordmark?: boolean
  animated?: boolean
  className?: string
}

export function NorthlineLogo({ 
  size = "md", 
  showWordmark = true, 
  animated = false,
  className = "" 
}: NorthlineLogoProps) {
  const sizes = {
    sm: { mark: 24, text: "text-sm", gap: "gap-1.5" },
    md: { mark: 28, text: "text-base", gap: "gap-2" },
    lg: { mark: 36, text: "text-xl", gap: "gap-2.5" },
  }
  
  const s = sizes[size]
  
  const markVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  }
  
  const textVariants = {
    initial: { opacity: 0, x: -8 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] } },
  }

  const Mark = animated ? motion.div : "div"
  const Text = animated ? motion.span : "span"

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Brand Mark - Geometric N with directional line */}
      <Mark
        {...(animated ? { variants: markVariants, initial: "initial", animate: "animate" } : {})}
        className="relative flex-shrink-0"
        style={{ width: s.mark, height: s.mark }}
      >
        {/* Background with subtle glow */}
        <div 
          className="absolute inset-0 rounded-lg"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
            boxShadow: "0 0 20px -5px rgba(59, 130, 246, 0.5)",
          }}
        />
        
        {/* N letterform with integrated directional line */}
        <svg 
          viewBox="0 0 28 28" 
          fill="none" 
          className="absolute inset-0 w-full h-full"
        >
          {/* N mark */}
          <path
            d="M8 20V8L14 14L20 8V20"
            stroke="white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          {/* North arrow accent */}
          <path
            d="M14 6L14 4M14 4L12 6M14 4L16 6"
            stroke="white"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.7"
          />
        </svg>
      </Mark>
      
      {showWordmark && (
        <Text
          {...(animated ? { variants: textVariants, initial: "initial", animate: "animate" } : {})}
          className={`font-semibold text-white tracking-tight ${s.text}`}
        >
          Northline
        </Text>
      )}
    </div>
  )
}

// Icon-only version for favicon concept
export function NorthlineIcon({ size = 28, className = "" }: { size?: number; className?: string }) {
  return (
    <div 
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <div 
        className="absolute inset-0 rounded-lg"
        style={{
          background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
          boxShadow: "0 0 20px -5px rgba(59, 130, 246, 0.5)",
        }}
      />
      <svg 
        viewBox="0 0 28 28" 
        fill="none" 
        className="absolute inset-0 w-full h-full"
      >
        <path
          d="M8 20V8L14 14L20 8V20"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <path
          d="M14 6L14 4M14 4L12 6M14 4L16 6"
          stroke="white"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          opacity="0.7"
        />
      </svg>
    </div>
  )
}

// Decorative brand pattern for backgrounds
export function NorthlinePattern({ className = "" }: { className?: string }) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {/* Subtle grid */}
      <div 
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
          `,
          backgroundSize: "64px 64px",
        }}
      />
      
      {/* Scattered brand marks */}
      <svg className="absolute w-full h-full opacity-[0.015]" preserveAspectRatio="none">
        <defs>
          <pattern id="northline-marks" x="0" y="0" width="200" height="200" patternUnits="userSpaceOnUse">
            <path
              d="M20 40V20L30 30L40 20V40"
              stroke="currentColor"
              strokeWidth="1"
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#northline-marks)" />
      </svg>
    </div>
  )
}
