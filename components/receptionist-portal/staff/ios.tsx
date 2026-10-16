"use client"

import { ChevronRight } from "./icons"

/* iOS building blocks for the staff app preview: inset grouped lists, rows, switches, sheets, alerts. */

export function Group({ title, footer, children }: { title?: string; footer?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="ip-section">
      {title ? <h3 className="ip-section-h">{title}</h3> : null}
      <ul className="ip-group">{children}</ul>
      {footer ? <p className="ip-section-f">{footer}</p> : null}
    </section>
  )
}

export function Row({ label, value, href, tone }: { label: string; value: string | null; href?: string; tone?: string }) {
  return (
    <li className="ip-row">
      <span className="ip-row-label">{label}</span>
      {value && href ? (
        <a className="ip-row-value ip-link" href={href} target={href.startsWith("http") ? "_blank" : undefined} rel="noreferrer">{value}</a>
      ) : (
        <span className={`ip-row-value${tone ? ` tone-${tone}` : ""}`}>{value ?? "—"}</span>
      )}
    </li>
  )
}

/** A tappable row with an optional leading icon tile and a trailing value and chevron. */
export function NavRow({ icon, title, subtitle, value, selected, onClick }: { icon?: React.ReactNode; title: string; subtitle?: string; value?: React.ReactNode; selected?: boolean; onClick: () => void }) {
  return (
    <li>
      <button type="button" className={selected ? "ip-row ip-nav-row on" : "ip-row ip-nav-row"} onClick={onClick} aria-current={selected || undefined}>
        {icon ? <span className="ip-nav-icon">{icon}</span> : null}
        <span className="ip-row-main">
          <b>{title}</b>
          {subtitle ? <small>{subtitle}</small> : null}
        </span>
        {value ? <span className="ip-row-meta">{value}</span> : null}
        <span className="ip-chevron"><ChevronRight /></span>
      </button>
    </li>
  )
}

export function ToggleRow({ label, detail, on, onChange }: { label: string; detail?: string; on: boolean; onChange: (on: boolean) => void }) {
  return (
    <li className="ip-row ip-toggle-row">
      <span className="ip-row-main">
        <b>{label}</b>
        {detail ? <small>{detail}</small> : null}
      </span>
      <button type="button" role="switch" aria-checked={on} aria-label={label} className={on ? "ip-switch on" : "ip-switch"} onClick={() => onChange(!on)}>
        <i />
      </button>
    </li>
  )
}

/** An app tile: a colored rounded square with a glyph (no third-party logos). */
export function Tile({ background, glyph, size = 30 }: { background: string; glyph: string; size?: number }) {
  return (
    <span className="ip-tile" style={{ background, width: size, height: size, fontSize: Math.round(size * 0.42), borderRadius: Math.round(size * 0.23) }} aria-hidden="true">
      {glyph}
    </span>
  )
}

/** A modal sheet: centered form sheet on iPad, bottom sheet on iPhone (styled by the app's class). */
export function Sheet({ title, onClose, leading, children }: { title: string; onClose: () => void; leading?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="ip-sheet-wrap" onClick={onClose}>
      <div className="ip-sheet" role="dialog" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="ip-sheet-grabber" aria-hidden="true" />
        <div className="ip-sheet-h">
          <span className="ip-sheet-side">{leading}</span>
          <b>{title}</b>
          <span className="ip-sheet-side end"><button type="button" className="ip-link ip-plain" onClick={onClose}>Done</button></span>
        </div>
        {children}
      </div>
    </div>
  )
}

/** An iOS alert with one dismiss button. */
export function Alert({ title, message, onClose }: { title: string; message: string; onClose: () => void }) {
  return (
    <div className="ip-alert-wrap" role="alertdialog" aria-label={title}>
      <div className="ip-alert">
        <b>{title}</b>
        <p>{message}</p>
        <button type="button" onClick={onClose}>OK</button>
      </div>
    </div>
  )
}
