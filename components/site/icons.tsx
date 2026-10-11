/** The small stroke icons from the design reference, drawn on a 16px grid unless noted. */

type IconProps = { className?: string }

const svg = { fill: "none", "aria-hidden": true } as const

/* The four service dots. `full` is the detailed hero version; the plain one is used everywhere else. */

export function GlobeIcon({ full = false, width = 1.6 }: { full?: boolean; width?: number }) {
  return full ? (
    <svg viewBox="0 0 16 16" {...svg}>
      <circle cx="8" cy="8" r="5.6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M2.4 8h11.2M8 2.4c1.6 1.5 2.4 3.4 2.4 5.6S9.6 12.1 8 13.6C6.4 12.1 5.6 10.2 5.6 8S6.4 3.9 8 2.4Z"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" {...svg}>
      <circle cx="8" cy="8" r="5.6" stroke="currentColor" strokeWidth={width} />
      <path d="M2.4 8h11.2" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export function PinIcon({ full = false, width = 1.6 }: { full?: boolean; width?: number }) {
  return (
    <svg viewBox="0 0 16 16" {...svg}>
      <path d="M8 14s4.6-4.1 4.6-7.6A4.6 4.6 0 0 0 3.4 6.4C3.4 9.9 8 14 8 14Z" stroke="currentColor" strokeWidth={width} />
      {full ? <circle cx="8" cy="6.4" r="1.6" fill="currentColor" /> : null}
    </svg>
  )
}

export function MegaphoneIcon({ full = false, width = 1.5 }: { full?: boolean; width?: number }) {
  return (
    <svg viewBox="0 0 16 16" {...svg}>
      <path d="M2.5 6.5v3h2.2l5 3.2V3.3l-5 3.2H2.5Z" stroke="currentColor" strokeWidth={width} strokeLinejoin="round" />
      {full ? <path d="M12 6a2.6 2.6 0 0 1 0 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /> : null}
    </svg>
  )
}

export function PhoneCallIcon({ width = 1.5 }: { width?: number }) {
  return (
    <svg viewBox="0 0 16 16" {...svg}>
      <path
        d="M5.2 2.5 3.4 3a1.5 1.5 0 0 0-1 1.8c1.2 4.3 4.5 7.6 8.8 8.8a1.5 1.5 0 0 0 1.8-1l.5-1.8-2.8-1.6-1.4 1.2a8 8 0 0 1-3.7-3.7l1.2-1.4Z"
        stroke="currentColor"
        strokeWidth={width}
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** The four dots in a row: web, Google, ads, and an "L" for Luke. */
export function ServiceDots({ full = false, initial = "L" }: { full?: boolean; initial?: string }) {
  return (
    <>
      <span className="dt web"><GlobeIcon full={full} /></span>
      <span className="dt map"><PinIcon full={full} /></span>
      <span className="dt ads"><MegaphoneIcon full={full} /></span>
      <span className="dt me">{initial}</span>
    </>
  )
}

export function ServiceIcon({ k, width }: { k: "web" | "map" | "ads" | "call"; width?: number }) {
  if (k === "web") return <GlobeIcon width={width} />
  if (k === "map") return <PinIcon width={width} />
  if (k === "ads") return <MegaphoneIcon width={width} />
  return <PhoneCallIcon width={width} />
}

/* Small UI icons. */

export function CheckIcon({ className, width = 1.7 }: IconProps & { width?: number }) {
  return (
    <svg viewBox="0 0 16 16" className={className} {...svg}>
      <path d="M3.5 8.3 6.5 11l6-6.5" stroke="currentColor" strokeWidth={width} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** The tiny check used in the step list (10px grid). */
export function StepCheck() {
  return (
    <svg viewBox="0 0 10 10" {...svg}>
      <path d="M2 5.3 4.2 7.4 8 2.8" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function CloseIcon({ size = 12 }: { size?: 10 | 12 }) {
  return size === 12 ? (
    <svg viewBox="0 0 12 12" {...svg}>
      <path d="M3 3l6 6M9 3 3 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 10 10" {...svg}>
      <path d="M2 2l6 6M8 2 2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function ArrowRightIcon() {
  return (
    <svg viewBox="0 0 14 14" {...svg}>
      <path d="M3 7h8M7.5 3.5 11 7l-3.5 3.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** The small arrow inside the rebrand notice (10px grid). */
export function SmallArrowIcon() {
  return (
    <svg viewBox="0 0 10 10" {...svg}>
      <path d="M1.5 5h7M5.5 2 8.5 5l-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function ArrowUpRightIcon({ grid = 14 }: { grid?: 12 | 14 }) {
  return grid === 14 ? (
    <svg viewBox="0 0 14 14" {...svg}>
      <path d="M4.5 9.5l5-5M5.5 4.5h4v4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ) : (
    <svg viewBox="0 0 12 12" {...svg}>
      <path d="M3.5 8.5l5-5M4.5 3.5h4v4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 16 16" {...svg}>
      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function BagIcon() {
  return (
    <svg viewBox="0 0 16 16" {...svg}>
      <path d="M3 5.5h10l-.9 8H3.9Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M5.8 5.5V4.4a2.2 2.2 0 0 1 4.4 0v1.1" stroke="currentColor" strokeWidth="1.4" />
    </svg>
  )
}

export function ToastCheckIcon() {
  return (
    <svg viewBox="0 0 12 12" {...svg}>
      <path d="M2.5 6.2 5 8.5l4.5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* The feature list in "What I do" (stroke 1.3). */

export function FeatIcon({ name }: { name: "phone" | "chat" | "pin" | "ads" | "camera" | "call" }) {
  switch (name) {
    case "phone":
      return (
        <svg viewBox="0 0 16 16" {...svg}>
          <rect x="4.5" y="1.5" width="7" height="13" rx="1.6" stroke="currentColor" strokeWidth="1.3" />
          <path d="M7 12h2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      )
    case "chat":
      return (
        <svg viewBox="0 0 16 16" {...svg}>
          <path d="M3 3.5h10v7H6l-3 2.5v-9.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      )
    case "pin":
      return <PinIcon width={1.3} />
    case "ads":
      return (
        <svg viewBox="0 0 16 16" {...svg}>
          <path d="M2.5 6.5v3h2.2l5 3.2V3.3l-5 3.2H2.5Z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      )
    case "camera":
      return (
        <svg viewBox="0 0 16 16" {...svg}>
          <rect x="1.8" y="4" width="12.4" height="9" rx="2" stroke="currentColor" strokeWidth="1.3" />
          <circle cx="8" cy="8.5" r="2.3" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5.5 4 6.5 2.5h3L10.5 4" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      )
    case "call":
      return <PhoneCallIcon width={1.3} />
  }
}

/* /luke contact buttons and the "scanned my card" note (stroke 1.4 / 1.3). */

export function CardIcon({ name }: { name: "text" | "call" | "email" | "save" | "scan" }) {
  switch (name) {
    case "text":
      return (
        <svg viewBox="0 0 16 16" {...svg}>
          <path d="M3 3.5h10v7H6.5l-3.5 2.5v-9.5Z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      )
    case "call":
      return <PhoneCallIcon width={1.4} />
    case "email":
      return (
        <svg viewBox="0 0 16 16" {...svg}>
          <rect x="1.8" y="3.2" width="12.4" height="9.6" rx="2" stroke="currentColor" strokeWidth="1.4" />
          <path d="m2.5 4.5 5.5 4 5.5-4" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
        </svg>
      )
    case "save":
      return (
        <svg viewBox="0 0 16 16" {...svg}>
          <circle cx="8" cy="5.5" r="2.6" stroke="currentColor" strokeWidth="1.4" />
          <path d="M3 13.5c.7-2.4 2.7-3.8 5-3.8s4.3 1.4 5 3.8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      )
    case "scan":
      return (
        <svg viewBox="0 0 16 16" {...svg}>
          <rect x="2" y="2" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="9.5" y="2" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <rect x="2" y="9.5" width="4.5" height="4.5" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <path d="M9.5 9.5h1.5v1.5M14 9.5V11M9.5 14h1.5M12.5 12.5H14V14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      )
  }
}
