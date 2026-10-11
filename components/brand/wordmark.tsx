import { figtree } from "@/app/fonts/fonts"
import { cn } from "@/lib/utils"

/** The ridge mark: a five-point mountain line. Inherits color. */
export function MountlineMark({
  className,
  strokeWidth = 2,
  style,
}: {
  className?: string
  strokeWidth?: number
  style?: React.CSSProperties
}) {
  return (
    <svg viewBox="0 0 22 18" fill="none" aria-hidden="true" className={cn("shrink-0", className)} style={style}>
      <path
        d="M1.5 16 6.8 7.6 9.6 11.2 14 2.6 20.5 16"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The logo lockup: the mark plus live "mountline" text in Figtree 600. At the default 19px it's the
 * spec size (mark 22×18, gap 8px, −0.03em); other sizes scale the mark and gap with the text.
 */
export function Wordmark({
  className,
  size = 19,
  mark,
  gap,
}: {
  className?: string
  size?: number
  /** Exact mark size where a design calls for one (the /luke header uses 21×17 at 18px). */
  mark?: { width: number; height: number }
  gap?: number
}) {
  const scale = size / 19
  return (
    <span
      className={cn("inline-flex items-center leading-none", figtree.className, className)}
      style={{ fontSize: size, fontWeight: 600, gap: gap ?? 8 * scale, letterSpacing: "-0.03em" }}
    >
      <MountlineMark className="block" style={mark ?? { width: 22 * scale, height: 18 * scale }} />
      <span>mountline</span>
    </span>
  )
}
