"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useAudioEngine } from "./audio-engine"
import { BLOOM_CUES, FALLBACK_CUES, getCueAtTime } from "./bloom-cues"
import { EventPreshow } from "./event-preshow"
import { EventStage } from "./event-stage"
import type { EventExperienceState } from "./event-types"
import { useOperatorShortcuts } from "./use-operator-shortcuts"
import { useReducedMotionPreference } from "./use-reduced-motion-preference"
import styles from "./event.module.css"

const OPENING_DURATION = 22
const TRANSITION_DURATION = 9.35
const PRIMARY_DURATION = 194.87

interface EventExperienceProps {
  operatorMode: boolean
}

export function EventExperience({ operatorMode }: EventExperienceProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const experienceStartedAtRef = useRef<number | null>(null)
  const transitionStartedAtRef = useRef<number | null>(null)
  const pendingStartedAtRef = useRef<number | null>(null)
  const testFlashTimerRef = useRef<number | null>(null)
  const audio = useAudioEngine()
  const systemReducedMotion = useReducedMotionPreference()
  const [state, setState] = useState<EventExperienceState>("entry")
  const [entryBusy, setEntryBusy] = useState(false)
  const [experienceElapsed, setExperienceElapsed] = useState(0)
  const [transitionElapsed, setTransitionElapsed] = useState(0)
  const [pendingStart, setPendingStart] = useState(false)
  const [reducedIntensity, setReducedIntensity] = useState(false)
  const [operatorIntensity, setOperatorIntensity] = useState(0.92)
  const [operatorOpen, setOperatorOpen] = useState(operatorMode)
  const [diagnostics, setDiagnostics] = useState(false)
  const [testFlash, setTestFlash] = useState(false)
  const [fullscreen, setFullscreen] = useState(false)
  const [webglAvailable, setWebglAvailable] = useState(true)

  const reducedMotion = systemReducedMotion || reducedIntensity
  const visualIntensity = operatorIntensity * (reducedIntensity ? 0.52 : 1)
  const usingFallbackCues = !audio.enabled || audio.currentTime > PRIMARY_DURATION
  const cueClock = usingFallbackCues
    ? audio.currentTime % 86
    : audio.currentTime
  const cue = useMemo(
    () => getCueAtTime(cueClock, usingFallbackCues ? FALLBACK_CUES : BLOOM_CUES),
    [cueClock, usingFallbackCues],
  )
  const directedIntensity =
    cue.current.intensity +
    (cue.next.intensity - cue.current.intensity) * cue.progress
  const finalIntensity = visualIntensity * (0.7 + directedIntensity * 0.42)
  const cueTextVisible = cue.current.textVisible !== false

  const startTransition = useCallback(() => {
    if (state === "transitioning" || state === "live") return
    pendingStartedAtRef.current = null
    transitionStartedAtRef.current = performance.now()
    setPendingStart(false)
    setTransitionElapsed(0)
    setState("transitioning")
  }, [state])

  const enter = useCallback(
    async (withSound: boolean) => {
      if (entryBusy) return
      setEntryBusy(true)
      await audio.start(withSound)
      experienceStartedAtRef.current = performance.now()
      setExperienceElapsed(0)
      setState("opening")
      setEntryBusy(false)
    },
    [audio, entryBusy],
  )

  const reset = useCallback(async () => {
    setPendingStart(false)
    pendingStartedAtRef.current = null
    transitionStartedAtRef.current = null
    experienceStartedAtRef.current = performance.now()
    setExperienceElapsed(0)
    setTransitionElapsed(0)
    setState("opening")
    await audio.reset()
  }, [audio])

  const beginEvent = useCallback(() => {
    if (state === "live" || state === "transitioning" || pendingStart) return
    if (!audio.enabled || !audio.playing || state === "entry") {
      startTransition()
      return
    }

    pendingStartedAtRef.current = performance.now()
    setPendingStart(true)
  }, [audio.enabled, audio.playing, pendingStart, startTransition, state])

  const skipPreshow = useCallback(() => {
    audio.fadeOutAndStop()
    setPendingStart(false)
    setState("live")
  }, [audio])

  const toggleFullscreen = useCallback(() => {
    if (document.fullscreenElement) {
      void document.exitFullscreen()
    } else {
      void rootRef.current?.requestFullscreen()
    }
  }, [])

  const triggerTestFlash = useCallback(() => {
    if (reducedMotion) return
    if (testFlashTimerRef.current !== null) {
      window.clearTimeout(testFlashTimerRef.current)
    }
    setTestFlash(true)
    testFlashTimerRef.current = window.setTimeout(() => setTestFlash(false), 170)
  }, [reducedMotion])

  useEffect(() => {
    if (state === "entry" || state === "live") return

    const interval = window.setInterval(() => {
      const now = performance.now()
      if (experienceStartedAtRef.current !== null) {
        const elapsed = (now - experienceStartedAtRef.current) / 1000
        setExperienceElapsed(elapsed)
        if (state === "opening" && elapsed >= OPENING_DURATION) {
          setState("waiting")
        }
      }
      if (transitionStartedAtRef.current !== null) {
        setTransitionElapsed((now - transitionStartedAtRef.current) / 1000)
      }
    }, 80)

    return () => window.clearInterval(interval)
  }, [state])

  useEffect(() => {
    if (!pendingStart) return

    const interval = window.setInterval(() => {
      const waited =
        pendingStartedAtRef.current === null
          ? 0
          : (performance.now() - pendingStartedAtRef.current) / 1000
      const metrics = audio.metricsRef.current
      const musicalImpact =
        metrics.peak || metrics.bass > 0.48 || metrics.energy > 0.43

      if (musicalImpact || waited >= 2.5) startTransition()
    }, 40)

    return () => window.clearInterval(interval)
  }, [audio.metricsRef, pendingStart, startTransition])

  useEffect(() => {
    if (state !== "transitioning") return

    const fadeTimer = window.setTimeout(audio.fadeOutAndStop, 5850)
    const liveTimer = window.setTimeout(() => setState("live"), TRANSITION_DURATION * 1000)

    return () => {
      window.clearTimeout(fadeTimer)
      window.clearTimeout(liveTimer)
    }
  }, [audio.fadeOutAndStop, state])

  useEffect(() => {
    const updateFullscreen = () => setFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener("fullscreenchange", updateFullscreen)
    return () => document.removeEventListener("fullscreenchange", updateFullscreen)
  }, [])

  useEffect(() => {
    return () => {
      if (testFlashTimerRef.current !== null) {
        window.clearTimeout(testFlashTimerRef.current)
      }
    }
  }, [])

  useOperatorShortcuts({
    enabled: operatorMode,
    panelOpen: operatorOpen,
    onBegin: beginEvent,
    onMute: audio.toggleMute,
    onFullscreen: toggleFullscreen,
    onReset: () => void reset(),
    onClosePanel: () => setOperatorOpen(false),
  })

  return (
    <div ref={rootRef} className={styles.experience} data-state={state}>
      <EventStage active={state === "live"} />
      {state !== "live" && (
        <EventPreshow
          state={state}
          entryBusy={entryBusy}
          experienceElapsed={experienceElapsed}
          transitionElapsed={transitionElapsed}
          mode={cue.current.mode}
          nextMode={cue.next.mode}
          modeProgress={cue.progress}
          cueTextVisible={cueTextVisible}
          intensity={finalIntensity}
          reducedMotion={reducedMotion}
          reducedIntensity={reducedIntensity}
          metrics={audio.metrics}
          metricsRef={audio.metricsRef}
          currentTime={audio.currentTime}
          soundEnabled={audio.enabled}
          playing={audio.playing}
          muted={audio.muted}
          volume={audio.volume}
          fullscreen={fullscreen}
          operatorMode={operatorMode}
          operatorOpen={operatorOpen}
          pendingStart={pendingStart}
          diagnostics={diagnostics}
          testFlash={testFlash}
          webglAvailable={webglAvailable}
          onWebglUnavailable={() => setWebglAvailable(false)}
          onEnter={(withSound) => void enter(withSound)}
          onEnableSound={() => void audio.enableSound()}
          onTogglePlayback={() => void audio.togglePlayback()}
          onToggleMute={audio.toggleMute}
          onVolumeChange={audio.setVolume}
          onToggleFullscreen={toggleFullscreen}
          onToggleIntensity={() => setReducedIntensity((current) => !current)}
          onSkip={skipPreshow}
          onBegin={beginEvent}
          onReset={() => void reset()}
          onOperatorOpen={() => setOperatorOpen(true)}
          onOperatorClose={() => setOperatorOpen(false)}
          onOperatorIntensity={setOperatorIntensity}
          onTestFlash={triggerTestFlash}
          onToggleDiagnostics={() => setDiagnostics((current) => !current)}
        />
      )}
    </div>
  )
}
