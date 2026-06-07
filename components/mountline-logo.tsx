"use client"

interface MountlineLogoProps {
  size?: "sm" | "md" | "lg" | "xl"
  showWordmark?: boolean
  className?: string
  inverted?: boolean
}

export function MountlineLogo({
  size = "md",
  showWordmark = true,
  className = "",
  inverted = false,
}: MountlineLogoProps) {
  const sizes = {
    sm: { mark: 28, text: "text-base", gap: "gap-2" },
    md: { mark: 34, text: "text-lg", gap: "gap-2.5" },
    lg: { mark: 42, text: "text-xl", gap: "gap-3" },
    xl: { mark: 56, text: "text-2xl", gap: "gap-4" },
  }
  const s = sizes[size]
  const color = inverted ? "text-white" : "text-foreground"

  return (
    <div className={`flex items-center ${s.gap} ${color} ${className}`}>
      <svg
        viewBox="0 0 40 40"
        fill="none"
        className="shrink-0"
        style={{ width: s.mark, height: s.mark }}
        aria-hidden="true"
      >
        <path
          d="M20 8 L32 32 L8 32 Z"
          fill="currentColor"
          fillOpacity="0.1"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M20 34 L20 6"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M16 12 L20 6 L24 12"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {showWordmark && (
        <span className={`font-semibold lowercase tracking-tight ${s.text}`}>
          mountline
        </span>
      )}
    </div>
  )
}
