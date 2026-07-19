"use client"

import { Activity, Gauge, Radio, X } from "lucide-react"
import type { AudioMetrics, VisualMode } from "./event-types"
import styles from "./event.module.css"

interface OperatorPanelProps {
  open: boolean
  pendingStart: boolean
  playing: boolean
  muted: boolean
  currentTime: number
  mode: VisualMode
  metrics: AudioMetrics
  intensity: number
  diagnostics: boolean
  onOpen: () => void
  onClose: () => void
  onBegin: () => void
  onReset: () => void
  onTogglePlayback: () => void
  onToggleMute: () => void
  onIntensityChange: (intensity: number) => void
  onFlash: () => void
  onToggleDiagnostics: () => void
}

function formatTime(time: number): string {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

export function OperatorPanel({
  open,
  pendingStart,
  playing,
  muted,
  currentTime,
  mode,
  metrics,
  intensity,
  diagnostics,
  onOpen,
  onClose,
  onBegin,
  onReset,
  onTogglePlayback,
  onToggleMute,
  onIntensityChange,
  onFlash,
  onToggleDiagnostics,
}: OperatorPanelProps) {
  if (!open) {
    return (
      <button type="button" className={styles.operatorTab} onClick={onOpen}>
        <Radio aria-hidden="true" /> Operator
      </button>
    )
  }

  return (
    <aside className={styles.operatorPanel} aria-label="Event operator controls">
      <header>
        <div>
          <span className={styles.operatorKicker}>Event control</span>
          <strong>Operator</strong>
        </div>
        <button type="button" onClick={onClose} aria-label="Close operator panel">
          <X aria-hidden="true" />
        </button>
      </header>

      <button
        type="button"
        className={styles.beginButton}
        data-pending={pendingStart}
        onClick={onBegin}
        disabled={pendingStart}
      >
        <Radio aria-hidden="true" />
        {pendingStart ? "Waiting for impact…" : "Begin event"}
      </button>

      <div className={styles.operatorGrid}>
        <button type="button" onClick={onTogglePlayback}>
          {playing ? "Pause music" : "Resume music"}
        </button>
        <button type="button" onClick={onToggleMute}>
          {muted ? "Unmute" : "Mute"}
        </button>
        <button type="button" onClick={onReset}>Reset pre-show</button>
        <button type="button" onClick={onFlash}>Test white flash</button>
      </div>

      <label className={styles.operatorSlider}>
        <span>Visual intensity</span>
        <output>{Math.round(intensity * 100)}%</output>
        <input
          type="range"
          min="0.35"
          max="1.25"
          step="0.01"
          value={intensity}
          onChange={(event) => onIntensityChange(Number(event.target.value))}
        />
      </label>

      <dl className={styles.diagnosticsList}>
        <div><dt>Audio time</dt><dd>{formatTime(currentTime)}</dd></div>
        <div><dt>Visual mode</dt><dd>{mode}</dd></div>
        <div><dt>Bass</dt><dd>{metrics.bass.toFixed(3)}</dd></div>
        <div><dt>Mids</dt><dd>{metrics.mids.toFixed(3)}</dd></div>
        <div><dt>Treble</dt><dd>{metrics.treble.toFixed(3)}</dd></div>
      </dl>

      <button
        type="button"
        className={styles.diagnosticsToggle}
        data-active={diagnostics}
        onClick={onToggleDiagnostics}
      >
        {diagnostics ? <Activity aria-hidden="true" /> : <Gauge aria-hidden="true" />}
        {diagnostics ? "Hide diagnostics" : "Show diagnostics"}
      </button>

      <p className={styles.shortcutLegend}>Space begin · M mute · F fullscreen · R reset</p>
    </aside>
  )
}
