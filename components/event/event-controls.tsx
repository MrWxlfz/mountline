"use client"

import { useEffect, useRef, useState } from "react"
import {
  Maximize2,
  Minimize2,
  Pause,
  Play,
  Sparkles,
  Volume1,
  Volume2,
  VolumeX,
} from "lucide-react"
import styles from "./event.module.css"

interface EventControlsProps {
  soundEnabled: boolean
  playing: boolean
  muted: boolean
  volume: number
  fullscreen: boolean
  reducedIntensity: boolean
  canSkip: boolean
  onEnableSound: () => void
  onTogglePlayback: () => void
  onToggleMute: () => void
  onVolumeChange: (volume: number) => void
  onToggleFullscreen: () => void
  onToggleIntensity: () => void
  onSkip: () => void
}

export function EventControls({
  soundEnabled,
  playing,
  muted,
  volume,
  fullscreen,
  reducedIntensity,
  canSkip,
  onEnableSound,
  onTogglePlayback,
  onToggleMute,
  onVolumeChange,
  onToggleFullscreen,
  onToggleIntensity,
  onSkip,
}: EventControlsProps) {
  const [visible, setVisible] = useState(true)
  const hideTimerRef = useRef<number | null>(null)

  useEffect(() => {
    const showControls = () => {
      setVisible(true)
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current)
      hideTimerRef.current = window.setTimeout(() => setVisible(false), 3800)
    }

    showControls()
    window.addEventListener("pointermove", showControls, { passive: true })
    window.addEventListener("keydown", showControls)

    return () => {
      window.removeEventListener("pointermove", showControls)
      window.removeEventListener("keydown", showControls)
      if (hideTimerRef.current !== null) window.clearTimeout(hideTimerRef.current)
    }
  }, [])

  return (
    <div
      className={`${styles.controls} ${visible ? styles.controlsVisible : ""}`}
      onPointerEnter={() => setVisible(true)}
      onFocusCapture={() => setVisible(true)}
      aria-label="Event controls"
    >
      {!soundEnabled ? (
        <button type="button" onClick={onEnableSound} aria-label="Enable sound">
          <Volume1 aria-hidden="true" />
          <span className={styles.controlLabel}>Sound</span>
        </button>
      ) : (
        <>
          <button
            type="button"
            onClick={onTogglePlayback}
            aria-label={playing ? "Pause music" : "Resume music"}
          >
            {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </button>
          <button
            type="button"
            onClick={onToggleMute}
            aria-label={muted ? "Unmute sound" : "Mute sound"}
          >
            {muted || volume === 0 ? (
              <VolumeX aria-hidden="true" />
            ) : (
              <Volume2 aria-hidden="true" />
            )}
          </button>
          <label className={styles.volumeControl}>
            <span className={styles.srOnly}>Volume</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={volume}
              onChange={(event) => onVolumeChange(Number(event.target.value))}
            />
          </label>
        </>
      )}

      <span className={styles.controlDivider} aria-hidden="true" />

      <button
        type="button"
        data-active={reducedIntensity}
        onClick={onToggleIntensity}
        aria-label={reducedIntensity ? "Restore visual intensity" : "Reduce visual intensity"}
        aria-pressed={reducedIntensity}
      >
        <Sparkles aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={onToggleFullscreen}
        aria-label={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
      >
        {fullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
      </button>
      {canSkip && (
        <button type="button" className={styles.skipButton} onClick={onSkip}>
          Skip pre-show
        </button>
      )}
    </div>
  )
}
