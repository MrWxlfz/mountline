"use client"

import { useEffect, useRef } from "react"

// Keypad characters, ordered from lightest to heaviest on the page.
const RAMP = [".", ":", "1", "7", "4", "0", "8", "#"]
const TIERS = [[".", ":"], ["1", "7", "4", "*"], ["0", "8", "#", "5"]]
// 4×4 ordered-dither thresholds: density becomes a crisp, even pattern rather than noise.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16)
const INTRO_SECONDS = 1.9
const DEFAULT_FG = "237, 235, 229"
const DEFAULT_AMBER = "228, 168, 83"

function hash(x: number, y: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263)) | 0
  h = Math.imul(h ^ (h >>> 13), 1274126177)
  h ^= h >>> 16
  return (h >>> 0) / 4294967296
}

function noise(x: number, y: number) {
  const xi = Math.floor(x)
  const yi = Math.floor(y)
  const xf = x - xi
  const yf = y - yi
  const u = xf * xf * (3 - 2 * xf)
  const v = yf * yf * (3 - 2 * yf)
  const a = hash(xi, yi)
  const b = hash(xi + 1, yi)
  const c = hash(xi, yi + 1)
  const d = hash(xi + 1, yi + 1)
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v
}

function smoothstep(edge0: number, edge1: number, x: number) {
  const t = Math.min(1, Math.max(0, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

const easeOut = (t: number) => 1 - Math.pow(1 - t, 3)

/**
 * A band of keypad glyphs whose density forms a slow, drifting gradient.
 * It sweeps in once on load, then moves quietly while it is on screen.
 */
export function GlyphField({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    let width = 0
    let height = 0
    let cols = 0
    let rows = 0
    let cellW = 10
    let cellH = 15
    let fontSize = 12
    let offsetX = 0
    let offsetY = 0
    let frame = 0
    let start = 0
    let last = 0
    let running = false
    let visible = true
    const style = getComputedStyle(canvas)
    const family = style.fontFamily || "ui-monospace, monospace"
    // Colours can be themed from CSS: --glyph-rgb and --glyph-accent-rgb as "r, g, b".
    let FG = DEFAULT_FG
    let AMBER = DEFAULT_AMBER
    const readColors = () => {
      const current = getComputedStyle(canvas)
      FG = current.getPropertyValue("--glyph-rgb").trim() || DEFAULT_FG
      AMBER = current.getPropertyValue("--glyph-accent-rgb").trim() || DEFAULT_AMBER
    }
    readColors()

    function resize() {
      const rect = canvas!.getBoundingClientRect()
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      width = rect.width
      height = rect.height
      canvas!.width = Math.round(width * dpr)
      canvas!.height = Math.round(height * dpr)
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0)
      const compact = width < 700
      fontSize = compact ? 11 : 12
      cellW = compact ? 9 : 10
      cellH = compact ? 13 : 15
      cols = Math.floor(width / cellW)
      rows = Math.floor(height / cellH)
      offsetX = (width - cols * cellW) / 2 + cellW / 2
      offsetY = (height - rows * cellH) / 2 + cellH / 2
      ctx!.font = `400 ${fontSize}px ${family}`
      ctx!.textAlign = "center"
      ctx!.textBaseline = "middle"
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height)
      const t = time
      const intro = Math.min(1, t / INTRO_SECONDS)
      const front = easeOut(intro) * (cols + 14) - 7
      const buckets: Array<Array<[number, number, string]>> = Array.from({ length: 10 }, () => [])
      const amber: Array<[number, number, string, number]> = []

      for (let c = 0; c < cols; c++) {
        const behind = front - c
        if (behind < 0) continue
        const u = cols > 1 ? c / (cols - 1) : 0
        // Sparse on the left, fullest just right of centre, easing off at the far edge.
        const shape = smoothstep(0.04, 0.78, u) * (1 - 0.35 * smoothstep(0.9, 1, u))

        for (let r = 0; r < rows; r++) {
          const n =
            noise(c * 0.03 - t * 0.11, r * 0.12 + t * 0.018) * 0.7 +
            noise(c * 0.09 + 41 - t * 0.2, r * 0.16 - 7) * 0.3
          const swell = 0.5 + 0.5 * Math.sin(c * 0.045 - t * 0.55)
          const density = Math.min(1, Math.max(0, shape * (0.15 + 1.25 * n * n + 0.18 * swell) - 0.04))
          const threshold = BAYER[(r % 4) * 4 + (c % 4)] * 0.62 + hash(c * 3 + 7, r * 5 + 1) * 0.38
          if (density <= threshold) continue

          const tier = TIERS[density < 0.38 ? 0 : density < 0.7 ? 1 : 2]
          let glyph = tier[Math.floor(hash(c, r * 13 + 3) * tier.length)]
          let alpha = 0.22 + density * 0.5
          const x = offsetX + c * cellW
          const y = offsetY + r * cellH

          if (behind < 5) {
            // The sweep front: characters scramble briefly before they settle.
            glyph = RAMP[Math.floor(hash(c + Math.floor(t * 30), r) * RAMP.length)]
            alpha *= 0.4 + behind / 8
            if (behind < 1.4) {
              amber.push([x, y, glyph, 0.9])
              continue
            }
          } else if (density > 0.8 && hash(c, r) > 0.975) {
            amber.push([x, y, glyph, 0.75])
            continue
          }

          buckets[Math.min(9, Math.floor(alpha * 10))].push([x, y, glyph])
        }
      }

      for (let i = 0; i < buckets.length; i++) {
        const cells = buckets[i]
        if (!cells.length) continue
        ctx!.fillStyle = `rgba(${FG}, ${(i + 0.5) / 10})`
        for (const [x, y, glyph] of cells) ctx!.fillText(glyph, x, y)
      }
      for (const [x, y, glyph, a] of amber) {
        ctx!.fillStyle = `rgba(${AMBER}, ${a})`
        ctx!.fillText(glyph, x, y)
      }
    }

    function tick(now: number) {
      if (!running) return
      if (!start) start = now
      const elapsed = (now - start) / 1000
      // Full frame rate for the sweep, then a calmer 30fps.
      if (elapsed < INTRO_SECONDS + 0.2 || now - last > 32) {
        last = now
        draw(elapsed)
      }
      frame = requestAnimationFrame(tick)
    }

    function play() {
      if (running || reduceMotion || !visible || document.hidden) return
      running = true
      if (start) start = performance.now() - (last - start)
      frame = requestAnimationFrame(tick)
    }

    function pause() {
      running = false
      cancelAnimationFrame(frame)
    }

    resize()
    const themeObserver = new MutationObserver(() => {
      readColors()
      if (!running && (start || reduceMotion)) draw(reduceMotion ? INTRO_SECONDS + 6 : Math.max(INTRO_SECONDS, (last - start) / 1000))
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    const ready = document.fonts?.ready ?? Promise.resolve()
    ready.then(() => {
      ctx.font = `400 ${fontSize}px ${family}`
      if (reduceMotion) draw(INTRO_SECONDS + 6)
      else play()
    })

    const resizeObserver = new ResizeObserver(() => {
      resize()
      if (!running && (start || reduceMotion)) draw(reduceMotion ? INTRO_SECONDS + 6 : Math.max(INTRO_SECONDS, (last - start) / 1000))
    })
    resizeObserver.observe(canvas)

    const intersection = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      if (visible) play()
      else pause()
    })
    intersection.observe(canvas)

    const onVisibility = () => (document.hidden ? pause() : play())
    document.addEventListener("visibilitychange", onVisibility)

    return () => {
      pause()
      themeObserver.disconnect()
      resizeObserver.disconnect()
      intersection.disconnect()
      document.removeEventListener("visibilitychange", onVisibility)
    }
  }, [])

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />
}
