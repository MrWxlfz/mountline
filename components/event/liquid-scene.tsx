"use client"

import { useEffect, useMemo, useRef } from "react"
import { useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"
import type { MutableRefObject } from "react"
import {
  VISUAL_MODE_INDEX,
  type AudioMetrics,
  type EventExperienceState,
  type VisualMode,
} from "./event-types"
import { liquidFragmentShader, liquidVertexShader } from "./liquid-material"

interface LiquidSceneProps {
  metricsRef: MutableRefObject<AudioMetrics>
  mode: VisualMode
  nextMode: VisualMode
  modeProgress: number
  experienceState: EventExperienceState
  experienceElapsed: number
  transitionElapsed: number
  intensity: number
  reducedMotion: boolean
  mobile: boolean
}

export function LiquidScene({
  metricsRef,
  mode,
  nextMode,
  modeProgress,
  experienceState,
  experienceElapsed,
  transitionElapsed,
  intensity,
  reducedMotion,
  mobile,
}: LiquidSceneProps) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { size } = useThree()
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBass: { value: 0 },
      uMids: { value: 0 },
      uTreble: { value: 0 },
      uEnergy: { value: 0 },
      uMode: { value: 0 },
      uNextMode: { value: 1 },
      uModeProgress: { value: 0 },
      uTransition: { value: 0 },
      uPointer: { value: new THREE.Vector2(0, 0) },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uIntensity: { value: 1 },
      uReducedMotion: { value: 0 },
      uOpening: { value: 0 },
      uParticleDensity: { value: 1 },
    }),
    [],
  )

  useEffect(() => {
    const material = materialRef.current
    return () => material?.dispose()
  }, [])

  useFrame(({ clock, pointer, gl }) => {
    const material = materialRef.current
    if (!material) return

    const metrics = metricsRef.current
    const pixelRatio = gl.getPixelRatio()
    material.uniforms.uTime.value = clock.elapsedTime
    material.uniforms.uBass.value = metrics.bass
    material.uniforms.uMids.value = metrics.mids
    material.uniforms.uTreble.value = metrics.treble
    material.uniforms.uEnergy.value = metrics.energy
    material.uniforms.uMode.value = VISUAL_MODE_INDEX[mode]
    material.uniforms.uNextMode.value = VISUAL_MODE_INDEX[nextMode]
    material.uniforms.uModeProgress.value = modeProgress
    material.uniforms.uTransition.value =
      experienceState === "transitioning"
        ? Math.min(1, transitionElapsed / 9.2)
        : experienceState === "live"
          ? 1
          : 0
    material.uniforms.uPointer.value.set(pointer.x, pointer.y)
    material.uniforms.uResolution.value.set(
      size.width * pixelRatio,
      size.height * pixelRatio,
    )
    material.uniforms.uIntensity.value = intensity
    material.uniforms.uReducedMotion.value = reducedMotion ? 1 : 0
    material.uniforms.uOpening.value =
      experienceState === "opening"
        ? Math.min(1, experienceElapsed / 21)
        : experienceState === "entry"
          ? 0.03
          : 1
    material.uniforms.uParticleDensity.value = mobile ? 0.48 : 1
  })

  return (
    <mesh frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={liquidVertexShader}
        fragmentShader={liquidFragmentShader}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  )
}
