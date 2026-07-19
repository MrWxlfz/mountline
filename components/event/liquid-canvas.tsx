"use client"

import { Component, useEffect, useRef, type MutableRefObject, type ReactNode } from "react"
import { Canvas, useThree } from "@react-three/fiber"
import type {
  AudioMetrics,
  EventExperienceState,
  VisualMode,
} from "./event-types"
import { LiquidScene } from "./liquid-scene"

interface LiquidCanvasProps {
  metricsRef: MutableRefObject<AudioMetrics>
  mode: VisualMode
  nextMode: VisualMode
  modeProgress: number
  experienceState: EventExperienceState
  experienceElapsed: number
  transitionElapsed: number
  intensity: number
  reducedMotion: boolean
  onUnavailable: () => void
}

interface CanvasErrorBoundaryProps {
  children: ReactNode
  onError: () => void
}

interface CanvasErrorBoundaryState {
  failed: boolean
}

class CanvasErrorBoundary extends Component<
  CanvasErrorBoundaryProps,
  CanvasErrorBoundaryState
> {
  state: CanvasErrorBoundaryState = { failed: false }

  static getDerivedStateFromError(): CanvasErrorBoundaryState {
    return { failed: true }
  }

  componentDidCatch() {
    this.props.onError()
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}

function VisibleFrameDriver() {
  const invalidate = useThree((state) => state.invalidate)
  const frameRef = useRef<number | null>(null)

  useEffect(() => {
    const renderFrame = () => {
      if (document.visibilityState === "visible") invalidate()
      frameRef.current = requestAnimationFrame(renderFrame)
    }

    frameRef.current = requestAnimationFrame(renderFrame)
    return () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    }
  }, [invalidate])

  return null
}

export function LiquidCanvas(props: LiquidCanvasProps) {
  const mobile = typeof window !== "undefined" && window.innerWidth < 768
  const dpr: [number, number] = mobile ? [1, 1.35] : [1, 1.75]

  return (
    <CanvasErrorBoundary onError={props.onUnavailable}>
      <Canvas
        dpr={dpr}
        frameloop="demand"
        gl={{
          alpha: false,
          antialias: false,
          powerPreference: "high-performance",
        }}
        onCreated={({ gl }) => {
          gl.setClearColor(0x000000, 1)
        }}
        fallback={null}
      >
        <VisibleFrameDriver />
        <LiquidScene {...props} mobile={mobile} />
      </Canvas>
    </CanvasErrorBoundary>
  )
}
