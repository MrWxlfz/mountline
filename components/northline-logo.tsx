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
      {/* Brand Mark - Mountain with upward line */}
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
            className="fill-foreground/10 stroke-foreground"
            strokeWidth="1.5"
            strokeLinejoin="round"
            {...(animated ? { variants: lineVariants, initial: "initial", animate: "animate" } : {})}
          />
          
          {/* Upward cutting line - momentum, direction, growth */}
          <motion.path
            d="M20 34 L20 6"
            className="stroke-accent"
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
            className="stroke-accent"
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
          className={`font-semibold tracking-tight text-foreground lowercase ${s.text}`}
        >
          northline
        </TextWrapper>
      )}
    </div>
  )
}

// Standalone icon for favicon / small uses
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
          className="fill-foreground/10 stroke-foreground"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M20 34 L20 6"
          className="stroke-accent"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M16 12 L20 6 L24 12"
          className="stroke-accent"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
      </svg>
    </div>
  )
}

// Decorative brand pattern with mountain motifs
export function NorthlinePattern({ 
  className = "",
  opacity = 0.04
}: { 
  className?: string
  opacity?: number 
}) {
  return (
    <div 
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{ opacity }}
    >
      <svg 
        className="absolute w-full h-full text-foreground" 
        preserveAspectRatio="none"
      >
        <defs>
          <pattern 
            id="northline-mountain-pattern" 
            x="0" 
            y="0" 
            width="100" 
            height="100" 
            patternUnits="userSpaceOnUse"
          >
            {/* Mountain shape */}
            <path
              d="M50 20 L70 60 L30 60 Z"
              stroke="currentColor"
              strokeWidth="0.5"
              fill="none"
            />
            {/* Upward line */}
            <path
              d="M50 65 L50 15"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeLinecap="round"
            />
            <path
              d="M46 22 L50 15 L54 22"
              stroke="currentColor"
              strokeWidth="0.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#northline-mountain-pattern)" />
      </svg>
    </div>
  )
}

// Animated line element for section dividers
export function NorthlineDivider({ className = "" }: { className?: string }) {
  return (
    <div className={`relative h-16 flex items-center justify-center ${className}`}>
      <motion.svg 
        viewBox="0 0 100 40" 
        className="w-24 h-10 text-muted-foreground/30"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
      >
        <motion.path
          d="M10 35 L50 5 L90 35"
          stroke="currentColor"
          strokeWidth="1"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.path
          d="M50 38 L50 2"
          className="stroke-accent/50"
          strokeWidth="1.5"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
        />
      </motion.svg>
    </div>
  )
}
