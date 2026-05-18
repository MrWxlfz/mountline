"use client"

import { useEffect, useRef } from "react"

// Sample evenly-spaced points along the Mountline logo outline (viewBox 0 0 40 40)
function getLogoPoints(scale: number, cx: number, cy: number) {
  const pts: Array<{ x: number; y: number }> = []

  const t = (x: number, y: number) => ({
    x: cx + (x - 20) * scale,
    y: cy + (y - 20) * scale,
  })

  // Triangle: left edge (20,8)->(8,32), right edge (20,8)->(32,32), base (8,32)->(32,32)
  for (let i = 0; i <= 1; i += 0.05) pts.push(t(20 + (8 - 20) * i, 8 + 24 * i))
  for (let i = 0; i <= 1; i += 0.05) pts.push(t(20 + 12 * i, 8 + 24 * i))
  for (let i = 0; i <= 1; i += 0.06) pts.push(t(8 + 24 * i, 32))
  // Vertical stem (20,6)->(20,34)
  for (let i = 0; i <= 1; i += 0.06) pts.push(t(20, 6 + 28 * i))
  // Arrow head (16,12)->(20,6) and (20,6)->(24,12)
  for (let i = 0; i <= 1; i += 0.15) pts.push(t(16 + 4 * i, 12 - 6 * i))
  for (let i = 0; i <= 1; i += 0.15) pts.push(t(20 + 4 * i, 6 + 6 * i))

  return pts
}

interface Particle {
  // Logo anchor point
  ax: number
  ay: number
  // Current position offset from anchor
  ox: number
  oy: number
  // Drift velocity
  vx: number
  vy: number
  // Visual
  radius: number
  alpha: number
  targetAlpha: number
  // Drift cycle
  driftAngle: number
  driftSpeed: number
  driftRadius: number
  // Pulse ring state
  ring: boolean
  ringRadius: number
  ringAlpha: number
}

export function LogoParticles({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return

    const isDark = () => document.documentElement.classList.contains("dark")

    let particles: Particle[] = []

    const buildParticles = (w: number, h: number) => {
      // Logo scale: ~28% of shorter dimension
      const scale = (Math.min(w, h) * 0.28) / 20
      const cx = w * 0.5
      const cy = h * 0.46

      const anchors = getLogoPoints(scale, cx, cy)

      particles = anchors.map((a) => {
        const driftRadius = 6 + Math.random() * 14
        return {
          ax: a.x,
          ay: a.y,
          ox: (Math.random() - 0.5) * 30,
          oy: (Math.random() - 0.5) * 30,
          vx: (Math.random() - 0.5) * 0.2,
          vy: (Math.random() - 0.5) * 0.2,
          radius: 0.5 + Math.random() * 0.7,
          alpha: 0,
          targetAlpha: 0.08 + Math.random() * 0.12, // max 0.20 — very faint
          driftAngle: Math.random() * Math.PI * 2,
          driftSpeed: 0.003 + Math.random() * 0.005,
          driftRadius,
          ring: false,
          ringRadius: 0,
          ringAlpha: 0,
        }
      })
    }

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      ctx.scale(dpr, dpr)
      buildParticles(w, h)
    }

    let frame = 0
    // Every ~8s, one random particle emits a faint expanding ring
    let nextRingFrame = 180 + Math.floor(Math.random() * 200)

    const draw = () => {
      rafRef.current = requestAnimationFrame(draw)
      frame++

      const w = canvas.offsetWidth
      const h = canvas.offsetHeight
      ctx.clearRect(0, 0, w, h)

      const dark = isDark()
      const rgb = dark ? "255,255,255" : "20,20,20"

      // Occasionally spawn a ring on a random particle
      if (frame === nextRingFrame && particles.length > 0) {
        const p = particles[Math.floor(Math.random() * particles.length)]
        p.ring = true
        p.ringRadius = p.radius
        p.ringAlpha = 0.12
        nextRingFrame = frame + 300 + Math.floor(Math.random() * 300)
      }

      for (const p of particles) {
        // Fade in slowly
        if (p.alpha < p.targetAlpha) p.alpha += 0.002

        // Gentle circular drift around anchor
        p.driftAngle += p.driftSpeed
        const targetOx = Math.cos(p.driftAngle) * p.driftRadius
        const targetOy = Math.sin(p.driftAngle) * p.driftRadius * 0.6

        // Soft-spring toward drift target
        p.vx += (targetOx - p.ox) * 0.008
        p.vy += (targetOy - p.oy) * 0.008
        p.vx *= 0.92
        p.vy *= 0.92
        p.ox += p.vx
        p.oy += p.vy

        const px = p.ax + p.ox
        const py = p.ay + p.oy

        // Draw dot
        ctx.beginPath()
        ctx.arc(px, py, p.radius, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${rgb},${p.alpha})`
        ctx.fill()

        // Draw expanding ring if active
        if (p.ring) {
          p.ringRadius += 0.6
          p.ringAlpha -= 0.0018
          if (p.ringAlpha <= 0) {
            p.ring = false
          } else {
            ctx.beginPath()
            ctx.arc(px, py, p.ringRadius, 0, Math.PI * 2)
            ctx.strokeStyle = `rgba(${rgb},${p.ringAlpha})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        }
      }
    }

    resize()
    draw()

    const ro = new ResizeObserver(resize)
    ro.observe(canvas)

    return () => {
      cancelAnimationFrame(rafRef.current)
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
