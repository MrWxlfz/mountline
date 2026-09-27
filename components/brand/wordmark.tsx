import { cn } from "@/lib/utils"

export function MountlineMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 180" fill="none" aria-hidden="true" className={cn("shrink-0", className)}>
      <path d="M90 34 145 137H35L90 34Z" stroke="currentColor" strokeWidth="9" strokeLinejoin="round" />
      <path d="M90 146V29" stroke="currentColor" strokeWidth="12" strokeLinecap="round" />
      <path d="m70 57 20-28 20 28" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** The lowercase logo lockup. Inherits color, so it works on any surface. */
export function Wordmark({ className, size = 18 }: { className?: string; size?: number }) {
  return (
    <span
      className={cn("inline-flex items-center font-sans font-semibold leading-none", className)}
      style={{ fontSize: size, gap: size * 0.34, letterSpacing: "-0.045em" }}
    >
      <MountlineMark className="relative -top-[0.06em] size-[1.2em]" />
      <span>mountline</span>
    </span>
  )
}
