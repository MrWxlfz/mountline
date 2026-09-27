"use client"

import { useEffect, useRef } from "react"

// Keypad characters, ordered from lightest to heaviest on the page.
const RAMP = [".", ":", "1", "7", "4", "0", "8", "#"]
const TIERS = [[".", ":"], ["1", "7", "4", "*"], ["0", "8", "#", "5"]]
// 4×4 ordered-dither thresholds: low densities become an even pattern rather than noise.
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map((v) => (v + 0.5) / 16)
const INTRO_SECONDS = 2.1
// Two ripples, then a pause: the cadence of a ringing phone.
const RING_CYCLE = 3.4
const RING_OFFSETS = [0, 0.5]
const RING_LIFE = 2.3
// Vertical distance counts extra so ripples stay visibly curved inside a short band.
const RING_SQUASH = 2.1
const MAX_CONTENT = 1240
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
 * A band of keypad glyphs that reads left to right as the product works:
 * a phone ringing, a voice on the line, then the lines of a written request.
 * The three zones line up with the three columns of the flow strip beneath it.
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
    // Zone edges (as a share of the canvas width) and the request block, in columns.
    let edge1 = 0.33
    let edge2 = 0.66
    let sourceCol = 4
    let requestCol = 0
    let requestCols = 30
    let frame = 0
    let start = 0
    let last = 0
    let running = false
    let visible = true
    const family = getComputedStyle(canvas).fontFamily || "ui-monospace, monospace"
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

      // Match the page container so each zone sits above its column in the strip.
      const gutter = parseFloat(getComputedStyle(canvas!).getPropertyValue("--gutter")) || 40
      const content = Math.min(width - gutter * 2, MAX_CONTENT)
      const left = (width - content) / 2
      edge1 = (left + content / 3) / width
      edge2 = (left + (content * 2) / 3) / width
      sourceCol = Math.round((left + content * 0.07) / cellW)
      requestCol = Math.ceil((left + (content * 2) / 3) / cellW) + (compact ? 1 : 3)
      requestCols = Math.max(8, Math.floor((left + content) / cellW) - requestCol)

      ctx!.font = `400 ${fontSize}px ${family}`
      ctx!.textAlign = "center"
      ctx!.textBaseline = "middle"
    }

    // The written request: a title line, then label/value pairs, the last one a status.
    function requestCell(c: number, r: number, time: number, front: number) {
      const lc = c - requestCol
      if (lc < 0 || lc >= requestCols) return 0
      const top = rows > 9 ? 2 : 1
      if (r < top || (r - top) % 2 !== 0) return 0
      const line = (r - top) / 2
      const lines = Math.floor((rows - top - 2) / 2) + 1
      if (line >= lines) return 0
      // Each line types in shortly after the intro sweep passes it.
      const typed = (front - requestCol) * 1.4 - line * 5 + (time > INTRO_SECONDS ? 999 : 0)
      if (lc > typed) return 0
      if (line === 0) return lc < Math.round(requestCols * 0.34) ? 0.95 : 0
      const label = Math.max(2, Math.round(requestCols * (0.16 + hash(line, 3) * 0.1)))
      const value = Math.max(3, Math.round(requestCols * (0.3 + hash(line, 9) * 0.34)))
      if (lc < label) return 0.42
      if (lc < label + 2) return 0
      if (lc < label + 2 + value) return line === lines - 1 && lc === label + 2 ? -1 : 0.9
      return 0
    }

    function draw(time: number) {
      ctx!.clearRect(0, 0, width, height)
      const intro = Math.min(1, time / INTRO_SECONDS)
      const front = easeOut(intro) * (cols + 14) - 7
      const buckets: Array<Array<[number, number, string]>> = Array.from({ length: 10 }, () => [])
      const amber: Array<[number, number, string, number]> = []
      const center = (rows - 1) / 2
      const maxRadius = (edge1 * width) * 1.15
      const ringWidth = cellW * 1.7

      // Ripple radii for the current moment of the ring cadence.
      const ripples: Array<[number, number]> = []
      const cycle = time % RING_CYCLE
      for (const offset of RING_OFFSETS) {
        const age = cycle - offset
        if (age >= 0 && age < RING_LIFE) ripples.push([(age / RING_LIFE) * maxRadius, 1 - age / RING_LIFE])
      }

      for (let c = 0; c < cols; c++) {
        const behind = front - c
        if (behind < 0) continue
        const x = offsetX + c * cellW
        const u = x / width
        const w1 = 1 - smoothstep(edge1 - 0.06, edge1 + 0.03, u)
        const w3 = smoothstep(edge2 - 0.02, edge2 + 0.02, u)
        const w2 = Math.max(0, 1 - w1 - w3)

        // A voice: words swell and fade over a quiet baseline, drifting toward the request.
        const words = smoothstep(0.3, 0.62, noise(c * 0.085 - time * 1.1, 3.1))
        const detail = 0.22 + 0.78 * noise(c * 1.35 - time * 4.6, 11.3)
        const amplitude = words * detail * (rows / 2 - 0.5)

        for (let r = 0; r < rows; r++) {
          const y = offsetY + r * cellH
          let density = 0
          let ringFront = 0

          if (w1 > 0.01) {
            const dx = (c - sourceCol) * cellW
            const dy = (r - center) * cellH * RING_SQUASH
            const distance = Math.hypot(dx, dy)
            let ring = 0
            for (const [radius, life] of ripples) {
              const band = Math.exp(-(((distance - radius) / ringWidth) ** 2)) * Math.pow(life, 1.3)
              if (band > ring) ring = band
              if (life > 0.72 && band > 0.55) ringFront = band
            }
            const source = distance < cellW * 1.6 ? 1 : distance < cellW * 3.2 ? 0.35 : 0
            const hum = 0.1 * noise(c * 0.2 + time * 0.3, r * 0.4)
            density += w1 * Math.min(1, Math.max(ring * 0.95, source) + hum)
          }

          if (w2 > 0.01) {
            const offset = Math.abs(r - center)
            const baseline = offset <= 0.5 ? 0.3 : 0
            const voice = offset <= amplitude ? 0.95 - 0.4 * (offset / Math.max(amplitude, 0.5)) : 0
            density += w2 * Math.max(baseline, voice)
          }

          let status = false
          if (w3 > 0.01) {
            const cell = requestCell(c, r, time, front)
            if (cell === -1) status = true
            density += w3 * (cell === -1 ? 0.9 : cell)
          }

          density = Math.min(1, density)
          const threshold = 0.1 + BAYER[(r % 4) * 4 + (c % 4)] * 0.32
          if (density <= threshold) continue

          const tier = TIERS[density < 0.38 ? 0 : density < 0.7 ? 1 : 2]
          let glyph = tier[Math.floor(hash(c, r * 13 + 3) * tier.length)]
          let alpha = 0.18 + density * 0.62

          if (behind < 5) {
            // The sweep front: characters scramble briefly before they settle.
            glyph = RAMP[Math.floor(hash(c + Math.floor(time * 30), r) * RAMP.length)]
            alpha *= 0.4 + behind / 8
            if (behind < 1.4) {
              amber.push([x, y, glyph, 0.9])
              continue
            }
          } else if (status) {
            amber.push([x, y, "#", 0.95])
            continue
          } else if (ringFront > 0) {
            amber.push([x, y, glyph, 0.3 + ringFront * 0.45])
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

    // A still frame for reduced motion: rings mid-ripple, a voice, and a finished request.
    const stillTime = INTRO_SECONDS + RING_CYCLE * 3 + 0.35

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

    const redrawStill = () => {
      if (!running && (start || reduceMotion)) draw(reduceMotion ? stillTime : Math.max(INTRO_SECONDS, (last - start) / 1000))
    }

    resize()
    const themeObserver = new MutationObserver(() => {
      readColors()
      redrawStill()
    })
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    const ready = document.fonts?.ready ?? Promise.resolve()
    ready.then(() => {
      ctx.font = `400 ${fontSize}px ${family}`
      if (reduceMotion) draw(stillTime)
      else play()
    })

    const resizeObserver = new ResizeObserver(() => {
      resize()
      redrawStill()
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
