"use client"

import { Laptop, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

const options = [
  { value: "system", label: "System", icon: Laptop },
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
] as const

export function AppearanceSelector({
  className,
  compact = false,
  syncServer = true,
}: {
  className?: string
  compact?: boolean
  syncServer?: boolean
}) {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => setMounted(true), [])

  async function selectAppearance(value: (typeof options)[number]["value"]) {
    setTheme(value)
    if (!syncServer) return
    setSaving(true)
    try {
      const response = await fetch("/api/preferences/appearance", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ appearance: value }),
      })
      if (!response.ok) {
        const data = await response.json().catch(() => ({}))
        toast.info(data.error || "Appearance is saved on this device.")
      }
    } catch {
      toast.info("Appearance is saved on this device.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className={cn(
        "inline-grid grid-cols-3 rounded-lg border border-border bg-surface-muted p-1",
        compact ? "h-9" : "w-full sm:w-auto",
        className,
      )}
      role="radiogroup"
      aria-label="Appearance"
      aria-busy={saving}
    >
      {options.map((option) => {
        const selected = mounted ? theme === option.value : option.value === "system"
        const Icon = option.icon
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => selectAppearance(option.value)}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-md px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring",
              selected
                ? "bg-surface-elevated text-foreground shadow-sm"
                : "text-foreground-subtle hover:bg-hover hover:text-foreground",
              compact && "px-2",
            )}
            title={`${option.label} appearance`}
          >
            <Icon className="h-3.5 w-3.5" aria-hidden="true" />
            <span className={cn(compact && "hidden xl:inline")}>{option.label}</span>
          </button>
        )
      })}
    </div>
  )
}
