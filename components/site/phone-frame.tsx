import type { ReactNode } from "react"

/** A plain phone outline for the vignettes. Decorative: callers describe what's on it. */
export function PhoneFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`mk-phone ${className}`}>
      <div className="mk-phone__screen">
        <span className="mk-phone__island" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}
