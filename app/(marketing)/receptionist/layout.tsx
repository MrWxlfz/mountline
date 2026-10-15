import { ClerkBoundary } from "@/components/auth/clerk-boundary"

/**
 * /receptionist is team-only, and its buttons are server actions. Clerk's browser script has to run
 * here to keep the short-lived session cookie fresh; without it, actions start failing as "signed out"
 * about a minute after the page loads, even though page loads still work.
 */
export default function ReceptionistLayout({ children }: { children: React.ReactNode }) {
  return <ClerkBoundary>{children}</ClerkBoundary>
}
