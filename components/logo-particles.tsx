"use client"

import { useEffect, useRef } from "react"

interface Particle {
  x: number
  y: number
  tx: number  // target x
  ty: number  // target y
  vx: number
  vy: number
  alpha: number
  size: number
  orbitRadius: number
  orbitAngle: number
  orbitSpeed: number
  settled: boolean
}

// Sample points along the Mountline logo paths (viewBox 0 0 40 40)
function getLogoPoints(scale: number, cx: number, cy: number): Array<{ x: number; y: number }> {
  const pts: Array<{ x: number; y: number }> = []

  const transform = (x: number, y: number) => ({
    x: cx + (x - 20) * scale,
    y: cy + (y - 20) * scale,
  })

  // Triangle edges: M20 8 L32 32 L8 32 Z
  // Left edge: (20,8) -> (8,32)
  for (let t = 0; t <= 1; t += 0.08) {
    pts.push(transform(20 + (8 - 20) * t, 8 + (32 - 8) * t))
  }
  // Right edge: (20,8) -> (32,32)
  for (let t = 0; t <= 1; t += 0.08) {
    pts.push(transform(20 + (32 - 20) * t, 8 + (32 - 8) * t))
  }
  // Bottom edge: (8,32) -> (32,32)
  for (let t = 0; t <= 1; t += 0.1) {
    pts.push(transform(8 + (32 - 8) * t, 32))
  }

  // Vertical stem: M20 34 L20 6
  for (let t = 0; t <= 1; t += 0.07) {
    pts.push(transform(20, 6 + (34 - 6) * t))
  }

  // Arrow head: M16 12 L20 6 L24 12
  for (let t = 0; t <= 1; t += 0.12) {
    pts.push(transform(16 + (20 - 16) * t, 12 + (6 - 12) * t))
  }
  for (let t = 0; t <= 1; t += 0.12) {
    pts.push(transform(20 + (24 - 20) * t, 6 + (12 - 6) * t))
  }

  return pts
}

export function LogoParticles({
  className = "",
}: {
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)
  const particlesRef = useRef<Particle[]>([])
  const phaseRef = useRef<"forming" | "formed" | "dissolving">("forming")
  const phaseTimerRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    if (prefersReducedMotion) return

    // Detect dark mode
    const isDark = () => document.documentElement.classList.contains("dark")

    const resize = () => {
      const dpr = window.devicePixelRatio || 1
      canvas.width = canvas.offsetWidth * dpr
      canvas.height = canvas.offsetHeight * dpr
      ctx.scale(dpr, dpr)
      init()
    }

    const init = () => {
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight

      // Scale logo to fit ~40% of the smaller dimension, centered
      const logoScale = (Math.min(w, h) * 0.38) / 20
      const cx = w * 0.5
      const cy = h * 0.48

      const targets = getLogoPoints(logoScale, cx, cy)
      const count = 110

      particlesRef.current = Array.from({ length: count }, (_, i) => {
        const target = targets[i % targets.length]
        // Scatter particles from random positions around the canvas
        const angle = Math.random() * Math.PI * 2
        const dist = Math.min(w, h) * (0.3 + Math.random() * 0.5)
        return {
          x: cx + Math.cos(angle) * dist,
          y: cy + Math.sin(angle) * dist,
          tx: target.x + (Math.random() - 0.5) * 6,
          ty: target.y + (Math.random() - 0.5) * 6,
          vx: (Math.random() - 0.5) * 0.3,
          vy: (Math.random() - 0.5) * 0.3,
          alpha: 0,
          size: 0.8 + Math.random() * 1.2,
          orbitRadius: 1.5 + Math.random() * 2.5,
          orbitAngle: Math.random() * Math.PI * 2,
          orbitSpeed: (Math.random() - 0.5) * 0.015,
          settled: false,
        }
      })

      phaseRef.current = "forming"
      phaseTimerRef.current = 0
    }

    let frame = 0

    const draw = () => {
      animRef.current = requestAnimationFrame(draw)
      frame++

      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      const dark = isDark()

      ctx.clearRect(0, 0, w, h)
      phaseTimerRef.current++

      const phase = phaseRef.current
      // forming: ~3s at 60fps = 180 frames, formed: ~4s = 240 frames, dissolving: ~2.5s = 150 frames
      if (phase === "forming" && phaseTimerRef.current > 180) {
        phaseRef.current = "formed"
        phaseTimerRef.current = 0
      } else if (phase === "formed" && phaseTimerRef.current > 260) {
        phaseRef.current = "dissolving"
        phaseTimerRef.current = 0
      } else if (phase === "dissolving" && phaseTimerRef.current > 150) {
        init()
        return
      }

      const logoScale = (Math.min(w, h) * 0.38) / 20
      const cx = w * 0.5
      const cy = h * 0.48

      for (const p of particlesRef.current) {
        if (phase === "forming") {
          // Attract toward target
          const dx = p.tx - p.x
          const dy = p.ty - p.y
          const dist = Math.sqrt(dx * dx + dy * dy)

          p.vx += dx * 0.018
          p.vy += dy * 0.018
          p.vx *= 0.82
          p.vy *= 0.82
          p.x += p.vx
          p.y += p.vy

          // Fade in
          p.alpha = Math.min(p.alpha + 0.012, dist < 8 ? 0.85 : 0.5)

          if (dist < 3) p.settled = true
        } else if (phase === "formed") {
          // Gentle orbit around settled position
          p.orbitAngle += p.orbitSpeed
          const ox = Math.cos(p.orbitAngle) * p.orbitRadius
          const oy = Math.sin(p.orbitAngle) * p.orbitRadius * 0.6

          const dx = (p.tx + ox) - p.x
          const dy = (p.ty + oy) - p.y
          p.vx += dx * 0.06
          p.vy += dy * 0.06
          p.vx *= 0.75
          p.vy *= 0.75
          p.x += p.vx
          p.y += p.vy

          p.alpha = Math.min(p.alpha + 0.02, 0.85)
        } else if (phase === "dissolving") {
          // Drift outward
          const ddx = p.x - cx
          const ddy = p.y - cy
          const mag = Math.sqrt(ddx * ddx + ddy * ddy) || 1
          p.vx += (ddx / mag) * 0.12 + (Math.random() - 0.5) * 0.05
          p.vy += (ddy / mag) * 0.12 + (Math.random() - 0.5) * 0.05
          p.vx *= 0.95
          p.vy *= 0.95
          p.x += p.vx
          p.y += p.vy
          p.alpha = Math.max(p.alpha - 0.008, 0)
        }

        if (p.alpha <= 0) continue

        // Particle color: in dark mode use white, in light mode use dark
        const rgb = dark ? "255,255,255" : "24,24,27"
        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb},${p.alpha})`
        ctx.fill()
      }

      // Draw faint connecting lines between nearby particles when formed
      if (phase === "formed" || (phase === "dissolving" && phaseTimerRef.current < 60)) {
        const opacity = phase === "dissolving"
          ? Math.max(0, (60 - phaseTimerRef.current) / 60) * 0.07
          : 0.07
        const rgb = dark ? "255,255,255" : "24,24,27"
        const maxDist = logoScale * 3.5

        ctx.lineWidth = 0.4
        for (let i = 0; i < particlesRef.current.length; i++) {
          const a = particlesRef.current[i]
          for (let j = i + 1; j < particlesRef.current.length; j++) {
            const b = particlesRef.current[j]
            const dx = a.x - b.x
            const dy = a.y - b.y
            const dist = Math.sqrt(dx * dx + dy * dy)
            if (dist < maxDist) {
              const lineAlpha = opacity * (1 - dist / maxDist)
              ctx.beginPath()
              ctx.strokeStyle = `rgba(${rgb},${lineAlpha})`
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.stroke()
            }
          }
        }
      }
    }

    resize()
    draw()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(animRef.current)
      ro.disconnect()
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      aria-hidden="true"
    />
  )
}
