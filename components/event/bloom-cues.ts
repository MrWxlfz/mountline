import type { MusicCue } from "./event-types"

/**
 * Broad direction for the supplied 194.87 second prototype track. The analyser
 * continues to drive all fine motion between cues. Keep replacements in this
 * one file so a licensed event track can be swapped without changing the scene.
 */
export const BLOOM_CUES: readonly MusicCue[] = [
  { time: 0, mode: "liquid", intensity: 0.28, textVisible: false },
  { time: 5, mode: "marble", intensity: 0.42, textVisible: true },
  { time: 12, mode: "chrome", intensity: 0.78, textVisible: false },
  { time: 19, mode: "ink", intensity: 0.48, textVisible: true },
  { time: 34, mode: "contours", intensity: 0.66 },
  { time: 54, mode: "particles", intensity: 0.72 },
  { time: 76, mode: "liquid", intensity: 0.6 },
  { time: 101, mode: "chrome", intensity: 0.82 },
  { time: 126, mode: "ink", intensity: 0.65 },
  { time: 150, mode: "contours", intensity: 0.7 },
  { time: 174, mode: "marble", intensity: 0.5 },
] as const

export const FALLBACK_CUES: readonly MusicCue[] = [
  { time: 0, mode: "liquid", intensity: 0.28, textVisible: false },
  { time: 5, mode: "marble", intensity: 0.42, textVisible: true },
  { time: 12, mode: "chrome", intensity: 0.78, textVisible: false },
  { time: 19, mode: "ink", intensity: 0.48, textVisible: true },
  { time: 34, mode: "contours", intensity: 0.62 },
  { time: 52, mode: "particles", intensity: 0.68 },
  { time: 70, mode: "liquid", intensity: 0.54 },
] as const

export function getCueAtTime(
  time: number,
  cues: readonly MusicCue[],
): { current: MusicCue; next: MusicCue; progress: number } {
  let index = 0

  for (let cueIndex = 0; cueIndex < cues.length; cueIndex += 1) {
    if (time >= cues[cueIndex].time) index = cueIndex
    else break
  }

  const current = cues[index]
  const next = cues[Math.min(index + 1, cues.length - 1)]
  const duration = Math.max(1, next.time - current.time)
  const rawProgress = next === current ? 0 : (time - current.time) / duration
  const progress = Math.min(1, Math.max(0, rawProgress))

  return { current, next, progress }
}
