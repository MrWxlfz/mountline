"use client"

import { useEffect } from "react"

interface OperatorShortcutOptions {
  enabled: boolean
  panelOpen: boolean
  onBegin: () => void
  onMute: () => void
  onFullscreen: () => void
  onReset: () => void
  onClosePanel: () => void
}

export function useOperatorShortcuts({
  enabled,
  panelOpen,
  onBegin,
  onMute,
  onFullscreen,
  onReset,
  onClosePanel,
}: OperatorShortcutOptions) {
  useEffect(() => {
    if (!enabled) return

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target
      if (
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target instanceof HTMLSelectElement
      ) {
        return
      }

      if (event.code === "Space") {
        event.preventDefault()
        onBegin()
      } else if (event.key.toLowerCase() === "m") {
        onMute()
      } else if (event.key.toLowerCase() === "f") {
        onFullscreen()
      } else if (event.key.toLowerCase() === "r") {
        onReset()
      } else if (event.key === "Escape" && panelOpen) {
        onClosePanel()
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [
    enabled,
    onBegin,
    onClosePanel,
    onFullscreen,
    onMute,
    onReset,
    panelOpen,
  ])
}
