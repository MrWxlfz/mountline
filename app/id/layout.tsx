import { ClerkBoundary } from "@/components/auth/clerk-boundary"
import { figtree } from "@/app/fonts/fonts"
import "@/app/(marketing)/marketing.css"

/** Mountline ID shares the public site's tokens and type; light only. */
export default function MountlineIdLayout({ children }: { children: React.ReactNode }) {
  return (
    <ClerkBoundary>
      <div className={figtree.variable}>{children}</div>
    </ClerkBoundary>
  )
}
