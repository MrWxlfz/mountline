export type EventExperienceState =
  | "entry"
  | "opening"
  | "waiting"
  | "transitioning"
  | "live"

export type VisualMode =
  | "liquid"
  | "marble"
  | "chrome"
  | "ink"
  | "contours"
  | "particles"
  | "logoFormation"

export type AudioMetrics = {
  bass: number
  mids: number
  treble: number
  energy: number
  peak: boolean
}

export type MusicCue = {
  time: number
  mode: VisualMode
  intensity: number
  textVisible?: boolean
  flash?: number
}

export const VISUAL_MODE_INDEX: Record<VisualMode, number> = {
  liquid: 0,
  marble: 1,
  chrome: 2,
  ink: 3,
  contours: 4,
  particles: 5,
  logoFormation: 6,
}

export const EMPTY_AUDIO_METRICS: AudioMetrics = {
  bass: 0,
  mids: 0,
  treble: 0,
  energy: 0,
  peak: false,
}
