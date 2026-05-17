"use client"

import { motion } from "framer-motion"

interface NorthlineLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
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
    sm: { mark: 28, text: "text-base", gap: "gap-2" },
    md: { mark: 34, text: "text-lg", gap: "gap-2.5" },
    lg: { mark: 42, text: "text-xl", gap: "gap-3" },
    xl: { mark: 56, text: "text-2xl", gap: "gap-4" },
  }
  
  const s = sizes[size]
  
  const markVariants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { 
      opacity: 1, 
      scale: 1, 
      transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } 
    },
  }
  
  const lineVariants = {
    initial: { pathLength: 0, opacity: 0 },
    animate: { 
      pathLength: 1, 
      opacity: 1,
      transition: { duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] } 
    },
  }
  
  const textVariants = {
    initial: { opacity: 0, x: -8 },
    animate: { 
      opacity: 1, 
      x: 0, 
      transition: { duration: 0.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] } 
    },
  }

  const MarkWrapper = animated ? motion.div : "div"
  const TextWrapper = animated ? motion.span : "span"

  return (
    <div className={`flex items-center ${s.gap} ${className}`}>
      {/* Brand Mark - Mountain with upward line - White on black */}
      <MarkWrapper
        {...(animated ? { variants: markVariants, initial: "initial", animate: "animate" } : {})}
        className="relative flex-shrink-0"
        style={{ width: s.mark, height: s.mark }}
      >
        <svg 
          viewBox="0 0 40 40" 
          fill="none" 
          className="w-full h-full"
        >
          {/* Mountain shape - abstract, geometric */}
          <motion.path
            d="M20 8 L32 32 L8 32 Z"
            className="fill-white/10 stroke-white"
            strokeWidth="1.5"
            strokeLinejoin="round"
            {...(animated ? { variants: lineVariants, initial: "initial", animate: "animate" } : {})}
          />
          
          {/* Upward cutting line - momentum, direction, growth */}
          <motion.path
            d="M20 34 L20 6"
            className="stroke-white"
            strokeWidth="2.5"
            strokeLinecap="round"
            {...(animated ? { 
              variants: lineVariants, 
              initial: "initial", 
              animate: "animate",
              transition: { duration: 0.6, delay: 0.4 }
            } : {})}
          />
          
          {/* Arrow head at top */}
          <motion.path
            d="M16 12 L20 6 L24 12"
            className="stroke-white"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
            {...(animated ? { 
              variants: lineVariants, 
              initial: "initial", 
              animate: "animate",
              transition: { duration: 0.4, delay: 0.6 }
            } : {})}
          />
        </svg>
      </MarkWrapper>
      
      {showWordmark && (
        <TextWrapper
          {...(animated ? { variants: textVariants, initial: "initial", animate: "animate" } : {})}
          className={`font-semibold tracking-tight lowercase ${s.text} text-white`}
        >
          mountline
        </TextWrapper>
      )}
    </div>
  )
}

// Standalone icon for favicon / small uses - White on black
export function NorthlineIcon({ 
  size = 32, 
  className = "" 
}: { 
  size?: number
  className?: string 
}) {
  return (
    <div 
      className={`relative flex-shrink-0 ${className}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 40 40" fill="none" className="w-full h-full">
        <path
          d="M20 8 L32 32 L8 32 Z"
          className="fill-white/10 stroke-white"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M20 34 L20 6"
          className="stroke-white"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M16 12 L20 6 L24 12"
          className="stroke-white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  )
}
