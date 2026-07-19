"use client"

import dynamic from "next/dynamic"
import Image from "next/image"
import { AnimatePresence, motion } from "motion/react"
import type { MutableRefObject } from "react"
import { EventControls } from "./event-controls"
import { EventEntry } from "./event-entry"
import { OperatorPanel } from "./operator-panel"
import { RotatingMessage } from "./rotating-message"
import type {
  AudioMetrics,
  EventExperienceState,
  VisualMode,
} from "./event-types"
import styles from "./event.module.css"

const LiquidCanvas = dynamic(
  () => import("./liquid-canvas").then((module) => module.LiquidCanvas),
  { ssr: false },
)

interface EventPreshowProps {
  state: EventExperienceState
  entryBusy: boolean
  experienceElapsed: number
  transitionElapsed: number
  mode: VisualMode
  nextMode: VisualMode
  modeProgress: number
  cueTextVisible: boolean
  intensity: number
  reducedMotion: boolean
  reducedIntensity: boolean
  metrics: AudioMetrics
  metricsRef: MutableRefObject<AudioMetrics>
  currentTime: number
  soundEnabled: boolean
  playing: boolean
  muted: boolean
  volume: number
  fullscreen: boolean
  operatorMode: boolean
  operatorOpen: boolean
  pendingStart: boolean
  diagnostics: boolean
  testFlash: boolean
  webglAvailable: boolean
  onWebglUnavailable: () => void
  onEnter: (withSound: boolean) => void
  onEnableSound: () => void
  onTogglePlayback: () => void
  onToggleMute: () => void
  onVolumeChange: (volume: number) => void
  onToggleFullscreen: () => void
  onToggleIntensity: () => void
  onSkip: () => void
  onBegin: () => void
  onReset: () => void
  onOperatorOpen: () => void
  onOperatorClose: () => void
  onOperatorIntensity: (intensity: number) => void
  onTestFlash: () => void
  onToggleDiagnostics: () => void
}

export function EventPreshow({
  state,
  entryBusy,
  experienceElapsed,
  transitionElapsed,
  mode,
  nextMode,
  modeProgress,
  cueTextVisible,
  intensity,
  reducedMotion,
  reducedIntensity,
  metrics,
  metricsRef,
  currentTime,
  soundEnabled,
  playing,
  muted,
  volume,
  fullscreen,
  operatorMode,
  operatorOpen,
  pendingStart,
  diagnostics,
  testFlash,
  webglAvailable,
  onWebglUnavailable,
  onEnter,
  onEnableSound,
  onTogglePlayback,
  onToggleMute,
  onVolumeChange,
  onToggleFullscreen,
  onToggleIntensity,
  onSkip,
  onBegin,
  onReset,
  onOperatorOpen,
  onOperatorClose,
  onOperatorIntensity,
  onTestFlash,
  onToggleDiagnostics,
}: EventPreshowProps) {
  const openingTextVisible =
    state === "opening" &&
    cueTextVisible &&
    ((experienceElapsed >= 3.2 && experienceElapsed < 12) || experienceElapsed >= 18)
  const transitioning = state === "transitioning"
  const showLogo = transitioning && transitionElapsed >= 2.7 && transitionElapsed < 6.15
  const showTransitionTitle = transitioning && transitionElapsed >= 6.25
  const transitionFlash =
    transitioning &&
    !reducedMotion &&
    transitionElapsed >= 5.15 &&
    transitionElapsed < 5.38

  return (
    <div
      className={`${styles.preshow} ${!webglAvailable ? styles.webglFallback : ""}`}
      data-state={state}
    >
      <div className={styles.fallbackArt} aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      {webglAvailable && (
        <div className={styles.canvasLayer} aria-hidden="true">
          <LiquidCanvas
            metricsRef={metricsRef}
            mode={mode}
            nextMode={nextMode}
            modeProgress={modeProgress}
            experienceState={state}
            experienceElapsed={experienceElapsed}
            transitionElapsed={transitionElapsed}
            intensity={intensity}
            reducedMotion={reducedMotion}
            onUnavailable={onWebglUnavailable}
          />
        </div>
      )}

      <div className={styles.contrastVeil} aria-hidden="true" />

      <AnimatePresence>
        {state === "entry" && (
          <EventEntry key="entry" busy={entryBusy} onEnter={onEnter} />
        )}
      </AnimatePresence>

      {(state === "opening" || state === "waiting" || transitioning) && (
        <div className={styles.preshowUi}>
          <motion.div
            className={styles.topBrand}
            animate={{ opacity: transitioning ? 0 : 1 }}
            transition={{ duration: 0.9 }}
          >
            <Image src="/brand/mountline-icon.svg" alt="" width={28} height={28} />
            <span>mountline</span>
          </motion.div>

          <div className={styles.messageArea}>
            <AnimatePresence mode="wait">
              {openingTextVisible && (
                <motion.h1
                  key="opening-message"
                  className={styles.openingHeadline}
                  initial={{ opacity: 0, y: 18, filter: "blur(9px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  exit={{ opacity: 0, y: -8, filter: "blur(8px)" }}
                  transition={{ duration: reducedMotion ? 1.2 : 1.9, ease: [0.22, 1, 0.36, 1] }}
                >
                  <span>Welcome.</span>
                  {experienceElapsed >= 6 && <span>We’ll be starting shortly.</span>}
                </motion.h1>
              )}

              {state === "waiting" && (
                <RotatingMessage key="waiting-message" reducedMotion={reducedMotion} />
              )}
            </AnimatePresence>
          </div>

          <motion.div
            className={styles.liveSoon}
            animate={{ opacity: transitioning ? 0 : 1 }}
            transition={{ duration: 0.75 }}
          >
            <span aria-hidden="true" /> LIVE SOON
          </motion.div>

          {!transitioning && (
            <EventControls
              soundEnabled={soundEnabled}
              playing={playing}
              muted={muted}
              volume={volume}
              fullscreen={fullscreen}
              reducedIntensity={reducedIntensity}
              canSkip={operatorMode || process.env.NODE_ENV === "development"}
              onEnableSound={onEnableSound}
              onTogglePlayback={onTogglePlayback}
              onToggleMute={onToggleMute}
              onVolumeChange={onVolumeChange}
              onToggleFullscreen={onToggleFullscreen}
              onToggleIntensity={onToggleIntensity}
              onSkip={onSkip}
            />
          )}
        </div>
      )}

      <AnimatePresence>
        {showLogo && (
          <motion.div
            className={styles.formationLogo}
            initial={{ opacity: 0, scale: 0.88, filter: "blur(14px)" }}
            animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            exit={{ opacity: 0 }}
            transition={{ duration: reducedMotion ? 1.2 : 1.65, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src="/brand/mountline-icon.svg" alt="Mountline" width={150} height={150} />
          </motion.div>
        )}

        {showTransitionTitle && (
          <motion.div
            className={styles.transitionTitle}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.15, ease: [0.22, 1, 0.36, 1] }}
          >
            <h1>Mountline</h1>
            <p>The next chapter starts now.</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`${styles.whiteFlash} ${transitionFlash || testFlash ? styles.whiteFlashActive : ""}`}
        aria-hidden="true"
      />
      <div
        className={`${styles.transitionBlack} ${transitioning && transitionElapsed >= 5.3 ? styles.transitionBlackActive : ""}`}
        aria-hidden="true"
      />

      {operatorMode && state !== "live" && state !== "transitioning" && (
        <OperatorPanel
          open={operatorOpen}
          pendingStart={pendingStart}
          playing={playing}
          muted={muted}
          currentTime={currentTime}
          mode={mode}
          metrics={metrics}
          intensity={intensity}
          diagnostics={diagnostics}
          onOpen={onOperatorOpen}
          onClose={onOperatorClose}
          onBegin={onBegin}
          onReset={onReset}
          onTogglePlayback={onTogglePlayback}
          onToggleMute={onToggleMute}
          onIntensityChange={onOperatorIntensity}
          onFlash={onTestFlash}
          onToggleDiagnostics={onToggleDiagnostics}
        />
      )}

      {operatorMode && diagnostics && state !== "live" && state !== "transitioning" && (
        <div className={styles.performanceDiagnostics} aria-live="polite">
          <span>MODE {mode.toUpperCase()}</span>
          <span>ENERGY {metrics.energy.toFixed(3)}</span>
          <span>WEBGL {webglAvailable ? "ACTIVE" : "FALLBACK"}</span>
          <span>MOTION {reducedMotion ? "REDUCED" : "FULL"}</span>
        </div>
      )}
    </div>
  )
}
