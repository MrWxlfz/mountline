import { findPlaceholders, OPTIONAL_PLACEHOLDERS } from "@/lib/placeholders"

/**
 * Lists unfilled copy in local dev and Vercel previews. Production builds with placeholders fail
 * before they get here (scripts/check-placeholders.mjs), so this never renders for real visitors.
 */
export function PlaceholderWarning({ content }: { content: unknown }) {
  if (process.env.VERCEL_ENV === "production") return null
  const missing = findPlaceholders(content).filter((item) => !OPTIONAL_PLACEHOLDERS.includes(item))
  if (!process.env.NEXT_PUBLIC_BOOKING_URL) missing.push("NEXT_PUBLIC_BOOKING_URL (env)")
  if (!missing.length) return null
  return (
    <details className="mk-placeholders" role="note">
      <summary>{missing.length} placeholder{missing.length === 1 ? "" : "s"} to fill in</summary>
      <ul>
        {missing.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </details>
  )
}
