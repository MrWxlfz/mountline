/**
 * The Mountline mark rebuilt from rows of very small words.
 *
 * Geometry is the logo's own (see components/brand/wordmark.tsx, viewBox 0 0 180 180):
 *   triangle  M90 34 L145 137 H35 Z   stroke 8, round joins
 *   stem      M90 146 V29              stroke 11, round caps
 *   chevron   M70 57 L90 29 L110 57    stroke 11, round caps and join
 * Each stroke is filled with parallel rows of text that stay inside its width. Where strokes cross,
 * the lower layer stops short (chevron over stem over triangle), exactly as the solid mark overlaps,
 * so every word is whole. Rows run in reading direction, never upside down.
 */

type Point = readonly [number, number]

export type MicrotypeRow = {
  /** Baseline start, in logo units. */
  x: number
  y: number
  /** Rotation in degrees about the baseline start. */
  angle: number
  text: string
  /** Rendered length; set so each row ends where its stroke does. */
  length: number
  layer: "triangle" | "stem" | "chevron"
}

export type MicrotypeVariant = {
  fontSize: number
  rows: MicrotypeRow[]
}

const WORDS = ["TRUST", "CARE", "DETAIL", "CLARITY", "WORK"] as const
// Geist Mono and system monospace faces advance 0.6em per character; a touch of tracking helps at this size.
const ADVANCE = 0.6 * 1.1

const APEX: Point = [90, 34]
const BASE_LEFT: Point = [35, 137]
const BASE_RIGHT: Point = [145, 137]
const STEM_TOP: Point = [90, 29]
const STEM_BOTTOM: Point = [90, 146]
const CHEVRON_LEFT: Point = [70, 57]
const CHEVRON_TIP: Point = [90, 29]
const CHEVRON_RIGHT: Point = [110, 57]
const STEM_HALF = 5.5
const CHEVRON_HALF = 5.5
// Clear space between a layer and the one drawn over it.
const LAYER_GAP = 1.1

const sub = (a: Point, b: Point): Point => [a[0] - b[0], a[1] - b[1]]
const add = (a: Point, b: Point): Point => [a[0] + b[0], a[1] + b[1]]
const scale = (a: Point, k: number): Point => [a[0] * k, a[1] * k]
const length = (a: Point) => Math.hypot(a[0], a[1])
const unit = (a: Point): Point => scale(a, 1 / length(a))
// SVG y points down: the side a glyph's top faces, for text running along `direction`.
const up = (direction: Point): Point => [direction[1], -direction[0]]

function distanceToSegment(p: Point, a: Point, b: Point) {
  const ab = sub(b, a)
  const t = Math.max(0, Math.min(1, ((p[0] - a[0]) * ab[0] + (p[1] - a[1]) * ab[1]) / (ab[0] ** 2 + ab[1] ** 2)))
  return length(sub(p, add(a, scale(ab, t))))
}

const chevronDistance = (p: Point) => Math.min(distanceToSegment(p, CHEVRON_LEFT, CHEVRON_TIP), distanceToSegment(p, CHEVRON_TIP, CHEVRON_RIGHT))
const stemDistance = (p: Point) => distanceToSegment(p, STEM_BOTTOM, STEM_TOP)

/** Intersection of two lines, each given by a point and a direction. */
function intersect(p: Point, d: Point, q: Point, e: Point): Point {
  const denominator = d[0] * e[1] - d[1] * e[0]
  const t = ((q[0] - p[0]) * e[1] - (q[1] - p[1]) * e[0]) / denominator
  return add(p, scale(d, t))
}

type Segment = { a: Point; b: Point; layer: MicrotypeRow["layer"] }

/** Put a segment in reading direction: left to right, or bottom to top when vertical. */
function readable(a: Point, b: Point): [Point, Point] {
  const d = sub(b, a)
  if (Math.abs(d[0]) < 1e-6) return d[1] > 0 ? [b, a] : [a, b]
  return d[0] < 0 ? [b, a] : [a, b]
}

function trim(a: Point, b: Point, start: number, end: number): [Point, Point] | null {
  const d = sub(b, a)
  const total = length(d)
  if (total - start - end <= 0) return null
  const u = scale(d, 1 / total)
  return [add(a, scale(u, start)), sub(b, scale(u, end))]
}

/** Keep the parts of a row that are clear of the layers drawn above it. */
function visibleParts(segment: Segment, blocked: (p: Point) => boolean, minimum: number): Segment[] {
  const d = sub(segment.b, segment.a)
  const total = length(d)
  const steps = Math.max(2, Math.ceil(total / 0.2))
  const parts: Segment[] = []
  let start: number | null = null
  for (let i = 0; i <= steps; i++) {
    const t = i / steps
    const open = !blocked(add(segment.a, scale(d, t)))
    if (open && start === null) start = t
    if ((!open || i === steps) && start !== null) {
      const end = open ? t : (i - 1) / steps
      if ((end - start) * total >= minimum) parts.push({ a: add(segment.a, scale(d, start)), b: add(segment.a, scale(d, end)), layer: segment.layer })
      start = null
    }
  }
  return parts
}

function triangleRows(offsets: readonly number[], fontSize: number): Segment[] {
  // Offsetting a triangle inward by `o` scales it about its incenter by (r - o) / r.
  const a = length(sub(BASE_RIGHT, BASE_LEFT))
  const b = length(sub(APEX, BASE_RIGHT))
  const c = length(sub(BASE_LEFT, APEX))
  const perimeter = a + b + c
  const incenter: Point = [
    (a * APEX[0] + b * BASE_LEFT[0] + c * BASE_RIGHT[0]) / perimeter,
    (a * APEX[1] + b * BASE_LEFT[1] + c * BASE_RIGHT[1]) / perimeter,
  ]
  const area = Math.abs((BASE_LEFT[0] - APEX[0]) * (BASE_RIGHT[1] - APEX[1]) - (BASE_RIGHT[0] - APEX[0]) * (BASE_LEFT[1] - APEX[1])) / 2
  const inradius = area / (perimeter / 2)
  // Rows meet on each corner's bisector, like a mitered frame; back off just enough that glyphs don't touch.
  const cornerTrim = fontSize * 0.8
  const rows: Segment[] = []
  for (const offset of offsets) {
    const k = (inradius - offset) / inradius
    const [p, q, r] = [APEX, BASE_LEFT, BASE_RIGHT].map((vertex) => add(incenter, scale(sub(vertex, incenter), k)))
    for (const [from, to] of [[p, q], [q, r], [r, p]] as const) {
      const cut = trim(from, to, cornerTrim, cornerTrim)
      if (cut) rows.push({ a: cut[0], b: cut[1], layer: "triangle" })
    }
  }
  return rows
}

function stemRows(offsets: readonly number[], fontSize: number): Segment[] {
  const radius = STEM_HALF - fontSize * 0.45
  return offsets.map((offset) => {
    // Rows follow the round cap: the farther from center, the shorter the row.
    const cap = Math.sqrt(Math.max(0, radius ** 2 - offset ** 2))
    return { a: [STEM_BOTTOM[0] + offset, STEM_BOTTOM[1] + cap] as Point, b: [STEM_TOP[0] + offset, STEM_TOP[1] - cap] as Point, layer: "stem" as const }
  })
}

function chevronRows(offsets: readonly number[], fontSize: number): Segment[] {
  const radius = CHEVRON_HALF - fontSize * 0.45
  const left = unit(sub(CHEVRON_TIP, CHEVRON_LEFT))
  const right = unit(sub(CHEVRON_RIGHT, CHEVRON_TIP))
  const rows: Segment[] = []
  for (const offset of offsets) {
    const leftStart = add(CHEVRON_LEFT, scale(up(left), offset))
    const rightEnd = add(CHEVRON_RIGHT, scale(up(right), offset))
    const tip = intersect(leftStart, left, rightEnd, right)
    const cap = Math.sqrt(Math.max(0, radius ** 2 - offset ** 2))
    const tipTrim = fontSize * 0.7
    const leftArm = trim(sub(leftStart, scale(left, cap)), tip, 0, tipTrim)
    const rightArm = trim(tip, add(rightEnd, scale(right, cap)), tipTrim, 0)
    if (leftArm) rows.push({ a: leftArm[0], b: leftArm[1], layer: "chevron" })
    if (rightArm) rows.push({ a: rightArm[0], b: rightArm[1], layer: "chevron" })
  }
  return rows
}

function fill(segmentLength: number, fontSize: number, cursor: { index: number }) {
  const advance = ADVANCE * fontSize
  const capacity = Math.floor(segmentLength / advance)
  let text = ""
  for (let tries = 0; tries < WORDS.length * 4; tries++) {
    const word = WORDS[cursor.index % WORDS.length]
    const next = text ? `${text} ${word}` : word
    if (next.length > capacity) break
    text = next
    cursor.index++
  }
  // Close a large gap with whichever word fits best, so rows end where the stroke does.
  const room = capacity - text.length - (text ? 1 : 0)
  const filler = [...WORDS].filter((word) => word.length <= room).sort((x, y) => y.length - x.length)[0]
  if (filler) text = text ? `${text} ${filler}` : filler
  return text
}

export function buildMicrotypeMark(options: { fontSize: number; triangle: readonly number[]; stem: readonly number[]; chevron: readonly number[]; start?: number }): MicrotypeVariant {
  const { fontSize } = options
  const glyph = fontSize * 0.45
  const minimum = ADVANCE * fontSize * 4.2

  const segments = [
    ...triangleRows(options.triangle, fontSize).flatMap((segment) =>
      visibleParts(segment, (p) => chevronDistance(p) < CHEVRON_HALF + LAYER_GAP + glyph || stemDistance(p) < STEM_HALF + LAYER_GAP + glyph, minimum),
    ),
    ...stemRows(options.stem, fontSize).flatMap((segment) =>
      visibleParts(segment, (p) => chevronDistance(p) < CHEVRON_HALF + LAYER_GAP + glyph, minimum),
    ),
    ...chevronRows(options.chevron, fontSize),
  ]

  const cursor = { index: options.start ?? 0 }
  const rows: MicrotypeRow[] = []
  for (const segment of segments) {
    const [a, b] = readable(segment.a, segment.b)
    const direction = sub(b, a)
    const total = length(direction)
    const text = fill(total, fontSize, cursor)
    if (!text) continue
    const natural = text.length * ADVANCE * fontSize
    // Every row runs the full length of its stroke so the edges stay crisp; only a stub is centered.
    const rendered = natural / total > 0.55 ? total : natural
    const u = scale(direction, 1 / total)
    const start = add(a, scale(u, (total - rendered) / 2))
    // Rows are laid out by their centerline; the baseline sits half a cap height below it.
    const baseline = sub(start, scale(up(u), 0.36 * fontSize))
    rows.push({
      x: round(baseline[0]),
      y: round(baseline[1]),
      angle: round((Math.atan2(direction[1], direction[0]) * 180) / Math.PI),
      text,
      length: round(rendered),
      layer: segment.layer,
    })
  }
  return { fontSize, rows }
}

const round = (value: number) => Math.round(value * 1000) / 1000

/** Dense rows for large sizes; fewer, larger rows so small screens still read as type. */
// Row spacing is about 1.15× the type size, so each stroke reads as one solid band from a normal
// distance and only resolves into words up close.
export const microtypeFine = buildMicrotypeMark({
  fontSize: 1.3,
  triangle: [-3, -1.5, 0, 1.5, 3],
  stem: [-4.5, -3, -1.5, 0, 1.5, 3, 4.5],
  chevron: [-4.5, -3, -1.5, 0, 1.5, 3, 4.5],
})
export const microtypeCoarse = buildMicrotypeMark({
  fontSize: 1.75,
  triangle: [-2.7, -0.9, 0.9, 2.7],
  stem: [-3.8, -1.9, 0, 1.9, 3.8],
  chevron: [-3.8, -1.9, 0, 1.9, 3.8],
  start: 2,
})

/** The logo's bounds in its own units, with a little room for the round caps. */
export const MARK_VIEWBOX = "26 18 128 138"
