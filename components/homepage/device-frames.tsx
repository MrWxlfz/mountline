import type { ReactNode } from "react"

/** A quiet browser window. The chrome stays dim so the design inside it does the talking. */
export function BrowserFrame({ className, label = "Example business · Design demonstration", children }: { className?: string; label?: string; children: ReactNode }) {
  return (
    <div className={className ? `hp-browser ${className}` : "hp-browser"}>
      <div className="hp-browser__bar">
        <span className="hp-browser__dots" aria-hidden="true"><i /><i /><i /></span>
        <span className="hp-browser__address">{label}</span>
      </div>
      <div className="hp-browser__screen">{children}</div>
    </div>
  )
}

export function PhoneFrame({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <div className={className ? `hp-phone ${className}` : "hp-phone"}>
      <div className="hp-phone__screen">
        <span className="hp-phone__island" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}
