type Variant = "dusk" | "night"

const W = 1200
const H = 900

const palettes: Record<Variant, { sky: [string, string, string]; glow: string; glowOpacity: number; ridges: string[]; seed: number }> = {
  dusk: {
    sky: ["#15141a", "#2b2427", "#5b3d2a"],
    glow: "#d08a3e",
    glowOpacity: 0.42,
    ridges: ["#4d3b33", "#372c28", "#261f1d", "#181615", "#0e0d0c"],
    seed: 11,
  },
  night: {
    sky: ["#07090c", "#0e131a", "#1d2631"],
    glow: "#6f86a3",
    glowOpacity: 0.18,
    ridges: ["#2c3540", "#1f262f", "#161b22", "#101317", "#0b0c0d"],
    seed: 29,
  },
}

function mulberry32(seed: number) {
  return () => {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

type Layer = { base: number; amplitude: number; wavelength: number; sharpness: number; octaves: number }

// Far ranges are tall and jagged; near hills are broad and low, the way terrain recedes.
const layers: Layer[] = [
  { base: 0.6, amplitude: 0.3, wavelength: 300, sharpness: 2.3, octaves: 5 },
  { base: 0.68, amplitude: 0.19, wavelength: 400, sharpness: 1.8, octaves: 4 },
  { base: 0.77, amplitude: 0.12, wavelength: 560, sharpness: 1.4, octaves: 4 },
  { base: 0.86, amplitude: 0.08, wavelength: 760, sharpness: 1.15, octaves: 3 },
  { base: 0.95, amplitude: 0.05, wavelength: 980, sharpness: 1, octaves: 3 },
]

function ridgeline(random: () => number, layer: Layer) {
  const lattice = Array.from({ length: 256 }, random)
  const value = (x: number) => {
    const i = Math.floor(x)
    const f = x - i
    const s = f * f * (3 - 2 * f)
    return lattice[i & 255] + (lattice[(i + 1) & 255] - lattice[i & 255]) * s
  }
  const offset = random() * 100
  const points: string[] = []
  for (let x = 0; x <= W; x += 5) {
    let sum = 0
    let weight = 0
    for (let octave = 0; octave < layer.octaves; octave++) {
      const w = Math.pow(0.48, octave)
      const n = value((x / layer.wavelength) * Math.pow(2.1, octave) + offset + octave * 13)
      sum += w * Math.pow(1 - Math.abs(2 * n - 1), layer.sharpness)
      weight += w
    }
    points.push(`${x},${(H * layer.base - H * layer.amplitude * (sum / weight)).toFixed(1)}`)
  }
  return `M0,${H} L${points.join(" L")} L${W},${H} Z`
}

const cache = new Map<Variant, { ridges: string[]; stars: Array<[number, number, number, number]> }>()

function geometry(variant: Variant) {
  const cached = cache.get(variant)
  if (cached) return cached
  const random = mulberry32(palettes[variant].seed)
  const ridges = layers.map((layer) => ridgeline(random, layer))
  const stars: Array<[number, number, number, number]> =
    variant === "night"
      ? Array.from({ length: 70 }, () => [random() * W, random() * H * 0.42, 0.5 + random() * 0.9, 0.15 + random() * 0.55])
      : []
  const result = { ridges, stars }
  cache.set(variant, result)
  return result
}

/** A layered ridgeline scene used behind product views, in place of stock photography. */
export function Landscape({ variant, id, className }: { variant: Variant; id: string; className?: string }) {
  const palette = palettes[variant]
  const { ridges, stars } = geometry(variant)

  return (
    <svg className={className} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={palette.sky[0]} />
          <stop offset="0.55" stopColor={palette.sky[1]} />
          <stop offset="0.72" stopColor={palette.sky[2]} />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx="0.64" cy="0.6" r="0.5" gradientTransform="translate(0.64 0.6) scale(1 0.42) translate(-0.64 -0.6)">
          <stop offset="0" stopColor={palette.glow} stopOpacity={palette.glowOpacity} />
          <stop offset="1" stopColor={palette.glow} stopOpacity="0" />
        </radialGradient>
        {palette.ridges.map((color, i) => (
          <linearGradient key={color} id={`${id}-r${i}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} />
            <stop offset="1" stopColor={palette.ridges[Math.min(palette.ridges.length - 1, i + 2)]} />
          </linearGradient>
        ))}
        <filter id={`${id}-grain`} x="0" y="0" width="100%" height="100%">
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>
      <rect width={W} height={H} fill={`url(#${id}-sky)`} />
      {stars.map(([x, y, r, o], i) => (
        <circle key={i} cx={x.toFixed(1)} cy={y.toFixed(1)} r={r.toFixed(2)} fill="#dfe6ef" opacity={o.toFixed(2)} />
      ))}
      <rect width={W} height={H} fill={`url(#${id}-glow)`} />
      {ridges.map((d, i) => (
        <path key={i} d={d} fill={`url(#${id}-r${i})`} />
      ))}
      <rect width={W} height={H} filter={`url(#${id}-grain)`} opacity="0.07" style={{ mixBlendMode: "overlay" }} />
    </svg>
  )
}
