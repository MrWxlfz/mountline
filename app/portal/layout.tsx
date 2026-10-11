import { ClerkBoundary } from "@/components/auth/clerk-boundary"

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  return <ClerkBoundary>{children}</ClerkBoundary>
}
