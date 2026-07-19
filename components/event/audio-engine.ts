"use client"

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type MutableRefObject,
} from "react"
import {
  EMPTY_AUDIO_METRICS,
  type AudioMetrics,
} from "./event-types"

const PRIMARY_TRACK = "/audio/bloom-reference.mp3"
const LOOP_TRACK = "/audio/preshow-loop.mp3"
const FFT_SIZE = 2048
const CROSSFADE_SECONDS = 4

type AudioGraph = {
  context: AudioContext
  analyser: AnalyserNode
  masterGain: GainNode
  primary: HTMLAudioElement
  primaryGain: GainNode
  loop: HTMLAudioElement
  loopGain: GainNode
  frequencyData: Uint8Array<ArrayBuffer>
  loopAvailable: boolean
  crossfadeStarted: boolean
}

type AudioEngine = {
  metrics: AudioMetrics
  metricsRef: MutableRefObject<AudioMetrics>
  currentTime: number
  enabled: boolean
  playing: boolean
  muted: boolean
  volume: number
  trackAvailable: boolean
  loopAvailable: boolean
  start: (withSound: boolean) => Promise<boolean>
  enableSound: () => Promise<boolean>
  togglePlayback: () => Promise<void>
  toggleMute: () => void
  setVolume: (volume: number) => void
  reset: () => Promise<void>
  fadeOutAndStop: () => void
}

function averageBand(
  data: Uint8Array<ArrayBuffer>,
  sampleRate: number,
  minFrequency: number,
  maxFrequency: number,
): number {
  const binWidth = sampleRate / FFT_SIZE
  const start = Math.max(0, Math.floor(minFrequency / binWidth))
  const end = Math.min(data.length - 1, Math.ceil(maxFrequency / binWidth))
  let total = 0

  for (let index = start; index <= end; index += 1) total += data[index]

  return total / Math.max(1, end - start + 1) / 255
}

function smoothValue(current: number, target: number, factor: number): number {
  return current + (target - current) * factor
}

function createAudioElement(source?: string): HTMLAudioElement {
  const audio = source ? new Audio(source) : new Audio()
  audio.preload = source ? "auto" : "none"
  audio.crossOrigin = "anonymous"
  return audio
}

export function useAudioEngine(): AudioEngine {
  const graphRef = useRef<AudioGraph | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const visualStartRef = useRef(0)
  const lastUiUpdateRef = useRef(0)
  const metricsRef = useRef<AudioMetrics>({ ...EMPTY_AUDIO_METRICS })
  const volumeRef = useRef(0.72)
  const mutedRef = useRef(false)
  const [metrics, setMetrics] = useState<AudioMetrics>({ ...EMPTY_AUDIO_METRICS })
  const [currentTime, setCurrentTime] = useState(0)
  const [enabled, setEnabled] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [volume, setVolumeState] = useState(0.72)
  const [trackAvailable, setTrackAvailable] = useState(true)
  const [loopAvailable, setLoopAvailable] = useState(false)

  const applyMasterGain = useCallback((immediate = false) => {
    const graph = graphRef.current
    if (!graph) return

    const target = mutedRef.current ? 0 : volumeRef.current
    const now = graph.context.currentTime
    graph.masterGain.gain.cancelScheduledValues(now)
    graph.masterGain.gain.setValueAtTime(graph.masterGain.gain.value, now)

    if (immediate) graph.masterGain.gain.setValueAtTime(target, now)
    else graph.masterGain.gain.linearRampToValueAtTime(target, now + 0.18)
  }, [])

  const ensureGraph = useCallback(async (): Promise<AudioGraph | null> => {
    if (graphRef.current) return graphRef.current

    try {
      const context = new AudioContext()
      const analyser = context.createAnalyser()
      const masterGain = context.createGain()
      const primaryGain = context.createGain()
      const loopGain = context.createGain()
      const primary = createAudioElement(PRIMARY_TRACK)
      const loop = createAudioElement()
      const primarySource = context.createMediaElementSource(primary)
      const loopSource = context.createMediaElementSource(loop)

      analyser.fftSize = FFT_SIZE
      analyser.smoothingTimeConstant = 0.82
      analyser.minDecibels = -88
      analyser.maxDecibels = -12
      primaryGain.gain.value = 1
      loopGain.gain.value = 0
      masterGain.gain.value = volumeRef.current

      primarySource.connect(primaryGain)
      loopSource.connect(loopGain)
      primaryGain.connect(analyser)
      loopGain.connect(analyser)
      analyser.connect(masterGain)
      masterGain.connect(context.destination)

      let hasLoop = false
      try {
        const response = await fetch(LOOP_TRACK, { method: "HEAD" })
        hasLoop = response.ok
      } catch {
        hasLoop = false
      }

      if (hasLoop) {
        loop.src = LOOP_TRACK
        loop.preload = "auto"
        loop.load()
      }

      const graph: AudioGraph = {
        context,
        analyser,
        masterGain,
        primary,
        primaryGain,
        loop,
        loopGain,
        frequencyData: new Uint8Array(analyser.frequencyBinCount),
        loopAvailable: hasLoop,
        crossfadeStarted: false,
      }

      loop.loop = true
      graphRef.current = graph
      setLoopAvailable(hasLoop)

      primary.addEventListener("error", () => {
        setTrackAvailable(false)
        setPlaying(false)
        if (process.env.NODE_ENV === "development") {
          console.warn(
            `[Mountline event] Primary audio is unavailable. Add ${PRIMARY_TRACK} to enable music-reactive playback.`,
          )
        }
      })
      primary.addEventListener("ended", () => {
        if (!graph.loopAvailable) setPlaying(false)
      })
      loop.addEventListener("play", () => setPlaying(true))

      return graph
    } catch (error) {
      setTrackAvailable(false)
      if (process.env.NODE_ENV === "development") {
        console.warn(
          "[Mountline event] Web Audio could not initialize; using procedural visual energy.",
          error,
        )
      }
      return null
    }
  }, [])

  const start = useCallback(
    async (withSound: boolean): Promise<boolean> => {
      visualStartRef.current = performance.now()
      if (!withSound) {
        setEnabled(false)
        setPlaying(false)
        return true
      }

      const graph = await ensureGraph()
      if (!graph) return false

      try {
        await graph.context.resume()
        graph.primary.currentTime = 0
        graph.primaryGain.gain.setValueAtTime(1, graph.context.currentTime)
        graph.loopGain.gain.setValueAtTime(0, graph.context.currentTime)
        await graph.primary.play()
        graph.crossfadeStarted = false
        setEnabled(true)
        setPlaying(true)
        setTrackAvailable(true)
        applyMasterGain(true)
        return true
      } catch (error) {
        setEnabled(false)
        setPlaying(false)
        if (process.env.NODE_ENV === "development") {
          console.warn(
            "[Mountline event] Audio playback failed; continuing silently.",
            error,
          )
        }
        return false
      }
    },
    [applyMasterGain, ensureGraph],
  )

  const enableSound = useCallback(async (): Promise<boolean> => {
    const graph = graphRef.current ?? (await ensureGraph())
    if (!graph) return false

    try {
      await graph.context.resume()
      const activeTrack = graph.crossfadeStarted ? graph.loop : graph.primary
      await activeTrack.play()
      setEnabled(true)
      setPlaying(true)
      setTrackAvailable(true)
      applyMasterGain()
      return true
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("[Mountline event] Sound could not be enabled.", error)
      }
      return false
    }
  }, [applyMasterGain, ensureGraph])

  const togglePlayback = useCallback(async (): Promise<void> => {
    const graph = graphRef.current
    if (!graph) {
      await enableSound()
      return
    }

    const activeTrack = graph.crossfadeStarted ? graph.loop : graph.primary
    if (activeTrack.paused) {
      await graph.context.resume()
      await activeTrack.play()
      setPlaying(true)
      setEnabled(true)
    } else {
      graph.primary.pause()
      graph.loop.pause()
      setPlaying(false)
    }
  }, [enableSound])

  const toggleMute = useCallback(() => {
    mutedRef.current = !mutedRef.current
    setMuted(mutedRef.current)
    applyMasterGain()
  }, [applyMasterGain])

  const setVolume = useCallback(
    (nextVolume: number) => {
      const clamped = Math.min(1, Math.max(0, nextVolume))
      volumeRef.current = clamped
      setVolumeState(clamped)
      if (clamped > 0 && mutedRef.current) {
        mutedRef.current = false
        setMuted(false)
      }
      applyMasterGain()
    },
    [applyMasterGain],
  )

  const reset = useCallback(async (): Promise<void> => {
    visualStartRef.current = performance.now()
    metricsRef.current = { ...EMPTY_AUDIO_METRICS }
    const graph = graphRef.current
    if (!graph) return

    graph.primary.pause()
    graph.loop.pause()
    graph.primary.currentTime = 0
    graph.loop.currentTime = 0
    graph.crossfadeStarted = false
    graph.primaryGain.gain.setValueAtTime(1, graph.context.currentTime)
    graph.loopGain.gain.setValueAtTime(0, graph.context.currentTime)

    if (enabled) {
      await graph.context.resume()
      await graph.primary.play().catch(() => undefined)
      setPlaying(!graph.primary.paused)
    }
  }, [enabled])

  const fadeOutAndStop = useCallback(() => {
    const graph = graphRef.current
    if (!graph) return

    const now = graph.context.currentTime
    graph.masterGain.gain.cancelScheduledValues(now)
    graph.masterGain.gain.setValueAtTime(graph.masterGain.gain.value, now)
    graph.masterGain.gain.linearRampToValueAtTime(0, now + 1.4)
    window.setTimeout(() => {
      graph.primary.pause()
      graph.loop.pause()
      setPlaying(false)
    }, 1450)
  }, [])

  useEffect(() => {
    let active = true

    const update = (timestamp: number) => {
      if (!active) return
      if (visualStartRef.current === 0) visualStartRef.current = timestamp
      const graph = graphRef.current
      const previous = metricsRef.current
      const fallbackTime = (timestamp - visualStartRef.current) / 1000
      let bassTarget = 0
      let midsTarget = 0
      let trebleTarget = 0

      if (graph && enabled && playing && graph.context.state === "running") {
        graph.analyser.getByteFrequencyData(graph.frequencyData)
        bassTarget = averageBand(graph.frequencyData, graph.context.sampleRate, 35, 180)
        midsTarget = averageBand(graph.frequencyData, graph.context.sampleRate, 180, 2400)
        trebleTarget = averageBand(graph.frequencyData, graph.context.sampleRate, 2400, 12000)

        if (
          graph.loopAvailable &&
          !graph.crossfadeStarted &&
          Number.isFinite(graph.primary.duration) &&
          graph.primary.duration - graph.primary.currentTime <= CROSSFADE_SECONDS
        ) {
          graph.crossfadeStarted = true
          graph.loop.currentTime = 0
          void graph.loop.play().then(() => {
            const now = graph.context.currentTime
            graph.primaryGain.gain.setValueAtTime(graph.primaryGain.gain.value, now)
            graph.loopGain.gain.setValueAtTime(0, now)
            graph.primaryGain.gain.linearRampToValueAtTime(0, now + CROSSFADE_SECONDS)
            graph.loopGain.gain.linearRampToValueAtTime(1, now + CROSSFADE_SECONDS)
          })
        }
      } else {
        const settle = graph?.primary.ended && !graph.loopAvailable ? 0.46 : 1
        bassTarget =
          (0.2 + 0.11 * Math.sin(fallbackTime * 0.71) + 0.045 * Math.sin(fallbackTime * 2.17)) * settle
        midsTarget =
          (0.25 + 0.1 * Math.sin(fallbackTime * 0.43 + 1.1) + 0.035 * Math.sin(fallbackTime * 1.73)) * settle
        trebleTarget =
          (0.18 + 0.08 * Math.sin(fallbackTime * 0.91 + 2.4) + 0.025 * Math.sin(fallbackTime * 3.11)) * settle
      }

      const bass = smoothValue(previous.bass, Math.max(0, bassTarget), 0.09)
      const mids = smoothValue(previous.mids, Math.max(0, midsTarget), 0.075)
      const treble = smoothValue(previous.treble, Math.max(0, trebleTarget), 0.065)
      const energyTarget = bass * 0.48 + mids * 0.34 + treble * 0.18
      const energy = smoothValue(previous.energy, energyTarget, 0.085)
      const peak = energy > 0.44 && energy - previous.energy > 0.012
      const nextMetrics = { bass, mids, treble, energy, peak }
      metricsRef.current = nextMetrics

      if (timestamp - lastUiUpdateRef.current > 100) {
        lastUiUpdateRef.current = timestamp
        setMetrics(nextMetrics)
        setCurrentTime(
          graph?.crossfadeStarted
            ? graph.loop.currentTime
            : graph?.primary.ended
              ? fallbackTime
              : (graph?.primary.currentTime ?? fallbackTime),
        )
      }

      animationFrameRef.current = requestAnimationFrame(update)
    }

    animationFrameRef.current = requestAnimationFrame(update)
    return () => {
      active = false
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [enabled, playing])

  useEffect(() => {
    return () => {
      const graph = graphRef.current
      if (!graph) return
      graph.primary.pause()
      graph.loop.pause()
      graph.primary.removeAttribute("src")
      graph.loop.removeAttribute("src")
      void graph.context.close()
      graphRef.current = null
    }
  }, [])

  return {
    metrics,
    metricsRef,
    currentTime,
    enabled,
    playing,
    muted,
    volume,
    trackAvailable,
    loopAvailable,
    start,
    enableSound,
    togglePlayback,
    toggleMute,
    setVolume,
    reset,
    fadeOutAndStop,
  }
}
