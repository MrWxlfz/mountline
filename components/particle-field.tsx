"use client"

import { useEffect, useRef, useCallback } from "react"
import { motion, useReducedMotion } from "framer-motion"

interface ParticleFieldProps {
  className?: string
  density?: "sparse" | "normal" | "dense"
  interactive?: boolean
}

export function ParticleField({ 
  className = "", 
  density = "normal",
  interactive = true 
}: ParticleFieldProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const mouseRef = useRef({ x: 0, y: 0 })
  const particlesRef = useRef<Particle[]>([])
  const animationRef = useRef<number>()
  const prefersReducedMotion = useReducedMotion()
  
  const densityMap = {
    sparse: 40,
    normal: 60,
    dense: 100
  }
  
  interface Particle {
    x: number
    y: number
    baseX: number
    baseY: number
    vx: number
    vy: number
    size: number
    opacity: number
    speed: number
  }
  
  const createParticles = useCallback((width: number, height: number) => {
    const particles: Particle[] = []
    const count = Math.floor((width * height) / (densityMap[density] * 100))
    const maxParticles = Math.min(count, 200)
    
    for (let i = 0; i < maxParticles; i++) {
      const x = Math.random() * width
      const y = Math.random() * height
      particles.push({
        x,
        y,
        baseX: x,
        baseY: y,
        vx: (Math.random() - 0.5) * 0.15,
        vy: (Math.random() - 0.5) * 0.15,
        size: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.4 + 0.2,
        speed: Math.random() * 0.3 + 0.1
      })
    }
    return particles
  }, [density])
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || prefersReducedMotion) return
    
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    
    const resizeCanvas = () => {
      const dpr = window.devicePixelRatio || 1
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width * dpr
      canvas.height = rect.height * dpr
      ctx.scale(dpr, dpr)
      canvas.style.width = `${rect.width}px`
      canvas.style.height = `${rect.height}px`
      particlesRef.current = createParticles(rect.width, rect.height)
    }
    
    resizeCanvas()
    window.addEventListener("resize", resizeCanvas)
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!interactive) return
      const rect = canvas.getBoundingClientRect()
      mouseRef.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      }
    }
    
    if (interactive) {
      canvas.addEventListener("mousemove", handleMouseMove)
    }
    
    const animate = () => {
      const rect = canvas.getBoundingClientRect()
      ctx.clearRect(0, 0, rect.width, rect.height)
      
      // Get computed style for theme-aware color
      const computedStyle = getComputedStyle(document.documentElement)
      const isDark = document.documentElement.classList.contains("dark")
      
      particlesRef.current.forEach((particle) => {
        // Subtle mouse interaction
        if (interactive) {
          const dx = mouseRef.current.x - particle.x
          const dy = mouseRef.current.y - particle.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          const maxDist = 120
          
          if (dist < maxDist) {
            const force = (maxDist - dist) / maxDist
            particle.x -= (dx / dist) * force * 0.8
            particle.y -= (dy / dist) * force * 0.8
          }
        }
        
        // Drift back to base position
        particle.x += (particle.baseX - particle.x) * 0.02
        particle.y += (particle.baseY - particle.y) * 0.02
        
        // Add subtle movement
        particle.x += particle.vx
        particle.y += particle.vy
        
        // Bounce off edges softly
        if (particle.x < 0 || particle.x > rect.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > rect.height) particle.vy *= -1
        
        // Keep in bounds
        particle.x = Math.max(0, Math.min(rect.width, particle.x))
        particle.y = Math.max(0, Math.min(rect.height, particle.y))
        
        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = isDark 
          ? `rgba(255, 255, 255, ${particle.opacity * 0.6})` 
          : `rgba(0, 0, 0, ${particle.opacity * 0.4})`
        ctx.fill()
      })
      
      // Draw subtle connecting lines between nearby particles
      particlesRef.current.forEach((p1, i) => {
        particlesRef.current.slice(i + 1).forEach((p2) => {
          const dx = p1.x - p2.x
          const dy = p1.y - p2.y
          const dist = Math.sqrt(dx * dx + dy * dy)
          
          if (dist < 80) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            const opacity = (1 - dist / 80) * 0.08
            ctx.strokeStyle = isDark 
              ? `rgba(255, 255, 255, ${opacity})` 
              : `rgba(0, 0, 0, ${opacity})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
      
      animationRef.current = requestAnimationFrame(animate)
    }
    
    animate()
    
    return () => {
      window.removeEventListener("resize", resizeCanvas)
      canvas.removeEventListener("mousemove", handleMouseMove)
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [createParticles, interactive, prefersReducedMotion])
  
  if (prefersReducedMotion) {
    // Static dots for reduced motion preference
    return (
      <div className={`absolute inset-0 ${className}`}>
        <div className="absolute inset-0 bg-dot-grid opacity-30" />
      </div>
    )
  }
  
  return (
    <motion.canvas
      ref={canvasRef}
      className={`absolute inset-0 pointer-events-auto ${className}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1.5 }}
    />
  )
}

// Simpler vertical line fragments for a cleaner look
export function VerticalFragments({ className = "" }: { className?: string }) {
  const lines = Array.from({ length: 12 }, (_, i) => ({
    left: `${8 + i * 8}%`,
    height: `${Math.random() * 30 + 20}%`,
    delay: i * 0.1,
    opacity: Math.random() * 0.15 + 0.05
  }))
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {lines.map((line, i) => (
        <motion.div
          key={i}
          className="absolute top-0 w-px bg-gradient-to-b from-foreground/0 via-foreground to-foreground/0"
          style={{ 
            left: line.left, 
            height: line.height,
            opacity: line.opacity 
          }}
          initial={{ y: "-100%" }}
          animate={{ y: "200%" }}
          transition={{
            duration: 8 + Math.random() * 4,
            delay: line.delay,
            repeat: Infinity,
            ease: "linear"
          }}
        />
      ))}
    </div>
  )
}
