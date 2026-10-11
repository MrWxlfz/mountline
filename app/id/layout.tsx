import { ClerkBoundary } from "@/components/auth/clerk-boundary"

export default function MountlineIdLayout({ children }: { children: React.ReactNode }) {
  return <ClerkBoundary>{children}</ClerkBoundary>
}
