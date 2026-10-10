/**
 * The retired triangle logo. Used ONLY inside the rebrand notice ("We changed our branding from
 * [old] → [new]"). Don't use it anywhere else; the logo is the ridge mark in wordmark.tsx.
 */
export function OldMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 180 180" fill="none" aria-hidden="true" className={className}>
      <path d="M90 34 145 137H35L90 34Z" stroke="currentColor" strokeWidth="11" strokeLinejoin="round" />
      <path d="M90 146V29" stroke="currentColor" strokeWidth="14" strokeLinecap="round" />
      <path d="m70 57 20-28 20 28" stroke="currentColor" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}
